import PageShell from "./PageShell";
import About from "../components/sections/About";
import RankProgression from "../components/sections/RankProgression";
import RulesFAQ from "../components/sections/RulesFAQ";
import Features from "../components/sections/Features";
import StaffRanks from "../components/sections/StaffRanks";
import PageHero from "../components/ui/PageHero";
import GlassPanel from "../components/ui/GlassPanel";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const identityCards = [
  ["Adventure", "A survival world designed around exploration, progression, and memorable player moments."],
  ["Community", "A place where players build, trade, compete, collaborate, and belong."],
  ["Progression", "Ranks, systems, features, and long-term goals give players reasons to keep coming back."],
  ["Support", "Staff help protect the experience and guide the community forward."],
];

const ruleGroups = [
  ["Respect", "A premium community starts with how players treat each other."],
  ["Fair Play", "Rules protect progression, economy, survival gameplay, and server balance."],
  ["Trust", "Clear expectations help staff support players and keep the world enjoyable."],
];

const staffValues = [
  ["Guidance", "Helping new and returning players understand the server."],
  ["Protection", "Keeping the community fair, safe, and enjoyable."],
  ["Growth", "Supporting events, systems, updates, and the long-term future of Ellipsis."],
];

function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Our Story"
        title="Ellipsis SMP is built to feel like a world worth joining."
        description="More than a survival server, Ellipsis is shaped by community, progression, staff support, rules, features, creativity, and the feeling of belonging to something active."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassPanel className="relative overflow-hidden p-8 md:p-10">
            <div className="absolute right-[-6rem] top-[-6rem] h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
            <p className="relative text-xs font-black uppercase tracking-[0.28em] text-purple-300">
              The Ellipsis Identity
            </p>
            <h2 className="relative mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              Survival with atmosphere, purpose, and people.
            </h2>
            <p className="relative mt-5 text-sm leading-7 text-gray-300 md:text-base">
              Ellipsis SMP is designed to feel intentional: from gameplay and
              progression to support, rules, community systems, and the staff
              team helping the server grow.
            </p>
          </GlassPanel>

          <div className="grid gap-4 sm:grid-cols-2">
            {identityCards.map(([title, description]) => (
              <GlassPanel
                key={title}
                className="p-6 transition hover:-translate-y-1 hover:border-purple-300/40 hover:bg-white/[0.08]"
              >
                <p className="text-xl font-black text-white">{title}</p>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {description}
                </p>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <About />

      <SectionDivider />

      <RankProgression />

      <SectionDivider />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {ruleGroups.map(([title, description]) => (
            <GlassPanel key={title} className="p-6">
              <p className="text-2xl font-black text-white">{title}</p>
              <p className="mt-3 text-sm leading-6 text-gray-300">
                {description}
              </p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <RulesFAQ />

      <SectionDivider />

      <Features />

      <SectionDivider />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
            Staff Recognition
          </p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            The team behind the world.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {staffValues.map(([title, description]) => (
            <GlassPanel
              key={title}
              className="p-6 transition hover:-translate-y-1 hover:border-blue-300/40 hover:bg-blue-400/[0.08]"
            >
              <p className="text-2xl font-black text-white">{title}</p>
              <p className="mt-3 text-sm leading-6 text-gray-300">
                {description}
              </p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <StaffRanks />

      <CallToAction
        eyebrow="Join the Journey"
        title="Ellipsis SMP is ready for your story."
        description="Meet the community, learn the systems, respect the world, and become part of the server's future."
        primaryLabel="Join Discord"
        primaryHref="/discord"
        secondaryLabel="Visit Marketplace"
        secondaryHref="/marketplace"
      />
    </PageShell>
  );
}

export default AboutPage;