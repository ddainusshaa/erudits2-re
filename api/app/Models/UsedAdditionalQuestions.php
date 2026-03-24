<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsedAdditionalQuestions extends Model
{
    use HasFactory;
    protected $fillable = [
        'game_instance_id',
        'question_id',
    ];

    public function gameInstance() {
        return $this->belongsTo(GameInstance::class);
    }

    public function question() {
        return $this->belongsTo(Question::class);
    }
}
