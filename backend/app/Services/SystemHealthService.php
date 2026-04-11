<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SystemHealthService
{
    /**
     * Send an alert to Discord and/or Telegram about a system error (via Queue).
     */
    public function notifyError(\Throwable $exception, string $source = 'Backend'): void
    {
        $payload = [
            'discord' => [
                'username' => 'O-229 Monitor',
                'embeds' => [[
                    'title' => "🚨 Erreur Critique ({$source})",
                    'color' => 15152384,
                    'fields' => [
                        ['name' => 'Message', 'value' => substr($exception->getMessage(), 0, 1000)],
                        ['name' => 'Fichier', 'value' => $exception->getFile() . ':' . $exception->getLine()],
                        ['name' => 'URL', 'value' => request()->fullUrl()],
                    ],
                    'timestamp' => now()->toIso8601String(),
                ]]
            ],
            'telegram' => "🚨 *Erreur O-229 ({$source})*\n\n"
                        . "💬 *Message*: " . $exception->getMessage() . "\n"
                        . "📂 *Fichier*: " . $exception->getFile() . ":" . $exception->getLine() . "\n"
                        . "🌐 *URL*: " . request()->fullUrl() . "\n"
                        . "🕒 *Date*: " . now()->format('Y-m-d H:i:s')
        ];

        \App\Jobs\SendSystemAlertJob::dispatch('error', $payload);
    }

    /**
     * Send a security alert about a blocked attack (via Queue).
     */
    public function notifySecurityAlert(string $title, string $message, array $metadata = []): void
    {
        $metaString = "";
        foreach ($metadata as $key => $val) {
            $metaString .= "🔹 *{$key}*: " . (is_array($val) ? json_encode($val) : $val) . "\n";
        }

        $text = "🛡️ *CERBERUS SECURITY ALERT*\n"
              . "⚠️ *{$title}*\n\n"
              . "📝 *Détail*: {$message}\n"
              . "📍 *IP*: " . request()->ip() . "\n"
              . "🌐 *URL*: " . request()->fullUrl() . "\n"
              . $metaString
              . "\n🕒 " . now()->format('H:i:s d/m/Y');

        \App\Jobs\SendSystemAlertJob::dispatch('security', ['telegram' => $text]);
    }


    /**
     * Notify via Discord Webhook.
     */
    protected function notifyDiscord(\Throwable $exception, string $source): void
    {
        $webhookUrl = config('services.discord.error_webhook');
        if (!$webhookUrl) return;

        try {
            Http::post($webhookUrl, [
                'username' => 'O-229 Monitor',
                'embeds' => [[
                    'title' => "🚨 Erreur Critique ({$source})",
                    'color' => 15152384,
                    'fields' => [
                        ['name' => 'Message', 'value' => substr($exception->getMessage(), 0, 1000)],
                        ['name' => 'Fichier', 'value' => $exception->getFile() . ':' . $exception->getLine()],
                        ['name' => 'URL', 'value' => request()->fullUrl()],
                    ],
                    'timestamp' => now()->toIso8601String(),
                ]]
            ]);
        } catch (\Exception $e) {
            Log::error('Discord Alert Failed: ' . $e->getMessage());
        }
    }

    /**
     * Notify via Telegram Bot.
     */
    protected function notifyTelegram(\Throwable $exception, string $source): void
    {
        $token = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (!$token || !$chatId) return;

        $text = "🚨 *Erreur O-229 ({$source})*\n\n"
              . "💬 *Message*: " . $exception->getMessage() . "\n"
              . "📂 *Fichier*: " . $exception->getFile() . ":" . $exception->getLine() . "\n"
              . "🌐 *URL*: " . request()->fullUrl() . "\n"
              . "🕒 *Date*: " . now()->format('Y-m-d H:i:s');

        try {
            Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'Markdown',
            ]);
        } catch (\Exception $e) {
            Log::error('Telegram Alert Failed: ' . $e->getMessage());
        }
    }

    /**
     * Send a simple test message to verify the connection.
     */
    public function sendTestMessage(string $message): bool
    {
        $token = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (!$token || !$chatId) return false;

        $response = Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => "🚀 *Test O-229 Marketplace*\n\n" . $message,
            'parse_mode' => 'Markdown'
        ]);

        return $response->successful();
    }
}
