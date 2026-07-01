import { Copy, Gamepad2, Globe2, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { discordInviteUrl } from "../../data/links";

const serverAddress = "ellipsismc.com:19213";

function About() {
    const [copied, setCopied] = useState(false);

    function copyIp() {
        navigator.clipboard.writeText(serverAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <section id="about" className="bg-transparent px-6 py-24 text-white">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-3xl border border-purple-500/20 bg-white/5 p-8 backdrop-blur">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-purple-400">
                        About the Server
                    </p>

                    <h2 className="text-4xl font-black md:text-6xl">
                        The Official Home of Ellipsis SMP
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        Ellipsis SMP is a premium crossplay Minecraft survival server built
                        for players who love progression, community, events, cosmetics,
                        custom content, and a polished SMP experience.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-blue-500/20 bg-black/30 p-5">
                            <Globe2 className="mb-3 h-7 w-7 text-blue-300" />
                            <h3 className="font-black">Crossplay Support</h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Join from Java and Bedrock with one shared community.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-500/20 bg-black/30 p-5">
                            <ShieldCheck className="mb-3 h-7 w-7 text-purple-300" />
                            <h3 className="font-black">Fair Survival</h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Built around progression, economy, cosmetics, and community.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-yellow-500/20 bg-black/30 p-5">
                            <Gamepad2 className="mb-3 h-7 w-7 text-yellow-300" />
                            <h3 className="font-black">Custom Content</h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Explore ranks, crates, plushies, furniture, events, and more.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-green-500/20 bg-black/30 p-5">
                            <Users className="mb-3 h-7 w-7 text-green-300" />
                            <h3 className="font-black">Community First</h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Discord support, tickets, announcements, and player events.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-blue-500/20 bg-white/5 p-8 backdrop-blur">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
                        How to Join
                    </p>

                    <h2 className="text-4xl font-black">Start Playing</h2>

                    <div className="mt-8 space-y-5">
                        <div className="rounded-2xl border border-purple-500/20 bg-black/30 p-5">
                            <p className="text-sm text-gray-400">Server Address</p>
                            <button
                                onClick={copyIp}
                                className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-purple-500/30 bg-white/5 px-4 py-3 text-left font-black text-purple-200"
                            >
                                {copied ? "Copied!" : serverAddress}
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="rounded-2xl border border-blue-500/20 bg-black/30 p-5">
                            <h3 className="font-black text-blue-300">Java Edition</h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Multiplayer → Add Server → paste the server address.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-green-500/20 bg-black/30 p-5">
                            <h3 className="font-black text-green-300">Bedrock Edition</h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Servers → Add Server → enter address and port 19213.
                            </p>
                        </div>

                        <a
                            href={discordInviteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-center font-black transition hover:scale-105"
                        >
                            Join Our Discord
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;