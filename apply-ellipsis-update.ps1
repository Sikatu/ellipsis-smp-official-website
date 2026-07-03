# Ellipsis SMP website restructure + checkout polish patch
# Run this from the project root folder (same folder as package.json).
$ErrorActionPreference = 'Stop'

$path = Join-Path $PWD 'src\\data\\navigation.ts'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
export const navigation = [
    { label: "Home", href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Vote", href: "/vote" },
    { label: "Discord", href: "/discord" },
    { label: "About", href: "/about" },
];

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/data/navigation.ts'

$path = Join-Path $PWD 'src\\App.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import BackgroundGlow from "./components/ui/BackgroundGlow";
import ScrollProgressBar from "./components/ui/ScrollProgressBar";
import ScrollToTop from "./components/ui/ScrollToTop";

const OfficialVideo = lazy(() => import("./components/sections/OfficialVideo"));
const Featured = lazy(() => import("./components/sections/Featured"));
const GameplayShowcase = lazy(() => import("./components/sections/GameplayShowcase"));
const ServerStats = lazy(() => import("./components/sections/ServerStats"));
const Store = lazy(() => import("./components/sections/Store"));
const Vote = lazy(() => import("./components/sections/Vote"));
const Discord = lazy(() => import("./components/sections/Discord"));
const Footer = lazy(() => import("./components/layout/Footer"));

function LazyOnVisible({
  children,
  minHeight = "360px",
}: {
  children: ReactNode;
  minHeight?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px" }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

function App() {
  return (
    <div className="relative bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <Hero />

      <LazyOnVisible><OfficialVideo /></LazyOnVisible>
      <LazyOnVisible><Featured /></LazyOnVisible>
      <LazyOnVisible><Store /></LazyOnVisible>
      <LazyOnVisible><GameplayShowcase /></LazyOnVisible>
      <LazyOnVisible><Vote /></LazyOnVisible>
      <LazyOnVisible><Discord /></LazyOnVisible>
      <LazyOnVisible><ServerStats /></LazyOnVisible>
      <LazyOnVisible minHeight="220px"><Footer /></LazyOnVisible>

      <ScrollToTop />
    </div>
  );
}

export default App;

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/App.tsx'

$path = Join-Path $PWD 'src\\main.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import AboutPage from "./pages/AboutPage";
import CheckoutPage from "./pages/CheckoutPage";
import DiscordPage from "./pages/DiscordPage";
import MarketplacePage from "./pages/MarketplacePage";
import VotePage from "./pages/VotePage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/discord" element={<DiscordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/main.tsx'

$path = Join-Path $PWD 'src\\components\\layout\\Navbar.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Server, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { discordInviteUrl, discordTicketUrl } from "../../data/links";
import { navigation } from "../../data/navigation";
import { useServerStatus } from "../../hooks/useServerStatus";

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const status = useServerStatus();

    function getLinkClass({ isActive }: { isActive: boolean }) {
        return `whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
            isActive
                ? "bg-purple-500/20 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.25)]"
                : "text-gray-300 hover:bg-white/10 hover:text-purple-300"
        }`;
    }

    const serverLabel = status.loading
        ? "CHECKING"
        : status.online
            ? "ONLINE"
            : "OFFLINE";

    const playerLabel = status.loading
        ? "..."
        : status.online
            ? `${status.playersOnline}/${status.playersMax}`
            : "0/0";

    return (
        <header className="fixed left-0 top-0 z-50 w-full border-b border-purple-500/20 bg-[#100018]/80 shadow-[0_10px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
                <NavLink
                    to="/"
                    aria-label="Go to Ellipsis SMP home"
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
                </NavLink>

                <nav
                    className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex"
                    aria-label="Primary navigation"
                >
                    {navigation.map((item) => (
                        <NavLink key={item.label} to={item.href} className={getLinkClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden shrink-0 items-center gap-3 lg:flex">
                    <div className="flex items-center gap-2 rounded-full border border-purple-400/25 bg-white/[0.07] px-4 py-2 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${
                                status.loading
                                    ? "bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.8)]"
                                    : status.online
                                        ? "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]"
                                        : "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]"
                            }`}
                        />

                        <span className="tracking-[0.18em] text-purple-200">
                            {serverLabel}
                        </span>

                        <span className="h-3 w-px bg-purple-300/25" />

                        <span className="text-blue-200">{playerLabel}</span>

                        <span className="text-gray-400">players</span>
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
                <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 rounded-full border border-purple-400/20 bg-white/[0.07] px-4 py-2 text-xs font-black">
                    <Server className="h-3.5 w-3.5 text-purple-300" />

                    <span
                        className={`h-2 w-2 rounded-full ${
                            status.loading
                                ? "bg-yellow-300"
                                : status.online
                                    ? "bg-green-400"
                                    : "bg-red-400"
                        }`}
                    />

                    <span className="tracking-[0.16em] text-purple-200">
                        {serverLabel}
                    </span>

                    <span className="text-purple-300/40">|</span>

                    <span className="text-blue-200">{playerLabel}</span>

                    <span className="text-gray-400">players</span>
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
                                <NavLink
                                    key={item.label}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `rounded-xl border px-4 py-3 font-bold transition focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
                                            isActive
                                                ? "border-purple-300/60 bg-purple-500/20 text-purple-100"
                                                : "border-purple-500/20 bg-white/5 text-gray-300 hover:border-purple-400/50 hover:bg-white/10"
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
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

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/components/layout/Navbar.tsx'

$path = Join-Path $PWD 'src\\components\\layout\\Footer.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import {
    Code2,
    Copy,
    ExternalLink,
    MessageCircle,
    ShieldCheck,
    Store,
    Vote,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { discordInviteUrl } from "../../data/links";
import { navigation } from "../../data/navigation";

const serverAddress = "ellipsismc.com:19213";

function Footer() {
    const [copied, setCopied] = useState(false);

    function copyIp() {
        navigator.clipboard.writeText(serverAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <footer className="relative overflow-hidden border-t border-purple-900/40 bg-black/70 px-6 py-16 text-gray-400 backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_35%)]" />

            <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.9fr_1fr]">
                <div>
                    <div className="flex items-center gap-3">
                        <img
                            src="/ellipsis-logo.webp"
                            alt="Ellipsis SMP"
                            className="h-14 w-auto object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.9)]"
                        />

                        <div>
                            <p className="font-black text-white">ELLIPSIS SMP</p>
                            <p className="text-sm text-purple-200">Official Website</p>
                        </div>
                    </div>

                    <p className="mt-5 max-w-sm text-sm leading-6">
                        A premium crossplay Minecraft SMP built for survival, community,
                        custom content, cosmetics, and long-term progression.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href={discordInviteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-200 transition hover:border-purple-400/60 hover:bg-purple-500/20"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Discord
                        </a>

                        <Link
                            to="/marketplace"
                            className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-200 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
                        >
                            <Store className="h-4 w-4" />
                            Store
                        </Link>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 font-black text-white">Quick Links</h3>
                    <div className="space-y-2 text-sm">
                        {navigation.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                className="block transition hover:translate-x-1 hover:text-purple-300"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 font-black text-white">Community</h3>
                    <div className="space-y-2 text-sm">
                        <Link
                            to="/discord"
                            className="block transition hover:translate-x-1 hover:text-purple-300"
                        >
                            Discord & Support
                        </Link>
                        <Link
                            to="/about"
                            className="block transition hover:translate-x-1 hover:text-purple-300"
                        >
                            Rules
                        </Link>
                        <Link
                            to="/about"
                            className="block transition hover:translate-x-1 hover:text-blue-300"
                        >
                            Server Features
                        </Link>
                        <Link
                            to="/vote"
                            className="block transition hover:translate-x-1 hover:text-yellow-300"
                        >
                            Vote Rewards
                        </Link>
                    </div>

                    <div className="mt-6 rounded-2xl border border-purple-500/20 bg-white/5 p-4">
                        <p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                            <Code2 className="h-4 w-4" />
                            Powered By
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {["React", "TypeScript", "TailwindCSS", "Framer Motion"].map(
                                (tool) => (
                                    <span
                                        key={tool}
                                        className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200"
                                    >
                                        {tool}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 font-black text-white">Server Address</h3>

                    <button
                        type="button"
                        onClick={copyIp}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-white/5 p-4 text-left transition hover:border-purple-400/60 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(168,85,247,0.18)] focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                    >
                        <span className="break-all text-sm font-black text-purple-200">
                            {copied ? "Copied!" : serverAddress}
                        </span>
                        <Copy className="h-4 w-4 text-purple-300" />
                    </button>

                    <div className="mt-4 grid gap-3">
                        <Link
                            to="/vote"
                            className="inline-flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-200 transition hover:border-yellow-400/50 hover:bg-yellow-500/20"
                        >
                            <span className="inline-flex items-center gap-2">
                                <Vote className="h-4 w-4" />
                                Vote for rewards
                            </span>
                            <ExternalLink className="h-4 w-4" />
                        </Link>

                        <Link
                            to="/discord"
                            className="inline-flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-200 transition hover:border-blue-400/50 hover:bg-blue-500/20"
                        >
                            <span className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Get support
                            </span>
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="relative mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-purple-900/40 pt-6 text-sm md:flex-row md:items-center md:justify-between">
                <p>
                    © 2026 Ellipsis SMP. All purchases support the server through Discord
                    tickets.
                </p>

                <p className="text-xs text-gray-500">
                    Not affiliated with Mojang Studios or Microsoft.
                </p>
            </div>
        </footer>
    );
}

export default Footer;

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/components/layout/Footer.tsx'

$path = Join-Path $PWD 'src\\pages\\MarketplacePage.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Store from "../components/sections/Store";
import BackgroundGlow from "../components/ui/BackgroundGlow";
import ScrollProgressBar from "../components/ui/ScrollProgressBar";
import ScrollToTop from "../components/ui/ScrollToTop";

function MarketplacePage() {
  return (
    <div className="relative bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <main className="pt-24">
        <Store />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default MarketplacePage;

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/pages/MarketplacePage.tsx'

$path = Join-Path $PWD 'src\\pages\\VotePage.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Vote from "../components/sections/Vote";
import BackgroundGlow from "../components/ui/BackgroundGlow";
import ScrollProgressBar from "../components/ui/ScrollProgressBar";
import ScrollToTop from "../components/ui/ScrollToTop";

function VotePage() {
  return (
    <div className="relative bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <main className="pt-24">
        <Vote />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default VotePage;

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/pages/VotePage.tsx'

$path = Join-Path $PWD 'src\\pages\\DiscordPage.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Discord from "../components/sections/Discord";
import BackgroundGlow from "../components/ui/BackgroundGlow";
import ScrollProgressBar from "../components/ui/ScrollProgressBar";
import ScrollToTop from "../components/ui/ScrollToTop";

function DiscordPage() {
  return (
    <div className="relative bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <main className="pt-24">
        <Discord />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default DiscordPage;

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/pages/DiscordPage.tsx'

$path = Join-Path $PWD 'src\\pages\\AboutPage.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import About from "../components/sections/About";
import GameplayShowcase from "../components/sections/GameplayShowcase";
import RankProgression from "../components/sections/RankProgression";
import RulesFAQ from "../components/sections/RulesFAQ";
import Features from "../components/sections/Features";
import StaffRanks from "../components/sections/StaffRanks";
import BackgroundGlow from "../components/ui/BackgroundGlow";
import ScrollProgressBar from "../components/ui/ScrollProgressBar";
import ScrollToTop from "../components/ui/ScrollToTop";

function AboutPage() {
  return (
    <div className="relative bg-[#030014] text-white">
      <ScrollProgressBar />
      <BackgroundGlow />
      <Navbar />
      <main className="pt-24">
        <About />
        <GameplayShowcase />
        <RankProgression />
        <RulesFAQ />
        <Features />
        <StaffRanks />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default AboutPage;

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/pages/AboutPage.tsx'

$path = Join-Path $PWD 'src\\pages\\CheckoutPage.tsx'
$dir = Split-Path $path -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
@'
import { ArrowLeft, Copy, Download, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ranks } from "../data/ranks";
import { crates, furniture, plushies } from "../data/storeItems";

const paymentMethods = [
  {
    id: "GCash",
    label: "GCash",
    qr: "/payment/payment-gcash-qr.jpg",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "GoTyme",
    label: "GoTyme",
    qr: "/payment/payment-gotyme-qr.jpg",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "BPI",
    label: "BPI",
    qr: "/payment/payment-bpi-qr.png",
    color: "from-red-500 to-orange-400",
  },
];

type Category = "Premium Ranks" | "Premium Crates" | "Furnitures" | "Plushies";
type KeyQuantity = "1 key" | "3 keys" | "5 keys" | "10 keys";

const categories: Category[] = [
  "Premium Ranks",
  "Premium Crates",
  "Furnitures",
  "Plushies",
];

const keyQuantities: KeyQuantity[] = ["1 key", "3 keys", "5 keys", "10 keys"];

const rankDetails = [
  {
    name: "NEON",
    price: "PHP 99",
    includes: [
      "NEON Rank Kit",
      "/sethome 3",
      "Player warp 1",
      "Auction slots 2",
      "/workbench",
      "Limited chat color",
      "Ores shop access",
    ],
  },
  {
    name: "AETHER",
    price: "PHP 199",
    includes: [
      "AETHER Rank Kit",
      "/sethome 5",
      "Player warp 2",
      "Auction slots 3",
      "/workbench",
      "/smithingtable",
      "Limited chat color",
      "Ores and Potion shop access",
    ],
  },
  {
    name: "TITAN",
    price: "PHP 299",
    includes: [
      "TITAN Rank Kit",
      "/sethome 7",
      "Player warp 5",
      "Auction slots 4",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "Limited chat color",
      "Ores and Potion shop access",
    ],
  },
  {
    name: "OVERCLOCK",
    price: "PHP 399",
    includes: [
      "OVERCLOCK Rank Kit",
      "/sethome 9",
      "Player warp 8",
      "Auction slots 5",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "/repair hand",
      "/feed",
      "Limited chat color",
      "Ores, Potion, and Redstone shop access",
    ],
  },
  {
    name: "ASCENDANT",
    price: "PHP 499",
    includes: [
      "ASCENDANT Rank Kit",
      "/sethome 12",
      "Player warp 10",
      "Auction slots 6",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "/ender",
      "/repair all",
      "/repair hand",
      "/feed",
      "/heal",
      "All chat colors",
      "All shop access",
      "Unlimited fly",
    ],
  },
];

const allowedReceiptTypes = ["image/png", "image/jpeg", "image/webp"];

function CheckoutPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Premium Ranks");
  const [selectedRank, setSelectedRank] = useState(rankDetails[0].name);
  const [selectedCrate, setSelectedCrate] = useState(crates[0]?.name || "");
  const [selectedKeyQuantity, setSelectedKeyQuantity] =
    useState<KeyQuantity>("1 key");
  const [furnitureSlide, setFurnitureSlide] = useState(0);

  const [method, setMethod] = useState(paymentMethods[0]);
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [copiedRecipient, setCopiedRecipient] = useState(false);
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const receiptPreviewUrl = receiptFile ? URL.createObjectURL(receiptFile) : "";

  const selectedRankDetails =
    rankDetails.find((rank) => rank.name === selectedRank) || rankDetails[0];

  const selectedRankAsset =
    ranks.find((rank) => rank.name === selectedRankDetails.name) || ranks[0];

  const selectedCrateAsset =
    crates.find((crate) => crate.name === selectedCrate) || crates[0];

  const selectedCrateOption =
    selectedCrateAsset?.options.find(
      (option) => option.keys === selectedKeyQuantity
    ) || selectedCrateAsset?.options[0];

  const selectedProduct = useMemo(() => {
    if (selectedCategory === "Premium Ranks") {
      return {
        name: selectedRankDetails.name,
        type: "Premium Rank",
        price: selectedRankDetails.price,
        image: selectedRankAsset.image,
        description: `${selectedRankDetails.name} rank with premium perks, quality-of-life commands, shop access, and exclusive rank benefits.`,
      };
    }

    if (selectedCategory === "Premium Crates") {
      return {
        name: `${selectedCrate} - ${selectedKeyQuantity}`,
        type: "Premium Crate",
        price: selectedCrateOption?.price || "Price not available",
        image: selectedCrateAsset.image,
        description: `Premium crate package with ${selectedKeyQuantity}. Open your selected crate in-game after staff verification and delivery.`,
      };
    }

    if (selectedCategory === "Furnitures") {
      return {
        name: "Ellipsis Coins",
        type: "Furnitures",
        price: "PHP 50 = 10 Ellipsis Coins",
        image: furniture.packs[furnitureSlide]?.image || furniture.packs[0].image,
        description:
          "You will receive Ellipsis Coins and can use them in-game at /warp trades.",
      };
    }

    return {
      name: "Plushie Keys",
      type: "Plushies",
      price: "PHP 50 = 5 Plushie Keys",
      image: plushies.image,
      description:
        "You will receive Plushie Keys and can use them in-game to unlock adorable plushies.",
    };
  }, [
    selectedCategory,
    selectedRankDetails,
    selectedRankAsset,
    selectedCrate,
    selectedKeyQuantity,
    selectedCrateOption,
    selectedCrateAsset,
    furnitureSlide,
  ]);

  const canSubmit = useMemo(() => {
    return (
      minecraftIgn.trim() &&
      discordUsername.trim() &&
      receiptFile &&
      hasConfirmedPayment
    );
  }, [minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment]);

  const submitLabel = useMemo(() => {
    if (status === "sending") return "Submitting...";
    if (!minecraftIgn.trim()) return "Enter Minecraft IGN";
    if (!discordUsername.trim()) return "Enter Discord Username";
    if (!receiptFile) return "Upload Receipt";
    if (!hasConfirmedPayment) return "Confirm Payment Sent";
    return "Submit Payment Claim";
  }, [minecraftIgn, discordUsername, receiptFile, hasConfirmedPayment, status]);

  useEffect(() => {
    if (selectedCategory !== "Furnitures") return;

    const interval = window.setInterval(() => {
      setFurnitureSlide((current) => (current + 1) % furniture.packs.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [selectedCategory]);

  useEffect(() => {
    if (status === "success" || status === "error") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  useEffect(() => {
    if (!receiptPreviewUrl) return;

    return () => URL.revokeObjectURL(receiptPreviewUrl);
  }, [receiptPreviewUrl]);

  function clearReceiptUpload() {
    setReceiptFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setMinecraftIgn("");
    setDiscordUsername("");
    setHasConfirmedPayment(false);
    setOrderId("");
    setSubmitError("");
    setStatus("idle");
    clearReceiptUpload();
  }

  function resetPurchase(category: Category) {
    setSelectedCategory(category);
    setSelectedRank(rankDetails[0].name);
    setSelectedCrate(crates[0]?.name || "");
    setSelectedKeyQuantity("1 key");
    setFurnitureSlide(0);
    resetForm();
  }

  function handleReceiptFile(file: File | null) {
    setFileError("");
    setStatus("idle");

    if (!file) {
      setReceiptFile(null);
      return;
    }

    if (!allowedReceiptTypes.includes(file.type)) {
      clearReceiptUpload();
      setFileError("Receipt must be PNG, JPG, JPEG, or WEBP.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      clearReceiptUpload();
      setFileError("Receipt image must be under 4MB.");
      return;
    }

    setReceiptFile(file);
  }

  function downloadQr() {
    const link = document.createElement("a");
    link.href = method.qr;
    link.download = `${method.label.toLowerCase()}-ellipsis-smp-qr`;
    link.click();
  }

  async function copyRecipientInfo() {
    await navigator.clipboard.writeText(
      "Account name: DG\nAccount number: 09153461734"
    );
    setCopiedRecipient(true);
    setTimeout(() => setCopiedRecipient(false), 1600);
  }

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(String(reader.result).split(",")[1]);
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitClaim() {
    if (!canSubmit || !receiptFile) return;

    setStatus("sending");
    setSubmitError("");
    setOrderId("");

    try {
      const receiptBase64 = await fileToBase64(receiptFile);

      const response = await fetch("/api/payment-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: selectedProduct.name,
          productType: selectedProduct.type,
          productDescription: selectedProduct.description,
          price: selectedProduct.price,
          method: method.label,
          minecraftIgn,
          discordUsername,
          receiptBase64,
          receiptFileName: receiptFile.name,
          receiptMimeType: receiptFile.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || "Failed to submit payment claim."
        );
      }

      const data = await response.json();
      setOrderId(data.orderId || "");
      setStatus("success");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/marketplace"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 shadow-[0_0_60px_rgba(168,85,247,0.18)] backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP
            </p>

            <h1 className="mt-3 text-4xl font-black">Secure Checkout</h1>

            <div className="mt-6 grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-gray-300 sm:grid-cols-4">
              {["Select Payment", "Pay QR", "Submit Claim", "Verification"].map(
                (step, index) => (
                  <div
                    key={step}
                    className={`flex min-h-[58px] items-center justify-center rounded-2xl border px-2 py-3 text-center leading-tight ${
                      index === 0
                        ? "border-purple-300 bg-purple-500/20 text-purple-100 shadow-[0_0_22px_rgba(168,85,247,0.25)]"
                        : index === 3
                          ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                          : "border-purple-500/25 bg-black/30 text-purple-200"
                    }`}
                  >
                    {index + 1}. {step}
                  </div>
                )
              )}
            </div>

            <div className="mt-8 rounded-3xl border border-purple-500/20 bg-black/35 p-5">
              <div className="flex justify-center rounded-3xl border border-purple-500/20 bg-black/50 p-5">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-44 w-full object-contain [image-rendering:pixelated]"
                />
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                Choose Category
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => resetPurchase(category)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                      selectedCategory === category
                        ? "border-purple-300 bg-purple-500/20 text-white"
                        : "border-purple-500/20 bg-black/35 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {selectedCategory === "Premium Ranks" && (
                <div className="mt-5">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                    Choose Rank
                  </label>

                  <select
                    value={selectedRank}
                    onChange={(e) => {
                      setSelectedRank(e.target.value);
                      resetForm();
                    }}
                    className="mt-3 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
                  >
                    {rankDetails.map((rank) => (
                      <option key={rank.name} value={rank.name}>
                        {rank.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCategory === "Premium Crates" && (
                <div className="mt-5">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                    Choose Crate
                  </label>

                  <select
                    value={selectedCrate}
                    onChange={(e) => {
                      setSelectedCrate(e.target.value);
                      setSelectedKeyQuantity("1 key");
                      resetForm();
                    }}
                    className="mt-3 w-full rounded-xl border border-purple-500/25 bg-black/60 px-4 py-3 font-bold text-white outline-none focus:border-purple-300"
                  >
                    {crates.map((crate) => (
                      <option key={crate.name} value={crate.name}>
                        {crate.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {keyQuantities.map((quantity) => (
                      <button
                        key={quantity}
                        type="button"
                        onClick={() => {
                          setSelectedKeyQuantity(quantity);
                          resetForm();
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-black transition ${
                          selectedKeyQuantity === quantity
                            ? "border-blue-300 bg-blue-500/20 text-blue-100"
                            : "border-purple-500/25 bg-black/40 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {quantity}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                {selectedProduct.type}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {selectedProduct.name}
              </h2>

              <p className="mt-3 text-2xl font-black text-yellow-300">
                {selectedProduct.price}
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-300">
                {selectedProduct.description}
              </p>

              {selectedCategory === "Premium Ranks" && (
                <div className="mt-5 rounded-2xl border border-purple-500/25 bg-purple-500/10 p-4 text-sm text-gray-200">
                  <p className="mb-3 font-black text-purple-100">
                    Complete Perks & Inclusions
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {selectedRankDetails.includes.map((item) => (
                      <li key={item} className="rounded-xl bg-black/30 px-3 py-2">
                        • {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-3 font-bold text-yellow-100">
                    This rank lasts for 30 days only.
                  </p>
                </div>
              )}

              {selectedCategory === "Premium Crates" && (
                <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-100">
                  Select your crate, choose a key quantity, then pay the exact
                  updated amount shown above.
                </div>
              )}

              {selectedCategory === "Furnitures" && (
                <p className="mt-4 rounded-xl border border-purple-500/25 bg-purple-500/10 p-3 text-sm text-purple-100">
                  Purchase Ellipsis Coins and use them in-game at /warp trades
                  to choose the furniture you want.
                </p>
              )}

              {selectedCategory === "Plushies" && (
                <p className="mt-4 rounded-xl border border-pink-500/25 bg-pink-500/10 p-3 text-sm text-pink-100">
                  Purchase Plushie Keys and unlock adorable plushies in-game.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-green-400/20 bg-green-400/10 p-5 text-sm text-green-200">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck className="h-5 w-5" />
                Manual Verification
              </div>

              <p className="mt-2 text-green-100/80">
                Pay using the QR, upload your receipt, then staff will verify
                and deliver your item.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-black">Choose Payment Method</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMethod(item);
                    setCopiedRecipient(false);
                  }}
                  className={`rounded-2xl border px-4 py-3 font-black transition ${
                    method.id === item.id
                      ? "border-purple-300 bg-purple-500/20 text-white"
                      : "border-purple-500/20 bg-black/25 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-black via-purple-950/30 to-black p-5">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-purple-500/20 bg-black/40 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                  Selected Method
                </span>
                <span className="font-black text-white">{method.label}</span>
              </div>

              <div
                className={`mb-4 h-1 rounded-full bg-gradient-to-r ${method.color}`}
              />

              <div className="rounded-3xl border border-purple-400/20 bg-black/60 p-4 shadow-[0_0_35px_rgba(168,85,247,0.25)]">
                <img
                  src={method.qr}
                  alt={`${method.label} QR code`}
                  className="mx-auto max-h-[360px] w-full max-w-[360px] rounded-2xl object-contain"
                />
              </div>

              <button
                type="button"
                onClick={downloadQr}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 px-4 py-3 font-bold text-purple-200 hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Save QR
              </button>

              {method.id === "GCash" && (
                <button
                  type="button"
                  onClick={copyRecipientInfo}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 font-bold text-blue-100 hover:bg-blue-500/20"
                >
                  <Copy className="h-4 w-4" />
                  {copiedRecipient ? "Recipient Info Copied" : "Copy Recipient Info"}
                </button>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-purple-500/20 bg-black/40 p-4 text-sm text-gray-300">
              <p className="font-black text-purple-200">
                Payment Instructions
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Open your selected payment app.</li>
                <li>Scan or save the QR code above.</li>
                <li>Send the exact amount shown in the order summary.</li>
                <li>Upload your payment receipt below.</li>
              </ol>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                  Order Review
                </p>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <p>
                    <span className="text-gray-500">Item:</span>{" "}
                    <span className="font-bold text-white">
                      {selectedProduct.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Amount:</span>{" "}
                    <span className="font-bold text-yellow-300">
                      {selectedProduct.price}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Payment:</span>{" "}
                    <span className="font-bold text-purple-200">
                      {method.label}
                    </span>
                  </p>
                </div>
              </div>

              <input
                value={minecraftIgn}
                onChange={(e) => {
                  setMinecraftIgn(e.target.value);
                  setStatus("idle");
                }}
                placeholder="Minecraft IGN"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <input
                value={discordUsername}
                onChange={(e) => {
                  setDiscordUsername(e.target.value);
                  setStatus("idle");
                }}
                placeholder="Discord username"
                className="rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 outline-none focus:border-purple-300"
              />

              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-purple-500/25 bg-black/40 px-4 py-5 font-bold text-purple-200 hover:bg-white/10">
                <Upload className="h-5 w-5" />
                {receiptFile ? receiptFile.name : "Upload payment receipt"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    handleReceiptFile(e.target.files?.[0] || null);
                  }}
                />
              </label>

              {fileError && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                  {fileError}
                </p>
              )}

              {receiptPreviewUrl && (
                <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-4">
                  <p className="mb-3 text-sm font-black text-purple-200">
                    Receipt Preview
                  </p>
                  <img
                    src={receiptPreviewUrl}
                    alt="Uploaded receipt preview"
                    className="max-h-64 w-full rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      clearReceiptUpload();
                      setStatus("idle");
                    }}
                    className="mt-3 w-full rounded-lg border border-red-400/30 px-3 py-2 text-sm font-bold text-red-200 hover:bg-red-400/10"
                  >
                    Remove Receipt
                  </button>
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm text-yellow-100">
                <input
                  type="checkbox"
                  checked={hasConfirmedPayment}
                  onChange={(e) =>
                    setHasConfirmedPayment(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />
                <span>
                  I confirm that I have already sent the payment using the
                  selected QR code.
                </span>
              </label>

              <button
                type="button"
                disabled={!canSubmit || status === "sending"}
                onClick={submitClaim}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitLabel}
              </button>

              <div className="rounded-2xl border border-purple-500/20 bg-black/30 p-4 text-sm text-gray-300">
                <p className="font-black text-purple-200">What happens next?</p>
                <p className="mt-2">
                  Your claim is sent privately to Ellipsis SMP staff. Please
                  keep your receipt until your purchase is verified and
                  delivered.
                </p>
              </div>

              {status === "success" && (
                <div
                  ref={resultRef}
                  className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-green-200"
                >
                  <p className="font-black">Payment claim sent.</p>

                  {orderId && (
                    <p className="mt-2">
                      Order ID:{" "}
                      <span className="font-black text-white">{orderId}</span>
                    </p>
                  )}

                  <p className="mt-2 text-sm text-green-100/80">
                    Do you want to make another purchase?
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-green-400/30 px-3 py-2 text-sm font-bold text-green-100 hover:bg-green-400/10"
                    >
                      Yes, another purchase
                    </button>

                    <Link
                      to="/marketplace"
                      className="rounded-lg border border-purple-400/30 px-3 py-2 text-sm font-bold text-purple-100 hover:bg-purple-400/10"
                    >
                      No, back to Marketplace
                    </Link>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div
                  ref={resultRef}
                  className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200"
                >
                  {submitError || "Something went wrong. Please try again."}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-purple-500/30 bg-black/85 p-3 shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
              Checkout
            </p>
            <p className="max-w-[210px] truncate text-sm font-black text-white">
              {selectedProduct.name}
            </p>
          </div>

          <p className="text-sm font-black text-yellow-300">
            {selectedProduct.price}
          </p>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;

'@ | Set-Content -Path $path -Encoding UTF8 -NoNewline
Write-Host 'Updated src/pages/CheckoutPage.tsx'

Write-Host 'Running build...'
npm run build