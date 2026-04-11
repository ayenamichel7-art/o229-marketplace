'use client';

import { WifiOff, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-100 px-4 text-center">
      <div className="mb-6 rounded-full bg-error/10 p-6 text-error animate-pulse">
        <WifiOff size={64} />
      </div>
      
      <h1 className="mb-4 text-3xl font-bold text-base-content md:text-4xl">
        Vous êtes hors ligne
      </h1>
      
      <p className="mb-10 max-w-md text-lg text-base-content/60">
        Oups ! Il semble que votre connexion internet soit interrompue. 
        Certaines fonctionnalités de O-229 nécessitent une connexion active pour fonctionner.
      </p>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary btn-lg shadow-lg shadow-primary/20"
        >
          <RefreshCcw className="mr-2 h-5 w-5" />
          Réessayer
        </button>
        
        <Link href="/" className="btn btn-outline btn-lg">
          <Home className="mr-2 h-5 w-5" />
          Accueil
        </Link>
      </div>

      <p className="mt-12 text-sm text-base-content/40">
        💡 Astuce : Vous pouvez toujours consulter vos produits favoris enregistrés si vous les avez ouverts récemment.
      </p>
    </div>
  );
}
