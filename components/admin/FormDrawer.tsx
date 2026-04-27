import { Upload } from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
};

type FormDrawerProps = {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  imageLabel: string;
  statusOptions: SelectOption[];
  extraFields?: React.ReactNode;
  submitLabel: string;
};

export default function FormDrawer({
  title,
  nameLabel,
  namePlaceholder,
  descriptionLabel,
  descriptionPlaceholder,
  imageLabel,
  statusOptions,
  extraFields,
  submitLabel,
}: FormDrawerProps) {
  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      <form className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            {nameLabel} *
          </span>
          <input
            type="text"
            placeholder={namePlaceholder}
            className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#8b0637]/20"
          />
        </label>

        {extraFields}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            {descriptionLabel}
          </span>
          <textarea
            rows={4}
            placeholder={descriptionPlaceholder}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#8b0637]/20"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            {imageLabel}
          </span>
          <div className="flex h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center">
            <Upload className="mb-2 h-5 w-5 text-zinc-500" />
            <p className="text-sm font-medium text-zinc-700">
              Cliquez pour uploader une image
            </p>
            <p className="text-xs text-zinc-500">PNG, JPG ou WEBP</p>
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700">
            Statut *
          </span>
          <select className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            className="h-11 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            type="button"
            className="h-11 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </aside>
  );
}
