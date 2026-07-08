import {
    BadgeDollarSign,
    Gift,
    Globe2,
    MessageCircle,
    Rocket,
    ShieldCheck,
    ShoppingBasket,
    Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../ui/SectionHeader";

const features = [
    {
        icon: Globe2,
        title: "Java + Bedrock Crossplay",
        description:
            "Join Ellipsis SMP from both Java and Bedrock editions with smooth crossplay support.",
    },
    {
        icon: ShieldCheck,
        title: "24/7 Survival",
        description:
            "Play in a persistent survival world built for long-term progression and community activity.",
    },
    {
        icon: BadgeDollarSign,
        title: "Economy System",
        description:
            "Earn, trade, save, and grow through a player-focused in-game economy.",
    },
    {
        icon: ShoppingBasket,
        title: "Player Shops",
        description:
            "Buy, sell, and trade with other players through community-driven shop systems.",
    },
    {
        icon: Rocket,
        title: "Long-Term Progression",
        description:
            "Grind ranks, unlock goals, improve your journey, and keep progressing over time.",
    },
    {
        icon: Sparkles,
        title: "Cosmetic Progression",
        description:
            "Collect cosmetics, unlock upgrades, and make your Ellipsis SMP experience feel unique.",
    },
    {
        icon: Gift,
        title: "Vote Rewards",
        description:
            "Vote daily to support the server and receive useful in-game rewards.",
    },
    {
        icon: MessageCircle,
        title: "Discord Support",
        description:
            "Get help, open tickets, read announcements, and stay connected with the community.",
    },
];

function Features() {
    return (
        <section id="features" className="bg-transparent px-4 py-14 text-white sm:px-6 sm:py-20 md:py-24">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Server Features"
                    title="Core Server Systems"
                    description="A quick look at the practical systems that keep Ellipsis SMP active, fair, and rewarding."
                    tone="blue"
                />

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4, delay: index * 0.04 }}
                                className="group rounded-3xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-2 hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                            >
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 transition group-hover:scale-110">
                                    <Icon className="h-7 w-7" />
                                </div>

                                <h3 className="text-xl font-black">{feature.title}</h3>

                                <p className="mt-3 text-sm leading-6 text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Features;