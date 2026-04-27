import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  colorClass: string;
};

export default function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  colorClass,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>
        </div>
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}
