<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;

class PruneAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'audit:prune {--days=30 : Le nombre de jours de logs à conserver}';

    /**
     * The console command description.
     */
    protected $description = 'Supprime les anciens logs d\'audit pour libérer de l\'espace et respecter la confidentialité.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $date = now()->subDays($days);

        $this->info("🧹 Nettoyage des logs d'audit plus vieux que le {$date->format('d/m/Y')}...");

        $deletedCount = AuditLog::where('created_at', '<', $date)->delete();

        if ($deletedCount > 0) {
            $this->info("✅ {$deletedCount} logs ont été supprimés avec succès.");
        } else {
            $this->comment("✨ Aucun log ancien à supprimer.");
        }

        return 0;
    }
}
