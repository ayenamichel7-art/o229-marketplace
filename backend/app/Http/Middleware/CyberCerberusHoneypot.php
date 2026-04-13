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
                // Sanitize user-controlled data before logging
                $safePath = preg_replace('/[\x00-\x1F\x7F]/', '', mb_substr($request->path(), 0, 255));
                $safeUserAgent = preg_replace('/[\x00-\x1F\x7F]/', '', mb_substr($request->userAgent() ?? 'unknown', 0, 500));
                $safeIp = filter_var($request->ip(), FILTER_VALIDATE_IP) ?: 'invalid';

                // Log l'intrusion
                AuditLog::create([
                    'action' => 'HONEYPOT_TRIGGERED',
                    'description' => "Tentative d'accès au chemin interdit : " . $safePath,
                    'ip_address' => $safeIp,
                    'user_agent' => $safeUserAgent,
                    'metadata' => [
                        'method' => $request->method(),
                        'input' => $request->all()
                    ]
                ]);

                // Alerte Telegram Temps Réel Cerberus
                try {
                    app(\App\Services\SystemHealthService::class)->notifySecurityAlert(
                        "Honeypot Déclenché !",
                        "Un scanner/robot a tenté d'accéder au chemin piège : " . $safePath,
                        ['UserAgent' => $safeUserAgent]
                    );
                } catch (\Exception $e) {
                    // Fail silently for app stability
                }

                Log::warning('CERBERUS: Honeypot triggered', [
                    'ip' => $safeIp,
                    'path' => $safePath,
                ]);

                // Bloquer l'IP ou simplement retourner un 404/403 menteur
                return response()->json(['message' => 'Not Found'], 404);
            }
        }

        return $next($request);
    }
}
