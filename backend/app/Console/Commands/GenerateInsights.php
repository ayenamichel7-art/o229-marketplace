<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\InsightGeneratorService;
use Illuminate\Console\Command;

class GenerateInsights extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'insights:generate';

    /**
     * The console command description.
     */
    protected $description = 'Analyse product performance and generate vendor insights';

    /**
     * Execute the console command.
     */
    public function handle(InsightGeneratorService $insightGenerator)
    {
        $this->info('Starting insight generation...');

        // In production, we'd chunk this to handle thousands of products
        Product::active()->chunk(200, function ($products) use ($insightGenerator) {
            foreach ($products as $product) {
                $insightGenerator->generateForProduct($product);
            }
        });

        $this->info('Insights generated successfully.');
    }
}
