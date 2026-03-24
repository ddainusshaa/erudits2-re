<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class PingEvent implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $pingTime;
    public $receivedAt;

    public function __construct($pingTime)
    {
        // Store the ping time (from the client)
        $this->pingTime = $pingTime;

        // Store the server's timestamp (when the ping was received)
        $this->receivedAt = now();
    }

    public function broadcastOn()
    {
        return new Channel('ping-channel');  // Broadcast on 'ping-channel'
    }

    public function broadcastAs()
    {
        return 'ping-event';  // Event name
    }
}
