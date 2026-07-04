import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createCheckoutOrder } from "../services/orders";
import { ranks } from "../data/ranks";
import { crates, furniture, plushies } from "../data/storeItems";

const paymentMethods = [
  {
    id: "GCash",
    label: "GCash",
    qr: "/payment/payment-gcash-qr.jpg",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "GoTyme",
    label: "GoTyme",
    qr: "/payment/payment-gotyme-qr.jpg",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "BPI",
    label: "BPI",
    qr: "/payment/payment-bpi-qr.png",
    color: "from-red-500 to-orange-400",
  },
];

type Category = "Premium Ranks" | "Premium Crates" | "Furnitures" | "Plushies";
type KeyQuantity = "1 key" | "3 keys" | "5 keys" | "10 keys";
type Status = "idle" | "sending" | "success" | "error";

const categories: Category[] = [
  "Premium Ranks",
  "Premium Crates",
  "Furnitures",
  "Plushies",
];

const keyQuantities: KeyQuantity[] = ["1 key", "3 keys", "5 keys", "10 keys"];

const rankDetails = [
  {
    name: "NEON",
    price: "PHP 99",
    description:
      "Perfect for players who want essential quality-of-life commands and extra convenience.",
    includes: [
      "NEON Rank Kit",
      "/sethome 3",
      "Player warp 1",
      "Auction slots 2",
      "/workbench",
      "Limited chat color",
      "Ores shop access",
    ],
  },
  {
    name: "AETHER",
    price: "PHP 199",
    description:
      "Unlock additional homes, utilities, and shop access for a more flexible survival experience.",
    includes: [
      "AETHER Rank Kit",
      "/sethome 5",
      "Player warp 2",
      "Auction slots 3",
      "/workbench",
      "/smithingtable",
      "Limited chat color",
      "Ores and Potion shop access",
    ],
  },
  {
    name: "TITAN",
    price: "PHP 299",
    description:
      "Designed for dedicated players who want greater convenience, more auction slots, and advanced utility commands.",
    includes: [
      "TITAN Rank Kit",
      "/sethome 7",
      "Player warp 5",
      "Auction slots 4",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "Limited chat color",
      "Ores and Potion shop access",
    ],
  },
  {
    name: "OVERCLOCK",
    price: "PHP 399",
    description:
      "A high-tier package for active players who want expanded commands, more shop access, and stronger daily convenience.",
    includes: [
      "OVERCLOCK Rank Kit",
      "/sethome 9",
      "Player warp 8",
      "Auction slots 5",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "/repair hand",
      "/feed",
      "Limited chat color",
      "Ores, Potion, and Redstone shop access",
    ],
  },
  {
    name: "ASCENDANT",
    price: "PHP 499",
    description:
      "The top premium rank with maximum convenience, complete shop access, advanced utilities, and unlimited fly.",
    includes: [
      "ASCENDANT Rank Kit",
      "/sethome 12",
      "Player warp 10",
      "Auction slots 6",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "/ender",
      "/repair all",
      "/repair hand",
      "/feed",
      "/heal",
      "All chat colors",
      "All shop access",
      "Unlimited fly",
    ],
  },
];

type CheckoutSelection = {
  category: Category;
  rank: string;
  crate: string;
  keyQuantity: KeyQuantity;
};

const defaultCheckoutSelection: CheckoutSelection = {
  category: "Premium Ranks",
  rank: rankDetails[0].name,
  crate: crates[0]?.name || "",
  keyQuantity: "1 key",
};

function normalizeParam(value: string | null) {
  return (value || "").trim().toLowerCase();
}

function isKeyQuantity(value: string | null | undefined): value is KeyQuantity {
  return keyQuantities.includes(value as KeyQuantity);
}

