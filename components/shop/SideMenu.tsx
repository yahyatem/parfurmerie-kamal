"use client";

import Link from "next/link";
import { ChevronRight, Gift, X } from "lucide-react";

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
};

const shopLinks = [
  { label: "Accueil", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Promotions", href: "/promotions" },
  { label: "Nouveautes", href: "/#nouveautes" },
  { label: "Les plus populaires", href: "/#meilleures-ventes" },
];

const infoLinks = [
  { label: "À propos de nous", href: "/about" },
  { label: "Contactez-nous", href: "/contact" },
  { label: "Politique de confidentialité", href: "/privacy" },
  { label: "Conditions d'utilisation", href: "/terms" },
  { label: "FAQ", href: "/faq" },
];

export default function SideMenu({ open, onClose }: SideMenuProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        className={`absolute inset-0 bg-black/55 transition ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="Fermer le menu"
      />

      <aside
        className={`relative flex h-screen w-[78vw] max-w-[420px] flex-col overflow-hidden bg-white shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[110px] items-start justify-between bg-gradient-to-br from-[#6f0125] via-[#7e022b] to-[#5e001e] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-sm font-bold tracking-wide">
              DS
            </span>
            <div>
              <p className="text-xl font-semibold leading-tight">DStore</p>
              <p className="text-xs text-rose-100">Cosmétiques & Parfums</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-3">
          <section>
            <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              BOUTIQUE
            </h2>
            <ul className="mt-2 border-t border-zinc-200">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex w-full items-center justify-between border-b border-zinc-200 px-2 py-5 text-left text-[18px] font-medium text-zinc-800 transition hover:bg-rose-50 active:bg-rose-50"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              AIDE & INFOS
            </h2>
            <ul className="mt-2 border-t border-zinc-200">
              {infoLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex w-full items-center justify-between border-b border-zinc-200 px-2 py-5 text-left text-[18px] font-medium text-zinc-800 transition hover:bg-rose-50 active:bg-rose-50"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <Link
            href="/promotions"
            onClick={onClose}
            className="mt-6 flex items-center justify-between rounded-2xl bg-rose-100 px-4 py-4 transition hover:bg-rose-200/70 active:bg-rose-200/70"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[#97002f]">
                <Gift className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Offres exclusives</p>
                <p className="text-xs text-zinc-600">
                  Découvrez nos meilleures offres et promotions
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          </Link>
        </div>

        <p className="border-t border-zinc-200 px-4 py-3 text-center text-xs text-zinc-400">
          Version 1.0.0
        </p>
      </aside>
    </div>
  );
}
