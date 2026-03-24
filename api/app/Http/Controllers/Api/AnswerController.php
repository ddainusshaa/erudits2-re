<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Models\Round;
use App\Models\Game;
use App\Models\Question;

class AnswerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(string $questionID)
    {
        if(!$questionID) {
            return response()->json(['message' => 'Question ID is required.'], 400);
        }

        $answer = [
            'id' => Str::uuid()->toString(), 
            'text' => 'Atbildes teksts', 
            'is_correct' => false, 
        ];

        return response()->json(['message' => 'Answer is ready for creation.', 'answer' => $answer], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Answer $answer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Answer $answer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Answer $answer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $answerId)
    {
        $answer = Answer::findOrFail($answerId);
        $question = Question::findOrFail($answer->question_id);
        $round = Round::findOrFail($question->round_id);

        $this->authorize('manage', Game::findOrFail($round->game_id));

        $answer->delete();

        return response()->json(null, 204);
    }
}
