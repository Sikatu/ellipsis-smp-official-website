import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Coins,
  Eye,
  MessageSquare,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import type { Order } from "../../types/admin";
import type { MinecraftActionType } from "../../types/minecraftActions";
import { AdminMinecraftActionModal } from "./AdminMinecraftActionModal";
import { AdminPlayerNotesModal } from "./AdminPlayerNotesModal";
import {
  AdminPlayerProfileModal,
  type AdminPlayerProfile,
} from "./AdminPlayerProfileModal";

type AdminPlayersPanelProps = {
  orders: Order[];
  canManagePlayers: boolean;
};

type SelectedNotesPlayer = {
  ign: string;
  discord: string | null;
};

type SelectedActionPlayer = {
  ign: string;
  discord: string | null;
  actionType: MinecraftActionType;
};

function getNumericPrice(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function normalize(value: string | null | undefined) {
  return value?.trim() || "N/A";
}

function getDiscordValue(player: { discord: string }) {
  return player.discord === "N/A" ? null : player.discord;
}

export function AdminPlayersPanel({ orders, canManagePlayers }: AdminPlayersPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedNotesPlayer, setSelectedNotesPlayer] = useState<SelectedNotesPlayer | null>(null);
  const [selectedActionPlayer, setSelectedActionPlayer] = useState<SelectedActionPlayer | null>(null);
  const [selectedProfilePlayer, setSelectedProfilePlayer] = useState<AdminPlayerProfile | null>(null);

  const players = useMemo(() => {
    const map = new Map<string, AdminPlayerProfile>();

    for (const order of orders) {
      const ign = normalize(order.minecraft_username);
      const key = ign.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          ign,
          discord: normalize(order.discord_username),
          orders: [],
          totalSpent: 0,
          latestOrder: order.created_at,
        });
      }

      const player = map.get(key)!;
      player.orders.push(order);
      player.totalSpent += getNumericPrice(order.product_price);

      if (new Date(order.created_at) > new Date(player.latestOrder)) {
        player.latestOrder = order.created_at;
      }

      if (player.discord === "N/A" && order.discord_username) {
        player.discord = order.discord_username;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filteredPlayers = players.filter((player) => {
    const haystack = `${player.ign} ${player.discord}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  function openAction(player: { ign: string; discord: string }, actionType: MinecraftActionType) {
    setSelectedActionPlayer({
      ign: player.ign,
      discord: getDiscordValue(player),
      actionType,
    });
  }

  function openNotes(player: { ign: string; discord: string }) {
    setSelectedNotesPlayer({
      ign: player.ign,
      discord: getDiscordValue(player),
    });
  }

  return (
    <section className="mt-6">
      <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/[0.06] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
          Player Control Foundation
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">
          Players Dashboard
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
          This section builds player control from order history. Open a player profile to review orders,
          Minecraft actions, notes, and quick controls in one place.
        </p>
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-purple-500/20 bg-white/[0.045] p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search players by IGN or Discord..."
            className="w-full rounded-2xl border border-purple-500/20 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-300"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {filteredPlayers.map((player) => {
          const delivered = player.orders.filter((order) => order.status === "delivered").length;
          const verified = player.orders.filter((order) => order.status === "verified").length;
          const pending = player.orders.filter((order) => order.status === "pending").length;

          return (
            <article
              key={player.ign}
              className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-5 shadow-[0_0_30px_rgba(16,185,129,0.08)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-emerald-300" />
                    <h3 className="text-xl font-black text-white">{player.ign}</h3>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-300">
                    <MessageSquare className="h-4 w-4 text-purple-300" />
                    {player.discord}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-200">
                    Total Spend
                  </p>
                  <p className="font-black text-white">PHP {player.totalSpent}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-gray-400">Orders</p>
                  <p className="text-xl font-black text-white">{player.orders.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-gray-400">Verified</p>
                  <p className="text-xl font-black text-blue-200">{verified}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-gray-400">Delivered</p>
                  <p className="text-xl font-black text-emerald-200">{delivered}</p>
                </div>
              </div>

              {pending > 0 && (
                <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm font-bold text-yellow-100">
                  {pending} pending order{pending === 1 ? "" : "s"} still need attention.
                </div>
              )}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfilePlayer(player)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-400/25 bg-purple-500/10 px-4 py-3 text-sm font-black text-purple-100 transition hover:bg-purple-500/20 sm:col-span-2"
                >
                  <Eye className="h-4 w-4" />
                  View Profile
                </button>

                <button
                  type="button"
                  onClick={() => openAction(player, "give_rank")}
                  disabled={!canManagePlayers}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm font-black text-blue-100 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-gray-500"
                  title={canManagePlayers ? "Queue rank action" : "Support role cannot queue Minecraft actions"}
                >
                  <BadgeCheck className="h-4 w-4" />
                  Give Rank
                </button>

                <button
                  type="button"
                  onClick={() => openAction(player, "give_coins")}
                  disabled={!canManagePlayers}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/25 bg-yellow-500/10 px-4 py-3 text-sm font-black text-yellow-100 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-gray-500"
                  title={canManagePlayers ? "Queue coin action" : "Support role cannot queue Minecraft actions"}
                >
                  <Coins className="h-4 w-4" />
                  Give Coins
                </button>

                <button
                  type="button"
                  onClick={() => openAction(player, "jail")}
                  disabled={!canManagePlayers}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-gray-500"
                  title={canManagePlayers ? "Queue moderation action" : "Support role cannot queue Minecraft actions"}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Jail / Ban
                </button>

                <button
                  type="button"
                  onClick={() => openNotes(player)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-500/20"
                >
                  <MessageSquare className="h-4 w-4" />
                  Player Notes
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Last order: {new Date(player.latestOrder).toLocaleString()}
              </p>
            </article>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.02] p-10 text-center text-gray-400 lg:col-span-2">
            No players found.
          </div>
        )}
      </div>

      <AdminPlayerProfileModal
        isOpen={selectedProfilePlayer !== null}
        player={selectedProfilePlayer}
        canManagePlayers={canManagePlayers}
        onClose={() => setSelectedProfilePlayer(null)}
        onOpenNotes={(player) => {
          setSelectedProfilePlayer(null);
          openNotes(player);
        }}
        onOpenAction={(player, actionType) => {
          setSelectedProfilePlayer(null);
          openAction(player, actionType);
        }}
      />

      <AdminPlayerNotesModal
        isOpen={selectedNotesPlayer !== null}
        minecraftUsername={selectedNotesPlayer?.ign || ""}
        discordUsername={selectedNotesPlayer?.discord || null}
        canManagePlayers={canManagePlayers}
        onClose={() => setSelectedNotesPlayer(null)}
      />

      <AdminMinecraftActionModal
        isOpen={selectedActionPlayer !== null}
        minecraftUsername={selectedActionPlayer?.ign || ""}
        discordUsername={selectedActionPlayer?.discord || null}
        initialActionType={selectedActionPlayer?.actionType || "give_rank"}
        canManagePlayers={canManagePlayers}
        onClose={() => setSelectedActionPlayer(null)}
      />
    </section>
  );
}
