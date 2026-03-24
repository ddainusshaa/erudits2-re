<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Game;

class GamePolicy
{
    /**
     * Create a new policy instance.
     */
    public function manage(User $user, Game $game)
    {
        return $user->id === $game->user_id;
    }
}
