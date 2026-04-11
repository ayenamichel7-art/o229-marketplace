import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoriteProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  city: string;
}

interface FavoriteState {
  favorites: FavoriteProduct[];
  addFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (product) => {
        const currentFavorites = get().favorites;
        if (!currentFavorites.some((p) => p.id === product.id)) {
          set({ favorites: [...currentFavorites, product] });
        }
      },
      
      removeFavorite: (productId) => {
        set({
          favorites: get().favorites.filter((p) => p.id !== productId),
        });
      },
      
      isFavorite: (productId) => {
        return get().favorites.some((p) => p.id === productId);
      },
      
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'o229-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
