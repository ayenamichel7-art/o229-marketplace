<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Meilisearch\Client;

class SyncMeilisearchSettings extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'scout:sync-settings';

    /**
     * The console command description.
     */
    protected $description = 'Configure les filtres et les tris pour l\'index Meilisearch des produits.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info("🔄 Démarrage de la configuration de Meilisearch...");

        $host = config('scout.meilisearch.host', 'http://meilisearch:7700');
        $key = config('scout.meilisearch.key');

        $client = new Client($host, $key);
        $indexName = config('scout.prefix') . 'products';

        try {
            $index = $client->index($indexName);

            // 1. Définir les attributs filtrables (Crucial pour le ProductController)
            $this->comment("Étape 1 : Configuration des filterableAttributes...");
            $index->updateFilterableAttributes([
                'status',
                'approval_status',
                'category_id',
                'shop_id',
                'city',
                'price'
            ]);

            // 2. Définir les attributs triables
            $this->comment("Étape 2 : Configuration des sortableAttributes...");
            $index->updateSortableAttributes([
                'created_at',
                'price',
                'views_count'
            ]);

            // 3. Définir les règles de classement (Ranking Rules)
            $this->comment("Étape 3 : Configuration des rankingRules...");
            $index->updateRankingRules([
                'words',
                'typo',
                'proximity',
                'attribute',
                'sort',
                'views_count:desc', // On favorise les produits populaires
                'exactness'
            ]);

            $this->info("✅ Meilisearch est maintenant configuré correctement pour O-229 !");
            
        } catch (\Exception $e) {
            $this->error("Erreur Meilisearch : " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
