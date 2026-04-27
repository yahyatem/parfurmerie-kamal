"use client";

import { useMemo, useState } from "react";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";

const chips = ["Tous", "Parfums", "Maquillage", "Soins", "Cheveux"] as const;

type PromoProduct = ShopProduct & {
  filter: (typeof chips)[number];
};

const promoProducts: PromoProduct[] = [
  {
    id: "pr1",
    name: "Black Opium",
    brand: "YSL",
    description: "Eau de parfum 50ml",
    oldPrice: "1 120 DH",
    price: "790 DH",
    discountLabel: "-30%",
    image: "PR1",
    filter: "Parfums",
  },
  {
    id: "pr2",
    name: "Mascara Sky High",
    brand: "Maybelline",
    description: "Volume intense",
    oldPrice: "189 DH",
    price: "129 DH",
    discountLabel: "-32%",
    image: "PR2",
    filter: "Maquillage",
  },
  {
    id: "pr3",
    name: "Serum Hyaluronique",
    brand: "L'Oreal",
    description: "Hydratation 24h",
    oldPrice: "240 DH",
    price: "159 DH",
    discountLabel: "-34%",
    image: "PR3",
    filter: "Soins",
  },
  {
    id: "pr4",
    name: "Shampoing Nourrissant",
    brand: "Keratase",
    description: "Cheveux secs",
    oldPrice: "260 DH",
    price: "189 DH",
    discountLabel: "-27%",
    image: "PR4",
    filter: "Cheveux",
  },
  {
    id: "pr5",
    name: "Libre Eau de Parfum",
    brand: "YSL",
    description: "Edition florale 50ml",
    oldPrice: "1 050 DH",
    price: "720 DH",
    discountLabel: "-31%",
    image: "PR5",
    filter: "Parfums",
  },
  {
    id: "pr6",
    name: "Palette Nude Glow",
    brand: "Essence",
    description: "10 couleurs",
    oldPrice: "210 DH",
    price: "149 DH",
    discountLabel: "-29%",
    image: "PR6",
    filter: "Maquillage",
  },
];

export default function PromotionsPage() {
  const [activeChip, setActiveChip] = useState<(typeof chips)[number]>("Tous");

  const visibleProducts = useMemo(() => {
    if (activeChip === "Tous") return promoProducts;
    return promoProducts.filter((product) => product.filter === activeChip);
  }, [activeChip]);

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Promotions</h1>
        <div className="rounded-3xl bg-gradient-to-r from-[#97002f] to-[#b0134d] p-4 text-white shadow-md">
          <p className="text-sm text-rose-100">Promotions du moment</p>
          <p className="mt-1 text-3xl font-bold">Jusqu&apos;a -50%</p>
        </div>
      </section>

      <section className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((chip) => {
          const isActive = chip === activeChip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveChip(chip)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-[#97002f] bg-[#97002f] text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-2 gap-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
