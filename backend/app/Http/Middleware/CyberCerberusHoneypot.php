<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CyberCerberusHoneypot
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Liste des chemins "pièges" (Honeypots)
        $traps = [
            'wp-admin',
            'wp-login.php',
            '.env',
            'config.json',
            'phpmyadmin',
            'admin/config',
            'api/v1/debug',
            'api/v1/test_credential'
        ];

        foreach ($traps as $trap) {
            if ($request->is($trap) || $request->is($trap . '/*')) {
                // Log l'intrusion
                AuditLog::create([
                    'action' => 'HONEYPOT_TRIGGERED',
                    'description' => "Tentative d'accès au chemin interdit : " . $request->path(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'metadata' => [
                        'method' => $request->method(),
                        'input' => $request->all()
                    ]
                ]);

                // Alerte Telegram Temps Réel Cerberus
                try {
                    app(\App\Services\SystemHealthService::class)->notifySecurityAlert(
                        "Honeypot Déclenché !",
                        "Un scanner/robot a tenté d'accéder au chemin piège : " . $request->path(),
                        ['UserAgent' => $request->userAgent()]
                    );
                } catch (\Exception $e) {
                    // Fail silently for app stability
                }

                Log::warning("CERBERUS: Honeypot triggered by IP " . $request->ip() . " on " . $request->path());

                // Bloquer l'IP ou simplement retourner un 404/403 menteur
                return response()->json(['message' => 'Not Found'], 404);
            }
        }

        return $next($request);
    }
}
