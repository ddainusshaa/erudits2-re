<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Game;
use App\Models\GameInstance;
use App\Models\Answer;
use App\Models\User;
use App\Models\Round;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Http\Requests\GameRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Exception;

class GameController extends Controller
{
    /**
     * Display a listing of the user's games.
     */
    public function index(Request $request)
    {
        Log::info('Indexing games for user ' . $request->user()->id);
        try{
        $games = Game::where('user_id', $request->user()->id)->get();
            foreach ($games as $game) {
                $rounds = $game->rounds()->get();
                $rounds = collect($rounds)->sortBy('order');
                $game['roundCount'] = $rounds->count();
                $game['questions'] = collect();
                foreach ($rounds as $round) {
                    $game['questions'] = $game['questions']->merge($round->questions()->get());
                }
                $game['questions'] = $game['questions']->sortBy('order')->values();
                $activeGameInstance = GameInstance::where('game_id', $game->id)
                    ->where(function ($query) {
                        $query->whereNull('end_date')
                            ->orWhere('end_date', '>', now());
                    })->first();
                $game['activeGameInstance'] = $activeGameInstance ? $activeGameInstance->id : null;
                $game['questionCount'] = $game['questions']->count();
            }

            return response()->json(['games' => $games], 200);
        }
        catch (Exception $e) {
            Log::error('Error while indexing games for user ' . $request->user()->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error while indexing games.'], 500);
        }
    }

    public function fullIndex(Request $request, string $id) {
        $game = Game::where('id', $id)->where('user_id', $request->user()->id)->first();

        if($game) {
            $rounds = $game->rounds()->get()->sortBy('order')->values();
            $questions = collect();

            foreach ($rounds as $round) {
            $questions = $questions->merge($round->questions()->get());
            }

            $questions = $questions->sortBy('order')->values();

            foreach ($questions as $question) {
            $question['answers'] = Answer::where('question_id', $question->id)->get();
            }
            return response()->json(['game' => $game, 'rounds' => $rounds, 'questions' => $questions], 200);
        
        } else {
            return response()->json(['message' => 'Game not found.'], 404);
        }

    }

    public function sidebar(string $id) {
        $game = Game::findOrFail($id);
        $rounds = $game->rounds()->get();
        $questions = collect();

        foreach ($rounds as $round) {
            $questions = $questions->merge($round->questions()->get());
        }
        return response()->json(['game' => $game, 'rounds' => $rounds, 'questions' => $questions], 200);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $gamesCount = $user->games()->count();

        $game = [
            'id' => Str::uuid()->toString(), 
            'title' => 'Erudīcijas spēle nr. ' . ($gamesCount+1), 
            'description' => 'Spēles apraksts', 
            'user_id' => $user->id,
            'last_activation' => null,
        ];
        
        return response()->json(['message' => 'Game is ready for creation.', 'game' => $game], 200);    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(GameRequest $request)
    {
        $existingGame = Game::find($request->id);
        if($existingGame) {
            $validated = $request->validated();        
            $existingGame->update($validated);
            return response()->json(['message' => 'Game successfully saved.'], 200);
        }

        $game = Game::create($request->validated());

        return response()->json(['message' => 'Game successfully created.', 'game' => $game], 201);    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $game = Game::findOrFail($id);
        return response()->json(['game' => $game], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(GameRequest $request, string $id)
    {
        $this->authorize('manage', Game::findOrFail($id));

        $game = Game::findOrFail($id);
        $game->update($request->validated());
        
        return response()->json(['message' => 'Game successfully updated.', 'game' => $game], 200);    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $this->authorize('manage', Game::findOrFail($id));

        $game = Game::findOrFail($id);
        $game->delete();

        return response()->json(['message' => 'Game successfully deleted.', 204]);
    }

    public function duplicate(string $game_id) {
        try {
            $originalGame = Game::findOrFail($game_id);

            $newGame = $originalGame->replicate();
            $newGame->id = Str::uuid()->toString();
            $newGame->title = $originalGame->title . ' (kopija)';
            $newGame->save();

            $originalRounds = $originalGame->rounds()->get();
            foreach ($originalRounds as $originalRound) {
                $newRound = $originalRound->replicate();
                $newRound->id = Str::uuid()->toString();
                $newRound->game_id = $newGame->id;
                $newRound->save();

                $originalQuestions = $originalRound->questions()->get();
                foreach ($originalQuestions as $originalQuestion) {
                    $newQuestion = $originalQuestion->replicate();
                    $newQuestion->id = Str::uuid()->toString();
                    $newQuestion->round_id = $newRound->id;
                    $newQuestion->save();

                    $originalAnswers = $originalQuestion->answers()->get();
                    foreach ($originalAnswers as $originalAnswer) {
                        $newAnswer = $originalAnswer->replicate();
                        $newAnswer->id = Str::uuid()->toString();
                        $newAnswer->question_id = $newQuestion->id;
                        $newAnswer->save();
                    }
                }
            }

            return response()->json(['message' => 'Game successfully duplicated.', 'game' => $newGame], 201);
        } catch (Exception $e) {
            Log::error('Error duplicating game: ' . $e->getMessage());
            return response()->json(['message' => 'Error duplicating game.'], 500);
        }
    }

} 
