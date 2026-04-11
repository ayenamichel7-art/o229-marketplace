<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Display a listing of coupons for the shop.
     */
    public function index(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;
        if (!$shop) return response()->json(['message' => 'Boutique introuvable.'], 404);

        $coupons = $shop->coupons()->latest()->get();
        return response()->json($coupons);
    }

    /**
     * Store a newly created coupon.
     */
    public function store(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;
        if (!$shop) return response()->json(['message' => 'Boutique introuvable.'], 404);

        $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $coupon = $shop->coupons()->create($request->all());

        return response()->json([
            'message' => 'Coupon créé avec succès.',
            'data' => $coupon
        ], 201);
    }

    /**
     * Delete the coupon.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $shop = $request->user()->shop;
        $coupon = Coupon::where('shop_id', $shop->id)->findOrFail($id);
        
        $coupon->delete();

        return response()->json(['message' => 'Coupon supprimé.']);
    }
}
