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
        $exception = new \Exception($request->message);
        
        // Log it locally too
        \Log::warning("Frontend Error: " . $request->message, [
            'stack' => $request->stack,
            'url' => $request->url,
            'component' => $request->component,
            'ip' => $request->ip()
        ]);

        // Notify Discord
        $healthService->notifyError($exception, 'Frontend (' . ($request->component ?? 'Generic') . ')');

        return response()->json(['status' => 'logged']);
    }
}
