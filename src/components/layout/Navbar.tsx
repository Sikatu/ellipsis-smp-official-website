import { AnimatePresence, motion } from "framer-motion";
import { Menu, Server, UserRound, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { discordInviteUrl, discordTicketUrl } from "../../data/links";
import { navigation } from "../../data/navigation";
import { useServerStatus } from "../../hooks/useServerStatus";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const status = useServerStatus();

  const serverLabel = status.loading ? "CHECKING" : status.online ? "ONLINE" : "OFFLINE";
  const playerLabel = status.loading ? "..." : status.online ? `${status.playersOnline}/${status.playersMax}` : "0/0";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
      isActive
        ? "bg-purple-500/20 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.25)]"
        : "text-gray-300 hover:bg-white/10 hover:text-purple-300"
    }`;

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-purple-500/20 bg-[#100018]/85 shadow-[0_10px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:gap-4 lg:px-6">
        <NavLink
          to="/"
          aria-label="Go to Ellipsis SMP home"
          className="flex min-w-0 shrink-0 items-center gap-3"
          onClick={() => setIsOpen(false)}
        >
          <img
            src="/ellipsis-logo-384.webp"
            alt="Ellipsis SMP"
            width="44"
            height="44"
            className="h-10 w-auto object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.9)] sm:h-11"
          />
          <span className="hidden truncate text-base font-black tracking-wide text-white sm:block">
            Ellipsis SMP
          </span>
        </NavLink>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink key={item.label} to={item.href} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 rounded-full border border-purple-400/25 bg-white/[0.07] px-4 py-2 text-xs font-black text-white">
            <span className={`h-2.5 w-2.5 rounded-full ${status.loading ? "bg-yellow-300" : status.online ? "bg-green-400" : "bg-red-400"}`} />
            <span className="tracking-[0.18em] text-purple-200">{serverLabel}</span>
            <span className="h-3 w-px bg-purple-300/25" />
            <span className="text-blue-200">{playerLabel}</span>
            <span className="text-gray-400">players</span>
          </div>

          <a href={discordInviteUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-purple-500/40 px-4 py-2 text-xs font-bold transition hover:bg-purple-500/10">
            Discord
          </a>

          <a href={discordTicketUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-bold transition hover:scale-105">
            Ticket
          </a>

          <NavLink
            to="/account"
            aria-label="Log in to your player account"
            title="Player Account Login"
            className={({ isActive }) =>
              `flex h-9 w-9 items-center justify-center rounded-full border transition ${
                isActive
                  ? "border-purple-300/60 bg-purple-500/20 text-purple-100"
                  : "border-purple-500/40 text-gray-300 hover:bg-white/10 hover:text-purple-300"
              }`
            }
          >
            <UserRound className="h-4 w-4" />
          </NavLink>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 transition hover:bg-white/10 lg:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="border-t border-purple-500/10 bg-black/30 px-3 py-2 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 rounded-full border border-purple-400/20 bg-white/[0.07] px-3 py-2 text-[11px] font-black sm:text-xs">
          <Server className="h-3.5 w-3.5 shrink-0 text-purple-300" />
          <span className={`h-2 w-2 shrink-0 rounded-full ${status.loading ? "bg-yellow-300" : status.online ? "bg-green-400" : "bg-red-400"}`} />
          <span className="tracking-[0.14em] text-purple-200">{serverLabel}</span>
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
            className="max-h-[calc(100vh-96px)] overflow-y-auto border-t border-purple-500/20 bg-black/90 px-4 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-6 sm:py-5 lg:hidden"
          >
            <nav className="grid gap-3 sm:grid-cols-2" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center rounded-xl border px-4 py-3 font-bold transition ${
                      isActive
                        ? "border-purple-300/50 bg-purple-500/20 text-purple-100"
                        : "border-purple-500/20 bg-white/5 text-gray-300 hover:border-purple-400/50 hover:bg-white/10"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <NavLink
                to="/account"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-12 items-center gap-2 rounded-xl border px-4 py-3 font-bold transition ${
                    isActive
                      ? "border-purple-300/50 bg-purple-500/20 text-purple-100"
                      : "border-purple-500/20 bg-white/5 text-gray-300 hover:border-purple-400/50 hover:bg-white/10"
                  }`
                }
              >
                <UserRound className="h-4 w-4" />
                My Account
              </NavLink>

              <a
                href={discordInviteUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl border border-purple-500/40 px-4 py-3 text-center font-bold transition hover:bg-purple-500/10"
              >
                Join Discord
              </a>

              <a
                href={discordTicketUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-center font-bold transition hover:scale-[1.02]"
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
