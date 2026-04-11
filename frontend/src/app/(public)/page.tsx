import Link from "next/link";
import { ArrowRight, Star, TrendingUp, MapPin, Search } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SearchBar } from "@/components/search/SearchBar";
import { CategorySection } from "@/components/categories/CategorySection";

export default async function Home() {
  let initialProducts = undefined;
  let initialCategories = undefined;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${baseUrl}/products`, { next: { revalidate: 60 } }).catch(() => null),
      fetch(`${baseUrl}/categories`, { next: { revalidate: 60 } }).catch(() => null)
    ]);

    if (productsRes && productsRes.ok) {
      const data = await productsRes.json();
      initialProducts = data.data;
    }
    
    if (categoriesRes && categoriesRes.ok) {
      const data = await categoriesRes.json();
      initialCategories = data.data;
    }
  } catch (error) {
    console.error("SSR Fetch Error", error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      
      {/* 🚀 Hero Section avec Barre de Recherche */}
      <section className="relative w-full py-16 md:py-28 overflow-hidden flex items-center justify-center border-b border-base-300">
        <div className="absolute top-0 left-0 w-full h-full bg-base-100 z-0" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] z-0" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] z-0" />
        
        <div className="container relative z-10 px-4 text-center">
          <div className="inline-flex rounded-full px-4 py-1.5 text-sm font-semibold text-accent bg-accent/10 mb-8 border border-accent/20 shadow-sm">
            <Star className="w-4 h-4 mr-2 inline" /> La Marketplace N°1 au Bénin
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight text-base-content">
            Trouvez vite, achetez mieux, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Parlez directement sur WhatsApp.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-base-content/70 mb-10 max-w-2xl mx-auto">
            Sans carte de crédit. Sans commissions cachées. 
            Découvrez des milliers d'articles autour de vous et finalisez le tout en privé.
          </p>
          
          {/* Search Bar Interactive */}
          <div className="max-w-3xl mx-auto mb-10">
            <SearchBar isHero={true} />
          </div>

        </div>
      </section>

      {/* 📦 Nouveautés Récentes (React Query Grid) */}
      <section className="w-full py-16 bg-base-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content text-transparent bg-clip-text bg-gradient-to-r from-base-content to-base-content/60">Ajoutés Récemment</h2>
              <p className="text-base-content/60 mt-1">Les dernières pépites locales disponibles près de vous.</p>
            </div>
            <Link href="/products" className="btn btn-outline btn-sm hidden md:flex hover:bg-primary hover:border-primary transition-all duration-300">
              Tout voir <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <ProductGrid initialData={initialProducts} />
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="btn btn-outline btn-block">
              Voir tout le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* 🏷️ Catégories Vedettes */}
      <section className="w-full py-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">Explorez par Catégorie</h2>
        </div>
        
        <CategorySection initialData={initialCategories} />
      </section>

      {/* 🚀 Atout Business pour les Vendeurs */}
      <section className="w-full py-20 bg-secondary/10 border-t border-secondary/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="badge badge-secondary badge-lg mb-6">Pour les Commerçants</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-base-content">Boostez vos ventes aujourd'hui</h2>
          <p className="text-lg text-base-content/70 mb-10 max-w-2xl mx-auto">
            Créez votre boutique en 2 minutes, suivez vos statistiques avec notre IA, 
            et recevez les clients directement sur votre numéro WhatsApp.
          </p>
          <Link href="/register?role=vendor" className="btn btn-secondary btn-lg shadow-xl shadow-secondary/30 text-white">
            Créer ma Boutique Vendeur <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
