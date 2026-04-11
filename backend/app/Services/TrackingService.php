<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TrackingService
{
    /**
     * Envoyer un événement à Meta via Conversion API (CAPI)
     */
    public function sendToMeta(string $eventName, string $url, array $customData = [], array $userData = [])
    {
        $userData = array_merge([
            'client_user_agent' => request()->userAgent(),
            'client_ip_address' => request()->ip(),
        ], $userData);

        \App\Jobs\SendTrackingEventToMeta::dispatch($eventName, $url, $customData, $userData);
    }

    /**
     * Envoyer un événement à TikTok via Events API
     */
    public function sendToTikTok(string $eventName, string $url, array $customData = [])
    {
        $userData = [
            'client_user_agent' => request()->userAgent(),
            'client_ip_address' => request()->ip(),
        ];

        \App\Jobs\SendTrackingEventToTikTok::dispatch($eventName, $url, $customData, $userData);
    }
}
