<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SubscriptionExpired extends Notification
{
    use Queueable;

    protected $subscription;

    public function __construct(Subscription $subscription)
    {
        $this->subscription = $subscription;
    }

    public function via(object $notifiable): array
    {
        return ['database', \App\Channels\TelegramChannel::class];
    }

    public function toTelegram(object $notifiable): string
    {
        return "🔴 *Abonnement Expiré*\n\n"
             . "Vendeur : *{$notifiable->name}*\n"
             . "La boutique a été désactivée automatiquement.\n"
             . "Action : Renouveler l'abonnement.";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Boutique Suspendue',
            'message' => "Votre abonnement a expiré. Votre boutique a été désactivée. Renouvelez votre forfait pour être à nouveau visible.",
            'type' => 'subscription_expired',
            'action_url' => '/dashboard/pricing',
            'icon' => 'AlertCircle'
        ];
    }
}
