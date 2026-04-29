"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";
import { supabase } from "@/lib/supabase";

type DbCategory = {
  id: string | number;
  name: string | null;
  description: string | null;
  image: string | null;
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
  brand_id: string | number | null;
  category_id: string | number | null;
};

type DbBrand = {
  id: string | number;
  name: string | null;
  logo: string | null;
  description: string | null;
};

function formatDh(value: number | string | null) {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString("fr-FR")} DH`;
}

type CategoryProduct = ShopProduct & {
  brandId: string;
};

type BrandFilter = {
  id: string;
  name: string;
  logo: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function CategoryProductsPage() {
  const params = useParams<{ id: string }>();
  const categoryId = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<DbCategory | null>(null);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [brands, setBrands] = useState<BrandFilter[]>([]);
  const [activeBrandId, setActiveBrandId] = useState("all");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!categoryId) {
        setError("Categorie introuvable.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const [categoryRes, productsRes, brandsRes] = await Promise.all([
        supabase.from("categories").select("id, name, description, image").eq("id", categoryId).maybeSingle(),
        supabase
          .from("products")
          .select("id, name, description, price, old_price, image, main_image, stock, brand_id, category_id")
          .eq("category_id", categoryId)
          .order("created_at", { ascending: false }),
        supabase.from("brands").select("id, name, logo, description"),
      ]);

      if (!mounted) return;
      if (categoryRes.error || productsRes.error || brandsRes.error) {
        console.error("category products fetch error:", {
          categoryError: categoryRes.error,
          productsError: productsRes.error,
          brandsError: brandsRes.error,
        });
        setError("Impossible de charger cette categorie pour le moment.");
        setLoading(false);
        return;
      }

      const categoryData = (categoryRes.data as DbCategory | null) ?? null;
      if (!categoryData) {
        setError("Categorie introuvable.");
        setCategory(null);
        setProducts([]);
        setBrands([]);
        setLoading(false);
        return;
      }

      const productsData = (productsRes.data ?? []) as DbProduct[];
      const brandIds = Array.from(
        new Set(
          productsData
            .map((item) => (item.brand_id ? String(item.brand_id) : ""))
            .filter(Boolean),
        ),
      );

      const brandMap = new Map<string, BrandFilter>();
      ((brandsRes.data ?? []) as DbBrand[]).forEach((brand) => {
        const id = String(brand.id);
        if (!brandIds.includes(id)) return;
        brandMap.set(id, {
          id,
          name: brand.name ?? "Marque",
          logo: brand.logo ?? "",
        });
      });

      const mappedProducts: CategoryProduct[] = productsData.map((item) => ({
        id: String(item.id),
        name: item.name ?? "Produit",
        brand: item.brand_id ? (brandMap.get(String(item.brand_id))?.name ?? "Marque") : "Marque",
        category: categoryData.name ?? "Categorie",
        description: item.description ?? "",
        price: formatDh(item.price),
        oldPrice: Number(item.old_price ?? 0) > Number(item.price ?? 0) ? formatDh(item.old_price) : undefined,
        image: item.main_image || item.image || "",
        brandId: item.brand_id ? String(item.brand_id) : "",
      }));

      setCategory(categoryData);
      setProducts(mappedProducts);
      setBrands(Array.from(brandMap.values()));
      setActiveBrandId("all");
      setLoading(false);
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, [categoryId]);

  const filteredProducts = useMemo(() => {
    if (activeBrandId === "all") return products;
    return products.filter((product) => product.brandId === activeBrandId);
  }, [activeBrandId, products]);

  const productsCount = useMemo(() => products.length, [products.length]);

  return (
    <div className="space-y-4 overflow-x-hidden">
      <Link href="/categories" className="inline-flex text-sm font-medium text-[#97002f]">
        ← Retour
      </Link>

      {loading ? (
        <section className="space-y-3">
          <div className="h-7 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="h-20 animate-pulse rounded-2xl bg-zinc-200" />
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
            <h1 className="text-2xl font-semibold text-zinc-900">{category?.name ?? "Categorie"}</h1>
            <p className="text-sm text-zinc-500">{productsCount} produits</p>
            {category?.description ? (
              <p className="text-sm text-zinc-600">{category.description}</p>
            ) : null}
          </section>

          <section className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              onClick={() => setActiveBrandId("all")}
              className="flex w-[84px] shrink-0 flex-col items-center justify-start gap-2 py-1 transition"
            >
              <span
                className={`inline-flex h-16 w-16 items-center justify-center rounded-xl bg-white text-xs font-semibold transition ${
                  activeBrandId === "all"
                    ? "ring-2 ring-[#97002f] text-[#97002f]"
                    : "text-zinc-700"
                }`}
              >
                Tous
              </span>
              <span
                className={`w-full truncate text-center text-sm font-medium ${
                  activeBrandId === "all" ? "text-[#97002f]" : "text-zinc-700"
                }`}
              >
                Toutes
              </span>
              <span
                className={`h-0.5 w-10 rounded-full ${
                  activeBrandId === "all" ? "bg-[#97002f]" : "bg-transparent"
                }`}
              />
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => setActiveBrandId(brand.id)}
                className="flex w-[84px] shrink-0 flex-col items-center justify-start gap-2 py-1 transition"
              >
                <span
                  className={`inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-semibold text-zinc-700 transition ${
                    activeBrandId === brand.id ? "ring-2 ring-[#97002f]" : ""
                  }`}
                >
                  {brand.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    initialsFromName(brand.name)
                  )}
                </span>
                <span
                  className={`w-full truncate text-center text-sm font-medium ${
                    activeBrandId === brand.id ? "text-[#97002f]" : "text-zinc-700"
                  }`}
                >
                  {brand.name}
                </span>
                <span
                  className={`h-0.5 w-10 rounded-full ${
                    activeBrandId === brand.id ? "bg-[#97002f]" : "bg-transparent"
                  }`}
                />
              </button>
            ))}
          </section>

          {productsCount === 0 ? (
            <article className="rounded-2xl border border-zinc-100 bg-white p-4 text-sm text-zinc-500 shadow-sm">
              Aucun produit dans cette catégorie
            </article>
          ) : filteredProducts.length === 0 ? (
            <article className="rounded-2xl border border-zinc-100 bg-white p-4 text-sm text-zinc-500 shadow-sm">
              Aucun produit pour cette marque
            </article>
          ) : (
            <section className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
