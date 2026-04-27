"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/admin/Badge";
import { supabase } from "@/lib/supabase";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

type OrderItem = {
  quantity: number;
  price: number;
  products: {
    name: string | null;
    image: string | null;
  } | null;
};

type OrderDetails = {
  id: string;
  total: number;
  status: OrderStatus;
  created_at: string | null;
  clients: {
    name: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
  } | null;
  order_items: OrderItem[];
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

export default function CommandeDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      if (!orderId) {
        setErrorMessage("Identifiant de commande invalide.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, total, status, created_at, clients(name, phone, city, address), order_items(quantity, price, products(name, image))",
        )
        .eq("id", orderId)
        .single();

      if (!mounted) return;

      if (error) {
        setErrorMessage(error.message);
        setOrder(null);
        setIsLoading(false);
        return;
      }

      const raw = data as unknown as {
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
              quantity: number | null;
              price: number | string | null;
              products:
                | {
                    name: string | null;
                    image: string | null;
                  }
                | {
                    name: string | null;
                    image: string | null;
                  }[]
                | null;
            }[]
          | null;
      };

      const client = Array.isArray(raw.clients) ? raw.clients[0] : raw.clients;
      const items: OrderItem[] = (raw.order_items ?? []).map((item) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return {
          quantity: item.quantity ?? 0,
          price: Number(item.price ?? 0),
          products: product ? { name: product.name, image: product.image } : null,
        };
      });

      setOrder({
        id: raw.id,
        total: Number(raw.total ?? 0),
        status: raw.status,
        created_at: raw.created_at,
        clients: client ?? null,
        order_items: items,
      });
      setIsLoading(false);
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const subTotal = useMemo(
    () =>
      order?.order_items.reduce((sum, item) => sum + item.price * item.quantity, 0) ??
      0,
    [order],
  );
  const shipping = 20;
  const total = subTotal + shipping;
  const formattedDate = order?.created_at
    ? new Date(order.created_at).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#8b0637]" />
          <p className="mt-3 text-center text-sm text-zinc-500">Chargement de la commande...</p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="space-y-4">
        <Link href="/admin/commandes" className="inline-flex text-sm font-medium text-[#8b0637]">
          ← Retour aux commandes
        </Link>
        <article className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          Erreur: {errorMessage}
        </article>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="space-y-4">
        <Link href="/admin/commandes" className="inline-flex text-sm font-medium text-[#8b0637]">
          ← Retour aux commandes
        </Link>
        <article className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
          Aucune commande trouvée.
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Link href="/admin/commandes" className="inline-flex text-sm font-medium text-[#8b0637]">
        ← Retour aux commandes
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Commande #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{formattedDate}</p>
          </div>
          <Badge label={getStatusLabel(order.status)} variant={getBadgeVariant(order.status)} />
        </div>
      </div>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Client</h2>
        <div className="mt-3 space-y-1.5 text-sm text-zinc-600">
          <p>{order.clients?.name ?? "Client inconnu"}</p>
          <p>{order.clients?.phone ?? "-"}</p>
          <p>{order.clients?.city ?? "-"}</p>
          <p>{order.clients?.address ?? "-"}</p>
        </div>
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Produits</h2>
        <div className="mt-3 space-y-3">
          {order.order_items.length === 0 ? (
            <p className="text-sm text-zinc-500">Aucun produit dans cette commande.</p>
          ) : (
            order.order_items.map((item, index) => (
              <div
                key={`${item.products?.name ?? "item"}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3"
              >
                <div className="inline-flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-rose-50 text-xs font-semibold text-[#8b0637]">
                  {item.products?.image?.startsWith("http") ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.products.image}
                        alt={item.products.name ?? "Produit"}
                        className="h-full w-full object-cover"
                      />
                    </>
                  ) : (
                    "IMG"
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm text-zinc-700">
                  <p className="font-medium text-zinc-900">{item.products?.name ?? "Produit"}</p>
                  <p>Quantité: {item.quantity}</p>
                  <p>Prix: {item.price} DH</p>
                </div>
                <p className="text-sm font-semibold text-[#8b0637]">
                  {item.price * item.quantity} DH
                </p>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Résumé</h2>
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex items-center justify-between text-zinc-600">
            <span>Sous-total</span>
            <span>{subTotal} DH</span>
          </p>
          <p className="flex items-center justify-between text-zinc-600">
            <span>Livraison</span>
            <span>{shipping} DH</span>
          </p>
          <p className="flex items-center justify-between border-t border-zinc-100 pt-2 text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span className="text-[#8b0637]">{total} DH</span>
          </p>
        </div>
      </article>

      <button
        type="button"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-[#8b0637] px-4 text-sm font-semibold text-white transition hover:bg-[#74052f]"
      >
        Imprimer le bon
      </button>
    </section>
  );
}
