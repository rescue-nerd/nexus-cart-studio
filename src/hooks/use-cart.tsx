
'use client';

import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useTranslation, TranslationContext } from './use-translation';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'nexus-cart-store';

// A placeholder t function for use when the provider is not yet available.
const placeholderT = (key: string, params?: { [key: string]: string | number }) => {
    if (!params) return key;
    let text = key;
    Object.keys(params).forEach(paramKey => {
        text = text.replace(`{${paramKey}}`, String(params[paramKey]));
    });
    return text;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  // Use translation, but provide a safe fallback if not in the provider yet.
  const translationContext = useContext(TranslationContext);
  const t = translationContext ? translationContext.t : placeholderT;

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
            toast({
                variant: 'destructive',
                title: t('storefront.cart.toast.stockLimitTitle'),
                description: t('storefront.cart.toast.stockLimitDesc', { stock: product.stock }),
            });
            return prevItems;
        }
        toast({
            title: t('storefront.cart.toast.itemAdded'),
            description: t('storefront.cart.toast.quantityUpdated', { name: product.name, quantity: newQuantity }),
        });
        return prevItems.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        toast({
            title: t('storefront.cart.toast.itemAdded'),
            description: t('storefront.cart.toast.itemAddedDesc', { quantity, name: product.name }),
        });
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => {
        const itemToRemove = prevItems.find(item => item.product.id === productId);
        if (itemToRemove) {
            toast({
                title: t('storefront.cart.toast.itemRemoved'),
                description: t('storefront.cart.toast.itemRemovedDesc', { name: itemToRemove.product.name }),
            });
        }
        return prevItems.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.product.id !== productId);
      }
      return prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
        title: t('storefront.cart.toast.cartCleared'),
        description: t('storefront.cart.toast.cartClearedDesc'),
    });
  };
  
  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
