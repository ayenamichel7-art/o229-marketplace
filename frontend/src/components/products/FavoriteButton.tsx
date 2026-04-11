'use client';

import { Heart } from 'lucide-react';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface FavoriteButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string;
    city: string;
  };
  className?: string;
}

export function FavoriteButton({ product, className }: FavoriteButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();

  // Handle hydration mismatch for persisted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted ? isFavorite(product.id) : false;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (active) {
      removeFavorite(product.id);
      toast.info('Retiré des favoris');
    } else {
      addFavorite(product);
      toast.success('Ajouté aux favoris !');
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={!mounted}
      className={cn(
        "group flex items-center justify-center rounded-full p-2.5 transition-all duration-300",
        mounted && active 
          ? "bg-red-50 text-red-500 shadow-sm" 
          : "bg-base-200 text-base-content/40 hover:bg-red-50 hover:text-red-400",
        !mounted && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart 
        className={cn(
          "h-6 w-6 transition-transform duration-300 group-hover:scale-110",
          mounted && active ? "fill-current" : "fill-none"
        )} 
      />
    </button>
  );
}
