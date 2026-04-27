import { Download, ShoppingBag, TrendingUp, Users, Wallet } from "lucide-react";
import SummaryStatCard from "@/components/admin/SummaryStatCard";

export default function StatistiquesPage() {
  const lineBars = [18, 22, 16, 25, 30, 24, 35, 32, 40, 28, 36, 31];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Statistiques</h1>
          <p className="mt-1 text-sm text-zinc-500">Accueil / Statistiques</p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8b0637] px-4 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          Exporter le rapport
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryStatCard title="Chiffre d'affaires" value="236 850,00 DH" icon={Wallet} colorClass="bg-rose-50 text-[#8b0637]" />
        <SummaryStatCard title="Nombre de ventes" value={156} icon={ShoppingBag} colorClass="bg-emerald-50 text-emerald-600" />
        <SummaryStatCard title="Panier moyen" value="1 519,55 DH" icon={TrendingUp} colorClass="bg-sky-50 text-sky-600" />
        <SummaryStatCard title="Produits vendus" value={478} icon={ShoppingBag} colorClass="bg-amber-50 text-amber-600" />
        <SummaryStatCard title="Nouveaux clients" value={34} icon={Users} colorClass="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Évolution du chiffre d&apos;affaires</h2>
          <div className="h-64 rounded-lg bg-gradient-to-b from-[#8b0637]/15 to-white p-4">
            <div className="flex h-full items-end justify-between gap-2">
              {lineBars.map((value, idx) => (
                <div key={`${value}-${idx}`} className="flex-1">
                  <div className="rounded-md bg-[#8b0637]" style={{ height: `${value * 1.9}px` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Ventes par catégorie</h2>
          <div className="flex justify-center">
            <div className="relative h-52 w-52 rounded-full bg-[conic-gradient(#8b0637_45.6%,#c02f6a_28.7%,#4f46e5_12.3%,#f59e0b_7.4%,#14b8a6_6.0%)]">
              <div className="absolute inset-10 rounded-full bg-white" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-semibold text-zinc-900">236 850,00 DH</p>
                <p className="text-xs text-zinc-500">Total</p>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex justify-between"><span>Parfums Femme</span><span className="font-medium">45.6%</span></p>
            <p className="flex justify-between"><span>Parfums Homme</span><span className="font-medium">28.7%</span></p>
            <p className="flex justify-between"><span>Soins Visage</span><span className="font-medium">12.3%</span></p>
            <p className="flex justify-between"><span>Maquillage</span><span className="font-medium">7.4%</span></p>
            <p className="flex justify-between"><span>Soins Cheveux</span><span className="font-medium">6.0%</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-zinc-900">Méthodes de paiement</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Espèces</span><span>58.3%</span></p>
            <p className="flex justify-between"><span>Carte bancaire</span><span>26.4%</span></p>
            <p className="flex justify-between"><span>Virement</span><span>10.2%</span></p>
            <p className="flex justify-between"><span>Autre</span><span>5.1%</span></p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-zinc-900">Ventes par ville</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Casablanca</span><span>42.7%</span></p>
            <p className="flex justify-between"><span>Rabat</span><span>18.6%</span></p>
            <p className="flex justify-between"><span>Marrakech</span><span>13.9%</span></p>
            <p className="flex justify-between"><span>Fès</span><span>9.8%</span></p>
            <p className="flex justify-between"><span>Autres villes</span><span>15.0%</span></p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-zinc-900">Top 5 produits</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>La Vie Est Belle 100ml</span><span>89</span></p>
            <p className="flex justify-between"><span>Sauvage 100ml</span><span>67</span></p>
            <p className="flex justify-between"><span>Hydra Boost 50ml</span><span>45</span></p>
            <p className="flex justify-between"><span>Sérum Vitamine C 30ml</span><span>38</span></p>
            <p className="flex justify-between"><span>Rouge à Lèvres Matte 01</span><span>32</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Achats", "152 300,00 DH", "+14.2%"],
            ["Dépenses", "18 450,00 DH", "-3.6%"],
            ["Bénéfice brut", "84 550,00 DH", "+22.1%"],
            ["Marge brute", "35.7%", "+2.8%"],
            ["Retours", "12 450,00 DH", "-8.2%"],
            ["Clients actifs", "186", "+19.9%"],
          ].map(([label, value, trend]) => (
            <div key={label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
              <p className={`text-xs ${trend.startsWith("-") ? "text-rose-500" : "text-emerald-600"}`}>{trend}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-zinc-900">Comparaison période précédente</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Chiffre d&apos;affaires</span><span className="text-emerald-600">+18.7%</span></p>
            <p className="flex justify-between"><span>Nombre de ventes</span><span className="text-emerald-600">+12.6%</span></p>
            <p className="flex justify-between"><span>Panier moyen</span><span className="text-emerald-600">+5.3%</span></p>
            <p className="flex justify-between"><span>Produits vendus</span><span className="text-emerald-600">+15.4%</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
