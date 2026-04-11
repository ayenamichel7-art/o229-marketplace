<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountStatusUpdated extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(protected User $user)
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
        $status = $this->user->is_active ? '✅ Activé' : '❌ Désactivé';
        $reason = $this->user->rejection_reason ? "\nMotif : {$this->user->rejection_reason}" : '';

        return "👤 *Mise à jour Compte Utilisateur*\n\n"
             . "Utilisateur : *{$this->user->name}*\n"
             . "Email : {$this->user->email}\n"
             . "Statut : {$status}{$reason}";
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $statusLabel = $this->user->is_active ? 'activé' : 'désactivé';
        
        $message = (new MailMessage)
                    ->subject("Mise à jour de votre compte : O-229")
                    ->line("Le statut de votre compte sur O-229 Marketplace a été mis à jour.");

        if ($this->user->is_active) {
            $message->line("Votre compte est désormais actif. Vous pouvez vous connecter et profiter de toutes les fonctionnalités.")
                    ->action('Se connecter', config('app.frontend_url') . '/login');
        } else {
            $message->line("Votre compte a été désactivé par l'administration.");
            if ($this->user->rejection_reason) {
                $message->line("Motif : " . $this->user->rejection_reason);
            }
        }

        return $message->line('Merci de votre confiance !');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'user_id' => $this->user->id,
            'is_active' => $this->user->is_active,
            'reason' => $this->user->rejection_reason,
            'message' => "Votre compte a été " . ($this->user->is_active ? 'activé' : 'désactivé') . ".",
        ];
    }
}
