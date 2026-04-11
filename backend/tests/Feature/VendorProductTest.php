<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VendorProductTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that an unverified vendor cannot create a product.
     */
    public function test_unverified_vendor_cannot_create_product(): void
    {
        $user = User::factory()->create(['role' => 'vendor']);
        $shop = Shop::factory()->create(['user_id' => $user->id, 'is_verified' => false]);
        $category = Category::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/vendor/products', [
            'category_id' => $category->id,
            'name' => 'Produit Test',
            'description' => 'Description de test',
            'price' => 5000,
            'city' => 'Cotonou',
        ]);

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Votre boutique doit être vérifiée pour effectuer cette action.']);
    }

    /**
     * Test that a verified vendor can create a product.
     */
    public function test_verified_vendor_can_create_product(): void
    {
        $user = User::factory()->create(['role' => 'vendor']);
        $shop = Shop::factory()->create(['user_id' => $user->id, 'is_verified' => true]);
        $category = Category::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/vendor/products', [
            'category_id' => $category->id,
            'name' => 'Produit Premium',
            'description' => 'Description premium',
            'price' => 15000,
            'city' => 'Porto-Novo',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', [
            'name' => 'Produit Premium',
            'shop_id' => $shop->id,
            'approval_status' => 'pending'
        ]);
    }
}
