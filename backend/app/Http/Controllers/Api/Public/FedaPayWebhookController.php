<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Shop;
use App\Enums\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use FedaPay\FedaPay;
use FedaPay\Webhook;

class FedaPayWebhookController extends Controller
{
    /**
     * Handle FedaPay Webhooks for subscription payments.
     */
    public function handle(Request $request)
    {
        Log::info('FedaPay Webhook Received');

        // Note: For production, you should verify the FedaPay signature if they provide one
        // or query the transaction status manually to be 100% sure.
        
        $payload = $request->all();
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? null;

        if (!$event || !$data) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        switch ($event) {
            case 'transaction.approved':
                $this->handleTransactionApproved($data);
                break;
            case 'transaction.canceled':
                $this->handleTransactionCanceled($data);
                break;
        }

        return response()->json(['message' => 'Webhook handled']);
    }

    protected function handleTransactionApproved(array $data)
    {
        $transactionId = $data['id'];
        $subscription = Subscription::where('payment_reference', $transactionId)
            ->where('status', 'pending')
            ->first();

        if ($subscription) {
            $subscription->update(['status' => 'active']);
            
            // Reactivate the shop
            $shop = $subscription->shop;
            if ($shop) {
                $shop->update(['is_active' => true]);
                
                // If it's a premium plan, verify the shop
                if ($subscription->plan && $subscription->plan->slug === 'premium') {
                    $shop->update(['is_verified' => true]);
                }

                Log::info("Subscription activated for shop: {$shop->name} via Webhook.");

                // Notify user
                if ($shop->user) {
                    $shop->user->notify(new \App\Notifications\SubscriptionStarted($subscription));
                }

                // Notify Admins
                $admins = \App\Models\User::where('role', 'admin')->get();
                foreach($admins as $admin) {
                   $admin->notify(new \App\Notifications\AdminSubscriptionAlert($shop, 'shop_activated', "Paiement confirmé par Webhook. Boutique réactivée."));
                }
            }
        }
    }

    protected function handleTransactionCanceled(array $data)
    {
        $transactionId = $data['id'];
        $subscription = Subscription::where('payment_reference', $transactionId)
            ->where('status', 'pending')
            ->first();

        if ($subscription) {
            $subscription->update(['status' => 'canceled']);
            Log::warning("Payment canceled for subscription ID: {$subscription->id}");
        }
    }
}
