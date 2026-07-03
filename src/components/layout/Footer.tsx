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
import { discordInviteUrl, discordTicketUrl } from "../../data/links";

const serverAddress = "ellipsismc.com:19213";

function Footer() {
  const [copied, setCopied] = useState(false);

  function copyIp() {
    navigator.clipboard.writeText(serverAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <footer className="relative overflow-hidden border-t border-purple-500/20 bg-[#05000d] px-4 py-20 text-gray-400 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-[2.5rem] border border-purple-500/20 bg-white/[0.05] p-8 shadow-[0_0_70px_rgba(168,85,247,0.16)] backdrop-blur-xl md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1fr]">
            <div>
              <div className="flex items-center gap-4">
                <img
                  src="/ellipsis-logo.webp"
                  alt="Ellipsis SMP"
                  className="h-16 w-auto object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.95)]"
                />

                <div>
                  <p className="text-xl font-black text-white">ELLIPSIS SMP</p>
                  <p className="text-sm font-bold text-purple-200">
                    Premium Minecraft Survival
                  </p>
                </div>
              </div>

              <p className="mt-6 max-w-md text-sm leading-7 text-gray-300">
                The official home of Ellipsis SMP - built for survival,
                progression, community, custom content, and unforgettable
                Minecraft moments.
              </p>

              <button
                type="button"
                onClick={copyIp}
                className="mt-6 flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-black/35 p-4 text-left transition hover:border-purple-300/60 hover:bg-white/[0.08]"
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
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-white">
                Explore
              </h3>
              <div className="space-y-3 text-sm">
                <Link to="/" className="block transition hover:translate-x-1 hover:text-purple-300">Home</Link>
                <Link to="/marketplace" className="block transition hover:translate-x-1 hover:text-purple-300">Marketplace</Link>
                <Link to="/vote" className="block transition hover:translate-x-1 hover:text-purple-300">Vote</Link>
                <Link to="/discord" className="block transition hover:translate-x-1 hover:text-purple-300">Discord</Link>
                <Link to="/about" className="block transition hover:translate-x-1 hover:text-purple-300">About</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-white">
                Store
              </h3>
              <div className="space-y-3 text-sm">
                <Link to="/marketplace" className="block transition hover:translate-x-1 hover:text-yellow-300">Premium Ranks</Link>
                <Link to="/marketplace" className="block transition hover:translate-x-1 hover:text-yellow-300">Premium Crates</Link>
                <Link to="/marketplace" className="block transition hover:translate-x-1 hover:text-yellow-300">Furnitures</Link>
                <Link to="/marketplace" className="block transition hover:translate-x-1 hover:text-yellow-300">Plushies</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-white">
                Community
              </h3>

              <div className="grid gap-3">
                <a
                  href={discordInviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-100 transition hover:border-blue-300/50 hover:bg-blue-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Join Discord
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <a
                  href={discordTicketUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-100 transition hover:border-purple-300/50 hover:bg-purple-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Get Support
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <Link
                  to="/vote"
                  className="inline-flex items-center justify-between rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-100 transition hover:border-yellow-300/50 hover:bg-yellow-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    Vote for Ellipsis
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Link>

                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-between rounded-2xl border border-pink-500/25 bg-pink-500/10 px-4 py-3 text-sm font-bold text-pink-100 transition hover:border-pink-300/50 hover:bg-pink-500/20"
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

          <div className="mt-10 flex flex-col gap-3 border-t border-purple-500/20 pt-6 text-sm md:flex-row md:items-center md:justify-between">
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