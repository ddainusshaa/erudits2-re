<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Player extends Model
{
    use HasFactory, HasUuids;

    protected $fillable =[
        'id',
        'player_name',
        'points',
        'is_disqualified',
        'instance_id',
        'round_finished',
        'buzzer_enabled',
    ];

    public function game_instance()
    {
        return $this->belongsTo(GameInstance::class);
    }
}
