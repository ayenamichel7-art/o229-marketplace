'use client';

import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download } from 'lucide-react';

export function InstallPWA() {
  const { isInstallable, handleInstallClick } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-sm sm:bottom-8">
      <div className="flex items-center justify-between rounded-2xl bg-primary p-4 text-primary-content shadow-2xl shadow-primary/40 ring-4 ring-primary/20 animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-white/20 p-2">
            <Download size={20} />
          </div>
          <div>
            <p className="font-bold text-sm">Installer O-229</p>
            <p className="text-xs opacity-90 text-white/80">Accès rapide & Mode hors-ligne</p>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="btn btn-sm btn-white bg-white text-primary border-none hover:bg-neutral-100"
        >
          Installer
        </button>
      </div>
    </div>
  );
}
