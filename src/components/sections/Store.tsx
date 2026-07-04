import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HelpCircle,
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

const buyerNotes = [
  {
    icon: ShieldCheck,
    title: "Verified by staff",
    text: "Receipt-based checkout keeps purchases trackable before delivery.",
  },
  {
    icon: Clock3,
    title: "Manual delivery",
    text: "Items are delivered after staff confirms the receipt and username.",
  },
  {
    icon: HelpCircle,
    title: "Need help?",
    text: "Use Discord support if the receipt, username, or order needs review.",
  },
];

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

  function getProductPrice(product: StoreProduct, keyBundle = "1 key") {
    if (product.type !== "crate") return product.price;

    const crate = crates.find((item) => item.name === product.name);
    return (
      crate?.options.find((option) => option.keys === keyBundle)?.price ||
      product.price
    );
  }

  function getCheckoutPath(product: StoreProduct, keyBundle = "1 key") {
    const params = new URLSearchParams({
      type: product.type,
      product: product.name,
    });

    if (product.type === "crate") {
      params.set("quantity", keyBundle);
    }

    return `/checkout?${params.toString()}`;
  }

  const checkoutPath = getCheckoutPath(selectedProduct, selectedKeyBundle);

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
          title="Browse, compare, then buy with confidence."
          description="Tap a product to preview it, pick crate quantities before checkout, or use Buy Now when you already know what you want."
        />

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {buyerNotes.map((note) => {
            const Icon = note.icon;

            return (
              <GlassPanel key={note.title} className="p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {note.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-gray-300">
                      {note.text}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <GlassPanel className="flex items-center gap-3 px-4 py-3 lg:min-w-[360px]">
            <Search className="h-5 w-5 text-purple-300" />
            <p className="text-sm font-bold text-gray-300">
              Mobile buyers can buy directly from each product card or use the sticky selected item.
            </p>
          </GlassPanel>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {categoryFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${activeFilter === filter.id
                    ? "border-purple-300 bg-purple-500/20 text-purple-100 shadow-[0_0_22px_rgba(168,85,247,0.2)]"
                    : "border-purple-500/20 bg-white/[0.04] text-gray-300 hover:border-purple-300/40 hover:bg-white/[0.08]"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sticky top-28 z-30 mb-5 rounded-[1.5rem] border border-purple-400/30 bg-[#080019]/95 p-4 shadow-[0_0_35px_rgba(168,85,247,0.28)] backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
                Selected Item
              </p>
              <p className="line-clamp-1 text-base font-black text-white">
                {selectedProduct.name}
              </p>
              <p className="mt-1 text-sm font-black text-yellow-300">
                {selectedProduct.type === "crate"
                  ? selectedCratePrice
                  : selectedProduct.price}
              </p>
            </div>

            <Link
              to={checkoutPath}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-xs font-black text-white shadow-[0_0_24px_rgba(168,85,247,0.28)]"
            >
              Buy Selected
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {selectedProduct.type === "crate" && selectedCrate && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {selectedCrate.options.map((option) => {
                const isSelected = selectedKeyBundle === option.keys;

                return (
                  <button
                    key={option.keys}
                    type="button"
                    onClick={() => setSelectedKeyBundle(option.keys)}
                    className={`rounded-xl border px-2 py-2 text-left transition ${isSelected
                        ? "border-blue-300 bg-blue-500/20 text-blue-100"
                        : "border-purple-500/20 bg-black/35 text-gray-300"
                      }`}
                  >
                    <span className="block text-[11px] font-black">
                      {option.keys}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-black text-yellow-300">
                      {option.price.replace("PHP ", "P")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const isActive = product.id === selectedProduct.id;
              const productKeyBundle =
                product.type === "crate" && isActive
                  ? selectedKeyBundle
                  : "1 key";
              const productPrice = getProductPrice(product, productKeyBundle);
              const productCheckoutPath = getCheckoutPath(
                product,
                productKeyBundle
              );

              return (
                <motion.div
                  key={product.id}
                  layout
                  className={`group rounded-[1.5rem] border p-3 text-left transition ${isActive
                      ? "border-purple-300/60 bg-purple-500/15 shadow-[0_0_35px_rgba(168,85,247,0.24)]"
                      : "border-purple-500/20 bg-white/[0.045] hover:border-purple-300/40 hover:bg-white/[0.075]"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => selectProduct(product)}
                    className="flex w-full items-center gap-4 text-left"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-purple-500/20 bg-black/40">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
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

                      <h3 className="mt-2 line-clamp-2 text-lg font-black leading-tight text-white">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm font-black text-yellow-300">
                        {productPrice}
                      </p>
                    </div>

                    <ArrowRight
                      className={`h-5 w-5 shrink-0 text-purple-300 transition ${isActive ? "translate-x-1" : "group-hover:translate-x-1"
                        }`}
                    />
                  </button>

                  {isActive && product.type === "crate" && selectedCrate && (
                    <div className="mt-3 grid grid-cols-4 gap-2 border-t border-purple-500/15 pt-3 lg:hidden">
                      {selectedCrate.options.map((option) => {
                        const isSelected = selectedKeyBundle === option.keys;

                        return (
                          <button
                            key={option.keys}
                            type="button"
                            onClick={() => setSelectedKeyBundle(option.keys)}
                            className={`rounded-xl border px-2 py-2 text-left transition ${isSelected
                                ? "border-blue-300 bg-blue-500/20 text-blue-100"
                                : "border-purple-500/20 bg-black/35 text-gray-300"
                              }`}
                          >
                            <span className="block text-[11px] font-black">
                              {option.keys}
                            </span>
                            <span className="mt-0.5 block text-[10px] font-black text-yellow-300">
                              {option.price.replace("PHP ", "P")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 border-t border-purple-500/15 pt-3 lg:hidden">
                    <button
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="rounded-xl border border-purple-500/25 bg-black/30 px-4 py-3 text-sm font-black text-purple-100"
                    >
                      {isActive ? "Selected" : "View"}
                    </button>

                    <Link
                      to={productCheckoutPath}
                      className="inline-flex min-w-[112px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-black text-white shadow-[0_0_24px_rgba(168,85,247,0.24)]"
                    >
                      Buy Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
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
              className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
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
                      loading="lazy"
                      decoding="async"
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

                    <h2 className="mt-5 break-words text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
                      {selectedProduct.name}
                    </h2>

                    <p className="mt-4 text-3xl font-black text-yellow-300 sm:text-4xl">
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

                    <p className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm leading-6 text-yellow-100">
                      After payment, upload your receipt in checkout and staff
                      will verify the order before delivery.
                    </p>
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
