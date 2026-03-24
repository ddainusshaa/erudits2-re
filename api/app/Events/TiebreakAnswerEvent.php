<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TiebreakAnswerEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

    public $instanceId;
    public $playerId;
    public $playerName;
    public $answer;
    public $question;
    public $correctAnswer;
    public $isCorrect;
    public $timestamp;

    public function __construct($instanceId, $playerId, $playerName, $question, $answer, $correctAnswer, $isCorrect, $timestamp)
    {
        $this->instanceId = $instanceId;
        $this->playerId = $playerId;
        $this->playerName = $playerName;
        $this->question = $question;
        $this->correctAnswer = $correctAnswer;
        $this->answer = $answer;
        $this->isCorrect = $isCorrect;
        $this->timestamp = $timestamp;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [new Channel("tiebreak-answer.{$this->instanceId}")];
    }

    public function broadcastAs()
    {
        return 'tiebreak-answer-event';
    }

    public function broadcastWith()
    {
        return [
            'player_id' => $this->playerId,
            'player_name' => $this->playerName,
            'answer' => $this->answer,
            'question' => $this->question,
            'correct_answer' => $this->correctAnswer,
            'is_correct' => $this->isCorrect,
            'timestamp' => $this->timestamp,
        ];
    }
}
