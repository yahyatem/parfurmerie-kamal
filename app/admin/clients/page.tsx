"use client";

import { useMemo, useState } from "react";
import { Plus, Search, UserCheck, UserMinus, Users, UserPlus } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import Badge from "@/components/admin/Badge";
import DataTable from "@/components/admin/DataTable";
import FormDrawer from "@/components/admin/FormDrawer";
import SummaryStatCard from "@/components/admin/SummaryStatCard";

type ClientStatus = "active" | "inactive";

type Client = {
  id: string;
  avatar: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  totalOrders: number;
  totalSpent: string;
  status: ClientStatus;
};

const clientsData: Client[] = [
  {
    id: "CL001",
    avatar: "FZ",
    name: "Fatima Zahra",
    phone: "0612345678",
    email: "fatima.zahra@gmail.com",
    city: "Casablanca",
    totalOrders: 12,
    totalSpent: "2 450,00 DH",
    status: "active",
  },
  {
    id: "CL002",
    avatar: "AA",
    name: "Aicha El Amrani",
    phone: "0661234567",
    email: "aicha.elamrani@mail.com",
    city: "Rabat",
    totalOrders: 8,
    totalSpent: "1 890,00 DH",
    status: "active",
  },
  {
    id: "CL003",
    avatar: "SM",
    name: "Sara Martin",
    phone: "0677889900",
    email: "sara.martin@gmail.com",
    city: "Marrakech",
    totalOrders: 15,
    totalSpent: "3 750,00 DH",
    status: "active",
  },
  {
    id: "CL004",
    avatar: "MA",
    name: "Mohamed Ali",
    phone: "0611223344",
    email: "mohamed.ali@gmail.com",
    city: "Tanger",
    totalOrders: 6,
    totalSpent: "980,00 DH",
    status: "inactive",
  },
  {
    id: "CL005",
    avatar: "IB",
    name: "Imane Belkadi",
    phone: "0666778899",
    email: "imane.belkadi@mail.com",
    city: "Fès",
    totalOrders: 9,
    totalSpent: "1 560,00 DH",
    status: "active",
  },
  {
    id: "CL006",
    avatar: "YB",
    name: "Youssef Benjiloun",
    phone: "0600112233",
    email: "youssef.benjiloun@mail.com",
    city: "Agadir",
    totalOrders: 4,
    totalSpent: "620,00 DH",
    status: "inactive",
  },
  {
    id: "CL007",
    avatar: "LB",
    name: "Lina Bennani",
    phone: "0619988776",
    email: "lina.bennani@mail.com",
    city: "Casablanca",
    totalOrders: 11,
    totalSpent: "2 100,00 DH",
    status: "active",
  },
  {
    id: "CL008",
    avatar: "ME",
    name: "Mehdi El Idrissi",
    phone: "0622334455",
    email: "mehdi.elidrissi@mail.com",
    city: "Oujda",
    totalOrders: 3,
    totalSpent: "450,00 DH",
    status: "inactive",
  },
];

const ITEMS_PER_PAGE = 8;

function ClientCard({ client }: { client: Client }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-zinc-500">
          {client.avatar || "CL"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-base font-bold text-zinc-900">{client.name}</p>
            <Badge
              label={client.status === "active" ? "Actif" : "Inactif"}
              variant={client.status}
            />
          </div>
          <p className="mt-1 text-sm text-zinc-700">{client.phone}</p>
          <p className="line-clamp-1 text-xs text-zinc-500">{client.email}</p>
          <p className="text-xs text-zinc-400">{client.city}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-zinc-500">Total commandes</p>
          <p className="font-medium text-zinc-800">{client.totalOrders}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Total depense</p>
          <p className="font-bold text-zinc-900">{client.totalSpent}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <ActionButtons showView />
      </div>
    </article>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);

  const cities = Array.from(new Set(clientsData.map((item) => item.city)));

  const filtered = useMemo(() => {
    return clientsData.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.includes(search) ||
        client.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || client.status === status;
      const matchesCity = city === "all" || client.city === city;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [search, status, city]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const stats = {
    total: clientsData.length,
    newMonth: 54,
    active: clientsData.filter((item) => item.status === "active").length,
    inactive: clientsData.filter((item) => item.status === "inactive").length,
  };

  return (
    <section className="grid max-w-full gap-6 overflow-hidden 2xl:grid-cols-[2.15fr,1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Clients</h1>
          <p className="mt-1 text-sm text-zinc-500">Accueil / Clients</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            title="Total clients"
            value={stats.total}
            icon={Users}
            colorClass="bg-sky-50 text-sky-600"
          />
          <SummaryStatCard
            title="Nouveaux ce mois"
            value={stats.newMonth}
            icon={UserPlus}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <SummaryStatCard
            title="Clients actifs"
            value={stats.active}
            icon={UserCheck}
            colorClass="bg-violet-50 text-violet-600"
          />
          <SummaryStatCard
            title="Inactifs"
            value={stats.inactive}
            icon={UserMinus}
            colorClass="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-stretch gap-4">
            <div className="relative w-full min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher un client, téléphone, email..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>

              <select
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
              >
                <option value="all">Toutes les villes</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#8b0637] px-4 text-sm font-semibold text-white transition hover:bg-[#74052f] sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Ajouter un client
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:hidden">
          {paginated.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>

        <div className="hidden max-w-full overflow-x-auto md:block">
          <div className="min-w-[980px]">
            <DataTable
              columns={[
                {
                  key: "avatar",
                  header: "Client",
                  render: (item) => (
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#8b0637]/10 text-xs font-semibold text-[#8b0637]">
                        {item.avatar}
                      </span>
                      <span className="font-medium text-zinc-800">{item.name}</span>
                    </div>
                  ),
                },
                { key: "phone", header: "Téléphone", render: (item) => item.phone },
                { key: "email", header: "Email", render: (item) => item.email },
                { key: "city", header: "Ville", render: (item) => item.city },
                {
                  key: "orders",
                  header: "Total commandes",
                  render: (item) => item.totalOrders,
                },
                {
                  key: "spent",
                  header: "Total dépensé",
                  render: (item) => item.totalSpent,
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
                {
                  key: "actions",
                  header: "Actions",
                  render: () => <ActionButtons showView />,
                },
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
            {filtered.length} clients
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
        title="Ajouter un nouveau client"
        nameLabel="Nom complet"
        namePlaceholder="Ex: Fatima Zahra"
        descriptionLabel="Adresse"
        descriptionPlaceholder="Ex: 123, Rue Mohammed V, Casablanca"
        imageLabel="Photo du client (optionnel)"
        statusOptions={[
          { label: "Actif", value: "active" },
          { label: "Inactif", value: "inactive" },
        ]}
        submitLabel="Enregistrer le client"
        extraFields={
          <>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Téléphone *
              </span>
              <input
                type="text"
                placeholder="Ex: 0612345678"
                className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Email
              </span>
              <input
                type="email"
                placeholder="Ex: email@exemple.com"
                className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Ville *
              </span>
              <select className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700">
                <option>Sélectionnez une ville</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </>
        }
      />
    </section>
  );
}
