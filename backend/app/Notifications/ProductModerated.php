<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductModerated extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(protected Product $product)
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
        $status = $this->product->approval_status === 'approved' ? '✅ Approuvé' : '❌ Rejeté';
        $reason = $this->product->rejection_reason ? "\nMotif : {$this->product->rejection_reason}" : '';

        return "📦 *Modération Produit*\n\n"
             . "Produit : *{$this->product->name}*\n"
             . "Décision : {$status}{$reason}";
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $statusLabel = $this->product->approval_status === 'approved' ? 'approuvé' : 'rejeté';
        
        $message = (new MailMessage)
                    ->subject("Mise à jour de modération : {$this->product->name}")
                    ->line("Votre produit '{$this->product->name}' a été {$statusLabel} par notre équipe de modération.");

        if ($this->product->approval_status === 'rejected') {
            $message->line("Motif du rejet : {$this->product->rejection_reason}")
                    ->action('Modifier le produit', config('app.frontend_url') . '/vendor/products/' . $this->product->id);
        } else {
            $message->action('Voir le produit', config('app.frontend_url') . '/products/' . $this->product->slug);
        }

        return $message->line('Merci d\'utiliser O-229 !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'status' => $this->product->approval_status,
            'reason' => $this->product->rejection_reason,
            'message' => "Votre produit '{$this->product->name}' a été " . ($this->product->approval_status === 'approved' ? 'approuvé' : 'rejeté') . ".",
        ];
    }
}
