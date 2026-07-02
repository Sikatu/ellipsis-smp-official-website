import { ArrowLeft, Download, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ranks } from "../data/ranks";
import { crates, furniture, plushies } from "../data/storeItems";

const paymentMethods = [
  { id: "GCash", label: "GCash", qr: "/payment/payment-gcash-qr.jpg", color: "from-blue-500 to-cyan-400" },
  { id: "GoTyme", label: "GoTyme", qr: "/payment/payment-gotyme-qr.jpg", color: "from-green-400 to-emerald-500" },
  { id: "BPI", label: "BPI", qr: "/payment/payment-bpi-qr.png", color: "from-red-500 to-orange-400" },
];

type CheckoutItem = {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  description: string;
};

const checkoutItems: CheckoutItem[] = [
  ...ranks.map((rank) => ({
    id: `rank-${rank.name}`,
    name: rank.name,
    type: "Premium Rank",
    price: rank.price,
    image: rank.image,
    description: `Includes ${rank.kit}. ${rank.perks.slice(0, 3).join(" • ")}`,
  })),
  ...crates.flatMap((crate) =>
    crate.options.map((option) => ({
      id: `crate-${crate.name}-${option.keys}`,
      name: `${crate.name} - ${option.keys}`,
      type: "Premium Crate",
      price: option.price,
      image: crate.image,
      description: `Premium crate package with ${option.keys}.`,
    }))
  ),
  ...furniture.packs.map((pack) => ({
    id: `furniture-${pack.name}`,
    name: pack.name,
    type: "Furniture Pack",
    price: furniture.price,
    image: pack.image,
    description: pack.description,
  })),
  {
    id: "plushies-main",
    name: plushies.title,
    type: "Collectible Plushies",
    price: plushies.price,
    image: plushies.image,
    description: plushies.description,
  },
];

function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const queryProduct = searchParams.get("product");

  const initialItem =
    checkoutItems.find((item) => item.name === queryProduct) || checkoutItems[0];

  const [selectedItemId, setSelectedItemId] = useState(initialItem.id);
  const selectedItem =
    checkoutItems.find((item) => item.id === selectedItemId) || checkoutItems[0];

  const [method, setMethod] = useState(paymentMethods[0]);
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const receiptPreviewUrl = receiptFile ? URL.createObjectURL(receiptFile) : "";
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const resultRef = useRef<HTMLDivElement | null>(null);

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
    if (status === "success" || status === "error") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  function resetForm() {
    setMinecraftIgn("");
    setDiscordUsername("");
    setReceiptFile(null);
    setHasConfirmedPayment(false);
    setOrderId("");
    setFileError("");
    setStatus("idle");
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
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
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
          product: selectedItem.name,
          productType: selectedItem.type,
          productDescription: selectedItem.description,
          price: selectedItem.price,
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
        throw new Error(errorData?.error || "Failed to submit payment claim.");
      }

      const data = await response.json();
      setOrderId(data.orderId || "");
      setStatus("success");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 shadow-[0_0_60px_rgba(168,85,247,0.18)] backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-300">Ellipsis SMP</p>
            <h1 className="mt-3 text-4xl font-black">Secure Checkout</h1>

            <div className="mt-6 grid gap-3 text-xs font-black uppercase tracking-[0.16em] text-gray-300 sm:grid-cols-4">
              {["Select Payment", "Pay QR", "Submit Claim", "Verification"].map((step, index) => (
                <div key={step} className={`rounded-2xl border px-3 py-3 text-center ${index === 3 ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200" : "border-purple-500/25 bg-black/30 text-purple-200"}`}>
                  {index + 1}. {step}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-purple-500/20 bg-black/35 p-5">
              <label className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                Change Purchase
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  resetForm();
                }}
                className="mt-3 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
              >
                {checkoutItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.price}
                  </option>
                ))}
              </select>

              <div className="mt-6 flex justify-center rounded-3xl border border-purple-500/20 bg-black/50 p-5">
                <img src={selectedItem.image} alt={selectedItem.name} className="h-44 w-full object-contain [image-rendering:pixelated]" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-purple-300">{selectedItem.type}</p>
              <h2 className="mt-2 text-3xl font-black">{selectedItem.name}</h2>
              <p className="mt-3 text-2xl font-black text-yellow-300">{selectedItem.price}</p>
              <p className="mt-4 text-sm leading-6 text-gray-300">{selectedItem.description}</p>
            </div>

            <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-5 text-sm text-green-200">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck className="h-5 w-5" />
                Manual Verification
              </div>
              <p className="mt-2 text-green-100/80">
                Pay using the QR, upload your receipt, then staff will verify and deliver your item.
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
                  className={`rounded-2xl border px-4 py-3 font-black transition ${method.id === item.id ? "border-purple-300 bg-purple-500/20 text-white" : "border-purple-500/20 bg-black/25 text-gray-300 hover:bg-white/10"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-black via-purple-950/30 to-black p-5">
              <div className={`mb-4 h-1 rounded-full bg-gradient-to-r ${method.color}`} />

              <img
                src={method.qr}
                alt={`${method.label} QR code`}
                className="mx-auto max-h-[360px] w-full max-w-[360px] rounded-2xl border border-purple-400/20 bg-black/40 object-contain p-2 shadow-[0_0_35px_rgba(168,85,247,0.25)]"
              />

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
                  <p><span className="text-gray-500">Item:</span> <span className="font-bold text-white">{selectedItem.name}</span></p>
                  <p><span className="text-gray-500">Amount:</span> <span className="font-bold text-yellow-300">{selectedItem.price}</span></p>
                  <p><span className="text-gray-500">Payment:</span> <span className="font-bold text-purple-200">{method.label}</span></p>
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
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFileError("");
                    setStatus("idle");

                    if (file && file.size > 4 * 1024 * 1024) {
                      setReceiptFile(null);
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
              )}              {receiptPreviewUrl && (
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
                      setReceiptFile(null);
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
                  onChange={(e) => setHasConfirmedPayment(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />
                <span>I confirm that I have already sent the payment using the selected QR code.</span>
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
                  Your claim is sent privately to Ellipsis SMP staff. Please keep your receipt until your purchase is verified and delivered.
                </p>
              </div>

              {status === "success" && (
                <div ref={resultRef} className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-green-200">
                  <p className="font-black">Payment claim sent.</p>
                  {orderId && <p className="mt-2">Order ID: <span className="font-black text-white">{orderId}</span></p>}
                  <p className="mt-2 text-sm text-green-100/80">Do you want to make another purchase?</p>

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
                <p ref={resultRef} className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
                  {submitError || "Something went wrong. Please try again."}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-purple-500/30 bg-black/85 p-3 shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
              Checkout
            </p>
            <p className="max-w-[210px] truncate text-sm font-black text-white">
              {selectedItem.name}
            </p>
          </div>

          <p className="text-sm font-black text-yellow-300">
            {selectedItem.price}
          </p>
        </div>
      </div>

    </main>
  );
}

export default CheckoutPage;









