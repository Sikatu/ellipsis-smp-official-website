import { motion, useReducedMotion } from "framer-motion";
import { KeyRound, Sparkles } from "lucide-react";
import { useState } from "react";

type CrateOption = {
    keys: string;
    price: string;
};

type CrateCardProps = {
    crate: {
        name: string;
        image: string;
        options: CrateOption[];
    };
};

function CrateCard({ crate }: CrateCardProps) {
    const shouldReduceMotion = useReducedMotion();
    const [selectedOption, setSelectedOption] = useState(crate.options[0]);

    return (
        <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.025 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden rounded-[2rem] border border-blue-500/25 bg-black/45 p-5 backdrop-blur-xl hover:border-blue-400/60 hover:shadow-[0_0_45px_rgba(59,130,246,0.25)]"
        >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-400" />

            <div className="relative mb-5 overflow-hidden rounded-3xl border border-blue-400/20 bg-white/5">
                <img
                    src={crate.image}
                    alt={`${crate.name} crate preview`}
                    loading="lazy"
                    decoding="async"
                    className="h-52 w-full object-cover transition duration-500 hover:scale-105"
                />
            </div>

            <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-yellow-300">
                <Sparkles className="h-4 w-4" />
                Premium Crate
            </p>

            <h3 className="min-h-16 text-2xl font-black text-blue-200">
                {crate.name}
            </h3>

            <div className="mt-5 grid grid-cols-2 gap-2">
                {crate.options.map((option) => {
                    const isSelected = selectedOption.keys === option.keys;

                    return (
                        <button
                            key={option.keys}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedOption(option)}
                            className={`rounded-xl border px-3 py-2 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-yellow-400/60 ${isSelected
                                    ? "border-yellow-300 bg-yellow-400/15 text-yellow-300"
                                    : "border-blue-500/20 bg-white/5 text-gray-300 hover:bg-white/10"
                                }`}
                        >
                            {option.keys}
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-500/20 bg-white/5 p-4">
                <p className="flex items-center gap-2 text-sm text-gray-400">
                    <KeyRound className="h-4 w-4 text-yellow-300" />
                    Selected Package
                </p>

                <p className="mt-2 text-2xl font-black text-white">
                    {selectedOption.keys}
                </p>

                <p className="mt-1 text-xl font-black text-yellow-300">
                    {selectedOption.price}
                </p>
            </div>

            <a
                href={`/checkout?product=${encodeURIComponent(crate.name)}&price=${encodeURIComponent(selectedOption.price)}`}
                aria-label={`Open Discord ticket for ${crate.name} crate`}
                className="mt-7 block w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-center font-black transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
                Make Payment
            </a>
        </motion.div>
    );
}

export default CrateCard;
