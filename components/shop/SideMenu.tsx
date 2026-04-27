"use client";

import { Gift, X } from "lucide-react";

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
};

const shopLinks = [
  "Accueil",
  "Categories",
  "Promotions",
  "Nouveautes",
  "Les plus populaires",
];

const infoLinks = [
  "A propos de nous",
  "Contactez-nous",
  "Politique de confidentialite",
  "Conditions d'utilisation",
  "FAQ",
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
        className={`absolute inset-0 bg-black/40 transition ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="Fermer le menu"
      />

      <aside
        className={`no-scrollbar relative h-full w-[82%] max-w-[330px] overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between bg-[#97002f] px-4 py-4 text-white">
          <div>
            <p className="text-lg font-semibold">DStore</p>
            <p className="text-xs text-rose-100">Cosmetiques & Parfums</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-4">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Boutique</h2>
            <ul className="mt-3 space-y-1">
              {shopLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-rose-50 hover:text-[#97002f]"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Aide & Infos
            </h2>
            <ul className="mt-3 space-y-1">
              {infoLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-rose-50 hover:text-[#97002f]"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#97002f]/10 text-[#97002f]">
                <Gift className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Offres exclusives</p>
                <p className="text-xs text-zinc-500">Profitez des meilleures reductions.</p>
              </div>
            </div>
          </section>
        </div>

        <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-400">Version 1.0.0</p>
      </aside>
    </div>
  );
}
