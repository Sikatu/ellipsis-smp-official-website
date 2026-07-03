import { Link } from "react-router-dom";
import PageShell from "./PageShell";
import Hero from "../components/sections/Hero";
import OfficialVideo from "../components/sections/OfficialVideo";
import Featured from "../components/sections/Featured";
import GameplayShowcase from "../components/sections/GameplayShowcase";
import ServerStats from "../components/sections/ServerStats";
import GlassPanel from "../components/ui/GlassPanel";
import SectionHeader from "../components/ui/SectionHeader";
import SectionDivider from "../components/ui/SectionDivider";
import CallToAction from "../components/ui/CallToAction";

const cinematicShowcase = [
    { src: "/images/showcase/spawn.webp", title: "Official Spawn" },
    { src: "/images/showcase/market.webp", title: "Market District" },
    { src: "/images/showcase/end.webp", title: "Custom End" },
    { src: "/images/showcase/nether.webp", title: "Nether Realm" },
    { src: "/images/showcase/biome.webp", title: "World Exploration" },
];

const exploreCards = [
    {
        eyebrow: "Store",
        title: "Marketplace",
        description:
            "Support Ellipsis SMP through ranks, crates, furniture coins, and plushie keys.",
        href: "/marketplace",
    },
    {
        eyebrow: "Growth",
        title: "Vote",
        description:
            "Help new players discover Ellipsis and push the server higher across vote lists.",
        href: "/vote",
    },
    {
        eyebrow: "Community",
        title: "Discord",
        description:
            "Get support, announcements, tickets, updates, and connect with other players.",
        href: "/discord",
    },
    {
        eyebrow: "Story",
        title: "About",
        description:
            "Learn the gameplay, progression, features, rules, and staff behind Ellipsis SMP.",
        href: "/about",
    },
];

function HomePage() {
    const [featuredImage, ...supportImages] = cinematicShowcase;

    return (
        <PageShell>
            <Hero />

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <SectionHeader
                    eyebrow="Inside Ellipsis"
                    title="A glimpse of the world waiting for you."
                    description="Explore cinematic snapshots from across Ellipsis SMP — from spawn to markets, custom dimensions, and dangerous realms."
                />

                <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
                    <div className="group relative min-h-[420px] overflow-hidden rounded-[2rem] border border-purple-500/20 bg-black shadow-[0_0_45px_rgba(168,85,247,0.16)] transition hover:-translate-y-1 hover:border-purple-300/50">
                        <img
                            src={featuredImage.src}
                            alt={featuredImage.title}
                            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-200">
                                {featuredImage.title}
                            </p>
                            <h3 className="mt-2 max-w-xl text-3xl font-black leading-tight text-white md:text-4xl">
                                Start your story at the heart of Ellipsis.
                            </h3>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-gray-300">
                                Step into a polished survival world built for adventure,
                                community, progression, and unforgettable moments.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {supportImages.map((item) => (
                            <div
                                key={item.src}
                                className="group relative min-h-[200px] overflow-hidden rounded-[1.5rem] border border-purple-500/20 bg-black shadow-[0_0_35px_rgba(168,85,247,0.1)] transition hover:-translate-y-1 hover:border-purple-300/50"
                            >
                                <img
                                    src={item.src}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-200">
                                        {item.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <OfficialVideo />

            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
                <SectionHeader
                    eyebrow="Explore Ellipsis"
                    title="Choose your next destination."
                    description="Each page is built around a different part of the Ellipsis SMP experience."
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {exploreCards.map((card) => (
                        <Link key={card.title} to={card.href} className="group block">
                            <GlassPanel className="h-full p-6 transition duration-300 group-hover:-translate-y-1 group-hover:border-purple-300/50 group-hover:bg-white/[0.09]">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                                    {card.eyebrow}
                                </p>
                                <h3 className="mt-3 text-2xl font-black text-white">
                                    {card.title}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-gray-300">
                                    {card.description}
                                </p>
                                <p className="mt-6 text-sm font-black text-purple-200 transition group-hover:text-white">
                                    Open {card.title}
                                </p>
                            </GlassPanel>
                        </Link>
                    ))}
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