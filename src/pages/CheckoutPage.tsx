import { ArrowLeft, Copy, Download, ShieldCheck, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const paymentMethods = [
  { id: "GCash", label: "GCash", qr: "/payment/payment-gcash-qr.jpg", color: "from-blue-500 to-cyan-400" },
  { id: "GoTyme", label: "GoTyme", qr: "/payment/payment-gotyme-qr.jpg", color: "from-green-400 to-emerald-500" },
  { id: "BPI", label: "BPI", qr: "/payment/payment-bpi-qr.png", color: "from-red-500 to-orange-400" },
];

type VerifyMode = "reference" | "receipt";

function CheckoutPage() {
  const [searchParams] = useSearchParams();

  const product = searchParams.get("product") || "Ellipsis SMP Item";
  const price = searchParams.get("price") || "Price not set";
  const image = searchParams.get("image") || "/ellipsis-logo-640.webp";
  const type = searchParams.get("type") || "Marketplace Item";

  const [method, setMethod] = useState(paymentMethods[0]);
  const [verifyMode, setVerifyMode] = useState<VerifyMode>("reference");
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [fileError, setFileError] = useState("");

  const canSubmit = useMemo(() => {
    const basic = minecraftIgn.trim() && discordUsername.trim();

    if (verifyMode === "reference") {
      return basic && referenceNumber.trim() && hasConfirmedPayment;
    }

    return basic && receiptFile && hasConfirmedPayment;
  }, [minecraftIgn, discordUsername, referenceNumber, receiptFile, verifyMode, hasConfirmedPayment]);

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
        const result = String(reader.result);
        resolve(result.split(",")[1]);
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitClaim() {
    if (!canSubmit) return;

    setStatus("sending");
    setOrderId("");

    try {
      let receiptBase64 = "";
      let receiptFileName = "";
      let receiptMimeType = "";

      if (receiptFile) {
        receiptBase64 = await fileToBase64(receiptFile);
        receiptFileName = receiptFile.name;
        receiptMimeType = receiptFile.type;
      }

      const response = await fetch("/api/payment-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          price,
          method: method.label,
          minecraftIgn,
          discordUsername,
          referenceNumber: verifyMode === "reference" ? referenceNumber : "",
          receiptBase64,
          receiptFileName,
          receiptMimeType,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setOrderId(data.orderId || "");
      setStatus("success");
    } catch {
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

            <div className="mt-6 grid gap-3 text-xs font-black uppercase tracking-[0.16em] text-gray-300 sm:grid-cols-4">
              {["Select Payment", "Pay QR", "Submit Claim", "Verification"].map(
                (step, index) => (
                  <div
                    key={step}
                    className={`rounded-2xl border px-3 py-3 text-center ${index === 3
                      ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                      : "border-purple-500/25 bg-black/30 text-purple-200"
                      }`}
                  >
                    {index + 1}. {step}
                  </div>
                )
              )}
            </div>

            <div className="mt-6 grid gap-3 text-xs font-black uppercase tracking-[0.16em] text-gray-300 sm:grid-cols-4">
              {["Select Payment", "Pay QR", "Submit Claim", "Verification"].map(
                (step, index) => (
                  <div
                    key={step}
                    className={`rounded-2xl border px-3 py-3 text-center ${index === 3
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
              <div className="mb-6 flex justify-center rounded-3xl border border-purple-500/20 bg-black/35 p-5">
                <img
                  src={image}
                  alt={product}
                  className="h-44 w-full object-contain [image-rendering:pixelated]"
                />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                {type}
              </p>

              <p className="mt-4 text-sm text-gray-400">Selected Product</p>
              <h2 className="mt-1 text-3xl font-black">{product}</h2>
              <p className="mt-3 text-2xl font-black text-yellow-300">{price}</p>
            </div>

            <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-5 text-sm text-green-200">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck className="h-5 w-5" />
                Manual Verification
              </div>

              <p className="mt-2 text-green-100/80">
                Pay using the QR, then submit your claim. Staff will verify and deliver your item.
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

            <div className="mt-6 rounded-3xl border border-purple-500/20 bg-black/35 p-5">
              <div className={`mb-4 h-1 rounded-full bg-gradient-to-r ${method.color}`} />

              <img
                src={method.qr}
                alt={`${method.label} QR code`}
                className="mx-auto max-h-[360px] w-full max-w-[360px] rounded-2xl bg-white object-contain p-3"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={downloadQr}
                  className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 px-4 py-3 font-bold text-purple-200 hover:bg-white/10"
                >
                  <Download className="h-4 w-4" />
                  Save QR
                </button>

                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(product)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 px-4 py-3 font-bold text-purple-200 hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                  Copy Product
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setVerifyMode("reference")}
                  className={`rounded-xl border px-4 py-3 font-black ${verifyMode === "reference"
                    ? "border-blue-300 bg-blue-500/20 text-blue-100"
                    : "border-purple-500/25 bg-black/40 text-gray-300"
                    }`}
                >
                  Reference Number
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyMode("receipt")}
                  className={`rounded-xl border px-4 py-3 font-black ${verifyMode === "receipt"
                    ? "border-green-300 bg-green-500/20 text-green-100"
                    : "border-purple-500/25 bg-black/40 text-gray-300"
                    }`}
                >
                  Upload Receipt
                </button>
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

              {verifyMode === "reference" ? (
                <input
                  value={referenceNumber}
                  onChange={(e) => {
                    setReferenceNumber(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="Payment reference number"
                  className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
                />
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-purple-500/25 bg-black/40 px-4 py-5 font-bold text-purple-200 hover:bg-white/10">
                  <Upload className="h-5 w-5" />
                  {receiptFile ? receiptFile.name : "Upload receipt image"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFileError("");

                      if (file && file.size > 4 * 1024 * 1024) {
                        setReceiptFile(null);
                        setFileError("Receipt image must be under 4MB.");
                        return;
                      }

                      setReceiptFile(file);
                    }}
                  />
                </label>
              )}              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm text-yellow-100">
                <input
                  type="checkbox"
                  checked={hasConfirmedPayment}
                  onChange={(e) => setHasConfirmedPayment(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />
                <span>
                  I confirm that I have already sent the payment using the selected QR code.
                </span>
              </label>


              {fileError && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                  {fileError}
                </p>
              )}

              <button
                type="button"
                disabled={!canSubmit || status === "sending"}
                onClick={submitClaim}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" ? "Submitting..." : "Submit Payment Claim"}
              </button>

              <div className="rounded-2xl border border-purple-500/20 bg-black/30 p-4 text-sm text-gray-300">
                <p className="font-black text-purple-200">What happens next?</p>
                <p className="mt-2">
                  Your claim is sent privately to Ellipsis SMP staff. Please keep your receipt
                  or reference number until your purchase is verified and delivered.
                </p>
              </div>

              {status === "success" && (
                <div className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-green-200">
                  <p className="font-black">Payment claim sent.</p>

                  {orderId && (
                    <p className="mt-2">
                      Order ID:{" "}
                      <span className="font-black text-white">{orderId}</span>
                    </p>
                  )}                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `Order ID: ${orderId}\nProduct: ${product}\nPrice: ${price}\nPayment Method: ${method.label}\nMinecraft IGN: ${minecraftIgn}\nDiscord: ${discordUsername}`
                      )
                    }
                    className="mt-3 rounded-lg border border-green-400/30 px-3 py-2 text-sm font-bold text-green-100 hover:bg-green-400/10"
                  >
                    Copy Order Details
                  </button>


                  <p className="mt-2 text-sm text-green-100/80">
                    Please wait for staff verification.
                  </p>
                  <Link
                    to="/"
                    className="mt-3 inline-block rounded-lg border border-purple-400/30 px-3 py-2 text-sm font-bold text-purple-100 hover:bg-purple-400/10"
                  >
                    Back to Marketplace
                  </Link>
                </div>
              )}

              {status === "error" && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;




