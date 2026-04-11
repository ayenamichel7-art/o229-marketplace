'use client';

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

/**
 * PixelTracker - Un composant puissant pour gérer le tracking multi-plateforme.
 * Gère le Pixel Browser (JS) et la Conversion API (Server-side) pour Meta & TikTok.
 */
export function PixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initialisation des Pixels (Browser side)
  useEffect(() => {
    // Note: Dans un environnement réel, on chargerait les scripts ici
    // si l'ID est présent dans la config.
  }, []);

  // 2. Track PageView à chaque changement de route
  useEffect(() => {
    if (!pathname) return;

    const url = window.location.href;
    
    // Envoi au Backend (Conversion API) pour contourner les bloqueurs
    api.post("/public/track", {
      event_name: 'PageView',
      event_source_url: url,
      data: {
        path: pathname,
        query: searchParams.toString()
      }
    }).catch(() => {}); // Silent failure if tracking is off

    // Log pour debug en développement
    if (process.env.NODE_ENV === 'development') {
       console.log(`[Pixel] PageView tracked: ${pathname}`);
    }
  }, [pathname, searchParams]);

  return null; // Composant invisible
}

/**
 * Helper global pour tracker des événements spécifiques (ex: clic WhatsApp)
 */
export const trackPixelEvent = async (eventName: string, data: any = {}) => {
  try {
    // 1. Browser Tracking (si chargé)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, data);
    }
    
    // 2. Server-side Tracking (Le "Pixel Puissant")
    await api.post("/public/track", {
      event_name: eventName,
      event_source_url: window.location.href,
      data: data
    });
    
    if (process.env.NODE_ENV === 'development') {
       console.log(`[Pixel] Event "${eventName}" tracked:`, data);
    }
  } catch (e) {
    // Tracking fail is silent for user
  }
};
