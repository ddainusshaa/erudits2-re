<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


class PlayerAnswer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable =[
        'id',
        'player_id',
        'question_id',
        'instance_id',
        'answer_id',
        'answer_text',
        'is_answer_correct'
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function game_instance()
    {
        return $this->belongsTo(GameInstance::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

}
