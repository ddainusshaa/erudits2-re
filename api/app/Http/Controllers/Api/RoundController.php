<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Round;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Requests\RoundRequest;



class RoundController extends Controller
{

    /**
     * Show the form for creating a new resource.
     */
    public function create(string $gameId)
    {
        if(!$gameId) {
            return response()->json(['message' => 'Game ID is required.'], 400);
        }

        $round = [
            'id' => Str::uuid()->toString(), 
            'title' => 'Spēles kārta', 
            'disqualify_amount' => 0, 
            'answer_time' => 0, 
            'points' => 0, 
            'is_additional' => false, 
            'game_id' => $gameId,
            'is_test' => false,
        ];
                
        return response()->json(['message' => 'Round is ready for creation.', 'round' => $round], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoundRequest $request)
    {
        $this->authorize('manage', Game::findOrFail($request->game_id));

        $existingRound = Round::find($request->id);
        if($existingRound) {
            $validated = $request->validated();        
            $existingRound->update($validated);
            return response()->json(['message' => 'Round successfully saved.'], 200);
        }

        $validated = $request->validated();
        $roundCount = Round::where('game_id', $request->game_id)->count();
        $validated['order'] = $roundCount + 1;
        $round = Round::create($validated);
    
        return response()->json(['message' => 'Round successfully created.', 'round' => $round], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $round = Round::findOrFail($id);

        return response()->json($round, 200);
    }

    public function roundsByGame(string $gameId)
    {
        $rounds = Round::withCount('questions')->where('game_id', $gameId)->get();

        return response()->json(['rounds' => $rounds], 200);
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoundRequest $request, string $id)
    {
        $round = Round::findOrFail($id);
        
        $this->authorize('manage', Game::findOrFail($round->game_id));

        $validated = $request->validated();        
        $round->update($validated);
    
        return response()->json(['message' => 'Round successfully updated.', 'round' => $round], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $round = Round::findOrFail($id);

        $this->authorize('manage', Game::findOrFail($round->game_id));

        $round->delete();
        return response()->json(null, 204);
    }
}
