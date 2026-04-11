<?php

namespace App\Services;

use App\Models\Analytics;
use App\Models\Product;
use Illuminate\Support\Facades\Redis;

class ViewTrackerService
{
    private const VIEWS_KEY = 'product_views_buffer';

    /**
     * Increment the view count for a product in Redis.
     */
    public function incrementView(Product $product): void
    {
        Redis::hincrby(self::VIEWS_KEY, $product->id, 1);
    }

    /**
     * Sync all buffered views from Redis to the Database.
     * Strategy: Atomic lock + Atomic rename of the buffer key.
     */
    public function syncToDatabase(): int
    {
        return \Illuminate\Support\Facades\Cache::lock('sync_product_views', 300)->get(function () {
            $tempKey = self::VIEWS_KEY . '_syncing_' . time();
            
            // If the buffer doesn't exist, exit early
            if (!Redis::exists(self::VIEWS_KEY)) {
                return 0;
            }

            // Atomically rename the key so new increments go to a fresh key
            Redis::rename(self::VIEWS_KEY, $tempKey);
            
            $views = Redis::hgetall($tempKey);

            if (empty($views)) {
                return 0;
            }

            $syncedCount = 0;
            $today = now()->toDateString();

            // Pre-load all products and shops in a single query to avoid N+1
            $productIds = array_keys($views);
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            foreach ($views as $productId => $count) {
                $intCount = (int) $count;

                // 1. Update the product's global views_count
                Product::where('id', $productId)->increment('views_count', $intCount);

                // 2. Also sync to the Analytics table for vendor dashboard charts
                $product = $products->get($productId);
                if ($product && $product->shop_id) {
                    Analytics::updateOrCreate(
                        [
                            'shop_id' => $product->shop_id,
                            'product_id' => $product->id,
                            'date' => $today,
                        ],
                        []
                    )->increment('views', $intCount);
                }

                $syncedCount++;
            }

            // Clear the temporary synced buffer
            Redis::del($tempKey);

            return $syncedCount;
        }) ?? 0;
    }
}
