"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

// Custom Hook for Debouncing input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface SearchBarProps {
  className?: string;
  isHero?: boolean;
}

export function SearchBar({ className = "", isHero = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Toutes les villes");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const fetchSearch = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/search', { params: { q: debouncedQuery, city } });
        setResults(response.data.data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Erreur de recherche", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [debouncedQuery, city]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`join w-full ${isHero ? 'shadow-2xl' : ''}`}>
        <div className="relative w-full">
          <Search className={`absolute left-4 ${isHero ? 'top-4 text-base-content/40' : 'top-2.5 h-4 w-4 text-muted-foreground'}`} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length < 2) setShowDropdown(false);
            }}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            className={`input input-bordered join-item w-full ${isHero ? 'input-lg pl-12 focus:border-primary focus:ring-2 focus:ring-primary/20' : 'h-9 pl-10 text-sm bg-base-200 focus:border-primary'}`} 
            placeholder={isHero ? "Que recherchez-vous ? (ex: iPhone 13, Chaussures...)" : "Rechercher..."} 
          />
        </div>
        
        {isHero && (
          <>
            <select 
              className="select select-bordered select-lg join-item hidden md:block bg-base-200 w-48 font-medium"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="Toutes les villes">Toutes les villes</option>
              <option value="Cotonou">Cotonou</option>
              <option value="Porto-Novo">Porto-Novo</option>
              <option value="Abomey-Calavi">Abomey-Calavi</option>
              <option value="Parakou">Parakou</option>
            </select>
            <button className="btn btn-primary btn-lg join-item text-white">Rechercher</button>
          </>
        )}
      </div>

      {/* Instant Search Dropdown Results */}
      {showDropdown && (
        <div className={`absolute z-50 left-0 right-0 mt-2 bg-base-100 rounded-xl border border-base-300 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 ${isHero ? 'md:right-auto md:w-[600px]' : 'w-[350px] lg:w-[500px]'}`}>
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <ul className="p-2 gap-1 flex flex-col">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link 
                      href={`/products/${product.slug}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center p-2 hover:bg-base-200 rounded-lg transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-md bg-base-300 flex-shrink-0 overflow-hidden mr-4">
                        {product.primary_image && (
                          <img src={product.primary_image.url} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-base-content truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center text-xs text-base-content/60 mt-1">
                          <MapPin className="w-3 h-3 mr-1" /> {product.city}
                          <span className="mx-2">•</span>
                          <span className="truncate max-w-[100px]">{product.shop_name}</span>
                        </div>
                      </div>
                      <div className="font-bold text-primary whitespace-nowrap ml-4">
                        {formatPrice(product.price)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-base-200 p-2 bg-base-200/50">
                <Link 
                  href={`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`} 
                  className="btn btn-sm btn-ghost w-full text-primary"
                  onClick={() => setShowDropdown(false)}
                >
                  Voir tous les résultats
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-base-content/50">
              <p>Aucun produit trouvé pour "{query}".</p>
              <p className="text-xs mt-1">Essayez d'autres mots clés.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
