import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Gift,
  Heart,
  Megaphone,
  ShieldCheck,
  Trophy,
  Users,
  Vote as VoteIcon,
} from "lucide-react";
import PageShell from "./PageShell";
import Vote from "../components/sections/Vote";
import PageHero from "../components/ui/PageHero";
import GlassPanel from "../components/ui/GlassPanel";
import GradientText from "../components/ui/GradientText";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const voteStats = [
  { icon: VoteIcon, label: "Vote Sites", value: "5" },
  { icon: CalendarCheck, label: "Routine", value: "Daily" },
  { icon: Gift, label: "Rewards", value: "In-game" },
  { icon: Users, label: "Impact", value: "Growth" },
];

const voteSteps = [
  {
    icon: VoteIcon,
    title: "Open each vote site",
    description: "Use the official buttons below and vote on every available list.",
  },
  {
    icon: CheckCircle2,
    title: "Enter your username",
    description: "Use the same Minecraft name you use when playing Ellipsis SMP.",
  },
  {
    icon: Gift,
    title: "Claim rewards",
    description: "Voting supports the server and can reward your in-game progress.",
  },
  {
    icon: Bell,
    title: "Repeat daily",
    description: "Daily votes keep Ellipsis visible and help new players find us.",
  },
];

const voteImpact = [
  {
    icon: Trophy,
    title: "Discoverability",
    description:
      "Votes help Ellipsis SMP appear higher on public server lists.",
  },
  {
    icon: Users,
    title: "Community Growth",
    description:
      "More visibility means more active players, more stories, and more server momentum.",
  },
  {
    icon: Heart,
    title: "Free Support",
    description:
      "Voting is one of the easiest ways to support Ellipsis without spending money.",
  },
];

function VotePage() {
  return (
    <PageShell
      seo={{
        title: "Vote for Ellipsis SMP | Minecraft Server Vote Rewards",
        description:
          "Vote daily for Ellipsis SMP on top Minecraft server lists and earn in-game rewards. Help our SMP server climb the rankings.",
        path: "/vote",
      }}
    >
      <PageHero
        eyebrow="Vote 3.0"
        title={
          <>
            Vote daily and help Ellipsis SMP{" "}
            <GradientText tone="gold">climb.</GradientText>
          </>
        }
        description="Every vote improves discoverability, brings new players into the community, and supports the server through a simple daily routine."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {voteStats.map((item) => {
            const Icon = item.icon;

            return (
              <GlassPanel key={item.label} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-yellow-300" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-yellow-200">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-black text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <GlassPanel className="relative overflow-hidden p-6 sm:p-8 md:p-10">
            <div className="absolute right-[-6rem] top-[-6rem] h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
            <p className="relative text-xs font-black uppercase text-yellow-300">
              Daily Momentum
            </p>
            <h2 className="relative mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              A small click with a big server impact.
            </h2>
            <p className="relative mt-5 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
              Vote sites are how new players discover active servers. When the
              community votes consistently, Ellipsis becomes easier to find,
              easier to join, and stronger over time.
            </p>

            <a
              href="#vote"
              className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-purple-600 px-6 py-4 text-sm font-black text-white shadow-[0_0_30px_rgba(250,204,21,0.22)] transition hover:scale-[1.02]"
            >
              Start Voting
              <ArrowRight className="h-4 w-4" />
            </a>
          </GlassPanel>

          <div className="grid gap-4">
            {voteImpact.map((item) => {
              const Icon = item.icon;

              return (
                <GlassPanel
                  key={item.title}
                  className="p-6 transition hover:-translate-y-1 hover:border-yellow-300/40 hover:bg-yellow-400/[0.08]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase text-purple-300">
            Voting Routine
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Make voting simple and repeatable.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-300">
            Vote on each list, use your correct username, then return tomorrow
            and do it again. That rhythm is what helps the server climb.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {voteSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <GlassPanel key={step.title} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-white/10">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {step.description}
                </p>
              </GlassPanel>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <GlassPanel className="p-6">
            <div className="flex items-start gap-4">
              <Megaphone className="mt-1 h-6 w-6 shrink-0 text-yellow-300" />
              <div>
                <h3 className="text-xl font-black text-white">
                  Share voting reminders.
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Invite friends and remind the community when vote resets are
                  available. Server growth works best when it becomes a habit.
                </p>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
              <div>
                <h3 className="text-xl font-black text-white">
                  Use official links only.
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  The vote buttons below are the official Ellipsis SMP vote
                  links. Bookmark this page when you want a clean daily route.
                </p>
              </div>
            </div>
          </GlassPanel>
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
