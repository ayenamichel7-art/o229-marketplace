<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendSystemAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Le nombre de tentatives max en cas d'échec.
     */
    public $tries = 2;

    /**
     * Délai d'attente avant de retenter (en secondes).
     */
    public $backoff = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected string $type, // 'error' ou 'security'
        protected array $payload
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if ($this->type === 'error') {
                $this->sendErrorAlert();
            } elseif ($this->type === 'security') {
                $this->sendSecurityAlert();
            }
        } catch (\Exception $e) {
            Log::error("SendSystemAlertJob failed: " . $e->getMessage());
            throw $e;
        }
    }

    protected function sendErrorAlert(): void
    {
        $discordUrl = config('services.discord.error_webhook');
        $telegramToken = config('services.telegram.bot_token');
        $telegramChatId = config('services.telegram.chat_id');

        // Discord Webhook
        if ($discordUrl && isset($this->payload['discord'])) {
            Http::post($discordUrl, $this->payload['discord']);
        }

        // Telegram Bot
        if ($telegramToken && $telegramChatId && isset($this->payload['telegram'])) {
            Http::post("https://api.telegram.org/bot{$telegramToken}/sendMessage", [
                'chat_id' => $telegramChatId,
                'text' => $this->payload['telegram'],
                'parse_mode' => 'Markdown',
            ]);
        }
    }

    protected function sendSecurityAlert(): void
    {
        $telegramToken = config('services.telegram.bot_token');
        $telegramChatId = config('services.telegram.chat_id');

        if ($telegramToken && $telegramChatId && isset($this->payload['telegram'])) {
            Http::post("https://api.telegram.org/bot{$telegramToken}/sendMessage", [
                'chat_id' => $telegramChatId,
                'text' => $this->payload['telegram'],
                'parse_mode' => 'Markdown',
            ]);
        }
    }
}
