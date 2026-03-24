<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameInstance;
use App\Models\Game;
use App\Models\Round;
use App\Models\Question;
use App\Models\PlayerAnswer;
use App\Models\Player;
use App\Models\Answer;
use App\Http\Controllers\Api\GameController;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Requests\GameInstanceRequest;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\GameInstanceResource;
use App\Events\GameControlEvent;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\UsedAdditionalQuestions;
use App\Events\TiebreakEvent;

class GameInstanceController extends PlayerAnswerController
{
    /**
     * Display a listing of the resource.
     */
    public function indexGameInstances()
    {
        Log::info("Indexing game instances");
        try{
            $gameInstances = GameInstance::where('end_date', '>', now())
                ->where('private', false)
                ->get();
        
            $gameInstanceResource = $gameInstances->map(function ($gameInstance) {
                $game = Game::find($gameInstance->game_id);
                return new GameInstanceResource((object) [
                    'code' => $gameInstance->code,
                    'title' => $game->title,
                    'description' => $game->description,
                ]);
            });
        
            return response()->json(['game_instances' => $gameInstanceResource], 200);
        }
        catch(Exception $e){
            Log::error("Error in indexing game instances: ".$e->getMessage());
            return response()->json(['error' => 'Error in indexing game instances'], 500);
        }
    }
    
    


    public function indexWithPlayerInfo(Request $request) {
        Log::info("Indexing game instances with player info");
        try{
            $instanceId = $request->instance_id;
            $playerId = $request->player_id;

            if(!$instanceId || !$playerId) {
                return $this->indexGameInstances();
            }

            $player = Player::where('id', $playerId)->first();

            if (!$player || $player->is_disqualified) {
                return $this->indexGameInstances();
            }
            
            $startedGame = GameInstance::where('id', $instanceId)
                ->where('end_date', '>', now())
                ->where('private', false)
                ->first();

            return response()->json(['game_instances' => $this->indexGameInstances()->getData()->game_instances, 'started_game_code' => $startedGame?->code], 200);
        }
        catch (Exception $e) {
            Log::error("Error in indexing game instances with player info: ".$e->getMessage());
            return response()->json(['error' => 'Error in indexing game instances with player info'], 500);
        }
    }


    public function activate(GameInstanceRequest $request)
    {
        Log::info("Activating game instance with game id".$request->game_id);
        try{
            $validated = $request->validated();

            if (
                GameInstance::where('game_id', $validated['game_id'])->where(function ($query) {
                    $query->whereNull('end_date')
                        ->orWhere('end_date', '>', now());
                })->exists()
            ) {
                return response()->json(['message' => 'Game instance already active.'], 400);
            }

            if (GameInstance::where('code', '=', $validated['code'])->where('end_date', '>', now())->exists()) {
                return response()->json(['message' => 'Code already in use.'], 400);
            }

            $game = Game::find($validated['game_id']);
            $game->last_activation = now();
            $game->save();

            $gameInstance = [
                'id' => Str::uuid()->toString(),
                'game_id' => $validated['game_id'],
                'code' => $validated['code'],
                'private' => $validated['private'],
                'end_date' => $validated['end_date'],
            ];
            GameInstance::create($gameInstance);

            return response()->json(['message' => 'Game instance successfully created.', 'id' => $gameInstance['id']], 201);
        }
        catch(Exception $e){
            Log::error("Error in activating game instance: ".$e->getMessage());
            return response()->json(['error' => 'Error in activating game instance'], 500);
        }
    }

    public function status(string $gameId)
    {
        $gameInstance = GameInstance::where('gameId', $gameId)->first();
        if ($gameInstance) {
            return response()->json(['status' => $gameInstance->is_active], 200);
        } else {
            return response()->json(['message' => 'Game instance not found.'], 404);
        }
    }