function getCheckoutSelectionFromSearch(search: string): CheckoutSelection {
  const params = new URLSearchParams(search);
  const product = normalizeParam(params.get("product"));
  const type = normalizeParam(params.get("type") || params.get("category"));
  const price = normalizeParam(params.get("price"));
  const quantity = params.get("quantity") || params.get("keys");

  const rank = rankDetails.find((item) => {
    const name = item.name.toLowerCase();
    return product === name || product.includes(name);
  });

  if (type.includes("rank") || rank) {
    return {
      ...defaultCheckoutSelection,
      category: "Premium Ranks",
      rank: rank?.name || defaultCheckoutSelection.rank,
    };
  }

  const crate = crates.find((item) => {
    const name = item.name.toLowerCase();
    return product === name || product.includes(name);
  });

  if (type.includes("crate") || crate) {
    const pricedQuantity = crate?.options.find(
      (option) => option.price.toLowerCase() === price
    )?.keys;

    return {
      ...defaultCheckoutSelection,
      category: "Premium Crates",
      crate: crate?.name || defaultCheckoutSelection.crate,
      keyQuantity: isKeyQuantity(quantity)
        ? quantity
        : isKeyQuantity(pricedQuantity)
          ? pricedQuantity
          : "1 key",
    };
  }

  if (
    type.includes("furniture") ||
    product.includes("furniture") ||
    product.includes("ellipsis coins")
  ) {
    return {
      ...defaultCheckoutSelection,
      category: "Furnitures",
    };
  }

  if (type.includes("plush") || product.includes("plush")) {
    return {
      ...defaultCheckoutSelection,
      category: "Plushies",
    };
  }

  return defaultCheckoutSelection;
}

