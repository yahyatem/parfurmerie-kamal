type CategoryCircleProps = {
  label: string;
  emoji: string;
};

export default function CategoryCircle({ label, emoji }: CategoryCircleProps) {
  return (
    <button type="button" className="flex w-[84px] shrink-0 flex-col items-center gap-2">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-2xl shadow-sm">
        {emoji}
      </span>
      <span className="line-clamp-2 text-center text-xs font-medium text-zinc-700">{label}</span>
    </button>
  );
}
