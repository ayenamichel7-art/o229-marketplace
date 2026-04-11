<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Perform instant search via Meilisearch / Scout
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q');
        $city = $request->input('city');
        $category = $request->input('category');

        if (empty($query)) {
            return response()->json(['data' => []]);
        }

        // Utilisation de Laravel Scout configuré avec Meilisearch (si indexé)
        // ou fallback natif si Meilisearch est HS pendant le développement
        try {
            $search = Product::search($query);
            
            // Si on utilise Meilisearch pour filtrer:
            if ($city && $city !== 'Toutes les villes') {
                $search->where('city', $city);
            }
            if ($category) {
                // Nécessite une configuration des `filterableAttributes` côté Meilisearch
                $search->where('category_id', $category);
            }

            $results = $search->take(15)->get();
            $results->load('shop', 'category');

            return response()->json([
                'data' => $results->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => $product->price,
                        'city' => $product->city,
                        'shop_name' => $product->shop ? $product->shop->name : null,
                        'primary_image' => $product->images->firstWhere('is_primary', true) 
                                           ?? $product->images->first(),
                    ];
                })
            ]);
        } catch (\Exception $e) {
            // Fallback DB standard si le serveur docker Meilisearch n'est pas encore prêt
            $searchTerm = '%' . $query . '%';
            $dbQuery = Product::where('status', 'active')
                ->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', $searchTerm)
                      ->orWhere('description', 'LIKE', $searchTerm);
                });
            
            if ($city && $city !== 'Toutes les villes') {
                $dbQuery->where('city', $city);
            }
            
            $results = $dbQuery->with(['shop', 'images'])->limit(15)->get();
            
            return response()->json([
                'data' => $results->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => $product->price,
                        'city' => $product->city,
                        'shop_name' => $product->shop ? $product->shop->name : null,
                        'primary_image' => $product->images->firstWhere('is_primary', true) 
                                           ?? $product->images->first(),
                    ];
                })
            ]);
        }
    }
}
