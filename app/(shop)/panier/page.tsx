import { Minus, Plus, ShieldCheck, Truck, Undo2, X } from "lucide-react";

type CartItem = {
  id: string;
  image: string;
  name: string;
  brand: string;
  description: string;
  price: string;
  quantity: number;
};

const cartItems: CartItem[] = [
  {
    id: "c1",
    image: "C1",
    name: "La Vie Est Belle",
    brand: "Lancome",
    description: "Eau de parfum 50ml",
    price: "890 DH",
    quantity: 1,
  },
  {
    id: "c2",
    image: "C2",
    name: "Serum Vitamine C",
    brand: "Garnier",
    description: "Eclat 30ml",
    price: "129 DH",
    quantity: 1,
  },
  {
    id: "c3",
    image: "C3",
    name: "Palette Nude Glow",
    brand: "Essence",
    description: "10 couleurs",
    price: "149 DH",
    quantity: 1,
  },
];

const benefits = [
  { label: "Livraison rapide", icon: Truck },
  { label: "Produits authentiques", icon: ShieldCheck },
  { label: "Retour facile", icon: Undo2 },
];

export default function PanierPage() {
  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Mon panier (3)</h1>
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700"
        >
          Vider le panier
        </button>
      </section>

      <section className="space-y-4">
        {cartItems.map((item) => (
          <article
            key={item.id}
            className="relative flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
          >
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-sm font-semibold text-[#97002f]">
              {item.image}
            </div>

            <div className="min-w-0 flex-1">
              <button
                type="button"
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"
                aria-label="Retirer l'article"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="pr-8 text-sm font-semibold text-zinc-900">{item.name}</p>
              <p className="text-xs text-zinc-500">{item.brand}</p>
              <p className="line-clamp-1 text-xs text-zinc-400">{item.description}</p>
              <p className="mt-1 text-sm font-bold text-[#97002f]">{item.price}</p>

              <div className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                En stock
              </div>

              <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-2 py-1">
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-700"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-4 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3">
        <div className="grid grid-cols-3 gap-2">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.label} className="text-center">
                <span className="mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#97002f] shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-1 text-[11px] text-zinc-600">{benefit.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Resume de commande</h2>
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex items-center justify-between text-zinc-600">
            <span>Sous-total</span>
            <span>1 168 DH</span>
          </p>
          <p className="flex items-center justify-between text-zinc-600">
            <span>Livraison</span>
            <span>30 DH</span>
          </p>
          <p className="flex items-center justify-between text-zinc-600">
            <span>Reduction</span>
            <span>-60 DH</span>
          </p>
          <p className="mt-1 flex items-center justify-between border-t border-zinc-100 pt-2 text-base font-bold text-zinc-900">
            <span>Total a payer</span>
            <span className="text-[#97002f]">1 138 DH</span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-3 text-sm text-zinc-600">
        Vous avez un code promo ?
      </section>

      <button
        type="button"
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#97002f] px-4 text-sm font-semibold text-white shadow-sm"
      >
        Passer la commande
      </button>

      <p className="pb-2 text-center text-xs text-zinc-500">Paiement securise</p>
    </div>
  );
}
