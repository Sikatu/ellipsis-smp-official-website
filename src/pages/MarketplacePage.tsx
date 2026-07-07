import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import PageShell from "./PageShell";
import Store from "../components/sections/Store";
import PageHero from "../components/ui/PageHero";
import GlassPanel from "../components/ui/GlassPanel";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const trustPoints = [
  { icon: ShieldCheck, label: "Staff Verified" },
  { icon: ReceiptText, label: "Receipt Checkout" },
  { icon: MessageCircle, label: "Discord Support" },
  { icon: PackageCheck, label: "Manual Delivery" },
];

const featuredProducts = [
  {
    name: "OVERCLOCK Rank",
    price: "PHP 399",
    image: "/ranks/overclock.png",
    description: "High-tier rank with expanded commands and daily convenience.",
    href: "/checkout?type=rank&product=OVERCLOCK",
    badge: "Fan Favorite",
  },
  {
    name: "Stellar Vanguard Crate",
    price: "From PHP 69",
    image: "/crates/stellar-vanguard.webp",
    description: "A premium crate pick for players chasing rare rewards.",
    href: "/checkout?type=crate&product=Stellar+Vanguard+Crate&quantity=1+key",
    badge: "Crate Pick",
  },
  {
    name: "Ellipsis Coins",
    price: "PHP 50",
    image: "/furniture/cherry-blossom.webp",
    description: "Furniture currency for builders and decorators.",
    href: "/checkout?type=furniture&product=Ellipsis+Coins",
    badge: "Builder Pick",
  },
  {
    name: "Plushie Keys",
    price: "PHP 50",
    image: "/plushies/nogs-megapack.webp",
    description: "Collectible plushie keys for cosmetic collectors.",
    href: "/checkout?type=plushie&product=Plushie+Keys",
    badge: "Collector Pick",
  },
];

const buyingSteps = [
  {
    icon: ShoppingBag,
    title: "Choose item",
    description: "Pick a rank, crate bundle, furniture coins, or plushie keys.",
  },
  {
    icon: CreditCard,
    title: "Pay exact amount",
    description: "Use the checkout QR method shown for your selected product.",
  },
  {
    icon: ReceiptText,
    title: "Upload receipt",
    description: "Submit your proof of payment with your Minecraft username.",
  },
  {
    icon: BadgeCheck,
    title: "Staff verifies",
    description: "Staff checks the receipt and delivers the purchase manually.",
  },
];

function MarketplacePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Marketplace 3.0"
        title="Shop with clearer picks, faster checkout, and staff-verified delivery."
        description="The Ellipsis SMP marketplace now gives players direct product paths, better purchase guidance, and a cleaner mobile buying experience."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => {
            const Icon = point.icon;

            return (
              <GlassPanel key={point.label} className="px-4 py-3">
                <div className="flex items-center justify-center gap-2 text-center">
                  <Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                  <p className="text-sm font-black text-white">{point.label}</p>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassPanel className="overflow-hidden p-0">
            <div className="flex h-full flex-col bg-gradient-to-br from-purple-950/55 via-black/50 to-yellow-950/20">
              <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden border-b border-yellow-400/20 bg-gradient-to-br from-purple-950/40 via-black/60 to-yellow-950/20 p-8 sm:min-h-[240px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.24),transparent_55%)]" />
                <img
                  src="/ranks/ascendant.png"
                  alt="ASCENDANT rank"
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 max-h-[140px] w-full object-contain drop-shadow-[0_0_45px_rgba(250,204,21,0.45)] [image-rendering:pixelated] sm:max-h-[170px]"
                />
              </div>

              <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
                  Featured Upgrade
                </p>
                <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
                  ASCENDANT
                </h2>
                <p className="mt-3 text-3xl font-black text-yellow-300">
                  PHP 499
                </p>
                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-300 md:text-base">
                  The top premium rank with complete shop access, utility
                  commands, all chat colors, repair perks, healing, and
                  unlimited fly.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {["All shop access", "Unlimited fly", "Top utility perks"].map(
                    (perk) => (
                      <div
                        key={perk}
                        className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-3 text-xs font-black uppercase tracking-[0.1em] text-yellow-100"
                      >
                        {perk}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/checkout?type=rank&product=ASCENDANT"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-center text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.02]"
                  >
                    Buy ASCENDANT
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#store"
                    className="rounded-2xl border border-purple-500/30 bg-white/[0.06] px-6 py-4 text-center text-sm font-black text-purple-100 transition hover:bg-white/[0.1]"
                  >
                    Browse Full Store
                  </a>
                </div>
              </div>
            </div>
          </GlassPanel>

          <div className="grid gap-4 sm:grid-cols-2">
            {featuredProducts.map((product) => (
              <Link key={product.name} to={product.href} className="group block h-full">
                <GlassPanel className="flex h-full flex-col overflow-hidden p-0 transition group-hover:-translate-y-1 group-hover:border-purple-300/50 group-hover:bg-white/[0.08]">
                  <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-purple-500/15 bg-gradient-to-br from-purple-950/40 via-black/45 to-black/20 p-4 sm:h-40">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_65%)]" />
                    <span className="absolute left-3 top-3 z-10 rounded-full border border-purple-400/25 bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-purple-200">
                      {product.badge}
                    </span>
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.3)] [image-rendering:pixelated]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-lg font-black leading-tight text-white">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-black text-yellow-300">
                      {product.price}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-300">
                      {product.description}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-black text-purple-200">
                      Go to checkout
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </p>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-[1.75rem] border border-purple-500/20 bg-black/35 p-5 text-white backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">
                Purchase Flow
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                How buying works
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-300">
              Checkout is receipt-based so staff can verify every purchase
              before delivery.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {buyingSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-2xl border border-purple-500/15 bg-white/[0.045] p-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-black text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider />

      <Store />

      <CallToAction
        eyebrow="Secure Checkout"
        title="Ready to make a purchase?"
        description="Choose your product, pay using the available QR method, upload your receipt, and wait for staff verification."
        primaryLabel="Go to Checkout"
        primaryHref="/checkout"
        secondaryLabel="Join Discord"
        secondaryHref="/discord"
      />
    </PageShell>
  );
}

export default MarketplacePage;
