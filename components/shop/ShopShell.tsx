"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/shop/BottomNav";
import ShopHeader from "@/components/shop/ShopHeader";
import SideMenu from "@/components/shop/SideMenu";

type ShopShellProps = {
  children: React.ReactNode;
};

export default function ShopShell({ children }: ShopShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = 3;
  const pathname = usePathname();
  const activeTab =
    pathname === "/categories"
      ? "categories"
      : pathname === "/promotions"
        ? "promotions"
        : pathname === "/favoris"
          ? "favorites"
          : pathname === "/panier"
            ? "cart"
        : "home";

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <div className="mx-auto min-h-screen w-full max-w-[480px] overflow-x-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <ShopHeader onMenuOpen={() => setMenuOpen(true)} cartCount={cartCount} />
        <main className="px-4 pb-24 pt-4">{children}</main>
        <BottomNav active={activeTab} cartCount={cartCount} />
      </div>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
