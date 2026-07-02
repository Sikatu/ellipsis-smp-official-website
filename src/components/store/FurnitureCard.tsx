import { motion, useReducedMotion } from "framer-motion";
import {
    Armchair,
    Check,
    Hammer,
    Info,
    ShoppingBag,
    Sparkles,
    TriangleAlert,
} from "lucide-react";
import { useState } from "react";

type FurniturePack = {
    name: string;
    image: string;
    description: string;
};

type FurnitureCardProps = {
    furniture: {
        title: string;
        price: string;
        description: string;
        includes: string[];
        bestFor: string;
        obtain: string;
        reminder: string;
        disclaimer: string;
        howToBuy: string;
        packs: FurniturePack[];
    };
};

function FurnitureCard({ furniture }: FurnitureCardProps) {
    const shouldReduceMotion = useReducedMotion();
    const [selectedPack, setSelectedPack] = useState(furniture.packs[0]);

    return (
        <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-yellow-500/25 bg-white/5 backdrop-blur"
        >
            <div className="bg-gradient-to-r from-yellow-500/20 via-purple-600/20 to-blue-600/20 p-8">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-yellow-500 to-purple-600 shadow-[0_0_35px_rgba(234,179,8,0.25)]">
                    <Armchair className="h-10 w-10" />
                </div>

                <h3 className="text-4xl font-black text-yellow-300">
                    {furniture.title}
                </h3>
                <p className="mt-2 text-2xl font-black">{furniture.price}</p>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <motion.div
                        key={selectedPack.image}
                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
                        animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden rounded-3xl border border-yellow-500/25 bg-black/30"
                    >
                        <img
                            src={selectedPack.image}
                            alt={`${selectedPack.name} furniture pack preview`}
                            loading="lazy"
                            decoding="async"
                            className="h-[420px] w-full object-cover"
                        />
                    </motion.div>

                    <h4 className="mt-5 text-3xl font-black text-yellow-300">
                        {selectedPack.name}
                    </h4>
                    <p className="mt-2 text-gray-300">{selectedPack.description}</p>
                </div>

                <div>
                    <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-purple-300">
                        Select Furniture Pack
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {furniture.packs.map((pack) => {
                            const isSelected = selectedPack.name === pack.name;

                            return (
                                <button
                                    key={pack.name}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => setSelectedPack(pack)}
                                    className={`overflow-hidden rounded-2xl border text-left transition focus:outline-none focus:ring-2 focus:ring-yellow-400/60 ${isSelected
                                        ? "border-yellow-300 bg-yellow-400/10 shadow-[0_0_25px_rgba(250,204,21,0.2)]"
                                        : "border-purple-500/20 bg-black/30 hover:bg-white/10"
                                        }`}
                                >
                                    <img
                                        src={pack.image}
                                        alt={`${pack.name} furniture thumbnail`}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-28 w-full object-cover"
                                    />

                                    <div className="p-3">
                                        <p className="text-sm font-black">{pack.name}</p>
                                        {isSelected && (
                                            <p className="mt-1 text-xs font-bold text-yellow-300">
                                                Selected
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-5 border-t border-yellow-500/20 p-8 text-gray-300">
                <p className="text-lg leading-8">{furniture.description}</p>

                <div className="rounded-2xl border border-yellow-500/20 bg-black/30 p-5">
                    <p className="mb-3 flex items-center gap-2 font-black text-yellow-300">
                        <Check className="h-5 w-5" />
                        Includes
                    </p>

                    <ul className="grid gap-2 text-sm sm:grid-cols-2">
                        {furniture.includes.map((item) => (
                            <li key={item} className="flex gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="flex gap-3">
                    <Sparkles className="mt-1 h-5 w-5 shrink-0 text-yellow-300" />
                    <span>
                        <strong className="text-white">Best for:</strong>{" "}
                        {furniture.bestFor}
                    </span>
                </p>

                <p className="flex gap-3">
                    <Hammer className="mt-1 h-5 w-5 shrink-0 text-purple-300" />
                    <span>
                        <strong className="text-white">How to obtain:</strong>{" "}
                        {furniture.obtain}
                    </span>
                </p>

                <p className="flex gap-3 text-purple-300">
                    <Info className="mt-1 h-5 w-5 shrink-0" />
                    {furniture.reminder}
                </p>

                <p className="flex gap-3 text-sm text-red-300">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    {furniture.disclaimer}
                </p>

                <p className="flex gap-3 text-sm text-yellow-200">
                    <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0" />
                    {furniture.howToBuy}
                </p>

                <a
                    href={`/checkout?product=${encodeURIComponent(selectedPack.name)}&price=${encodeURIComponent(furniture.price)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open Discord ticket for ${furniture.title}`}
                    className="inline-block rounded-xl bg-gradient-to-r from-yellow-500 to-purple-600 px-8 py-4 text-center font-black transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                >
                    Make Payment
                </a>
            </div>
        </motion.div>
    );
}

export default FurnitureCard;
