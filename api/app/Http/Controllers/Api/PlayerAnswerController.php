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
use Illuminate\Support\Facades\Schema;
use App\Models\GameInstance;

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
            $isTiebreakAnswer = $request->boolean('is_tiebreak_answer');

            if (!$player || !$round) {
                return response()->json(['message' => 'Player or round not found.'], 404);
            }

            $instanceId = $player->instance_id;
            $instance = GameInstance::find($instanceId);

            if (!$instance) {
                return response()->json(['message' => 'Game instance not found.'], 404);
            }

            if (!$isTiebreakAnswer && (string) $instance->current_round !== (string) $round->id) {
                Log::info('Ignoring stale player answer for player ' . $validated['player_id'] . ' in instance ' . $instanceId);
                return response()->json(['message' => 'Stale answer ignored.'], 200);
            }

            if (!$isTiebreakAnswer && !$round->is_test && $instance->current_question) {
                if ((string) $instance->current_question !== (string) $validated['question_id']) {
                    Log::info('Ignoring stale player answer question for player ' . $validated['player_id'] . ' in instance ' . $instanceId);
                    return response()->json(['message' => 'Stale answer ignored.'], 200);
                }
            }

            $rawAnswer = $request->input('answer');
            $answerValue = is_string($rawAnswer) ? trim($rawAnswer) : '';
            $hasAnswer = $answerValue !== '';

            if (!$hasAnswer) {
                $player->round_finished = true;
                $player->save();
                broadcast(new RefreshPlayersEvent($instanceId, $player));
                return response()->json(['message' => 'No answer submitted.'], 200);
            }

            $existingPlayerAnswer = PlayerAnswer::where('player_id', $validated['player_id'])
                ->where('question_id', $validated['question_id'])
                ->where('instance_id', $instanceId)
                ->first();

            $isAnswerCorrect = false;

            if (!Str::isUuid($answerValue)) {
                // Normalize the user input answer
                $normalizedAnswer = preg_replace('/[^\w\s]/', '', preg_replace('/\s+/', ' ', $answerValue));
                
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
            if(Str::isUuid($answerValue)) {
                $answer = Answer::find($answerValue);
                $isAnswerCorrect = (bool) ($answer?->is_correct);
            }

            if (!$player->is_disqualified) {
                $pointsForCorrectAnswer = $round->points;
                $previouslyCorrect = $existingPlayerAnswer?->is_answer_correct ? 1 : 0;
                $currentlyCorrect = $isAnswerCorrect ? 1 : 0;
                $delta = ($currentlyCorrect - $previouslyCorrect) * $pointsForCorrectAnswer;

                if ($delta !== 0) {
                    $player->points += $delta;
                    $player->save();
                }
            }

            if ($existingPlayerAnswer) {
                $existingPlayerAnswer->delete();
            }

            $answerText = Str::isUuid($answerValue) ? null : $answerValue;
            $answerTextLong = $answerText;
            $answerTextShort = $answerText ? Str::limit($answerText, 48, '') : null;
            $hasLongAnswerColumn = Schema::hasColumn('player_answers', 'answer_text_long');

            $playerAnswer = [
                'id' => Str::uuid()->toString(),
                'player_id' => $validated['player_id'],
                'question_id' => $validated['question_id'],
                'instance_id' => $instanceId,
                'answer_id' => Str::isUuid($answerValue) ? $answerValue : null,
                'answer_text' => $answerTextShort,
                'is_answer_correct' => $isAnswerCorrect,
            ];

            if ($hasLongAnswerColumn) {
                $playerAnswer['answer_text_long'] = $answerTextLong;
            }

            PlayerAnswer::create($playerAnswer);

            if($isTiebreakAnswer) {
                $answerTextForEvent = $playerAnswer['answer_id']
                    ? (Answer::find($playerAnswer['answer_id'])?->text ?? '')
                    : ($playerAnswer['answer_text_long'] ?? $playerAnswer['answer_text']);
                broadcast(new TiebreakAnswerEvent(
                    $instanceId,
                    $player->id,
                    $player->player_name,
                    Question::find($playerAnswer['question_id'])->title,
                    $answerTextForEvent,
                    Answer::where('question_id', $playerAnswer['question_id'])->where('is_correct', 1)->first()->text,
                    $isAnswerCorrect,
                    now()->timestamp
                ));
            }

            if(!$round->is_test) {
                $player->round_finished = true;
                $player->save();
            }

            broadcast(new RefreshPlayersEvent($instanceId, $player));

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
                    $answerText = $answer->answer_text_long ?? $answer->answer_text;

                    $questions[] = [
                        'id' => $answer->question->id,
                        'title' => $answer->question->title,
                        'answer' => $answerModel?->text ?? $answerText,
                        'is_correct' => $answerModel?->is_correct ?? $answer->is_answer_correct,
                    ];
                }


                $results[] = [
                    'player_id' => $player->id,
                    'player_name' => $player->player_name ?? 'Unknown Player',
                    'points' => $player->points,
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
