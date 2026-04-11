<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\SubscriptionPlan;

class Shop extends Model
{
    use HasFactory;

    /**
     * Boot the model and add logic for new shops.
     */
    protected static function booted()
    {
        static::created(function ($shop) {
            $plan = SubscriptionPlan::where('slug', 'premium')->first();
            if ($plan) {
                $shop->subscriptions()->create([
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'is_trial' => true,
                    'starts_at' => now(),
                    'expires_at' => now()->addDays(30),
                ]);
            }
        });
    }

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'logo',
        'banner',
        'whatsapp_number',
        'city',
        'latitude',
        'longitude',
        'is_verified',
        'is_active',
        'id_document_path',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    // ─── Relationships ──────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where('expires_at', '>=', now())
            ->latestOfMany();
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
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

    public function insights(): HasMany
    {
        return $this->hasMany(Insight::class);
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }

    // ─── Scopes ─────────────────────────────────────────

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    /**
     * Scope a query to find shops within a given radius (in km) from a lat/lng using Haversine formula.
     */
    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        /*
         * Haversine formula:
         * 6371 is the radius of the earth in km.
         */
        $haversine = "(6371 * acos(cos(radians(?))
                        * cos(radians(latitude))
                        * cos(radians(longitude) - radians(?))
                        + sin(radians(?))
                        * sin(radians(latitude))))";

        return $query->selectRaw("*, {$haversine} AS distance", [$latitude, $longitude, $latitude])
                     ->whereRaw("{$haversine} < ?", [$latitude, $longitude, $latitude, $radius])
                     ->orderBy('distance');
    }

    // ─── Helpers ────────────────────────────────────────

    public function isPremium(): bool
    {
        return $this->subscription !== null;
    }
}
