"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackPixelEvent } from "@/components/layout/PixelTracker";

interface WhatsAppButtonProps {
  productId: number;
  className?: string;
  fullWidth?: boolean;
}

export function WhatsAppButton({ productId, className, fullWidth = false }: WhatsAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(`/products/${productId}/whatsapp-click`);
      
      // Tracking Pixel "Puissant"
      trackPixelEvent('Lead', { product_id: productId });

      if (response.data.success && response.data.url) {
        window.open(response.data.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to fetch WhatsApp link", error);
      // Fallback behavior if needed
      alert("Impossible de contacter le vendeur pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-whatsapp px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp disabled:pointer-events-none disabled:opacity-50",
        fullWidth && "w-full",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/><path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/><path d="M9 15a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1Z"/><path d="M14 15a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1Z"/>
        </svg>
      )}
      Contacter sur WhatsApp
    </button>
  );
}
