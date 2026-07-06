import {
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
    ExternalLink,
    Heart,
    ListChecks,
    Trophy,
} from "lucide-react";
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
        <section id="vote" className="relative overflow-hidden px-4 py-20 text-white sm:px-6 sm:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_36%)]" />

            <div className="relative mx-auto max-w-7xl">
                <SectionTitle
                    label="Official Vote Links"
                    title="Complete your daily vote route."
                    description="Open each official vote site, submit your Minecraft username, and help Ellipsis SMP keep climbing."
                    accent="gold"
                />

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5 backdrop-blur-xl">
                        <CalendarCheck className="mb-3 h-7 w-7 text-yellow-300" />
                        <p className="text-sm font-black uppercase text-yellow-200">
                            Daily Habit
                        </p>
                        <p className="mt-2 text-sm leading-6 text-yellow-50/85">
                            Vote resets are daily on most lists. Come back often
                            to keep Ellipsis moving.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-purple-400/25 bg-purple-500/10 p-5 backdrop-blur-xl">
                        <ListChecks className="mb-3 h-7 w-7 text-purple-200" />
                        <p className="text-sm font-black uppercase text-purple-200">
                            Five Links
                        </p>
                        <p className="mt-2 text-sm leading-6 text-purple-50/85">
                            Use the cards below as a checklist and open every
                            official voting route.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-5 backdrop-blur-xl">
                        <CheckCircle2 className="mb-3 h-7 w-7 text-emerald-300" />
                        <p className="text-sm font-black uppercase text-emerald-200">
                            Username Matters
                        </p>
                        <p className="mt-2 text-sm leading-6 text-emerald-50/85">
                            Enter your Minecraft username carefully so rewards
                            and vote records match.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-5">
                    {voteSites.map((site, index) => (
                        <a
                            key={site.name}
                            href={site.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Vote for Ellipsis SMP on ${site.name}`}
                            className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[1.5rem] border border-yellow-400/25 bg-black/50 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-yellow-300/70 hover:shadow-[0_0_45px_rgba(250,204,21,0.22)] focus:outline-none focus:ring-2 focus:ring-yellow-400/60 sm:min-h-[360px]"
                        >
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.14),transparent_45%)] opacity-80" />

                            <div className="relative z-10 flex h-full flex-col">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-200">
                                        Site {index + 1}
                                    </span>
                                    <ExternalLink className="h-4 w-4 text-yellow-300" />
                                </div>

                                <div className="flex h-28 items-center justify-center rounded-2xl border border-yellow-400/15 bg-black/35 p-4">
                                    <img
                                        src={site.logo}
                                        alt={`${site.name} logo`}
                                        loading="lazy"
                                        decoding="async"
                                        className="max-h-20 w-full object-contain drop-shadow-[0_0_26px_rgba(250,204,21,0.28)] transition duration-500 group-hover:scale-105"
                                    />
                                </div>

                                <h3 className="mt-5 break-words text-xl font-black leading-tight text-white">
                                    {site.name}
                                </h3>

                                <p className="mt-3 flex-1 text-sm leading-6 text-gray-300">
                                    {site.description}
                                </p>

                                <div className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-3 text-sm font-black text-yellow-200 transition group-hover:border-yellow-300 group-hover:bg-yellow-400/20 group-hover:text-white">
                                    Vote Now
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-3xl border border-yellow-400/25 bg-black/45 p-6 text-center backdrop-blur-xl md:flex-row md:text-left">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:text-left">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10">
                            <Trophy className="h-8 w-8 text-yellow-300" />
                        </div>

                        <div>
                            <p className="font-black text-white">Your Vote Matters</p>
                            <p className="mt-1 text-sm leading-6 text-gray-400">
                                Every vote improves rankings, brings more players
                                into the community, and keeps the server visible.
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 text-yellow-300">
                        <Heart className="h-5 w-5" />
                        <span className="text-sm font-black uppercase">
                            Thank You
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Vote;
