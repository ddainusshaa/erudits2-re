<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlayerAnswer;
use Illuminate\Http\Request;
use App\Http\Requests\PlayerAnswerRequest; 
use Illuminate\Support\Str;
use App\Models\Player;
use App\Models\Answer;
use App\Events\PlayerEvent;
use App\Models\Round;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Events\RefreshPlayersEvent;
use App\Events\TiebreakAnswerEvent;
use App\Models\Question;

class PlayerAnswerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(string $gameInstanceId)
    {
        return PlayerAnswer::where('instance_id', $gameInstanceId)->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PlayerAnswerRequest $request)
    {
        Log::info('Storing player answer for player ' . $request->player_id . ' and question ' . $request->question_id);
        try{
            $validated = $request->validated();

            $player = Player::find($validated['player_id']);

            $round = Round::find($request->round_id);

            $instanceId = $player->instance_id;

            $isAnswerCorrect = false;

            if (!Str::isUuid($request->answer)) {
                // Normalize the user input answer
                $normalizedAnswer = preg_replace('/[^\w\s]/', '', preg_replace('/\s+/', ' ', trim($request->answer)));
                
                // Fetch valid answers and normalize them
                $validAnswers = Answer::where('question_id', $validated['question_id'])->get()->pluck('text')->toArray();
                $normalizedValidAnswers = array_map(function ($answer) {
                    return preg_replace('/[^\w\s]/', '', preg_replace('/\s+/', ' ', trim($answer)));
                }, $validAnswers);
            
                // Check if the normalized user answer exists in the valid answers
                if (in_array($normalizedAnswer, $normalizedValidAnswers)) {
                    $isAnswerCorrect = true;
                } else {
                    $isAnswerCorrect = false;
                }
            }
            if(Str::isUuid($request->answer)) {
                $answer = Answer::find($request->answer);
                $isAnswerCorrect = $answer->is_correct;
            }

            if ($isAnswerCorrect && !$player->is_disqualified) {
                $pointsForCorrectAnswer = $round->points;
                $player->points += $pointsForCorrectAnswer;
                $player->save();
            }

            $existingPlayerAnswer = PlayerAnswer::where('player_id', $validated['player_id'])
                ->where('question_id', $validated['question_id'])
                ->where('instance_id', $instanceId)
                ->first();

            if ($existingPlayerAnswer) {
                $existingPlayerAnswer->delete();
            }

            $playerAnswer = [
                'id' => Str::uuid()->toString(),
                'player_id' => $validated['player_id'],
                'question_id' => $validated['question_id'],
                'instance_id' => $instanceId,
                'answer_id' => Str::isUuid($request->answer) ? $request->answer : null,
                'answer_text' => Str::isUuid($request->answer) ? null : $request->answer,
                'is_answer_correct' => $isAnswerCorrect,
            ];
            PlayerAnswer::create($playerAnswer);

            if($request->is_tiebreak_answer) {
                broadcast(new TiebreakAnswerEvent(
                    $instanceId,
                    $player->id,
                    $player->player_name,
                    Question::find($playerAnswer['question_id'])->title,
                    $playerAnswer['answer_id'] ? Answer::find($playerAnswer['answer_id'])->text : $playerAnswer['answer_text'],
                    Answer::where('question_id', $playerAnswer['question_id'])->where('is_correct', 1)->first()->text,
                    $isAnswerCorrect,
                    now()->timestamp
                ));
            }

            if(!$round->is_test) {
                $player->round_finished = true;
                $player->save();
            }

            return response()->json(200);
        }
        catch(\Exception $e) {
            Log::error('Error storing player answer: ' . $e->getMessage());
            return response()->json(['message' => 'Error storing player answer.'], 500);
        }
    }

    public function getInstanceAnswers(string $gameInstanceId)
    {   
        Log::info('Getting answers for game instance ' . $gameInstanceId);
        try{
            $instancePlayers = Player::where('instance_id', $gameInstanceId)->get();
            $answers = PlayerAnswer::with(['player', 'question'])
                ->where('instance_id', $gameInstanceId)
                ->get()
                ->groupBy('player_id');

            $results = [];

            foreach ($instancePlayers as $player) {
                $playerId = $player->id;
                $playerAnswers = $answers[$playerId] ?? [];
                $questions = [];

                foreach ($playerAnswers as $answer) {
                    $answerModel = Answer::find($answer->answer_id);

                    $questions[] = [
                        'id' => $answer->question->id,
                        'title' => $answer->question->title,
                        'answer' => $answerModel?->text ?? $answer->answer_text,
                        'is_correct' => $answerModel?->is_correct ?? $answer->is_answer_correct,
                    ];
                }


                $results[] = [
                    'player_name' => $player->player_name ?? 'Unknown Player',
                    'questions' => $questions,
                    'round_finished' => $player->round_finished,
                ];
            }

            return response()->json($results);
        }
        catch(\Exception $e) {
            Log::error('Error getting answers for game instance ' . $gameInstanceId . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error getting answers for game instance.'], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(PlayerAnswer $playerAnswer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PlayerAnswer $playerAnswer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PlayerAnswerRequest $request)
    {
        $playerAnswer = PlayerAnswer::where('question_id', $request->question_id)->where('player_id', $request->player_id);

        if($playerAnswer->exists()) {
            $playerAnswer->update($request->all());
            return response()->json(['message' => 'Player answer successfully updated.'], 200);
        } else {
            return response()->json(['message' => 'Player answer not found.'], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PlayerAnswer $playerAnswer)
    {
        //
    }
}
