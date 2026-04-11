<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SubscriptionStarted extends Notification
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
        return "💰 *Nouvel Abonnement Activé*\n\n"
             . "Vendeur : *{$notifiable->name}*\n"
             . "Expire le : *" . $this->subscription->expires_at->format('d/m/Y') . "*\n"
             . "Nouveau revenu récurrent !";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Abonnement Activé',
            'message' => "Félicitations ! Votre abonnement est actif jusqu'au " . $this->subscription->expires_at->format('d/m/Y') . ".",
            'type' => 'subscription_started',
            'action_url' => '/dashboard/pricing',
            'icon' => 'CheckCircle2'
        ];
    }
}
