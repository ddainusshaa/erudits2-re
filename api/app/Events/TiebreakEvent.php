<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TiebreakEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

     public $question;
     public $round;
     public $playerId;
     public $command;
     public $answers;

    public function __construct($command, $playerId, $round, $question, $answers)
    {
        $this->command = $command;
        $this->question = $question;
        $this->playerId = $playerId;
        $this->round = $round;
        $this->answers = $answers;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [new Channel("player.{$this->playerId}")];
    }

    public function broadcastAs()
    {
        return 'tiebreak-event';
    }

    public function broadcastWith()
    {
        return [
            'command' => $this->command,
            'question' => $this->question,
            'round' => $this->round,
            'answers' => $this->answers,
        ];
    }
}
