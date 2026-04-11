<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * List active shops.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Shop::withCount('products')
            ->active();

        // Filter by city
        if ($request->has('city')) {
            $query->inCity($request->city);
        }

        // Filter verified only
        if ($request->boolean('verified')) {
            $query->verified();
        }

        // Search by name
        if ($request->has('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        $shops = $query->latest()->paginate($request->input('per_page', 20));

        return response()->json(
            ShopResource::collection($shops)->response()->getData(true)
        );
    }

    /**
     * Show a single shop by slug with its products.
     */
    public function show(string $slug): JsonResponse
    {
        $shop = Shop::with(['products' => function ($query) {
            $query->active()
                ->with('primaryImage')
                ->latest()
                ->limit(20);
        }])
            ->withCount('products')
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        return response()->json([
            'data' => new ShopResource($shop),
        ]);
    }
}
