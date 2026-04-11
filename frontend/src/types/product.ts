export interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Shop {
  id: number;
  name: string;
  slug: string;
  whatsapp_number: string;
  is_verified: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  seo_description?: string;
  price: number;
  formatted_price: string;
  currency: string;
  city: string;
  status: string;
  views_count: number;
  whatsapp_clicks_count: number;
  category?: Category;
  shop?: Shop;
  images?: ProductImage[];
}

export interface ProductResponse {
  data: Product;
}

export interface ProductListResponse {
  data: Product[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
