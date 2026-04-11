<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminKycController extends Controller
{
    /**
     * Download/view a vendor's KYC document (admin only).
     */
    public function download(int $shopId): StreamedResponse|JsonResponse
    {
        $shop = Shop::findOrFail($shopId);

        if (!$shop->id_document_path) {
            return response()->json([
                'message' => 'Aucun document KYC soumis pour cette boutique.',
            ], 404);
        }

        if (!Storage::disk('local')->exists($shop->id_document_path)) {
            return response()->json([
                'message' => 'Le fichier KYC est introuvable sur le serveur.',
            ], 404);
        }

        $filename = 'kyc_' . $shop->slug . '_' . basename($shop->id_document_path);

        // Audit Log Cerberus
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'KYC_DOCUMENT_DOWNLOAD',
            'description' => "L'administrateur a téléchargé le document KYC de la boutique : " . $shop->name,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => ['shop_id' => $shop->id]
        ]);

        return Storage::disk('local')->download($shop->id_document_path, $filename);
    }
}
