<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory, HasUuids;

    protected $fillable =[
        'id',
        'title',
        'is_text_answer',
        'guidelines',
        'image_url',
        'round_id',
        'order'
    ];

    public function round(): BelongsTo {
        return $this->belongsTo(Round::class);
    }

    public function answers(): HasMany {
        return $this->hasMany(Answer::class);
    }
}
