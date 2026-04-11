import { MetadataRoute } from 'next'
import { API_URL } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://o-229.com';

  // Base routes
  const routes = [
    '',
    '/products',
    '/shops',
    '/login',
    '/register/vendor',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Fetch all product slugs
    const response = await fetch(`${API_URL}/products?per_page=100`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const productRoutes = data.data.map((product: any) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(product.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      routes.push(...productRoutes);
    }
  } catch (error) {
    console.error('Error fetching products for sitemap', error);
  }

  try {
    // Fetch all shop slugs
    const shopsResponse = await fetch(`${API_URL}/shops?per_page=100`, { cache: 'no-store' });
    if (shopsResponse.ok) {
      const shopsData = await shopsResponse.json();
      const shopRoutes = shopsData.data.map((shop: any) => ({
        url: `${baseUrl}/shops/${shop.slug}`,
        lastModified: new Date(shop.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
      routes.push(...shopRoutes);
    }
  } catch (error) {
    console.error('Error fetching shops for sitemap', error);
  }

  return routes;
}
