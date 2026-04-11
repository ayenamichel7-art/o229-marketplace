<?php

namespace App\Console\Commands;

use App\Services\ViewTrackerService;
use Illuminate\Console\Command;

class SyncProductViews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:sync-views';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync product views from Redis buffer to Database';

    /**
     * Execute the console command.
     */
    public function handle(ViewTrackerService $viewTracker): void
    {
        $this->info('Starting sync of product views from Redis...');
        
        $count = $viewTracker->syncToDatabase();
        
        $this->info("Successfully synced views for {$count} products.");
    }
}
