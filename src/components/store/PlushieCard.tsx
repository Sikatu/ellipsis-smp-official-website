import { motion, useReducedMotion } from "framer-motion";
import {
    Check,
    Gift,
    Heart,
    KeyRound,
    ShoppingBag,
    Sparkles,
    TriangleAlert,
} from "lucide-react";

type PlushieCardProps = {
    plushies: {
        title: string;
        price: string;
        image: string;
        description: string;
        includes: string[];
        bestFor: string;
        obtain: string;
        important: string;
        reminder: string;
        howToBuy: string;
    };
};

function PlushieCard({ plushies }: PlushieCardProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.025 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-pink-500/25 bg-black/45 p-6 backdrop-blur-xl hover:border-pink-400/60 hover:shadow-[0_0_45px_rgba(236,72,153,0.25)]"
        >
            <div className="overflow-hidden rounded-3xl border border-pink-400/20 bg-white/5">
                <img
                    src={plushies.image}
                    alt={`${plushies.title} plushie preview`}
                    loading="lazy"
                    decoding="async"
                    className="h-[420px] w-full object-cover transition duration-500 hover:scale-105"
                />
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-pink-300">
                <Sparkles className="h-4 w-4" />
                Plushie Megapack
            </p>

            <h3 className="mt-3 text-4xl font-black text-pink-300">
                {plushies.title}
            </h3>

            <p className="mt-2 text-2xl font-black">{plushies.price}</p>

            <p className="mt-5 text-gray-300">{plushies.description}</p>

            <div className="mt-6 rounded-2xl border border-pink-500/20 bg-white/5 p-5">
                <p className="mb-3 flex items-center gap-2 font-black text-pink-300">
                    <Check className="h-5 w-5" />
                    Includes
                </p>

                <ul className="space-y-2 text-sm text-gray-300">
                    {plushies.includes.map((item) => (
                        <li key={item} className="flex gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-pink-300" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6 space-y-4 text-gray-300">
                <p className="flex gap-3">
                    <Heart className="mt-1 h-5 w-5 shrink-0 text-pink-300" />
                    <span>
                        <strong className="text-white">Best for:</strong>{" "}
                        {plushies.bestFor}
                    </span>
                </p>

                <p className="flex gap-3">
                    <KeyRound className="mt-1 h-5 w-5 shrink-0 text-yellow-300" />
                    <span>
                        <strong className="text-white">How to obtain:</strong>{" "}
                        {plushies.obtain}
                    </span>
                </p>

                <p className="flex gap-3 text-purple-300">
                    <Gift className="mt-1 h-5 w-5 shrink-0" />
                    {plushies.reminder}
                </p>

                <p className="flex gap-3 text-sm text-red-300">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    {plushies.important}
                </p>

                <p className="flex gap-3 text-sm text-yellow-200">
                    <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0" />
                    {plushies.howToBuy}
                </p>
            </div>

            <a
                href={`/checkout?product=${encodeURIComponent(plushies.title)}&price=${encodeURIComponent(plushies.price)}&image=${encodeURIComponent(plushies.image)}&type=Collectible%20Plushies`}
                aria-label={`Open Discord ticket for ${plushies.title}`}
                className="mt-7 block w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-4 text-center font-black transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400/60"
            >
                Make Payment
            </a>
        </motion.div>
    );
}

export default PlushieCard;

