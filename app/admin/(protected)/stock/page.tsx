"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, CircleOff, Search, Wallet } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import Badge from "@/components/admin/Badge";
import DataTable from "@/components/admin/DataTable";
import SummaryStatCard from "@/components/admin/SummaryStatCard";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

type StockItem = {
  id: string;
  image: string;
  name: string;
  reference: string;
  category: string;
  brand: string;
  purchasePrice: string;
  salePrice: string;
  stock: number;
  status: StockStatus;
};

const stockData: StockItem[] = [
  {
    id: "S001",
    image: "VB",
    name: "La Vie Est Belle",
    reference: "P00145",
    category: "Parfums Femme",
    brand: "Lancôme",
    purchasePrice: "450,00 DH",
    salePrice: "890,00 DH",
    stock: 28,
    status: "in_stock",
  },
  {
    id: "S002",
    image: "SV",
    name: "Sauvage",
    reference: "P00098",
    category: "Parfums Homme",
    brand: "Dior",
    purchasePrice: "380,00 DH",
    salePrice: "750,00 DH",
    stock: 15,
    status: "in_stock",
  },
  {
    id: "S003",
    image: "HB",
    name: "Hydra Boost",
    reference: "C00215",
    category: "Soins Visage",
    brand: "L'Oréal Paris",
    purchasePrice: "55,00 DH",
    salePrice: "120,00 DH",
    stock: 3,
    status: "low_stock",
  },
  {
    id: "S004",
    image: "RM",
    name: "Rouge à Lèvres Matte 01",
    reference: "M00356",
    category: "Maquillage Lèvres",
    brand: "Maybelline",
    purchasePrice: "18,00 DH",
    salePrice: "45,00 DH",
    stock: 0,
    status: "out_of_stock",
  },
  {
    id: "S005",
    image: "SN",
    name: "Shampoing Nutritif",
    reference: "S00125",
    category: "Soins Cheveux",
    brand: "Kérastase",
    purchasePrice: "85,00 DH",
    salePrice: "180,00 DH",
    stock: 2,
    status: "low_stock",
  },
  {
    id: "S006",
    image: "VC",
    name: "Sérum Vitamine C 30ml",
    reference: "S00231",
    category: "Soins Visage",
    brand: "Garnier",
    purchasePrice: "40,00 DH",
    salePrice: "95,00 DH",
    stock: 7,
    status: "in_stock",
  },
];

function mapStockBadge(status: StockStatus) {
  if (status === "in_stock") return { label: "En stock", variant: "active" as const };
  if (status === "low_stock") {
    return { label: "Stock faible", variant: "pending" as const };
  }
  return { label: "En rupture", variant: "inactive" as const };
}

function StockCard({ item }: { item: StockItem }) {
  const badge = mapStockBadge(item.status);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-16 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-zinc-500">
          {item.image || "IMG"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-base font-bold text-zinc-900">{item.name}</p>
          <p className="mt-0.5 text-xs text-zinc-500">Ref: {item.reference}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
              {item.category}
            </span>
            <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
              {item.brand}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-zinc-500">Prix achat</p>
          <p className="font-medium text-zinc-800">{item.purchasePrice}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Prix vente</p>
          <p className="font-bold text-zinc-900">{item.salePrice}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-sm text-zinc-700">Stock: {item.stock}</p>
        <Badge label={badge.label} variant={badge.variant} />
      </div>

      <div className="mt-4 flex justify-end">
        <ActionButtons />
      </div>
    </article>
  );
}

export default function StockPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");

  const categories = Array.from(new Set(stockData.map((item) => item.category)));
  const brands = Array.from(new Set(stockData.map((item) => item.brand)));

  const filtered = useMemo(() => {
    return stockData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.reference.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      const matchesBrand = brand === "all" || item.brand === brand;
      const matchesStatus = stockStatus === "all" || item.status === stockStatus;
      return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [search, category, brand, stockStatus]);

  const stats = {
    totalValue: "128 450,00 DH",
    inStockProducts: stockData.filter((item) => item.status === "in_stock").length,
    lowStockProducts: stockData.filter((item) => item.status === "low_stock").length,
    outOfStockProducts: stockData.filter((item) => item.status === "out_of_stock").length,
  };

  return (
    <section className="grid max-w-full gap-6 overflow-hidden 2xl:grid-cols-[2.2fr,1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Stock</h1>
          <p className="mt-1 text-sm text-zinc-500">Accueil / Stock</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            title="Valeur totale stock"
            value={stats.totalValue}
            icon={Wallet}
            colorClass="bg-sky-50 text-sky-600"
          />
          <SummaryStatCard
            title="Produits en stock"
            value={stats.inStockProducts}
            icon={Boxes}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <SummaryStatCard
            title="Stock faible"
            value={stats.lowStockProducts}
            icon={AlertTriangle}
            colorClass="bg-amber-50 text-amber-600"
          />
          <SummaryStatCard
            title="Rupture"
            value={stats.outOfStockProducts}
            icon={CircleOff}
            colorClass="bg-rose-50 text-rose-600"
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[220px]">
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
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
            >
              <option value="all">Toutes catégories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
            >
              <option value="all">Toutes marques</option>
              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={stockStatus}
              onChange={(event) => setStockStatus(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
            >
              <option value="all">Statut de stock</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">En rupture</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 md:hidden">
          {filtered.map((item) => (
            <StockCard key={item.id} item={item} />
          ))}
        </div>

        <div className="hidden max-w-full overflow-x-auto md:block">
          <div className="min-w-[1100px]">
            <DataTable
              columns={[
                {
                  key: "image",
                  header: "Produit",
                  render: (item) => (
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-700">
                        {item.image}
                      </span>
                      <div>
                        <p className="font-medium text-zinc-800">{item.name}</p>
                        <p className="text-xs text-zinc-500">{item.reference}</p>
                      </div>
                    </div>
                  ),
                },
                { key: "reference", header: "Référence", render: (item) => item.reference },
                { key: "category", header: "Catégorie", render: (item) => item.category },
                { key: "brand", header: "Marque", render: (item) => item.brand },
                { key: "purchase", header: "Prix achat", render: (item) => item.purchasePrice },
                { key: "sale", header: "Prix vente", render: (item) => item.salePrice },
                { key: "stock", header: "Stock", render: (item) => item.stock },
                {
                  key: "status",
                  header: "Statut",
                  render: (item) => {
                    const badge = mapStockBadge(item.status);
                    return <Badge label={badge.label} variant={badge.variant} />;
                  },
                },
                { key: "actions", header: "Actions", render: () => <ActionButtons showView /> },
              ]}
              data={filtered}
              getRowKey={(item) => item.id}
            />
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Résumé du stock</h2>
          <div className="mt-4 flex justify-center">
            <div className="relative h-44 w-44 rounded-full bg-[conic-gradient(#22c55e_75%,#f59e0b_17%,#ef4444_8%)]">
              <div className="absolute inset-8 rounded-full bg-white" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-zinc-900">320</span>
                <span className="text-xs text-zinc-500">Total produits</span>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-zinc-500">En stock</span>
              <span className="font-medium text-emerald-600">75%</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Stock faible</span>
              <span className="font-medium text-amber-600">17%</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">En rupture</span>
              <span className="font-medium text-rose-600">8%</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">Valeur totale stock</h3>
          <p className="mt-2 text-2xl font-semibold text-[#8b0637]">{stats.totalValue}</p>
          <p className="mt-1 text-xs text-zinc-500">Mise à jour instantanée (mock)</p>
        </div>
      </aside>
    </section>
  );
}
