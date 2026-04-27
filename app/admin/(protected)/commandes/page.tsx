"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCheckBig, Clock3, Search, ShoppingBag, XCircle } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/admin/Badge";
import SummaryStatCard from "@/components/admin/SummaryStatCard";
import { supabase } from "@/lib/supabase";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
type Order = {
  rawId: string;
  id: string;
  status: OrderStatus;
  date: string;
  createdAt: string | null;
  customer: string;
  phone: string;
  city: string;
  address: string;
  itemsCount: number;
  amount: string;
  payment: "Paiement à la livraison";
};

const ITEMS_PER_PAGE = 8;

type DbOrder = {
  id: string;
  total: number | string | null;
  status: OrderStatus;
  created_at: string | null;
  clients:
    | {
        name: string | null;
        phone: string | null;
        city: string | null;
        address: string | null;
      }
    | {
        name: string | null;
        phone: string | null;
        city: string | null;
        address: string | null;
      }[]
    | null;
  order_items:
    | {
        id: string;
        quantity: number | null;
      }[]
    | null;
};

function getBadgeVariant(status: OrderStatus) {
  if (status === "pending") return "pending";
  if (status === "confirmed") return "delivered";
  if (status === "delivered") return "active";
  return "inactive";
}

function getStatusLabel(status: OrderStatus) {
  if (status === "pending") return "En attente";
  if (status === "confirmed") return "Confirmée";
  if (status === "delivered") return "Livrée";
  return "Annulée";
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("all");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, status, created_at, clients(name, phone, city, address), order_items(id, quantity)")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setFetchError(error.message);
        setOrders([]);
        return;
      }

      const mapped = ((data ?? []) as DbOrder[]).map((order) => {
        const client = Array.isArray(order.clients) ? order.clients[0] : order.clients;
        const createdAt = order.created_at ? new Date(order.created_at) : null;
        const dateLabel = createdAt
          ? createdAt.toLocaleString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";
        const orderCode = `#${String(order.id).slice(0, 8).toUpperCase()}`;
        const itemsCount = (order.order_items ?? []).reduce(
          (sum, item) => sum + (item.quantity ?? 0),
          0,
        );
        const numericTotal = Number(order.total ?? 0);

        return {
          rawId: order.id,
          id: orderCode,
          status: order.status,
          date: dateLabel,
          createdAt: order.created_at,
          customer: client?.name ?? "Client inconnu",
          phone: client?.phone ?? "-",
          city: client?.city ?? "-",
          address: client?.address ?? "-",
          itemsCount,
          amount: `${Number.isFinite(numericTotal) ? numericTotal : 0} DH`,
          payment: "Paiement à la livraison" as const,
        };
      });

      setFetchError("");
      setOrders(mapped);
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleStatusChange(orderId: string, nextStatus: OrderStatus) {
    setUpdatingOrderId(orderId);
    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);

    if (error) {
      setFetchError(error.message);
      setUpdatingOrderId(null);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.rawId === orderId ? { ...order, status: nextStatus } : order,
      ),
    );
    setUpdatingOrderId(null);
  }

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || order.status === status;
      const matchesPayment = payment === "all" || order.payment === payment;
      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      const isToday = createdAt
        ? createdAt.toDateString() === now.toDateString()
        : false;
      const isInWeek = createdAt ? createdAt >= weekAgo : false;
      const matchesDate = date === "all" || (date === "today" && isToday) || (date === "week" && isInWeek);
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [search, status, date, payment, orders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const stats = {
    total: orders.length,
    pending: orders.filter((item) => item.status === "pending").length,
    confirmed: orders.filter((item) => item.status === "confirmed").length,
    delivered: orders.filter((item) => item.status === "delivered").length,
    cancelled: orders.filter((item) => item.status === "cancelled").length,
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Commandes</h1>
        <p className="mt-1 text-sm text-zinc-500">Accueil / Commandes</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
          >
            <option value="all">Statut: Tous</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>

          <select
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
          >
            <option value="all">Date: Toutes</option>
            <option value="today">Aujourd&apos;hui</option>
            <option value="week">Cette semaine</option>
          </select>

          <select
            value={payment}
            onChange={(event) => {
              setPayment(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
          >
            <option value="all">Paiement: Tous</option>
            <option value="Paiement à la livraison">Paiement à la livraison</option>
            <option value="Paiement en ligne">Paiement en ligne</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryStatCard
          title="Toutes"
          value={stats.total}
          icon={ShoppingBag}
          colorClass="bg-rose-50 text-[#8b0637]"
        />
        <SummaryStatCard
          title="En attente"
          value={stats.pending}
          icon={Clock3}
          colorClass="bg-amber-50 text-amber-600"
        />
        <SummaryStatCard
          title="Confirmées"
          value={stats.confirmed}
          icon={CircleCheckBig}
          colorClass="bg-sky-50 text-sky-600"
        />
        <SummaryStatCard
          title="Livrées"
          value={stats.delivered}
          icon={CircleCheckBig}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <SummaryStatCard
          title="Annulées"
          value={stats.cancelled}
          icon={XCircle}
          colorClass="bg-zinc-100 text-zinc-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fetchError ? (
          <article className="sm:col-span-2 xl:col-span-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            Erreur de chargement: {fetchError}
          </article>
        ) : filtered.length === 0 ? (
          <article className="sm:col-span-2 xl:col-span-4 rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
            Aucune commande pour le moment
          </article>
        ) : (
          paginated.map((order) => (
            <article key={order.rawId} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-zinc-900">{order.id}</h3>
                <Badge
                  label={getStatusLabel(order.status)}
                  variant={getBadgeVariant(order.status)}
                />
              </div>

              <div className="space-y-1.5 text-sm text-zinc-600">
                <p>{order.date}</p>
                <p>{order.customer}</p>
                <p>{order.phone}</p>
                <p>{order.city}</p>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-zinc-500">Statut</label>
                <select
                  value={order.status}
                  onChange={(event) => handleStatusChange(order.rawId, event.target.value as OrderStatus)}
                  disabled={updatingOrderId === order.rawId}
                  className="h-9 w-full rounded-lg border border-zinc-200 px-2 text-sm text-zinc-700 disabled:opacity-60"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                {updatingOrderId === order.rawId ? (
                  <p className="mt-1 text-xs text-zinc-500">Mise à jour...</p>
                ) : null}
              </div>

              <div className="mt-3 border-t border-dashed border-zinc-200 pt-3">
                <p className="text-sm text-zinc-700">{order.itemsCount} articles</p>
                <p className="mt-1 text-base font-semibold text-[#8b0637]">{order.amount}</p>
                <p className="mt-1 text-xs text-zinc-500">{order.payment}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/admin/commandes/${order.rawId}`}
                  className="h-9 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Voir détails
                </Link>
                <button
                  type="button"
                  className="h-9 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f]"
                >
                  Imprimer le bon
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="text-zinc-500">
          Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur{" "}
          {filtered.length} commandes
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="h-8 w-8 rounded-md border border-zinc-200 text-zinc-600 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#8b0637] px-2 text-xs font-semibold text-white">
            {currentPage}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="h-8 w-8 rounded-md border border-zinc-200 text-zinc-600 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}
