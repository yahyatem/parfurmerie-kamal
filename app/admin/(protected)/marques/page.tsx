"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import Badge from "@/components/admin/Badge";
import DataTable from "@/components/admin/DataTable";
import FormDrawer from "@/components/admin/FormDrawer";

type Brand = {
  id: string;
  logo: string;
  name: string;
  description: string;
  productsCount: number;
  status: "active" | "inactive";
};

const brandsData: Brand[] = [
  {
    id: "M001",
    logo: "LA",
    name: "Lancôme",
    description: "Marque française de parfums et cosmétiques",
    productsCount: 128,
    status: "active",
  },
  {
    id: "M002",
    logo: "LO",
    name: "L'Oréal Paris",
    description: "Leader mondial des cosmétiques",
    productsCount: 156,
    status: "active",
  },
  {
    id: "M003",
    logo: "DI",
    name: "Dior",
    description: "Maison de luxe française",
    productsCount: 98,
    status: "active",
  },
  {
    id: "M004",
    logo: "CH",
    name: "Chloé",
    description: "Parfums et produits de beauté féminins",
    productsCount: 64,
    status: "active",
  },
  {
    id: "M005",
    logo: "YS",
    name: "Yves Saint Laurent",
    description: "Parfums de luxe pour hommes et femmes",
    productsCount: 87,
    status: "inactive",
  },
  {
    id: "M006",
    logo: "NU",
    name: "Nuxe",
    description: "Cosmétiques d'origine naturelle",
    productsCount: 33,
    status: "active",
  },
];

const ITEMS_PER_PAGE = 6;

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-zinc-500">
          {brand.logo || "LOGO"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-base font-bold text-zinc-900">{brand.name}</p>
            <Badge
              label={brand.status === "active" ? "Actif" : "Inactif"}
              variant={brand.status}
            />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{brand.description}</p>
          <p className="mt-2 text-xs font-medium text-zinc-600">{brand.productsCount} produits</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <ActionButtons />
      </div>
    </article>
  );
}

export default function MarquesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return brandsData.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || brand.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#8b0637] px-4 text-sm font-semibold text-white transition hover:bg-[#74052f] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Ajouter une marque
            </button>
          </div>
        </div>

        <div className="space-y-4 md:hidden">
          {paginated.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>

        <div className="hidden max-w-full overflow-x-auto md:block">
          <div className="min-w-[900px]">
            <DataTable
              columns={[
                {
                  key: "logo",
                  header: "Logo",
                  render: (item) => (
                    <span className="inline-flex h-10 w-16 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700">
                      {item.logo}
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
                    <Badge
                      label={item.status === "active" ? "Actif" : "Inactif"}
                      variant={item.status}
                    />
                  ),
                },
                { key: "actions", header: "Actions", render: () => <ActionButtons /> },
              ]}
              data={paginated}
              getRowKey={(item) => item.id}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="text-zinc-500">
            Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
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

      <FormDrawer
        title="Ajouter une nouvelle marque"
        nameLabel="Nom de la marque"
        namePlaceholder="Ex: Lancôme"
        descriptionLabel="Description"
        descriptionPlaceholder="Décrivez cette marque..."
        imageLabel="Logo de la marque *"
        statusOptions={[
          { label: "Actif", value: "active" },
          { label: "Inactif", value: "inactive" },
        ]}
        submitLabel="Enregistrer la marque"
      />
    </section>
  );
}