function CheckoutPage() {
  const location = useLocation();
  const initialSelection = useMemo(
    () => getCheckoutSelectionFromSearch(location.search),
    [location.search]
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category>(initialSelection.category);
  const [selectedRank, setSelectedRank] = useState(initialSelection.rank);
  const [selectedCrate, setSelectedCrate] = useState(initialSelection.crate);
  const [selectedKeyQuantity, setSelectedKeyQuantity] =
    useState<KeyQuantity>(initialSelection.keyQuantity);
  const [furnitureSlide, setFurnitureSlide] = useState(0);
  const [method, setMethod] = useState(paymentMethods[0]);
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copiedRecipient, setCopiedRecipient] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);
  const [isReceiptZoomOpen, setIsReceiptZoomOpen] = useState(false);

  const selectedRankDetails =
    rankDetails.find((rank) => rank.name === selectedRank) || rankDetails[0];

  const selectedRankAsset =
    ranks.find((rank) => rank.name === selectedRankDetails.name) || ranks[0];

  const selectedCrateAsset =
    crates.find((crate) => crate.name === selectedCrate) || crates[0];

  const selectedCratePrice =
    selectedCrateAsset?.options.find((option) => option.keys === selectedKeyQuantity)
      ?.price || "Price not available";

  const categoryBanner = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return {
        src: selectedRankAsset.image,
        alt: `${selectedRankDetails.name} rank banner`,
      };
    }

    if (selectedCategory === "Premium Crates") {
      return {
        src: selectedCrateAsset?.image || crates[0]?.image || "",
        alt: `${selectedCrateAsset?.name || "Premium Crate"} banner`,
      };
    }

    if (selectedCategory === "Furnitures") {
      return {
        src: furniture.packs[furnitureSlide]?.image || furniture.packs[0]?.image || "",
        alt: "Furniture preview",
      };
    }

    return {
      src: plushies.image,
      alt: "Plushies preview",
    };
  }, [
    selectedCategory,
    selectedRankAsset.image,
    selectedRankDetails.name,
    selectedCrateAsset,
    furnitureSlide,
  ]);

  const selectedProduct = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return {
        name: selectedRankDetails.name,
        type: "Premium Rank",
        price: selectedRankDetails.price,
        image: selectedRankAsset.image,
        description: selectedRankDetails.description,
      };
    }

    if (selectedCategory === "Premium Crates") {
      return {
        name: `${selectedCrateAsset?.name || selectedCrate} - ${selectedKeyQuantity}`,
        type: "Premium Crate",
        price: selectedCratePrice,
        image: selectedCrateAsset?.image || "",
        description: `Premium crate package with ${selectedKeyQuantity}.`,
      };
    }

    if (selectedCategory === "Furnitures") {
      return {
        name: "Ellipsis Coins",
        type: "Furnitures",
        price: "PHP 50",
        image: furniture.packs[furnitureSlide]?.image || furniture.packs[0]?.image || "",
        description:
          "PHP 50 = 10 Ellipsis Coins. Use Ellipsis Coins in-game at /warp trades to choose the furniture you want.",
      };
    }

    return {
      name: "Plushie Keys",
      type: "Plushies",
      price: "PHP 50",
      image: plushies.image,
      description:
        "PHP 50 = 5 Plushie Keys. Use Plushie Keys in-game to unlock adorable plushies.",
    };
  }, [
    selectedCategory,
    selectedRankDetails,
    selectedRankAsset.image,
    selectedCrate,
    selectedCrateAsset,
    selectedKeyQuantity,
    selectedCratePrice,
    furnitureSlide,
  ]);

  const priceParts = useMemo(() => {
    const [currency, ...amountParts] = selectedProduct.price.split(" ");
    return {
      currency,
      amount: amountParts.join(" ") || selectedProduct.price,
    };
  }, [selectedProduct.price]);

  const productBadge = useMemo(() => {
    if (selectedCategory === "Premium Ranks") return "Premium Rank";
    if (selectedCategory === "Premium Crates") return "Premium Crate";
    if (selectedCategory === "Furnitures") return "Furniture Coins";
    return "Plushie Keys";
  }, [selectedCategory]);

  const receiveItems = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return [
        `${selectedRankDetails.name} Rank`,
        "30 Days Premium Access",
        "Delivered after staff verification",
      ];
    }

    if (selectedCategory === "Premium Crates") {
      return [
        `${selectedCrateAsset?.name || selectedCrate}`,
        selectedKeyQuantity,
        "Delivered after staff verification",
      ];
    }

    if (selectedCategory === "Furnitures") {
      return [
        "10 Ellipsis Coins",
        "Use at /warp trades",
        "Delivered after staff verification",
      ];
    }

    return [
      "5 Plushie Keys",
      "Unlock plushies in-game",
      "Delivered after staff verification",
    ];
  }, [
    selectedCategory,
    selectedRankDetails.name,
    selectedCrateAsset,
    selectedCrate,
    selectedKeyQuantity,
  ]);

  const canSubmit = useMemo(() => {
    return (
      minecraftIgn.trim() &&
      discordUsername.trim() &&
      receiptFile &&
      hasConfirmedPayment
    );
  }, [minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment]);

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Submitting...";
    if (!minecraftIgn.trim()) return "Enter Minecraft IGN";
    if (!discordUsername.trim()) return "Enter Discord Username";
    if (!receiptFile) return "Upload Receipt";
    if (!hasConfirmedPayment) return "Confirm Payment Sent";
    return "Submit Payment Claim";
  }, [minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment, status]);

  const activeCheckoutStep = useMemo(() => {
    if (status === "success") return 3;
    if (status === "sending" || canSubmit) return 2;
    if (receiptFile || hasConfirmedPayment) return 2;
    return 1;
  }, [canSubmit, hasConfirmedPayment, receiptFile, status]);

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreviewUrl("");
      return;
    }

    const preview = URL.createObjectURL(receiptFile);
    setReceiptPreviewUrl(preview);

    return () => URL.revokeObjectURL(preview);
  }, [receiptFile]);

  useEffect(() => {
    if (selectedCategory !== "Furnitures") return;

    const interval = window.setInterval(() => {
      setFurnitureSlide((current) => (current + 1) % furniture.packs.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [selectedCategory]);

  useEffect(() => {
    if (status === "success" || status === "error") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  useEffect(() => {
    const nextSelection = getCheckoutSelectionFromSearch(location.search);

    setSelectedCategory(nextSelection.category);
    setSelectedRank(nextSelection.rank);
    setSelectedCrate(nextSelection.crate);
    setSelectedKeyQuantity(nextSelection.keyQuantity);
    setFurnitureSlide(0);
    resetCheckoutState();
  }, [location.search]);

  function clearReceiptUpload() {
    setReceiptFile(null);
    setFileError("");
    setIsDraggingReceipt(false);
    setIsReceiptZoomOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetCheckoutState() {
    setMinecraftIgn("");
    setDiscordUsername("");
    setHasConfirmedPayment(false);
    setOrderId("");
    setSubmitError("");
    setStatus("idle");
    clearReceiptUpload();
  }

  function resetPurchase(category: Category) {
    setSelectedCategory(category);
    setSelectedRank(rankDetails[0].name);
    setSelectedCrate(crates[0]?.name || "");
    setSelectedKeyQuantity("1 key");
    setFurnitureSlide(0);
    resetCheckoutState();
  }

  function updateRank(rankName: string) {
    setSelectedRank(rankName);
    resetCheckoutState();
  }

  function updateCrate(crateName: string) {
    setSelectedCrate(crateName);
    setSelectedKeyQuantity("1 key");
    resetCheckoutState();
  }

  function updateKeyQuantity(quantity: KeyQuantity) {
    setSelectedKeyQuantity(quantity);
    resetCheckoutState();
  }

  function downloadQr() {
    const link = document.createElement("a");
    link.href = method.qr;
    link.download = `${method.label.toLowerCase()}-ellipsis-smp-qr`;
    link.click();
  }

  async function copyRecipientInfo() {
    const recipientInfo = "Account name: DG\nAccount number: 09153461734";

    try {
      await navigator.clipboard.writeText(recipientInfo);
      setCopiedRecipient(true);
      window.setTimeout(() => setCopiedRecipient(false), 1800);
    } catch {
      setCopiedRecipient(false);
    }
  }

  async function copyOrderId() {
    if (!orderId) return;

    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      window.setTimeout(() => setCopiedOrderId(false), 1800);
    } catch {
      setCopiedOrderId(false);
    }
  }

  function processReceiptFile(file: File | null) {
    setFileError("");
    setStatus("idle");

    if (!file) {
      setReceiptFile(null);
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      clearReceiptUpload();
      setFileError("Receipt must be PNG, JPG, JPEG, or WEBP.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      clearReceiptUpload();
      setFileError("Receipt image must be under 4MB.");
      return;
    }

    setReceiptFile(file);
  }

  async function submitClaim() {
    if (!canSubmit || !receiptFile) return;

    setStatus("sending");
    setSubmitError("");
    setOrderId("");

    try {
      const createdOrderId = await createCheckoutOrder({
        customerName: minecraftIgn.trim(),
        minecraftUsername: minecraftIgn.trim(),
        discordUsername: discordUsername.trim(),
        productId: `${selectedProduct.type}-${selectedProduct.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
        productName: selectedProduct.name,
        productCategory: selectedProduct.type,
        productPrice: selectedProduct.price,
        quantity:
          selectedCategory === "Premium Crates"
            ? selectedKeyQuantity
            : null,
        paymentMethod: method.label,
        receiptFile,
      });

      setOrderId(createdOrderId);
      setStatus("success");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#030014] px-3 pb-32 pt-28 text-white sm:px-6 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <section className="rounded-[1.75rem] border border-purple-500/25 bg-white/[0.06] p-4 shadow-[0_0_60px_rgba(168,85,247,0.18)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Secure Checkout</h1>

            <div className="mt-6 grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-gray-300 sm:grid-cols-4 sm:gap-3 sm:text-[10px]">
              {["Select Product", "Pay QR", "Submit Claim", "Verification"].map(
                (step, index) => {
                  const isActive = index === activeCheckoutStep;
                  const isComplete = index < activeCheckoutStep;

                  return (
                    <div
                      key={step}
                      className={`relative flex min-h-[56px] items-center justify-center overflow-hidden rounded-2xl border px-2 py-3 text-center leading-tight transition duration-300 sm:min-h-[64px] ${isActive
                          ? "scale-[1.02] border-purple-200 bg-purple-500/25 text-white shadow-[0_0_32px_rgba(168,85,247,0.45)]"
                          : isComplete
                            ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100"
                            : "border-purple-500/25 bg-black/30 text-purple-200"
                        }`}
                    >
                      {isActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-300/10 to-blue-400/0" />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {isComplete ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <span>{index + 1}.</span>
                        )}
                        {step}
                      </span>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-black/35">
              <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden border-b border-purple-500/20 bg-gradient-to-br from-black via-purple-950/30 to-black p-4 sm:min-h-[220px] sm:p-5">
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.22),transparent_55%)]" />
                {categoryBanner.src && (
                  <img
                    key={categoryBanner.src}
                    src={categoryBanner.src}
                    alt={categoryBanner.alt}
                    className="relative z-10 h-40 w-full object-contain opacity-100 transition-opacity duration-300 [image-rendering:pixelated] sm:h-52"
                  />
                )}
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                  Choose a Category
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => resetPurchase(category)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${selectedCategory === category
                          ? "border-purple-300 bg-purple-500/20 text-white"
                          : "border-purple-500/20 bg-black/35 text-gray-300 hover:bg-white/10"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {selectedCategory === "Premium Ranks" && (
                  <div className="mt-5">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                      Choose Rank
                    </label>
                    <select
                      value={selectedRank}
                      onChange={(event) => updateRank(event.target.value)}
                      className="mt-3 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
                    >
                      {rankDetails.map((rank) => (
                        <option key={rank.name} value={rank.name}>
                          {rank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedCategory === "Premium Crates" && (
                  <div className="mt-5">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                      Choose Crate
                    </label>

                    <select
                      value={selectedCrate}
                      onChange={(event) => updateCrate(event.target.value)}
                      className="mt-3 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
                    >
                      {crates.map((crate) => (
                        <option key={crate.name} value={crate.name}>
                          {crate.name}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {keyQuantities.map((quantity) => (
                        <button
                          key={quantity}
                          type="button"
                          onClick={() => updateKeyQuantity(quantity)}
                          className={`rounded-xl border px-3 py-3 text-sm font-black transition ${selectedKeyQuantity === quantity
                              ? "border-blue-300 bg-blue-500/20 text-blue-100"
                              : "border-purple-500/25 bg-black/40 text-gray-300 hover:bg-white/10"
                            }`}
                        >
                          {quantity}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  key={`${selectedCategory}-${selectedProduct.name}-${selectedProduct.price}`}
                  className="mt-6 rounded-3xl border border-purple-500/20 bg-black/45 p-5 shadow-inner shadow-purple-950/30 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-purple-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        {productBadge}
                      </div>

                      <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                        {selectedProduct.name}
                      </h2>
                    </div>

                    <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-4 text-right shadow-[0_0_25px_rgba(250,204,21,0.12)]">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-100/80">
                        {priceParts.currency}
                      </p>
                      <p className="text-3xl font-black leading-none text-yellow-300 sm:text-4xl">
                        {priceParts.amount}
                      </p>
                    </div>
                  </div>

                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

                  <div className="rounded-2xl border border-purple-400/15 bg-white/[0.04] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-200">
                      About this purchase
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-200">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {selectedCategory === "Premium Ranks" && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-200">
                          Included Perks
                        </p>
                        <p className="rounded-full border border-purple-400/15 bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-100">
                          {selectedRankDetails.includes.length} benefits
                        </p>
                      </div>

                      <ul className="mt-4 grid gap-3 text-sm text-gray-100 sm:grid-cols-2">
                        {selectedRankDetails.includes.map((item) => (
                          <li
                            key={item}
                            className="group flex min-h-[48px] items-center gap-3 rounded-2xl border border-purple-400/15 bg-white/[0.05] px-4 py-3 font-semibold shadow-inner shadow-purple-950/20 transition hover:border-purple-300/35 hover:bg-purple-500/10"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-purple-100">
                          You will receive
                        </p>
                        <ul className="mt-3 grid gap-2 text-sm text-gray-100">
                          {receiveItems.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-yellow-200">
                          30-Day Premium Access
                        </p>
                        <p className="mt-1 text-sm font-semibold text-yellow-100/90">
                          This rank remains active for 30 days from activation.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedCategory !== "Premium Ranks" && (
                    <div className="mt-6 rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-purple-100">
                        You will receive
                      </p>
                      <ul className="mt-3 grid gap-2 text-sm text-gray-100">
                        {receiveItems.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCategory === "Premium Crates" && (
                    <p className="mt-5 rounded-xl border border-blue-400/25 bg-blue-400/10 p-3 text-sm text-blue-100">
                      Select the key bundle you want, pay the exact amount, then
                      upload your receipt for staff verification.
                    </p>
                  )}

                  {selectedCategory === "Furnitures" && (
                    <p className="mt-5 rounded-xl border border-purple-500/25 bg-purple-500/10 p-3 text-sm text-purple-100">
                      Purchase Ellipsis Coins and use them in-game at /warp
                      trades to choose the furniture you want.
                    </p>
                  )}

                  {selectedCategory === "Plushies" && (
                    <p className="mt-5 rounded-xl border border-pink-500/25 bg-pink-500/10 p-3 text-sm text-pink-100">
                      Purchase Plushie Keys and unlock adorable plushies in-game.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-200 sm:p-5">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck className="h-5 w-5" />
                Manual Verification
              </div>

              <p className="mt-2 text-green-100/80">
                Pay using the QR, upload your receipt, then staff will verify
                and deliver your item.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 shadow-[0_0_55px_rgba(59,130,246,0.12)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">
                  Payment
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Complete Your Purchase
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                  Pay the exact amount, upload your receipt, then Ellipsis staff
                  will verify and deliver your purchase.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
                  Amount Due
                </p>
                <p className="text-2xl font-black text-yellow-300">
                  {selectedProduct.price}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMethod(item);
                    setCopiedRecipient(false);
                  }}
                  className={`group rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${method.id === item.id
                      ? "border-purple-300 bg-purple-500/20 text-white shadow-[0_0_25px_rgba(168,85,247,0.22)]"
                      : "border-purple-500/20 bg-black/25 text-gray-300 hover:bg-white/10"
                    }`}
                >
                  <span className="block text-sm font-black">{item.label}</span>
                  <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 group-hover:text-purple-200">
                    QR Payment
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-black via-purple-950/30 to-black">
              <div className="flex items-center justify-between border-b border-purple-500/20 bg-white/[0.04] px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">
                    Selected Method
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {method.label}
                  </p>
                </div>

                <div className="rounded-full border border-purple-400/25 bg-black/45 px-3 py-1 text-xs font-black text-purple-100">
                  Exact Amount Only
                </div>
              </div>

              <div className={`h-1 bg-gradient-to-r ${method.color}`} />

              <div className="p-4 sm:p-5">
                <div className="rounded-[1.75rem] border border-purple-400/20 bg-black/65 p-4 shadow-[0_0_35px_rgba(168,85,247,0.25)]">
                  <img
                    src={method.qr}
                    alt={`${method.label} QR code`}
                    className="mx-auto max-h-[300px] w-full max-w-[300px] rounded-2xl object-contain sm:max-h-[360px] sm:max-w-[360px]"
                  />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={downloadQr}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-white/[0.04] px-4 py-3 font-bold text-purple-100 transition hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" />
                    Save QR
                  </button>

                  {method.id === "GCash" && (
                    <button
                      type="button"
                      onClick={copyRecipientInfo}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 font-bold text-blue-100 transition hover:bg-blue-500/20"
                    >
                      {copiedRecipient ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedRecipient
                        ? "Recipient Info Copied"
                        : "Copy Recipient Info"}
                    </button>
                  )}
                </div>

                {method.id === "GCash" && (
                  <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                      GCash Recipient
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-blue-50">
                      <p className="flex items-center justify-between gap-4 rounded-xl bg-black/25 px-3 py-2">
                        <span className="text-blue-200/70">Account name</span>
                        <span className="font-black">DG</span>
                      </p>
                      <p className="flex items-center justify-between gap-4 rounded-xl bg-black/25 px-3 py-2">
                        <span className="text-blue-200/70">Account number</span>
                        <span className="font-black">09153461734</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-purple-500/20 bg-black/40 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                Payment Instructions
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
                {[
                  "Open your selected payment app.",
                  "Scan or save the QR code.",
                  "Pay the exact amount shown.",
                  "Upload the receipt for verification.",
                ].map((instruction, index) => (
                  <div
                    key={instruction}
                    className="flex gap-3 rounded-2xl border border-purple-500/15 bg-white/[0.04] p-3 text-sm text-gray-300"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-black text-purple-100">
                      {index + 1}
                    </span>
                    <span className="leading-6">{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:gap-4">
              <div className="rounded-3xl border border-purple-500/20 bg-black/45 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                      Order Review
                    </p>
                    <p className="mt-2 text-lg font-black text-white">
                      {selectedProduct.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {selectedProduct.type}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">
                      Total
                    </p>
                    <p className="text-2xl font-black text-yellow-300">
                      {selectedProduct.price}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 border-t border-purple-500/15 pt-4 text-sm sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      Payment Method
                    </p>
                    <p className="mt-1 font-black text-purple-100">
                      {method.label}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      Verification
                    </p>
                    <p className="mt-1 font-black text-green-200">
                      Manual Staff Review
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={minecraftIgn}
                  onChange={(e) => {
                    setMinecraftIgn(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="Minecraft IGN"
                  className="rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 font-semibold outline-none transition placeholder:text-gray-600 focus:border-purple-300 focus:bg-black/60"
                />

                <input
                  value={discordUsername}
                  onChange={(e) => {
                    setDiscordUsername(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="Discord username"
                  className="rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 font-semibold outline-none transition placeholder:text-gray-600 focus:border-purple-300 focus:bg-black/60"
                />
              </div>

              <label
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDraggingReceipt(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingReceipt(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDraggingReceipt(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingReceipt(false);
                  processReceiptFile(event.dataTransfer.files?.[0] || null);
                }}
                className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed px-4 py-7 text-center transition ${isDraggingReceipt
                    ? "border-emerald-300 bg-emerald-400/10 shadow-[0_0_28px_rgba(52,211,153,0.18)]"
                    : "border-purple-400/35 bg-black/40 hover:border-purple-300 hover:bg-purple-500/10"
                  }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition group-hover:scale-105 ${isDraggingReceipt
                      ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-200"
                      : "border-purple-400/25 bg-purple-500/10 text-purple-200"
                    }`}
                >
                  <Upload className="h-5 w-5" />
                </span>
                <span className="font-black text-purple-100">
                  {receiptFile
                    ? receiptFile.name
                    : isDraggingReceipt
                      ? "Drop receipt to upload"
                      : "Upload or drag receipt here"}
                </span>
                <span className="max-w-md text-xs font-semibold leading-5 text-gray-500">
                  PNG, JPG, JPEG, or WEBP only. Maximum 4MB. The receipt resets
                  automatically when you change your purchase.
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    processReceiptFile(e.target.files?.[0] || null)
                  }
                />
              </label>

              {fileError && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                  {fileError}
                </p>
              )}

              {receiptPreviewUrl && (
                <div className="rounded-3xl border border-purple-500/20 bg-black/45 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-purple-200">
                        Receipt Preview
                      </p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        Ready for submission. Click the preview to inspect it.
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-200">
                      Uploaded
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReceiptZoomOpen(true)}
                    className="group w-full overflow-hidden rounded-2xl border border-purple-500/15 bg-black/40"
                  >
                    <img
                      src={receiptPreviewUrl}
                      alt="Uploaded receipt preview"
                      className="max-h-56 w-full object-contain transition duration-300 group-hover:scale-[1.02] sm:max-h-64"
                    />
                  </button>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIsReceiptZoomOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/30 px-3 py-2 text-sm font-bold text-purple-100 transition hover:bg-purple-400/10"
                    >
                      View Larger
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        clearReceiptUpload();
                        setStatus("idle");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 px-3 py-2 text-sm font-bold text-red-200 transition hover:bg-red-400/10"
                    >
                      <X className="h-4 w-4" />
                      Remove Receipt
                    </button>
                  </div>
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm text-yellow-100 transition hover:bg-yellow-400/15">
                <input
                  type="checkbox"
                  checked={hasConfirmedPayment}
                  onChange={(e) =>
                    setHasConfirmedPayment(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />
                <span>
                  I confirm that I have already sent the exact payment using the
                  selected QR code.
                </span>
              </label>

              <button
                type="button"
                disabled={!canSubmit || status === "sending"}
                onClick={submitClaim}
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black shadow-[0_0_30px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                {submitLabel}
              </button>

              <div className="rounded-2xl border border-purple-500/20 bg-black/30 p-4 text-sm text-gray-300">
                <p className="font-black text-purple-200">What happens next?</p>
                <p className="mt-2 leading-6">
                  Your claim is sent privately to Ellipsis SMP staff. Please
                  keep your receipt until your purchase is verified and
                  delivered.
                </p>
              </div>

              {status === "success" && (
                <div
                  ref={resultRef}
                  className="overflow-hidden rounded-[1.75rem] border border-emerald-300/30 bg-gradient-to-br from-emerald-400/15 via-black/45 to-purple-500/10 p-5 text-emerald-100 shadow-[0_0_40px_rgba(52,211,153,0.18)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 shadow-[0_0_26px_rgba(52,211,153,0.25)]">
                      <CheckCircle2 className="h-6 w-6 text-emerald-200" />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
                        Claim Submitted
                      </p>
                      <h3 className="mt-1 text-2xl font-black text-white">
                        Payment claim sent successfully.
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                        Your order is now waiting for manual staff verification.
                        Usual verification time is 5-30 minutes.
                      </p>
                    </div>
                  </div>

                  {orderId && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                        Order ID
                      </p>

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-mono text-xl font-black text-white">
                          {orderId}
                        </span>

                        <button
                          type="button"
                          onClick={copyOrderId}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-100 hover:bg-emerald-400/20"
                        >
                          {copiedOrderId ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copiedOrderId ? "Copied" : "Copy Order ID"}
                        </button>
                      </div>
                    </div>
                  )}

                  {orderId && (
                    <Link
                      to={`/track?order=${orderId}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-black text-white hover:opacity-90"
                    >
                      Track This Order
                    </Link>
                  )}

                  <div className="mt-5 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-4">
                    <p className="text-sm font-black text-yellow-100">
                      Estimated verification time
                    </p>
                    <p className="mt-1 text-sm text-yellow-100/80">
                      Usually within 5-30 minutes. Please keep your receipt until
                      your purchase is verified and delivered in-game.
                    </p>
                  </div>

                  <p className="mt-5 text-sm font-bold text-emerald-100/85">
                    Would you like another purchase?
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => resetPurchase("Premium Ranks")}
                      className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 font-bold text-emerald-100 hover:bg-emerald-400/20"
                    >
                      Yes, Start Another Purchase
                    </button>

                    <Link
                      to="/marketplace"
                      className="rounded-xl border border-purple-300/30 bg-purple-400/10 px-4 py-3 text-center font-bold text-purple-100 hover:bg-purple-400/20"
                    >
                      Back to Marketplace
                    </Link>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div
                  ref={resultRef}
                  className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200"
                >
                  <p className="font-black">Submission failed.</p>
                  <p className="mt-2 text-sm">{submitError}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {isReceiptZoomOpen && receiptPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-4">
            <div className="w-full max-w-4xl rounded-[1.5rem] border border-purple-400/25 bg-[#080019]/95 p-3 shadow-[0_0_70px_rgba(168,85,247,0.25)] sm:rounded-[2rem] sm:p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-300">
                    Receipt Zoom
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    Review the uploaded receipt before submitting your claim.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReceiptZoomOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/25 text-purple-100 transition hover:bg-white/10"
                  aria-label="Close receipt preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[72vh] overflow-auto rounded-2xl border border-purple-500/15 bg-black/60 p-2 sm:max-h-[75vh] sm:p-3">
                <img
                  src={receiptPreviewUrl}
                  alt="Uploaded receipt zoom preview"
                  className="mx-auto max-h-[68vh] w-full object-contain sm:max-h-[70vh]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-purple-500/30 bg-[#080019]/95 p-3 shadow-[0_0_35px_rgba(168,85,247,0.35)] backdrop-blur-xl sm:p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                Selected Product
              </p>
              <p className="line-clamp-1 text-sm font-black text-white">
                {selectedProduct.name}
              </p>
            </div>

            <p className="shrink-0 text-right text-lg font-black text-yellow-300">
              {selectedProduct.price}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;
