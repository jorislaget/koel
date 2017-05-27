<?php

namespace App\Policies;

use App\Models\Playlist;
use App\Models\User;

class PlaylistPolicy
{
    public function owner(User $user, Playlist $playlist)
    {
        return $user->id === $playlist->user_id;
    }

    public function contributor(User $user, Playlist $playlist)
    {
        return $user->id === $playlist->user_id || is_null($playlist->user_id);
    }
}
