<?php

namespace App\Channels;

use App\Services\SystemHealthService;
use Illuminate\Notifications\Notification;

class TelegramChannel
{
    public function __construct(
        protected SystemHealthService $systemHealth
    ) {}

    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toTelegram')) {
            return;
        }

        $message = $notification->toTelegram($notifiable);

        if ($message) {
            $this->systemHealth->sendTestMessage($message);
        }
    }
}
