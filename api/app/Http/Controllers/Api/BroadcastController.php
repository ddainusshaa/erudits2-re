<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Events\GameControlEvent;
use App\Events\PingEvent;
use App\Models\GameInstance;
use App\Models\Round;
use App\Models\Question;


class BroadcastController extends Controller
{
    public function ping(Request $request)
    {
        $pingTime = $request->input('ping_time');
        broadcast(new PingEvent($pingTime)); 

        return response()->json(['status' => 'Ping sent']);
    }

}
