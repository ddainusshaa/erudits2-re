<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Round;
use App\Http\Requests\QuestionRequest;
use App\Models\Game;
use App\Models\Answer;


class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $question_group = $request->question_group()->id;
        $questions = Question::where('question_group_id', $question_group)->get();
        foreach ($questions as $question) {
            $question['answers'] = Answer::where('question_id', $question->id)->get();
        }
        return response()->json($questions);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(string $roundId)
    {
        if(!$roundId) {
            return response()->json(['message' => 'Round ID is required.'], 400);
        }


        $question = [
            'id' => Str::uuid()->toString(), 
            'title' => 'Spēles jautājums', 
            'is_text_answer' => false, 
            'guidelines' => null, 
            'image' => null, 
            'round_id' => $roundId,
            'answers' => []
        ];

        return response()->json(['message' => 'Question is ready for creation.', 'question' => $question], 201);
        }

    /**
     * Store a newly created resource in storage.
     */
    public function store(QuestionRequest $request)
    {
        $validated = $request->validated();

        $questionCount = Question::where('round_id', $request->round_id)->count();
        $validated['order'] = $questionCount + 1;
        
        $question = Question::create($validated);
        
        $answers = $validated['answers'];
        foreach ($answers as $answer) {
            $answer['question_id'] = $question->id;
            Answer::create($answer);
        }
        
        $question['answers'] = $answers;
    
        return response()->json(['message' => 'Question successfully created.', 'question' => $question], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $question = Question::findOrFail($id);

        return response()->json($question, 200);
        
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(QuestionRequest $request, string $id)
    {
        $question = Question::findOrFail($id);

        $round = Round::findOrFail($question->round_id);

        $this->authorize('manage', Game::findOrFail($round->game_id));

        $validated = $request->validated();
        $answers = $validated['answers'];
        Answer::where('question_id', $question->id)->delete();
        foreach ($answers as $answer) {
            $answer['question_id'] = $question->id;
            Answer::create($answer);     
        }
        
        $question->update($validated);

        $question['answers'] = $answers;
        
        return response()->json(['message' => "Question successfully updated.", 'question' => $question], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $question = Question::findOrFail($id);

        $round = Round::findOrFail($question->round_id);

        $this->authorize('manage', Game::findOrFail($round->game_id));

        $question->delete();
        return response()->json(null, 204);
    }

    public function uploadImage(Request $request) {
        $question = Question::findOrFail($request->question_id);

        $round = Round::findOrFail($question->round_id);

        $this->authorize('manage', Game::findOrFail($round->game_id));

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:4096',
        ]);

        $imageName = time().'.'.$request->image->extension();  
        $request->image->move(public_path('images'), $imageName);

        $question->image_url = "/images/" . $imageName;
        $question->save();

        return response()->json(['message' => 'Image uploaded successfully.', 'image_url' => $question->image_url], 200);
    }
}
