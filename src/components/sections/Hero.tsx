import { motion, useReducedMotion } from "framer-motion";
import { Copy, Gift, Globe2, Server, Sparkles } from "lucide-react";
import { useState } from "react";
import { discordInviteUrl } from "../../data/links";
import LiveServerPanel from "../ui/LiveServerPanel";

const serverIp = "ellipsismc.com:19213";

const highlights = [
    { icon: Globe2, title: "Crossplay", text: "Java + Bedrock" },
    { icon: Server, title: "24/7 Survival", text: "Always online" },
    { icon: Gift, title: "Daily Rewards", text: "Vote and earn" },
];

function Hero() {
    const [copied, setCopied] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    function copyServerIp() {
        navigator.clipboard.writeText(serverIp);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <section
            id="home"
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24 text-center text-white sm:px-6 sm:py-28"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#581c87_0%,transparent_35%),radial-gradient(circle_at_bottom_right,#1d4ed8_0%,transparent_32%)]" />

            <motion.div
                className="absolute left-10 top-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl"
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                            x: [0, 35, 0],
                            y: [0, -25, 0],
                            opacity: [0.35, 0.65, 0.35],
                        }
                }
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                            x: [0, -40, 0],
                            y: [0, 30, 0],
                            opacity: [0.3, 0.6, 0.3],
                        }
                }
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-12">
                <div className="flex max-w-4xl flex-col items-center">
                    <picture>
                        <source media="(max-width: 640px)" srcSet="/ellipsis-logo-384.webp" />
                        <source media="(max-width: 1024px)" srcSet="/ellipsis-logo-640.webp" />
                        <img
                            src="/ellipsis-logo-640.webp"
                            alt="Ellipsis SMP Logo"
                            width="640"
                            height="640"
                            loading="eager"
                            decoding="async"
                            fetchPriority="high"
                            className="mb-6 h-auto w-[300px] object-contain drop-shadow-[0_0_75px_rgba(168,85,247,0.95)] sm:w-[460px] md:w-[560px] lg:w-[640px]"
                        />
                    </picture>

                    <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-white/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.25em] text-purple-200 backdrop-blur">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        Official Ellipsis SMP Website
                    </p>

                    <h1 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl md:text-7xl lg:text-8xl">
                        Crossplay Minecraft Survival.
                    </h1>

                    <p className="mb-8 max-w-2xl text-lg leading-8 text-gray-300 md:text-2xl">
                        Built for adventure, community, custom content, cosmetics, and
                        long-term progression.
                    </p>

                    <div className="mb-8 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
                        <button
                            onClick={copyServerIp}
                            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-4 font-black shadow-[0_0_30px_rgba(37,99,235,0.35)] transition hover:scale-105 sm:w-auto"
                        >
                            {copied ? "Server IP Copied!" : "Play Now"}
                        </button>

                        <a
                            href={discordInviteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-10 py-4 font-black text-yellow-300 transition hover:scale-105 hover:bg-yellow-400/20 sm:w-auto"
                        >
                            Join Discord
                        </a>

                        <a
                            href="#store"
                            className="w-full rounded-xl border border-purple-400/50 bg-white/5 px-10 py-4 font-black text-purple-200 transition hover:scale-105 hover:bg-white/10 sm:w-auto"
                        >
                            Support Server
                        </a>
                    </div>

                    <button
                        onClick={copyServerIp}
                        className="mb-6 flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-white/5 p-5 text-left backdrop-blur transition hover:bg-white/10"
                    >
                        <div>
                            <p className="text-sm text-gray-400">Server Address</p>
                            <span className="font-black text-purple-200">
                                {copied ? "Copied!" : serverIp}
                            </span>
                        </div>
                        <Copy className="h-5 w-5 text-purple-300" />
                    </button>

                    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
                        {highlights.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-purple-500/20 bg-white/5 p-5 text-left backdrop-blur"
                                >
                                    <Icon className="mb-3 h-6 w-6 text-purple-300" />
                                    <h3 className="font-black">{item.title}</h3>
                                    <p className="mt-1 text-sm text-gray-400">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <motion.div
                    className="relative w-full max-w-md"
                    animate={shouldReduceMotion ? undefined : { y: [0, -14, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="absolute inset-0 rounded-full bg-purple-600/30 blur-3xl" />
                    <div className="relative">
                        <LiveServerPanel />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default Hero;