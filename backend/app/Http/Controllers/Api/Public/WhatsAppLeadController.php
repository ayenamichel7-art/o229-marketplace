<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WhatsAppLead;
use App\Models\Analytics;
use App\Events\RealTimeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class WhatsAppLeadController extends Controller
{
    /**
     * Endpoint to track when a user clicks the WhatsApp button.
     * Returns the formatted WA wa.me link.
     */
    public function trackClick(Request $request, int $productId): JsonResponse
    {
        $product = Product::with('shop')->findOrFail($productId);
        $shop = $product->shop;

        if (!$shop || !$shop->whatsapp_number) {
            return response()->json(['message' => 'Ce vendeur n\'a pas configuré WhatsApp.'], 404);
        }

        // Track the lead
        WhatsAppLead::create([
            'product_id' => $product->id,
            'shop_id' => $shop->id,
            'visitor_ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referrer' => $request->header('referer'),
            'clicked_at' => now(),
        ]);

        // Increment global counter
        $product->increment('whatsapp_clicks_count');

        // Track daily analytics
        $today = Carbon::today();
        Analytics::updateOrCreate(
            ['product_id' => $product->id, 'shop_id' => $shop->id, 'date' => $today],
            [] // updateOrCreate syntax: increment doesn't exist directly on the query builder like this without triggering an update
        )->increment('whatsapp_clicks');

        // Prepare the WhatsApp link
        $message = "Bonjour ! Je suis intéressé(e) par *{$product->name}* à {$product->formatted_price} vu sur O-229.\nLien : " . config('app.frontend_url') . "/products/{$product->slug}\nEst-ce toujours disponible ?";
        $encodedMessage = urlencode($message);
        
        // Clean phone number (remove spaces, +, etc)
        $phone = preg_replace('/[^0-9]/', '', $shop->whatsapp_number);
        
        // WhatsApp/Evolution API expects international format (e.g., 22901XXXXXXXX)
        // Benin Transition (Nov 2024): 8 digits -> 10 digits (prefixed with 01).
        
        // Handle 8-digit legacy numbers by adding 229
        if (strlen($phone) === 8) {
            $phone = '229' . $phone;
        } 
        // Handle 10-digit modern numbers (starting with 01)
        elseif (strlen($phone) === 10 && str_starts_with($phone, '01')) {
            $phone = '229' . $phone;
        }
        // If it starts with 229 but lacks the '01' (e.g. 229XXXXXXXX), we check if it's the old 8-digit format
        // Most users now provide 22901XXXXXXXX or 01XXXXXXXX.

        $url = "https://wa.me/{$phone}?text={$encodedMessage}";

        // 🛡️ Cerberus : Notification WhatsApp Lead au vendeur
        if ($shop->whatsapp_number) {
            dispatch(new \App\Jobs\SendWhatsAppMessageJob(
                $shop->whatsapp_number,
                "👀 Un client vient de cliquer sur votre produit *'{$product->name}'* ! Préparez-vous à recevoir un message sur WhatsApp. 🚀"
            ));

            // Real-time broadcast for the platform (Reverb)
            broadcast(new RealTimeNotification(
                "Nouveau lead WhatsApp pour '{$product->name}' !",
                'success',
                null, // For public testing
                ['product_id' => $product->id, 'shop' => $shop->name]
            ));
        }

        return response()->json([
            'url' => $url,
            'success' => true
        ]);
    }
}
