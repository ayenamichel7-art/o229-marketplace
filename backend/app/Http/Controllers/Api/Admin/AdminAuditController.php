<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuditController extends Controller
{
    /**
     * Display a listing of the audit logs for administrators.
     */
    public function index(Request $request): JsonResponse
    {
        $action = $request->query('action');
        $ip = $request->query('ip');

        $query = AuditLog::with('user:id,name,email');

        if ($action) {
            $query->where('action', $action);
        }

        if ($ip) {
            $query->where('ip_address', $ip);
        }

        $logs = $query->latest()->paginate($request->query('per_page', 50));

        return response()->json($logs);
    }
}
