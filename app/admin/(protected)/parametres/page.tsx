"use client";

import { useState } from "react";
import { Bell, Box, CreditCard, Globe, Mail, Save, Settings, ShieldCheck, Store, Truck } from "lucide-react";

const tabs = [
  { id: "general", label: "Général", icon: Settings },
  { id: "boutique", label: "Boutique", icon: Store },
  { id: "livraison", label: "Livraison", icon: Truck },
  { id: "paiement", label: "Paiement", icon: CreditCard },
  { id: "email", label: "Email", icon: Mail },
  { id: "securite", label: "Sécurité", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api", label: "API", icon: Globe },
  { id: "sauvegarde", label: "Sauvegarde", icon: Box },
];

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [maintenance, setMaintenance] = useState(false);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Paramètres</h1>
        <p className="mt-1 text-sm text-zinc-500">Accueil / Paramètres</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === tab.id ? "bg-[#8b0637] text-white" : "bg-zinc-100 text-zinc-700"}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 p-4">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">Informations générales</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Nom de la boutique *</span><input className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" defaultValue="Parfumerie PK" /></label>
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Devise par défaut *</span><select className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"><option>MAD (Dirham Marocain)</option></select></label>
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Email de contact *</span><input className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" defaultValue="contact@parfumeriepk.ma" /></label>
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Langue par défaut *</span><select className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"><option>Français</option></select></label>
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Téléphone</span><input className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" defaultValue="+212 612 345 678" /></label>
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Date format</span><select className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"><option>31/12/2024</option></select></label>
              </div>
              <label className="mt-4 block"><span className="mb-1 block text-sm text-zinc-700">Adresse *</span><textarea className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" rows={3} defaultValue="123, Rue Mohammed V, Casablanca, Maroc" /></label>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">À propos de la boutique</h2>
              <label className="block"><span className="mb-1 block text-sm text-zinc-700">Description</span><textarea className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" rows={4} defaultValue="Votre destination beauté: parfums, cosmétiques et soins pour sublimer votre quotidien." /></label>
              <label className="mt-4 block"><span className="mb-1 block text-sm text-zinc-700">Mots-clés (SEO)</span><input className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" defaultValue="parfumerie, parfum, cosmétique, soin, beauté, maroc" /></label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 p-4">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">Logo & Favicon</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 p-3 text-center"><p className="mb-2 text-xs text-zinc-500">Logo</p><div className="mx-auto flex h-20 w-full items-center justify-center rounded-md bg-zinc-50 text-[#8b0637]">PK</div></div>
                <div className="rounded-lg border border-zinc-200 p-3 text-center"><p className="mb-2 text-xs text-zinc-500">Favicon</p><div className="mx-auto flex h-20 w-full items-center justify-center rounded-md bg-zinc-50 text-[#8b0637]">PK</div></div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">Devise & Langue</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Devise</span><select className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"><option>MAD</option></select></label>
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Langue</span><select className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm"><option>Français</option></select></label>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <h2 className="mb-2 text-base font-semibold text-zinc-900">Mode maintenance</h2>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-500">Activez ce mode pour rendre le site temporairement indisponible.</p>
                <button type="button" onClick={() => setMaintenance((prev) => !prev)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${maintenance ? "bg-[#8b0637]" : "bg-zinc-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${maintenance ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">Sécurité</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Session admin (minutes)</span><input className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" defaultValue="120" /></label>
                <label className="block"><span className="mb-1 block text-sm text-zinc-700">Tentatives max</span><input className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" defaultValue="5" /></label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#8b0637] px-5 text-sm font-semibold text-white">
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </section>
  );
}
