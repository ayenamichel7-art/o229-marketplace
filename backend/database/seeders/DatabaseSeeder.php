<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use App\Models\SubscriptionPlan;
use App\Models\Category;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ─── Admin par défaut ──────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@o-229.com'],
            [
                'name' => 'Admin O-229',
                'password' => bcrypt('Admin@2024!Secure'),
                'role' => Role::Admin,
                'phone' => '+22960000000',
                'is_active' => true,
            ]
        );

        // ─── Plan d'abonnement Premium ─────────────────────
        SubscriptionPlan::firstOrCreate(
            ['slug' => 'premium'],
            [
                'name' => 'Premium',
                'price' => 15000,
                'currency' => 'XOF',
                'duration_days' => 30,
                'max_products' => 50,
                'features' => json_encode([
                    'Produits illimités (max 50)',
                    'Statistiques avancées',
                    'Insights IA personnalisés',
                    'Badge vérifié',
                    'Support prioritaire',
                ]),
            ]
        );

        SubscriptionPlan::firstOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter (Gratuit)',
                'price' => 0,
                'currency' => 'XOF',
                'duration_days' => 30,
                'max_products' => 5,
                'features' => json_encode([
                    'Jusqu\'à 5 produits',
                    'Statistiques de base',
                    'Support communautaire',
                ]),
            ]
        );

        // ─── Catégories de base ────────────────────────────
        $categories = [
            ['name' => 'Électronique', 'slug' => 'electronique', 'icon' => '📱'],
            ['name' => 'Mode & Vêtements', 'slug' => 'mode-vetements', 'icon' => '👗'],
            ['name' => 'Maison & Jardin', 'slug' => 'maison-jardin', 'icon' => '🏠'],
            ['name' => 'Auto & Moto', 'slug' => 'auto-moto', 'icon' => '🚗'],
            ['name' => 'Beauté & Santé', 'slug' => 'beaute-sante', 'icon' => '💄'],
            ['name' => 'Sport & Loisirs', 'slug' => 'sport-loisirs', 'icon' => '⚽'],
            ['name' => 'Alimentation', 'slug' => 'alimentation', 'icon' => '🍎'],
            ['name' => 'Services', 'slug' => 'services', 'icon' => '🔧'],
            ['name' => 'Immobilier', 'slug' => 'immobilier', 'icon' => '🏢'],
            ['name' => 'Emploi & Formation', 'slug' => 'emploi-formation', 'icon' => '📚'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }

        $this->command->info('✅ Seeder exécuté : Admin, Plans, Catégories créés.');
    }
}
