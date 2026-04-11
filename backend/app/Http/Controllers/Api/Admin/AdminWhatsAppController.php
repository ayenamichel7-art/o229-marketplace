<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AdminWhatsAppController extends Controller
{
    /**
     * Check current status and state of the WhatsApp instance.
     */
    public function status(): JsonResponse
    {
        $url = env('WA_API_URL', 'http://evolution_api:8080');
        $key = env('WA_API_KEY', 'o229_wa_secret_key');
        $instance = env('WA_INSTANCE_NAME', 'O229_MAIN');

        try {
            $response = Http::withHeaders(['apikey' => $key])
                ->get("{$url}/instance/connectionState/{$instance}");

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'DISCONNECTED',
                    'message' => 'L\'instance WhatsApp n\'existe pas ou est arrêtée.',
                    'details' => $response->json()
                ]);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'ERROR',
                'message' => 'Impossible de contacter le serveur Evolution API.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get QR Code for pairing (if disconnected).
     */
    public function getQRCode(): JsonResponse
    {
        $url = env('WA_API_URL', 'http://evolution_api:8080');
        $key = env('WA_API_KEY', 'o229_wa_secret_key');
        $instance = env('WA_INSTANCE_NAME', 'O229_MAIN');

        try {
            // First check if already connected
            $statusRes = Http::withHeaders(['apikey' => $key])
                ->get("{$url}/instance/connectionState/{$instance}");
            
            if ($statusRes->successful() && $statusRes->json()['instance']['state'] === 'open') {
                return response()->json(['message' => 'Déjà connecté.', 'state' => 'open']);
            }

            // Get QR
            $response = Http::withHeaders(['apikey' => $key])
                ->get("{$url}/instance/connect/{$instance}");

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
