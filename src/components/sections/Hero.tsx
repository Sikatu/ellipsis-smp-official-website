import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Box,
  Copy,
  Crown,
  Heart,
  MessageCircle,
  Sparkles,
  Star,
  Swords,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { discordInviteUrl } from "../../data/links";
import LiveServerPanel from "../ui/LiveServerPanel";

const serverIp = "ellipsismc.com:19213";

const featureCards = [
  {
    icon: Swords,
    title: "Crossplay",
    text: "Play together on Java & Bedrock.",
  },
  {
    icon: Users,
    title: "Active Community",
    text: "Friendly players, active staff, and events.",
  },
  {
    icon: Box,
    title: "Custom Content",
    text: "Custom items, cosmetics, and unique systems.",
  },
  {
    icon: Star,
    title: "Daily Rewards",
    text: "Vote, play, and earn rewards.",
  },
];

const showcaseImages = [
  {
    src: "/images/showcase/spawn.webp",
    label: "Official Spawn",
    caption: "Begin your journey at the heart of Ellipsis.",
  },
  {
    src: "/images/showcase/end.webp",
    label: "Custom End",
    caption: "Explore fantasy-style endgame content.",
  },
  {
    src: "/images/showcase/market.webp",
    label: "Market District",
    caption: "Trade, shop, and build your economy.",
  },
  {
    src: "/images/showcase/nether.webp",
    label: "Nether Realm",
    caption: "Travel through dangerous portal routes.",
  },
  {
    src: "/images/showcase/biome.webp",
    label: "World Exploration",
    caption: "Discover beautiful landscapes and hidden areas.",
  },
];

function Hero() {
  const [copied, setCopied] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setShowcaseIndex((current) => (current + 1) % showcaseImages.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  const currentShowcase = showcaseImages[showcaseIndex];

  function copyServerIp() {
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden px-4 pb-20 pt-28 text-white sm:px-6"
    >
      <div className="absolute inset-0 bg-[#030014]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(168,85,247,0.42),transparent_26%),radial-gradient(circle_at_15%_20%,rgba(168,85,247,0.24),transparent_22%),radial-gradient(circle_at_85%_35%,rgba(37,99,235,0.22),transparent_28%),linear-gradient(180deg,#160022_0%,#050013_45%,#071b56_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.45)),linear-gradient(to_right,rgba(0,0,0,0.55),transparent_35%,transparent_65%,rgba(0,0,0,0.55))]" />

      <motion.div
        className="absolute left-[8%] top-28 h-32 w-32 rounded-full border border-purple-300/40 bg-purple-500/10 shadow-[0_0_80px_rgba(168,85,247,0.5)] blur-[1px]"
        animate={
          shouldReduceMotion
            ? undefined
            : { y: [0, -12, 0], opacity: [0.45, 0.8, 0.45] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mx-auto flex max-w-5xl flex-col items-center text-center"
        >
          <picture>
            <source media="(max-width: 640px)" srcSet="/ellipsis-logo-384.webp" />
            <source media="(max-width: 1024px)" srcSet="/ellipsis-logo-640.webp" />
            <img
              src="/ellipsis-logo-640.webp"
              alt="Ellipsis SMP"
              width="640"
              height="640"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-[300px] object-contain drop-shadow-[0_0_55px_rgba(168,85,247,0.9)] sm:w-[430px] lg:w-[520px]"
            />
          </picture>

          <div className="mt-8 flex w-full items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-purple-400/70" />
            <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-200">
              Crossplay ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Java & Bedrock
            </p>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-purple-400/70" />
          </div>

          <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Adventure. Community.
            <span className="block bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
              Legends.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-200 sm:text-lg">
            A crossplay Minecraft SMP built for adventure, community, custom
            content, cosmetics, and long-term progression.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyServerIp}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-sm font-black text-white shadow-[0_0_35px_rgba(168,85,247,0.45)] transition hover:scale-[1.03]"
            >
              <Box className="h-5 w-5" />
              {copied ? "IP Copied" : "Play Now"}
            </button>

            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-purple-400/40 bg-black/35 px-8 py-4 text-sm font-black text-white backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white/[0.08]"
            >
              <MessageCircle className="h-5 w-5 text-purple-300" />
              Join Discord
            </a>

            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-purple-400/40 bg-black/35 px-8 py-4 text-sm font-black text-white backdrop-blur-xl transition hover:scale-[1.03] hover:bg-white/[0.08]"
            >
              <Heart className="h-5 w-5 text-purple-300" />
              Support Server
            </Link>
          </div>

          <button
            type="button"
            onClick={copyServerIp}
            className="mt-6 flex w-full max-w-xl items-center justify-between gap-4 rounded-2xl border border-purple-400/25 bg-black/35 p-4 text-left shadow-[0_0_35px_rgba(168,85,247,0.14)] backdrop-blur-xl transition hover:border-purple-300/60 hover:bg-white/[0.07]"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                <Box className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                  Server Address
                </span>
                <span className="mt-1 block break-all text-sm font-black text-white">
                  {copied ? "Copied!" : serverIp}
                </span>
              </span>
            </span>
            <Copy className="h-5 w-5 text-purple-300" />
          </button>
        </motion.div>

        <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-[1.75rem] border border-purple-500/20 bg-black/35 p-6 text-center shadow-[0_0_35px_rgba(168,85,247,0.1)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-purple-300/50 hover:bg-white/[0.07]"
              >
                <Icon className="mx-auto h-9 w-9 text-purple-300 drop-shadow-[0_0_18px_rgba(168,85,247,0.75)]" />
                <h3 className="mt-5 text-lg font-black uppercase tracking-wide text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto mt-8 max-w-6xl"
        >
          <div className="grid gap-5 rounded-[2rem] border border-purple-500/20 bg-white/[0.055] p-5 shadow-[0_0_55px_rgba(168,85,247,0.16)] backdrop-blur-xl lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem] border border-purple-500/20 bg-black">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentShowcase.src}
                  src={currentShowcase.src}
                  alt={currentShowcase.label}
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute inset-0 z-0 h-full w-full object-cover opacity-100"
                />
              </AnimatePresence>

              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.2))]" />

              <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-200">
                  {currentShowcase.label}
                </p>
                <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-white">
                  {currentShowcase.caption}
                </p>

                <div className="mt-4 flex gap-2">
                  {showcaseImages.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setShowcaseIndex(index)}
                      aria-label={`Show ${image.label}`}
                      className={`h-1.5 rounded-full transition-all ${
                        showcaseIndex === index
                          ? "w-8 bg-purple-300"
                          : "w-3 bg-white/35 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                  Live Server
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
                </p>

                <span className="rounded-full bg-green-400/15 px-4 py-2 text-xs font-black uppercase text-green-300">
                  Online
                </span>
              </div>

              <LiveServerPanel />
            </div>
          </div>
        </motion.div>

        <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-5 rounded-[2rem] border border-purple-500/25 bg-gradient-to-r from-purple-950/45 via-black/40 to-blue-950/35 p-6 shadow-[0_0_45px_rgba(168,85,247,0.16)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/25 bg-yellow-400/10 shadow-[0_0_28px_rgba(250,204,21,0.22)]">
              <Crown className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                Ready to begin your journey?
              </p>
              <p className="mt-1 text-sm text-gray-300">
                Join the community and build your legend.
              </p>
            </div>
          </div>

          <Link
            to="/discord"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition hover:scale-[1.03]"
          >
            Get Started
            <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;




