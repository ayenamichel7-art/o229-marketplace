<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $instance;

    public function __construct()
    {
        $this->baseUrl = config('services.whatsapp.url', 'http://evolution_api:8080');
        $this->apiKey = config('services.whatsapp.key');
        $this->instance = config('services.whatsapp.instance', 'O229_MAIN');
    }

    /**
     * Send a text message to a WhatsApp number.
     * Note: Les délais sont maintenant gérés au niveau du Job pour ne pas bloquer les ressources.
     */
    public function sendMessage(string $number, string $message): bool
    {
        // Nettoyer le numéro (format international sans le +)
        $number = preg_replace('/[^0-9]/', '', $number);

        try {
            // Anti-Ban Cerberus : Simuler "En train d'écrire"
            Http::withHeaders(['apikey' => $this->apiKey])
                ->post("{$this->baseUrl}/chat/presence/{$this->instance}", [
                    'number' => $number,
                    'presence' => 'composing'
                ]);

            // Plus de sleep() ici ! On laisse le Job ou l'API gérer les délais.

            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/message/sendText/{$this->instance}", [
                'number' => $number,
                'options' => [
                    'delay' => rand(1500, 3500), // Délai interne à Evolution API (non bloquant PHP)
                    'presence' => 'composing',
                    'linkPreview' => true
                ],
                'textMessage' => [
                    'text' => $this->messageSpinning($message) // Faire varier le texte pour éviter d'être flagué
                ]
            ]);

            if (!$response->successful()) {
                Log::error('WhatsApp Send Failed: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('WhatsApp Service Exception: ' . $e->getMessage());
            return false;
        }
    }


    /**
     * Send an image with a caption.
     */
    public function sendImage(string $number, string $imageUrl, string $caption = ''): bool
    {
        $number = preg_replace('/[^0-9]/', '', $number);

        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->post("{$this->baseUrl}/message/sendMedia/{$this->instance}", [
                'number' => $number,
                'mediaMessage' => [
                    'mediatype' => 'image',
                    'caption' => $caption,
                    'media' => $imageUrl
                ]
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsApp Media Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Strategie Anti-Ban : Message Spinning avancé.
     * 1. Supporte les templates de synonymes : {Bonjour|Salut|Hello}
     * 2. Ajoute des caractères invisibles aléatoires
     */
    protected function messageSpinning(string $text): string
    {
        // 1. Process synonym curly braces {phrase1|phrase2|phrase3}
        $text = preg_replace_callback('/\{([^{}]*)\}/', function ($matches) {
            $parts = explode('|', $matches[1]);
            return $parts[array_rand($parts)];
        }, $text);

        // 2. Ajoute un caractère invisible à la fin
        $invisibleChars = ["\u{200B}", "\u{200C}", "\u{200D}", "\u{200E}", " "];
        $randomTail = $invisibleChars[array_rand($invisibleChars)];
        
        return $text . $randomTail;
    }
}
