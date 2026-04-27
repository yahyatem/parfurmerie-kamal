"use client";

import {
  Grid2x2,
  Heart,
  Home,
  Percent,
  ShoppingBag,
} from "lucide-react";

type BottomNavProps = {
  active?: "home" | "categories" | "promotions" | "favorites" | "cart";
  cartCount: number;
};

const navItems = [
  { key: "home", label: "Accueil", icon: Home },
  { key: "categories", label: "Categories", icon: Grid2x2 },
  { key: "promotions", label: "Promotions", icon: Percent },
  { key: "favorites", label: "Favoris", icon: Heart },
  { key: "cart", label: "Panier", icon: ShoppingBag },
] as const;

export default function BottomNav({ active = "home", cartCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-zinc-200 bg-white/95 px-2 py-2 backdrop-blur">
      <ul className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <li key={item.key}>
              <button
                type="button"
                className={`relative flex w-full flex-col items-center justify-center rounded-xl py-2 text-[11px] transition ${isActive ? "text-[#97002f]" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                <Icon className={`mb-0.5 h-5 w-5 ${isActive ? "stroke-[2.3]" : ""}`} />
                {item.label}
                {item.key === "cart" && cartCount > 0 && (
                  <span className="absolute right-2 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
