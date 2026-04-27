import Badge from "@/components/admin/Badge";

type RecordCardProps = {
  code: string;
  statusLabel: string;
  statusVariant: "active" | "inactive" | "pending" | "delivered";
  date: string;
  customer: string;
  phone: string;
  city: string;
  itemsCount: number;
  amount?: string;
  payment?: string;
  driver?: string;
};

export default function RecordCard({
  code,
  statusLabel,
  statusVariant,
  date,
  customer,
  phone,
  city,
  itemsCount,
  amount,
  payment,
  driver,
}: RecordCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">{code}</h3>
        <Badge label={statusLabel} variant={statusVariant} />
      </div>

      <div className="space-y-1.5 text-sm text-zinc-600">
        <p>{date}</p>
        <p>{customer}</p>
        <p>{phone}</p>
        <p>{city}</p>
      </div>

      <div className="mt-3 border-t border-dashed border-zinc-200 pt-3">
        <p className="text-sm text-zinc-700">{itemsCount} articles</p>
        {amount ? (
          <p className="mt-1 text-base font-semibold text-[#8b0637]">{amount}</p>
        ) : null}
        {payment ? <p className="mt-1 text-xs text-zinc-500">{payment}</p> : null}
        {driver ? <p className="mt-1 text-xs text-zinc-500">Livreur: {driver}</p> : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="h-9 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Voir détails
        </button>
        <button
          type="button"
          className="h-9 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f]"
        >
          Imprimer le bon
        </button>
      </div>
    </article>
  );
}
