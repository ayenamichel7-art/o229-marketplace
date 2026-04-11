<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        SubscriptionPlan::create([
            'name' => 'Free',
            'slug' => 'free',
            'price' => 0,
            'duration_days' => 30,
            'max_products' => 5,
            'features' => [
                '5 produits maximum',
                'Analytics de base',
                'Support email',
            ],
        ]);

        SubscriptionPlan::create([
            'name' => 'Premium',
            'slug' => 'premium',
            'price' => 5000,
            'duration_days' => 30,
            'max_products' => 100, // or 0 for unlimited in logic
            'features' => [
                'Produits illimités',
                'Analytics avancées',
                'Insights AI',
                'Badge Vendeur Vérifié',
                'Support prioritaire',
                'Mise en avant des produits',
            ],
        ]);
    }
}
