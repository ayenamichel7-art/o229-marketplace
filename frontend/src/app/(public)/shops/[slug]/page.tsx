import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, Mail, Phone, CalendarDays } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { StarRating } from "@/components/reviews/StarRating";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import Link from "next/link";

// 1. Fetch data from backend SSR
async function getShopData(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops/${slug}`, { 
      next: { revalidate: 30 } 
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch shop');
    }
    
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Fetch Reviews parallel
async function getReviewsData(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops/${slug}/reviews`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

// 2. SEO
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopData(slug);
  if (!shop) return { title: 'Boutique Introuvable | O-229' };

  return {
    title: `${shop.name} | O-229 Marketplace`,
    description: shop.description || `Découvrez tous les produits de ${shop.name} sur O-229, basés à ${shop.city}.`,
    openGraph: {
      title: `${shop.name} sur O-229`,
      images: shop.logo ? [shop.logo] : [],
    }
  };
}

// 3. UI Page
export default async function ShopProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shopData = await getShopData(slug);
  const reviewsData = await getReviewsData(slug);

  if (!shopData) {
    notFound();
  }

  const shop = shopData;
  const rating = reviewsData?.average_rating || 0;
  const totalReviews = reviewsData?.total_reviews || 0;

  return (
    <div className="bg-base-200/30 min-h-screen">
      {/* Cover Banner */}
      <div className="w-full h-48 md:h-64 bg-gradient-to-r from-primary/80 to-secondary/80 relative">
        {shop.banner && (
          <img src={shop.banner} alt="Banner" className="w-full h-full object-cover mix-blend-overlay opacity-50" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Shop Header Identity */}
        <div className="relative -mt-16 sm:-mt-24 mb-10">
          <div className="bg-base-100 rounded-3xl p-6 md:p-8 shadow-xl border border-base-200 flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
            
            <div className="w-32 h-32 md:w-40 md:h-40 bg-base-200 rounded-full border-4 border-base-100 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden mb-4 md:mb-0 md:mr-6">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover"/>
              ) : (
                <span className="text-4xl font-black text-base-content/20">{shop.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <div>
                  <h1 className="text-3xl font-extrabold text-base-content flex items-center justify-center md:justify-start">
                    {shop.name}
                    {shop.is_verified && (
                      <div className="tooltip tooltip-right ml-2" data-tip="Vendeur Vérifié & Fiable">
                        <ShieldCheck className="w-6 h-6 text-secondary fill-secondary/20" />
                      </div>
                    )}
                  </h1>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end">
                  <div className="flex items-center space-x-2 bg-base-200 px-4 py-2 rounded-full">
                    <span className="font-bold text-lg">{rating.toFixed(1)}</span>
                    <StarRating rating={rating} />
                    <span className="text-sm text-base-content/60">({totalReviews} avis)</span>
                  </div>
                </div>
              </div>

              <p className="text-base-content/70 max-w-3xl">
                {shop.description || "Cette boutique n'a pas encore ajouté de description."}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3 border-t border-base-200 mt-4 text-sm font-medium text-base-content/60">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {shop.city}</span>
                <span className="flex items-center"><CalendarDays className="w-4 h-4 mr-1"/> Inscrit en {new Date(shop.created_at).getFullYear()}</span>
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              Catalogue de la boutique
            </h2>
            {/* Note: In a real app we'd pass shopId to ProductGrid to filter, but here we reuse the public one for demo structure */}
            <ProductGrid />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              Avis Clients
            </h2>
            <ReviewForm shopSlug={shop.slug} />

            {/* List of recent reviews */}
            <div className="bg-base-100 rounded-xl border border-base-200 p-6">
               <h3 className="font-semibold mb-4 border-b border-base-200 pb-2">Derniers avis</h3>
               {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                 <div className="space-y-4">
                   {reviewsData.reviews.slice(0, 5).map((review: any) => (
                     <div key={review.id} className="pb-4 border-b border-base-100 last:border-0 last:pb-0">
                       <div className="flex items-center justify-between mb-1">
                         <span className="font-medium text-sm">{review.user_name}</span>
                         <span className="text-xs text-base-content/50">{review.created_at}</span>
                       </div>
                       <StarRating rating={review.rating} size="sm" />
                       <p className="mt-2 text-sm text-base-content/80 italic">"{review.comment}"</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-sm text-base-content/50 text-center py-4">
                   Aucun avis pour l'instant.
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
