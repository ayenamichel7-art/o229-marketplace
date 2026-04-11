"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // e.g. 4.5
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  size = "md", 
  interactive = false,
  onRate
}: StarRatingProps) {
  
  const sizeClasses = {
    sm: "w-3 h-3 block",
    md: "w-5 h-5 block",
    lg: "w-8 h-8 block"
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalf = !isFilled && starValue - 0.5 <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={cn(
              "transition-all duration-200 focus:outline-none",
              interactive ? "cursor-pointer hover:scale-125" : "cursor-default"
            )}
          >
            <div className="relative">
              {/* Vraie Étoile */}
              <Star 
                className={cn(
                  sizeClasses[size], 
                  isFilled ? "fill-accent text-accent" : "text-base-300 fill-base-300"
                )} 
              />
              {/* Demi-Étoile visuelle via mask CSS ou overlay si besoin */}
              {isHalf && (
                <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                  <Star className={cn(sizeClasses[size], "fill-accent text-accent")} />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
