<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    /**
     * List all products with their approval status
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'all');
        $query = Product::with(['shop.user', 'primaryImage']);

        if ($status !== 'all') {
            $query->where('approval_status', $status);
        }

        $products = $query->latest()->paginate(20);
        return response()->json($products);
    }

    /**
     * Approve or reject a product
     */
    public function moderate(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string|required_if:status,rejected|max:1000'
        ]);

        $product = Product::findOrFail($id);
        $product->approval_status = $request->status;
        
        if ($request->status === 'rejected') {
            $product->rejection_reason = $request->reason;
            $product->status = 'inactive'; // Force offline
        } else {
            $product->rejection_reason = null;
        }

        $product->save();

        // 🛡️ Cerberus : Audit Logging
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'product_moderation',
            'description' => "Le produit '{$product->name}' a été " . ($request->status === 'approved' ? 'approuvé' : 'rejeté'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'product_id' => $product->id,
                'status' => $request->status,
                'reason' => $request->reason
            ]
        ]);

        // Notify Vendor via System Notifications
        if ($product->shop && $product->shop->user) {
            $product->shop->user->notify(new \App\Notifications\ProductModerated($product));
            
            // 🛡️ Cerberus : Notification WhatsApp
            if ($product->shop->whatsapp_number) {
                $statusMsg = $product->approval_status === 'approved' 
                    ? "✅ Votre produit '{$product->name}' a été APPROUVÉ et est maintenant visible sur O-229 ! Bonne vente."
                    : "❌ Votre produit '{$product->name}' n'a pas été validé. Motif : " . ($product->rejection_reason ?? 'Non spécifié');
                
                dispatch(new \App\Jobs\SendWhatsAppMessageJob($product->shop->whatsapp_number, $statusMsg));
            }
        }

        return response()->json([
            'message' => 'Produit modéré avec succès.',
            'approval_status' => $product->approval_status
        ]);
    }
}
