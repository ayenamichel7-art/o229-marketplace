<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVerifiedVendor
{
    /**
     * Ensure the authenticated vendor has a verified shop.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isVendor()) {
            return response()->json([
                'message' => 'Accès réservé aux vendeurs.',
            ], 403);
        }

        if (!$user->shop || !$user->shop->is_verified) {
            return response()->json([
                'message' => 'Votre boutique doit être vérifiée pour accéder à cette ressource.',
            ], 403);
        }

        return $next($request);
    }
}
