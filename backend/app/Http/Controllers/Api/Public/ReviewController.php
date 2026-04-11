<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific shop
     */
    public function shopReviews($slug): JsonResponse
    {
        $shop = Shop::where('slug', $slug)->firstOrFail();
        
        $reviews = Review::with('user')
            ->where('shop_id', $shop->id)
            ->where('is_approved', true) // Only approved reviews
            ->orderBy('created_at', 'desc')
            ->get();

        $averageRating = $reviews->avg('rating') ?: 0;
        $totalReviews = $reviews->count();

        return response()->json([
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $totalReviews,
            'reviews' => $reviews->map(function ($r) {
                return [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'user_name' => $r->user->name ?? 'Anonyme',
                    'created_at' => $r->created_at->diffForHumans(),
                ];
            })
        ]);
    }

    /**
     * Create a new review for a shop
     */
    public function storeShopReview(Request $request, $slug): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000'
        ]);

        $shop = Shop::where('slug', $slug)->firstOrFail();

        $review = new Review();
        $review->user_id = auth()->id(); // Requires Sanctum Auth middleware on route
        $review->shop_id = $shop->id;
        $review->rating = $request->rating;
        $review->comment = $request->comment;
        // En vrai production, ça pourrait être false pour modération :
        $review->is_approved = true; 
        $review->save();

        return response()->json(['message' => 'Avis publié avec succès !', 'review' => $review], 201);
    }
}
