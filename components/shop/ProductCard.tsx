import { Heart, ShoppingCart } from "lucide-react";

export type ShopProduct = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: string;
  image: string;
  oldPrice?: string;
  discountLabel?: string;
};

type ProductCardProps = {
  product: ShopProduct;
  favoriteFilled?: boolean;
  showRemoveFavorite?: boolean;
};

export default function ProductCard({
  product,
  favoriteFilled = false,
  showRemoveFavorite = false,
}: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm">
      <div className="relative">
        <div className="aspect-[3/4] w-full rounded-xl border border-rose-100 bg-rose-50/70" />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl">
          {product.image}
        </span>
        {product.discountLabel && (
          <span className="absolute left-2 top-2 rounded-full bg-[#97002f] px-2 py-0.5 text-[10px] font-semibold text-white">
            {product.discountLabel}
          </span>
        )}
        <button
          type="button"
          className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${
            favoriteFilled ? "bg-rose-50 text-red-500" : "bg-white/90 text-zinc-500"
          }`}
          aria-label={favoriteFilled ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`h-4 w-4 ${favoriteFilled ? "fill-current" : ""}`} />
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
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#97002f] text-white shadow-sm"
          aria-label="Ajouter au panier"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
      {showRemoveFavorite && (
        <button
          type="button"
          className="mt-2 w-full rounded-lg border border-rose-100 px-2 py-1.5 text-xs font-medium text-[#97002f] transition hover:bg-rose-50"
        >
          Retirer des favoris
        </button>
      )}
    </article>
  );
}
