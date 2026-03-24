<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('game.{instanceId}', function ($user, $instanceId) {
    return $user->isInGame($instanceId);
});

Broadcast::channel('player.{playerId}', function ($user, $playerId) {
    return (int) $user->id === (int) $playerId;
});