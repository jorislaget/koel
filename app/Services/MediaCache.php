<?php

namespace App\Services;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Song;
use Cache;
use Illuminate\Support\Facades\Storage;

class MediaCache
{
    protected $keyName = 'media_cache';

    public function get()
    {
        $file = Cache::get($this->keyName);

        if (!$file || !config('koel.cache_media')) {
            Storage::disk('public')->put($this->keyName . '.json', json_encode($this->query()));
            $file = Storage::disk('public')->url($this->keyName . '.json') . '?' . time();

            if (config('koel.cache_media')) {
                Cache::forever($this->keyName, $file);
            }
        }

        return $file;
    }

    /**
     * Query fresh data from the database.
     *
     * @return array
     */
    private function query()
    {
        return [
            'albums' => Album::orderBy('name')->get()->toArray(),
            'artists' => Artist::orderBy('name')->get()->toArray(),
            'songs' => Song::groupBy('album_id', 'artist_id', 'title')->get()->toArray(),
        ];
    }

    public function clear()
    {
        Cache::forget($this->keyName);
    }
}
