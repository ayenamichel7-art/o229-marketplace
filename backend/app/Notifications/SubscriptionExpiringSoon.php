<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SubscriptionExpiringSoon extends Notification
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
        return "⚠️ *Abonnement Expire Bientôt*\n\n"
             . "Vendeur : *{$notifiable->name}*\n"
             . "Expire dans : *3 jours*\n"
             . "Pensez au renouvellement !";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Échéance Imminente',
            'message' => "Votre abonnement expire dans 3 jours. Pensez à renouveler pour éviter toute interruption de service.",
            'type' => 'subscription_warning',
            'action_url' => '/dashboard/pricing',
            'icon' => 'Clock'
        ];
    }
}
