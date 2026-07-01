import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { ranks } from "../../data/ranks";
import { crates, furniture, plushies } from "../../data/storeItems";
import CrateCard from "../store/CrateCard";
import FurnitureCard from "../store/FurnitureCard";
import PlushieCard from "../store/PlushieCard";
import RankCard from "../store/RankCard";
import SectionTitle from "../ui/SectionTitle";

type StoreCategory = "Ranks" | "Crates" | "Furniture" | "Plushies";

const categories: StoreCategory[] = ["Ranks", "Crates", "Furniture", "Plushies"];

function Store() {
    const [activeCategory, setActiveCategory] = useState<StoreCategory>("Ranks");
    const shouldReduceMotion = useReducedMotion();

    const activeContent = useMemo(() => {
        if (activeCategory === "Ranks") {
            return (
                <>
                    <div className="mb-8 text-center">
                        <h3 className="text-3xl font-black">Premium Ranks</h3>
                        <p className="mt-2 text-gray-400">
                            Choose a rank, unlock perks, and support Ellipsis SMP.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-14">
                        {ranks.map((rank) => (
                            <div key={rank.name} className="w-full max-w-[360px]">
                                <RankCard rank={rank} />
                            </div>
                        ))}
                    </div>
                </>
            );
        }

        if (activeCategory === "Crates") {
            return (
                <>
                    <div className="mb-8 text-center">
                        <h3 className="text-3xl font-black">Premium Crates</h3>
                        <p className="mt-2 text-gray-400">
                            Select a crate, choose your key bundle, then open a Discord ticket.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {crates.map((crate) => (
                            <CrateCard key={crate.name} crate={crate} />
                        ))}
                    </div>
                </>
            );
        }

        if (activeCategory === "Furniture") {
            return (
                <>
                    <div className="mb-8 text-center">
                        <h3 className="text-3xl font-black">Furniture Packs</h3>
                        <p className="mt-2 text-gray-400">
                            Browse themed furniture packs for builds, bases, and decoration.
                        </p>
                    </div>

                    <FurnitureCard furniture={furniture} />
                </>
            );
        }

        return (
            <>
                <div className="mb-8 text-center">
                    <h3 className="text-3xl font-black">Collectible Plushies</h3>
                    <p className="mt-2 text-gray-400">
                        Add cute collectible decorations to your home or display area.
                    </p>
                </div>

                <PlushieCard plushies={plushies} />
            </>
        );
    }, [activeCategory]);

    return (
        <section id="store" className="bg-transparent px-6 py-24 text-white">
            <div className="mx-auto max-w-7xl">
                <SectionTitle
                    label="Support the Server"
                    title="Support Ellipsis SMP"
                    description="Ranks, crates, cosmetics, furniture, and plushies are optional ways to support the server and enhance your journey."
                    accent="purple"
                />

                <div
                    className="mb-12 flex flex-wrap justify-center gap-3"
                    role="tablist"
                    aria-label="Store categories"
                >
                    {categories.map((category) => {
                        const isActive = activeCategory === category;

                        return (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`store-panel-${category.toLowerCase()}`}
                                onClick={() => setActiveCategory(category)}
                                className={`rounded-full px-6 py-3 font-bold transition-all duration-300 ${isActive
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)]"
                                        : "border border-purple-500/30 bg-white/5 text-gray-300 hover:border-purple-400/60 hover:bg-white/10"
                                    }`}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>

                <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-center text-sm text-yellow-200">
                    Please join the Discord server first before opening a ticket. Ticket
                    links only work after you are inside the Ellipsis SMP Discord.
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        id={`store-panel-${activeCategory.toLowerCase()}`}
                        role="tabpanel"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        {activeContent}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}

export default Store;