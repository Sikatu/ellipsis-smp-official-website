import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import type { RefObject } from "react";
import type { Category, MobileCheckoutStep, Status } from "./checkoutTypes";

type SelectedProduct = {
  name: string;
  type: string;
  price: string;
};

type PaymentMethod = {
  label: string;
};

type CheckoutClaimSectionProps = {
  claimSectionRef: RefObject<HTMLDivElement | null>;
  resultRef: RefObject<HTMLDivElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  mobileStep: MobileCheckoutStep;
  selectedProduct: SelectedProduct;
  method: PaymentMethod;
  minecraftIgn: string;
  setMinecraftIgn: (value: string) => void;
  isIgnLocked: boolean;
  discordUsername: string;
  setDiscordUsername: (value: string) => void;
  receiptFile: File | null;
  receiptPreviewUrl: string;
  fileError: string;
  hasConfirmedPayment: boolean;
  setHasConfirmedPayment: (value: boolean) => void;
  status: Status;
  setStatus: (value: Status) => void;
  submitError: string;
  orderId: string;
  copiedOrderId: boolean;
  copyOrderId: () => void;
  isDraggingReceipt: boolean;
  setIsDraggingReceipt: (value: boolean) => void;
  setIsReceiptZoomOpen: (value: boolean) => void;
  processReceiptFile: (file: File | null) => void;
  clearReceiptUpload: () => void;
  canSubmit: boolean;
  submitLabel: string;
  submitClaim: () => void;
  resetPurchase: (category: Category) => void;
};

function CheckoutClaimSection({
  claimSectionRef,
  resultRef,
  fileInputRef,
  mobileStep,
  selectedProduct,
  method,
  minecraftIgn,
  setMinecraftIgn,
  isIgnLocked,
  discordUsername,
  setDiscordUsername,
  receiptFile,
  receiptPreviewUrl,
  fileError,
  hasConfirmedPayment,
  setHasConfirmedPayment,
  status,
  setStatus,
  submitError,
  orderId,
  copiedOrderId,
  copyOrderId,
  isDraggingReceipt,
  setIsDraggingReceipt,
  setIsReceiptZoomOpen,
  processReceiptFile,
  clearReceiptUpload,
  canSubmit,
  submitLabel,
  submitClaim,
  resetPurchase,
}: CheckoutClaimSectionProps) {
  return (
<div
              ref={claimSectionRef}
              className={`mt-6 gap-3 sm:gap-4 ${mobileStep === "claim" ? "grid" : "hidden lg:grid"}`}
            >
              <div className="rounded-3xl border border-purple-500/20 bg-black/45 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                      Order Review
                    </p>
                    <p className="mt-2 break-words text-lg font-black text-white">
                      {selectedProduct.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {selectedProduct.type}
                    </p>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
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
                <div className="relative">
                  <input
                    value={minecraftIgn}
                    onChange={(e) => {
                      if (isIgnLocked) return;
                      setMinecraftIgn(e.target.value);
                      setStatus("idle");
                    }}
                    readOnly={isIgnLocked}
                    aria-label="Minecraft IGN"
                    autoComplete="nickname"
                    placeholder="Minecraft IGN"
                    className={`w-full rounded-2xl border px-4 py-3 font-semibold outline-none transition placeholder:text-gray-600 ${
                      isIgnLocked
                        ? "cursor-not-allowed border-emerald-400/30 bg-emerald-400/10 pr-10 text-emerald-100"
                        : "border-purple-500/25 bg-black/40 focus:border-purple-300 focus:bg-black/60"
                    }`}
                  />
                  {isIgnLocked && (
                    <ShieldCheck className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
                  )}
                </div>

                <input
                  value={discordUsername}
                  onChange={(e) => {
                    setDiscordUsername(e.target.value);
                    setStatus("idle");
                  }}
                  aria-label="Discord username"
                  autoComplete="username"
                  placeholder="Discord username"
                  className="rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 font-semibold outline-none transition placeholder:text-gray-600 focus:border-purple-300 focus:bg-black/60"
                />
              </div>

              {isIgnLocked && (
                <p className="-mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-300/80">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Minecraft IGN is locked to your verified linked account.
                </p>
              )}

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
                      decoding="async"
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
  );
}

export default CheckoutClaimSection;
