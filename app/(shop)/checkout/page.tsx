"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

function StepIndicator() {
  const steps = [
    { id: 1, label: "Livraison", state: "active" },
    { id: 2, label: "Paiement", state: "pending" },
    { id: 3, label: "Confirmation", state: "pending" },
  ] as const;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  step.state === "active"
                    ? "bg-[#97002f] text-white"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {step.id}
              </span>
              <span
                className={`text-xs font-medium ${
                  step.state === "active" ? "text-[#97002f]" : "text-zinc-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && <span className="h-px flex-1 bg-zinc-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}

type SummaryCardProps = {
  orderItems: Array<{
    id: string;
    image: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subTotal: number;
  shippingFee: number;
  reduction: number;
  total: number;
};

function SummaryCard({ orderItems, subTotal, shippingFee, reduction, total }: SummaryCardProps) {
  return (
    <section className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-900">Recapitulatif commande</h2>
      <div className="space-y-3">
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="inline-flex h-14 w-12 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-xs font-semibold text-[#97002f]">
              {item.image}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-zinc-900">{item.name}</p>
              <p className="text-xs text-zinc-500">Quantite: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-zinc-800">{item.price} DH</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-zinc-100 pt-2 text-sm">
        <p className="flex items-center justify-between text-zinc-600">
          <span>Sous-total</span>
          <span>{subTotal} DH</span>
        </p>
        <p className="flex items-center justify-between text-zinc-600">
          <span>Livraison</span>
          <span>{shippingFee} DH</span>
        </p>
        <p className="flex items-center justify-between text-zinc-600">
          <span>Reduction</span>
          <span>-{reduction} DH</span>
        </p>
        <p className="flex items-center justify-between text-base font-bold text-zinc-900">
          <span>Total</span>
          <span className="text-[#97002f]">{total} DH</span>
        </p>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useStore((state) => state.items);
  const subTotal = useStore((state) => state.totalPrice);
  const clearCart = useStore((state) => state.clearCart);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"home" | "relay">("home");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const shippingFee = shippingMethod === "home" ? 20 : 10;
  const reduction = cartItems.length > 0 ? 60 : 0;
  const total = useMemo(
    () => Math.max(0, subTotal + shippingFee - reduction),
    [subTotal, shippingFee, reduction],
  );

  const orderItems = cartItems.map((item) => ({
    id: item.id,
    image: item.image,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  async function handleCheckout() {
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Votre panier est vide.");
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMessage("Veuillez remplir les informations de livraison obligatoires.");
      return;
    }

    setIsSubmitting(true);

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        address: `${address.trim()}${postalCode.trim() ? ` (${postalCode.trim()})` : ""}`,
        city: city.trim(),
      })
      .select("id")
      .single();

    if (clientError || !clientData) {
      if (clientError) {
        console.error("CLIENT INSERT ERROR:", clientError);
      }
      setErrorMessage(clientError?.message ?? "Impossible d'enregistrer le client.");
      setIsSubmitting(false);
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        client_id: clientData.id,
        total,
        status: "pending",
        note: note.trim() || null,
      })
      .select("id")
      .single();

    if (orderError || !orderData) {
      if (orderError) {
        console.error("ORDER INSERT ERROR:", orderError);
      }
      setErrorMessage(orderError?.message ?? "Impossible d'enregistrer la commande.");
      setIsSubmitting(false);
      return;
    }

    const orderItemsPayload = cartItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

    if (itemsError) {
      console.error("ORDER ITEMS INSERT ERROR:", itemsError);
      setErrorMessage(itemsError.message);
      setIsSubmitting(false);
      return;
    }

    clearCart();
    setIsSubmitting(false);
    router.push("/confirmation");
  }

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-2xl font-semibold text-zinc-900">Paiement</h1>
      </section>

      <StepIndicator />

      <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Informations de livraison</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
          />
          <input
            type="text"
            placeholder="Telephone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
          />
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ville"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
            />
            <input
              type="text"
              placeholder="Code postal"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Methode de livraison</h2>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="shipping"
              checked={shippingMethod === "home"}
              onChange={() => setShippingMethod("home")}
              className="accent-[#97002f]"
            />
            <span className="text-sm text-zinc-700">Livraison a domicile</span>
          </span>
          <span className="text-sm font-semibold text-zinc-800">20 DH</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="shipping"
              checked={shippingMethod === "relay"}
              onChange={() => setShippingMethod("relay")}
              className="accent-[#97002f]"
            />
            <span className="text-sm text-zinc-700">Livraison point relais</span>
          </span>
          <span className="text-sm font-semibold text-zinc-800">10 DH</span>
        </label>
      </section>

      <section className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Informations complementaires</h2>
        <textarea
          placeholder="Ajouter une note (optionnel)"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
        />
      </section>

      <SummaryCard
        orderItems={orderItems}
        subTotal={subTotal}
        shippingFee={shippingFee}
        reduction={reduction}
        total={total}
      />

      <section className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Methode de paiement</h2>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2">
          <input type="radio" name="payment" defaultChecked className="accent-[#97002f]" />
          <span className="text-sm text-zinc-700">Paiement a la livraison</span>
        </label>
      </section>

      {errorMessage && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={isSubmitting}
        className="inline-flex h-[48px] w-full items-center justify-center rounded-xl bg-[#97002f] text-sm font-semibold text-white"
      >
        {isSubmitting ? "Validation..." : "Valider et passer la commande"}
      </button>
    </div>
  );
}
