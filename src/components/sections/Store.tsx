import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ranks } from "../../data/ranks";
import { crates, furniture, plushies } from "../../data/storeItems";
import GlassPanel from "../ui/GlassPanel";
import SectionHeader from "../ui/SectionHeader";

type ProductCategory = "Ranks" | "Crates" | "Furniture" | "Plushies";
type ProductType = "rank" | "crate" | "furniture" | "plushie";

type StoreProduct = {
  id: string;
  type: ProductType;
  category: ProductCategory;
  name: string;
  price: string;
  image: string;
  eyebrow: string;
  description: string;
  perks: string[];
  badge?: string;
};

const categoryFilters: { id: ProductCategory | "All"; label: string }[] = [
  { id: "All", label: "All Items" },
  { id: "Ranks", label: "Ranks" },
  { id: "Crates", label: "Crates" },
  { id: "Furniture", label: "Furniture" },
  { id: "Plushies", label: "Plushies" },
];

const rankDescriptions: Record<string, string> = {
  NEON: "A clean starter upgrade for players who want essential convenience and early premium access.",
  AETHER:
    "A flexible premium rank for players who want more homes, more utilities, and expanded shop access.",
  TITAN:
    "Built for dedicated players who want stronger convenience, more warps, and better trading flexibility.",
  OVERCLOCK:
    "A high-tier upgrade for active players who want repair access, feed, and stronger shop coverage.",
  ASCENDANT:
    "The top premium rank with the strongest perks, complete shop access, utility commands, and unlimited fly.",
};

