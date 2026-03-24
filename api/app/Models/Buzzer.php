<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


class Buzzer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'player_id',
        'instance_id',
        'buzzed_at',
        'active',
    ];
    
    public function instance(): BelongsTo {
        return $this->belongsTo(Instance::class);
    }

    public function player(): BelongsTo {
        return $this->belongsTo(Player::class);
    }
}
