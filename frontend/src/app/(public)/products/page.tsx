"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Filter, Search, SlidersHorizontal, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

// Components
function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col glassmorphism rounded-2xl overflow-hidden hover:border-primary/50 transition-colors h-full">
      <div className="relative aspect-square w-full bg-surface/50 overflow-hidden">
        {product.primary_image ? (
          <img src={product.primary_image.url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">Sans image</div>
        )}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-medium">
          {product.city}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-secondary mb-1">{product.category?.name}</div>
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between">
          <span className="font-bold text-lg text-primary">{product.formatted_price}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2 line-clamp-1">
          Par {product.shop?.name}
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = (params = {}) => {
    setLoading(true);
    api.get("/products", { params }).then(res => {
      setProducts(res.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    // Initial fetch
    fetchProducts();
    api.get("/categories").then(res => setCategories(res.data.data));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts({ q: searchQuery });
  };

  const findNearby = () => {
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchProducts({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude,
            radius: 15 // 15km
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Geolocation error", error);
          alert("Erreur de localisation. Veuillez autoriser l'accès à votre position.");
          setLocationLoading(false);
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface/50 border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-4">Tous les produits</h1>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Que recherchez-vous ? (Alimenté par IA)" 
                className="w-full h-12 bg-background border border-border rounded-lg pl-11 pr-4 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button type="button" onClick={findNearby} disabled={locationLoading} className="flex items-center justify-center h-12 px-4 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors shrink-0">
              <MapPin className="w-5 h-5 mr-2" />
              {locationLoading ? "Recherche..." : "Près de moi"}
            </button>
            <button type="button" className="flex items-center justify-center h-12 px-6 rounded-lg bg-surface border border-border hover:bg-surface/80 transition-colors shrink-0">
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filtres
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-semibold mb-4 text-lg border-b border-border pb-2">Catégories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary bg-surface/50" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
                    <span className="text-xs text-muted-foreground/50 ml-auto">({cat.products_count})</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg border-b border-border pb-2">Prix (FCFA)</h3>
            <div className="flex items-center space-x-2">
              <input type="number" placeholder="Min" className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              <span className="text-muted-foreground">-</span>
              <input type="number" placeholder="Max" className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <span className="text-muted-foreground">{products.length} résultats</span>
            <select className="bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer">
              <option>Plus récents</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
              <option>Populaires</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] bg-surface rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
