import PageShell from "./PageShell";
import Vote from "../components/sections/Vote";
import PageHero from "../components/ui/PageHero";
import GlassPanel from "../components/ui/GlassPanel";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const voteImpact = [
  ["Discoverability", "Votes help new players find Ellipsis SMP."],
  ["Community Growth", "More visibility means more activity and more adventures."],
  ["Free Support", "Voting supports the server without spending money."],
];

function VotePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Make Ellipsis #1"
        title="Voting is how the community helps Ellipsis rise."
        description="Every vote pushes Ellipsis SMP higher across existing server lists and helps new players discover the world we are building together."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="relative overflow-hidden p-8 md:p-10">
            <div className="absolute right-[-6rem] top-[-6rem] h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
            <p className="relative text-xs font-black uppercase tracking-[0.28em] text-yellow-300">
              Vote Momentum
            </p>
            <h2 className="relative mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              A small click with a big impact.
            </h2>
            <p className="relative mt-5 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
              Voting keeps Ellipsis visible, active, and growing. It is one of
              the easiest ways to support the server and help the community
              reach more players.
            </p>
          </GlassPanel>

          <div className="grid gap-4">
            {voteImpact.map(([title, description]) => (
              <GlassPanel
                key={title}
                className="p-6 transition hover:-translate-y-1 hover:border-yellow-300/40 hover:bg-yellow-400/[0.08]"
              >
                <p className="text-xl font-black text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  {description}
                </p>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <Vote />

      <CallToAction
        eyebrow="Community Powered"
        title="Your vote helps Ellipsis become easier to discover."
        description="Vote today, invite friends, and help bring more players into the Ellipsis SMP world."
        primaryLabel="Join Discord"
        primaryHref="/discord"
        secondaryLabel="Visit Marketplace"
        secondaryHref="/marketplace"
      />
    </PageShell>
  );
}

export default VotePage;