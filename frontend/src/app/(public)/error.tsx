'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log de l'erreur
    console.error('Frontend Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertCircle size={48} />
      </div>
      
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-base-content md:text-4xl">
        Oups ! Quelque chose a mal tourné.
      </h1>
      
      <p className="mb-10 max-w-md text-lg text-base-content/60">
        Nous n'avons pas pu charger cette page. Cela peut arriver en cas de micro-coupure réseau ou de maintenance.
      </p>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <button
          onClick={() => reset()}
          className="btn btn-primary btn-lg shadow-lg shadow-primary/20"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Réessayer
        </button>
        
        <Link href="/" className="btn btn-outline btn-lg">
          <Home className="mr-2 h-5 w-5" />
          Retour à l'accueil
        </Link>
      </div>
      
      {error.digest && (
        <p className="mt-12 text-sm text-base-content/30 italic">
          Référence technique : {error.digest}
        </p>
      )}
    </div>
  );
}
