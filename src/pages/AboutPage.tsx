import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Box,
  Copy,
  Crown,
  Gem,
  MessageCircle,
  Pickaxe,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Swords,
  Users,
  Vote,
} from "lucide-react";
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

const serverAddress = "ellipsismc.com:19213";

const guideStats = [
  { icon: Swords, label: "Crossplay", value: "Java + Bedrock" },
  { icon: ShieldCheck, label: "Server Type", value: "Survival SMP" },
  { icon: Crown, label: "Progression", value: "Ranks + Skills" },
  { icon: Users, label: "Community", value: "Discord Support" },
];

const quickStartSteps = [
  {
    icon: Copy,
    title: "Copy the address",
    description: "Use the official server address when adding Ellipsis SMP.",
  },
  {
    icon: Swords,
    title: "Join spawn",
    description: "Start at the official hub and learn the server layout.",
  },
  {
    icon: MessageCircle,
    title: "Join Discord",
    description: "Get support, tickets, updates, announcements, and events.",
  },
  {
    icon: Vote,
    title: "Vote daily",
    description: "Support server growth and collect useful rewards.",
  },
];

const playerPaths = [
  {
    icon: Pickaxe,
    title: "Survival Player",
    description:
      "Explore, gather, build, progress skills, and settle into the world.",
    href: "#gameplay",
    action: "View systems",
  },
  {
    icon: Box,
    title: "Builder",
    description:
      "Use furniture, coins, trades, biomes, and themed packs to make bases feel alive.",
    href: "/marketplace",
    action: "Browse furniture",
  },
  {
    icon: Gem,
    title: "Collector",
    description:
      "Chase crate keys, plushies, cosmetics, and special rewards across the server.",
    href: "/marketplace",
    action: "See collectibles",
  },
  {
    icon: Crown,
    title: "Supporter",
    description:
      "Upgrade with premium ranks and support the long-term future of Ellipsis SMP.",
    href: "/marketplace",
    action: "View ranks",
  },
];

const systemHighlights = [
  {
    icon: Sparkles,
    title: "Custom End",
    description:
      "A Stellarity-powered endgame with expanded terrain, biomes, structures, and rewards.",
    image: "/gameplay/custom-end.webp",
  },
  {
    icon: Pickaxe,
    title: "Pyro Skills",
    description:
      "Mining and fishing progression gives players more goals beyond normal survival.",
    image: "/gameplay/pyro-mining.webp",
  },
  {
    icon: ShoppingBag,
    title: "Official Marketplace",
    description:
      "Ranks, crates, plushie keys, furniture coins, and staff-verified checkout.",
    image: "/images/showcase/market.webp",
  },
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
  const [copied, setCopied] = useState(false);

  function copyServerAddress() {
    void navigator.clipboard.writeText(serverAddress).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Player Guide 3.0"
        title={
          <>
            The official guide to joining and understanding{" "}
            <span className="bg-gradient-to-r from-yellow-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
              Ellipsis SMP
            </span>
            .
          </>
        }
        description="Learn how to start, what systems matter, where to get help, and how to become part of the server's long-term community."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {guideStats.map((item) => {
            const Icon = item.icon;

            return (
              <GlassPanel key={item.label} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-purple-200" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-purple-300">
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
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <GlassPanel className="relative overflow-hidden p-0">
            <div className="relative min-h-[440px]">
              <img
                src="/gameplay/spawn.webp"
                alt="Ellipsis SMP spawn"
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-xs font-black uppercase text-purple-200">
                  First Stop
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  Spawn is where the guide begins.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                  New players should start here, learn the server flow, connect
                  with Discord, and choose their first path into survival.
                </p>
              </div>
            </div>
          </GlassPanel>

          <div className="grid gap-4 sm:grid-cols-2">
            {quickStartSteps.map((step) => {
              const Icon = step.icon;

              return (
                <GlassPanel key={step.title} className="p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    {step.description}
                  </p>
                </GlassPanel>
              );
            })}

            <button
              type="button"
              onClick={copyServerAddress}
              className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-yellow-400/25 bg-yellow-400/10 p-5 text-left transition hover:border-yellow-300/60 hover:bg-yellow-400/15 sm:col-span-2"
            >
              <span>
                <span className="block text-xs font-black uppercase text-yellow-200">
                  Official Server Address
                </span>
                <span className="mt-2 block break-all text-xl font-black text-white sm:text-2xl">
                  {copied ? "Copied!" : serverAddress}
                </span>
                <span className="mt-2 block text-sm text-gray-300">
                  Tap to copy before opening Minecraft.
                </span>
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/35 text-yellow-200 transition group-hover:scale-105">
                <Copy className="h-6 w-6" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-yellow-400/70" />
            <Gem className="h-4 w-4 text-yellow-300" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-yellow-400/70" />
          </div>
          <p className="text-xs font-black uppercase text-purple-300">
            Choose Your Path
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Different players, different goals.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-300">
            Ellipsis is built for players who want survival, collecting,
            building, progression, community, or supporter upgrades.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {playerPaths.map((path) => {
            const Icon = path.icon;

            return (
              <Link key={path.title} to={path.href} className="group block">
                <GlassPanel className="flex h-full min-h-[250px] flex-col p-6 transition group-hover:-translate-y-1 group-hover:border-purple-300/50 group-hover:bg-white/[0.08]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-white">
                    {path.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-300">
                    {path.description}
                  </p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-black text-purple-200 group-hover:text-white">
                    {path.action}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </p>
                </GlassPanel>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        id="gameplay"
        className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6 sm:py-16"
      >
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-400/70" />
            <Sparkles className="h-4 w-4 text-blue-300" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-blue-400/70" />
          </div>
          <p className="text-xs font-black uppercase text-blue-300">
            Core Systems
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            What makes Ellipsis feel different.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-300">
            These are the systems new players should understand first before
            diving deeper into ranks, rules, staff, and feature details.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {systemHighlights.map((system) => {
            const Icon = system.icon;

            return (
              <article
                key={system.title}
                className="group overflow-hidden rounded-[1.5rem] border border-purple-500/20 bg-white/[0.055] backdrop-blur-xl transition hover:-translate-y-1 hover:border-blue-300/45"
              >
                <div className="relative h-48 overflow-hidden bg-black">
                  <img
                    src={system.image}
                    alt={`${system.title} preview`}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 31vw, 100vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-white">
                    {system.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-300">
                    {system.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <GlassPanel className="p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="mt-1 h-6 w-6 shrink-0 text-purple-200" />
              <div>
                <h3 className="text-xl font-black text-white">
                  Learn before rushing.
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Read the rules, understand support paths, and use Discord when
                  you need staff help or order assistance.
                </p>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-200" />
              <div>
                <h3 className="text-xl font-black text-white">
                  Respect keeps the world healthy.
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Fair play, good communication, and clear expectations help the
                  community stay fun for new and returning players.
                </p>
              </div>
            </div>
          </GlassPanel>
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
            <GlassPanel key={title} className="relative overflow-hidden p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500" />
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
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-yellow-400/70" />
            <Crown className="h-4 w-4 text-yellow-300" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-yellow-400/70" />
          </div>
          <p className="text-xs font-black uppercase text-blue-300">
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
              className="relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-blue-300/40 hover:bg-blue-400/[0.08]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500" />
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
