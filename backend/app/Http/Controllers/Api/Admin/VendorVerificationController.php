<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;

class VendorVerificationController extends Controller
{
    /**
     * List all vendors (shops)
     */
    public function index(): JsonResponse
    {
        $shops = Shop::with('user')->paginate(20);
        
        $shops->getCollection()->transform(function ($shop) {
             $shop->kyc_document = $shop->id_document_path ? asset('storage/' . $shop->id_document_path) : null;
             return $shop;
        });

        return response()->json($shops);
    }

    /**
     * Verify or Unverify a specific shop
     */
    public function toggleVerify($id): JsonResponse
    {
        $shop = Shop::findOrFail($id);
        $shop->is_verified = !$shop->is_verified;
        $shop->save();

        // Notify Vendor via System Notifications
        if ($shop->user) {
            $shop->user->notify(new \App\Notifications\ShopVerified($shop));
        }

        // 🛡️ Cerberus : Notification WhatsApp en temps réel
        if ($shop->is_verified && $shop->whatsapp_number) {
            dispatch(new \App\Jobs\SendWhatsAppMessageJob(
                $shop->whatsapp_number,
                "🎉 Félicitations {$shop->name} ! Votre boutique a été officiellement VÉRIFIÉE sur O-229 Marketplace. Vous pouvez maintenant ajouter vos produits et générer des leads. 🚀"
            ));
        }

        $action = $shop->is_verified ? 'vérifiée' : 'révoquée';

        return response()->json([
            'message' => "La boutique {$shop->name} a été {$action} avec succès.",
            'is_verified' => $shop->is_verified
        ]);
    }
}
