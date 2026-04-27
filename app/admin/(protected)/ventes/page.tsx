"use client";

import { useState } from "react";
import { CalendarDays, Search, ShoppingCart, Wallet } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import DataTable from "@/components/admin/DataTable";
import SummaryStatCard from "@/components/admin/SummaryStatCard";

type Product = {
  id: string;
  name: string;
  reference: string;
  price: number;
  stock: number;
  category: string;
};

type CartItem = Product & { quantity: number };

const products: Product[] = [
  { id: "P001", name: "La Vie Est Belle 100ml", reference: "P00145", price: 890, stock: 28, category: "Parfums" },
  { id: "P002", name: "Sauvage 100ml", reference: "P00098", price: 750, stock: 15, category: "Parfums" },
  { id: "P003", name: "Hydra Boost 50ml", reference: "C00215", price: 120, stock: 3, category: "Soins Visage" },
  { id: "P004", name: "Rouge à Lèvres Matte 01", reference: "M00356", price: 45, stock: 0, category: "Maquillage" },
  { id: "P005", name: "Shampoing Nutritif 250ml", reference: "S00125", price: 180, stock: 2, category: "Capillaire" },
];

const recentSales = [
  { id: "V-2024-0089", client: "Fatima Zahra", amount: "750,00 DH", payment: "Espèces", date: "31/05/2024 14:25" },
  { id: "V-2024-0088", client: "Youssef Benali", amount: "1 250,00 DH", payment: "Carte bancaire", date: "31/05/2024 13:40" },
  { id: "V-2024-0087", client: "Imane El Amrani", amount: "560,00 DH", payment: "Espèces", date: "31/05/2024 12:15" },
];

function formatDh(value: number) {
  return `${value.toLocaleString("fr-FR")},00 DH`;
}

export default function VentesPage() {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");
  const [cart, setCart] = useState<CartItem[]>([
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 1 },
    { ...products[2], quantity: 2 },
  ]);

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.reference.toLowerCase().includes(search.toLowerCase()),
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Ventes</h1>
        <p className="mt-1 text-sm text-zinc-500">Accueil / Ventes</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard title="Ventes du jour" value="12 450,00 DH" icon={ShoppingCart} colorClass="bg-rose-50 text-[#8b0637]" />
        <SummaryStatCard title="Ventes du mois" value="236 850,00 DH" icon={CalendarDays} colorClass="bg-emerald-50 text-emerald-600" />
        <SummaryStatCard title="Ventes de l'année" value="2 145 680,00 DH" icon={CalendarDays} colorClass="bg-sky-50 text-sky-600" />
        <SummaryStatCard title="Panier moyen" value="356,60 DH" icon={Wallet} colorClass="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[2.15fr,1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === "new" ? "bg-[#8b0637] text-white" : "bg-zinc-100 text-zinc-700"}`}
              >
                Nouvelle vente
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === "history" ? "bg-[#8b0637] text-white" : "bg-zinc-100 text-zinc-700"}`}
              >
                Historique des ventes
              </button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit, référence..."
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
              />
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: "product",
                header: "Produit",
                render: (item) => (
                  <div>
                    <p className="font-medium text-zinc-800">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.reference}</p>
                  </div>
                ),
              },
              { key: "ref", header: "Référence", render: (item) => item.reference },
              { key: "price", header: "Prix de vente", render: (item) => `${item.price},00 DH` },
              { key: "stock", header: "Stock", render: (item) => item.stock },
              {
                key: "action",
                header: "Action",
                render: (item) => (
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="h-8 rounded-md bg-[#8b0637] px-3 text-xs font-semibold text-white"
                  >
                    +
                  </button>
                ),
              },
            ]}
            data={filteredProducts}
            getRowKey={(item) => item.id}
          />

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">Ventes récentes</h3>
            <DataTable
              columns={[
                { key: "id", header: "N° Vente", render: (item) => item.id },
                { key: "client", header: "Client", render: (item) => item.client },
                { key: "amount", header: "Montant", render: (item) => item.amount },
                { key: "payment", header: "Paiement", render: (item) => item.payment },
                { key: "date", header: "Date", render: (item) => item.date },
                { key: "actions", header: "Actions", render: () => <ActionButtons showView showEdit={false} showDelete={false} /> },
              ]}
              data={recentSales}
              getRowKey={(item) => item.id}
            />
          </div>
        </div>

        <aside className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-900">Panier ({cart.length})</h3>
            <button type="button" className="text-xs text-rose-500">
              Vider le panier
            </button>
          </div>

          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3">
                <p className="text-sm font-medium text-zinc-800">{item.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{item.reference}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">{formatDh(item.price)}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(item.id, -1)} className="h-7 w-7 rounded border border-zinc-200">
                      -
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.id, 1)} className="h-7 w-7 rounded border border-zinc-200">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm">
            <p className="flex justify-between">
              <span className="text-zinc-500">Sous-total</span>
              <span className="font-medium">{formatDh(subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Total à payer</span>
              <span className="text-lg font-semibold text-[#8b0637]">{formatDh(subtotal)}</span>
            </p>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-zinc-700">Mode de paiement</p>
            <div className="grid grid-cols-2 gap-2">
              {["Espèces", "Carte bancaire", "Virement", "Autre"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`h-9 rounded-md border text-xs font-semibold ${paymentMethod === method ? "border-[#8b0637] bg-[#8b0637] text-white" : "border-zinc-200 text-zinc-700"}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mt-6 h-11 w-full rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f]"
          >
            Valider la vente
          </button>
        </aside>
      </div>
    </section>
  );
}