function Store() {
  const shouldReduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] =
    useState<ProductCategory | "All">("All");
  const [selectedProductId, setSelectedProductId] =
    useState("rank-ascendant");
  const [selectedKeyBundle, setSelectedKeyBundle] = useState("1 key");

  const products = useMemo<StoreProduct[]>(() => {
    const rankProducts = ranks.map((rank) => ({
      id: `rank-${rank.name.toLowerCase()}`,
      type: "rank" as const,
      category: "Ranks" as const,
      name: rank.name,
      price: rank.price,
      image: rank.image,
      eyebrow: "Premium Rank",
      description:
        rankDescriptions[rank.name] ||
        "Premium monthly rank upgrade for Ellipsis SMP.",
      perks: rank.perks,
      badge: rank.badge,
    }));

    const crateProducts = crates.map((crate) => ({
      id: `crate-${crate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      type: "crate" as const,
      category: "Crates" as const,
      name: crate.name,
      price: crate.options[0]?.price || "Price unavailable",
      image: crate.image,
      eyebrow: "Premium Crate",
      description:
        "Choose a key bundle, pay the exact amount, and claim your crate keys after staff verification.",
      perks: crate.options.map((option) => `${option.keys} - ${option.price}`),
    }));

    const furnitureProduct = {
      id: "furniture-ellipsis-coins",
      type: "furniture" as const,
      category: "Furniture" as const,
      name: "Ellipsis Coins",
      price: "PHP 50",
      image: furniture.packs[0]?.image || "",
      eyebrow: "Furniture Currency",
      description:
        "Purchase Ellipsis Coins and use them in-game at /warp trades to choose the furniture you want.",
      perks: [
        "PHP 50 = 10 Ellipsis Coins",
        "Used at /warp trades",
        "Choose furniture in-game",
        "Best for builders and decorators",
      ],
    };

    const plushieProduct = {
      id: "plushies-plushie-keys",
      type: "plushie" as const,
      category: "Plushies" as const,
      name: "Plushie Keys",
      price: "PHP 50",
      image: plushies.image,
      eyebrow: "Collectible Keys",
      description:
        "Purchase Plushie Keys and unlock adorable plushies in-game.",
      perks: [
        "PHP 50 = 5 Plushie Keys",
        "Unlock collectible plushies",
        "Great for collectors",
        "Used in-game",
      ],
    };

    return [...rankProducts, ...crateProducts, furnitureProduct, plushieProduct];
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All") return products;
    return products.filter((product) => product.category === activeFilter);
  }, [activeFilter, products]);

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) || products[0];

  const selectedCrate =
    selectedProduct.type === "crate"
      ? crates.find((crate) => selectedProduct.name === crate.name)
      : null;

  const selectedCratePrice =
    selectedCrate?.options.find((option) => option.keys === selectedKeyBundle)
      ?.price ||
    selectedProduct.price ||
    "Price unavailable";

  const checkoutPath = useMemo(() => {
    const params = new URLSearchParams({
      type: selectedProduct.type,
      product: selectedProduct.name,
    });

    if (selectedProduct.type === "crate") {
      params.set("quantity", selectedKeyBundle);
    }

    return `/checkout?${params.toString()}`;
  }, [selectedKeyBundle, selectedProduct.name, selectedProduct.type]);

  function selectProduct(product: StoreProduct) {
    setSelectedProductId(product.id);

    if (product.type === "crate") {
      setSelectedKeyBundle("1 key");
    }
  }

  return (
    <section
      id="store"
      className="relative overflow-hidden px-4 py-20 text-white sm:px-6 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-80 max-w-5xl rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-80 w-80 rounded-full bg-blue-600/20 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Marketplace Catalog"
          title="Browse first. Expand when ready."
          description="Explore compact product cards, then open the full details only when something catches your eye."
        />

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <GlassPanel className="flex items-center gap-3 px-4 py-3 lg:min-w-[360px]">
            <Search className="h-5 w-5 text-purple-300" />
            <p className="text-sm font-bold text-gray-300">
              Select a product below to preview full details.
            </p>
          </GlassPanel>

          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${activeFilter === filter.id
                    ? "border-purple-300 bg-purple-500/20 text-purple-100 shadow-[0_0_22px_rgba(168,85,247,0.2)]"
                    : "border-purple-500/20 bg-white/[0.04] text-gray-300 hover:border-purple-300/40 hover:bg-white/[0.08]"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const isActive = product.id === selectedProduct.id;

              return (
                <motion.button
                  key={product.id}
                  type="button"
                  layout
                  onClick={() => selectProduct(product)}
                  className={`group flex w-full items-center gap-4 rounded-[1.5rem] border p-3 text-left transition ${isActive
                      ? "border-purple-300/60 bg-purple-500/15 shadow-[0_0_35px_rgba(168,85,247,0.24)]"
                      : "border-purple-500/20 bg-white/[0.045] hover:border-purple-300/40 hover:bg-white/[0.075]"
                    }`}
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-purple-500/20 bg-black/40">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain p-2 [image-rendering:pixelated]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-purple-200">
                        {product.eyebrow}
                      </span>

                      {product.badge && (
                        <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-200">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 truncate text-lg font-black text-white">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm font-black text-yellow-300">
                      {product.type === "crate" &&
                        selectedProduct.id === product.id
                        ? selectedCratePrice
                        : product.price}
                    </p>
                  </div>

                  <ArrowRight
                    className={`h-5 w-5 shrink-0 text-purple-300 transition ${isActive ? "translate-x-1" : "group-hover:translate-x-1"
                      }`}
                  />
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedProduct.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -18 }}
              transition={{ duration: 0.22 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <GlassPanel className="overflow-hidden">
                <div className="relative">
                  <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden border-b border-purple-500/20 bg-gradient-to-br from-purple-950/50 via-black/70 to-blue-950/40 p-8 sm:min-h-[320px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.24),transparent_45%)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <motion.img
                      key={selectedProduct.image}
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      initial={
                        shouldReduceMotion
                          ? false
                          : { opacity: 0, scale: 1.04 }
                      }
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : { opacity: 1, scale: 1 }
                      }
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="relative max-h-[260px] w-full object-contain drop-shadow-[0_0_45px_rgba(168,85,247,0.6)] [image-rendering:pixelated] sm:max-h-[300px]"
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-purple-200">
                        <Tag className="h-3.5 w-3.5" />
                        {selectedProduct.eyebrow}
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-green-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Staff Verified
                      </span>

                      {selectedProduct.badge && (
                        <span className="inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-yellow-200">
                          {selectedProduct.badge}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
                      {selectedProduct.name}
                    </h2>

                    <p className="mt-4 text-4xl font-black text-yellow-300">
                      {selectedProduct.type === "crate"
                        ? selectedCratePrice
                        : selectedProduct.price}
                    </p>

                    <p className="mt-5 text-sm leading-7 text-gray-300 md:text-base">
                      {selectedProduct.description}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        "Manual Verification",
                        "Secure Checkout",
                        "Staff Delivery",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 rounded-2xl border border-purple-500/15 bg-white/[0.04] px-3 py-3 text-xs font-black uppercase tracking-[0.12em] text-purple-100"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                          {item}
                        </div>
                      ))}
                    </div>

                    {selectedProduct.type === "crate" && selectedCrate && (
                      <div className="mt-7">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                          Key Quantity
                        </p>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {selectedCrate.options.map((option) => {
                            const isSelected =
                              selectedKeyBundle === option.keys;

                            return (
                              <button
                                key={option.keys}
                                type="button"
                                onClick={() => setSelectedKeyBundle(option.keys)}
                                className={`rounded-2xl border px-3 py-4 text-left transition ${isSelected
                                    ? "scale-[1.02] border-blue-300 bg-blue-500/20 text-blue-100 shadow-[0_0_24px_rgba(59,130,246,0.22)]"
                                    : "border-purple-500/20 bg-black/30 text-gray-300 hover:border-blue-300/40 hover:bg-white/[0.08]"
                                  }`}
                              >
                                <span className="block text-sm font-black uppercase">
                                  {option.keys}
                                </span>
                                <span className="mt-1 block text-xs font-black text-yellow-300">
                                  {option.price}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-7">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                        Included Details
                      </p>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {selectedProduct.perks.map((perk) => (
                          <div
                            key={perk}
                            className="flex items-center gap-2 rounded-2xl border border-purple-500/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-gray-200"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <Link
                        to={checkoutPath}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.32)] transition hover:scale-[1.02]"
                      >
                        Make Payment
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <div className="flex items-center justify-center gap-2 rounded-2xl border border-purple-500/20 bg-black/30 px-5 py-4 text-sm font-bold text-purple-100">
                        <Package className="h-4 w-4" />
                        Manual Delivery
                      </div>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 rounded-[2rem] border border-yellow-400/25 bg-yellow-400/10 p-5 text-center text-sm text-yellow-100">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <p>
              Browse here first, then complete payment through secure checkout
              with receipt-based staff verification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Store;
