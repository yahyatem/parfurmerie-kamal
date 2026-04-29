import Link from "next/link";
import { ShieldCheck, Truck, WalletCards, Headset } from "lucide-react";
import HomeOffersSlider, { type HomeOffer } from "@/components/shop/HomeOffersSlider";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";
import { supabase } from "@/lib/supabase";

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

type DbOffer = {
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

type DbCategory = {
  id: string | number;
  name: string | null;
  image: string | null;
  status: string | null;
};

type HomeCategory = {
  id: string;
  label: string;
  imageUrl: string;
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "0 DH";
  return `${value} DH`;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function resolveOfferImageUrl(rawImage: string | null) {
  const raw = (rawImage ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("https://")) return raw;
  const normalizedPath = raw.replace(/^\/+/, "");
  if (!normalizedPath) return "";
  const publicUrl = supabase.storage.from("offers").getPublicUrl(normalizedPath).data.publicUrl;
  if (publicUrl.startsWith("https://")) return publicUrl;
  return "";
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
  const [productsResult, offersResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, description, price, old_price, image, stock, category_id, brand_id"),
    supabase
      .from("offers")
      .select("id, title, subtitle, description, button_text, image, link, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name, image, status").order("created_at", { ascending: false }),
  ]);
  const { data, error } = productsResult;
  const offersData = (offersResult.data ?? []) as DbOffer[];
  const categoriesData = (categoriesResult.data ?? []) as DbCategory[];

  if (offersResult.error) {
    console.log("offers fetch error:", offersResult.error);
  }
  if (categoriesResult.error) {
    console.log("categories fetch error:", categoriesResult.error);
  }

  const firstProductImageByCategory = new Map<string, string>();
  ((data ?? []) as DbProduct[]).forEach((item) => {
    const categoryId = item.category_id ? String(item.category_id) : "";
    if (!categoryId || firstProductImageByCategory.has(categoryId)) return;
    if (item.image) firstProductImageByCategory.set(categoryId, item.image);
  });

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

  const offers: HomeOffer[] = offersData.map((offer) => {
    const resolvedImage = resolveOfferImageUrl(offer.image);
    console.log("offer image debug:", {
      offerId: offer.id,
      rawImage: offer.image,
      resolvedImage,
    });
    return {
      id: offer.id,
      title: offer.title ?? "Offre exclusive",
      subtitle: offer.subtitle ?? "Offres speciales",
      description: offer.description ?? "",
      buttonText: offer.button_text ?? "Decouvrir",
      image: resolvedImage,
      link: offer.link ?? "/promotions",
    };
  });
  const homeCategories: HomeCategory[] = categoriesData
    .filter((category) => category.status !== "inactive")
    .slice(0, 8)
    .map((category) => {
      const categoryId = String(category.id);
      return {
        id: categoryId,
        label: category.name ?? "Categorie",
        imageUrl: category.image || firstProductImageByCategory.get(categoryId) || "",
      };
    });

  const bestSellers = products.slice(0, 4);
  const newProducts = products.slice(4, 8);

  return (
    <div className="space-y-5">
      <HomeOffersSlider offers={offers} />

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
          {homeCategories.map((category) => (
            <button key={category.id} type="button" className="flex w-[84px] shrink-0 flex-col items-center gap-2">
              <span className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-rose-100 bg-rose-50 text-lg font-semibold text-[#97002f] shadow-sm">
                {category.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={category.imageUrl} alt={category.label} className="h-full w-full object-cover" />
                ) : (
                  initialsFromName(category.label)
                )}
              </span>
              <span className="line-clamp-2 text-center text-xs font-medium text-zinc-700">{category.label}</span>
            </button>
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
