import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, Tag, Info, AlertTriangle, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { WhatsAppButton } from "@/components/products/WhatsAppButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import Link from "next/link";
import { cache } from "react";
import { Product, ProductResponse } from "@/types/product";

// 🚀 Optimization: React cache ensures we only hit the API once per request 
// even if called in generateMetadata and the Page component.
const getProductData = cache(async (slug: string): Promise<ProductResponse | null> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, { 
      next: { revalidate: 60 } // ISR feature: Refreshes cache every 60s
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch product');
    }
    
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
});

// 1️⃣ SEO Meta Data Generation (Conforme section 6 du Plan)
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductData(slug);
  
  if (!data?.data) {
    return {
      title: 'Produit Introuvable | O-229 Marketplace',
    };
  }

  const product: Product = data.data;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`;
  const description = product.seo_description || product.description.substring(0, 160);

  return {
    title: `${product.name} à ${product.city} | O-229 Marketplace`,
    description: description,
    openGraph: {
      title: product.name,
      description: description,
      url: canonicalUrl,
      images: product.images && product.images.length > 0 
        ? [product.images[0].url] 
        : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// 2️⃣ Page UI Component
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data?.data) {
    notFound();
  }

  const product: Product = data.data;

  // 3️⃣ JSON-LD Structured Data Schema for Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map((img) => img.url),
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      "priceCurrency": "XOF",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": product.shop?.name
      }
    }
  };

  return (
    <div className="bg-base-200/30 min-h-screen pb-20">
      {/* Inflate JSON-LD silently in the DOM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Breadcrumb Navigation */}
        <div className="text-sm breadcrumbs text-base-content/60 mb-6">
          <ul>
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/products">Produits</Link></li>
            {product.category && (
              <li><Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link></li>
            )}
            <li className="font-semibold text-base-content truncate max-w-[200px] md:max-w-none">{product.name}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Image Gallery (Span 7) */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right Column: Product Details & WhatsApp CTA (Span 5) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-base-content leading-tight">
                  {product.name}
                </h1>
                <div className="ml-4">
                  <FavoriteButton 
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      image: product.images?.[0]?.url || '',
                      city: product.city
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-4 text-sm text-base-content/60 border-b border-base-200 pb-6">
                <span className="flex items-center"><Eye className="w-4 h-4 mr-1"/> {product.views_count || 12} vues</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {product.city}</span>
                {product.category && (
                  <span className="badge badge-outline">{product.category.name}</span>
                )}
              </div>

              <div className="py-6">
                <div className="text-4xl font-black text-primary mb-2 flex items-baseline">
                  {formatPrice(product.price)}
                </div>
                <p className="text-sm text-success font-medium flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1"/> Paiement à la livraison
                </p>
              </div>

              <div className="bg-whatsapp/10 border border-whatsapp/20 rounded-xl p-4 mb-6">
                <WhatsAppButton 
                  productId={product.id} 
                  fullWidth={true}
                  className="btn-lg animate-pulse hover:animate-none"
                />
                <p className="text-xs text-center text-base-content/50 mt-3 flex items-center justify-center">
                  <Info className="w-3 h-3 mr-1"/> Vous ne payez rien en ligne.
                </p>
              </div>

              {/* Vendor Information Box */}
              <div className="bg-base-200/50 rounded-xl p-5 border border-base-200">
                <h3 className="font-semibold text-sm mb-3 flex items-center text-base-content/80 uppercase tracking-wide">
                  Proposé par
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-12">
                        <span>{product.shop?.name?.substring(0, 2).toUpperCase() || "SH"}</span>
                      </div>
                    </div>
                    <div>
                      <Link href={`/shops/${product.shop?.slug}`} className="font-bold text-lg hover:text-primary transition-colors">
                        {product.shop?.name || "Boutique"}
                      </Link>
                      {product.shop?.is_verified && (
                        <div className="badge badge-secondary badge-sm ml-2">Vérifié</div>
                      )}
                    </div>
                  </div>
                  <Link href={`/shops/${product.shop?.slug}`} className="btn btn-outline btn-sm">Voir la vitrine</Link>
                </div>
              </div>
            </div>

             <div className="mt-6 flex justify-end">
                <button className="text-sm text-base-content/40 hover:text-error flex items-center transition-colors">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Signaler cette annonce
                </button>
             </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-base-100 rounded-2xl p-6 md:p-8 shadow-sm border border-base-200">
          <h2 className="text-xl font-bold mb-6 flex items-center border-b border-base-200 pb-4">
            <Tag className="w-5 h-5 mr-2 text-primary" />
            Description détaillée
          </h2>
          <div className="prose prose-base max-w-none text-base-content/80 whitespace-pre-line">
            {product.description}
          </div>
        </div>

      </div>
    </div>
  );
}
