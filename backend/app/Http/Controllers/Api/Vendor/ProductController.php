<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\User;
use App\Enums\Role;
use App\Notifications\NewProductAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * List the vendor's own products.
     */
    public function index(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;

        if (!$shop) {
            return response()->json([
                'message' => 'Vous devez d\'abord créer une boutique.',
            ], 400);
        }

        $products = $shop->products()
            ->with(['category', 'primaryImage', 'images'])
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json(
            ProductResource::collection($products)->response()->getData(true)
        );
    }

    /**
     * Create a new product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $shop = $request->user()->shop;

        if (!$shop) {
            return response()->json([
                'message' => 'Vous devez d\'abord créer une boutique.',
            ], 400);
        }

        // Check product limit
        $plan = $shop->subscription?->plan;
        $maxProducts = $plan ? $plan->max_products : 5;

        if ($maxProducts > 0 && $shop->products()->count() >= $maxProducts) {
            return response()->json([
                'message' => "Vous avez atteint la limite de {$maxProducts} produits. Passez au plan premium pour plus de produits.",
            ], 403);
        }

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $product = $shop->products()->create([
            ...$request->validated(),
            'slug' => $slug,
            'approval_status' => 'pending', // L'admin doit valider avant publication
            'city' => $request->input('city', $shop->city),
            'latitude' => $request->input('latitude', $shop->latitude),
            'longitude' => $request->input('longitude', $shop->longitude),
        ]);

        // Alerter les admins
        $admins = User::where('role', Role::Admin)->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewProductAlert($product));
        }

        return response()->json([
            'message' => 'Produit créé avec succès.',
            'data' => new ProductResource($product->load(['category', 'images'])),
        ], 201);
    }

    /**
     * Show a specific vendor product.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $product = $request->user()->shop
            ->products()
            ->with(['category', 'images'])
            ->findOrFail($id);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Update a product.
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = $request->user()->shop
            ->products()
            ->findOrFail($id);

        $data = $request->validated();

        // Regenerate slug if name changed
        if (isset($data['name']) && $data['name'] !== $product->name) {
            $slug = Str::slug($data['name']);
            $originalSlug = $slug;
            $counter = 1;

            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            $data['slug'] = $slug;
        }

        $data['approval_status'] = 'pending'; // Repasse en modération après modification
        $product->update($data);

        return response()->json([
            'message' => 'Produit mis à jour.',
            'data' => new ProductResource($product->load(['category', 'images'])),
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = $request->user()->shop
            ->products()
            ->findOrFail($id);

        $product->delete();

        return response()->json([
            'message' => 'Produit supprimé.',
        ]);
    }

    /**
     * Upload an image for a product.
     */
    public function uploadImage(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:2048'],
            'is_primary' => ['sometimes', 'boolean'],
        ]);

        $product = $request->user()->shop->products()->findOrFail($id);

        $path = $request->file('image')->store('products/images');

        // If this is the first image or marked as primary, set the flag
        $isPrimary = $request->boolean('is_primary') || $product->images()->count() === 0;

        // If it's primary, unset existing primary images
        if ($isPrimary) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'path' => $path,
            'is_primary' => $isPrimary,
            'sort_order' => $product->images()->max('sort_order') + 1,
        ]);

        return response()->json([
            'message' => 'Image ajoutée.',
            'data' => $image,
        ], 201);
    }

    /**
     * Delete an image.
     */
    public function deleteImage(Request $request, int $id, int $imageId): JsonResponse
    {
        $product = $request->user()->shop->products()->findOrFail($id);
        $image = $product->images()->findOrFail($imageId);

        // Remove the physical file from storage
        \Illuminate\Support\Facades\Storage::delete($image->path);

        $image->delete();
        
        return response()->json(['message' => 'Image supprimée.']);
    }
}

