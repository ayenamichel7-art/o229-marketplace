<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendTrackingEventToMeta implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 60, 300];

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
        $pixelId = config('tracking.meta.pixel_id');
        $accessToken = config('tracking.meta.access_token');

        if (!$pixelId || !$accessToken) {
            return;
        }

        try {
            Http::timeout(5)->post("https://graph.facebook.com/v21.0/{$pixelId}/events", [
                'data' => [
                    [
                        'event_name' => $this->eventName,
                        'event_time' => time(),
                        'action_source' => 'website',
                        'event_source_url' => $this->url,
                        'user_data' => $this->userData,
                        'custom_data' => $this->customData,
                    ]
                ],
                'access_token' => $accessToken,
            ]);
        } catch (\Exception $e) {
            Log::error("Meta CAPI Error in Job: " . $e->getMessage());
        }
    }
}
