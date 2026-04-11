<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Shop;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_can_create_product()
    {
        // 1. Créer un vendeur avec une boutique et un abonnement
        $user = User::factory()->create(['role' => 'vendor']);
        $shop = Shop::factory()->create(['user_id' => $user->id]);
        $shop->subscription()->create([
            'plan_id' => 1, // Supposons qu'un plan existe
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        $category = Category::factory()->create();

        // 2. Agir en tant que ce vendeur
        $response = $this->actingAs($user)
            ->postJson('/api/vendor/products', [
                'name' => 'Produit Test',
                'description' => 'Description de test',
                'price' => 1500,
                'category_id' => $category->id,
                'city' => 'Cotonou'
            ]);

        // 3. Vérifier la réponse
        $response->assertStatus(201)
            ->assertJsonPath('message', 'Produit créé avec succès.');
        
        $this->assertDatabaseHas('products', [
            'name' => 'Produit Test',
            'shop_id' => $shop->id,
            'approval_status' => 'pending'
        ]);
    }

    public function test_non_vendor_cannot_create_product()
    {
        $user = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($user)
            ->postJson('/api/vendor/products', [
                'name' => 'Produit Interdit',
                'price' => 1000
            ]);

        $response->assertStatus(403);
    }
}
