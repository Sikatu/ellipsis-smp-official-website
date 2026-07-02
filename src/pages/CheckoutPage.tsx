import { ArrowLeft, Copy, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

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

function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const product = searchParams.get("product") || "Ellipsis SMP Item";
  const price = searchParams.get("price") || "Price not set";

  const [method, setMethod] = useState(paymentMethods[0]);
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const canSubmit = useMemo(() => {
    return minecraftIgn && discordUsername && referenceNumber;
  }, [minecraftIgn, discordUsername, referenceNumber]);

  async function submitClaim() {
    if (!canSubmit) return;

    setStatus("sending");

    try {
      const response = await fetch("/api/payment-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product,
          price,
          method: method.label,
          minecraftIgn,
          discordUsername,
          referenceNumber,
          proofLink,
        }),
      });

      if (!response.ok) throw new Error("Failed");

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

            <div className="mt-8 rounded-3xl border border-purple-500/20 bg-black/35 p-5">
              <p className="text-sm text-gray-400">Selected Product</p>
              <h2 className="mt-1 text-3xl font-black">{product}</h2>
              <p className="mt-3 text-2xl font-black text-yellow-300">{price}</p>
            </div>

            <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-5 text-sm text-green-200">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck className="h-5 w-5" />
                Manual Verification
              </div>
              <p className="mt-2 text-green-100/80">
                After payment, submit your claim. Staff will verify your reference number and deliver your item.
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
                  className={`rounded-2xl border px-4 py-3 font-black transition ${
                    method.id === item.id
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

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(product)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 px-4 py-3 font-bold text-purple-200 hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
                Copy Product Name
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <input
                value={minecraftIgn}
                onChange={(e) => setMinecraftIgn(e.target.value)}
                placeholder="Minecraft IGN"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <input
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="Discord username"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Payment reference number"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <input
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                placeholder="Proof screenshot link optional"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <button
                type="button"
                disabled={!canSubmit || status === "sending"}
                onClick={submitClaim}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" ? "Submitting..." : "Submit Payment Claim"}
              </button>

              {status === "success" && (
                <p className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-green-200">
                  Payment claim sent. Staff will verify it soon.
                </p>
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