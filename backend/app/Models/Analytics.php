<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Analytics extends Model
{
    protected $fillable = [
        'product_id',
        'shop_id',
        'views',
        'whatsapp_clicks',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'views' => 'integer',
            'whatsapp_clicks' => 'integer',
            'date' => 'date',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
