import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";
import type { RefObject } from "react";
import Button from "../../components/ui/Button";
import { crates } from "../../data/storeItems";
import { categories, keyQuantities, rankDetails } from "./checkoutData";
import type { CartLine } from "./cartTypes";
import { formatPhp } from "./cartTypes";
import type { Category, KeyQuantity, MobileCheckoutStep } from "./checkoutTypes";

type SelectedRankDetails = {
  name: string;
  price: string;
  description: string;
  includes: string[];
};

type CheckoutProductReviewSectionProps = {
  productSectionRef: RefObject<HTMLElement | null>;
  mobileStep: MobileCheckoutStep;
  activeCheckoutStep: number;
  isOnlinePayment: boolean;
  cart: CartLine[];
  subtotalText: string;
  isPickerOpen: boolean;
  pickerCategory: Category;
  pickerRank: string;
  pickerCrate: string;
  pickerKeyQuantity: KeyQuantity;
  pickerRankDetails: SelectedRankDetails;
  openPicker: (category: Category) => void;
  closePicker: () => void;
  addFromPicker: () => void;
  removeLine: (lineId: string) => void;
  incrementLine: (lineId: string) => void;
  decrementLine: (lineId: string) => void;
  updatePickerRank: (rankName: string) => void;
  updatePickerCrate: (crateName: string) => void;
  updatePickerKeyQuantity: (quantity: KeyQuantity) => void;
  goToMobileStep: (step: MobileCheckoutStep) => void;
};

const categoryChipLabels: Record<Category, string> = {
  "Premium Ranks": "+ Rank",
  "Premium Crates": "+ Crate",
  Furnitures: "+ Furniture",
  Plushies: "+ Plushie",
};

