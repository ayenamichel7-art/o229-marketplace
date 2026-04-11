<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Laravel\Scout\Searchable;

class Product extends Model
{
    use HasFactory, Searchable;

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::deleting(function (Product $product) {
            // Delete all associated images from storage
            foreach ($product->images as $image) {
                \Illuminate\Support\Facades\Storage::delete($image->path);
            }
        });
    }

    protected $fillable = [
        'shop_id',
        'category_id',
        'name',
        'slug',
        'description',
        'seo_description',
        'price',
        'currency',
        'city',
        'latitude',
        'longitude',
        'status',
        'views_count',
        'whatsapp_clicks_count',
        'manage_stock',
        'stock_quantity',
        'in_stock',
        'approval_status',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'views_count' => 'integer',
            'whatsapp_clicks_count' => 'integer',
            'manage_stock' => 'boolean',
            'stock_quantity' => 'integer',
            'in_stock' => 'boolean',
        ];
    }

    // ─── Relationships ──────────────────────────────────

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(Analytics::class);
    }

    public function whatsappLeads(): HasMany
    {
        return $this->hasMany(WhatsAppLead::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // ─── Scopes ─────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where('approval_status', 'approved')
                     ->whereHas('shop', function ($q) {
                         $q->where('is_active', true);
                     });
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    public function scopeInCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeInPriceRange($query, ?float $min, ?float $max)
    {
        if ($min !== null) {
            $query->where('price', '>=', $min);
        }
        if ($max !== null) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    // ─── Helpers ────────────────────────────────────────

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 0, ',', ' ') . ' ' . $this->currency;
    }

    public function getConversionRateAttribute(): float
    {
        if ($this->views_count === 0) return 0;
        return round(($this->whatsapp_clicks_count / $this->views_count) * 100, 2);
    }

    /**
     * Get the indexable data array for the model (Meilisearch).
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'city' => $this->city,
            'status' => $this->status,
            'approval_status' => $this->approval_status,
            'category_id' => $this->category_id,
            'shop_id' => $this->shop_id,
            'views_count' => $this->views_count,
            '_geo' => [
                'lat' => (float) $this->latitude,
                'lng' => (float) $this->longitude,
            ],
        ];
    }
    
    /**
     * Scope a query to find products within a given radius (in km) from a lat/lng using Haversine formula.
     */
    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        $haversine = "(6371 * acos(cos(radians(?))
                        * cos(radians(latitude))
                        * cos(radians(longitude) - radians(?))
                        + sin(radians(?))
                        * sin(radians(latitude))))";

        return $query->selectRaw("*, {$haversine} AS distance", [$latitude, $longitude, $latitude])
                     ->whereRaw("{$haversine} < ?", [$latitude, $longitude, $latitude, $radius])
                     ->orderBy('distance');
    }

    public function isAvailable(): bool
    {
        if (!$this->in_stock) return false;
        if ($this->manage_stock && $this->stock_quantity <= 0) return false;
        return true;
    }
}
