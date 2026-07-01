import { motion } from "framer-motion";
import { Crown, ShieldCheck, Sparkles } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";

const staffRanks = [
    {
        rank: "Sovereign",
        image: "/staff/sovereign.png",
        role: "Server Owner",
        members: "Sikatu",
        title: "Founder of Ellipsis SMP",
        accent: "border-fuchsia-400/40 text-fuchsia-300",
        glow: "group-hover:shadow-[0_0_50px_rgba(217,70,239,0.35)]",
        imageScale: "scale-125",
    },
    {
        rank: "Developer",
        image: "/staff/developer.png",
        role: "Server Development",
        members: "2axx",
        title: "Systems Architect",
        accent: "border-emerald-400/40 text-emerald-300",
        glow: "group-hover:shadow-[0_0_40px_rgba(52,211,153,0.28)]",
        imageScale: "scale-125",
    },
    {
        rank: "Overseer",
        image: "/staff/overseer.png",
        role: "Manager",
        members: "Sikami",
        title: "Operations Lead",
        accent: "border-yellow-400/40 text-yellow-300",
        glow: "group-hover:shadow-[0_0_45px_rgba(250,204,21,0.3)]",
        imageScale: "scale-125",
    },
    {
        rank: "Nexus",
        image: "/staff/nexus.png",
        role: "Admin",
        members: "Lynxx and BVNS",
        title: "Core Administration",
        accent: "border-purple-400/40 text-purple-300",
        glow: "group-hover:shadow-[0_0_45px_rgba(168,85,247,0.32)]",
        imageScale: "scale-110",
    },
    {
        rank: "Executor",
        image: "/staff/executor.png",
        role: "Moderator and Rule Enforcement",
        members: "Open for Application",
        title: "Guardian of Order",
        accent: "border-red-400/40 text-red-300",
        glow: "group-hover:shadow-[0_0_40px_rgba(248,113,113,0.28)]",
        imageScale: "scale-125",
    },
    {
        rank: "Architect",
        image: "/staff/architect.png",
        role: "Builder and World Designer",
        members: "Open for Application",
        title: "World Creator",
        accent: "border-orange-400/40 text-orange-300",
        glow: "group-hover:shadow-[0_0_40px_rgba(251,146,60,0.28)]",
        imageScale: "scale-125",
    },
    {
        rank: "Sentinel",
        image: "/staff/sentinel.png",
        role: "Helper and Player Support",
        members: "Weniee",
        title: "First Line of Support",
        accent: "border-cyan-400/40 text-cyan-300",
        glow: "group-hover:shadow-[0_0_40px_rgba(34,211,238,0.28)]",
        imageScale: "scale-125",
    },
];

function StaffRanks() {
    return (
        <section id="staff" className="relative overflow-hidden px-6 py-28 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]" />

            <div className="relative mx-auto max-w-7xl">
                <SectionTitle
                    label="Staff Council"
                    title="The Team Behind Ellipsis SMP"
                    description="Meet the trusted team responsible for leadership, development, management, administration, moderation, building, and player support."
                    accent="blue"
                />

                <div className="mb-10 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-purple-200">
                        <ShieldCheck className="h-4 w-4" />
                        Official Server Authority
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {staffRanks.map((staff, index) => {
                        const isOpen = staff.members.toLowerCase().includes("open");
                        const isOwner = staff.rank === "Sovereign";

                        return (
                            <motion.div
                                key={staff.rank}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className={`group relative min-h-[430px] w-full max-w-[320px] overflow-hidden rounded-[2rem] border bg-black/50 p-6 backdrop-blur-xl transition hover:-translate-y-2 ${staff.accent} ${staff.glow}`}
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-yellow-400" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)] opacity-80" />
                                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl transition group-hover:bg-purple-400/20" />

                                {isOwner && (
                                    <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                                        <Crown className="h-3 w-3" />
                                        Owner
                                    </div>
                                )}

                                <div className="relative z-10 flex h-full flex-col items-center text-center">
                                    <div className="mb-7 flex h-28 w-full items-center justify-center overflow-visible">
                                        <img
                                            src={staff.image}
                                            alt={`${staff.rank} staff rank`}
                                            loading="lazy"
                                            decoding="async"
                                            className={`h-auto max-h-24 w-full object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.35)] [image-rendering:pixelated] ${staff.imageScale}`}
                                        />
                                    </div>

                                    <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">
                                        {staff.title}
                                    </p>

                                    <h3 className={`mt-3 text-3xl font-black uppercase ${staff.accent}`}>
                                        {staff.rank}
                                    </h3>

                                    <p className="mt-3 text-sm font-bold text-gray-300">{staff.role}</p>

                                    <div className="my-6 h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-yellow-300" />

                                    <div className="mt-auto w-full rounded-2xl border border-white/10 bg-black/35 p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                                            Current Holder
                                        </p>

                                        <p
                                            className={`mt-2 font-black ${isOpen ? "text-yellow-300" : "text-white"
                                                }`}
                                        >
                                            {staff.members}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-3xl border border-blue-500/25 bg-black/45 p-6 text-center backdrop-blur-xl md:flex-row md:text-left">
                    <div>
                        <p className="font-black text-white">Staff applications may open over time.</p>
                        <p className="mt-1 text-sm text-gray-400">
                            Open roles are shown directly in the staff list when positions become available.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 text-yellow-300">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">
                            Trusted Team
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StaffRanks;