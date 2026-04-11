<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ShopFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();
        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'whatsapp_number' => fake()->phoneNumber(),
            'city' => fake()->city(),
            'is_verified' => fake()->boolean(20),
            'is_active' => true,
        ];
    }
}