    public function join(Request $request)
    {
        Log::info("Joining game instance with code ".$request->code);
        try{
            $validator = Validator::make($request->all(), [
                'code' => 'required|min:3',
                'player_id' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => 'Invalid code.'], 400);
            }

            $gameInstance = GameInstance::where('code', $request->code)
                ->where(function ($query) {
                    $query->whereNull('end_date')
                        ->orWhere('end_date', '>', now());
                })->first();
            if ($gameInstance && $gameInstance->game_started != false) { // if game already started
                $player = Player::find($request->player_id);
                if (!$player) { // and player not found
                    return response()->json(['error' => 'Game already started'], 400);
                }
                if ($player->disqualified) { // if found but disqualified
                    return response()->json(['error' => 'Player disqualified'], 400);
                }
            }
            if ($gameInstance) {
                $game = Game::where('id', $gameInstance->game_id)->first();
                return response()->json(['message' => 'Game instance found.', 'id' => $gameInstance['id'], 'end_date' => $gameInstance['end_date'], 'title' => $game['title']], 200);
            } else {
                return response()->json(['error' => 'Game instance not found.'], 404);
            }
        }
        catch(Exception $e){
            Log::error("Error in joining game instance: ".$e->getMessage());
            return response()->json(['error' => 'Error in joining game instance'], 500);
        }
    }

    public function questionInfo(string $instanceId)
    {
        Log::info("Getting question info for instance".$instanceId);
        try{
            $gameInstance = GameInstance::findOrFail($instanceId);
        
            $round = Round::find($gameInstance->current_round);
            $question = optional(Question::find($gameInstance->current_question))->title; 
        
            $playersCount = Player::where('instance_id', $instanceId)->count();
        
            if ($round) {
                $answeredPlayers = $round->is_test 
                    ? Player::where('instance_id', $instanceId)->where('round_finished', 1)->count()
                    : PlayerAnswer::where('instance_id', $instanceId)
                        ->where('question_id', $gameInstance->current_question)
                        ->count();
        
                $roundQuestions = Question::where('round_id', $round->id)->get()->sortBy('order')->values();
            } else {
                $answeredPlayers = 0;
                $roundQuestions = [];
            }
        
            $playerAnswers = $this->getInstanceAnswers($instanceId)->getData();
        
            return response()->json([
                'instance_info' => [
                    'players' => $playersCount,
                    'current_round' => optional($round)->title,
                    'answered_players' => $answeredPlayers,
                    'answer_time' => optional($round)->answer_time,
                    'current_question' => optional($round)->is_test ? 'TESTS' : $question,
                    'started_at' => $gameInstance->started_at,
                    'game_started' => $gameInstance->game_started,
                    'round_questions' => $roundQuestions,
                    'disqualify_amount' => optional($round)->disqualify_amount,
                    'is_test' => optional($round)->is_test,
                ],
                'player_answers' => $playerAnswers,
            ], 200);
        }
        catch(Exception $e){
            Log::error("Error in getting question info: ".$e->getMessage());
            return response()->json(['error' => 'Error in getting question info'], 500);
        }
    }
    
    public function instanceGame(Request $request, string $id)
    {
        $gameInstance = GameInstance::findOrFail($id);
        $game = Game::where('id', $gameInstance->game_id)->first();
        $gameController = new GameController();
        $fullIndex = $gameController->fullIndex($request, $game->id);
        return response()->json(['game' => $fullIndex->original, 'instance' => $gameInstance], 200);
    }

    public function roundQuestions(string $instanceId)
    {
        $gameInstance = GameInstance::findOrFail($instanceId);
        $round = Round::findOrFail($gameInstance->current_round);
        $questions = Question::where('round_id', $round->id)
            ->get(['id', 'title', 'is_text_answer', 'guidelines', 'image_url', 'order'])->sortBy('order')->values();
            
        return response()->json([
            'questions' => $questions,
        ], 200);
    }

    public function roundInfo(string $instanceId){
        $gameInstance = GameInstance::findOrFail($instanceId);
        $round = Round::findOrFail($gameInstance->current_round, [
            'id', 'title', 'answer_time', 'disqualify_amount', 'is_additional', 'is_test', 'order'
        ]);
        $round['started_at'] = $gameInstance->started_at;
        $round['game_started'] = $gameInstance->game_started;
        $round['current_question'] = $gameInstance->current_question;
        $round['total_questions'] = Question::where('round_id', $round->id)->count();

        $questions = Question::where('round_id', $round->id)
        ->get(['id', 'title', 'is_text_answer', 'guidelines', 'image_url', 'order'])->sortBy('order')->values();

        $questionsWithTextAnswers = $questions->where('is_text_answer', true)->pluck('id')->toArray();

        $answers = Answer::whereIn('question_id', $questions->pluck('id'))
            ->get(['id', 'text', 'question_id'])
            ->map(function ($answer) use ($questionsWithTextAnswers) {
                if (in_array($answer->question_id, $questionsWithTextAnswers)) {
                    $answer->text = null;
                }
                return $answer;
            });
            
        return response()->json([
            'round' => $round,
            'answers' => $answers
        ], 200);
    }

    public function currentQuestion(string $instanceId)
    {
        $gameInstance = GameInstance::findOrFail($instanceId);
        $question = Question::find($gameInstance->current_question);
        return response()->json(['question' => $question, 'started_at' => $gameInstance->started_at], 200);
    }

    private function clearFinishedPlayers(string $instanceId) {
        Player::where('instance_id', $instanceId)
            ->where('round_finished', 1)
            ->update(['round_finished' => 0]);
    }

    public function nextRound(Request $request) {
        Log::info("Starting next round in instance ".$request->instance_id);
        try{
            $gameInstance = GameInstance::findOrFail($request->instance_id);
            $game = Game::findOrFail($gameInstance->game_id);
            $currentRound = Round::find($gameInstance->current_round);
        
            $nextRound = $game->rounds()->where('order', '>', $currentRound?->order ?? 0)
                ->where('is_additional', false)
                ->orderBy('order')
                ->first();
                
            if ($nextRound) {
                $gameInstance->current_round = $nextRound->id;
                $gameInstance->current_question = null;
                $gameInstance->started_at = null;
                if($nextRound->is_test) {
                    $gameInstance->started_at = now();
                }
                $gameInstance->save();
        
                $this->clearFinishedPlayers($gameInstance->id);

                if($nextRound->is_test){
                    broadcast(new GameControlEvent($gameInstance->id, 'next-round', $nextRound));
                }
        
                return response()->json(['message' => 'Next round started.'], 200);
            }
        
            return response()->json(['message' => 'No more rounds.'], 400);
        }
        catch(Exception $e){
            Log::error("Error in starting next round: ".$e->getMessage());
            return response()->json(['error' => 'Error in starting next round'], 500);
        }
    }
    

    public function previousRound(Request $request) {
        Log::info("Starting previous round in instance ".$request->instance_id);
        try{
            $gameInstance = GameInstance::findOrFail($request->instance_id);
            $game = Game::findOrFail($gameInstance->game_id);
            $rounds = $game->rounds()->get();
            $currentRound = Round::find($gameInstance->current_round);
            $previousRound = $rounds->where('order', '<', $currentRound?->order)
                ->sortByDesc('order')
                ->where('is_additional', false)
                ->first();
            if ($previousRound) {
                $gameInstance->current_round = $previousRound->id;
                $gameInstance->current_question = null;
                if($previousRound->is_test) {
                    $gameInstance->started_at = now();
                }
                $gameInstance->save();
                
                if($previousRound->is_test){
                    broadcast(new GameControlEvent($gameInstance->id, 'previous-round',  $previousRound));
                }
                $this->clearFinishedPlayers($gameInstance->id);

                return response()->json(['message' => 'Previous round started.'], 200);
            }
            return response()->json(['message' => 'No more rounds.'], 400);
        }
        catch(Exception $e){
            Log::error("Error in starting previous round: ".$e->getMessage());
            return response()->json(['error' => 'Error in starting previous round'], 500);
        }
    }

    public function nextQuestion(Request $request) {
        Log::info("Starting next question in instance ".$request->instance_id);
        try{
            $gameInstance = GameInstance::findOrFail($request->instance_id);
            $round = Round::findOrFail($gameInstance->current_round);
            $questions = Question::where('round_id', $round->id)->get();
            $currentQuestion = Question::find($gameInstance->current_question);

            if(!$currentQuestion || !$round->is_test) {
                $gameInstance->started_at = now();
                $gameInstance->save();
            }

            $nextQuestion = $questions->where('order', '>', $currentQuestion?->order)->sortBy('order')->first();
            if ($nextQuestion) {
                $nextQuestionAnswers = Answer::where('question_id', $nextQuestion->id)->get();

                $gameInstance->current_question = $nextQuestion->id;
                $gameInstance->save();

                $roundDto = [
                    'id' => $round->id,
                    'title' => $round->title,
                    'answer_time' => $round->answer_time,
                    'is_test' => $round->is_test,
                    'total_questions' => $questions->count(),
                ];

                $answerDto = [];

                if(!$nextQuestion->is_text_answer) {
                    foreach($nextQuestionAnswers as $answer) {
                            $answerDto[] = [
                                'id' => $answer->id,
                                'text' => $answer->text,
                                'question_id' => $answer->question_id,
                            ];
                        
                    }; 
                }               

                $questionDto = [
                    'id' => $nextQuestion->id,
                    'title' => $nextQuestion->title,
                    'is_text_answer' => $nextQuestion->is_text_answer,
                    'guidelines' => $nextQuestion->guidelines,
                    'image_url' => $nextQuestion->image_url,
                    'order' => $nextQuestion->order,
                    'started_at' => $gameInstance->started_at,
                    'answers' => $answerDto,
                ];

                broadcast(new GameControlEvent($gameInstance->id, 'next-question', $roundDto, $questionDto));

                $this->clearFinishedPlayers($gameInstance->id);

                return response()->json(['message' => 'Next question started.'], 200);
            }
            return response()->json(['message' => 'No more questions.'], 400);
        }
        catch(Exception $e){
            Log::error("Error in starting next question: ".$e->getMessage());
            return response()->json(['error' => 'Error in starting next question'], 500);
        }
    }

    public function previousQuestion (Request $request) {
        Log::info("Starting previous question in instance ".$request->instance_id);
        try{
            $gameInstance = GameInstance::findOrFail($request->instance_id);
            $round = Round::findOrFail($gameInstance->current_round);
            $questions = Question::where('round_id', $round->id)->get();
            $currentQuestion = Question::find($gameInstance->current_question);
            $previousQuestion = $questions->where('order', '<', $currentQuestion?->order)->sortByDesc('order')->first();

            if(!$round->is_test) {
                $gameInstance->started_at = now();
                $gameInstance->save();
            }

            if ($previousQuestion) {
                $previousQuestionAnswers = Answer::where('question_id', $previousQuestion->id)->get();
                $gameInstance->current_question = $previousQuestion->id;
                $gameInstance->save();

                $roundDto = [
                    'id' => $round->id,
                    'title' => $round->title,
                    'answer_time' => $round->answer_time,
                    'is_test' => $round->is_test,
                    'total_questions' => $questions->count(),
                ];

                $answerDto = [];

                if(!$previousQuestion->is_text_answer) {
                    foreach($previousQuestionAnswers as $answer) {
                            $answerDto[] = [
                                'id' => $answer->id,
                                'text' => $answer->text,
                                'question_id' => $answer->question_id,
                            ];
                        
                    }; 
                }      
                
                $questionDto = [
                    'id' => $previousQuestion->id,
                    'title' => $previousQuestion->title,
                    'is_text_answer' => $previousQuestion->is_text_answer,
                    'guidelines' => $previousQuestion->guidelines,
                    'image_url' => $previousQuestion->image_url,
                    'order' => $previousQuestion->order,
                    'started_at' => $gameInstance->started_at,
                    'answers' => $answerDto,
                ];

                broadcast(new GameControlEvent($gameInstance->id, 'previous-question', $roundDto, $questionDto));

                $this->clearFinishedPlayers($gameInstance->id);

                return response()->json(['message' => 'Previous question started.'], 200);
            }
            return response()->json(['message' => 'No more questions.'], 400);
        }
        catch(Exception $e){
            Log::error("Error in starting previous question: ".$e->getMessage());
            return response()->json(['error' => 'Error in starting previous question'], 500);
        }
    }
    
    public function gameControl(Request $request) {
        Log::info("Executing game control command ".$request->command." for instance ".$request->instance_id);
        try{
            $command = $request->input('command');
            $instanceId = $request->input('instance_id'); 
            if($command == 'start') {
                if(Player::where('instance_id', $instanceId)->count() < 2) {
                    return response()->json(['error' => 'Not enough players to start game'], 400);
                }
                $gameId = GameInstance::where('id', $instanceId)->value('game_id');
                $roundId = Round::where('game_id', $gameId)->where('order', 1)->value('id');

                GameInstance::where('id', $instanceId)->update(['game_started' => true]);
            } else {
                GameInstance::where('id', $instanceId)->update(['end_date' => now(), 'started_at' => null, 'game_started' => false]);
            } 

            broadcast(new GameControlEvent($instanceId, $command));

            return response()->json(['status' => 'Command broadcasted']);
        }
        catch(Exception $e){
            Log::error("Error in executing game control command: ".$e->getMessage());
            return response()->json(['error' => 'Error in executing game control command'], 500);
        }
    }

    public function tiebreak(Request $request) {
        Log::info("Starting tiebreak in instance ".$request->instance_id);
        try{
            $tiedPlayers = Player::whereIn('id', $request->player_ids)->get();
            $gameInstance = GameInstance::findOrFail($request->instance_id);
            $game = Game::findOrFail($gameInstance->game_id);
            $rounds = $game->rounds()->get();
            $tiebreakRound = $rounds->where('is_additional', true)->first();
            if ($tiebreakRound) {
                $unusedQuestions = Question::where('round_id', $tiebreakRound->id)
                    ->whereNotIn('id', UsedAdditionalQuestions::where('game_instance_id', $gameInstance->id)->pluck('question_id'))
                    ->get();
                if ($unusedQuestions->count() > 0) {
                    $question = $unusedQuestions->random();
                    $answers = [];
                    if(!$question->is_text_answer) {
                        $answers = Answer::where('question_id', $question->id)->get();
                    }
                    UsedAdditionalQuestions::create(['id' => Str::uuid()->toString(), 'game_instance_id' => $gameInstance->id, 'question_id' => $question->id]);
                    foreach($tiedPlayers as $player) {
                        broadcast(new TiebreakEvent('tiebreak', $player->id, $tiebreakRound, $question, $answers));
                    }
                    return response()->json(['message' => 'Tiebreak started.'], 200);
                }
            }
            return response()->json(['message' => 'No tiebreak round.'], 400);
        }
        catch(Exception $e){
            Log::error("Error in starting tiebreak: ".$e->getMessage());
            return response()->json(['error' => 'Error in starting tiebreak'], 500);
        }
    }
    
}
