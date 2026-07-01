import { ExternalLink, Heart, Trophy } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";

const voteSites = [
    {
        name: "MinecraftServers.org",
        url: "https://minecraftservers.org/vote/688097",
        logo: "/vote/minecraftservers.webp",
        description:
            "One of the largest Minecraft server communities. Vote daily and help us reach the top.",
    },
    {
        name: "Minecraft Server List",
        url: "https://minecraft-serverlist.com/server/5303/vote",
        logo: "/vote/minecraft-serverlist.webp",
        description:
            "Support Ellipsis SMP and help our server grow stronger in the rankings.",
    },
    {
        name: "Minecraft.buzz",
        url: "https://minecraft.buzz/vote/21301",
        logo: "/vote/minecraftbuzz.webp",
        description:
            "A growing community of players and servers. Every vote makes a difference.",
    },
    {
        name: "Minecraft Best Servers",
        url: "https://minecraftbestservers.com/server-ellipsis-smp.6962/vote",
        logo: "/vote/minecraftbestservers.webp",
        description:
            "Help Ellipsis SMP climb monthly rankings and gain more visibility.",
    },
    {
        name: "Minecraft MP",
        url: "https://minecraft-mp.com/server/358527/vote/",
        logo: "/vote/minecraft-mp.webp",
        description:
            "A premium Minecraft server listing network. Vote and help us stay on top.",
    },
];

function Vote() {
    return (
        <section id="vote" className="relative overflow-hidden px-6 py-28 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_36%)]" />

            <div className="relative mx-auto max-w-7xl">
                <SectionTitle
                    label="Vote Rewards"
                    title="Vote for Ellipsis SMP"
                    description="Vote daily to support Ellipsis SMP, improve our leaderboard position, and earn in-game rewards."
                    accent="gold"
                />

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {voteSites.map((site) => (
                        <a
                            key={site.name}
                            href={site.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Vote for Ellipsis SMP on ${site.name}`}
                            className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-yellow-400/25 bg-black/50 p-6 text-center backdrop-blur-xl transition hover:-translate-y-2 hover:border-yellow-300/70 hover:shadow-[0_0_45px_rgba(250,204,21,0.22)] focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                        >
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_42%)] opacity-80" />
                            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl transition group-hover:bg-yellow-400/20" />

                            <div className="relative z-10 flex h-full flex-col items-center">
                                <div className="mb-7 flex h-36 w-full items-center justify-center">
                                    <img
                                        src={site.logo}
                                        alt={`${site.name} logo`}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-28 w-44 object-contain drop-shadow-[0_0_28px_rgba(250,204,21,0.35)] transition duration-500 group-hover:-translate-y-3 group-hover:scale-110"
                                    />
                                </div>

                                <h3 className="text-xl font-black text-white">{site.name}</h3>

                                <p className="mt-4 flex-1 text-sm leading-6 text-gray-300">
                                    {site.description}
                                </p>

                                <div className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-3 font-black text-yellow-200 transition group-hover:border-yellow-300 group-hover:bg-yellow-400/20 group-hover:text-white">
                                    Vote Now
                                    <ExternalLink className="h-4 w-4" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-3xl border border-yellow-400/25 bg-black/45 p-6 text-center backdrop-blur-xl md:flex-row md:text-left">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10">
                            <Trophy className="h-8 w-8 text-yellow-300" />
                        </div>

                        <div>
                            <p className="font-black text-white">Your Vote Matters</p>
                            <p className="mt-1 text-sm leading-6 text-gray-400">
                                Every vote helps Ellipsis SMP grow, improves our rankings, and
                                brings more players into the community.
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 text-yellow-300">
                        <Heart className="h-5 w-5" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">
                            Thank You
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Vote;