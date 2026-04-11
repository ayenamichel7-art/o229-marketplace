<?php

namespace App\Console\Commands;

use App\Enums\Role;
use App\Models\Shop;
use App\Models\User;
use App\Models\Subscription;
use App\Notifications\SubscriptionExpired;
use App\Notifications\SubscriptionExpiringSoon;
use App\Notifications\AdminSubscriptionAlert;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CheckExpiredSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifier et désactiver les boutiques dont l\'abonnement a expiré.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $admins = User::where('role', Role::Admin)->get();

        // 1. Désactiver les boutiques expirées
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->where('expires_at', '<', $today)
            ->with('shop.user')
            ->get();

        foreach ($expiredSubscriptions as $sub) {
            $sub->update(['status' => 'expired']);
            
            if ($sub->shop) {
                $sub->shop->update(['is_active' => false]);
                $sub->shop->user->notify(new SubscriptionExpired($sub));
                
                // Notifier les Admins
                foreach($admins as $admin) {
                   $admin->notify(new AdminSubscriptionAlert($sub->shop, 'shop_deactivated', "Boutique suspendue (Abonnement expiré)."));
                }

                $this->info("Boutique {$sub->shop->name} désactivée.");
            }
        }

        // 2. Notifier pour expiration imminente (dans 3 jours)
        $expiringSoon = Subscription::where('status', 'active')
            ->where('expires_at', '=', $today->copy()->addDays(3))
            ->with('shop.user')
            ->get();

        foreach ($expiringSoon as $sub) {
            if ($sub->shop && $sub->shop->user) {
                $sub->shop->user->notify(new SubscriptionExpiringSoon($sub));
                
                // Notifier les Admins
                foreach($admins as $admin) {
                   $admin->notify(new AdminSubscriptionAlert($sub->shop, 'shop_expiring', "Expiration dans 3 jours."));
                }

                $this->info("Notification envoyée à {$sub->shop->name} (Expire dans 3 jours).");
            }
        }

        return Command::SUCCESS;
    }
}
