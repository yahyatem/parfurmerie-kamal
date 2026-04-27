import { CheckCircle2 } from "lucide-react";

const orderItems = [
  { id: "1", image: "P1", name: "La Vie Est Belle", price: "890 DH", quantity: 1 },
  { id: "2", image: "P2", name: "Serum Vitamine C", price: "129 DH", quantity: 1 },
  { id: "3", image: "P3", name: "Palette Nude Glow", price: "149 DH", quantity: 1 },
];

function StepIndicatorDone() {
  const steps = ["Livraison", "Paiement", "Confirmation"];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#97002f] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-xs font-medium text-[#97002f]">{step}</span>
            </div>
            {index < steps.length - 1 && <span className="h-px flex-1 bg-zinc-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard() {
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
            <p className="text-sm font-semibold text-zinc-800">{item.price}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-zinc-100 pt-2 text-sm">
        <p className="flex items-center justify-between text-zinc-600">
          <span>Sous-total</span>
          <span>1 168 DH</span>
        </p>
        <p className="flex items-center justify-between text-zinc-600">
          <span>Livraison</span>
          <span>20 DH</span>
        </p>
        <p className="flex items-center justify-between text-zinc-600">
          <span>Reduction</span>
          <span>-60 DH</span>
        </p>
        <p className="flex items-center justify-between text-base font-bold text-zinc-900">
          <span>Total</span>
          <span className="text-[#97002f]">1 128 DH</span>
        </p>
      </div>
    </section>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="space-y-4">
      <StepIndicatorDone />

      <section className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Merci pour votre commande !</h1>
        <p className="mt-1 text-sm text-zinc-500">Votre commande a ete passee avec succes.</p>
      </section>

      <section className="space-y-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-sm">
        <p className="flex items-center justify-between">
          <span className="text-zinc-500">Numero commande</span>
          <span className="font-semibold text-zinc-900">#DS745892</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-zinc-500">Date</span>
          <span className="font-medium text-zinc-800">27/04/2026</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="text-zinc-500">Livraison</span>
          <span className="font-medium text-zinc-800">Sous 24-48h</span>
        </p>
      </section>

      <SummaryCard />

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Paiement</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Le paiement sera effectue a la livraison, directement a reception de votre commande.
        </p>
      </section>

      <button
        type="button"
        className="inline-flex h-[48px] w-full items-center justify-center rounded-xl bg-[#97002f] text-sm font-semibold text-white"
      >
        Suivre ma commande
      </button>
    </div>
  );
}
