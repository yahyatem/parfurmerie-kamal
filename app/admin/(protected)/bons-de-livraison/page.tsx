"use client";

import { useMemo, useState } from "react";
import {
  CircleCheckBig,
  Clock3,
  Search,
  Truck,
  TruckIcon,
  XCircle,
} from "lucide-react";
import RecordCard from "@/components/admin/RecordCard";
import SummaryStatCard from "@/components/admin/SummaryStatCard";

type DeliveryStatus = "delivered" | "in_delivery" | "pending" | "cancelled";

type DeliveryNote = {
  id: string;
  status: DeliveryStatus;
  date: string;
  customer: string;
  phone: string;
  city: string;
  itemsCount: number;
  driver: string;
};

const notesData: DeliveryNote[] = [
  {
    id: "#BL-1008",
    status: "delivered",
    date: "12/06/2024 à 14:30",
    customer: "Mohamed A.",
    phone: "0612350457",
    city: "Casablanca",
    itemsCount: 3,
    driver: "Youssef B.",
  },
  {
    id: "#BL-1007",
    status: "in_delivery",
    date: "12/06/2024 à 11:15",
    customer: "Fatima E.",
    phone: "0661122334",
    city: "Rabat",
    itemsCount: 2,
    driver: "Imane L.",
  },
  {
    id: "#BL-1006",
    status: "delivered",
    date: "11/06/2024 à 16:45",
    customer: "Ahmed K.",
    phone: "0677889900",
    city: "Marrakech",
    itemsCount: 1,
    driver: "Mehdi T.",
  },
  {
    id: "#BL-1005",
    status: "pending",
    date: "11/06/2024 à 10:20",
    customer: "Sara M.",
    phone: "0655544332",
    city: "Tanger",
    itemsCount: 2,
    driver: "Youssef B.",
  },
  {
    id: "#BL-1004",
    status: "in_delivery",
    date: "10/06/2024 à 15:30",
    customer: "Youssef B.",
    phone: "0601122333",
    city: "Fès",
    itemsCount: 4,
    driver: "Imane L.",
  },
  {
    id: "#BL-1003",
    status: "delivered",
    date: "09/06/2024 à 13:00",
    customer: "Khadija A.",
    phone: "0622334455",
    city: "Oujda",
    itemsCount: 2,
    driver: "Mehdi T.",
  },
  {
    id: "#BL-1002",
    status: "cancelled",
    date: "08/06/2024 à 18:25",
    customer: "Mehdi T.",
    phone: "0611223344",
    city: "Agadir",
    itemsCount: 1,
    driver: "Youssef B.",
  },
  {
    id: "#BL-1001",
    status: "delivered",
    date: "08/06/2024 à 11:05",
    customer: "Imane L.",
    phone: "0667788999",
    city: "Casablanca",
    itemsCount: 3,
    driver: "Imane L.",
  },
];

const ITEMS_PER_PAGE = 8;

function getBadgeVariant(status: DeliveryStatus) {
  if (status === "delivered") return "active";
  if (status === "in_delivery") return "delivered";
  if (status === "pending") return "pending";
  return "inactive";
}

function getStatusLabel(status: DeliveryStatus) {
  if (status === "delivered") return "Livré";
  if (status === "in_delivery") return "En livraison";
  if (status === "pending") return "En attente";
  return "Annulé";
}

export default function BonsDeLivraisonPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("all");
  const [driver, setDriver] = useState("all");
  const [page, setPage] = useState(1);

  const drivers = Array.from(new Set(notesData.map((item) => item.driver)));

  const filtered = useMemo(() => {
    return notesData.filter((note) => {
      const matchesSearch =
        note.id.toLowerCase().includes(search.toLowerCase()) ||
        note.customer.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || note.status === status;
      const matchesDriver = driver === "all" || note.driver === driver;
      const matchesDate =
        date === "all" ||
        (date === "today" && note.date.startsWith("12/06/2024")) ||
        (date === "week" && note.date.includes("/06/2024"));
      return matchesSearch && matchesStatus && matchesDriver && matchesDate;
    });
  }, [search, status, date, driver]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const stats = {
    total: notesData.length,
    delivered: notesData.filter((item) => item.status === "delivered").length,
    inDelivery: notesData.filter((item) => item.status === "in_delivery").length,
    pending: notesData.filter((item) => item.status === "pending").length,
    cancelled: notesData.filter((item) => item.status === "cancelled").length,
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Bons de livraison</h1>
        <p className="mt-1 text-sm text-zinc-500">Accueil / Bons de livraison</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher un bon de livraison..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
            />
          </div>

          <select
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
          >
            <option value="all">Date: Toutes</option>
            <option value="today">Aujourd&apos;hui</option>
            <option value="week">Cette semaine</option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
          >
            <option value="all">Statut: Tous</option>
            <option value="delivered">Livrés</option>
            <option value="in_delivery">En livraison</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulés</option>
          </select>

          <select
            value={driver}
            onChange={(event) => {
              setDriver(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700"
          >
            <option value="all">Livreur: Tous</option>
            {drivers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryStatCard
          title="Total bons"
          value={stats.total}
          icon={Truck}
          colorClass="bg-violet-50 text-violet-600"
        />
        <SummaryStatCard
          title="Livrés"
          value={stats.delivered}
          icon={CircleCheckBig}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <SummaryStatCard
          title="En livraison"
          value={stats.inDelivery}
          icon={TruckIcon}
          colorClass="bg-sky-50 text-sky-600"
        />
        <SummaryStatCard
          title="En attente"
          value={stats.pending}
          icon={Clock3}
          colorClass="bg-amber-50 text-amber-600"
        />
        <SummaryStatCard
          title="Annulés"
          value={stats.cancelled}
          icon={XCircle}
          colorClass="bg-zinc-100 text-zinc-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {paginated.map((note) => (
          <RecordCard
            key={note.id}
            code={note.id}
            statusLabel={getStatusLabel(note.status)}
            statusVariant={getBadgeVariant(note.status)}
            date={note.date}
            customer={note.customer}
            phone={note.phone}
            city={note.city}
            itemsCount={note.itemsCount}
            driver={note.driver}
          />
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="text-zinc-500">
          Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur{" "}
          {filtered.length} bons
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
    </section>
  );
}
