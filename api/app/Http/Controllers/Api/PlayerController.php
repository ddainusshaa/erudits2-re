<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Http\Requests\PlayerRequest;
use Illuminate\Support\Facades\Validator;
use App\Events\PlayerEvent;
use App\Events\PlayerDevtoolsEvent;
use App\Models\GameInstance;
use App\Http\Resources\PlayerResource;
use App\Events\RefreshPlayersEvent;
use Illuminate\Support\Facades\Log;
use Exception;

class PlayerController extends Controller
{

    public function createPlayer(PlayerRequest $request)
    {
        Log::info('Creating player ' . $request->player_name . ' for instance ' . $request->instance_id);
        try{
            if(Player::where('player_name', '=', $request->player_name)->where('instance_id', '=', $request->instance_id)->exists()) {
                return response()->json(['error' => 'Player already exists.'], 400);
            }
            $validated = $request->validated();

            $player = Player::create([
                'id' => Str::uuid()->toString(),
                'player_name' => $validated['player_name'],
                'instance_id' => $validated['instance_id'],
            ]);

            broadcast(new RefreshPlayersEvent($request->instance_id, $player));

            return response()->json(['message' => 'Player created successfully.', 'id' => $player['id']], 201);
        }
        catch(Exception $e) {
            Log::error('Error while creating player ' . $request->player_name . ' for instance ' . $request->instance_id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Error while creating player.'], 500);
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, string $instanceId)
    {
        $players = Player::where('instance_id', $instanceId)->get();
        return response()->json(['players' => $players], 200);
    }

    public function disqualify(Request $request) {
        $players = explode(',', $request->player_ids);

        Log::info('Disqualifying players ' . $request->player_ids);
        foreach ($players as $playerId) {
            try {
                $player = Player::where('id', $playerId)->first();
                if($player && !$player->is_disqualified) {
                    $player->is_disqualified = true;
                    $player->save();
                    event(new PlayerEvent($playerId, 'disqualified'));
                }
            } catch(Exception $e) {
                Log::error('Error while disqualifying player ' . $playerId . ': ' . $e->getMessage());
            }
        }
        return response()->json(['message' => 'Players disqualified.'], 200);
    }

    public function requalify(Request $request) {

        $players = explode(',', $request->player_ids);

        Log::info('Requalifying players ' . $request->player_ids);
        foreach ($players as $playerId) {
            try {
                $player = Player::where('id', $playerId)->first();
                if($player && $player->is_disqualified) {
                    $player->is_disqualified = false;
                    $player->save();
                    event(new PlayerEvent($playerId, 'requalified'));
                }
            } catch(Exception $e) {
                Log::error('Error while requalifying player ' . $playerId . ': ' . $e->getMessage());
            }
        }
        return response()->json(['message' => 'Players requalified.'], 200);
    }

    public function adjustPoints(Request $request) {
        $player = Player::where('id', $request->player_id)->first();
        if($player) {
            $player->points = $player->points + $request->amount;
            $player->save();

            return response()->json(['points' => $player->points], 200);
        }
        return response()->json(['error' => 'Player not found.'], 404);
    }

    public function finishRound(Request $request) {
        $player = Player::find($request->player_id);
        if($player) {
            $player->round_finished = true;
            $player->save();
            broadcast(new RefreshPlayersEvent($player->instance_id, $player));
            return response()->json(['message' => 'Player round finished.'], 200);
        }
        return response()->json(['error' => 'Player not found.'], 404);
    }

    public function ping(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'player_id' => 'required|uuid',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid player id.'], 400);
        }

        $player = Player::find($request->player_id);
        if ($player) {
            $player->touch();
            return response()->json(['message' => 'Player pinged.'], 200);
        }

        return response()->json(['error' => 'Player not found.'], 404);
    }

    public function devtools(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'player_id' => 'required|uuid',
            'is_open' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid payload.'], 400);
        }

        $player = Player::find($request->player_id);
        if ($player) {
            broadcast(new PlayerDevtoolsEvent($player->instance_id, $player->id, (bool) $request->is_open));
            return response()->json(['message' => 'Devtools status updated.'], 200);
        }

        return response()->json(['error' => 'Player not found.'], 404);
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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $player = Player::findOrFail($id);
        if($player) {
            $instance = GameInstance::where('id', $player->instance_id)->first(['started_at', 'game_started', 'buzzers_mode']);
            return response()->json(['player' => new PlayerResource($player), 'instance' => $instance], 200);
        }
        return response()->json(['error' => 'Player not found.'], 404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Player $player)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Player $player)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $ids)
    {
        $playerIds = explode(',', $ids);
        Log::info('Deleting players ' . $ids);
        foreach ($playerIds as $id) {
            try {
                $player = Player::where('id', $id)->first();
                if($player) {
                    event(new PlayerEvent($id, 'ended'));
                    $player->delete();
                }
            } catch(Exception $e) {
                Log::error('Error while deleting player ' . $id . ': ' . $e->getMessage());
            }
        }
        return response()->json(['message' => 'Players deleted.'], 200);
    }
}
