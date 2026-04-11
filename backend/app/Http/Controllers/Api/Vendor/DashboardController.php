<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Analytics;
use App\Models\Insight;
use App\Models\Product;
use App\Jobs\GenerateShopInsights;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Get vendor KPI and charts (Professional Grade)
     */
    public function index(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;

        if (!$shop) {
            return response()->json([
                'message' => 'Vous devez créer une boutique pour voir vos statistiques.',
            ], 403);
        }

        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // ---------------------------------------------------------
        // 1. DATA: Current 30 days vs Previous 30 days
        // ---------------------------------------------------------
        $currentPeriod = Analytics::where('shop_id', $shop->id)
            ->where('date', '>=', $thirtyDaysAgo)
            ->where('date', '<=', $now)
            ->selectRaw('SUM(views) as total_views, SUM(whatsapp_clicks) as total_clicks')
            ->first();

        $previousPeriod = Analytics::where('shop_id', $shop->id)
            ->where('date', '>=', $sixtyDaysAgo)
            ->where('date', '<', $thirtyDaysAgo)
            ->selectRaw('SUM(views) as total_views, SUM(whatsapp_clicks) as total_clicks')
            ->first();

        // ---------------------------------------------------------
        // 2. COMPUTE METRICS
        // ---------------------------------------------------------
        $currViews = (int) ($currentPeriod->total_views ?? 0);
        $currLeads = (int) ($currentPeriod->total_clicks ?? 0);
        $currConv = $currViews > 0 ? round(($currLeads / $currViews) * 100, 2) : 0;

        $prevViews = (int) ($previousPeriod->total_views ?? 0);
        $prevLeads = (int) ($previousPeriod->total_clicks ?? 0);
        $prevConv = $prevViews > 0 ? round(($prevLeads / $prevViews) * 100, 2) : 0;

        // Overall product count
        $totalProducts = $shop->products()->count();

        // ---------------------------------------------------------
        // 3. CHART DATA (Daily Breakdown)
        // ---------------------------------------------------------
        $chartDataRaw = Analytics::where('shop_id', $shop->id)
            ->where('date', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(date) as date_label, SUM(views) as total_views, SUM(whatsapp_clicks) as total_clicks')
            ->groupBy('date_label')
            ->orderBy('date_label', 'asc')
            ->get();

        // ---------------------------------------------------------
        // 4. TOP PRODUCTS (Based on current period performance)
        // ---------------------------------------------------------
        $topProducts = Product::where('shop_id', $shop->id)
            ->with(['primaryImage', 'analytics' => function($query) use ($thirtyDaysAgo) {
                $query->where('date', '>=', $thirtyDaysAgo);
            }])
            ->active()
            ->orderBy('whatsapp_clicks_count', 'desc')
            ->limit(5)
            ->get();

        // ---------------------------------------------------------
        // 5. PERSONALIZED INSIGHTS
        // ---------------------------------------------------------
        // Personalized Insights — dispatch async to avoid blocking the API response
        GenerateShopInsights::dispatch($shop->id);

        $insights = Insight::where('shop_id', $shop->id)
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'kpis' => [
                'total_products' => [
                    'value' => $totalProducts,
                    'label' => 'Produits en ligne'
                ],
                'views' => [
                    'value' => $currViews,
                    'trend' => $this->calculateTrend($currViews, $prevViews),
                    'label' => 'Vues (30j)'
                ],
                'leads' => [
                    'value' => $currLeads,
                    'trend' => $this->calculateTrend($currLeads, $prevLeads),
                    'label' => 'Contacts WhatsApp (30j)'
                ],
                'conversion_rate' => [
                    'value' => $currConv,
                    'trend' => $this->calculateTrend($currConv, $prevConv, true),
                    'label' => 'Taux de Conversion (30j)'
                ],
            ],
            'chart_data' => $chartDataRaw,
            'top_products' => $topProducts->map(function ($p) {
                // Calculate real 30-day performace strictly from relation
                $recentViews = $p->analytics->sum('views');
                $recentLeads = $p->analytics->sum('whatsapp_clicks');
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'price' => $p->formatted_price,
                    // Show recent stats instead of all-time if possible
                    'views' => $recentViews > 0 ? $recentViews : $p->views_count,
                    'leads' => $recentLeads > 0 ? $recentLeads : $p->whatsapp_clicks_count,
                    'image' => $p->primaryImage ? $p->primaryImage->url : null,
                ];
            }),
            'insights' => $insights,
        ]);
    }

    /**
     * Calculate percentage trend between current and previous period
     */
    private function calculateTrend(float $current, float $previous, bool $isPercentageDiff = false): array
    {
        if ($previous == 0) {
            return [
                'type' => $current > 0 ? 'increase' : 'neutral',
                'value' => $current > 0 ? 100 : 0,
                'formatted' => $current > 0 ? '+100%' : '0%'
            ];
        }

        if ($isPercentageDiff) {
            // For rates (e.g. 5% to 6%), we show the absolute point difference (+1%) rather than relative difference
            $diff = $current - $previous;
        } else {
            // For nominal numbers (10 to 15 views), we show relative difference (+50%)
            $diff = (($current - $previous) / $previous) * 100;
        }
        
        $roundedDiff = round($diff, 1);

        return [
            'type' => $roundedDiff > 0 ? 'increase' : ($roundedDiff < 0 ? 'decrease' : 'neutral'),
            'value' => $roundedDiff,
            'formatted' => ($roundedDiff > 0 ? '+' : '') . $roundedDiff . '%'
        ];
    }
}
