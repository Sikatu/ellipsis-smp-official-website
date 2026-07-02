import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Server, Users, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { discordInviteUrl, discordTicketUrl } from "../../data/links";
import { navigation } from "../../data/navigation";
import { useServerStatus } from "../../hooks/useServerStatus";

const primaryLabels = ["Home", "Gameplay", "Progression", "Store", "Vote"];

const primaryLinks = navigation.filter((item) =>
    primaryLabels.includes(item.label)
);

const moreLinks = navigation.filter(
    (item) => !primaryLabels.includes(item.label)
);

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [activeHref, setActiveHref] = useState("#home");
    const status = useServerStatus();

    useEffect(() => {
        function handleScroll() {
            const currentSection = navigation
                .map((item) => document.querySelector(item.href))
                .filter((section): section is Element => section !== null)
                .findLast((section) => {
                    const rect = section.getBoundingClientRect();
                    return rect.top <= 140;
                });

            if (currentSection) {
                setActiveHref(`#${currentSection.id}`);
            }
        }

        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    function getLinkClass(href: string) {
        const isActive = activeHref === href;

        return `whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${isActive
                ? "bg-purple-500/20 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.25)]"
                : "text-gray-300 hover:bg-white/10 hover:text-purple-300"
            }`;
    }

    function getDropdownLinkClass(href: string) {
        const isActive = activeHref === href;

        return `block rounded-xl px-4 py-2 text-sm font-bold transition ${isActive
                ? "bg-purple-500/20 text-purple-200"
                : "text-gray-300 hover:bg-white/10 hover:text-purple-300"
            }`;
    }

    const serverLabel = status.loading
        ? "Checking"
        : status.online
            ? "Online"
            : "Offline";

    const playerLabel = status.loading
        ? "..."
        : status.online
            ? `${status.playersOnline}/${status.playersMax}`
            : "0/0";

    return (
        <header className="fixed left-0 top-0 z-50 w-full border-b border-purple-500/20 bg-[#100018]/80 shadow-[0_10px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
                <a
                    href="#home"
                    aria-label="Go to Ellipsis SMP home section"
                    className="flex shrink-0 items-center gap-3"
                    onClick={() => setIsOpen(false)}
                >
                    <img
                        src="/ellipsis-logo-384.webp"
                        alt="Ellipsis SMP"
                        width="44"
                        height="44"
                        loading="eager"
                        decoding="async"
                        className="h-11 w-auto object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.9)]"
                    />

                    <span className="hidden text-base font-black tracking-wide text-white sm:block">
                        Ellipsis SMP
                    </span>
                </a>

                <nav
                    className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex"
                    aria-label="Primary navigation"
                >
                    {primaryLinks.map((item) => (
                        <a key={item.label} href={item.href} className={getLinkClass(item.href)}>
                            {item.label}
                        </a>
                    ))}

                    <div
                        className="relative"
                        onMouseEnter={() => setIsMoreOpen(true)}
                        onMouseLeave={() => setIsMoreOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setIsMoreOpen((current) => !current)}
                            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-gray-300 transition hover:bg-white/10 hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                            aria-expanded={isMoreOpen}
                        >
                            More
                            <ChevronDown className="h-3.5 w-3.5" />
                        </button>

                        <AnimatePresence>
                            {isMoreOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.16 }}
                                    className="absolute right-0 top-full mt-3 w-44 rounded-2xl border border-purple-500/20 bg-black/90 p-2 shadow-[0_0_35px_rgba(168,85,247,0.22)] backdrop-blur-xl"
                                >
                                    {moreLinks.map((item) => (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setIsMoreOpen(false)}
                                            className={getDropdownLinkClass(item.href)}
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                <div className="hidden shrink-0 items-center gap-3 lg:flex">
                    <div className="flex items-center gap-2 rounded-2xl border border-purple-400/25 bg-white/10 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${status.loading
                                    ? "bg-yellow-300 shadow-[0_0_14px_rgba(250,204,21,0.8)]"
                                    : status.online
                                        ? "bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]"
                                        : "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]"
                                }`}
                        />

                        <div className="leading-none">
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-purple-200">
                                {status.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                {serverLabel}
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-xs font-black text-white">
                                <Users className="h-3.5 w-3.5 text-blue-300" />
                                {playerLabel}
                                <span className="text-gray-400">players</span>
                            </div>
                        </div>
                    </div>

                    <a
                        href={discordInviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-purple-500/40 px-4 py-2 text-xs font-bold transition hover:bg-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                    >
                        Discord
                    </a>

                    <a
                        href={discordTicketUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-bold transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                    >
                        Ticket
                    </a>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen((current) => !current)}
                    className="rounded-xl border border-purple-500/30 p-2 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/60 lg:hidden"
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isOpen}
                    aria-controls="mobile-navigation"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            <div className="border-t border-purple-500/10 bg-black/30 px-4 py-2 lg:hidden">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-purple-400/20 bg-white/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-purple-300" />
                        <span className="text-xs font-black text-white">Live Server</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-black">
                        <span
                            className={`flex items-center gap-1 ${status.loading
                                    ? "text-yellow-300"
                                    : status.online
                                        ? "text-green-300"
                                        : "text-red-300"
                                }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${status.loading
                                        ? "bg-yellow-300"
                                        : status.online
                                            ? "bg-green-400"
                                            : "bg-red-400"
                                    }`}
                            />
                            {serverLabel}
                        </span>

                        <span className="text-blue-200">{playerLabel} players</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="mobile-navigation"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t border-purple-500/20 bg-black/90 px-6 py-5 lg:hidden"
                    >
                        <nav className="grid gap-3 sm:grid-cols-2" aria-label="Mobile navigation">
                            {navigation.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl border border-purple-500/20 bg-white/5 px-4 py-3 font-bold text-gray-300 transition hover:border-purple-400/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                                >
                                    {item.label}
                                </a>
                            ))}

                            <a
                                href={discordInviteUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl border border-purple-500/40 px-4 py-3 text-center font-bold transition hover:bg-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                            >
                                Join Discord
                            </a>

                            <a
                                href={discordTicketUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-center font-bold transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                            >
                                Open Ticket
                            </a>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

export default Navbar;