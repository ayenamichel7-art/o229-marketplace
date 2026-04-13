<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\SystemHealthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ErrorLogController extends Controller
{
    public function log(Request $request, SystemHealthService $healthService): JsonResponse
    {
        $request->validate([
            'message' => 'required|string',
            'stack' => 'nullable|string',
            'url' => 'nullable|string',
            'component' => 'nullable|string',
        ]);

        // Create a fake exception to reuse the existing notification service
        $sanitizedMessage = str_replace(["\r", "\n", "\t"], ' ', $request->message);
        $exception = new \Exception($sanitizedMessage);
        
        // Log it locally too — use structured context to prevent log injection
        \Log::warning("Frontend Error reported", [
            'message' => $sanitizedMessage,
            'stack' => $request->stack ? mb_substr($request->stack, 0, 2000) : null,
            'url' => $request->url ? filter_var($request->url, FILTER_SANITIZE_URL) : null,
            'component' => $request->component ? mb_substr($request->component, 0, 100) : null,
            'ip' => $request->ip()
        ]);

        // Notify Discord
        $healthService->notifyError($exception, 'Frontend (' . mb_substr(($request->component ?? 'Generic'), 0, 50) . ')');

        return response()->json(['status' => 'logged']);
    }
}
