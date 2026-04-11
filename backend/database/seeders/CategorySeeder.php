<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Électronique',
                'icon' => 'Smartphone',
                'description' => 'Téléphones, ordinateurs, et accessoires.',
                'children' => [
                    ['name' => 'Téléphones & Tablettes'],
                    ['name' => 'Ordinateurs'],
                    ['name' => 'Audio'],
                    ['name' => 'Accessoires'],
                ]
            ],
            [
                'name' => 'Mode',
                'icon' => 'ShoppingBag',
                'description' => 'Vêtements, chaussures, et sacs.',
                'children' => [
                    ['name' => 'Homme'],
                    ['name' => 'Femme'],
                    ['name' => 'Enfants'],
                    ['name' => 'Montres & Bijoux'],
                ]
            ],
            [
                'name' => 'Maison & Bureau',
                'icon' => 'Home',
                'description' => 'Meubles, décoration, et fournitures.',
                'children' => [
                    ['name' => 'Cuisine'],
                    ['name' => 'Meubles'],
                    ['name' => 'Électroménager'],
                ]
            ],
            [
                'name' => 'Véhicules',
                'icon' => 'Car',
                'description' => 'Voitures, motos, et pièces détachées.',
                'children' => [
                    ['name' => 'Voitures'],
                    ['name' => 'Motos & Scooters'],
                    ['name' => 'Pièces & Accessoires'],
                ]
            ],
            [
                'name' => 'Immobilier',
                'icon' => 'Building',
                'description' => 'Vente et location de maisons et terrains.',
                'children' => [
                    ['name' => 'Vente de terrains'],
                    ['name' => 'Location d\'appartements'],
                    ['name' => 'Vente de maisons'],
                ]
            ],
        ];

        foreach ($categories as $catData) {
            $parent = Category::create([
                'name' => $catData['name'],
                'slug' => Str::slug($catData['name']),
                'icon' => $catData['icon'],
                'description' => $catData['description'],
            ]);

            if (isset($catData['children'])) {
                foreach ($catData['children'] as $child) {
                    Category::create([
                        'parent_id' => $parent->id,
                        'name' => $child['name'],
                        'slug' => Str::slug($child['name']),
                    ]);
                }
            }
        }
    }
}
