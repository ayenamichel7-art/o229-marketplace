<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * List all active categories with children.
     */
    public function index(): JsonResponse
    {
        $categories = Category::with('children')
            ->withCount('products')
            ->active()
            ->roots()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Show a category with its products.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $category = Category::with('children')
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        $products = $category->products()
            ->with(['shop', 'primaryImage'])
            ->active()
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'category' => new CategoryResource($category),
            'products' => ProductResource::collection($products)->response()->getData(true),
        ]);
    }
}
