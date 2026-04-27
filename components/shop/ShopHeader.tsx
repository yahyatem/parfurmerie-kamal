"use client";

import { Menu, Search, ShoppingCart, SlidersHorizontal } from "lucide-react";

type ShopHeaderProps = {
  onMenuOpen: () => void;
  cartCount: number;
};

export default function ShopHeader({ onMenuOpen, cartCount }: ShopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#97002f] px-4 pb-4 pt-4 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onMenuOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="text-base font-semibold leading-5">DStore</p>
          <p className="text-[11px] text-rose-100">Cosmetiques & Parfums</p>
        </div>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          aria-label="Panier"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute right-0.5 top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Rechercher un produit, une marque..."
          className="h-11 w-full rounded-xl border border-white/30 bg-white pl-9 pr-11 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-rose-200/50"
        />
        <button
          type="button"
          className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-rose-50 text-[#97002f]"
          aria-label="Filtres"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
