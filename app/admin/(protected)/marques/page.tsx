"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import Badge from "@/components/admin/Badge";
import DataTable from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase";

type Brand = {
  id: string;
  logo: string;
  name: string;
  description: string;
  productsCount: number;
  status: "active" | "inactive";
};

type DbBrand = {
  id: string | number;
  name: string | null;
  description: string | null;
  logo: string | null;
  status: string | null;
};

type DbProductBrand = {
  brand_id: string | number | null;
};

const ITEMS_PER_PAGE = 6;

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function BrandLogo({ logo, name }: { logo: string; name: string }) {
  const [hasError, setHasError] = useState(false);
  if (logo && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt={name} onError={() => setHasError(true)} className="h-full w-full object-cover" />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#8b0637]">
      {initialsFromName(name)}
    </div>
  );
}

export default function MarquesPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formLogoFile, setFormLogoFile] = useState<File | null>(null);
  const [formLogoPreview, setFormLogoPreview] = useState("");

  useEffect(() => {
    void loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    setErrorMessage("");
    const [brandsRes, productsRes] = await Promise.all([
      supabase
        .from("brands")
        .select("id, name, description, logo, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("brand_id"),
    ]);

    if (brandsRes.error || productsRes.error) {
      console.error("Brands load error:", { brandsError: brandsRes.error, productsError: productsRes.error });
      const msg = brandsRes.error?.message ?? productsRes.error?.message ?? "Erreur inconnue";
      if (/column .*description.* does not exist|column .*logo.* does not exist|column .*status.* does not exist|column .*created_at.* does not exist/i.test(msg)) {
        setErrorMessage(
          "Colonnes manquantes dans brands. SQL: alter table brands add column if not exists description text, add column if not exists logo text, add column if not exists status text default 'actif', add column if not exists created_at timestamp default now();",
        );
      } else {
        setErrorMessage(`Impossible de charger les marques: ${msg}`);
      }
      setBrands([]);
      setLoading(false);
      return;
    }

    const countsByBrand = new Map<string, number>();
    ((productsRes.data ?? []) as DbProductBrand[]).forEach((item) => {
      if (!item.brand_id) return;
      const key = String(item.brand_id);
      countsByBrand.set(key, (countsByBrand.get(key) ?? 0) + 1);
    });

    const mapped: Brand[] = ((brandsRes.data ?? []) as DbBrand[]).map((item) => {
      const normalizedStatus: Brand["status"] =
        item.status?.toLowerCase() === "inactive" || item.status?.toLowerCase() === "inactif"
          ? "inactive"
          : "active";
      return {
        id: String(item.id),
        logo: item.logo ?? "",
        name: item.name ?? "Marque",
        description: item.description ?? "",
        productsCount: countsByBrand.get(String(item.id)) ?? 0,
        status: normalizedStatus,
      };
    });

    setBrands(mapped);
    setLoading(false);
  }

  function resetForm() {
    setEditingBrand(null);
    setFormName("");
    setFormDescription("");
    setFormStatus("active");
    setFormLogoUrl("");
    setFormLogoFile(null);
    if (formLogoPreview) URL.revokeObjectURL(formLogoPreview);
    setFormLogoPreview("");
    setErrorMessage("");
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function handleEdit(brand: Brand) {
    resetForm();
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormDescription(brand.description);
    setFormStatus(brand.status);
    setFormLogoUrl(brand.logo);
    setIsFormOpen(true);
  }

  function handleLogoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (formLogoPreview) URL.revokeObjectURL(formLogoPreview);
    setFormLogoFile(file);
    setFormLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogoIfNeeded() {
    if (!formLogoFile) return formLogoUrl;
    setUploadingLogo(true);
    const filePath = `${Date.now()}-${formLogoFile.name}`;
    const { error: uploadError } = await supabase.storage.from("brands").upload(filePath, formLogoFile, {
      upsert: true,
    });
    if (uploadError) {
      console.error("Brand logo upload error:", uploadError);
      setUploadingLogo(false);
      throw new Error(`Erreur upload logo: ${uploadError.message}`);
    }
    const publicUrl = supabase.storage.from("brands").getPublicUrl(filePath).data.publicUrl;
    setUploadingLogo(false);
    return publicUrl;
  }

  async function handleSaveBrand() {
    setErrorMessage("");
    if (!formName.trim()) {
      setErrorMessage("Le nom de la marque est obligatoire.");
      return;
    }
    setSaving(true);
    try {
      const finalLogoUrl = await uploadLogoIfNeeded();
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        status: formStatus === "inactive" ? "inactif" : "actif",
        logo: finalLogoUrl || null,
      };

      const result = editingBrand
        ? await supabase
            .from("brands")
            .update(payload)
            .eq("id", editingBrand.id)
            .select("id, name, description, logo, status")
            .single()
        : await supabase
            .from("brands")
            .insert(payload)
            .select("id, name, description, logo, status")
            .single();

      if (result.error || !result.data) {
        console.error("Brand save error:", result.error);
        setErrorMessage(result.error?.message ?? "Impossible d'enregistrer la marque.");
        setSaving(false);
        return;
      }

      await loadBrands();
      setSaving(false);
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Brand save exception:", error);
      setErrorMessage(error instanceof Error ? error.message : "Erreur inattendue.");
      setSaving(false);
    }
  }

  async function handleDelete(brandId: string) {
    const confirmed = window.confirm("Supprimer cette marque ?");
    if (!confirmed) return;
    const { error } = await supabase.from("brands").delete().eq("id", brandId);
    if (error) {
      console.error("Brand delete error:", error);
      setErrorMessage(`Suppression impossible: ${error.message}`);
      return;
    }
    await loadBrands();
  }

  const filtered = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || brand.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, brands]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section className="grid max-w-full gap-6 overflow-hidden 2xl:grid-cols-[2.1fr,1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Marques</h1>
          <p className="mt-1 text-sm text-zinc-500">Accueil / Marques</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher une marque..."
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
              Ajouter une marque
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
              Chargement des marques...
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              Aucune marque trouvée.
            </div>
          ) : (
            paginated.map((brand) => (
              <article key={brand.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-sm font-semibold text-zinc-500">
                    <BrandLogo logo={brand.logo} name={brand.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-base font-bold text-zinc-900">{brand.name}</p>
                      <Badge label={brand.status === "active" ? "Actif" : "Inactif"} variant={brand.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{brand.description}</p>
                    <p className="mt-2 text-xs font-medium text-zinc-600">{brand.productsCount} produits</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <ActionButtons onEdit={() => handleEdit(brand)} />
                  <button
                    type="button"
                    onClick={() => void handleDelete(brand.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                    aria-label="Supprimer la marque"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden max-w-full overflow-x-auto md:block">
          <div className="min-w-[900px]">
            <DataTable
              columns={[
                {
                  key: "logo",
                  header: "Logo",
                  render: (item) => (
                    <span className="inline-flex h-10 w-16 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700">
                      <BrandLogo logo={item.logo} name={item.name} />
                    </span>
                  ),
                },
                { key: "name", header: "Nom de la marque", render: (item) => item.name },
                {
                  key: "description",
                  header: "Description",
                  render: (item) => item.description,
                },
                {
                  key: "count",
                  header: "Nombre de produits",
                  render: (item) => item.productsCount,
                },
                {
                  key: "status",
                  header: "Statut",
                  render: (item) => (
                    <Badge label={item.status === "active" ? "Actif" : "Inactif"} variant={item.status} />
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
                        onClick={() => void handleDelete(item.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                        aria-label="Supprimer la marque"
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

        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="text-zinc-500">
            Affichage de {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur{" "}
            {filtered.length} marques
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
              {editingBrand ? "Modifier la marque" : "Ajouter une nouvelle marque"}
            </h2>
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveBrand();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nom de la marque *</span>
                <input
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
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
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Logo de la marque</span>
                <input
                  id="desktop-brand-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="sr-only"
                />
                <label
                  htmlFor="desktop-brand-logo-input"
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:bg-zinc-100"
                >
                  <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">Cliquez pour sélectionner un logo</p>
                </label>
              </label>
              {formLogoPreview || formLogoUrl ? (
                <div className="h-20 w-20 overflow-hidden rounded-lg border border-zinc-200">
                  <BrandLogo logo={formLogoPreview || formLogoUrl} name={formName || "Marque"} />
                </div>
              ) : null}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Statut *</span>
                <select
                  value={formStatus}
                  onChange={(event) => setFormStatus(event.target.value as "active" | "inactive")}
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </label>
              {uploadingLogo ? (
                <p className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Upload logo en cours...
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
                  disabled={saving || uploadingLogo}
                  className="h-11 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f] disabled:opacity-60"
                >
                  {saving ? "Enregistrement..." : editingBrand ? "Mettre à jour" : "Enregistrer la marque"}
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
                {editingBrand ? "Modifier la marque" : "Ajouter une nouvelle marque"}
              </h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveBrand();
                }}
              >
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nom de la marque *</span>
                  <input
                    type="text"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
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
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Logo de la marque</span>
                  <input
                    id="mobile-brand-logo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="sr-only"
                  />
                  <label
                    htmlFor="mobile-brand-logo-input"
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:bg-zinc-100"
                  >
                    <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                    <p className="text-xs text-zinc-500">Cliquez pour sélectionner un logo</p>
                  </label>
                </label>
                {formLogoPreview || formLogoUrl ? (
                  <div className="h-20 w-20 overflow-hidden rounded-lg border border-zinc-200">
                    <BrandLogo logo={formLogoPreview || formLogoUrl} name={formName || "Marque"} />
                  </div>
                ) : null}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Statut *</span>
                  <select
                    value={formStatus}
                    onChange={(event) => setFormStatus(event.target.value as "active" | "inactive")}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </label>
                {uploadingLogo ? (
                  <p className="inline-flex items-center gap-2 text-xs text-zinc-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Upload logo en cours...
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
                    disabled={saving || uploadingLogo}
                    className="h-11 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f] disabled:opacity-60"
                  >
                    {saving ? "Enregistrement..." : editingBrand ? "Mettre à jour" : "Enregistrer la marque"}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </>
      ) : null}

      <div className="hidden 2xl:block">
        <aside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Formulaire marque</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Cliquez sur &quot;Ajouter une marque&quot; pour ouvrir le formulaire.
          </p>
        </aside>
      </div>
    </section>
  );
}
