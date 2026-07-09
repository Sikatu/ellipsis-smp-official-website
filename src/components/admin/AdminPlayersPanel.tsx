import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  BadgeCheck,
  ChevronDown,
  Clock3,
  Coins,
  Crown,
  Eye,
  Loader2,
  Medal,
  MessageSquare,
  RefreshCcw,
  Search,
  ShieldAlert,
  Skull,
  Swords,
  ThumbsUp,
  Trophy,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { Order } from "../../types/admin";
import type { MinecraftActionType } from "../../types/minecraftActions";
import type { MinecraftPlayerProfile } from "../../types/playerProfiles";
import {
  fetchMinecraftPlayerProfiles,
  getFormattedPlaytime,
  getPlayerProfileSummary,
} from "../../services/playerProfiles";
import { createSyncAllProfilesAction } from "../../services/minecraftActions";
import { getKillDeathRatio, getRankWeight, getRelativeTime } from "../../lib/playerStats";
import { AdminMinecraftActionModal } from "./AdminMinecraftActionModal";
import { AdminPlayerNotesModal } from "./AdminPlayerNotesModal";
import {
  AdminPlayerProfileModal,
  type AdminPlayerProfile,
} from "./AdminPlayerProfileModal";
import KpiTile from "./KpiTile";

type RankingMetric = "leaderboard_score" | "total_playtime_minutes" | "kills" | "votes" | "balance";

const rankingMetrics: Array<{
  key: RankingMetric;
  label: string;
  icon: typeof Trophy;
  format: (profile: MinecraftPlayerProfile) => string;
}> = [
  {
    key: "leaderboard_score",
    label: "Leaderboard",
    icon: Trophy,
    format: (profile) => `${profile.leaderboard_score} pts`,
  },
  {
    key: "total_playtime_minutes",
    label: "Playtime",
    icon: Clock3,
    format: (profile) => getFormattedPlaytime(profile.total_playtime_minutes),
  },
  {
    key: "kills",
    label: "Kills",
    icon: Swords,
    format: (profile) => `${profile.kills} kills`,
  },
  {
    key: "votes",
    label: "Votes",
    icon: ThumbsUp,
    format: (profile) => `${profile.votes} votes`,
  },
  {
    key: "balance",
    label: "Balance",
    icon: Coins,
    format: (profile) => `PHP ${profile.balance}`,
  },
];

type StatsSortKey =
  | "minecraft_username"
  | "current_rank"
  | "balance"
  | "total_playtime_minutes"
  | "kills"
  | "votes"
  | "last_seen_at"
  | "leaderboard_score";

const statsColumns: Array<{ key: StatsSortKey; label: string }> = [
  { key: "minecraft_username", label: "Player" },
  { key: "current_rank", label: "Rank" },
  { key: "leaderboard_score", label: "Score" },
  { key: "balance", label: "Balance" },
  { key: "total_playtime_minutes", label: "Playtime" },
  { key: "kills", label: "K / D" },
  { key: "votes", label: "Votes" },
  { key: "last_seen_at", label: "Last Seen" },
];

function getStatsSortValue(profile: MinecraftPlayerProfile, key: StatsSortKey): number | string {
  switch (key) {
    case "minecraft_username":
      return profile.minecraft_username.toLowerCase();
    case "current_rank":
      return getRankWeight(profile.current_rank);
    case "last_seen_at":
      return profile.last_seen_at ? new Date(profile.last_seen_at).getTime() : 0;
    default:
      return profile[key] ?? 0;
  }
}

