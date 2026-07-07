import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import type { RefObject } from "react";
import { crates } from "../../data/storeItems";
import { categories, keyQuantities, rankDetails } from "./checkoutData";
import type { Category, KeyQuantity, MobileCheckoutStep } from "./checkoutTypes";

type ProductSummary = {
  name: string;
  type: string;
  price: string;
  image: string;
  description: string;
};

type CategoryBanner = {
  src: string;
  alt: string;
};

type PriceParts = {
  currency: string;
  amount: string;
};

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
  categoryBanner: CategoryBanner;
  productBadge: string;
  selectedProduct: ProductSummary;
  selectedCategory: Category;
  selectedRank: string;
  selectedCrate: string;
  selectedKeyQuantity: KeyQuantity;
  selectedRankDetails: SelectedRankDetails;
  priceParts: PriceParts;
  receiveItems: string[];
  resetPurchase: (category: Category) => void;
  updateRank: (rankName: string) => void;
  updateCrate: (crateName: string) => void;
  updateKeyQuantity: (quantity: KeyQuantity) => void;
  goToMobileStep: (step: MobileCheckoutStep) => void;
};

function CheckoutProductReviewSection({
  productSectionRef,
  mobileStep,
  activeCheckoutStep,
  isOnlinePayment,
  categoryBanner,
  productBadge,
  selectedProduct,
  selectedCategory,
  selectedRank,
  selectedCrate,
  selectedKeyQuantity,
  selectedRankDetails,
  priceParts,
  receiveItems,
  resetPurchase,
  updateRank,
  updateCrate,
  updateKeyQuantity,
  goToMobileStep,
}: CheckoutProductReviewSectionProps) {
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
    ).map(
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
      }
    )}
  </div>

  <div className="mt-6 rounded-3xl border border-purple-500/20 bg-black/35 p-4 lg:hidden">
    <div className="flex gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-purple-500/20 bg-black/45">
        {categoryBanner.src && (
          <img
            src={categoryBanner.src}
            alt={categoryBanner.alt}
            loading="eager"
            decoding="async"
            className="h-full w-full object-contain p-2 [image-rendering:pixelated]"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
          {productBadge}
        </p>
        <h2 className="mt-1 break-words text-xl font-black leading-tight text-white">
          {selectedProduct.name}
        </h2>
        <p className="mt-2 text-2xl font-black text-yellow-300">
          {selectedProduct.price}
        </p>
      </div>
    </div>

    <div className="mt-4 grid gap-2">
      {receiveItems.slice(0, 3).map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 rounded-2xl border border-purple-500/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-gray-200"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          <span>{item}</span>
        </div>
      ))}
    </div>

    <details className="mt-4 rounded-2xl border border-purple-500/20 bg-black/35 p-4">
      <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.16em] text-purple-200">
        Change Purchase
      </summary>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => resetPurchase(category)}
              className={`rounded-2xl border px-3 py-3 text-xs font-black transition ${selectedCategory === category
                  ? "border-purple-300 bg-purple-500/20 text-white"
                  : "border-purple-500/20 bg-black/35 text-gray-300"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {selectedCategory === "Premium Ranks" && (
          <label className="text-xs font-black uppercase tracking-[0.16em] text-purple-300">
            Rank
            <select
              value={selectedRank}
              onChange={(event) => updateRank(event.target.value)}
              className="mt-2 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
            >
              {rankDetails.map((rank) => (
                <option key={rank.name} value={rank.name}>
                  {rank.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {selectedCategory === "Premium Crates" && (
          <div>
            <label className="text-xs font-black uppercase tracking-[0.16em] text-purple-300">
              Crate
              <select
                value={selectedCrate}
                onChange={(event) => updateCrate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
              >
                {crates.map((crate) => (
                  <option key={crate.name} value={crate.name}>
                    {crate.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {keyQuantities.map((quantity) => (
                <button
                  key={quantity}
                  type="button"
                  onClick={() => updateKeyQuantity(quantity)}
                  className={`rounded-xl border px-3 py-3 text-sm font-black transition ${selectedKeyQuantity === quantity
                      ? "border-blue-300 bg-blue-500/20 text-blue-100"
                      : "border-purple-500/25 bg-black/40 text-gray-300"
                    }`}
                >
                  {quantity}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>

    <button
      type="button"
      onClick={() => goToMobileStep("pay")}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.32)]"
    >
      Continue to Payment
      <ArrowRight className="h-4 w-4" />
    </button>
  </div>

  <div className="mt-8 hidden overflow-hidden rounded-3xl border border-purple-500/20 bg-black/35 lg:block">
    <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden border-b border-purple-500/20 bg-gradient-to-br from-black via-purple-950/30 to-black p-4 sm:min-h-[220px] sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.22),transparent_55%)]" />
      {categoryBanner.src && (
        <img
          key={categoryBanner.src}
          src={categoryBanner.src}
          alt={categoryBanner.alt}
          loading="eager"
          decoding="async"
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
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-purple-200">
              <Sparkles className="h-3.5 w-3.5" />
              {productBadge}
            </div>

            <h2
              className={`mt-4 break-words font-black leading-tight ${
                selectedProduct.name.length > 20
                  ? "text-xl sm:text-2xl"
                  : "text-2xl sm:text-4xl"
              }`}
            >
              {selectedProduct.name}
            </h2>
          </div>

          <div className="w-full rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-5 py-4 text-left shadow-[0_0_25px_rgba(250,204,21,0.12)] sm:w-auto sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-100/80">
              {priceParts.currency}
            </p>
            <p className="text-2xl font-black leading-none text-yellow-300 sm:text-4xl">
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

  <div
    className={`mt-6 hidden rounded-3xl border p-4 text-sm sm:p-5 lg:block ${isOnlinePayment
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        : "border-green-400/20 bg-green-400/10 text-green-200"
      }`}
  >
    <div className="flex items-center gap-2 font-black">
      <ShieldCheck className="h-5 w-5" />
      {isOnlinePayment ? "Instant Verification" : "Manual Verification"}
    </div>

    <p className={`mt-2 ${isOnlinePayment ? "text-emerald-100/80" : "text-green-100/80"}`}>
      {isOnlinePayment
        ? "Pay online and your order is verified and delivered automatically -- no receipt upload needed."
        : "Pay using the QR, upload your receipt, then staff will verify and deliver your item."}
    </p>
  </div>
</section>

  );
}

export default CheckoutProductReviewSection;
