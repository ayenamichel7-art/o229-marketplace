"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the MapComponent with SSR disabled
const MapComponent = dynamic(
  () => import("./MapComponent"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-surface/50 rounded-2xl animate-pulse border border-border">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-sm text-muted-foreground">Chargement de la carte...</span>
        </div>
      </div>
    )
  }
);

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  popupTitle?: string;
  className?: string;
}

export function Map({ latitude, longitude, zoom, popupTitle, className = "" }: MapProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border glassmorphism ${className}`}>
      <MapComponent 
        latitude={latitude} 
        longitude={longitude} 
        zoom={zoom} 
        popupTitle={popupTitle} 
      />
    </div>
  );
}
