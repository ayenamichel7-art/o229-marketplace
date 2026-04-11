<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendTrackingEventToTikTok implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected string $eventName,
        protected string $url,
        protected array $customData = [],
        protected array $userData = []
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $pixelId = config('tracking.tiktok.pixel_id');
        $accessToken = config('tracking.tiktok.access_token');

        if (!$pixelId || !$accessToken) {
            return;
        }

        try {
            Http::withHeaders([
                'Access-Token' => $accessToken,
                'Content-Type' => 'application/json',
            ])->post("https://business-api.tiktok.com/open_api/v1.3/event/track/", [
                'event_source' => 'web',
                'event_source_id' => $pixelId,
                'data' => [
                    [
                        'event' => $this->eventName,
                        'event_time' => time(),
                        'page' => ['url' => $this->url],
                        'user' => [
                            'ip' => $this->userData['client_ip_address'] ?? null,
                            'ua' => $this->userData['client_user_agent'] ?? null,
                        ],
                        'properties' => $this->customData,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("TikTok Events API Error in Job: " . $e->getMessage());
        }
    }
}
