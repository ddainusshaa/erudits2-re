<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Answer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'text',
        'is_correct',
        'question_id',
    ];
    
    public function question(): BelongsTo {
        return $this->belongsTo(Question::class);
    }

}
