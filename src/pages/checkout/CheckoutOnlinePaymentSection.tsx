import { useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

type CheckoutOnlinePaymentSectionProps = {
  selectedProduct: {
    name: string;
    type: string;
    price: string;
  };
  productId: string;
  quantity: string | null;
};

function CheckoutOnlinePaymentSection({
  selectedProduct,
  productId,
  quantity,
}: CheckoutOnlinePaymentSectionProps) {
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canPay = Boolean(minecraftIgn.trim() && discordUsername.trim()) && !isSubmitting;

  async function handlePayOnline() {
    if (!canPay) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/paymongo-create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minecraftUsername: minecraftIgn.trim(),
          discordUsername: discordUsername.trim(),
          productId,
          productName: selectedProduct.name,
          productCategory: selectedProduct.type,
          productPrice: selectedProduct.price,
          quantity,
          siteUrl: window.location.origin,
        }),
      });

      const body = await response.json();

      if (!response.ok || !body.checkoutUrl) {
        throw new Error(body.error || "Failed to start online payment.");
      }

      window.location.href = body.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-950/40 via-black to-black">
      <div className="flex items-center gap-3 border-b border-emerald-400/20 bg-white/[0.04] px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
            Instant &amp; Automatic
          </p>
          <p className="mt-0.5 text-lg font-black text-white">
            Pay with QR Ph
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-gray-300">
          Scan the QR Ph code with GCash, Maya, ShopeePay, or your bank app
          (BPI, GoTyme, and most others) -- your order is verified and
          delivered automatically, no receipt upload, no waiting for staff.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
              Minecraft Username
            </label>
            <input
              value={minecraftIgn}
              onChange={(event) => setMinecraftIgn(event.target.value)}
              type="text"
              placeholder="Your in-game name"
              className="w-full rounded-xl border border-emerald-500/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-300/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
              Discord Username
            </label>
            <input
              value={discordUsername}
              onChange={(event) => setDiscordUsername(event.target.value)}
              type="text"
              placeholder="Your Discord username"
              className="w-full rounded-xl border border-emerald-500/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-300/50"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handlePayOnline}
          disabled={!canPay}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-sm font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          <Sparkles className="h-4 w-4" />
          {isSubmitting
            ? "Redirecting to secure checkout..."
            : `Pay ${selectedProduct.price} Online Now`}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          You'll be redirected to PayMongo's secure checkout page to complete payment.
        </p>
      </div>
    </div>
  );
}

export default CheckoutOnlinePaymentSection;
