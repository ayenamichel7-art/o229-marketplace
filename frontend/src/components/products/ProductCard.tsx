import Link from "next/link";
import { WhatsAppButton } from "./WhatsAppButton";
import { formatPrice } from "@/lib/utils";
import { MapPin, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    city: string;
    primary_image?: { url: string } | null;
    shop?: { name: string; is_verified: boolean };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 transition-all hover:shadow-2xl hover:-translate-y-1 group">
      <figure className="relative h-48 w-full bg-base-200">
        {product.primary_image ? (
          <Image 
            src={product.primary_image.url} 
            alt={product.name} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-base-content/30">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        
        {/* Verified Badge */}
        {product.shop?.is_verified && (
          <div className="absolute top-2 right-2 badge badge-secondary shadow-sm font-semibold border-none">
            Vendeur Vérifié
          </div>
        )}
      </figure>

      <div className="card-body p-5">
        <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
          <h2 className="card-title text-lg line-clamp-1">{product.name}</h2>
        </Link>
        
        <p className="text-xl font-bold text-primary mt-1">
          {formatPrice(product.price)}
        </p>

        <div className="flex items-center text-sm text-base-content/60 mt-2">
          <MapPin className="w-4 h-4 mr-1" /> {product.city}
        </div>

        <div className="divider my-2"></div>

        <div className="card-actions justify-between items-center mt-2">
          <span className="text-xs font-medium text-base-content/70 truncate max-w-[120px]">
            {product.shop?.name || "Boutique"}
          </span>
          {/* We assume WhatsAppButton exists and handles the click logic to the API */}
          <WhatsAppButton 
            productId={product.id} 
            productName={product.name} 
            price={product.price.toString()} 
            className="btn btn-sm btn-circle btn-success text-white shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
