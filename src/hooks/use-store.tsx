
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStore, getProductsByStore, getAllCategories } from '@/lib/firebase-service';
import type { Store, Product, Category } from '@/lib/types';

interface StoreContextType {
  store: Store | null;
  products: Product[];
  categories: Category[];
  loading: boolean;
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  products: [],
  categories: [],
  loading: true,
});

export function StoreProvider({ children, storeId }: { children: ReactNode, storeId: string | null }) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoreData() {
      if (!storeId) {
        // Handle case where storeId is not available (e.g., direct domain access)
        // This part would need more robust logic for production
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [storeData, productsData, categoriesData] = await Promise.all([
          getStore(storeId),
          getProductsByStore(storeId),
          getAllCategories(),
        ]);
        setStore(storeData);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load store data:", error);
        setStore(null);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    loadStoreData();
  }, [storeId]);
  
  return (
    <StoreContext.Provider value={{ store, products, categories, loading }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};
