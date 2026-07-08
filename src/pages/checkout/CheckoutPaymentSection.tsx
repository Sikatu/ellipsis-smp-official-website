import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import Button from "../../components/ui/Button";
import { paymentMethods } from "./checkoutData";
import type { CartLine } from "./cartTypes";
import type { MobileCheckoutStep } from "./checkoutTypes";
import CheckoutOnlinePaymentSection from "./CheckoutOnlinePaymentSection";

type PaymentMethod = (typeof paymentMethods)[number];

type CheckoutPaymentSectionProps = {
  mobileStep: MobileCheckoutStep;
  cart: CartLine[];
  subtotalText: string;
  method: PaymentMethod;
  setMethod: Dispatch<SetStateAction<PaymentMethod>>;
  copiedRecipient: boolean;
  setCopiedRecipient: Dispatch<SetStateAction<boolean>>;
  downloadQr: () => void;
  copyRecipientInfo: () => void;
  goToMobileStep: (step: MobileCheckoutStep) => void;
  minecraftIgn: string;
  setMinecraftIgn: (value: string) => void;
  isIgnLocked: boolean;
  linkedMinecraftUuid: string | null;
  discordUsername: string;
  setDiscordUsername: (value: string) => void;
};

function CheckoutPaymentSection({
  mobileStep,
  cart,
  subtotalText,
  method,
  setMethod,
  copiedRecipient,
  setCopiedRecipient,
  downloadQr,
  copyRecipientInfo,
  goToMobileStep,
  minecraftIgn,
  setMinecraftIgn,
  isIgnLocked,
  linkedMinecraftUuid,
  discordUsername,
  setDiscordUsername,
}: CheckoutPaymentSectionProps) {
  return (
    <>
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
                  {subtotalText}
                </p>
              </div>
            </div>

            <div className={mobileStep === "claim" ? "hidden lg:block" : ""}>
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

            {method.id === "PayMongo" && (
              <CheckoutOnlinePaymentSection
                cart={cart}
                subtotalText={subtotalText}
                minecraftIgn={minecraftIgn}
                setMinecraftIgn={setMinecraftIgn}
                isIgnLocked={isIgnLocked}
                linkedMinecraftUuid={linkedMinecraftUuid}
                discordUsername={discordUsername}
                setDiscordUsername={setDiscordUsername}
              />
            )}

            {method.id !== "PayMongo" && (
            <>
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
                    loading="lazy"
                    decoding="async"
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

            <Button
              onClick={() => goToMobileStep("claim")}
              size="lg"
              fullWidth
              className="mt-5 lg:hidden"
            >
              Continue to Submit Proof
              <ArrowRight className="h-4 w-4" />
            </Button>
            </>
            )}
            </div>

    </>
  );
}

export default CheckoutPaymentSection;
