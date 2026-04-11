<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\TrackingService;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    protected $trackingService;

    public function __construct(TrackingService $trackingService)
    {
        $this->trackingService = $trackingService;
    }

    /**
     * Recevoir un événement de tracking du frontend et le relayer via CAPI.
     */
    public function track(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string',
            'event_source_url' => 'required|url',
            'data' => 'nullable|array',
        ]);

        $eventName = $validated['event_name'];
        $url = $validated['event_source_url'];
        $data = $validated['data'] ?? [];

        // Relai vers les plateformes (si IDs configurés)
        $this->trackingService->sendToMeta($eventName, $url, $data);
        $this->trackingService->sendToTikTok($eventName, $url, $data);

        return response()->json(['status' => 'success']);
    }
}
