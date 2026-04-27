import { ChevronRight } from "lucide-react";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";

const categoryItems = [
  { name: "Parfums", count: 120, icon: "Perf" },
  { name: "Soins visage", count: 86, icon: "Skin" },
  { name: "Maquillage", count: 142, icon: "Make" },
  { name: "Soins corps", count: 64, icon: "Body" },
  { name: "Cheveux", count: 73, icon: "Hair" },
  { name: "Accessoires", count: 41, icon: "Bag" },
];

const popularProducts: ShopProduct[] = [
  {
    id: "cp1",
    name: "Coffret Parfum Premium",
    brand: "DStore Selection",
    description: "Edition limitee",
    price: "620 DH",
    image: "C1",
  },
  {
    id: "cp2",
    name: "Creme Hydratante Glow",
    brand: "Nuxe",
    description: "Peaux normales a seches",
    price: "199 DH",
    image: "C2",
  },
  {
    id: "cp3",
    name: "Rouge Velvet 24h",
    brand: "Maybelline",
    description: "Teinte nude",
    price: "89 DH",
    image: "C3",
  },
  {
    id: "cp4",
    name: "Shampoing Repair Pro",
    brand: "L'Oreal",
    description: "Nutrition et brillance",
    price: "119 DH",
    image: "C4",
  },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold text-zinc-900">Categories</h1>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {categoryItems.map((category) => (
          <article
            key={category.name}
            className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-sm font-semibold text-[#97002f]">
                {category.icon}
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-zinc-900">{category.name}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{category.count} produits</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Produits populaires</h2>
          <button type="button" className="text-sm font-medium text-[#97002f]">
            Voir tout
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
