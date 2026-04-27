"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CircleCheckBig, CircleDollarSign, Clock3, ShoppingCart, TrendingUp } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { supabase } from "@/lib/supabase";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled" | "livrée";
type DbOrder = {
  id: string;
  total: number | string | null;
  status: OrderStatus | null;
  created_at: string | null;
  clients:
    | { name: string | null; email: string | null; phone: string | null; city: string | null }
    | { name: string | null; email: string | null; phone: string | null; city: string | null }[]
    | null;
  order_items:
    | {
        quantity: number | null;
        price: number | string | null;
        products: { name: string | null; image: string | null } | { name: string | null; image: string | null }[] | null;
      }[]
    | null;
};
type DbProduct = {
  id: string;
  name: string;
  stock: number | null;
  price: number | string | null;
  category_id: string | null;
  categories: { name: string | null } | { name: string | null }[] | null;
};
type DbClient = { id: string; name: string | null; email: string | null; created_at: string | null };

const splitColors: Record<string, string> = {
  "Livrées": "#97002f",
  "En attente": "#f5b21d",
  "Annulées": "#d95c8f",
  "Confirmées": "#d6d9e1",
};

function formatDh(value: number) {
  return `${value.toLocaleString("fr-FR")} DH`;
}

function normalizeStatus(status: string | null) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "livrée" || normalized === "livree") return "delivered";
  return normalized as "pending" | "confirmed" | "delivered" | "cancelled";
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [clients, setClients] = useState<DbClient[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage("");
      const [ordersRes, productsRes, clientsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total, status, created_at, clients(name, email, phone, city), order_items(quantity, price, products(name, image))"),
        supabase.from("products").select("id, name, stock, price, category_id, categories(name)"),
        supabase.from("clients").select("id, name, email, created_at"),
      ]);
      if (!mounted) return;
      if (ordersRes.error || productsRes.error || clientsRes.error) {
        setErrorMessage(
          ordersRes.error?.message ?? productsRes.error?.message ?? clientsRes.error?.message ?? "Erreur inconnue",
        );
        setOrders([]);
        setProducts([]);
        setClients([]);
        setIsLoading(false);
        return;
      }
      setOrders((ordersRes.data ?? []) as DbOrder[]);
      setProducts((productsRes.data ?? []) as DbProduct[]);
      setClients((clientsRes.data ?? []) as DbClient[]);
      setIsLoading(false);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const pendingOrders = orders.filter((o) => normalizeStatus(o.status) === "pending").length;
    const deliveredOrders = orders.filter((o) => normalizeStatus(o.status) === "delivered").length;
    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
        .slice(0, 5)
        .map((order) => ({
          id: `#${order.id.slice(0, 8).toUpperCase()}`,
          date: order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "-",
          amount: formatDh(Number(order.total ?? 0)),
          status:
            normalizeStatus(order.status) === "delivered"
              ? "Livrée"
              : normalizeStatus(order.status) === "pending"
                ? "En attente"
                : normalizeStatus(order.status) === "confirmed"
                  ? "Confirmée"
                  : "Annulée",
        })),
    [orders],
  );

  const bestProducts = useMemo(() => {
    const map = new Map<string, { name: string; sold: number; revenue: number }>();
    orders.forEach((order) => {
      (order.order_items ?? []).forEach((item) => {
        const productRaw = Array.isArray(item.products) ? item.products[0] : item.products;
        const name = productRaw?.name ?? "Produit";
        const sold = item.quantity ?? 0;
        const revenue = sold * Number(item.price ?? 0);
        const prev = map.get(name);
        if (prev) {
          prev.sold += sold;
          prev.revenue += revenue;
        } else {
          map.set(name, { name, sold, revenue });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.sold - a.sold).slice(0, 5);
  }, [orders]);

  const ordersSplitData = useMemo(() => {
    const counts = { "Livrées": 0, "En attente": 0, "Annulées": 0, "Confirmées": 0 };
    orders.forEach((o) => {
      const s = normalizeStatus(o.status);
      if (s === "delivered") counts["Livrées"] += 1;
      else if (s === "pending") counts["En attente"] += 1;
      else if (s === "cancelled") counts["Annulées"] += 1;
      else if (s === "confirmed") counts["Confirmées"] += 1;
    });
    const total = Math.max(1, orders.length);
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percent: Number(((value / total) * 100).toFixed(1)),
      color: splitColors[name] ?? "#d6d9e1",
    }));
  }, [orders]);

  const lowStock = useMemo(
    () =>
      products
        .filter((p) => (p.stock ?? 0) <= 10)
        .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
        .slice(0, 5)
        .map((p) => ({ name: p.name, stock: p.stock ?? 0 })),
    [products],
  );

  const latestClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
        .slice(0, 3)
        .map((c) => ({
          name: c.name ?? "Client",
          email: c.email ?? "-",
          date: c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "-",
        })),
    [clients],
  );

  const recentActivity = useMemo(() => {
    const activity: Array<{ label: string; time: number }> = [];
    orders
      .slice()
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 2)
      .forEach((o) => activity.push({ label: `Nouvelle commande #${o.id.slice(0, 8).toUpperCase()}`, time: new Date(o.created_at ?? 0).getTime() }));
    clients
      .slice()
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 2)
      .forEach((c) => activity.push({ label: `Nouveau client ${c.name ?? "Client"}`, time: new Date(c.created_at ?? 0).getTime() }));
    lowStock
      .slice(0, 2)
      .forEach((p, i) =>
        activity.push({ label: `Produit en stock faible ${p.name}`, time: -(i + 1) }),
      );
    return activity.sort((a, b) => b.time - a.time).slice(0, 6).map((a) => a.label);
  }, [orders, clients, lowStock]);

  const salesData = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    orders.forEach((o) => {
      if (!o.created_at) return;
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(o.total ?? 0));
    });
    return Array.from(map.entries()).map(([k, v]) => ({
      date: new Date(`${k}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      value: v,
    }));
  }, [orders]);

  return (
    <section className="max-w-full space-y-4 overflow-hidden sm:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Accueil / Dashboard</p>
      </div>

      {errorMessage ? (
        <article className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          Erreur de chargement: {errorMessage}
        </article>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
              <div className="mt-3 h-8 w-24 animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Commandes" value={stats.totalOrders} trend="Commandes enregistrées" icon={ShoppingCart} colorClass="bg-sky-50 text-sky-600" />
          <StatCard title="Revenus" value={formatDh(stats.totalRevenue)} trend="Chiffre d'affaires total" icon={CircleDollarSign} colorClass="bg-rose-50 text-rose-600" />
          <StatCard title="En attente" value={stats.pendingOrders} trend="Commandes en attente" icon={Clock3} colorClass="bg-amber-50 text-amber-600" />
          <StatCard title="Livrées" value={stats.deliveredOrders} trend="Commandes livrées" icon={CircleCheckBig} colorClass="bg-emerald-50 text-emerald-600" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">VENTES (30 DERNIERS JOURS)</h2>
            <button type="button" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600">
              30 derniers jours
            </button>
          </div>
          <div className="h-60 sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#97002f" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#97002f" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, "auto"]} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`} tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString("fr-FR")} DH`, "Ventes"]} />
                <Area type="monotone" dataKey="value" stroke="#97002f" strokeWidth={3} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">COMMANDES RÉCENTES</h2>
            <Link href="/admin/commandes" className="text-xs font-semibold text-[#97002f]">
              Voir toutes
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order, idx) => (
              <div key={`${order.id}-${idx}`} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-zinc-100 p-2.5 sm:p-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">{order.id}</p>
                  <p className="text-xs text-zinc-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#97002f]">{order.amount}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    order.status === "Livrée"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "En attente"
                        ? "bg-amber-100 text-amber-700"
                        : order.status === "Confirmée"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-zinc-100 text-zinc-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">MEILLEURS PRODUITS</h2>
            <TrendingUp className="h-4 w-4 text-[#97002f]" />
          </div>
          <div className="space-y-2.5">
            {bestProducts.map((p, idx) => (
              <div key={`${p.name}-${idx}`} className="rounded-lg bg-zinc-50 p-3">
                <p className="text-sm font-medium text-zinc-800">{idx + 1}. {p.name}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>Ventes: {p.sold}</span>
                  <span className="font-semibold text-zinc-800">{formatDh(p.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-900">RÉPARTITION DES COMMANDES</h2>
          <div className="h-60 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ordersSplitData} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={2}>
                  {ordersSplitData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm">
            {ordersSplitData.map((item) => (
              <p key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-medium">{item.percent}%</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-900">STOCK FAIBLE</h3>
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
                <p className="text-sm text-zinc-700">{item.name}</p>
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Stock: {item.stock}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-900">DERNIERS CLIENTS</h3>
          <div className="space-y-3">
            {latestClients.map((client, idx) => (
              <div key={`${client.email}-${idx}`} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{client.name}</p>
                  <p className="text-xs text-zinc-500">{client.email}</p>
                </div>
                <p className="text-xs text-zinc-500">{client.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#97002f]" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">ACTIVITÉ RÉCENTE</h3>
          </div>
          <div className="space-y-2.5">
            {recentActivity.map((item, index) => (
              <p
                key={`${item}-${index}`}
                className="rounded-lg bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
