"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

type ProductImageRow = {
  url: string | null;
  is_main: boolean | null;
};

type ProductRow = {
  id: string | number;
  name: string | null;
  description: string | null;
  price: number | string | null;
  old_price: number | string | null;
  image: string | null;
  main_image: string | null;
  stock: number | null;
  category_id: string | null;
  brand_id: string | null;
  brands?: { name: string | null } | { name: string | null }[] | null;
  categories?: { name: string | null } | { name: string | null }[] | null;
  product_images?: ProductImageRow[] | null;
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "0 DH";
  return `${value} DH`;
}

function relationName(
  relation: { name: string | null } | { name: string | null }[] | null | undefined,
  fallback: string,
) {
  if (!relation) return fallback;
  if (Array.isArray(relation)) return relation[0]?.name ?? fallback;
  return relation.name ?? fallback;
}

function normalizeImageUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return "";
}

function useSwipe(onLeft: () => void, onRight: () => void) {
  const [startX, setStartX] = useState<number | null>(null);

  return {
    onTouchStart: (event: React.TouchEvent) => setStartX(event.touches[0]?.clientX ?? null),
    onTouchEnd: (event: React.TouchEvent) => {
      if (startX === null) return;
      const endX = event.changedTouches[0]?.clientX ?? startX;
      const delta = endX - startX;
      if (delta < -40) onLeft();
      if (delta > 40) onRight();
      setStartX(null);
    },
  };
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [related, setRelated] = useState<ShopProduct[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [mainIndex, setMainIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const addToCart = useStore((state) => state.addToCart);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const isFavorite = useStore((state) =>
    state.favorites.some((favorite) => favorite.id === productId),
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      const resolvedParams = await params;
      const id = resolvedParams.id;
      if (!mounted) return;
      setProductId(id);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select(
          "id, name, description, price, old_price, image, main_image, stock, category_id, brand_id, brands(name), categories(name), product_images(url, is_main)",
        )
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        if (!mounted) return;
        setError("Impossible de charger ce produit.");
        setLoading(false);
        return;
      }

      const current = data as ProductRow;
      if (!mounted) return;
      setProduct(current);

      const relatedRequests = [];
      if (current.category_id) {
        relatedRequests.push(
          supabase
            .from("products")
            .select("id, name, description, price, old_price, image, main_image, category_id, brand_id")
            .eq("category_id", current.category_id)
            .neq("id", id)
            .limit(6),
        );
      }
      if (current.brand_id) {
        relatedRequests.push(
          supabase
            .from("products")
            .select("id, name, description, price, old_price, image, main_image, category_id, brand_id")
            .eq("brand_id", current.brand_id)
            .neq("id", id)
            .limit(6),
        );
      }

      const results = relatedRequests.length > 0 ? await Promise.all(relatedRequests) : [];
      const merged = new Map<string, ShopProduct>();
      for (const result of results) {
        for (const item of (result.data ?? []) as ProductRow[]) {
          const mapped: ShopProduct = {
            id: String(item.id),
            name: item.name ?? "Produit",
            description: item.description ?? "",
            price: formatPrice(item.price),
            oldPrice: item.old_price ? formatPrice(item.old_price) : undefined,
            image: normalizeImageUrl(item.main_image ?? item.image ?? ""),
            brand: "Marque",
            category: "Produit",
          };
          merged.set(mapped.id, mapped);
        }
      }
      if (!mounted) return;
      setRelated(Array.from(merged.values()).slice(0, 6));
      setLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [params]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const fromTable = (product.product_images ?? [])
      .map((item) => ({ url: normalizeImageUrl(item.url ?? ""), isMain: Boolean(item.is_main) }))
      .filter((item) => Boolean(item.url));
    const sorted = [...fromTable].sort((a, b) => Number(b.isMain) - Number(a.isMain));
    const fallback = [normalizeImageUrl(product.main_image ?? ""), normalizeImageUrl(product.image ?? "")]
      .filter(Boolean)
      .map((url) => ({ url, isMain: false }));

    const all = [...sorted, ...fallback];
    const seen = new Set<string>();
    return all.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }, [product]);

  const safeMainIndex = mainIndex < gallery.length ? mainIndex : 0;
  const mainImage = gallery[safeMainIndex]?.url ?? "";
  const canGoPrev = safeMainIndex > 0;
  const canGoNext = safeMainIndex < gallery.length - 1;

  const gallerySwipe = useSwipe(
    () => setMainIndex((value) => (value < gallery.length - 1 ? value + 1 : value)),
    () => setMainIndex((value) => (value > 0 ? value - 1 : value)),
  );

  const zoomSwipe = useSwipe(
    () => setMainIndex((value) => (value < gallery.length - 1 ? value + 1 : value)),
    () => setMainIndex((value) => (value > 0 ? value - 1 : value)),
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-zinc-100" />
        <div className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (error) {
    return (
      <article className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </article>
    );
  }

  if (!product) {
    return (
      <article className="rounded-2xl border border-zinc-100 bg-white p-5 text-sm text-zinc-500 shadow-sm">
        Produit introuvable.
      </article>
    );
  }

  const stockValue = Number(product.stock ?? 0);
  const mappedStoreProduct = {
    id: String(product.id),
    name: product.name ?? "Produit",
    price: Number(product.price ?? 0),
    image: mainImage,
    brand: relationName(product.brands, "Marque"),
    description: product.description ?? "",
  };

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 overflow-x-hidden pb-2">
      <Link href="/" className="inline-flex text-sm font-medium text-[#97002f]">
        ← Retour
      </Link>

      <section className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
        <div className="relative" {...gallerySwipe}>
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="block aspect-square w-full overflow-hidden rounded-xl border border-rose-100 bg-rose-50/40"
          >
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={product.name ?? "Produit"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">IMG</div>
            )}
          </button>
          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => canGoPrev && setMainIndex((value) => value - 1)}
                className="absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => canGoNext && setMainIndex((value) => value + 1)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {gallery.length > 0 ? (
            gallery.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                onClick={() => setMainIndex(index)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${
                  index === safeMainIndex ? "border-[#97002f]" : "border-zinc-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="Miniature" className="h-full w-full object-cover" />
              </button>
            ))
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-xs text-zinc-500">
              IMG
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
        <p className="text-xl font-semibold text-zinc-900">{product.name}</p>
        {product.brand_id ? (
          <Link href={`/marques/${product.brand_id}`} className="text-sm text-zinc-500 hover:underline">
            {relationName(product.brands, "Marque")}
          </Link>
        ) : (
          <p className="text-sm text-zinc-500">{relationName(product.brands, "Marque")}</p>
        )}
        <p className="text-xs text-zinc-400">{relationName(product.categories, "Produit")}</p>
        <p className="text-sm text-zinc-600">{product.description || "Aucune description."}</p>

        <div className="flex items-center gap-2">
          {product.old_price ? (
            <p className="text-sm text-zinc-400 line-through">{formatPrice(product.old_price)}</p>
          ) : null}
          <p className="text-2xl font-bold text-[#97002f]">{formatPrice(product.price)}</p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
            stockValue > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {stockValue > 0 ? "En stock" : "Rupture"}
        </span>

        <div className="flex items-center gap-2 pt-1">
          <div className="inline-flex items-center rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="inline-flex h-9 w-9 items-center justify-center text-zinc-600"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="inline-flex h-9 min-w-9 items-center justify-center text-sm font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((value) => value + 1)}
              className="inline-flex h-9 w-9 items-center justify-center text-zinc-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (stockValue <= 0) return;
              for (let i = 0; i < quantity; i += 1) addToCart(mappedStoreProduct);
            }}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#97002f] px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={stockValue <= 0}
          >
            Ajouter au panier
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(mappedStoreProduct)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
              isFavorite ? "border-rose-200 bg-rose-50 text-red-500" : "border-zinc-200 text-zinc-600"
            }`}
            aria-label="Favori"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Produits similaires</h2>
        {related.length === 0 ? (
          <article className="rounded-2xl border border-zinc-100 bg-white p-4 text-sm text-zinc-500 shadow-sm">
            Aucun produit similaire pour le moment.
          </article>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </section>

      {isZoomOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/90 p-4" {...zoomSwipe}>
          <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative mt-3 flex flex-1 items-center justify-center">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt="Zoom produit" className="max-h-full w-full rounded-xl object-contain" />
              ) : (
                <div className="text-white/70">IMG</div>
              )}
              {gallery.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => canGoPrev && setMainIndex((value) => value - 1)}
                    className="absolute left-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => canGoNext && setMainIndex((value) => value + 1)}
                    className="absolute right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
