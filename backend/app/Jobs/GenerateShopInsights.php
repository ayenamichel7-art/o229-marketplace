<?php

namespace App\Jobs;

use App\Models\Shop;
use App\Services\InsightGeneratorService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateShopInsights implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly int $shopId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(InsightGeneratorService $insightsService): void
    {
        $shop = Shop::find($this->shopId);
        
        if (!$shop) {
            return;
        }

        $productsToAnalyze = $shop->products()
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->limit(5)
            ->get();

        foreach ($productsToAnalyze as $product) {
            $insightsService->generateForProduct($product);
        }
    }
}
