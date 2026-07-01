import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const progressionRanks = [
    {
        name: "Drifter",
        icon: "/progression/icons/drifter.png",
        description: "New player exploring the realm.",
        accent: "border-slate-400/40 text-slate-200",
        glow: "group-hover:shadow-[0_0_35px_rgba(148,163,184,0.25)]",
    },
    {
        name: "Cipher",
        icon: "/progression/icons/cipher.png",
        description: "Learns ancient technology and runes.",
        accent: "border-cyan-400/40 text-cyan-300",
        glow: "group-hover:shadow-[0_0_35px_rgba(34,211,238,0.25)]",
    },
    {
        name: "Warden",
        icon: "/progression/icons/warden.png",
        description: "Protector of cities and kingdoms.",
        accent: "border-blue-400/40 text-blue-200",
        glow: "group-hover:shadow-[0_0_35px_rgba(96,165,250,0.25)]",
    },
    {
        name: "Runeblade",
        icon: "/progression/icons/runeblade.png",
        description: "Warrior empowered by forbidden runes.",
        accent: "border-pink-400/40 text-pink-300",
        glow: "group-hover:shadow-[0_0_35px_rgba(244,114,182,0.25)]",
    },
    {
        name: "Voidlord",
        icon: "/progression/icons/voidlord.png",
        description: "Master of the corrupted dimensions.",
        accent: "border-purple-400/40 text-purple-300",
        glow: "group-hover:shadow-[0_0_35px_rgba(168,85,247,0.28)]",
    },
    {
        name: "Eclipse",
        icon: "/progression/icons/eclipse.png",
        description: "Legendary final rank.",
        accent: "border-yellow-400/40 text-yellow-300",
        glow: "group-hover:shadow-[0_0_35px_rgba(250,204,21,0.25)]",
    },
];

function RankProgression() {
    return (
        <section
            id="progression"
            className="relative overflow-hidden px-6 py-28 text-white"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_35%)]" />

            <div className="relative mx-auto max-w-7xl">
                <div className="mb-14 text-center">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-purple-400">
                        Rank Progression
                    </p>

                    <h2 className="mt-4 text-4xl font-black uppercase tracking-tight md:text-6xl lg:text-7xl">
                        Earn Ranks Through{" "}
                        <span className="bg-gradient-to-r from-purple-300 to-fuchsia-500 bg-clip-text text-transparent">
                            Play
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
                        Progress through grindable ranks by playing, exploring, building,
                        and growing your journey inside Ellipsis SMP.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
                    {progressionRanks.map((rank, index) => (
                        <motion.div
                            key={rank.name}
                            initial={{ opacity: 0, y: 26 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className={`group relative min-h-[420px] overflow-hidden rounded-3xl border bg-black/45 p-5 backdrop-blur-xl transition hover:-translate-y-2 ${rank.accent} ${rank.glow}`}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_40%)] opacity-70" />

                            {index < progressionRanks.length - 1 && (
                                <div className="absolute -right-5 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
                                    <ArrowRight className="h-9 w-9 text-purple-400 drop-shadow-[0_0_14px_rgba(168,85,247,0.9)]" />
                                </div>
                            )}

                            <div className="relative z-10 flex h-full flex-col items-center text-center">
                                <div className="mb-8 flex h-44 w-full items-center justify-center">
                                    <img
                                        src={rank.icon}
                                        alt={`${rank.name} emblem`}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-40 w-40 object-contain drop-shadow-[0_0_36px_rgba(168,85,247,0.5)] transition duration-500 group-hover:-translate-y-3 group-hover:scale-110 [image-rendering:pixelated]"
                                    />
                                </div>

                                <div className="flex flex-1 flex-col items-center justify-center">
                                    <h3 className={`text-2xl font-black uppercase ${rank.accent}`}>
                                        {rank.name}
                                    </h3>

                                    <div className="my-4 h-1 w-12 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400" />

                                    <p className="text-sm leading-6 text-gray-300">
                                        {rank.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-3xl border border-purple-500/30 bg-black/45 p-6 text-center backdrop-blur-xl md:flex-row md:text-left">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10">
                            <ShieldCheck className="h-8 w-8 text-purple-300" />
                        </div>

                        <p className="text-gray-300">
                            All progression ranks can be earned through gameplay. Premium
                            ranks are optional and help{" "}
                            <span className="font-bold text-purple-300">
                                support the server.
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-yellow-300">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">
                            Grindable
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RankProgression;