<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(3, true);
        return [
            'shop_id' => Shop::factory(),
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(1000, 500000),
            'currency' => 'XOF',
            'city' => fake()->city(),
            'status' => 'active',
            'approval_status' => 'approved',
            'views_count' => fake()->numberBetween(0, 1000),
            'whatsapp_clicks_count' => fake()->numberBetween(0, 50),
        ];
    }
}
