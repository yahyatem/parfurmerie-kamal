"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";
import { supabase } from "@/lib/supabase";

type DbBrand = {
  id: string | number;
  name: string | null;
  description: string | null;
  logo: string | null;
};

type DbProduct = {
  id: string | number;
  name: string | null;
  description: string | null;
  price: number | string | null;
  old_price: number | string | null;
  image: string | null;
  main_image: string | null;
  stock: number | null;
  category_id: string | number | null;
  brand_id: string | number | null;
};

type DbCategory = {
  id: string | number;
  name: string | null;
};

function formatDh(value: number | string | null) {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString("fr-FR")} DH`;
}

export default function BrandProductsPage() {
  const params = useParams<{ id: string }>();
  const brandId = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState<DbBrand | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!brandId) {
        setError("Marque introuvable.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const [brandRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from("brands").select("id, name, description, logo").eq("id", brandId).maybeSingle(),
        supabase
          .from("products")
          .select("id, name, description, price, old_price, image, main_image, stock, category_id, brand_id")
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name"),
      ]);

      if (!mounted) return;
      if (brandRes.error || productsRes.error || categoriesRes.error) {
        console.error("brand page fetch error:", {
          brandError: brandRes.error,
          productsError: productsRes.error,
          categoriesError: categoriesRes.error,
        });
        setError("Impossible de charger cette marque pour le moment.");
        setLoading(false);
        return;
      }

      const brandData = (brandRes.data as DbBrand | null) ?? null;
      if (!brandData) {
        setError("Marque introuvable.");
        setBrand(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const categoriesMap = new Map<string, string>();
      ((categoriesRes.data ?? []) as DbCategory[]).forEach((category) => {
        categoriesMap.set(String(category.id), category.name ?? "Categorie");
      });

      const mappedProducts: ShopProduct[] = ((productsRes.data ?? []) as DbProduct[]).map((item) => ({
        id: String(item.id),
        name: item.name ?? "Produit",
        brand: brandData.name ?? "Marque",
        category: item.category_id ? (categoriesMap.get(String(item.category_id)) ?? "Categorie") : "Categorie",
        description: item.description ?? "",
        price: formatDh(item.price),
        oldPrice: Number(item.old_price ?? 0) > Number(item.price ?? 0) ? formatDh(item.old_price) : undefined,
        image: item.main_image || item.image || "",
      }));

      setBrand(brandData);
      setProducts(mappedProducts);
      setLoading(false);
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, [brandId]);

  const productsCount = useMemo(() => products.length, [products.length]);

  return (
    <div className="space-y-4">
      <Link href="/categories" className="inline-flex text-sm font-medium text-[#97002f]">
        ← Retour
      </Link>

      {loading ? (
        <section className="space-y-3">
          <div className="h-7 w-36 animate-pulse rounded bg-zinc-200" />
          <div className="h-36 animate-pulse rounded-2xl bg-zinc-200" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-64 animate-pulse rounded-2xl bg-zinc-100" />
            ))}
          </div>
        </section>
      ) : error ? (
        <article className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </article>
      ) : (
        <>
          <section className="space-y-2">
            <h1 className="text-2xl font-semibold text-zinc-900">{brand?.name ?? "Marque"}</h1>
            <p className="text-sm text-zinc-500">{productsCount} produits</p>
            {brand?.description ? <p className="text-sm text-zinc-600">{brand.description}</p> : null}
            {brand?.logo ? (
              <div className="h-36 w-full overflow-hidden rounded-2xl border border-rose-100 bg-rose-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brand.logo} alt={brand.name ?? "Marque"} className="h-full w-full object-cover" />
              </div>
            ) : null}
          </section>

          {productsCount === 0 ? (
            <article className="rounded-2xl border border-zinc-100 bg-white p-4 text-sm text-zinc-500 shadow-sm">
              Aucun produit dans cette marque
            </article>
          ) : (
            <section className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
