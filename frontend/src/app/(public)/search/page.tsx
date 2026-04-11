"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { Search, Loader2, FilterX } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCity = searchParams.get("city") || "Toutes les villes";

  // Filter States
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState("");
  const [priceSort, setPriceSort] = useState(""); // "asc" or "desc"

  const { data: results, isLoading } = useQuery({
    queryKey: ["search-results", query, city, category, priceSort],
    queryFn: async () => {
      const res = await api.get("/search", { 
        params: { 
          q: query, 
          city: city !== "Toutes les villes" ? city : undefined,
          category: category || undefined,
          sort: priceSort || undefined // Assume backend mapping if extended
        } 
      });
      return res.data.data;
    },
    enabled: true // Always fetch on mount or filter change
  });

  return (
    <div className="bg-base-200/20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header & Main Search */}
        <div className="mb-8 bg-base-100 rounded-3xl p-6 md:p-10 shadow-sm border border-base-200 text-center">
          <h1 className="text-3xl font-extrabold text-base-content mb-6">
            Trouvez ce que vous cherchez <span className="text-primary">au Bénin</span>
          </h1>
          <div className="join w-full max-w-2xl mx-auto shadow-md">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Ordinateur portable, Chaussures Nike..."
                className="input input-lg input-bordered join-item w-full pl-12 focus:border-primary"
              />
            </div>
            <select 
              className="select select-bordered select-lg join-item bg-base-200 hidden md:block"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="Toutes les villes">Toutes les Villes</option>
              <option value="Cotonou">Cotonou</option>
              <option value="Porto-Novo">Porto-Novo</option>
              <option value="Abomey-Calavi">Abomey-Calavi</option>
              <option value="Parakou">Parakou</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Siderbar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-base-100 rounded-2xl p-5 border border-base-200 shadow-sm">
              <div className="flex items-center justify-between font-bold text-lg mb-4 text-base-content border-b border-base-200 pb-3">
                Filtres 
                {(query || city !== "Toutes les villes" || category || priceSort) && (
                  <button 
                    onClick={() => { setQuery(""); setCity("Toutes les villes"); setCategory(""); setPriceSort(""); }}
                    className="text-xs font-normal text-error hover:underline flex items-center"
                  >
                    <FilterX className="w-3 h-3 mr-1"/> Effacer
                  </button>
                )}
              </div>

              {/* Mobile Only: City filter duplicate */}
              <div className="form-control mb-5 lg:hidden">
                <span className="label-text font-semibold mb-2">Ville</span>
                <select className="select select-sm select-bordered w-full" value={city} onChange={(e) => setCity(e.target.value)}>
                   <option value="Toutes les villes">Toutes les Villes</option>
                   <option value="Cotonou">Cotonou</option>
                   <option value="Abomey-Calavi">Abomey-Calavi</option>
                   <option value="Parakou">Parakou</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="form-control mb-5">
                <span className="label-text font-semibold mb-2">Catégorie</span>
                <select className="select select-sm select-bordered w-full focus:select-primary" value={category} onChange={(e) => setCategory(e.target.value)}>
                   <option value="">Toutes les catégories</option>
                   <option value="1">Électronique</option>
                   <option value="2">Véhicules</option>
                   <option value="3">Immobilier</option>
                   <option value="4">Mode & Beauté</option>
                </select>
              </div>

              {/* Price Sort */}
              <div className="form-control">
                <span className="label-text font-semibold mb-2">Prix</span>
                <div className="flex flex-col gap-2">
                  <label className="label cursor-pointer justify-start gap-3 py-1">
                    <input type="radio" name="radio-price" className="radio radio-primary radio-sm" checked={priceSort === ""} onChange={() => setPriceSort("")} />
                    <span className="label-text">Par Pertinence</span> 
                  </label>
                  <label className="label cursor-pointer justify-start gap-3 py-1">
                    <input type="radio" name="radio-price" className="radio radio-primary radio-sm" checked={priceSort === "asc"} onChange={() => setPriceSort("asc")} />
                    <span className="label-text">Le moins cher</span> 
                  </label>
                  <label className="label cursor-pointer justify-start gap-3 py-1">
                    <input type="radio" name="radio-price" className="radio radio-primary radio-sm" checked={priceSort === "desc"} onChange={() => setPriceSort("desc")} />
                    <span className="label-text">Le plus cher</span> 
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-6 text-base-content flex items-center">
              {isLoading ? (
                <span className="flex items-center text-primary"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Recherche...</span>
              ) : results && results.length > 0 ? (
                <span>{results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}</span>
              ) : (
                <span className="text-base-content/60">Résultats</span>
              )}
            </h2>

            {!isLoading && results && results.length === 0 && (
              <div className="text-center py-20 bg-base-100 rounded-2xl border border-base-200 border-dashed">
                <Search className="w-12 h-12 text-base-content/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Oups ! Rien ne correspond.</h3>
                <p className="text-base-content/60 mb-6">Essayez de modifier vos filtres ou vos mots-clés.</p>
                <button 
                  onClick={() => { setQuery(""); setCity("Toutes les villes"); setCategory(""); }}
                  className="btn btn-outline btn-primary"
                >
                  Voir tous les produits
                </button>
              </div>
            )}

            {!isLoading && results && results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            {/* Pagination UI Mockup */}
            {!isLoading && results && results.length > 0 && (
              <div className="flex justify-center mt-12">
                <div className="join">
                  <button className="join-item btn">« Préc</button>
                  <button className="join-item btn flex items-center disabled">Page 1</button>
                  <button className="join-item btn">Suiv »</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
