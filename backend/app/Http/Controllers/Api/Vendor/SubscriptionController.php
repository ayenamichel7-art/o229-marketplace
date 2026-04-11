<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Enums\Role;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    /**
     * Get available subscription plans.
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::all();
        return response()->json(['data' => $plans]);
    }

    /**
     * Get the vendor's current active subscription.
     */
    public function current(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;
        
        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $subscription = $shop->subscription; // From the hasOne -> latest() active relationship

        return response()->json([
            'data' => $subscription ? $subscription->load('plan') : null,
        ]);
    }

    /**
     * Initiate a payment via FedaPay (Simulated).
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $shop = $request->user()->shop;
        if (!$shop) {
            return response()->json(['message' => 'Veuillez créer votre boutique en premier.'], 403);
        }

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        if ($plan->price == 0) {
            // Implement free tier logic directly
            $shop->subscriptions()->update(['status' => 'expired']); // Expire old ones

            $shop->subscriptions()->create([
                'plan_id' => $plan->id,
                'starts_at' => now(),
                'expires_at' => now()->addDays($plan->duration_days),
                'status' => 'active',
            ]);

            return response()->json(['message' => 'Forfait gratuit activé avec succès.']);
        }

        try {
            \FedaPay\FedaPay::setApiKey(config('fedapay.secret_key'));
            \FedaPay\FedaPay::setEnvironment(config('fedapay.environment'));

            $transaction = \FedaPay\Transaction::create([
                "description" => "Abonnement " . $plan->name . " pour " . $shop->name,
                "amount" => $plan->price,
                "currency" => ["iso" => "XOF"],
                "callback_url" => config('app.frontend_url') . "/dashboard/payment/callback",
                "customer" => [
                    "email" => $request->user()->email,
                    "firstname" => $request->user()->name,
                ]
            ]);

            $token = $transaction->generateToken();

            // We prepare the subscription status as 'pending' in reality, but here we wait for callback
            $shop->subscriptions()->update(['status' => 'expired']);

            $subscription = $shop->subscriptions()->create([
                'plan_id' => $plan->id,
                'starts_at' => now(),
                'expires_at' => now()->addDays($plan->duration_days),
                'status' => 'pending', // Waiting callback to change to active
                'payment_reference' => $transaction->id,
                'payment_provider' => 'fedapay'
            ]);

            return response()->json([
                'message' => 'Lien de paiement généré.',
                'payment_url' => $token->url
            ]);

        } catch (\Exception $e) {
            // For the sake of the MVP sandbox simulation if API keys are missing: fallback to instant success
            // BUT: Only in local environments for security!
            if (config('app.env') === 'production') {
                return response()->json(['message' => 'Erreur lors de la génération du lien de paiement. Veuillez réessayer.'], 500);
            }

            $shop->subscriptions()->update(['status' => 'expired']);

            $subscription = $shop->subscriptions()->create([
                'plan_id' => $plan->id,
                'starts_at' => now(),
                'expires_at' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'payment_reference' => 'FEDA_' . Str::random(10),
                'payment_provider' => 'simulation'
            ]);

            // Réactivation automatique de la boutique
            $shop->update(['is_active' => true]);
            
            // Notification vendeur de succès
            $request->user()->notify(new \App\Notifications\SubscriptionStarted($subscription));

            // Notification Admins
            $admins = \App\Models\User::where('role', Role::Admin)->get();
            foreach($admins as $admin) {
               $admin->notify(new \App\Notifications\AdminSubscriptionAlert($shop, 'shop_activated', "Boutique réactivée (Paiement reçu)."));
            }

            if ($plan->slug === 'premium') {
                $shop->update(['is_verified' => true]);
            }

            return response()->json([
                'message' => 'Paiement simulé avec succès.',
                'is_verified' => $plan->slug === 'premium',
                'payment_url' => null
            ]);
        }
    }
}
