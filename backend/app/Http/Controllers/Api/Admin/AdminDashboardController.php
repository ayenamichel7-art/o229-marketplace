<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Models\WhatsAppLead;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    /**
     * Get global platform KPIs for Admins
     */
    public function index(): JsonResponse
    {
        // Marketplace overall KPIs
        $totalUsers = User::count();
        $totalVendors = User::where('role', Role::Vendor)->count();
        $totalShops = Shop::count();
        $totalProducts = Product::count();
        $totalLeads = WhatsAppLead::count();

        // Pending verifications
        $pendingShops = Shop::where('is_verified', false)->with('user')->get();

        return response()->json([
            'kpis' => [
                'total_users' => $totalUsers,
                'total_vendors' => $totalVendors,
                'total_shops' => $totalShops,
                'total_products' => $totalProducts,
                'total_leads' => $totalLeads,
            ],
            'pending_verifications' => $pendingShops->map(fn($sh) => [
                'id' => $sh->id,
                'name' => $sh->name,
                'vendor_name' => $sh->user->name ?? 'Inconnu',
                'created_at' => $sh->created_at->toISOString(),
                'kyc_document' => $sh->id_document_path ? asset('storage/' . $sh->id_document_path) : null,
            ])
        ]);
    }
}
