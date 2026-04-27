import type { LucideIcon } from "lucide-react";

type SummaryStatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorClass: string;
};

export default function SummaryStatCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: SummaryStatCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium text-zinc-500">{title}</p>
          <p className="text-xl font-semibold text-zinc-900">{value}</p>
        </div>
      </div>
    </article>
  );
}
