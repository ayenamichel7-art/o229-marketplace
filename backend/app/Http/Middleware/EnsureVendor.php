<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVendor
{
    /**
     * Ensure the authenticated user is a vendor.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isVendor()) {
            return response()->json([
                'message' => 'Accès réservé aux vendeurs.',
            ], 403);
        }

        return $next($request);
    }
}
