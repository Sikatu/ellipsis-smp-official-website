import { motion, useInView } from "framer-motion";
import {
    Armchair,
    Crown,
    Gem,
    Gift,
    Globe2,
    ShieldCheck,
    Sparkles,
    Vote,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SectionHeader from "../ui/SectionHeader";

const stats = [
    {
        icon: Globe2,
        value: 2,
        suffix: "",
        label: "Supported Editions",
        description: "Java and Bedrock crossplay.",
    },
    {
        icon: Crown,
        value: 6,
        suffix: "",
        label: "Progression Ranks",
        description: "Earnable ranks through gameplay.",
    },
    {
        icon: ShieldCheck,
        value: 7,
        suffix: "",
        label: "Staff Positions",
        description: "A structured team behind the server.",
    },
    {
        icon: Gem,
        value: 5,
        suffix: "",
        label: "Premium Ranks",
        description: "Optional supporter ranks.",
    },
    {
        icon: Gift,
        value: 4,
        suffix: "",
        label: "Premium Crates",
        description: "Themed crate options.",
    },
    {
        icon: Armchair,
        value: 7,
        suffix: "",
        label: "Furniture Packs",
        description: "Decorative packs for builders.",
    },
    {
        icon: Vote,
        value: 5,
        suffix: "",
        label: "Vote Sites",
        description: "Daily voting support.",
    },
    {
        icon: Sparkles,
        value: 100,
        suffix: "+",
        label: "Cosmetic Items",
        description: "Plushies, furniture, and collectibles.",
    },
];

function AnimatedNumber({
    value,
    suffix,
}: {
    value: number;
    suffix: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.4 });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let frame = 0;
        const totalFrames = 45;

        const interval = window.setInterval(() => {
            frame += 1;
            const progress = frame / totalFrames;
            const eased = 1 - Math.pow(1 - progress, 3);

            setDisplayValue(Math.round(value * eased));

            if (frame >= totalFrames) {
                setDisplayValue(value);
                window.clearInterval(interval);
            }
        }, 20);

        return () => window.clearInterval(interval);
    }, [isInView, value]);

    return (
        <span ref={ref}>
            {displayValue}
            {suffix}
        </span>
    );
}

function ServerStats() {
    return (
        <section id="stats" className="relative overflow-hidden px-4 py-14 text-white sm:px-6 sm:py-20 md:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.1),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_35%)]" />

            <div className="relative mx-auto max-w-7xl">
                <SectionHeader
                    eyebrow="Server Snapshot"
                    title="Ellipsis SMP at a Glance"
                    description="A quick look at the systems, progression, staff, and content that make the server feel alive."
                    tone="gold"
                />

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;

                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.4, delay: index * 0.04 }}
                                className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/45 p-6 backdrop-blur-xl transition hover:-translate-y-2 hover:border-yellow-400/50 hover:shadow-[0_0_35px_rgba(250,204,21,0.18)]"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_42%)] opacity-70" />

                                <div className="relative z-10">
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 transition group-hover:scale-110">
                                        <Icon className="h-7 w-7" />
                                    </div>

                                    <p className="text-4xl font-black text-yellow-300">
                                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                                    </p>

                                    <h3 className="mt-3 text-lg font-black text-white">
                                        {stat.label}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-400">
                                        {stat.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default ServerStats;