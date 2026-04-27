"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShopStoreProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  brand?: string;
  description?: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  brand?: string;
  description?: string;
};

type ShopState = {
  items: CartItem[];
  favorites: ShopStoreProduct[];
  totalPrice: number;
  totalItems: number;
  addToCart: (product: ShopStoreProduct) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  toggleFavorite: (product: ShopStoreProduct) => void;
  clearFavorites: () => void;
};

function computeTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

export const useStore = create<ShopState>()(
  persist(
    (set) => ({
      items: [],
      favorites: [],
      totalPrice: 0,
      totalItems: 0,
      addToCart: (product) =>
        set((state) => {
          if (!isUuid(product.id)) {
            return state;
          }
          const exists = state.items.find((item) => item.id === product.id);
          const updatedItems = exists
            ? state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              )
            : [
                ...state.items,
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  quantity: product.quantity ?? 1,
                  brand: product.brand,
                  description: product.description,
                },
              ];

          return { ...computeTotals(updatedItems), items: updatedItems };
        }),
      removeFromCart: (id) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id);
          return { ...computeTotals(updatedItems), items: updatedItems };
        }),
      increaseQty: (id) =>
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
          );
          return { ...computeTotals(updatedItems), items: updatedItems };
        }),
      decreaseQty: (id) =>
        set((state) => {
          const updatedItems = state.items
            .map((item) =>
              item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
            )
            .filter((item) => item.quantity > 0);
          return { ...computeTotals(updatedItems), items: updatedItems };
        }),
      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
      toggleFavorite: (product) =>
        set((state) => {
          const exists = state.favorites.some((fav) => fav.id === product.id);
          const updatedFavorites = exists
            ? state.favorites.filter((fav) => fav.id !== product.id)
            : [...state.favorites, product];
          return { favorites: updatedFavorites };
        }),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "shop-storage",
      partialize: (state) => ({
        items: state.items,
        favorites: state.favorites,
        totalPrice: state.totalPrice,
        totalItems: state.totalItems,
      }),
    },
  ),
);
