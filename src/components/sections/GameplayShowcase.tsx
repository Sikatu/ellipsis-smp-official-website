import {
    CalendarDays,
    Castle,
    ExternalLink,
    Fish,
    Gem,
    Mountain,
    Pickaxe,
    ScrollText,
    Sparkles,
    Sword,
} from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../ui/SectionHeader";

const stellarityWikiUrl = "https://koharasbasement.wiki.gg/wiki/Stellarity";

const gameplayItems = [
    {
        icon: Castle,
        label: "Spawn",
        title: "Ellipsis SMP Spawn",
        description:
            "A custom-built spawn featuring unique builds, shops, NPCs, portals, and everything you need to start your journey.",
        image: "/gameplay/spawn.webp",
        gradient: "from-purple-600/30 via-blue-600/20 to-cyan-500/20",
    },
    {
        icon: Mountain,
        label: "World Exploration",
        title: "Custom Biomes",
        description:
            "Explore diverse landscapes, from lush forests and towering mountains to badlands, rivers, and hidden discoveries.",
        image: "/gameplay/custom-biomes.webp",
        gradient: "from-emerald-500/25 via-blue-600/20 to-purple-600/20",
    },
    {
        icon: Gem,
        label: "Powered by Stellarity",
        title: "Custom End",
        description:
            "Experience a fantasy-style End overhaul with new terrain, biomes, structures, items, weapons, and exploration mechanics.",
        image: "/gameplay/custom-end.webp",
        gradient: "from-violet-600/30 via-fuchsia-600/20 to-blue-600/20",
    },
    {
        icon: CalendarDays,
        label: "Community",
        title: "Community Moments",
        description:
            "Celebrate milestones, group activities, and special memories made together by the Ellipsis SMP community.",
        image: "/gameplay/community-moments.webp",
        gradient: "from-yellow-500/25 via-purple-600/20 to-pink-600/20",
    },
    {
        icon: Pickaxe,
        label: "Skill Progression",
        title: "Pyro Mining",
        description:
            "Level up your mining journey with custom progression, rewards, upgrades, and deeper resource-based gameplay.",
        image: "/gameplay/pyro-mining.webp",
        gradient: "from-orange-500/25 via-yellow-600/20 to-purple-600/20",
    },
    {
        icon: Fish,
        label: "Skill Progression",
        title: "Pyro Fishing",
        description:
            "Catch unique rewards, progress your fishing skills, and enjoy a more rewarding fishing experience.",
        image: "/gameplay/pyro-fishing.webp",
        gradient: "from-cyan-500/25 via-blue-600/20 to-purple-600/20",
    },
];

const stellarityFeatures = [
    {
        icon: Mountain,
        title: "Reworked End Terrain",
        description:
            "The End feels more alive with varied island shapes, atmospheric terrain, and fantasy-inspired generation.",
    },
    {
        icon: Sparkles,
        title: "New End Biomes",
        description:
            "Explore a larger End experience with many custom biome styles, including fields, barrens, forests, and frozen variants.",
    },
    {
        icon: Fish,
        title: "Void Fishing",
        description:
            "Cast into the End sky and discover biome-based loot tables, rare catches, and unique End-themed rewards.",
    },
    {
        icon: Pickaxe,
        title: "Altar of The Accursed",
        description:
            "Unlock late-game crafting through a special altar system used for powerful Stellarity gear progression.",
    },
    {
        icon: Sword,
        title: "New Gear & Items",
        description:
            "Discover new weapons, armor sets, food, potions, and magical tools designed for endgame progression.",
    },
    {
        icon: ScrollText,
        title: "Structures & Exploration",
        description:
            "Find new structures, reworked End Cities, ambient details, and exploration content throughout The End.",
    },
];

function GameplayShowcase() {
    return (
        <section id="gameplay" className="bg-transparent px-4 py-14 text-white sm:px-6 sm:py-20 md:py-24">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Gameplay Showcase"
                    title="Explore the Ellipsis SMP Experience"
                    description="Discover custom worlds, community moments, Pyro skill systems, and a Stellarity-powered Custom End experience."
                    tone="blue"
                />

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {gameplayItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 26 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                className={`group relative min-h-[360px] overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br ${item.gradient} backdrop-blur transition hover:-translate-y-2 hover:border-blue-400/60 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]`}
                            >
                                <img
                                    src={item.image}
                                    alt={`${item.title} preview`}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-48 w-full object-cover transition duration-700 group-hover:scale-105"
                                />

                                <div className="relative z-10 flex min-h-[216px] flex-col justify-between p-6">
                                    <div>
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>

                                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
                                            {item.label}
                                        </p>

                                        <h3 className="mt-3 text-2xl font-black">{item.title}</h3>

                                        <p className="mt-4 text-sm leading-6 text-gray-300">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="mt-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-yellow-300 opacity-80 transition group-hover:w-32" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="mt-10 overflow-hidden rounded-[2rem] border border-violet-500/25 bg-white/5 backdrop-blur"
                >
                    <div className="relative overflow-hidden bg-gradient-to-r from-violet-600/25 via-blue-600/20 to-fuchsia-600/25 p-8">
                        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />

                        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
                            <div className="max-w-3xl">
                                <p className="text-sm font-black uppercase tracking-[0.25em] text-violet-200">
                                    Custom End Expansion
                                </p>

                                <h3 className="mt-3 text-3xl font-black sm:text-4xl">
                                    The End, Reimagined with Stellarity
                                </h3>

                                <p className="mt-4 leading-7 text-gray-300">
                                    Ellipsis SMP uses Stellarity to transform The End into a
                                    deeper fantasy-style endgame experience with new biomes,
                                    terrain, structures, gear, mechanics, and exploration rewards.
                                </p>

                                <a
                                    href={stellarityWikiUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/10 px-5 py-3 font-black text-violet-200 transition hover:border-violet-300 hover:bg-violet-500/20"
                                >
                                    View Stellarity Wiki
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-violet-400/25 bg-black/40 shadow-[0_0_45px_rgba(168,85,247,0.25)]">
                                <img
                                    src="/gameplay/custom-end-expansion.webp"
                                    alt="Stellarity Custom End expansion preview"
                                    loading="lazy"
                                    decoding="async"
                                    className="h-64 w-full object-cover transition duration-700 hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                        {stellarityFeatures.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.35, delay: index * 0.04 }}
                                    className="rounded-3xl border border-violet-500/20 bg-black/30 p-5 transition hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/10"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                                        <Icon className="h-6 w-6 text-violet-300" />
                                    </div>

                                    <h4 className="font-black text-white">{feature.title}</h4>

                                    <p className="mt-2 text-sm leading-6 text-gray-400">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="border-t border-violet-500/20 px-6 py-5 text-sm text-gray-500">
                        Stellarity content belongs to its original creators. Ellipsis SMP
                        uses it as part of the Custom End gameplay experience.
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default GameplayShowcase;