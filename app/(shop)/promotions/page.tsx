"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";
import { supabase } from "@/lib/supabase";

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
};

type DbProduct = {
  id: string | number;
  name: string | null;
  description: string | null;
  price: number | string | null;
  old_price: number | string | null;
  image: string | null;
  brand_id: string | number | null;
  category_id: string | number | null;
  brands?: { name: string | null } | { name: string | null }[] | null;
};

type PromotionProduct = ShopProduct & {
  categoryId: string;
  discountPercent: number;
};

function formatDh(value: number) {
  return `${value.toLocaleString("fr-FR")} DH`;
}

function relationName(
  relation: { name: string | null } | { name: string | null }[] | null | undefined,
) {
  if (!relation) return "";
  if (Array.isArray(relation)) return relation[0]?.name ?? "";
  return relation.name ?? "";
}

export default function PromotionsPage() {
  const [activeChip, setActiveChip] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState<DbOffer[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<PromotionProduct[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");
      const [offersRes, categoriesRes, productsRes] = await Promise.all([
        supabase
          .from("offers")
          .select("id, title, subtitle, description, button_text, image, link, is_active, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name").order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("id, name, description, price, old_price, image, brand_id, category_id, brands(name)")
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;
      if (offersRes.error || categoriesRes.error || productsRes.error) {
        console.error("promotions page fetch error:", {
          offersError: offersRes.error,
          categoriesError: categoriesRes.error,
          productsError: productsRes.error,
        });
        setError("Impossible de charger les promotions pour le moment.");
        setLoading(false);
        return;
      }

      const mappedCategories = ((categoriesRes.data ?? []) as DbCategory[]).map((category) => ({
        id: String(category.id),
        name: category.name ?? "Categorie",
      }));

      const mappedProducts = ((productsRes.data ?? []) as DbProduct[]).reduce<PromotionProduct[]>(
        (acc, item) => {
          const currentPrice = Number(item.price ?? 0);
          const previousPrice = Number(item.old_price ?? 0);
          const hasDiscount = previousPrice > currentPrice && currentPrice > 0;
          if (!hasDiscount) return acc;
          const discountPercent = Math.round(((previousPrice - currentPrice) / previousPrice) * 100);
          acc.push({
            id: String(item.id),
            name: item.name ?? "Produit",
            brand: relationName(item.brands) || "Marque",
            description: item.description ?? "",
            price: formatDh(currentPrice),
            oldPrice: formatDh(previousPrice),
            discountLabel: `-${discountPercent}%`,
            image: item.image ?? "",
            categoryId: item.category_id ? String(item.category_id) : "",
            discountPercent,
          });
          return acc;
        },
        [],
      );

      setOffers((offersRes.data ?? []) as DbOffer[]);
      setCategories(mappedCategories);
      setProducts(mappedProducts);
      setLoading(false);
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    if (activeChip === "all") return products;
    return products.filter((product) => product.categoryId === activeChip);
  }, [activeChip, products]);

  const flashProducts = useMemo(() => visibleProducts.slice(0, 4), [visibleProducts]);
  const bestProducts = useMemo(
    () => [...visibleProducts].sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 4),
    [visibleProducts],
  );

  const heroOffer = offers[0];
  const secondaryOffer = offers[1];

  return (
    <div className="space-y-5 overflow-x-hidden">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold text-zinc-900">Promotions</h1>
        <article className="overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-100 via-rose-50 to-rose-100 shadow-sm">
          {loading ? (
            <div className="h-[220px] animate-pulse rounded-2xl bg-white/60 sm:h-[260px]" />
          ) : heroOffer ? (
            <Link href={heroOffer.link ?? "/promotions"} className="block">
              <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-pink-100 bg-pink-50 shadow-sm sm:min-h-[260px]">
                {heroOffer.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroOffer.image}
                    alt={heroOffer.title ?? "Offre"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-pink-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-pink-50/90 to-pink-50/20" />

                <div className="relative z-10 p-5">
                  <div className="max-w-[70%]">
                    <p className="text-sm font-medium text-[#7a0d35]">{heroOffer.subtitle ?? "Offre spéciale"}</p>
                    <p className="mt-1 text-4xl font-bold text-[#7a0d35]">{heroOffer.title ?? "Jusqu'à -30%"}</p>
                    <p className="mt-1 text-base text-zinc-700 sm:text-lg">
                      {heroOffer.subtitle ?? "sur une sélection produits"}
                    </p>
                    <span className="mt-3 inline-flex rounded-xl bg-[#7a0d35] px-4 py-2 text-sm font-semibold text-white">
                      {heroOffer.button_text ?? "Découvrir"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex h-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-rose-100 via-rose-50 to-rose-100 p-4 text-sm text-zinc-600 sm:h-[260px]">
              Aucune offre active pour le moment.
            </div>
          )}
        </article>
      </section>

      <section className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setActiveChip("all")}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
            activeChip === "all"
              ? "border-[#97002f] bg-[#97002f] text-white"
              : "border-zinc-200 bg-white text-zinc-700"
          }`}
        >
          Toutes les offres
        </button>
        {categories.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setActiveChip(chip.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              chip.id === activeChip
                ? "border-[#97002f] bg-[#97002f] text-white"
                : "border-zinc-200 bg-white text-zinc-700"
            }`}
          >
            {chip.name}
          </button>
        ))}
      </section>

      {error ? (
        <article className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</article>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900">Offres flash</h2>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-[#97002f]">02 : 15 : 47</span>
            <Link href="/promotions" className="text-sm font-semibold text-[#97002f]">Voir tout</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {flashProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {secondaryOffer ? (
        <section className="overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-100 to-rose-50 shadow-sm">
          <Link href={secondaryOffer.link ?? "/promotions"} className="block">
            <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-pink-100 bg-pink-50 shadow-sm">
              {secondaryOffer.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={secondaryOffer.image}
                  alt={secondaryOffer.title ?? "Offre"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-pink-50/90 to-pink-50/20" />

              <div className="relative z-10 p-5">
                <p className="text-sm font-semibold text-[#7a0d35]">{secondaryOffer.subtitle ?? "Pack beauté"}</p>
                <p className="mt-1 text-4xl font-bold text-[#7a0d35]">{secondaryOffer.title ?? "Jusqu'à -40%"}</p>
                <p className="mt-1 text-sm text-zinc-700">{secondaryOffer.description ?? ""}</p>
                <span className="mt-3 inline-flex rounded-xl bg-[#7a0d35] px-4 py-2 text-sm font-semibold text-white">
                  {secondaryOffer.button_text ?? "Découvrir les coffrets"}
                </span>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900">Meilleures offres</h2>
          <Link href="/promotions" className="text-sm font-semibold text-[#97002f]">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {bestProducts.map((product) => (
            <ProductCard key={`best-${product.id}`} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
