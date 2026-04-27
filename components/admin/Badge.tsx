type BadgeVariant = "active" | "inactive" | "pending" | "delivered";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-zinc-100 text-zinc-600",
  pending: "bg-amber-100 text-amber-700",
  delivered: "bg-sky-100 text-sky-700",
};

export default function Badge({ label, variant = "inactive" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
