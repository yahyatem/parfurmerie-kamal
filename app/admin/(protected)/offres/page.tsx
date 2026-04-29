"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import Badge from "@/components/admin/Badge";
import DataTable from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase";

type Offer = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  image: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
};

type DbOfferRow = {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;
  image: string | null;
  link: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

const ITEMS_PER_PAGE = 8;

// SQL reference (run manually in Supabase SQL editor, do not run in app):
// create table if not exists public.offers (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   subtitle text,
//   description text,
//   button_text text,
//   image text,
//   link text,
//   is_active boolean not null default true,
//   sort_order int not null default 0,
//   created_at timestamp with time zone not null default now()
// );
// alter table public.offers enable row level security;

function OfferImage({ image, title }: { image: string; title: string }) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded bg-zinc-100 text-[10px] text-zinc-500">
        OFFRE
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={title}
      onError={() => setHasError(true)}
      className="h-12 w-12 rounded object-cover"
    />
  );
}

export default function OffresPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formButtonText, setFormButtonText] = useState("");
  const [formLink, setFormLink] = useState("/promotions");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState("");

  useEffect(() => {
    void loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from("offers")
      .select("id, title, subtitle, description, button_text, image, link, is_active, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.log("offers load error:", error);
      setErrorMessage(`Impossible de charger les offres: ${error.message}`);
      setOffers([]);
      setLoading(false);
      return;
    }

    const mapped = ((data ?? []) as DbOfferRow[]).map((item) => ({
      id: item.id,
      title: item.title ?? "Offre",
      subtitle: item.subtitle ?? "",
      description: item.description ?? "",
      buttonText: item.button_text ?? "",
      image: item.image ?? "",
      link: item.link ?? "/promotions",
      sortOrder: Number(item.sort_order ?? 0),
      isActive: Boolean(item.is_active),
    }));
    setOffers(mapped);
    setLoading(false);
  }

  function resetForm() {
    setEditingOffer(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormDescription("");
    setFormButtonText("");
    setFormLink("/promotions");
    setFormSortOrder("0");
    setFormIsActive(true);
    setFormImageUrl("");
    setFormImageFile(null);
    if (formImagePreview) URL.revokeObjectURL(formImagePreview);
    setFormImagePreview("");
    setErrorMessage("");
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function handleEdit(offer: Offer) {
    resetForm();
    setEditingOffer(offer);
    setFormTitle(offer.title);
    setFormSubtitle(offer.subtitle);
    setFormDescription(offer.description);
    setFormButtonText(offer.buttonText);
    setFormLink(offer.link || "/promotions");
    setFormSortOrder(String(offer.sortOrder));
    setFormIsActive(offer.isActive);
    setFormImageUrl(offer.image);
    setIsFormOpen(true);
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (formImagePreview) URL.revokeObjectURL(formImagePreview);
    const preview = URL.createObjectURL(file);
    setFormImageFile(file);
    setFormImagePreview(preview);
  }

  async function uploadImageIfNeeded() {
    if (!formImageFile) return formImageUrl;
    setUploadingImage(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setUploadingImage(false);
      throw new Error("Session admin expirée. Veuillez vous reconnecter.");
    }

    const filePath = `${Date.now()}-${formImageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("offers")
      .upload(filePath, formImageFile, { upsert: true });

    if (uploadError) {
      console.error("Offer upload error:", uploadError);
      setUploadingImage(false);
      throw new Error(`Erreur upload image: ${uploadError.message}`);
    }

    const publicUrl = supabase.storage.from("offers").getPublicUrl(filePath).data.publicUrl;
    setUploadingImage(false);
    return publicUrl;
  }

  async function handleSaveOffer() {
    setErrorMessage("");
    if (!formTitle.trim()) {
      setErrorMessage("Le titre est obligatoire.");
      return;
    }
    if (!formLink.trim()) {
      setErrorMessage("Le lien est obligatoire.");
      return;
    }

    setSaving(true);
    try {
      const finalImageUrl = await uploadImageIfNeeded();
      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        description: formDescription.trim(),
        button_text: formButtonText.trim(),
        image: finalImageUrl || null,
        link: formLink.trim(),
        sort_order: Number(formSortOrder || 0),
        is_active: formIsActive,
      };

      const result = editingOffer
        ? await supabase
            .from("offers")
            .update(payload)
            .eq("id", editingOffer.id)
            .select("id, title, subtitle, description, button_text, image, link, is_active, sort_order")
            .single()
        : await supabase
            .from("offers")
            .insert(payload)
            .select("id, title, subtitle, description, button_text, image, link, is_active, sort_order")
            .single();

      if (result.error || !result.data) {
        if (result.error) {
          console.log("offers save error:", result.error);
        }
        setErrorMessage(result.error?.message ?? "Impossible d'enregistrer l'offre.");
        setSaving(false);
        return;
      }

      await loadOffers();
      setSaving(false);
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.log("offers save exception:", error);
      setErrorMessage(error instanceof Error ? error.message : "Erreur inattendue.");
      setSaving(false);
    }
  }

  async function handleDeleteOffer(offerId: string) {
    const confirmed = window.confirm("Supprimer cette offre ?");
    if (!confirmed) return;

    const { error } = await supabase.from("offers").delete().eq("id", offerId);
    if (error) {
      console.log("offers delete error:", error);
      setErrorMessage(`Suppression impossible: ${error.message}`);
      return;
    }
    setOffers((prev) => prev.filter((item) => item.id !== offerId));
  }

  const filtered = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        offer.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        status === "all" ||
        (status === "active" && offer.isActive) ||
        (status === "inactive" && !offer.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [offers, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section className="grid max-w-full gap-6 overflow-hidden 2xl:grid-cols-[2.1fr,1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Offres</h1>
          <p className="mt-1 text-sm text-zinc-500">Accueil / Offres</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher une offre..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#8b0637] px-4 text-sm font-semibold text-white transition hover:bg-[#74052f] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Ajouter une offre
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-4 md:hidden">
          {loading ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              Chargement des offres...
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              Aucune offre trouvée.
            </div>
          ) : (
            paginated.map((offer) => (
              <article key={offer.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <OfferImage image={offer.image} title={offer.title} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-base font-semibold text-zinc-900">{offer.title}</p>
                    <p className="line-clamp-1 text-sm text-zinc-500">{offer.subtitle || "-"}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge label={offer.isActive ? "Actif" : "Inactif"} variant={offer.isActive ? "active" : "inactive"} />
                      <span className="text-xs text-zinc-500">Ordre: {offer.sortOrder}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <ActionButtons onEdit={() => handleEdit(offer)} />
                  <button
                    type="button"
                    onClick={() => void handleDeleteOffer(offer.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                    aria-label="Supprimer l'offre"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden max-w-full overflow-x-auto md:block">
          <div className="min-w-[980px]">
            <DataTable
              columns={[
                {
                  key: "image",
                  header: "Image",
                  render: (item) => <OfferImage image={item.image} title={item.title} />,
                },
                { key: "title", header: "Titre", render: (item) => item.title },
                { key: "subtitle", header: "Sous-titre", render: (item) => item.subtitle || "-" },
                { key: "buttonText", header: "Texte bouton", render: (item) => item.buttonText || "-" },
                { key: "link", header: "Lien", render: (item) => item.link },
                { key: "sortOrder", header: "Ordre", render: (item) => item.sortOrder },
                {
                  key: "status",
                  header: "Statut",
                  render: (item) => (
                    <Badge label={item.isActive ? "Actif" : "Inactif"} variant={item.isActive ? "active" : "inactive"} />
                  ),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      <ActionButtons onEdit={() => handleEdit(item)} />
                      <button
                        type="button"
                        onClick={() => void handleDeleteOffer(item.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                        aria-label="Supprimer l'offre"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={paginated}
              getRowKey={(item) => item.id}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-zinc-500">
            Affichage de {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} offres
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="h-8 w-8 rounded-md border border-zinc-200 text-zinc-600 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              {"<"}
            </button>
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#8b0637] px-2 text-xs font-semibold text-white">
              {currentPage}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="h-8 w-8 rounded-md border border-zinc-200 text-zinc-600 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 hidden bg-black/30 xl:block"
            onClick={() => {
              setIsFormOpen(false);
              resetForm();
            }}
          />

          <aside className="fixed right-0 top-0 z-50 hidden h-screen w-full max-w-xl overflow-y-auto border-l border-zinc-200 bg-white p-5 shadow-xl xl:block">
            <h2 className="text-xl font-semibold text-zinc-900">
              {editingOffer ? "Modifier l'offre" : "Ajouter une offre"}
            </h2>
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveOffer();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Titre *</span>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Sous-titre</span>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(event) => setFormSubtitle(event.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Description</span>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Texte bouton</span>
                  <input
                    type="text"
                    value={formButtonText}
                    onChange={(event) => setFormButtonText(event.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Ordre</span>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(event) => setFormSortOrder(event.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Lien *</span>
                <input
                  type="text"
                  value={formLink}
                  onChange={(event) => setFormLink(event.target.value)}
                  placeholder="/promotions"
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="sr-only"
                  id="desktop-offer-image-input"
                />
                <label
                  htmlFor="desktop-offer-image-input"
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:bg-zinc-100"
                >
                  <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">Cliquez pour sélectionner une image</p>
                </label>
              </label>

              {formImagePreview || formImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formImagePreview || formImageUrl}
                  alt="Aperçu offre"
                  className="h-28 w-24 rounded-lg border border-zinc-200 object-cover"
                />
              ) : null}

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(event) => setFormIsActive(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-[#8b0637] focus:ring-[#8b0637]/30"
                />
                <span className="text-sm text-zinc-700">Offre active</span>
              </label>

              {uploadingImage ? (
                <p className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Upload image en cours...
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="h-11 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="h-11 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f] disabled:opacity-60"
                >
                  {saving ? "Enregistrement..." : editingOffer ? "Mettre a jour" : "Enregistrer"}
                </button>
              </div>
            </form>
          </aside>

          <div className="fixed inset-0 z-50 xl:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            />
            <aside className="absolute inset-x-0 bottom-0 top-0 overflow-y-auto bg-white p-5 shadow-xl">
              <h2 className="text-xl font-semibold text-zinc-900">
                {editingOffer ? "Modifier l'offre" : "Ajouter une offre"}
              </h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveOffer();
                }}
              >
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Titre *</span>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(event) => setFormTitle(event.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Sous-titre</span>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(event) => setFormSubtitle(event.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Description</span>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(event) => setFormDescription(event.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">Texte bouton</span>
                    <input
                      type="text"
                      value={formButtonText}
                      onChange={(event) => setFormButtonText(event.target.value)}
                      className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">Ordre</span>
                    <input
                      type="number"
                      value={formSortOrder}
                      onChange={(event) => setFormSortOrder(event.target.value)}
                      className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Lien *</span>
                  <input
                    type="text"
                    value={formLink}
                    onChange={(event) => setFormLink(event.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Image</span>
                  <input
                    id="mobile-offer-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="sr-only"
                  />
                  <label
                    htmlFor="mobile-offer-image-input"
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:bg-zinc-100"
                  >
                    <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                    <p className="text-xs text-zinc-500">Cliquez pour sélectionner une image</p>
                  </label>
                </label>
                {formImagePreview || formImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formImagePreview || formImageUrl}
                    alt="Aperçu offre"
                    className="h-28 w-24 rounded-lg border border-zinc-200 object-cover"
                  />
                ) : null}
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(event) => setFormIsActive(event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-[#8b0637] focus:ring-[#8b0637]/30"
                  />
                  <span className="text-sm text-zinc-700">Offre active</span>
                </label>
                {uploadingImage ? (
                  <p className="inline-flex items-center gap-2 text-xs text-zinc-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Upload image en cours...
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="h-11 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImage}
                    className="h-11 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f] disabled:opacity-60"
                  >
                    {saving ? "Enregistrement..." : editingOffer ? "Mettre a jour" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </>
      ) : null}

      <div className="hidden 2xl:block">
        <aside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Gestion des offres</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Les offres actives alimentent automatiquement le slider de la page d&apos;accueil.
          </p>
        </aside>
      </div>
    </section>
  );
}
