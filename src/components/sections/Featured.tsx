import { motion } from "framer-motion";
import { CalendarDays, Crown, Gift, Newspaper } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";

const featuredItems = [
    {
        icon: Newspaper,
        label: "Latest Update",
        title: "Official Website 3.0",
        description:
            "Ellipsis SMP now has a clearer official hub for joining, server info, store access, voting, Discord, and support.",
    },
    {
        icon: CalendarDays,
        label: "Events",
        title: "Community Events",
        description:
            "Join seasonal events, giveaways, player activities, and server-wide challenges.",
    },
    {
        icon: Crown,
        label: "Featured Rank",
        title: "ASCENDANT",
        description:
            "The most premium Ellipsis SMP rank with top-tier perks, commands, and exclusive access.",
    },
    {
        icon: Gift,
        label: "Rewards",
        title: "Vote Daily",
        description:
            "Support the server by voting daily and earn rewards for your progression.",
    },
];

function Featured() {
    return (
        <section id="featured" className="bg-transparent px-6 py-24 text-white">
            <div className="mx-auto max-w-7xl">
                <SectionTitle
                    label="Featured"
                    title="What's Happening on Ellipsis SMP"
                    description="Stay updated with server highlights, community features, and current promotions."
                    accent="gold"
                />

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {featuredItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 22 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="rounded-3xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-2 hover:border-yellow-400/50 hover:shadow-[0_0_30px_rgba(250,204,21,0.18)]"
                            >
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-purple-600">
                                    <Icon className="h-7 w-7" />
                                </div>

                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-300">
                                    {item.label}
                                </p>

                                <h3 className="mt-3 text-xl font-black">{item.title}</h3>

                                <p className="mt-3 text-sm leading-6 text-gray-400">
                                    {item.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Featured;
