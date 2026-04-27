"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Package, Plus, Search, Upload } from "lucide-react";
import ActionButtons from "@/components/admin/ActionButtons";
import Badge from "@/components/admin/Badge";
import DataTable from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  image: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  categoryId: string | null;
  brandId: string | null;
  price: string;
  stock: number;
  status: "active" | "inactive";
};

type SupabaseProductRow = {
  id: string | number;
  image: string | null;
  name: string | null;
  description: string | null;
  old_price: number | string | null;
  category_id: string | null;
  brand_id: string | null;
  categories?: { name: string | null } | { name: string | null }[] | null;
  brands?: { name: string | null } | { name: string | null }[] | null;
  created_at: string | null;
  price: number | string | null;
  stock: number | null;
  status: string | null;
};

type OptionRow = {
  id: string | number;
  name: string | null;
};

function getRelationName(
  relation: { name: string | null } | { name: string | null }[] | null | undefined,
) {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0]?.name ?? null;
  return relation.name ?? null;
}

const mockProducts: Product[] = [
  {
    id: "P001",
    image: "IT",
    name: "Into The Night",
    description: "Parfum floral intense",
    category: "Parfums",
    brand: "Bath & Body Works",
    categoryId: null,
    brandId: null,
    price: "190,00 DH",
    stock: 45,
    status: "active",
  },
  {
    id: "P002",
    image: "AD",
    name: "A-DERMA Gel moussant",
    description: "Nettoyant corps & bain",
    category: "Corps & Bain",
    brand: "A-DERMA",
    categoryId: null,
    brandId: null,
    price: "139,00 DH",
    stock: 38,
    status: "active",
  },
  {
    id: "P003",
    image: "VB",
    name: "Parfum La Vie Est Belle",
    description: "Eau de parfum",
    category: "Parfums",
    brand: "Lancôme",
    categoryId: null,
    brandId: null,
    price: "850,00 DH",
    stock: 32,
    status: "active",
  },
  {
    id: "P004",
    image: "LP",
    name: "Lash Princess Mascara",
    description: "Mascara volume",
    category: "Maquillage",
    brand: "Essence",
    categoryId: null,
    brandId: null,
    price: "59,00 DH",
    stock: 25,
    status: "active",
  },
  {
    id: "P005",
    image: "HL",
    name: "Huile capillaire L'Oréal",
    description: "Soin cheveux",
    category: "Capillaire",
    brand: "L'Oréal",
    categoryId: null,
    brandId: null,
    price: "89,00 DH",
    stock: 40,
    status: "inactive",
  },
  {
    id: "P006",
    image: "CD",
    name: "COFFRET CADEAU",
    description: "Pack beauté complet",
    category: "Coffrets",
    brand: "Bath & Body Works",
    categoryId: null,
    brandId: null,
    price: "500,00 DH",
    stock: 15,
    status: "active",
  },
  {
    id: "P007",
    image: "CR",
    name: "A-DERMA Crème hydratante",
    description: "Crème visage",
    category: "Soins Visage",
    brand: "A-DERMA",
    categoryId: null,
    brandId: null,
    price: "165,00 DH",
    stock: 22,
    status: "active",
  },
];

const ITEMS_PER_PAGE = 6;

function categoryBadgeClass(category: string) {
  if (category === "Parfums") return "bg-rose-100 text-rose-700";
  if (category === "Corps & Bain") return "bg-orange-100 text-orange-700";
  if (category === "Maquillage") return "bg-violet-100 text-violet-700";
  if (category === "Capillaire") return "bg-emerald-100 text-emerald-700";
  if (category === "Coffrets") return "bg-sky-100 text-sky-700";
  return "bg-zinc-100 text-zinc-700";
}