function rankBadgeStyle(position: number) {
  if (position === 1) return "border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.12)] text-[#fbbf24]";
  if (position === 2) return "border-[rgba(203,213,225,0.4)] bg-[rgba(203,213,225,0.12)] text-[#cbd5e1]";
  if (position === 3) return "border-[rgba(217,119,6,0.4)] bg-[rgba(217,119,6,0.12)] text-[#d97706]";
  return "border-white/[0.08] bg-black/20 text-[#9aa0b8]";
}

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
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "queuing" | "queued" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>("leaderboard_score");
  const [statsSort, setStatsSort] = useState<{ key: StatsSortKey; direction: "asc" | "desc" }>({
    key: "current_rank",
    direction: "desc",
  });
  const [rankFilter, setRankFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");

  async function loadServerProfiles() {
    setIsLoadingProfiles(true);
    const { data, error } = await fetchMinecraftPlayerProfiles(500);
    setIsLoadingProfiles(false);

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileError("");
      setServerProfiles(data);
    }
  }

  useEffect(() => {
    void loadServerProfiles();
  }, []);

  async function handleSyncAllPlayers() {
    setSyncState("queuing");
    setSyncMessage("");

    const { error, warning } = await createSyncAllProfilesAction();

    if (error) {
      setSyncState("error");
      setSyncMessage(error.message);
      return;
    }

    setSyncState("queued");
    setSyncMessage(warning || "Sync queued. The bridge will resync every known player shortly.");
  }

  function toggleStatsSort(key: StatsSortKey) {
    setStatsSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "desc" ? "asc" : "desc" };
      }
      return { key, direction: "desc" };
    });
  }

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

  const topRankedProfiles = useMemo(() => {
    return [...serverProfiles]
      .sort((a, b) => {
        if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
        return Number(b[rankingMetric] || 0) - Number(a[rankingMetric] || 0);
      })
      .slice(0, 10);
  }, [serverProfiles, rankingMetric]);

  const availableRanks = useMemo(() => {
    const ranks = new Set(serverProfiles.map((profile) => profile.current_rank.trim().toUpperCase()));
    return Array.from(ranks).sort((a, b) => getRankWeight(b) - getRankWeight(a));
  }, [serverProfiles]);

  const sortedStatsProfiles = useMemo(() => {
    const filtered = serverProfiles.filter((profile) => {
      const haystack = `${profile.minecraft_username} ${profile.discord_username || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesRank = rankFilter === "all" || profile.current_rank.trim().toUpperCase() === rankFilter;
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "online") === profile.is_online;

      return matchesSearch && matchesRank && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;

      const aValue = getStatsSortValue(a, statsSort.key);
      const bValue = getStatsSortValue(b, statsSort.key);
      const direction = statsSort.direction === "asc" ? 1 : -1;

      if (typeof aValue === "string" || typeof bValue === "string") {
        return String(aValue).localeCompare(String(bValue)) * direction;
      }

      return (Number(aValue) - Number(bValue)) * direction;
    });
  }, [serverProfiles, search, statsSort, rankFilter, statusFilter]);

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
          Order history, synced Minecraft profiles, top rankings, player controls, notes, and
          manual command-center actions all live here.
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

          <div className="flex shrink-0 flex-col items-end gap-2">
            {profileError && (
              <div className="rounded-[10px] border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#fbbf24]">
                {profileError}
              </div>
            )}

            <button
              type="button"
              onClick={handleSyncAllPlayers}
              disabled={!canManagePlayers || syncState === "queuing"}
              title={canManagePlayers ? "Queue a full resync of every known player" : "Support role cannot queue Minecraft actions"}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] px-4 py-2.5 text-[13px] font-bold text-[#60a5fa] transition hover:bg-[rgba(96,165,250,0.14)] disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-white/[0.02] disabled:text-[#565d78]"
            >
              {syncState === "queuing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Sync All Players
            </button>
          </div>
        </div>

        {syncMessage && (
          <p className={`mt-3 text-[13px] font-semibold ${syncState === "error" ? "text-[#fca5a5]" : "text-[#6ee7b7]"}`}>
            {syncMessage}
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiTile label="Synced Players" value={serverProfiles.length} />
          <KpiTile label="Online" value={serverProfileSummary.online} />
          <KpiTile label="Linked Accounts" value={serverProfileSummary.linked} />
          <KpiTile label="Ranked" value={serverProfileSummary.ranked} />
          <KpiTile label="Avg Playtime" value={getFormattedPlaytime(serverProfileSummary.averagePlaytime)} />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
              Top Rankings
            </p>
            <h3 className="mt-2 text-lg font-extrabold text-white">
              Server leaderboard
            </h3>
          </div>

          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {rankingMetrics.map((metric) => {
              const Icon = metric.icon;
              const isActive = rankingMetric === metric.key;
              return (
                <button
                  key={metric.key}
                  type="button"
                  onClick={() => setRankingMetric(metric.key)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
                    isActive
                      ? "bg-[rgba(168,85,247,0.18)] text-[#e9d5ff]"
                      : "bg-white/[0.03] text-[#9aa0b8] hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {metric.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {topRankedProfiles.map((profile, index) => {
            const position = index + 1;
            const metric = rankingMetrics.find((item) => item.key === rankingMetric)!;

            return (
              <div
                key={profile.id}
                className="flex items-center gap-3 rounded-[11px] border border-white/[0.07] bg-black/20 p-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-extrabold ${rankBadgeStyle(position)}`}
                >
                  {position <= 3 ? <Medal className="h-4 w-4" /> : position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-bold text-white">
                    {profile.is_online ? (
                      <Wifi className="h-3.5 w-3.5 shrink-0 text-[#34d399]" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 shrink-0 text-[#565d78]" />
                    )}
                    {profile.minecraft_username}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#8b91ad]">{profile.current_rank}</p>
                </div>
                <span className="shrink-0 text-[13px] font-bold text-[#fde047]">{metric.format(profile)}</span>
              </div>
            );
          })}

          {topRankedProfiles.length === 0 && (
            <div className="rounded-[11px] border border-white/[0.07] bg-black/20 p-6 text-center text-[13px] text-[#6b7192] sm:col-span-2">
              No synced Minecraft profiles yet. The bridge will populate this table.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b91ad]">
              All Player Stats
            </p>
            <h3 className="mt-2 text-lg font-extrabold text-white">
              Full synced profile table
            </h3>
            <p className="mt-1.5 text-[13px] text-[#8b91ad]">
              Online players are always pinned to the top, ranked by hierarchy by default.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-[8px] bg-white/[0.03] p-1">
              {(["all", "online", "offline"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-[6px] px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                    statusFilter === status
                      ? "bg-[rgba(168,85,247,0.18)] text-[#e9d5ff]"
                      : "text-[#9aa0b8] hover:bg-white/[0.06]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <select
              value={rankFilter}
              onChange={(event) => setRankFilter(event.target.value)}
              className="rounded-[8px] border border-white/[0.08] bg-black/25 px-2.5 py-1.5 text-[11px] font-bold text-[#c4c9dc] outline-none focus:border-white/20"
            >
              <option value="all">All Ranks</option>
              {availableRanks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#565d78]">
                {statsColumns.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleStatsSort(column.key)}
                      className={`inline-flex items-center gap-1 transition hover:text-white ${
                        statsSort.key === column.key ? "text-white" : ""
                      }`}
                    >
                      {column.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedStatsProfiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 font-bold text-white">
                      {profile.is_online ? (
                        <Wifi className="h-3.5 w-3.5 text-[#34d399]" />
                      ) : (
                        <WifiOff className="h-3.5 w-3.5 text-[#565d78]" />
                      )}
                      {profile.minecraft_username}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#c4c9dc]">{profile.current_rank}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#c4c9dc]">
                    {profile.leaderboard_position ? `#${profile.leaderboard_position}` : "Unranked"}
                    <span className="ml-1.5 text-xs text-[#6b7192]">({profile.leaderboard_score})</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#fde047]">PHP {profile.balance}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#c4c9dc]">
                    {getFormattedPlaytime(profile.total_playtime_minutes)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#c4c9dc]">
                    <span className="inline-flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5 text-[#60a5fa]" />
                      {profile.kills}
                      <Skull className="ml-1.5 h-3.5 w-3.5 text-[#f87171]" />
                      {profile.deaths}
                      <span className="ml-1.5 text-xs text-[#6b7192]">
                        ({getKillDeathRatio(profile.kills, profile.deaths)})
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#c4c9dc]">{profile.votes}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[#6b7192]">
                    {getRelativeTime(profile.last_seen_at) || "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedStatsProfiles.length === 0 && (
            <div className="p-6 text-center text-[13px] text-[#6b7192]">
              {isLoadingProfiles
                ? "Loading synced profiles..."
                : serverProfiles.length === 0
                  ? "No synced Minecraft profiles found."
                  : "No players match the current filters."}
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
