"use client";

import { useRouter } from "next/navigation";
import { Bell, Menu, MessageSquare, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    document.cookie = "admin-auth=; Path=/; Max-Age=0; SameSite=Lax";
    router.replace("/admin/login");
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[72px] border-b border-[#7b0d38] bg-[#97002f] px-4 text-white lg:left-[280px] lg:px-6">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden w-[460px] max-w-[56vw] sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher une commande, un produit..."
              className="h-11 w-full rounded-lg border border-white/20 bg-white pl-10 pr-4 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              5
            </span>
          </button>

          <button
            type="button"
            className="relative rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Messages"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <div className="hidden h-8 w-px bg-white/20 sm:block" />

          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-2 py-1 transition hover:bg-white/20"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#8b0637]">
              A
            </span>
            <span className="hidden text-sm font-semibold sm:inline">Admin</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
