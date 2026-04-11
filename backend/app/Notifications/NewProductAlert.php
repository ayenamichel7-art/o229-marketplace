<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\TelegramChannel;

class NewProductAlert extends Notification
{
    use Queueable;

    public function __construct(
        protected Product $product
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', TelegramChannel::class];
    }

    public function toTelegram(object $notifiable): string
    {
        return "🆕 *Nouveau Produit à Modérer*\n\n"
             . "Nom : *{$this->product->name}*\n"
             . "Boutique : *{$this->product->shop->name}*\n"
             . "Prix : {$this->product->price} FCFA\n\n"
             . "Lien Admin : o-229.com/admin/products";
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nouveau Produit',
            'message' => "Un nouveau produit '{$this->product->name}' attend votre validation.",
            'product_id' => $this->product->id,
            'action_url' => "/admin/products",
            'icon' => 'Package',
        ];
    }
}
