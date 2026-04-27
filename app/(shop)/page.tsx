import Link from "next/link";
import { ShieldCheck, Truck, WalletCards, Headset } from "lucide-react";
import CategoryCircle from "@/components/shop/CategoryCircle";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";
import { supabase } from "@/lib/supabase";

const categories = [
  { label: "Parfums", emoji: "Perf" },
  { label: "Soins visage", emoji: "Skin" },
  { label: "Maquillage", emoji: "Make" },
  { label: "Soins corps", emoji: "Body" },
  { label: "Cheveux", emoji: "Hair" },
  { label: "Accessoires", emoji: "Bag" },
];

const benefits = [
  { icon: ShieldCheck, label: "Produits 100% originaux" },
  { icon: Truck, label: "Livraison rapide partout au Maroc" },
  { icon: WalletCards, label: "Paiement a la livraison" },
  { icon: Headset, label: "Service client 7j/7" },
];

type DbProduct = {
  id: string | number;
  name: string;
  description: string | null;
  price: number | string | null;
  old_price: number | string | null;
  image: string | null;
  stock: number | null;
  category_id: string | number | null;
  brand_id: string | number | null;
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "0 DH";
  return `${value} DH`;
}

function ErrorCard() {
  return (
    <article className="col-span-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
      Impossible de charger les produits pour le moment.
    </article>
  );
}

function EmptyCard() {
  return (
    <article className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
      Aucun produit disponible pour le moment
    </article>
  );
}

export default async function ShopHomePage() {
  const { data, error } = await supabase.from("products").select(
    "id, name, description, price, old_price, image, stock, category_id, brand_id",
  );

  const products: ShopProduct[] = ((data ?? []) as DbProduct[]).map((item) => ({
    id: String(item.id),
    name: item.name,
    description: item.description ?? "",
    price: formatPrice(Number(item.price ?? 0)),
    oldPrice: item.old_price ? formatPrice(item.old_price) : undefined,
    image: item.image ?? "PR",
    brand: "Marque",
    category: "Produit",
  }));

  const bestSellers = products.slice(0, 4);
  const newProducts = products.slice(4, 8);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-[#97002f] to-[#b0134d] p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-rose-100">Offres speciales</p>
            <p className="mt-1 text-3xl font-bold leading-tight">Jusqu&apos;a -40%</p>
            <Link
              href="/promotions"
              className="mt-3 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#97002f]"
            >
              Decouvrir
            </Link>
          </div>
          <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-2xl">
            Perf
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
        </div>
      </section>

      <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3">
        <ul className="space-y-2.5">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex items-center gap-2 text-sm text-zinc-700">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#97002f] shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="meilleures-ventes" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Categories</h2>
          <Link href="/categories" className="text-sm font-medium text-[#97002f]">
            Voir tout
          </Link>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {categories.map((category) => (
            <CategoryCircle key={category.label} label={category.label} emoji={category.emoji} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Meilleures ventes</h2>
          <Link href="/categories" className="text-sm font-medium text-[#97002f]">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {error ? (
            <ErrorCard />
          ) : bestSellers.length === 0 ? (
            <EmptyCard />
          ) : (
            bestSellers.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-4 shadow-sm">
        <p className="text-sm text-zinc-500">Collection du mois</p>
        <p className="mt-1 text-xl font-bold text-[#97002f]">Nouveaux arrivages</p>
        <Link
          href="/categories"
          className="mt-3 inline-flex rounded-xl bg-[#97002f] px-4 py-2 text-sm font-semibold text-white"
        >
          Voir la collection
        </Link>
      </section>

      <section id="nouveautes" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Nouveautes</h2>
          <Link href="/categories" className="text-sm font-medium text-[#97002f]">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {error ? (
            <ErrorCard />
          ) : products.length === 0 ? (
            <EmptyCard />
          ) : (
            (newProducts.length > 0 ? newProducts : bestSellers).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
