"use client";

import Link from "next/link";
import { ChevronRight, Percent } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type CategoryRow = {
  id: string | number;
  name: string | null;
  image: string | null;
};

type ProductCountRow = {
  category_id: string | number | null;
};

type CategoryProductImageRow = {
  category_id: string | number | null;
  image: string | null;
  main_image?: string | null;
};

type CategoryItem = {
  id: string;
  name: string;
  image: string;
  count: number;
};

type MenuSelection = "all" | "promotions" | string;

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [activeMenu, setActiveMenu] = useState<MenuSelection>("all");

  useEffect(() => {
    let mounted = true;

    async function loadPageData() {
      setLoading(true);
      setError("");

      const [categoriesResult, productsCountResult, productsImagesResult] = await Promise.all([
        supabase.from("categories").select("id, name, image"),
        supabase.from("products").select("category_id"),
        supabase.from("products").select("category_id, image, main_image"),
      ]);

      const { data: categoriesData, error: categoriesError } = categoriesResult;
      const { data: productsCountData, error: productsCountError } = productsCountResult;
      const { data: productsImagesData, error: productsImagesError } = productsImagesResult;

      if (categoriesError || productsCountError || productsImagesError) {
        console.error("Categories page fetch error:", {
          categoriesError,
          productsCountError,
          productsImagesError,
        });
        if (!mounted) return;
        setError("Impossible de charger les categories pour le moment.");
        setLoading(false);
        return;
      }

      const countsByCategory = new Map<string, number>();
      ((productsCountData ?? []) as ProductCountRow[]).forEach((item) => {
        if (!item.category_id) return;
        const key = String(item.category_id);
        countsByCategory.set(key, (countsByCategory.get(key) ?? 0) + 1);
      });

      const firstImageByCategory = new Map<string, string>();
      ((productsImagesData ?? []) as CategoryProductImageRow[]).forEach((item) => {
        if (!item.category_id) return;
        const key = String(item.category_id);
        if (firstImageByCategory.has(key)) return;
        const candidate = item.main_image || item.image || "";
        if (!candidate) return;
        firstImageByCategory.set(key, candidate);
      });

      const mappedCategories = ((categoriesData ?? []) as CategoryRow[]).map((item) => ({
        id: String(item.id),
        name: item.name ?? "Categorie",
        image: item.image || firstImageByCategory.get(String(item.id)) || "",
        count: countsByCategory.get(String(item.id)) ?? 0,
      }));

      if (!mounted) return;
      setCategoryItems(mappedCategories);
      setLoading(false);
    }

    void loadPageData();

    return () => {
      mounted = false;
    };
  }, []);

  const totalProductsCount = categoryItems.reduce((sum, item) => sum + item.count, 0);
  const selectedCategory =
    activeMenu !== "all" && activeMenu !== "promotions"
      ? categoryItems.find((item) => item.id === activeMenu)
      : null;

  const filteredCategories =
    activeMenu === "all" || activeMenu === "promotions"
      ? categoryItems
      : categoryItems.filter((item) => item.id === activeMenu);

  const headerTitle = selectedCategory?.name ?? "Tous les produits";
  const headerCount = selectedCategory?.count ?? totalProductsCount;

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 overflow-x-hidden">
      <section>
        <h1 className="text-2xl font-semibold text-zinc-900">Categories</h1>
      </section>

      <section className="flex gap-3">
        <aside className="w-[130px] shrink-0 space-y-2">
          <button
            type="button"
            onClick={() => setActiveMenu("all")}
            className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
              activeMenu === "all"
                ? "border-[#97002f] bg-[#97002f] text-white"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            Tous les produits
          </button>

          {categoryItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMenu(item.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                activeMenu === item.id
                  ? "border-[#97002f] bg-[#97002f] text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {item.name}
            </button>
          ))}

          <Link
            href="/promotions"
            onClick={() => setActiveMenu("promotions")}
            className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              activeMenu === "promotions"
                ? "border-[#97002f] bg-[#97002f] text-white"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            <Percent className="h-4 w-4" />
            Promotions
          </Link>
        </aside>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-3 py-2 shadow-sm">
            <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{headerTitle}</p>
            <p className="text-xs text-zinc-500">{headerCount} produits</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <article
                  key={`skeleton-${index}`}
                  className="h-[170px] animate-pulse rounded-xl border border-gray-100 bg-zinc-100"
                />
              ))}
            </div>
          ) : error ? (
            <article className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </article>
          ) : filteredCategories.length === 0 ? (
            <article className="rounded-xl border border-zinc-100 bg-white p-4 text-sm text-zinc-500 shadow-sm">
              Aucune categorie trouvee.
            </article>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="rounded-xl border border-zinc-100 bg-white p-2 shadow-sm"
                >
                  <div className="h-20 w-full overflow-hidden rounded-lg bg-rose-50">
                    {category.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#97002f]">
                        {initialsFromName(category.name)}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-900">{category.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                    {category.count} produits <ChevronRight className="h-3.5 w-3.5" />
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-4 shadow-sm">
        <p className="text-lg font-semibold text-[#97002f]">Promotions</p>
        <p className="mt-1 text-sm text-zinc-600">Offres speciales et reductions</p>
        <Link
          href="/promotions"
          className="mt-3 inline-flex rounded-xl bg-[#97002f] px-4 py-2 text-sm font-semibold text-white"
        >
          Voir les offres
        </Link>
      </section>
    </div>
  );
}
