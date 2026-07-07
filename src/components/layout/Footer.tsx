import {
  Copy,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { discordInviteUrl } from "../../data/links";

const serverAddress = "ellipsismc.com:19213";

function Footer() {
  const [copied, setCopied] = useState(false);

  function copyIp() {
    navigator.clipboard.writeText(serverAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <footer className="relative overflow-hidden border-t border-purple-500/20 bg-[#05000d] px-4 py-12 text-gray-400 sm:px-6 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-purple-500/20 bg-white/[0.05] p-6 shadow-[0_0_70px_rgba(168,85,247,0.16)] backdrop-blur-xl md:p-8">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr_1fr]">
            <div>
              <div className="flex items-center gap-4">
                <img
                  src="/ellipsis-logo-384.webp"
                  alt="Ellipsis SMP"
                  width="384"
                  height="384"
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-auto object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.95)]"
                />

                <div>
                  <p className="bg-gradient-to-r from-yellow-200 via-white to-purple-200 bg-clip-text text-xl font-black tracking-wide text-transparent">
                    ELLIPSIS SMP
                  </p>
                  <p className="text-sm font-bold text-purple-200">
                    Premium Minecraft Survival
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
                The official home of Ellipsis SMP - built for survival,
                progression, community, custom content, and unforgettable
                Minecraft moments.
              </p>

              <button
                type="button"
                onClick={copyIp}
                className="mt-4 flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-black/35 p-3 text-left transition hover:border-purple-300/60 hover:bg-white/[0.08]"
              >
                <span>
                  <span className="block text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                    Server IP
                  </span>
                  <span className="mt-1 block break-all text-sm font-black text-white">
                    {copied ? "Copied!" : serverAddress}
                  </span>
                </span>
                <Copy className="h-5 w-5 text-purple-300" />
              </button>
            </div>

            <div>
              <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white">
                Explore
                <span className="h-px w-6 bg-purple-400/60" />
              </h3>
              <div className="space-y-2.5 text-sm">
                <Link to="/" className="block transition hover:translate-x-1 hover:text-purple-300">Home</Link>
                <Link to="/marketplace" className="block transition hover:translate-x-1 hover:text-purple-300">Marketplace</Link>
                <Link to="/vote" className="block transition hover:translate-x-1 hover:text-purple-300">Vote</Link>
                <Link to="/discord" className="block transition hover:translate-x-1 hover:text-purple-300">Discord</Link>
                <Link to="/about" className="block transition hover:translate-x-1 hover:text-purple-300">About</Link>
                <Link to="/account" className="block transition hover:translate-x-1 hover:text-purple-300">Player Account</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white">
                Community
                <span className="h-px w-6 bg-blue-400/60" />
              </h3>

              <div className="grid gap-2.5">
                <a
                  href={discordInviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-100 transition hover:border-blue-300/50 hover:bg-blue-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Join Discord
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <Link
                  to="/tickets"
                  className="inline-flex items-center justify-between rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-2.5 text-sm font-bold text-purple-100 transition hover:border-purple-300/50 hover:bg-purple-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Get Support
                  </span>
                </Link>

                <Link
                  to="/vote"
                  className="inline-flex items-center justify-between rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-2.5 text-sm font-bold text-yellow-100 transition hover:border-yellow-300/50 hover:bg-yellow-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    Vote for Ellipsis
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Link>

                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-between rounded-2xl border border-pink-500/25 bg-pink-500/10 px-4 py-2.5 text-sm font-bold text-pink-100 transition hover:border-pink-300/50 hover:bg-pink-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Visit Store
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-purple-500/20 pt-5 text-sm md:flex-row md:items-center md:justify-between">
            <p className="text-gray-300">
              Copyright 2026 Ellipsis SMP. Crafted for players.
            </p>

            <p className="text-xs text-gray-500">
              Not affiliated with Mojang Studios or Microsoft.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
