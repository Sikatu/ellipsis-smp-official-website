import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Box,
    Copy,
    Gem,
    MessageCircle,
    PackageCheck,
    Pickaxe,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Swords,
    Trophy,
    Vote,
} from "lucide-react";
import PageShell from "./PageShell";
import Hero from "../components/sections/Hero";
import OfficialVideo from "../components/sections/OfficialVideo";
import Featured from "../components/sections/Featured";
import GameplayShowcase from "../components/sections/GameplayShowcase";
import ServerStats from "../components/sections/ServerStats";
import SectionHeader from "../components/ui/SectionHeader";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const serverAddress = "ellipsismc.com:19213";

const joinSteps = [
    {
        icon: Copy,
        title: "Copy the address",
        description: "Use the official server address on Java or Bedrock.",
    },
    {
        icon: Swords,
        title: "Join the SMP",
        description: "Load in, explore spawn, and start building your story.",
    },
    {
        icon: MessageCircle,
        title: "Open Discord",
        description: "Get announcements, support, tickets, and community updates.",
    },
    {
        icon: Vote,
        title: "Vote daily",
        description: "Support server growth and claim useful rewards.",
    },
];

const officialPaths = [
    {
        icon: ShoppingBag,
        eyebrow: "Store",
        title: "Marketplace",
        description:
            "Browse ranks, crates, plushies, furniture, and supporter upgrades.",
        href: "/marketplace",
        action: "Shop items",
    },
    {
        icon: Vote,
        eyebrow: "Rewards",
        title: "Vote",
        description:
            "Vote across official lists, help new players find Ellipsis, and earn rewards.",
        href: "/vote",
        action: "Vote now",
    },
    {
        icon: MessageCircle,
        eyebrow: "Community",
        title: "Discord",
        description:
            "Join announcements, tickets, events, staff support, and community chat.",
        href: "/discord",
        action: "Join community",
    },
    {
        icon: PackageCheck,
        eyebrow: "Support",
        title: "Track Order",
        description:
            "Check purchase status and confirm delivery after buying from the store.",
        href: "/track",
        action: "Track purchase",
    },
];

const systemCards = [
    {
        icon: Sparkles,
        title: "Stellarity Custom End",
        description:
            "A reimagined End experience with fantasy terrain, structures, gear, and late-game exploration.",
        image: "/gameplay/custom-end.webp",
        tone: "from-violet-500/25 via-blue-500/10 to-black/20",
    },
    {
        icon: Pickaxe,
        title: "Pyro Skill Progression",
        description:
            "Mining and fishing systems add levels, rewards, upgrades, and extra goals beyond normal survival.",
        image: "/gameplay/pyro-mining.webp",
        tone: "from-yellow-500/20 via-orange-500/10 to-black/20",
    },
    {
        icon: Trophy,
        title: "Community Events",
        description:
            "Seasonal activities, milestones, giveaways, and server-wide moments keep the world moving.",
        image: "/gameplay/community-moments.webp",
        tone: "from-pink-500/20 via-purple-500/10 to-black/20",
    },
    {
        icon: Gem,
        title: "Ranks and Cosmetics",
        description:
            "Optional supporter perks, cosmetics, crates, plushies, and furniture for players who want more.",
        image: "/ranks/ascendant.png",
        tone: "from-cyan-500/20 via-purple-500/10 to-black/20",
    },
    {
        icon: ShieldCheck,
        title: "Official Support",
        description:
            "Clear paths for help, tickets, order checks, announcements, and staff communication.",
        image: "/images/showcase/spawn.webp",
        tone: "from-emerald-500/20 via-blue-500/10 to-black/20",
    },
    {
        icon: Box,
        title: "Builder-Friendly World",
        description:
            "Spawn, markets, biomes, furniture packs, and exploration spaces built for long-term survival play.",
        image: "/gameplay/custom-biomes.webp",
        tone: "from-blue-500/20 via-emerald-500/10 to-black/20",
    },
];

