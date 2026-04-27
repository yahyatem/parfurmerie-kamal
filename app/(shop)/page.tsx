import { ShieldCheck, Truck, WalletCards, Headset } from "lucide-react";
import CategoryCircle from "@/components/shop/CategoryCircle";
import ProductCard, { type ShopProduct } from "@/components/shop/ProductCard";

const categories = [
  { label: "Parfums", emoji: "Perf" },
  { label: "Soins visage", emoji: "Skin" },
  { label: "Maquillage", emoji: "Make" },
  { label: "Soins corps", emoji: "Body" },
  { label: "Cheveux", emoji: "Hair" },
  { label: "Accessoires", emoji: "Bag" },
];

const bestSellers: ShopProduct[] = [
  {
    id: "p1",
    name: "La Vie Est Belle",
    brand: "Lancome",
    description: "Eau de parfum 50ml",
    price: "890 DH",
    image: "P1",
  },
  {
    id: "p2",
    name: "Sauvage Elixir",
    brand: "Dior",
    description: "Parfum homme 60ml",
    price: "1 050 DH",
    image: "P2",
  },
  {
    id: "p3",
    name: "Rouge a Levres Matte",
    brand: "Maybelline",
    description: "Teinte 01 - Longue tenue",
    price: "79 DH",
    image: "P3",
  },
  {
    id: "p4",
    name: "Serum Vitamine C",
    brand: "Garnier",
    description: "Eclat intense 30ml",
    price: "129 DH",
    image: "P4",
  },
];

const newProducts: ShopProduct[] = [
  {
    id: "n1",
    name: "Libre Intense",
    brand: "YSL",
    description: "Eau de parfum 50ml",
    price: "980 DH",
    image: "N1",
  },
  {
    id: "n2",
    name: "Creme Hydratante",
    brand: "Nuxe",
    description: "Peaux seches 40ml",
    price: "210 DH",
    image: "N2",
  },
  {
    id: "n3",
    name: "Palette Nude Glow",
    brand: "Essence",
    description: "10 couleurs",
    price: "149 DH",
    image: "N3",
  },
  {
    id: "n4",
    name: "Huile Capillaire",
    brand: "L'Oreal",
    description: "Nutrition intense 100ml",
    price: "99 DH",
    image: "N4",
  },
];

const benefits = [
  { icon: ShieldCheck, label: "Produits 100% originaux" },
  { icon: Truck, label: "Livraison rapide partout au Maroc" },
  { icon: WalletCards, label: "Paiement a la livraison" },
  { icon: Headset, label: "Service client 7j/7" },
];

export default function ShopHomePage() {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-[#97002f] to-[#b0134d] p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-rose-100">Offres speciales</p>
            <p className="mt-1 text-3xl font-bold leading-tight">Jusqu&apos;a -40%</p>
            <button
              type="button"
              className="mt-3 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#97002f]"
            >
              Decouvrir
            </button>
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

      <section>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {categories.map((category) => (
            <CategoryCircle key={category.label} label={category.label} emoji={category.emoji} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Meilleures ventes</h2>
          <button type="button" className="text-sm font-medium text-[#97002f]">
            Voir tout
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-4 shadow-sm">
        <p className="text-sm text-zinc-500">Collection du mois</p>
        <p className="mt-1 text-xl font-bold text-[#97002f]">Nouveaux arrivages</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Nouveautes</h2>
          <button type="button" className="text-sm font-medium text-[#97002f]">
            Voir tout
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
