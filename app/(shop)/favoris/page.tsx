"use client";

import { Heart, Trash2 } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useStore } from "@/store/useStore";

export default function FavorisPage() {
  const favoriteProducts = useStore((state) => state.favorites);
  const clearFavorites = useStore((state) => state.clearFavorites);
  const hasFavorites = favoriteProducts.length > 0;

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Mes favoris ({favoriteProducts.length})
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Produits que vous aimez ❤️</p>
        </div>
        <button
          type="button"
          onClick={clearFavorites}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700"
        >
          <Trash2 className="h-4 w-4" />
          Tout supprimer
        </button>
      </section>

      {hasFavorites ? (
        <section className="grid grid-cols-2 gap-3">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={{ ...product, price: `${product.price} DH` }} showRemoveFavorite />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-[#97002f]">
            <Heart className="h-7 w-7" />
          </span>
          <p className="mt-3 text-sm font-medium text-zinc-700">Aucun favori pour le moment</p>
        </section>
      )}
    </div>
  );
}
