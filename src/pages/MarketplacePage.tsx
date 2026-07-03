import PageShell from "./PageShell";
import Store from "../components/sections/Store";
import PageHero from "../components/ui/PageHero";
import GlassPanel from "../components/ui/GlassPanel";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const trustPoints = [
  "Manual staff verification",
  "Receipt-based checkout",
  "Secure Discord workflow",
  "Delivered after confirmation",
];

function MarketplacePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Premium Store"
        title="Support the server. Upgrade your journey."
        description="The Ellipsis SMP marketplace is built around trust, clarity, existing server content, and staff-verified delivery."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <GlassPanel key={point} className="px-4 py-3 text-center">
              <p className="text-sm font-black text-white">{point}</p>
            </GlassPanel>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel className="overflow-hidden p-0">
            <div className="flex min-h-full flex-col justify-between bg-gradient-to-br from-purple-950/50 via-black/50 to-yellow-950/20 p-8 md:p-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">
                  Featured Upgrade
                </p>
                <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
                  ASCENDANT
                </h2>
                <p className="mt-3 text-3xl font-black text-yellow-300">
                  PHP 499
                </p>
                <p className="mt-5 max-w-xl text-sm leading-7 text-gray-300 md:text-base">
                  The top premium rank with the strongest perks, complete shop
                  access, utility commands, chat colors, and unlimited fly.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/checkout"
                  className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-center text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.02]"
                >
                  Make Payment
                </a>
                <a
                  href="#store"
                  className="rounded-2xl border border-purple-500/30 bg-white/[0.06] px-6 py-4 text-center text-sm font-black text-purple-100 transition hover:bg-white/[0.1]"
                >
                  Browse Store
                </a>
              </div>
            </div>
          </GlassPanel>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["5", "Premium Ranks"],
              ["4", "Premium Crates"],
              ["3", "Payment Methods"],
              ["Staff", "Manual Verification"],
            ].map(([value, label]) => (
              <GlassPanel
                key={label}
                className="flex min-h-[120px] items-end p-6"
              >
                <div>
                  <p className="text-3xl font-black text-yellow-300">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-white">
                    {label}
                  </p>
                </div>
              </GlassPanel>
            ))}
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