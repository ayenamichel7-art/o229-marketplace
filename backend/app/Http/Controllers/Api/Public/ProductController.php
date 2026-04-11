<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ViewTrackerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ViewTrackerService $viewTracker
    ) {}
    /**
     * List products with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $hasSearch = $request->filled('q');
        
        // If there's a search term, use Laravel Scout (Meilisearch)
        if ($hasSearch) {
            try {
                // Note: Scout search queries are sometimes tricky to combine with complex Eloquent with() relations unless handled post-search.
                // In a production app, the Meilisearch document would include all necessary data (shop, image, etc.)
                $builder = Product::search($request->q);
                
                // Filter by Active + Approved status in Meilisearch
                $builder->where('status', 'active');
                $builder->where('approval_status', 'approved');
                
                if ($request->has('category_id')) {
                    $builder->where('category_id', $request->category_id);
                }
                
                // Meilisearch Pagination
                $products = $builder->paginate($request->input('per_page', 20));
                // Eager load relations for the scout models
                $products->load(['shop', 'category', 'primaryImage']);
                
                return response()->json(
                    ProductResource::collection($products)->response()->getData(true)
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Meilisearch fallback triggered in ProductController: ' . $e->getMessage());
                // If Meilisearch fails, we continue and use the standard Eloquent query below
                // We add the search condition to the standard query
                $searchTerm = '%' . $request->q . '%';
                $query = Product::with(['shop', 'category', 'primaryImage'])
                    ->active()
                    ->where(function ($q) use ($searchTerm) {
                        $q->where('name', 'LIKE', $searchTerm)
                          ->orWhere('description', 'LIKE', $searchTerm);
                    });
            }
        } else {
            // Standard Eloquent Query when no search text is provided
            $query = Product::with(['shop', 'category', 'primaryImage'])
                ->active();
        }

        // Spatial / Geolocation search
        if ($request->filled('lat') && $request->filled('lng')) {
            $radius = $request->input('radius', 10);
            $query->nearby($request->lat, $request->lng, $radius);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->inCategory($request->category_id);
        }

        // Filter by category slug
        if ($request->has('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        // Filter by city
        if ($request->has('city') && !$request->filled('lat')) {
            $query->inCity($request->city);
        }

        // Filter by price range
        if ($request->has('min_price') || $request->has('max_price')) {
            $query->inPriceRange($request->min_price, $request->max_price);
        }

        // Sorting
        $sortBy = $request->input('sort', 'created_at');
        // Geolocation typically implies order by distance which is automatically handled in the nearby scope
        $sortDir = $request->input('order', 'desc');
        $allowedSorts = ['created_at', 'price', 'views_count', 'name', 'distance'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $products = $query->paginate($request->input('per_page', 20));

        return response()->json(
            ProductResource::collection($products)->response()->getData(true)
        );
    }

    /**
     * Show a single product by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['shop', 'category', 'images', 'primaryImage'])
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        // Increment view count via Redis Buffer
        $this->viewTracker->incrementView($product);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Get similar products based on same category / city.
     */
    public function similar(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        // Optimisation Performance : Extraire jusqu'à 100 produits récents au lieu d'un full-scan ORDER BY RAND()
        $poolIds = Product::active()
            ->where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                    ->orWhere('city', $product->city);
            })
            ->latest('id')
            ->limit(100)
            ->pluck('id');

        $randomIds = $poolIds->random(min(8, $poolIds->count()));

        $similar = Product::with(['shop', 'primaryImage'])
            ->whereIn('id', $randomIds)
            ->get();

        return response()->json([
            'data' => ProductResource::collection($similar),
        ]);
    }

    /**
     * Get products by city.
     */
    public function byCity(string $city): JsonResponse
    {
        $products = Product::with(['shop', 'primaryImage'])
            ->active()
            ->inCity($city)
            ->latest()
            ->paginate(20);

        return response()->json(
            ProductResource::collection($products)->response()->getData(true)
        );
    }
}
