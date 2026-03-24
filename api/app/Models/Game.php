<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Game extends Model
{
    use HasFactory, HasUuids;
    

    protected $fillable = [
        'id',
        'title',
        'description',
        'user_id',
        'last_activation',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function rounds(): HasMany {
        return $this->hasMany(Round::class);
    }

}
