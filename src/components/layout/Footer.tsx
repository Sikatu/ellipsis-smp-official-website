import {
    Code2,
    Copy,
    ExternalLink,
    MessageCircle,
    ShieldCheck,
    Store,
    Vote,
} from "lucide-react";
import { useState } from "react";
import { discordInviteUrl } from "../../data/links";
import { navigation } from "../../data/navigation";

const serverAddress = "ellipsismc.com:19213";

const quickLinks = navigation.filter((item) =>
    ["Home", "Gameplay", "Progression", "Staff", "Store", "Vote"].includes(
        item.label
    )
);

function Footer() {
    const [copied, setCopied] = useState(false);

    function copyIp() {
        navigator.clipboard.writeText(serverAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <footer className="relative overflow-hidden border-t border-purple-900/40 bg-black/70 px-6 py-16 text-gray-400 backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_35%)]" />

            <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.9fr_1fr]">
                <div>
                    <div className="flex items-center gap-3">
                        <img
                            src="/ellipsis-logo.webp"
                            alt="Ellipsis SMP"
                            className="h-14 w-auto object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.9)]"
                        />

                        <div>
                            <p className="font-black text-white">ELLIPSIS SMP</p>
                            <p className="text-sm text-purple-200">Official Website</p>
                        </div>
                    </div>

                    <p className="mt-5 max-w-sm text-sm leading-6">
                        A premium crossplay Minecraft SMP built for survival, community,
                        custom content, cosmetics, and long-term progression.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href={discordInviteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-200 transition hover:border-purple-400/60 hover:bg-purple-500/20"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Discord
                        </a>

                        <a
                            href="#store"
                            className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-200 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
                        >
                            <Store className="h-4 w-4" />
                            Store
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 font-black text-white">Quick Links</h3>
                    <div className="space-y-2 text-sm">
                        {quickLinks.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="block transition hover:translate-x-1 hover:text-purple-300"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 font-black text-white">Community</h3>
                    <div className="space-y-2 text-sm">
                        <a
                            href="#discord"
                            className="block transition hover:translate-x-1 hover:text-purple-300"
                        >
                            Discord & Support
                        </a>
                        <a
                            href="#rules"
                            className="block transition hover:translate-x-1 hover:text-purple-300"
                        >
                            Rules
                        </a>
                        <a
                            href="#features"
                            className="block transition hover:translate-x-1 hover:text-blue-300"
                        >
                            Server Features
                        </a>
                        <a
                            href="#vote"
                            className="block transition hover:translate-x-1 hover:text-yellow-300"
                        >
                            Vote Rewards
                        </a>
                    </div>

                    <div className="mt-6 rounded-2xl border border-purple-500/20 bg-white/5 p-4">
                        <p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                            <Code2 className="h-4 w-4" />
                            Powered By
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {["React", "TypeScript", "TailwindCSS", "Framer Motion"].map(
                                (tool) => (
                                    <span
                                        key={tool}
                                        className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200"
                                    >
                                        {tool}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 font-black text-white">Server Address</h3>

                    <button
                        type="button"
                        onClick={copyIp}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-white/5 p-4 text-left transition hover:border-purple-400/60 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(168,85,247,0.18)] focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                    >
                        <span className="break-all text-sm font-black text-purple-200">
                            {copied ? "Copied!" : serverAddress}
                        </span>
                        <Copy className="h-4 w-4 text-purple-300" />
                    </button>

                    <div className="mt-4 grid gap-3">
                        <a
                            href="#vote"
                            className="inline-flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-200 transition hover:border-yellow-400/50 hover:bg-yellow-500/20"
                        >
                            <span className="inline-flex items-center gap-2">
                                <Vote className="h-4 w-4" />
                                Vote for rewards
                            </span>
                            <ExternalLink className="h-4 w-4" />
                        </a>

                        <a
                            href="#discord"
                            className="inline-flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-200 transition hover:border-blue-400/50 hover:bg-blue-500/20"
                        >
                            <span className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Get support
                            </span>
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="relative mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-purple-900/40 pt-6 text-sm md:flex-row md:items-center md:justify-between">
                <p>
                    © 2026 Ellipsis SMP. All purchases support the server through Discord
                    tickets.
                </p>

                <p className="text-xs text-gray-500">
                    Not affiliated with Mojang Studios or Microsoft.
                </p>
            </div>
        </footer>
    );
}

export default Footer;