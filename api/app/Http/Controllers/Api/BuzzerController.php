<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Buzzer;
use Illuminate\Http\Request;
use App\Models\GameInstance;
use App\Events\GameControlEvent;
use App\Events\BuzzerEvent;
use Illuminate\Support\Str;
use App\Http\Requests\BuzzerRequest;
use Carbon;
use App\Models\Player;
use App\Events\PlayerEvent;


class BuzzerController extends Controller
{

    public function initialize(Request $request) {
        $instance = GameInstance::find($request->instance_id);
        $instance->buzzers_mode = 1;
        $instance->save();
        broadcast(new GameControlEvent($instance->id, 'buzzers-start'));

        return response()->json(['message' => 'Buzzers initialized']);
    }

    public function deinitialize(Request $request) {
        $instance = GameInstance::find($request->instance_id);
        $instance->buzzers_mode = 0;
        $instance->save();
        broadcast(new GameControlEvent($instance->id, 'buzzers-stop'));

        return response()->json(['message' => 'Buzzers deinitialized']);
    }

    public function buzz(BuzzerRequest $request) {
        $instance = GameInstance::find($request['instance_id']);
    
        if ($instance->buzzers_mode == 0) {
            return response()->json(['message' => 'Buzzers are not initialized'], 400);
        }
    
        $firstBuzz = Buzzer::where('instance_id', $request['instance_id'])
                           ->where('active', true)
                           ->orderBy('buzzed_at', 'asc')
                           ->first();
    
        if ($firstBuzz) {
            return response()->json(['message' => 'Another buzzer was faster!'], 400);
        }
    
        $buzzer = Buzzer::create([
            'id' => Str::uuid(),
            'instance_id' => $request['instance_id'],
            'player_id' => $request['player_id'],
            'buzzed_at' => $request['buzzed_at'],
            'active' => 1,
        ]);
    
        $player = $buzzer->player;
    
        $player->buzzer_enabled = false;
        $player->save();
    
        // Broadcast only the first buzzer
        broadcast(new BuzzerEvent($buzzer->instance_id, $player->id, $player->player_name));
    
        return response()->json(['message' => 'Buzzed']);
    }
    

    public function deactivateAll(Request $request) {
        $buzzers = Buzzer::where('instance_id', $request->instance_id)->get();
        $instance = GameInstance::find($request->instance_id);
        if($instance->buzzers_mode == 0) {
            return response()->json(['message' => 'Buzzers are not initialized']);
        }

        foreach($buzzers as $buzzer) {
            $buzzer->active = 0;
            $buzzer->save();
        }

        $players = Player::where('instance_id', $request->instance_id)->get();
        foreach($players as $player) {
            $player->buzzer_enabled = true;
            $player->save();
        }
        $instance->save();
        broadcast(new GameControlEvent($instance->id, 'buzzers-enabled'));

        return response()->json(['message' => 'Buzzers enabled']);
    }

    public function toggleBuzzers(Request $request) {
        $instance = GameInstance::find($request->instance_id);
        if($instance->buzzers_mode == 0) {
            return response()->json(['message' => 'Buzzers are not initialized']);
        }
        $player = Player::find($request->player_id);
        if(!$player) {
            return response()->json(['message' => 'Player not found']);
        }
        $player->buzzer_enabled = !$player->buzzer_enabled;
        $player->save();

        if($player->buzzer_enabled) {
            broadcast(new PlayerEvent($player->id, 'buzzer-enabled'));
        } else {
            broadcast(new PlayerEvent($player->id, 'buzzer-disabled'));
        }


        return response()->json(['message' => 'Buzzers toggled']);
    }

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
    public function show(Buzzer $buzzer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Buzzer $buzzer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Buzzer $buzzer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Buzzer $buzzer)
    {
        //
    }
}
