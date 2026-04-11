"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  initialData?: any[];
}

export function ProductGrid({ initialData }: ProductGridProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-products-recent"],
    queryFn: async () => {
      const res = await api.get("/products"); // Adjust depending on actual API structure mapping
      return res.data.data; // Assuming Laravel paginated resource
    },
    initialData
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="flex w-full flex-col gap-4">
            <div className="skeleton h-48 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-base-200 rounded-xl border border-base-300">
        <p className="text-base-content/60">Aucun produit trouvé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
