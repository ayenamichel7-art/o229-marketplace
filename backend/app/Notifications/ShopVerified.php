<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShopVerified extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(protected Shop $shop)
    {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail', \App\Channels\TelegramChannel::class];
    }

    public function toTelegram(object $notifiable): string
    {
        $status = $this->shop->is_verified ? '✅ Vérifiée' : '⛔ Révoquée';

        return "🏪 *Vérification Boutique*\n\n"
             . "Boutique : *{$this->shop->name}*\n"
             . "Statut : {$status}";
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $statusLabel = $this->shop->is_verified ? 'vérifiée' : 'révoquée';
        
        $message = (new MailMessage)
                    ->subject("Statut de votre boutique : {$this->shop->name}")
                    ->line("Le statut de vérification de votre boutique '{$this->shop->name}' a été mis à jour.");

        if ($this->shop->is_verified) {
            $message->line("Félicitations ! Votre boutique est maintenant vérifiée. Vous avez désormais accès à toutes les fonctionnalités de vente.")
                    ->action('Accéder au tableau de bord', config('app.frontend_url') . '/vendor/dashboard');
        } else {
            $message->line("L'accès vérifié de votre boutique a été suspendu par un administrateur.")
                    ->line("Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.");
        }

        return $message->line('L\'équipe O-229.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'shop_id' => $this->shop->id,
            'shop_name' => $this->shop->name,
            'is_verified' => $this->shop->is_verified,
            'message' => "Le statut de vérification de votre boutique '{$this->shop->name}' a été " . ($this->shop->is_verified ? 'approuvé' : 'révoqué') . ".",
        ];
    }
}
