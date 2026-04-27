"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CircleHelp,
  ClipboardList,
  Grid2X2,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tags,
  Truck,
  X,
  UserCog,
  Users,
} from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produits", href: "/admin/produits", icon: ShoppingBag },
  { label: "Catégories", href: "/admin/categories", icon: Grid2X2 },
  { label: "Marques", href: "/admin/marques", icon: Tags },
  { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
  { label: "Bons de livraison", href: "/admin/bons-de-livraison", icon: Truck },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Stock", href: "/admin/stock", icon: Package },
  { label: "Mouvements", href: "/admin/mouvements", icon: Boxes },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: UserCog },
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
  { label: "Ventes", href: "/admin/ventes", icon: ClipboardList },
  { label: "Statistiques", href: "/admin/statistiques", icon: BarChart3 },
];

type SidebarProps = {
  className?: string;
  onClose?: () => void;
};

export default function Sidebar({ className = "", onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex h-screen flex-col bg-[#0f172a] text-white ${className}`}
      aria-label="Sidebar"
    >
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold leading-tight">Parfumerie PK</p>
            <p className="text-xs text-white/65">Cosmétiques et Parfums</p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#97002f] text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-[#97002f] p-3">
          <p className="text-sm font-semibold">Besoin d&apos;aide ?</p>
          <p className="mt-1 text-xs text-white/80">Support en ligne</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            Contacter
          </button>
        </div>
      </div>
    </aside>
  );
}
