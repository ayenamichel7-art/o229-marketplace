<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\TelegramChannel;

class NewUserRegistered extends Notification
{
    use Queueable;

    public function __construct(
        protected User $newUser
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', TelegramChannel::class];
    }

    public function toTelegram(object $notifiable): string
    {
        $roleLabel = $this->newUser->role->value === 'vendor' ? '🏪 Vendeur' : '👤 Client';

        return "🆕 *Nouvelle Inscription*\n\n"
             . "Nom : *{$this->newUser->name}*\n"
             . "Email : {$this->newUser->email}\n"
             . "Type : {$roleLabel}\n\n"
             . "En attente de votre validation.";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nouvel Utilisateur',
            'message' => "{$this->newUser->name} ({$this->newUser->email}) souhaite rejoindre la plateforme.",
            'user_id' => $this->newUser->id,
            'role' => $this->newUser->role,
            'action_url' => '/admin/users',
            'icon' => 'UserPlus',
        ];
    }
}
