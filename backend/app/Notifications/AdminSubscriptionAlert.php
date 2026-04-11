<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminSubscriptionAlert extends Notification
{
    use Queueable;

    protected $shop;
    protected $type;
    protected $message;

    public function __construct(Shop $shop, string $type, string $message)
    {
        $this->shop = $shop;
        $this->type = $type;
        $this->message = $message;
    }

    public function via(object $notifiable): array
    {
        return ['database', \App\Channels\TelegramChannel::class];
    }

    public function toTelegram(object $notifiable): string
    {
        return "🏪 *Alerte Boutique ({$this->type})*\n\n"
             . "Boutique : *{$this->shop->name}*\n"
             . "Message : {$this->message}";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Alerte Boutique',
            'shop_id' => $this->shop->id,
            'shop_name' => $this->shop->name,
            'message' => "{$this->shop->name} : {$this->message}",
            'type' => $this->type, // shop_deactivated, shop_activated, shop_expiring
            'action_url' => '/admin/vendors',
            'icon' => $this->getIcon(),
        ];
    }

    protected function getIcon(): string
    {
        return match ($this->type) {
            'shop_deactivated' => 'UserMinus',
            'shop_activated' => 'UserCheck',
            'shop_expiring' => 'Clock',
            default => 'Bell',
        };
    }
}
