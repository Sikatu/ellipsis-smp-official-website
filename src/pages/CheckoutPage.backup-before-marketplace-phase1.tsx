import { ArrowLeft, Download, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
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

const cratePricing: Record<string, Record<KeyQuantity, string>> = {
  "MonsterHunter Pineapple KPOP": {
    "1 key": "PHP 59",
    "3 keys": "PHP 149",
    "5 keys": "PHP 249",
    "10 keys": "PHP 499",
  },
  "Stellar Vanguard": {
    "1 key": "PHP 69",
    "3 keys": "PHP 179",
    "5 keys": "PHP 299",
    "10 keys": "PHP 579",
  },
  "Phoenix Mecha Sovereign": {
    "1 key": "PHP 79",
    "3 keys": "PHP 219",
    "5 keys": "PHP 349",
    "10 keys": "PHP 679",
  },
};

function normalizeCrateName(name: string) {
  if (name.toLowerCase().includes("monsterhunter")) {
    return "MonsterHunter Pineapple KPOP";
  }

  if (name.toLowerCase().includes("stellar")) {
    return "Stellar Vanguard";
  }

  if (name.toLowerCase().includes("phoenix")) {
    return "Phoenix Mecha Sovereign";
  }

  return name;
}

function CheckoutPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Premium Ranks");
  const [selectedRank, setSelectedRank] = useState(rankDetails[0].name);
  const [selectedCrate, setSelectedCrate] = useState(
    normalizeCrateName(crates[0]?.name || "MonsterHunter Pineapple KPOP")
  );
  const [selectedKeyQuantity, setSelectedKeyQuantity] =
    useState<KeyQuantity>("1 key");
  const [furnitureSlide, setFurnitureSlide] = useState(0);

  const [method, setMethod] = useState(paymentMethods[0]);
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const receiptPreviewUrl = receiptFile ? URL.createObjectURL(receiptFile) : "";

  const selectedRankDetails =
    rankDetails.find((rank) => rank.name === selectedRank) || rankDetails[0];

  const selectedRankAsset =
    ranks.find((rank) => rank.name === selectedRankDetails.name) || ranks[0];

  const selectedCrateAsset =
    crates.find(
      (crate) => normalizeCrateName(crate.name) === selectedCrate
    ) || crates[0];

  const selectedProduct = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return {
        name: selectedRankDetails.name,
        type: "Premium Rank",
        price: selectedRankDetails.price,
        image: selectedRankAsset.image,
        description: `${selectedRankDetails.name} rank with premium perks. This rank lasts for 30 days only.`,
      };
    }

    if (selectedCategory === "Premium Crates") {
      return {
        name: `${selectedCrate} - ${selectedKeyQuantity}`,
        type: "Premium Crate",
        price:
          cratePricing[selectedCrate]?.[selectedKeyQuantity] ||
          "Price not available",
        image: selectedCrateAsset.image,
        description: `Premium crate package with ${selectedKeyQuantity}.`,
      };
    }

    if (selectedCategory === "Furnitures") {
      return {
        name: "Ellipsis Coins",
        type: "Furnitures",
        price: "PHP 50",
        image: furniture.packs[furnitureSlide]?.image || furniture.packs[0].image,
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
    selectedRankAsset,
    selectedCrate,
    selectedKeyQuantity,
    selectedCrateAsset,
    furnitureSlide,
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

  function clearReceiptUpload() {
    setReceiptFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
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
    setSelectedCrate("MonsterHunter Pineapple KPOP");
    setSelectedKeyQuantity("1 key");
    setFurnitureSlide(0);
    resetForm();
  }

  function downloadQr() {
    const link = document.createElement("a");
    link.href = method.qr;
    link.download = `${method.label.toLowerCase()}-ellipsis-smp-qr`;
    link.click();
  }

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(String(reader.result).split(",")[1]);
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitClaim() {
    if (!canSubmit || !receiptFile) return;

    setStatus("sending");
    setSubmitError("");
    setOrderId("");

    try {
      const receiptBase64 = await fileToBase64(receiptFile);

      const response = await fetch("/api/payment-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: selectedProduct.name,
          productType: selectedProduct.type,
          productDescription: selectedProduct.description,
          price: selectedProduct.price,
          method: method.label,
          minecraftIgn,
          discordUsername,
          receiptBase64,
          receiptFileName: receiptFile.name,
          receiptMimeType: receiptFile.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || "Failed to submit payment claim."
        );
      }

      const data = await response.json();
      setOrderId(data.orderId || "");
      setStatus("success");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 shadow-[0_0_60px_rgba(168,85,247,0.18)] backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP
            </p>

            <h1 className="mt-3 text-4xl font-black">Secure Checkout</h1>

            <div className="mt-6 grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-gray-300 sm:grid-cols-4">
              {["Select Payment", "Pay QR", "Submit Claim", "Verification"].map(
                (step, index) => (
                  <div
                    key={step}
                    className={`flex min-h-[58px] items-center justify-center rounded-2xl border px-2 py-3 text-center leading-tight ${index === 3
                        ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                        : "border-purple-500/25 bg-black/30 text-purple-200"
                      }`}
                  >
                    {index + 1}. {step}
                  </div>
                )
              )}
            </div>

            <div className="mt-8 rounded-3xl border border-purple-500/20 bg-black/35 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                Choose Category
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                <div className="mt-5 grid gap-3">
                  {rankDetails.map((rank) => {
                    const isActive = selectedRank === rank.name;
                    const rankAsset =
                      ranks.find((item) => item.name === rank.name) || ranks[0];

                    return (
                      <button
                        key={rank.name}
                        type="button"
                        onClick={() => {
                          setSelectedRank(rank.name);
                          resetForm();
                        }}
                        className={`rounded-2xl border p-4 text-left transition ${isActive
                            ? "border-purple-300 bg-purple-500/15"
                            : "border-purple-500/20 bg-black/35 hover:bg-white/10"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={rankAsset.image}
                            alt={`${rank.name} rank badge`}
                            className="h-12 w-24 object-contain [image-rendering:pixelated]"
                          />

                          <div>
                            <p className="font-black text-white">{rank.name}</p>
                            <p className="text-sm font-black text-yellow-300">
                              {rank.price}
                            </p>
                          </div>
                        </div>

                        {isActive && (
                          <div className="mt-4 text-sm text-gray-300">
                            <p className="mb-2 font-black text-purple-200">
                              Complete Inclusions
                            </p>
                            <ul className="grid gap-1 sm:grid-cols-2">
                              {rank.includes.map((item) => (
                                <li key={item}>• {item}</li>
                              ))}
                            </ul>
                            <p className="mt-3 rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-3 text-yellow-100">
                              This rank lasts for 30 days only.
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedCategory === "Premium Crates" && (
                <div className="mt-5">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                    Choose Crate
                  </label>

                  <select
                    value={selectedCrate}
                    onChange={(e) => {
                      setSelectedCrate(e.target.value);
                      setSelectedKeyQuantity("1 key");
                      resetForm();
                    }}
                    className="mt-3 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
                  >
                    {Object.keys(cratePricing).map((crateName) => (
                      <option key={crateName} value={crateName}>
                        {crateName}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {keyQuantities.map((quantity) => (
                      <button
                        key={quantity}
                        type="button"
                        onClick={() => {
                          setSelectedKeyQuantity(quantity);
                          resetForm();
                        }}
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

              <div className="mt-6 flex justify-center rounded-3xl border border-purple-500/20 bg-black/50 p-5">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-44 w-full object-contain [image-rendering:pixelated]"
                />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                {selectedProduct.type}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {selectedProduct.name}
              </h2>

              <p className="mt-3 text-2xl font-black text-yellow-300">
                {selectedProduct.price}
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-300">
                {selectedProduct.description}
              </p>

              {selectedCategory === "Furnitures" && (
                <p className="mt-4 rounded-xl border border-purple-500/25 bg-purple-500/10 p-3 text-sm text-purple-100">
                  Purchase Ellipsis Coins and use them in-game at /warp trades
                  to choose the furniture you want.
                </p>
              )}

              {selectedCategory === "Plushies" && (
                <p className="mt-4 rounded-xl border border-pink-500/25 bg-pink-500/10 p-3 text-sm text-pink-100">
                  Purchase Plushie Keys and unlock adorable plushies in-game.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-5 text-sm text-green-200">
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

          <section className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-black">Choose Payment Method</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item)}
                  className={`rounded-2xl border px-4 py-3 font-black transition ${method.id === item.id
                      ? "border-purple-300 bg-purple-500/20 text-white"
                      : "border-purple-500/20 bg-black/25 text-gray-300 hover:bg-white/10"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-black via-purple-950/30 to-black p-5">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-purple-500/20 bg-black/40 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                  Selected Method
                </span>
                <span className="font-black text-white">{method.label}</span>
              </div>

              <div
                className={`mb-4 h-1 rounded-full bg-gradient-to-r ${method.color}`}
              />

              <div className="rounded-3xl border border-purple-400/20 bg-black/60 p-4 shadow-[0_0_35px_rgba(168,85,247,0.25)]">
                <img
                  src={method.qr}
                  alt={`${method.label} QR code`}
                  className="mx-auto max-h-[360px] w-full max-w-[360px] rounded-2xl object-contain"
                />
              </div>

              <button
                type="button"
                onClick={downloadQr}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 px-4 py-3 font-bold text-purple-200 hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Save QR
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-purple-500/20 bg-black/40 p-4 text-sm text-gray-300">
              <p className="font-black text-purple-200">
                Payment Instructions
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Open your selected payment app.</li>
                <li>Scan or save the QR code above.</li>
                <li>Send the exact amount shown in the order summary.</li>
                <li>Upload your payment receipt below.</li>
              </ol>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                  Order Review
                </p>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <p>
                    <span className="text-gray-500">Item:</span>{" "}
                    <span className="font-bold text-white">
                      {selectedProduct.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Amount:</span>{" "}
                    <span className="font-bold text-yellow-300">
                      {selectedProduct.price}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Payment:</span>{" "}
                    <span className="font-bold text-purple-200">
                      {method.label}
                    </span>
                  </p>
                </div>
              </div>

              <input
                value={minecraftIgn}
                onChange={(e) => {
                  setMinecraftIgn(e.target.value);
                  setStatus("idle");
                }}
                placeholder="Minecraft IGN"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <input
                value={discordUsername}
                onChange={(e) => {
                  setDiscordUsername(e.target.value);
                  setStatus("idle");
                }}
                placeholder="Discord username"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-purple-500/25 bg-black/40 px-4 py-5 font-bold text-purple-200 hover:bg-white/10">
                <Upload className="h-5 w-5" />
                {receiptFile ? receiptFile.name : "Upload payment receipt"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFileError("");
                    setStatus("idle");

                    if (file && file.size > 4 * 1024 * 1024) {
                      clearReceiptUpload();
                      setFileError("Receipt image must be under 4MB.");
                      return;
                    }

                    setReceiptFile(file);
                  }}
                />
              </label>

              {fileError && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                  {fileError}
                </p>
              )}

              {receiptPreviewUrl && (
                <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-4">
                  <p className="mb-3 text-sm font-black text-purple-200">
                    Receipt Preview
                  </p>
                  <img
                    src={receiptPreviewUrl}
                    alt="Uploaded receipt preview"
                    className="max-h-64 w-full rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      clearReceiptUpload();
                      setStatus("idle");
                    }}
                    className="mt-3 w-full rounded-lg border border-red-400/30 px-3 py-2 text-sm font-bold text-red-200 hover:bg-red-400/10"
                  >
                    Remove Receipt
                  </button>
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm text-yellow-100">
                <input
                  type="checkbox"
                  checked={hasConfirmedPayment}
                  onChange={(e) =>
                    setHasConfirmedPayment(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />
                <span>
                  I confirm that I have already sent the payment using the
                  selected QR code.
                </span>
              </label>

              <button
                type="button"
                disabled={!canSubmit || status === "sending"}
                onClick={submitClaim}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitLabel}
              </button>

              <div className="rounded-2xl border border-purple-500/20 bg-black/30 p-4 text-sm text-gray-300">
                <p className="font-black text-purple-200">What happens next?</p>
                <p className="mt-2">
                  Your claim is sent privately to Ellipsis SMP staff. Please
                  keep your receipt until your purchase is verified and
                  delivered.
                </p>
              </div>

              {status === "success" && (
                <div
                  ref={resultRef}
                  className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-green-200"
                >
                  <p className="font-black">Payment claim sent.</p>

                  {orderId && (
                    <p className="mt-2">
                      Order ID:{" "}
                      <span className="font-black text-white">{orderId}</span>
                    </p>
                  )}

                  <p className="mt-2 text-sm text-green-100/80">
                    Do you want to make another purchase?
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-green-400/30 px-3 py-2 text-sm font-bold text-green-100 hover:bg-green-400/10"
                    >
                      Yes, another purchase
                    </button>

                    <Link
                      to="/"
                      className="rounded-lg border border-purple-400/30 px-3 py-2 text-sm font-bold text-purple-100 hover:bg-purple-400/10"
                    >
                      No, back home
                    </Link>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div
                  ref={resultRef}
                  className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200"
                >
                  {submitError || "Something went wrong. Please try again."}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-purple-500/30 bg-black/85 p-3 shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
              Checkout
            </p>
            <p className="max-w-[210px] truncate text-sm font-black text-white">
              {selectedProduct.name}
            </p>
          </div>

          <p className="text-sm font-black text-yellow-300">
            {selectedProduct.price}
          </p>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;