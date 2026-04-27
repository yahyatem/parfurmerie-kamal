import { Eye, Pencil, Trash2 } from "lucide-react";

type ActionButtonsProps = {
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ActionButtons({
  showView = false,
  showEdit = true,
  showDelete = true,
  onView,
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {showView ? (
        <button
          type="button"
          onClick={onView}
          className="rounded-md border border-zinc-200 p-1.5 text-zinc-600 transition hover:bg-zinc-100"
          aria-label="Voir"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {showEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-zinc-200 p-1.5 text-zinc-600 transition hover:bg-zinc-100"
          aria-label="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {showDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-rose-100 p-1.5 text-rose-500 transition hover:bg-rose-50"
          aria-label="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
