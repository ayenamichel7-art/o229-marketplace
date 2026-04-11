'use client';

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface CategorySectionProps {
  initialData?: Category[];
}

export function CategorySection({ initialData }: CategorySectionProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data as Category[];
    },
    initialData
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 md:h-32 rounded-2xl bg-base-300 animate-pulse" />
        ))}
      </div>
    );
  }

  // Fallback icon list if icons are not provided by DB yet
  const fallbackIcons: Record<string, string> = {
    'electronique': '📱',
    'vehicules': '🚗',
    'immobilier': '🏠',
    'mode': '👗',
    'services': '🛠️',
    'maison': '🛋️',
    'loisirs': '⚽',
    'alimentation': '🍕'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories?.map((cat) => (
        <Link 
          key={cat.id} 
          href={`/products?category=${cat.slug}`} 
          className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-base-200 hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-sm border border-transparent hover:border-primary/20"
        >
          <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
            {cat.icon || fallbackIcons[cat.slug] || '📦'}
          </span>
          <span className="font-semibold text-sm md:text-base text-center line-clamp-1">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
