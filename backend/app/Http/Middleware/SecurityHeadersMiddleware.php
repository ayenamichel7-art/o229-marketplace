<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // 1. Empêcher l'affichage dans une iframe (Anti-Clickjacking)
        $response->headers->set('X-Frame-Options', 'DENY');

        // 2. Empêcher le navigateur de deviner le type de contenu (Anti-Sniffing)
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // 3. Activer la protection XSS intégrée au navigateur
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // 4. Content Security Policy (CSP) - On n'autorise que ce qui est nécessaire
        // Note: À adapter si vous utilisez des scripts externes massifs
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.fedapay.com;");

        // 5. Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // 6. Permissions Policy
        $response->headers->set('Permissions-Policy', 'geolocation=(), megaphone=(), camera=(), microphone=()');

        // 7. HSTS (Uniquement en production et HTTPS)
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}
