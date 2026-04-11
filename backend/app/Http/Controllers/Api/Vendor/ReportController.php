<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Analytics;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    /**
     * Generate a professional PDF performance report for the vendor.
     */
    public function download(Request $request)
    {
        $shop = $request->user()->shop;

        if (!$shop) {
            return response()->json(['message' => 'Shop not found.'], 404);
        }

        $now = Carbon::now();
        $start = $now->copy()->subDays(30);

        // Fetch Stats
        $stats = Analytics::where('shop_id', $shop->id)
            ->where('date', '>=', $start)
            ->selectRaw('DATE(date) as day, SUM(views) as views, SUM(whatsapp_clicks) as leads')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $totals = [
            'views' => $stats->sum('views'),
            'leads' => $stats->sum('leads'),
            'conv' => $stats->sum('views') > 0 ? round(($stats->sum('leads') / $stats->sum('views')) * 100, 2) : 0
        ];

        $data = [
            'shop' => $shop,
            'stats' => $stats,
            'totals' => $totals,
            'period' => '30 derniers jours',
            'date' => $now->format('d/m/Y'),
        ];

        // Generate PDF using a custom blade view
        $pdf = Pdf::loadView('reports.vendor_stats', $data);

        return $pdf->download("Rapport_Performance_{$shop->slug}.pdf");
    }
}
