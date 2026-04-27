"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { useStore } from "@/store/useStore";

export type ShopProduct = {
  id: string;
  name: string;
  brand: string;
  category?: string;
  description: string;
  price: string;
  image: string;
  oldPrice?: string;
  discountLabel?: string;
};

type ProductCardProps = {
  product: ShopProduct;
  showRemoveFavorite?: boolean;
};

function parsePrice(price: string) {
  const numeric = Number(price.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric : 0;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default function ProductCard({ product, showRemoveFavorite = false }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const isFavorite = useStore((state) =>
    state.favorites.some((favorite) => favorite.id === product.id),
  );

  const mappedProduct = {
    id: product.id,
    name: product.name,
    price: parsePrice(product.price),
    image: product.image,
    brand: product.brand,
    description: product.description,
  };
  const canAddToCart = isUuid(product.id);
  const hasImageUrl = typeof product.image === "string" && product.image.startsWith("http");

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm">
      <div className="relative">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border border-rose-100 bg-rose-50/70">
          {hasImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </>
          ) : (
            <span className="pointer-events-none flex h-full w-full items-center justify-center text-3xl">
              Img
            </span>
          )}
        </div>
        {product.discountLabel && (
          <span className="absolute left-2 top-2 rounded-full bg-[#97002f] px-2 py-0.5 text-[10px] font-semibold text-white">
            {product.discountLabel}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleFavorite(mappedProduct)}
          className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${
            isFavorite ? "bg-rose-50 text-red-500" : "bg-white/90 text-zinc-500"
          }`}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-2.5 min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{product.name}</p>
        <p className="line-clamp-1 text-xs text-zinc-500">{product.brand}</p>
        <p className="line-clamp-1 text-xs text-zinc-400">{product.description}</p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div>
          {product.oldPrice && (
            <p className="text-[11px] text-zinc-400 line-through">{product.oldPrice}</p>
          )}
          <p className="text-sm font-bold text-[#97002f]">{product.price}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (canAddToCart) {
              addToCart(mappedProduct);
            }
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#97002f] text-white shadow-sm"
          aria-label="Ajouter au panier"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
      {showRemoveFavorite && (
        <button
          type="button"
          onClick={() => toggleFavorite(mappedProduct)}
          className="mt-2 w-full rounded-lg border border-rose-100 px-2 py-1.5 text-xs font-medium text-[#97002f] transition hover:bg-rose-50"
        >
          Retirer des favoris
        </button>
      )}
    </article>
  );
}
