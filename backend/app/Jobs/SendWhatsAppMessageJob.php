<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Le nombre de tentatives après une erreur.
     */
    public $tries = 3;

    /**
     * Le nombre de secondes à attendre avant de retenter.
     */
    public $backoff = 60;

    protected string $number;
    protected string $message;

    /**
     * Create a new job instance.
     */
    public function __construct(string $number, string $message)
    {
        $this->number = $number;
        $this->message = $message;
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsapp): void
    {
        // On ne met PAS de sleep() ici pour ne pas bloquer les workers du serveur. 
        // Evolution API gère nativement le délai de "frappe" sans nous bloquer.

        $success = $whatsapp->sendMessage($this->number, $this->message);

        if (!$success) {
            throw new \Exception("Échec de l'envoi WhatsApp au numéro: {$this->number}. Retrying...");
        }

        Log::info("WhatsApp Message sent successfully to {$this->number} via O229 Queue.");
    }

}
