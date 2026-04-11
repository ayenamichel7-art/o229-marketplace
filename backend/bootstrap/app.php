<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureVendor;
use App\Http\Middleware\EnsureVerifiedVendor;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\SecurityHeadersMiddleware::class);
        $middleware->append(\App\Http\Middleware\CyberCerberusHoneypot::class);
        
        $middleware->alias([
            'vendor' => EnsureVendor::class,
            'admin' => EnsureAdmin::class,
            'verified.vendor' => EnsureVerifiedVendor::class,
        ]);

        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->reportable(function (\Throwable $e) {
            if (app()->environment('production')) {
                 // Rapport SystemHealth (Telegram)
                 app(\App\Services\SystemHealthService::class)->notifyError($e);
                 
                 // Rapport Sentry
                 if (app()->bound('sentry')) {
                    app('sentry')->captureException($e);
                 }
            }
        });
    })->create();
