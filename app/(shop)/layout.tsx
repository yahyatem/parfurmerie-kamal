import type { Metadata } from "next";
import ShopShell from "@/components/shop/ShopShell";

export const metadata: Metadata = {
  title: "DStore | Cosmetiques & Parfums",
  description: "Boutique mobile-first de cosmetiques et parfums",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
