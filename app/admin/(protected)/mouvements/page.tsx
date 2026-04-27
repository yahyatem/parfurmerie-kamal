"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search, Shuffle, SlidersHorizontal } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import Badge from "@/components/admin/Badge";
import DataTable from "@/components/admin/DataTable";
import RecordCard from "@/components/admin/RecordCard";
import SummaryStatCard from "@/components/admin/SummaryStatCard";

type MovementType = "entree" | "sortie" | "ajustement";

type Movement = {
  id: string;
  date: string;
  product: string;
  type: MovementType;
  label: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  user: string;
  reason: string;
  category: string;
};

const movementsData: Movement[] = [
  {
    id: "MV001",
    date: "31/05/2024 10:30",
    product: "La Vie Est Belle 100ml",
    type: "entree",
    label: "Achat fournisseur",
    quantity: 20,
    stockBefore: 8,
    stockAfter: 28,
    user: "Admin",
    reason: "Réapprovisionnement",
    category: "Parfums",
  },
  {
    id: "MV002",
    date: "31/05/2024 09:15",
    product: "Sauvage 100ml",
    type: "sortie",
    label: "Vente (CMD-1054)",
    quantity: -2,
    stockBefore: 17,
    stockAfter: 15,
    user: "System",
    reason: "Commande client",
    category: "Parfums",
  },
  {
    id: "MV003",
    date: "30/05/2024 16:45",
    product: "Hydra Boost 50ml",
    type: "ajustement",
    label: "Correction stock",
    quantity: 1,
    stockBefore: 2,
    stockAfter: 3,
    user: "Admin",
    reason: "Ajustement manuel",
    category: "Soins Visage",
  },
  {
    id: "MV004",
    date: "30/05/2024 11:20",
    product: "Rouge à Lèvres Matte 01",
    type: "sortie",
    label: "Vente (CMD-1052)",
    quantity: -1,
    stockBefore: 1,
    stockAfter: 0,
    user: "System",
    reason: "Commande client",
    category: "Maquillage",
  },
  {
    id: "MV005",
    date: "29/05/2024 15:10",
    product: "Shampoing Nutritif 250ml",
    type: "entree",
    label: "Achat fournisseur",
    quantity: 10,
    stockBefore: 0,
    stockAfter: 10,
    user: "Admin",
    reason: "Réapprovisionnement",
    category: "Capillaire",
  },
  {
    id: "MV006",
    date: "29/05/2024 10:05",
    product: "Sérum Vitamine C 30ml",
    type: "sortie",
    label: "Vente (CMD-1048)",
    quantity: -3,
    stockBefore: 10,
    stockAfter: 7,
    user: "System",
    reason: "Commande client",
    category: "Soins Visage",
  },
];

function movementBadge(type: MovementType) {
  if (type === "entree") return { label: "Entrée", variant: "active" as const };
  if (type === "sortie") return { label: "Sortie", variant: "pending" as const };
  return { label: "Ajustement", variant: "delivered" as const };
}

export default function MouvementsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [user, setUser] = useState("all");
  const [date, setDate] = useState("all");

  const categories = Array.from(new Set(movementsData.map((item) => item.category)));
  const users = Array.from(new Set(movementsData.map((item) => item.user)));

  const filtered = useMemo(() => {
    return movementsData.filter((movement) => {
      const matchesSearch =
        movement.product.toLowerCase().includes(search.toLowerCase()) ||
        movement.label.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "all" || movement.type === type;
      const matchesCategory = category === "all" || movement.category === category;
      const matchesUser = user === "all" || movement.user === user;
      const matchesDate =
        date === "all" ||
        (date === "today" && movement.date.startsWith("31/05/2024")) ||
        (date === "week" && movement.date.includes("/05/2024"));
      return matchesSearch && matchesType && matchesCategory && matchesUser && matchesDate;
    });
  }, [search, type, category, user, date]);

  const stats = {
    total: movementsData.length,
    entries: movementsData.filter((item) => item.type === "entree").length,
    exits: movementsData.filter((item) => item.type === "sortie").length,
    adjustments: movementsData.filter((item) => item.type === "ajustement").length,
  };

  return (
    <section className="grid gap-6 2xl:grid-cols-[2.25fr,1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Mouvements de stock</h1>
          <p className="mt-1 text-sm text-zinc-500">Accueil / Mouvements de stock</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            title="Total mouvements"
            value={stats.total}
            icon={SlidersHorizontal}
            colorClass="bg-sky-50 text-sky-600"
          />
          <SummaryStatCard
            title="Entrées"
            value={stats.entries}
            icon={ArrowDown}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <SummaryStatCard
            title="Sorties"
            value={stats.exits}
            icon={ArrowUp}
            colorClass="bg-amber-50 text-amber-600"
          />
          <SummaryStatCard
            title="Ajustements"
            value={stats.adjustments}
            icon={Shuffle}
            colorClass="bg-violet-50 text-violet-600"
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher un produit, référence..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
              />
            </div>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
            >
              <option value="all">Tous les types</option>
              <option value="entree">Entrées</option>
              <option value="sortie">Sorties</option>
              <option value="ajustement">Ajustements</option>
            </select>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
            >
              <option value="all">Tous les utilisateurs</option>
              {users.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
            >
              <option value="all">Toutes dates</option>
              <option value="today">Aujourd&apos;hui</option>
              <option value="week">Cette semaine</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={[
            { key: "date", header: "Date", render: (item) => item.date },
            { key: "product", header: "Produit", render: (item) => item.product },
            {
              key: "type",
              header: "Type",
              render: (item) => {
                const badge = movementBadge(item.type);
                return <Badge label={badge.label} variant={badge.variant} />;
              },
            },
            { key: "label", header: "Mouvement", render: (item) => item.label },
            {
              key: "quantity",
              header: "Quantité",
              render: (item) => (
                <span
                  className={`font-semibold ${
                    item.quantity > 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                </span>
              ),
            },
            { key: "before", header: "Stock avant", render: (item) => item.stockBefore },
            { key: "after", header: "Stock après", render: (item) => item.stockAfter },
            { key: "user", header: "Utilisateur", render: (item) => item.user },
            { key: "reason", header: "Motif", render: (item) => item.reason },
            {
              key: "actions",
              header: "Actions",
              render: () => <ActionButtons showView showEdit={false} showDelete={false} />,
            },
          ]}
          data={filtered}
          getRowKey={(item) => item.id}
        />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Résumé des mouvements</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-zinc-500">Total mouvements</span>
              <span className="font-semibold text-zinc-900">{stats.total}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Entrées</span>
              <span className="font-semibold text-emerald-600">{stats.entries}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Sorties</span>
              <span className="font-semibold text-rose-600">{stats.exits}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Ajustements</span>
              <span className="font-semibold text-violet-600">{stats.adjustments}</span>
            </p>
          </div>
          <div className="mt-5 flex justify-center">
            <div className="relative h-40 w-40 rounded-full bg-[conic-gradient(#22c55e_34%,#ef4444_50%,#8b5cf6_16%)]">
              <div className="absolute inset-7 rounded-full bg-white" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-zinc-700">
                1 248 Total
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700">Mouvements récents</h3>
          {movementsData.slice(0, 2).map((item) => (
            <RecordCard
              key={item.id}
              code={item.id}
              statusLabel={movementBadge(item.type).label}
              statusVariant={movementBadge(item.type).variant}
              date={item.date}
              customer={item.product}
              phone={item.user}
              city={item.category}
              itemsCount={Math.abs(item.quantity)}
              driver={item.reason}
            />
          ))}
        </div>
      </aside>
    </section>
  );
}
