<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Execute insight robot automatically
Schedule::command('insights:generate')->dailyAt('02:00');

// Check expired subscriptions and deactivate shops
Schedule::command('subscriptions:check-expiry')->daily();

// Sync product views from Redis to DB every 15 minutes
Schedule::command('products:sync-views')->everyFifteenMinutes();

// Nettoyage automatique des logs d'audit (Honeypot) tous les jours à minuit
Schedule::command('audit:prune')->daily();
