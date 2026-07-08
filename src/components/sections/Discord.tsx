import {
    MessageCircle,
    Music2,
    PlayCircle,
    ShieldQuestion,
    Signal,
    Ticket,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    discordInviteUrl,
    socialLinks,
} from "../../data/links";
import { useDiscordWidget } from "../../hooks/useDiscordWidget";
import { useServerStatus } from "../../hooks/useServerStatus";
import SectionHeader from "../ui/SectionHeader";
import { AnchorButton } from "../ui/Button";

const socials = [
    {
        name: "TikTok",
        url: socialLinks.tiktok,
        icon: Music2,
        label: "Watch clips",
        accent: "hover:border-pink-400/60 hover:text-pink-300",
    },
    {
        name: "YouTube",
        url: socialLinks.youtube,
        icon: PlayCircle,
        label: "Videos & updates",
        accent: "hover:border-red-400/60 hover:text-red-300",
    },
    {
        name: "Facebook",
        url: socialLinks.facebook,
        icon: Users,
        label: "Community posts",
        accent: "hover:border-blue-400/60 hover:text-blue-300",
    },
];

function Discord() {
    const minecraftStatus = useServerStatus();
    const discordStatus = useDiscordWidget();

    return (
        <section id="discord" className="bg-transparent px-4 py-14 text-white sm:px-6 sm:py-20 md:py-24">
            <div className="mx-auto max-w-6xl">
                <SectionHeader
                    eyebrow="Community Support"
                    title="Need Help? Join the Ellipsis SMP Community"
                    description="Get announcements, support, tickets, updates, social content, and help from the community team."
                    tone="blue"
                />

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-green-400/25 bg-green-400/10 p-5 text-center backdrop-blur">
                        <Signal className="mx-auto mb-3 h-7 w-7 text-green-300" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-green-300">
                            Minecraft
                        </p>
                        <p className="mt-2 text-3xl font-black">
                            {minecraftStatus.loading
                                ? "..."
                                : `${minecraftStatus.playersOnline} / ${minecraftStatus.playersMax}`}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">Players Online</p>
                    </div>

                    <div className="rounded-3xl border border-purple-400/25 bg-purple-400/10 p-5 text-center backdrop-blur">
                        <Users className="mx-auto mb-3 h-7 w-7 text-purple-300" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
                            Discord
                        </p>
                        <p className="mt-2 text-3xl font-black">
                            {discordStatus.loading ? "..." : discordStatus.onlineMembers}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">Members Online</p>
                    </div>

                    <div className="rounded-3xl border border-blue-400/25 bg-blue-400/10 p-5 text-center backdrop-blur">
                        <MessageCircle className="mx-auto mb-3 h-7 w-7 text-blue-300" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
                            Community
                        </p>
                        <p className="mt-2 text-3xl font-black">
                            {discordStatus.error ? "Live" : discordStatus.serverName}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">Active Server Hub</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                    <div className="rounded-3xl border border-purple-500/25 bg-white/5 p-8 backdrop-blur">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600">
                            <MessageCircle className="h-8 w-8" />
                        </div>

                        <h3 className="text-3xl font-black">Join the Community</h3>

                        <p className="mt-4 leading-7 text-gray-300">
                            Join Discord to stay updated, ask questions, meet players, read
                            announcements, and connect with the Ellipsis SMP community.
                        </p>

                        <AnchorButton
                            href={discordStatus.inviteUrl || discordInviteUrl}
                            target="_blank"
                            rel="noreferrer"
                            size="lg"
                            className="mt-7 rounded-xl"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Join Discord
                        </AnchorButton>
                    </div>

                    <div className="rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-8 backdrop-blur">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/40 bg-yellow-400/10">
                            <ShieldQuestion className="h-8 w-8 text-yellow-300" />
                        </div>

                        <h3 className="text-3xl font-black">Need Assistance?</h3>

                        <p className="mt-4 leading-7 text-gray-300">
                            Open a ticket for purchases, rank questions, crate support,
                            furniture requests, plushies, rewards, or account-related help.
                        </p>

                        <Link
                            to="/tickets"
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-8 py-4 font-black text-yellow-300 transition hover:scale-105 hover:bg-yellow-400/20"
                        >
                            <Ticket className="h-5 w-5" />
                            Open Ticket
                        </Link>
                    </div>
                </div>

                <div className="mt-6 rounded-3xl border border-blue-500/20 bg-black/35 p-6 backdrop-blur">
                    <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.25em] text-blue-300">
                        Follow Ellipsis SMP
                    </p>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {socials.map((social) => {
                            const Icon = social.icon;

                            return (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`group rounded-2xl border border-purple-500/20 bg-white/5 p-5 text-center transition hover:-translate-y-1 hover:bg-white/10 ${social.accent}`}
                                >
                                    <Icon className="mx-auto h-7 w-7 text-purple-300 transition group-hover:scale-110" />
                                    <h4 className="mt-3 font-black text-white">{social.name}</h4>
                                    <p className="mt-1 text-sm text-gray-400">{social.label}</p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Discord;