import { motion, useReducedMotion } from "framer-motion";
import { Check, Crown, Package } from "lucide-react";

type RankCardProps = {
    rank: {
        name: string;
        price: string;
        image: string;
        glow: string;
        badge?: string;
        kit: string;
        perks: string[];
    };
};

function RankCard({ rank }: RankCardProps) {
    const shouldReduceMotion = useReducedMotion();
    const isPremium = rank.name === "ASCENDANT";
    const visiblePerks = rank.perks.filter(
        (perk) => perk.trim().toLowerCase() !== "kit"
    );

    return (
        <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.025 }}
            transition={{ duration: 0.25 }}
            className={`relative flex h-full min-h-[640px] flex-col overflow-hidden rounded-[2rem] border bg-black/45 p-6 backdrop-blur-xl ${isPremium
                    ? "border-yellow-400/60 shadow-[0_0_55px_rgba(250,204,21,0.25)]"
                    : "border-purple-500/20 hover:border-purple-400/60"
                }`}
        >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${rank.glow}`} />

            {rank.badge && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                    <Crown className="h-3 w-3" />
                    {rank.badge}
                </div>
            )}

            <div className="relative mb-6 mt-8 flex h-36 items-center justify-center overflow-visible">
                <div className={`absolute h-24 w-56 rounded-full bg-gradient-to-r ${rank.glow} opacity-35 blur-3xl`} />
                <img
                    src={rank.image}
                    alt={`${rank.name} rank logo`}
                    loading="lazy"
                    decoding="async"
                    className="relative z-10 h-auto max-h-28 w-full object-contain [image-rendering:pixelated]"
                />
            </div>

            <div className="flex items-end justify-between gap-4">
                <div>
                    <h3 className="text-3xl font-black">{rank.name}</h3>
                    <p className="mt-1 text-2xl font-black text-yellow-300">
                        {rank.price}
                    </p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-3">
                    <Package className="h-5 w-5 text-purple-300" />
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-purple-500/20 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                    Included Rank Kit
                </p>
                <p className="mt-1 font-black text-white">{rank.kit}</p>
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-left text-sm text-gray-300">
                {visiblePerks.map((perk) => (
                    <li key={perk} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                        <span>{perk}</span>
                    </li>
                ))}
            </ul>

            <a
                href={`/checkout?product=${encodeURIComponent(rank.name)}&price=${encodeURIComponent(rank.price)}&image=${encodeURIComponent(rank.image)}&type=Premium%20Rank`}
                aria-label={`Open Discord ticket for ${rank.name} rank`}
                className="mt-7 block w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-center font-black transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
                Make Payment
            </a>
        </motion.div>
    );
}

export default RankCard;