function CheckoutProductReviewSection({
  productSectionRef,
  mobileStep,
  activeCheckoutStep,
  isOnlinePayment,
  cart,
  subtotalText,
  isPickerOpen,
  pickerCategory,
  pickerRank,
  pickerCrate,
  pickerKeyQuantity,
  pickerRankDetails,
  openPicker,
  closePicker,
  addFromPicker,
  removeLine,
  incrementLine,
  decrementLine,
  updatePickerRank,
  updatePickerCrate,
  updatePickerKeyQuantity,
  goToMobileStep,
}: CheckoutProductReviewSectionProps) {
  const pickerCrateAsset =
    crates.find((crate) => crate.name === pickerCrate) || crates[0];

  return (
    <section
      ref={productSectionRef}
      className={`rounded-[1.75rem] border border-purple-500/25 bg-white/[0.06] p-4 shadow-[0_0_60px_rgba(168,85,247,0.18)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6 ${mobileStep !== "review" ? "hidden lg:block" : ""}`}
    >
      <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-300">
        Ellipsis SMP
      </p>

      <h1 className="mt-3 text-3xl font-black sm:text-4xl">Secure Checkout</h1>

      <div
        className={`mt-6 grid grid-cols-2 gap-2 text-[8px] font-black uppercase tracking-[0.08em] text-gray-300 sm:gap-3 sm:text-[10px] sm:tracking-[0.1em] ${isOnlinePayment ? "sm:grid-cols-2" : "sm:grid-cols-4"}`}
      >
        {(isOnlinePayment
          ? ["Select Product", "Pay Online"]
          : ["Select Product", "Pay QR", "Submit Claim", "Verification"]
        ).map((step, index) => {
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
              <span className="relative z-10 flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                {isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span>{index + 1}.</span>
                )}
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
          Your Cart
        </p>
        <span className="text-xs font-bold text-gray-500">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-purple-500/25 bg-black/25 p-6 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-purple-400/60" />
          <p className="mt-3 font-black text-white">Your cart is empty.</p>
          <p className="mt-1 text-sm text-gray-400">
            Add a rank, crate, furniture pack, or plushie key bundle below to
            get started.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {cart.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-3 rounded-2xl border border-purple-500/15 bg-black/30 p-3"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-purple-500/20 bg-black/45">
                {line.image && (
                  <img
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-1.5 [image-rendering:pixelated]"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-white">{line.name}</p>
                <span className="mt-1 inline-block rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-purple-200">
                  {line.badgeLabel}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => decrementLine(line.id)}
                  aria-label={`Decrease ${line.name} quantity`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-black/35 text-white transition hover:bg-white/10"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-black">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => incrementLine(line.id)}
                  aria-label={`Increase ${line.name} quantity`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-black/35 text-white transition hover:bg-white/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="w-20 shrink-0 text-right text-sm font-black text-yellow-300">
                {formatPhp(line.unitPricePhp * line.quantity)}
              </span>

              <button
                type="button"
                onClick={() => removeLine(line.id)}
                aria-label={`Remove ${line.name} from cart`}
                className="shrink-0 text-gray-500 transition hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mb-2 mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
        Add more
      </p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => openPicker(category)}
            className={`rounded-xl border px-3 py-2 text-xs font-black transition ${pickerCategory === category && isPickerOpen
                ? "border-purple-300 bg-purple-500/20 text-white"
                : "border-white/15 bg-black/30 text-gray-300 hover:bg-white/10"
              }`}
          >
            {categoryChipLabels[category]}
          </button>
        ))}
      </div>

      {isPickerOpen && (
        <div className="mt-4 rounded-3xl border border-purple-500/20 bg-black/35 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-200">
              Choose {pickerCategory}
            </p>
            <button
              type="button"
              onClick={closePicker}
              aria-label="Close product picker"
              className="text-gray-500 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {pickerCategory === "Premium Ranks" && (
            <div className="mt-4">
              <select
                value={pickerRank}
                onChange={(event) => updatePickerRank(event.target.value)}
                className="w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
              >
                {rankDetails.map((rank) => (
                  <option key={rank.name} value={rank.name}>
                    {rank.name} - {rank.price}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                {pickerRankDetails.description}
              </p>
            </div>
          )}

          {pickerCategory === "Premium Crates" && pickerCrateAsset && (
            <div className="mt-4">
              <select
                value={pickerCrate}
                onChange={(event) => updatePickerCrate(event.target.value)}
                className="w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
              >
                {crates.map((crate) => (
                  <option key={crate.name} value={crate.name}>
                    {crate.name}
                  </option>
                ))}
              </select>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {keyQuantities.map((quantity) => (
                  <button
                    key={quantity}
                    type="button"
                    onClick={() => updatePickerKeyQuantity(quantity)}
                    className={`rounded-xl border px-3 py-3 text-sm font-black transition ${pickerKeyQuantity === quantity
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

          {pickerCategory === "Furnitures" && (
            <p className="mt-4 text-sm leading-6 text-gray-400">
              PHP 50 = 10 Ellipsis Coins. Use Ellipsis Coins in-game at
              /warp trades to choose the furniture you want.
            </p>
          )}

          {pickerCategory === "Plushies" && (
            <p className="mt-4 text-sm leading-6 text-gray-400">
              PHP 50 = 5 Plushie Keys. Use Plushie Keys in-game to unlock
              adorable plushies.
            </p>
          )}

          <Button onClick={addFromPicker} fullWidth className="mt-4">
            Add to Cart
          </Button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-dashed border-white/15 pt-4">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
          Subtotal
        </span>
        <span className="text-2xl font-black text-yellow-300">
          {subtotalText}
        </span>
      </div>

      <Button
        onClick={() => goToMobileStep("pay")}
        disabled={cart.length === 0}
        size="lg"
        fullWidth
        className="mt-4 lg:hidden"
      >
        Continue to Payment
        <ArrowRight className="h-4 w-4" />
      </Button>
    </section>
  );
}

export default CheckoutProductReviewSection;
