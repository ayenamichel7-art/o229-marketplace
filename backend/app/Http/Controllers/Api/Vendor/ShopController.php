<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShopRequest;
use App\Http\Requests\UpdateShopRequest;
use App\Http\Resources\ShopResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ShopController extends Controller
{
    /**
     * Génère un slug unique en 1 seule requête SQL (Évite le N+1 db hit).
     */
    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;

        $query = \App\Models\Shop::where('slug', 'LIKE', "{$originalSlug}%");
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }
        
        $existingSlugs = $query->pluck('slug')->toArray();

        if (in_array($slug, $existingSlugs)) {
            $counter = 1;
            while (in_array($originalSlug . '-' . $counter, $existingSlugs)) {
                $counter++;
            }
            $slug = $originalSlug . '-' . $counter;
        }

        return $slug;
    }
    /**
     * Get the vendor's shop.
     */
    public function show(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;

        if (!$shop) {
            return response()->json([
                'message' => 'Vous n\'avez pas encore de boutique.',
                'data' => null,
            ]);
        }

        $shop->loadCount('products');

        return response()->json([
            'data' => new ShopResource($shop),
        ]);
    }

    /**
     * Create a new shop for the vendor.
     */
    public function store(StoreShopRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->shop) {
            return response()->json([
                'message' => 'Vous avez déjà une boutique.',
            ], 400);
        }

        $slug = $this->generateUniqueSlug($request->name);

        $data = [
            ...$request->validated(),
            'user_id' => $user->id,
            'slug' => $slug,
        ];

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('shops/logos');
        }

        // Handle banner upload
        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('shops/banners');
        }

        $shop = \App\Models\Shop::create($data);

        return response()->json([
            'message' => 'Boutique créée avec succès.',
            'data' => new ShopResource($shop),
        ], 201);
    }

    /**
     * Update the vendor's shop.
     */
    public function update(UpdateShopRequest $request): JsonResponse
    {
        $shop = $request->user()->shop;

        if (!$shop) {
            return response()->json([
                'message' => 'Vous n\'avez pas de boutique.',
            ], 404);
        }

        $data = $request->validated();

        // Regenerate slug if name changed
        if (isset($data['name']) && $data['name'] !== $shop->name) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $shop->id);
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($shop->logo) {
                \Illuminate\Support\Facades\Storage::delete($shop->logo);
            }
            $data['logo'] = $request->file('logo')->store('shops/logos');
        }

        // Handle banner upload
        if ($request->hasFile('banner')) {
            if ($shop->banner) {
                \Illuminate\Support\Facades\Storage::delete($shop->banner);
            }
            $data['banner'] = $request->file('banner')->store('shops/banners');
        }

        $shop->update($data);

        return response()->json([
            'message' => 'Boutique mise à jour.',
            'data' => new ShopResource($shop),
        ]);
    }

    /**
     * Upload KYC Document (ID Card)
     */
    public function uploadKyc(Request $request): JsonResponse
    {
        $request->validate([
            'id_document' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $shop = $request->user()->shop;

        if (!$shop) {
            return response()->json(['message' => 'Boutique introuvable.'], 404);
        }

        // Delete old document if exists
        if ($shop->id_document_path) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($shop->id_document_path);
        }

        $path = $request->file('id_document')->store('shops/kyc', 'local');

        // Application du Watermark de Sécurité O-229
        try {
            app(\App\Services\KycWatermarkingService::class)->applyWatermark($path, 'local');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('KYC Watermarking failed: ' . $e->getMessage());
        }
        
        $shop->id_document_path = $path;
        $shop->save();

        return response()->json([
            'message' => 'Document de vérification (KYC) envoyé avec succès. Un administrateur le vérifiera sous peu.',
            'has_kyc_document' => true,
        ]);
    }
}
