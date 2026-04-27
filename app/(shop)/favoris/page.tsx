import { Heart, Trash2 } from "lucide-react";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";

const favoriteProducts: ShopProduct[] = [
  {
    id: "f1",
    name: "La Vie Est Belle",
    brand: "Lancome",
    description: "Eau de parfum 50ml",
    price: "890 DH",
    image: "F1",
  },
  {
    id: "f2",
    name: "Libre Intense",
    brand: "YSL",
    description: "Parfum floral 50ml",
    price: "980 DH",
    image: "F2",
  },
  {
    id: "f3",
    name: "Serum Vitamine C",
    brand: "Garnier",
    description: "Eclat 30ml",
    price: "129 DH",
    image: "F3",
  },
  {
    id: "f4",
    name: "Palette Nude Glow",
    brand: "Essence",
    description: "10 couleurs",
    price: "149 DH",
    image: "F4",
  },
  {
    id: "f5",
    name: "Shampoing Repair",
    brand: "L'Oreal",
    description: "Cheveux secs",
    price: "119 DH",
    image: "F5",
  },
  {
    id: "f6",
    name: "Creme Hydratante",
    brand: "Nuxe",
    description: "Peaux sensibles",
    price: "210 DH",
    image: "F6",
  },
];

export default function FavorisPage() {
  const hasFavorites = favoriteProducts.length > 0;

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Mes favoris (6)</h1>
          <p className="mt-1 text-sm text-zinc-500">Produits que vous aimez ❤️</p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700"
        >
          <Trash2 className="h-4 w-4" />
          Tout supprimer
        </button>
      </section>

      {hasFavorites ? (
        <section className="grid grid-cols-2 gap-3">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favoriteFilled
              showRemoveFavorite
            />
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