function ProductCard({ product }: { product: Product }) {
  const hasImageUrl = product.image.startsWith("http");
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-400">
          {hasImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </>
          ) : (
            <Package className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-base font-semibold text-zinc-900">{product.name}</p>
          <p className="mt-0.5 text-sm text-zinc-500">{product.brand}</p>
          <span
            className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(product.category)}`}
          >
            {product.category}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="text-right">
          <p className="text-xl font-bold text-zinc-900">{product.price}</p>
          <p className="text-xs text-zinc-500">Stock: {product.stock}</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButtons showView />
        </div>
      </div>
    </article>
  );
}

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productsFetchError, setProductsFetchError] = useState("");
  const [brandsOptions, setBrandsOptions] = useState<{ id: string; name: string }[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setProductsFetchError("");
      const [productsResult, brandsResult, categoriesResult] = await Promise.all([
        supabase
          .from("products")
          .select("id,name,description,price,old_price,image,stock,category_id,brand_id,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("brands").select("id, name"),
        supabase.from("categories").select("id, name"),
      ]);

      const { data, error } = productsResult;
      const { data: brandsData, error: brandsError } = brandsResult;
      const { data: categoriesData, error: categoriesError } = categoriesResult;

      if (brandsError) {
        console.error("Failed to fetch brands:", brandsError);
      }
      if (categoriesError) {
        console.error("Failed to fetch categories:", categoriesError);
      }
      if (error) {
        console.error("Products fetch error:", JSON.stringify(error, null, 2));
        if (mounted) {
          setProducts(mockProducts);
          setProductsFetchError(
            "Impossible de charger les produits pour le moment. Veuillez reessayer plus tard.",
          );
        }
      }
      if (!mounted || error || !data) return;

      const mappedBrands =
        !brandsError && brandsData
          ? (brandsData as OptionRow[]).map((item) => ({
              id: String(item.id),
              name: item.name ?? "Sans marque",
            }))
          : [];
      setBrandsOptions(mappedBrands);

      const mappedCategories =
        !categoriesError && categoriesData
          ? (categoriesData as OptionRow[]).map((item) => ({
              id: String(item.id),
              name: item.name ?? "Sans catégorie",
            }))
          : [];
      setCategoriesOptions(mappedCategories);

      const brandsById = new Map(mappedBrands.map((item) => [item.id, item.name]));
      const categoriesById = new Map(mappedCategories.map((item) => [item.id, item.name]));

      const mapped = (data as SupabaseProductRow[]).map((item) => ({
          id: String(item.id),
          image: item.image ?? "",
          name: item.name ?? "Produit",
          description: item.description ?? "",
          category: item.category_id
            ? (categoriesById.get(String(item.category_id)) ?? "Sans catégorie")
            : "Sans catégorie",
          brand: item.brand_id ? (brandsById.get(String(item.brand_id)) ?? "Sans marque") : "Sans marque",
          categoryId: item.category_id ? String(item.category_id) : null,
          brandId: item.brand_id ? String(item.brand_id) : null,
          price: `${item.price ?? 0} DH`,
          stock: Number(item.stock ?? 0),
          status: item.status === "inactive" ? "inactive" : "active",
        })) as Product[];

      setProducts(mapped);
    }

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || product.category === category;
      const matchesBrand = brand === "all" || product.brand === brand;
      const matchesStatus = status === "all" || product.status === status;
      return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [search, category, brand, status, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrorMessage("");
    setSelectedImageFile(file);
    setSelectedImageName(file.name);
    setImageUrl(URL.createObjectURL(file));
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setIsFormOpen(true);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormBrandId(product.brandId ?? "");
    setFormCategoryId(product.categoryId ?? "");
    setFormPrice(product.price.replace(" DH", ""));
    setFormStock(String(product.stock));
    setFormStatus(product.status);
    setImageUrl(product.image);
    setSelectedImageFile(null);
    setSelectedImageName("");
    setErrorMessage("");
  }

  function resetForm() {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormBrandId("");
    setFormCategoryId("");
    setFormPrice("");
    setFormStock("");
    setFormStatus("active");
    setImageUrl("");
    setSelectedImageFile(null);
    setSelectedImageName("");
    setErrorMessage("");
  }

  async function handleSaveProduct() {
    setErrorMessage("");
    if (!formName.trim()) {
      setErrorMessage("Le nom du produit est obligatoire.");
      return;
    }
    if (!formBrandId) {
      setErrorMessage("Veuillez sélectionner une marque.");
      return;
    }
    if (!formCategoryId) {
      setErrorMessage("Veuillez sélectionner une catégorie.");
      return;
    }
    setSavingProduct(true);
    const selectedBrand = brandsOptions.find((item) => item.id === formBrandId)?.name ?? "Sans marque";
    const selectedCategory =
      categoriesOptions.find((item) => item.id === formCategoryId)?.name ?? "Sans catégorie";
    let finalImageUrl: string | null = imageUrl || null;

    if (selectedImageFile) {
      setUploadingImage(true);
      const safeName = selectedImageFile.name.replace(/\s+/g, "-");
      const filePath = `products/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, selectedImageFile, { upsert: true });

      if (uploadError) {
        setErrorMessage(`Erreur upload image: ${uploadError.message}`);
        setSavingProduct(false);
        setUploadingImage(false);
        return;
      }

      const { data } = supabase.storage.from("products").getPublicUrl(filePath);
      finalImageUrl = data.publicUrl;
    } else if (!editingId) {
      finalImageUrl = null;
    }

    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      brand_id: formBrandId,
      category_id: formCategoryId,
      price: Number(formPrice || 0),
      stock: Number(formStock || 0),
      status: formStatus,
      image: finalImageUrl,
    };

    const result = editingId
      ? await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id)
          .select("id, name, description, price, stock, status, image, brand_id, category_id, brands(name), categories(name)")
          .single()
      : await supabase
          .from("products")
          .insert(payload)
          .select("id, name, description, price, stock, status, image, brand_id, category_id, brands(name), categories(name)")
          .single();

    if (result.error || !result.data) {
      setErrorMessage(result.error?.message ?? "Impossible d'enregistrer le produit.");
      setSavingProduct(false);
      return;
    }

    const row = result.data as SupabaseProductRow;
    const updatedProduct: Product = {
      id: String(row.id),
      image: row.image ?? "",
      name: row.name ?? "Produit",
      description: row.description ?? "",
      category: getRelationName(row.categories) ?? selectedCategory,
      brand: getRelationName(row.brands) ?? selectedBrand,
      categoryId: row.category_id ? String(row.category_id) : formCategoryId,
      brandId: row.brand_id ? String(row.brand_id) : formBrandId,
      price: `${row.price ?? 0} DH`,
      stock: Number(row.stock ?? 0),
      status: row.status === "inactive" ? "inactive" : "active",
    };

    setProducts((prev) => {
      const exists = prev.some((item) => item.id === updatedProduct.id);
      if (exists) return prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item));
      return [updatedProduct, ...prev];
    });
    setSavingProduct(false);
    setUploadingImage(false);
    setIsFormOpen(false);
    resetForm();
  }

  function openCreateForm() {
    resetForm();
    setEditingProduct(null);
    setIsFormOpen(true);
  }

  const editingId = editingProduct?.id ?? null;

  return (
    <section className="grid max-w-full gap-6 overflow-hidden 2xl:grid-cols-[2.1fr,1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Produits</h1>
          <p className="mt-1 text-sm text-zinc-500">Accueil / Produits</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#8b0637]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:contents">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={brand}
                onChange={(event) => {
                  setBrand(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:w-auto"
              >
                <option value="all">Toutes les marques</option>
                {brands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="hidden h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 sm:block sm:w-auto"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#8b0637] px-4 text-sm font-semibold text-white transition hover:bg-[#74052f] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Ajouter un produit
            </button>
          </div>
        </div>

        {productsFetchError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {productsFetchError}
          </div>
        ) : null}

        <div className="space-y-4 overflow-hidden md:hidden">
          {paginated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="hidden max-w-full overflow-x-auto md:block">
          <div className="min-w-[900px]">
            <DataTable
              columns={[
                {
                  key: "image",
                  header: "Image",
                  render: (item) => (
                    <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-700">
                      {item.image?.startsWith("http") ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </>
                      ) : (
                        "IMG"
                      )}
                    </span>
                  ),
                },
                {
                  key: "name",
                  header: "Nom du produit",
                  render: (item) => (
                    <div>
                      <p className="font-semibold text-zinc-800">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.description}</p>
                    </div>
                  ),
                },
                { key: "category", header: "Catégorie", render: (item) => item.category },
                { key: "brand", header: "Marque", render: (item) => item.brand },
                { key: "price", header: "Prix", render: (item) => item.price },
                { key: "stock", header: "Stock", render: (item) => item.stock },
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
                  render: (item) => <ActionButtons onEdit={() => handleEdit(item)} />,
                },
              ]}
              data={paginated}
              getRowKey={(item) => item.id}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-zinc-500">
            Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur{" "}
            {filtered.length} produits
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

      {isFormOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 hidden bg-black/30 xl:block"
            onClick={() => {
              setIsFormOpen(false);
              resetForm();
            }}
          />

          <aside className="fixed right-0 top-0 z-50 hidden h-screen w-full max-w-xl overflow-y-auto border-l border-zinc-200 bg-white p-5 shadow-xl xl:block">
            <h2 className="text-xl font-semibold text-zinc-900">
              {editingId ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </h2>
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveProduct();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nom du produit *</span>
                <input
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="Ex: Parfum La Vie Est Belle"
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#8b0637]/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Marque *</span>
                <select
                  value={formBrandId}
                  onChange={(event) => setFormBrandId(event.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                >
                  <option value="" disabled>
                    Sélectionnez une marque
                  </option>
                  {brandsOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {brandsOptions.length === 0 ? (
                  <p className="mt-1 text-xs text-zinc-500">Aucune marque trouvée</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Catégorie *</span>
                <select
                  value={formCategoryId}
                  onChange={(event) => setFormCategoryId(event.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                >
                  <option value="" disabled>
                    Sélectionnez une catégorie
                  </option>
                  {categoriesOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {categoriesOptions.length === 0 ? (
                  <p className="mt-1 text-xs text-zinc-500">Aucune catégorie trouvée</p>
                ) : null}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Prix *</span>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(event) => setFormPrice(event.target.value)}
                    placeholder="0"
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Stock *</span>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(event) => setFormStock(event.target.value)}
                    placeholder="0"
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Description</span>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  placeholder="Décrivez ce produit..."
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#8b0637]/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Image du produit</span>
                <input
                  id="desktop-product-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="sr-only"
                />
                <label
                  htmlFor="desktop-product-image-input"
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:bg-zinc-100"
                >
                  <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">Cliquez pour choisir une image</p>
                </label>
                {selectedImageName ? (
                  <p className="mt-2 text-xs text-zinc-600">Fichier: {selectedImageName}</p>
                ) : null}
                {uploadingImage ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Upload en cours lors de l&apos;enregistrement...
                  </p>
                ) : null}
              </label>

              {imageUrl ? (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-zinc-700">
                    {editingId ? "Image actuelle" : "Aperçu image"}
                  </p>
                  <div className="h-28 w-24 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Aperçu produit" className="h-full w-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center">
                  <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">Aucune image sélectionnée</p>
                </div>
              )}

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Statut *</span>
                <select
                  value={formStatus}
                  onChange={(event) => setFormStatus(event.target.value as "active" | "inactive")}
                  className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </label>

              {errorMessage ? (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="h-11 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || uploadingImage}
                  className="h-11 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f] disabled:opacity-60"
                >
                  {savingProduct ? "Enregistrement..." : editingId ? "Mettre à jour" : "Enregistrer le produit"}
                </button>
              </div>
            </form>
          </aside>

          <div className="fixed inset-0 z-50 xl:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            />
            <aside className="absolute inset-x-0 bottom-0 top-0 overflow-y-auto bg-white p-5 shadow-xl">
              <h2 className="text-xl font-semibold text-zinc-900">
                {editingId ? "Modifier le produit" : "Ajouter un nouveau produit"}
              </h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveProduct();
                }}
              >
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nom du produit *</span>
                  <input
                    type="text"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    placeholder="Ex: Parfum La Vie Est Belle"
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#8b0637]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Marque *</span>
                  <select
                    value={formBrandId}
                    onChange={(event) => setFormBrandId(event.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                  >
                    <option value="" disabled>
                      Sélectionnez une marque
                    </option>
                    {brandsOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {brandsOptions.length === 0 ? (
                    <p className="mt-1 text-xs text-zinc-500">Aucune marque trouvée</p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Catégorie *</span>
                  <select
                    value={formCategoryId}
                    onChange={(event) => setFormCategoryId(event.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                  >
                    <option value="" disabled>
                      Sélectionnez une catégorie
                    </option>
                    {categoriesOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {categoriesOptions.length === 0 ? (
                    <p className="mt-1 text-xs text-zinc-500">Aucune catégorie trouvée</p>
                  ) : null}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">Prix *</span>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(event) => setFormPrice(event.target.value)}
                      placeholder="0"
                      className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">Stock *</span>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(event) => setFormStock(event.target.value)}
                      placeholder="0"
                      className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Description</span>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(event) => setFormDescription(event.target.value)}
                    placeholder="Décrivez ce produit..."
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#8b0637]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Image du produit</span>
                  <input
                    id="mobile-product-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="sr-only"
                  />
                  <label
                    htmlFor="mobile-product-image-input"
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:bg-zinc-100"
                  >
                    <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                    <p className="text-xs text-zinc-500">Cliquez pour choisir une image</p>
                  </label>
                  {selectedImageName ? (
                    <p className="mt-2 text-xs text-zinc-600">Fichier: {selectedImageName}</p>
                  ) : null}
                  {uploadingImage ? (
                    <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Upload en cours lors de l&apos;enregistrement...
                    </p>
                  ) : null}
                </label>

                {imageUrl ? (
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-zinc-700">
                      {editingId ? "Image actuelle" : "Aperçu image"}
                    </p>
                    <div className="h-28 w-24 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Aperçu produit" className="h-full w-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center">
                    <Upload className="mb-2 h-5 w-5 text-zinc-500" />
                    <p className="text-xs text-zinc-500">Aucune image sélectionnée</p>
                  </div>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Statut *</span>
                  <select
                    value={formStatus}
                    onChange={(event) => setFormStatus(event.target.value as "active" | "inactive")}
                    className="h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#8b0637]/20"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </label>

                {errorMessage ? (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="h-11 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct || uploadingImage}
                    className="h-11 rounded-lg bg-[#8b0637] text-sm font-semibold text-white transition hover:bg-[#74052f] disabled:opacity-60"
                  >
                    {savingProduct ? "Enregistrement..." : editingId ? "Mettre à jour" : "Enregistrer le produit"}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </>
      ) : null}

      <div className="hidden 2xl:block">
        <aside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Formulaire produit</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Cliquez sur &quot;Ajouter un produit&quot; pour ouvrir le formulaire.
          </p>
        </aside>
      </div>
    </section>
  );
}