function HomePage() {
    const [copied, setCopied] = useState(false);

    function copyServerAddress() {
        void navigator.clipboard.writeText(serverAddress).catch(() => undefined);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    }

    return (
        <PageShell>
            <Hero />

            <section className="mx-auto max-w-7xl px-4 py-16 text-white sm:px-6 lg:py-20">
                <SectionHeader
                    eyebrow="Official Start"
                    title="Join Ellipsis SMP in minutes."
                    description="The 3.0 homepage is built around the player journey: copy the address, join the server, connect with Discord, and find the right next step."
                />

                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                    <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border border-purple-500/20 bg-black shadow-[0_0_45px_rgba(168,85,247,0.16)] sm:rounded-[2rem]">
                        <img
                            src="/gameplay/spawn.webp"
                            alt="Ellipsis SMP spawn"
                            loading="lazy"
                            decoding="async"
                            sizes="(min-width: 1024px) 44vw, 100vw"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                            <p className="text-xs font-black uppercase text-purple-200">
                                Java + Bedrock Crossplay
                            </p>
                            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
                                Spawn is your first stop.
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                                Start at the official hub, learn the server systems, and
                                branch into survival, progression, events, cosmetics, and
                                the community.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {joinSteps.map((step) => {
                            const Icon = step.icon;

                            return (
                                <article
                                    key={step.title}
                                    className="rounded-[1.25rem] border border-purple-500/20 bg-white/[0.055] p-5 backdrop-blur-xl"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-black text-white">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-300">
                                        {step.description}
                                    </p>
                                </article>
                            );
                        })}

                        <button
                            type="button"
                            onClick={copyServerAddress}
                            className="group flex items-center justify-between gap-4 rounded-[1.25rem] border border-yellow-400/25 bg-yellow-400/10 p-5 text-left transition hover:border-yellow-300/60 hover:bg-yellow-400/15 sm:col-span-2"
                        >
                            <span>
                                <span className="block text-xs font-black uppercase text-yellow-200">
                                    Server Address
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

            <section className="mx-auto max-w-7xl px-4 py-16 text-white sm:px-6">
                <SectionHeader
                    eyebrow="Official Hub"
                    title="Everything a player needs, one tap away."
                    description="Fast paths for the most common player actions, tuned for phone users and returning community members."
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {officialPaths.map((path) => {
                        const Icon = path.icon;

                        return (
                            <Link key={path.title} to={path.href} className="group block">
                                <article className="flex h-full min-h-[260px] flex-col rounded-[1.25rem] border border-purple-500/20 bg-black/35 p-6 backdrop-blur-xl transition duration-300 group-hover:-translate-y-1 group-hover:border-purple-300/50 group-hover:bg-white/[0.08]">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <p className="mt-5 text-xs font-black uppercase text-purple-300">
                                        {path.eyebrow}
                                    </p>
                                    <h3 className="mt-3 text-2xl font-black text-white">
                                        {path.title}
                                    </h3>
                                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-300">
                                        {path.description}
                                    </p>
                                    <p className="mt-6 inline-flex items-center gap-2 text-sm font-black text-purple-200 transition group-hover:text-white">
                                        {path.action}
                                        <ArrowRight className="h-4 w-4" />
                                    </p>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <OfficialVideo />

            <section className="mx-auto max-w-7xl px-4 py-16 text-white sm:px-6 lg:py-20">
                <SectionHeader
                    eyebrow="Server Systems"
                    title="A survival world with more to do."
                    description="Ellipsis 3.0 presents the gameplay systems clearly so new players understand what makes the server different."
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {systemCards.map((system) => {
                        const Icon = system.icon;

                        return (
                            <article
                                key={system.title}
                                className={`group overflow-hidden rounded-[1.25rem] border border-purple-500/20 bg-gradient-to-br ${system.tone} backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-purple-300/50`}
                            >
                                <div className="relative h-44 overflow-hidden bg-black">
                                    <img
                                        src={system.image}
                                        alt={`${system.title} preview`}
                                        loading="lazy"
                                        decoding="async"
                                        sizes="(min-width: 1280px) 31vw, (min-width: 768px) 50vw, 100vw"
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                                </div>

                                <div className="p-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-xl font-black text-white">
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
            </section>

            <SectionDivider />

            <Featured />
            <GameplayShowcase />
            <ServerStats />

            <CallToAction
                eyebrow="Begin Your Journey"
                title="Ellipsis SMP is waiting."
                description="Join the community, explore the server, and become part of the next chapter."
                primaryLabel="Join Discord"
                primaryHref="/discord"
                secondaryLabel="Visit Marketplace"
                secondaryHref="/marketplace"
            />
        </PageShell>
    );
}

export default HomePage;
