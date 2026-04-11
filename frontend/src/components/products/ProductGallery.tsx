"use client";

import Image from "next/image";
import { Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface ProductGalleryProps {
  images: Array<{
    id: number;
    url: string;
    is_primary: boolean;
  }>;
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-base-200 rounded-2xl flex flex-col items-center justify-center border border-base-300">
        <ImageIcon className="w-16 h-16 text-base-content/20 mb-4" />
        <span className="text-base-content/40 font-medium">Aucune image disponible</span>
      </div>
    );
  }

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Large Image */}
        <div 
          onClick={() => setIsFullscreen(true)}
          className="relative w-full aspect-[4/3] md:aspect-square bg-base-200 rounded-2xl overflow-hidden border border-base-300 group cursor-zoom-in"
        >
          <Image 
            src={images[currentIndex].url} 
            alt={`${productName} - Image ${currentIndex + 1}`} 
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-base-100/80 backdrop-blur p-2 rounded-full shadow-lg">
              <Maximize2 className="w-5 h-5 text-base-content" />
            </div>
          </div>
          
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-base-100/90 hover:bg-primary hover:text-white backdrop-blur shadow-xl p-3 rounded-full md:opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-base-100/90 hover:bg-primary hover:text-white backdrop-blur shadow-xl p-3 rounded-full md:opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide">
            {images.map((img, idx) => (
              <button 
                key={img.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-primary shadow-lg scale-105' : 'border-base-300 opacity-60 hover:opacity-100'}`}
              >
                <Image 
                    src={img.url} 
                    alt={`${productName} thumbnail`} 
                    fill 
                    className="object-cover" 
                    sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🖼️ Fullscreen Lightbox Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          onClick={() => setIsFullscreen(false)}
        >
          <button 
            className="absolute top-6 right-6 z-[110] text-white/70 hover:text-white p-2 rounded-full bg-white/10"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
             {images.length > 1 && (
                <button 
                    onClick={prevImage}
                    className="absolute left-0 md:-left-16 z-[110] text-white/50 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-12 h-12" />
                </button>
             )}

             <div className="relative w-full h-full">
                <Image 
                    src={images[currentIndex].url} 
                    alt={productName}
                    fill
                    className="object-contain"
                    priority
                />
             </div>

             {images.length > 1 && (
                <button 
                    onClick={nextImage}
                    className="absolute right-0 md:-right-16 z-[110] text-white/50 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-12 h-12" />
                </button>
             )}
          </div>
        </div>
      )}
    </>
  );
}

