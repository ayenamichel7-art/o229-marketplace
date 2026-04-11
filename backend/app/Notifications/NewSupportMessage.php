<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\TelegramChannel;

class NewSupportMessage extends Notification
{
    use Queueable;

    public function __construct(
        protected Message $message
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', TelegramChannel::class];
    }

    public function toTelegram(object $notifiable): string
    {
        $senderName = $this->message->sender->name ?? 'Inconnu';

        return "💬 *Nouveau Message Support*\n\n"
             . "De : *{$senderName}*\n"
             . "Message : " . substr($this->message->content, 0, 200) . "\n\n"
             . "Répondez depuis l'admin panel.";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Message Support',
            'message' => "Nouveau message de {$this->message->sender->name}: " . substr($this->message->content, 0, 100),
            'conversation_id' => $this->message->conversation_id,
            'action_url' => '/admin/support',
            'icon' => 'MessageCircle',
        ];
    }
}
