<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            
            'id' => $this->id,
            'player_name' => $this->player_name,
            'is_disqualified' => $this->is_disqualified,
            'round_finished' => $this->round_finished,
            'buzzer_enabled' => $this->buzzer_enabled,
        ];
    }
}
