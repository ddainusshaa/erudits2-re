<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerDevtoolsEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $instanceId;
    public $playerId;
    public $isOpen;
    public $detectedAt;

    public function __construct($instanceId, $playerId, $isOpen)
    {
        $this->instanceId = $instanceId;
        $this->playerId = $playerId;
        $this->isOpen = $isOpen;
        $this->detectedAt = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        return [new Channel("refresh-players.{$this->instanceId}")];
    }

    public function broadcastAs()
    {
        return 'player-devtools-event';
    }

    public function broadcastWith()
    {
        return [
            'player_id' => $this->playerId,
            'is_open' => $this->isOpen,
            'detected_at' => $this->detectedAt,
        ];
    }
}
