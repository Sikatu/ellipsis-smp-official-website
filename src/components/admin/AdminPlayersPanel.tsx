import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Coins,
  Crown,
  Eye,
  MessageSquare,
  Search,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import type { Order } from "../../types/admin";
import type { MinecraftActionType } from "../../types/minecraftActions";
import type { MinecraftPlayerProfile } from "../../types/playerProfiles";
import {
  fetchMinecraftPlayerProfiles,
  getFormattedPlaytime,
  getPlayerProfileSummary,
} from "../../services/playerProfiles";
import { AdminMinecraftActionModal } from "./AdminMinecraftActionModal";
import { AdminPlayerNotesModal } from "./AdminPlayerNotesModal";
import {
  AdminPlayerProfileModal,
  type AdminPlayerProfile,
} from "./AdminPlayerProfileModal";
import KpiTile from "./KpiTile";

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

function PlayerRow({
  player,
  serverProfile,
  onViewProfile,
  onOpenAction,
  onOpenNotes,
  canManagePlayers,
}: {
  player: AdminPlayerProfile;
  serverProfile: MinecraftPlayerProfile | undefined;
  onViewProfile: () => void;
  onOpenAction: (actionType: MinecraftActionType) => void;
  onOpenNotes: () => void;
  canManagePlayers: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const delivered = player.orders.filter((order) => order.status === "delivered").length;
  const verified = player.orders.filter((order) => order.status === "verified").length;
  const pending = player.orders.filter((order) => order.status === "pending").length;

  return (
    <div className="border-b border-white/[0.05] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3.5 text-left text-[13px] transition hover:bg-white/[0.02] sm:grid-cols-[1.3fr_0.8fr_0.8fr_auto]"
      >
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{player.ign}</p>
          <p className="mt-0.5 truncate text-[11px] text-[#8b91ad]">{player.discord}</p>
        </div>

        <span className="hidden text-[#9aa0b8] sm:block">
          {player.orders.length} order{player.orders.length === 1 ? "" : "s"}
        </span>

        <span className="hidden font-bold text-[#fde047] sm:block">PHP {player.totalSpent}</span>

        <div className="flex items-center justify-end gap-2">
          {pending > 0 && (
            <span className="rounded-full border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.14)] px-2.5 py-1 text-[11px] font-bold text-[#fbbf24]">
              {pending} pending
            </span>
          )}
          <ChevronDown className={`h-4 w-4 shrink-0 text-[#6b7192] transition ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-black/15 p-4 sm:p-5">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <StatCell label="Orders" value={player.orders.length} />
            <StatCell label="Verified" value={verified} tone="blue" />
            <StatCell label="Delivered" value={delivered} tone="emerald" />
          </div>

          {serverProfile && (
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
              <StatCell label="Rank" value={serverProfile.current_rank} icon={<Crown className="h-3.5 w-3.5" />} />
              <StatCell label="Balance" value={serverProfile.balance} icon={<Coins className="h-3.5 w-3.5" />} />
              <StatCell
                label="Leaderboard"
                value={serverProfile.leaderboard_position ? `#${serverProfile.leaderboard_position}` : "N/A"}
                icon={<Trophy className="h-3.5 w-3.5" />}
              />
            </div>
          )}

          <p className="mt-3 text-xs text-[#6b7192]">
            Last order: {new Date(player.latestOrder).toLocaleString()}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onViewProfile}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-bold text-[#c4c9dc] transition hover:bg-white/[0.06] sm:col-span-2"
            >
              <Eye className="h-4 w-4" />
              View Profile
            </button>

            <button
              type="button"
              onClick={() => onOpenAction("give_rank")}
              disabled={!canManagePlayers}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#60a5fa] transition hover:bg-[rgba(96,165,250,0.14)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-white/[0.02] disabled:text-[#565d78]"
              title={canManagePlayers ? "Queue rank action" : "Support role cannot queue Minecraft actions"}
            >
              <BadgeCheck className="h-4 w-4" />
              Give Rank
            </button>

            <button
              type="button"
              onClick={() => onOpenAction("give_coins")}
              disabled={!canManagePlayers}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#fbbf24] transition hover:bg-[rgba(251,191,36,0.14)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-white/[0.02] disabled:text-[#565d78]"
              title={canManagePlayers ? "Queue coin action" : "Support role cannot queue Minecraft actions"}
            >
              <Coins className="h-4 w-4" />
              Give Coins
            </button>

            <button
              type="button"
              onClick={() => onOpenAction("jail")}
              disabled={!canManagePlayers}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#f87171] transition hover:bg-[rgba(248,113,113,0.14)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-white/[0.02] disabled:text-[#565d78]"
              title={canManagePlayers ? "Queue moderation action" : "Support role cannot queue Minecraft actions"}
            >
              <ShieldAlert className="h-4 w-4" />
              Jail / Ban
            </button>

            <button
              type="button"
              onClick={onOpenNotes}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#34d399] transition hover:bg-[rgba(52,211,153,0.14)]"
            >
              <MessageSquare className="h-4 w-4" />
              Player Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPlayersPanel({ orders, canManagePlayers }: AdminPlayersPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedNotesPlayer, setSelectedNotesPlayer] = useState<SelectedNotesPlayer | null>(null);
  const [selectedActionPlayer, setSelectedActionPlayer] = useState<SelectedActionPlayer | null>(null);
  const [selectedProfilePlayer, setSelectedProfilePlayer] = useState<AdminPlayerProfile | null>(null);
  const [serverProfiles, setServerProfiles] = useState<MinecraftPlayerProfile[]>([]);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadServerProfiles() {
      const { data, error } = await fetchMinecraftPlayerProfiles(500);
      if (!isMounted) return;

      if (error) {
        setProfileError(error.message);
      } else {
        setProfileError("");
        setServerProfiles(data);
      }
    }

    void loadServerProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const serverProfileSummary = useMemo(
    () => getPlayerProfileSummary(serverProfiles),
    [serverProfiles],
  );

  const serverProfileMap = useMemo(() => {
    const map = new Map<string, MinecraftPlayerProfile>();
    serverProfiles.forEach((profile) => {
      map.set(profile.player_key, profile);
    });
    return map;
  }, [serverProfiles]);

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
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
          Player Control
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-white">
          Players Dashboard
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#9aa0b8]">
          Order history, synced Minecraft profiles, player controls, notes, and manual
          command-center actions all live here.
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7192]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search players by IGN or Discord..."
            className="w-full rounded-[10px] border border-white/[0.08] bg-black/25 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#565d78] focus:border-white/20"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
              Synced Minecraft Profiles
            </p>
            <h3 className="mt-2 text-lg font-extrabold text-white">
              Server progress database
            </h3>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#9aa0b8]">
              These stats come from the Minecraft bridge once connected. Until then, the
              dashboard still builds player profiles from order history.
            </p>
          </div>

          {profileError && (
            <div className="rounded-[10px] border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#fbbf24]">
              {profileError}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiTile label="Synced Players" value={serverProfiles.length} />
          <KpiTile label="Online" value={serverProfileSummary.online} />
          <KpiTile label="Linked Accounts" value={serverProfileSummary.linked} />
          <KpiTile label="Ranked" value={serverProfileSummary.ranked} />
          <KpiTile label="Avg Playtime" value={getFormattedPlaytime(serverProfileSummary.averagePlaytime)} />
        </div>

        <div className="mt-4 grid gap-2.5 lg:grid-cols-2">
          {serverProfiles.slice(0, 4).map((profile) => (
            <article
              key={profile.id}
              className="rounded-[11px] border border-white/[0.07] bg-black/20 p-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{profile.minecraft_username}</p>
                  <p className="mt-0.5 text-[13px] text-[#8b91ad]">
                    {profile.current_rank} &middot; {getFormattedPlaytime(profile.total_playtime_minutes)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-[#fde047]">
                    {profile.leaderboard_position ? `#${profile.leaderboard_position}` : "Unranked"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6b7192]">Score {profile.leaderboard_score}</p>
                </div>
              </div>
            </article>
          ))}

          {serverProfiles.length === 0 && (
            <div className="rounded-[11px] border border-white/[0.07] bg-black/20 p-6 text-center text-[13px] text-[#6b7192] lg:col-span-2">
              No synced Minecraft profiles yet. The bridge will populate this table.
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <div
          className="hidden gap-3 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#565d78] sm:grid"
          style={{ gridTemplateColumns: "1.3fr 0.8fr 0.8fr auto" }}
        >
          <span>Player</span>
          <span>Orders</span>
          <span>Total Spend</span>
          <span>Status</span>
        </div>

        {filteredPlayers.map((player) => (
          <PlayerRow
            key={player.ign}
            player={player}
            serverProfile={serverProfileMap.get(player.ign.toLowerCase())}
            canManagePlayers={canManagePlayers}
            onViewProfile={() => setSelectedProfilePlayer(player)}
            onOpenAction={(actionType) => openAction(player, actionType)}
            onOpenNotes={() => openNotes(player)}
          />
        ))}

        {filteredPlayers.length === 0 && (
          <div className="p-10 text-center text-[13px] text-[#6b7192]">
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

function StatCell({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  tone?: "blue" | "emerald";
}) {
  const toneClass = tone === "blue" ? "text-[#60a5fa]" : tone === "emerald" ? "text-[#34d399]" : "text-white";

  return (
    <div className="rounded-[10px] border border-white/[0.07] bg-black/20 p-3">
      <p className="flex items-center gap-1.5 text-[11px] text-[#8b91ad]">
        {icon}
        {label}
      </p>
      <p className={`mt-1 font-extrabold ${toneClass}`}>{value}</p>
    </div>
  );
}
