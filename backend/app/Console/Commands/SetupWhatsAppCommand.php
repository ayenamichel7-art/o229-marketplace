<?php

namespace App\Console\Commands;

use App\Services\WhatsAppService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SetupWhatsAppCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'whatsapp:setup';

    /**
     * The console command description.
     */
    protected $description = 'Initialise l\'instance WhatsApp O229 et génère le QR Code à scanner.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info("🚀 Préparation de l'instance O-229 Marketplace (Évolution API)...");

        $url = env('WA_API_URL', 'http://evolution_api:8080');
        $key = env('WA_API_KEY', 'o229_wa_secret_key');
        $instance = env('WA_INSTANCE_NAME', 'O229_MAIN');

        // 1. Créer l'instance si elle n'existe pas
        $this->comment("Étape 1 : Création de l'instance {$instance}...");
        
        $response = Http::withHeaders(['apikey' => $key])
            ->post("{$url}/instance/create", [
                'instanceName' => $instance,
                'token' => Str::random(16),
                'number' => '0152904148', // Votre numéro par défaut
                'qrcode' => true
            ]);

        if ($response->successful()) {
            $this->info("Instance créée avec succès !");
        } else {
            $this->warn("L'instance existe peut-être déjà ou une erreur est survenue.");
        }

        // 2. Récupérer le QR Code
        $this->comment("Étape 2 : Récupération du QR Code à scanner...");
        
        $qrResponse = Http::withHeaders(['apikey' => $key])
            ->get("{$url}/instance/connect/{$instance}");

        if ($qrResponse->successful()) {
            $qrData = $qrResponse->json();
            
            if (isset($qrData['base64'])) {
                $this->info("✅ COPIEZ ET COLLEZ LE LIEN CI-DESSOUS DANS VOTRE NAVIGATEUR POUR SCANNER :");
                $this->line($qrData['base64']);
                $this->info("--------------------------------------------------------------------------------");
                $this->info("Ouvrez WhatsApp sur votre téléphone (0152904148) > Appareils connectés > Connecter un appareil.");
            } else {
                $this->info("📱 L'appareil semble DÉJÀ CONNECTÉ ! (Vérifiez votre Dashboard Evolution sur le port 8081)");
            }
        } else {
            $this->error("Erreur lors de la récupération du QR Code.");
        }

        return 0;
    }
}
