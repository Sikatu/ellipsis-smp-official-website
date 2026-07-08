import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  LogOut,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import PageShell from "./PageShell";
import StatCard from "../components/ui/StatCard";
import { rankDetails } from "./checkout/checkoutData";
import {
  fetchMyMinecraftProfile,
  fetchMyOrders,
  getCurrentPortalUser,
  requestMinecraftProfileClaim,
  signInPlayerAccount,
  signOutPlayerAccount,
  signUpPlayerAccount,
  type MinecraftProfileClaim,
  type PlayerOrder,
  type PlayerPortalProfile,
} from "../services/playerProfilePortal";

type AuthMode = "login" | "signup";

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString();
}

function formatShortDate(value: string | null) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getRelativeTime(value: string | null) {
  if (!value) return null;

  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getKillDeathRatio(kills: number | null, deaths: number | null) {
  const safeKills = kills ?? 0;
  const safeDeaths = deaths ?? 0;
  if (!safeDeaths) return safeKills;
  return Number((safeKills / safeDeaths).toFixed(2));
}

const orderStatusMeta: Record<
  PlayerOrder["status"],
  { label: string; tone: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "Pending",
    tone: "text-[#fbbf24] bg-[rgba(251,191,36,0.14)] border-[rgba(251,191,36,0.25)]",
    icon: Clock3,
  },
  verified: {
    label: "Verified",
    tone: "text-[#60a5fa] bg-[rgba(96,165,250,0.14)] border-[rgba(96,165,250,0.25)]",
    icon: ShieldCheck,
  },
  delivered: {
    label: "Delivered",
    tone: "text-[#34d399] bg-[rgba(52,211,153,0.14)] border-[rgba(52,211,153,0.25)]",
    icon: PackageCheck,
  },
  rejected: {
    label: "Needs Review",
    tone: "text-[#f87171] bg-[rgba(248,113,113,0.14)] border-[rgba(248,113,113,0.25)]",
    icon: AlertTriangle,
  },
};

function OrderHistoryPanel() {
  const [orders, setOrders] = useState<PlayerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const result = await fetchMyOrders();
      if (!isMounted) return;

      setOrders(result.data);
      setError(result.error?.message || "");
      setIsLoading(false);
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-extrabold text-white">Order history</p>
        <Link
          to="/track"
          className="text-xs font-bold text-[#c4b5fd] transition hover:text-[#e9d5ff]"
        >
          Track an order &rarr;
        </Link>
      </div>

      {isLoading && (
        <p className="mt-4 text-[13px] text-[#6b7192]">Loading your orders...</p>
      )}

      {!isLoading && error && (
        <p className="mt-4 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] p-4 text-[13px] text-[#fca5a5]">
          {error}
        </p>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <p className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-6 text-center text-[13px] text-[#6b7192]">
          No orders yet. Purchases made under your linked Minecraft username
          will show up here automatically.
        </p>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="mt-3.5 grid gap-2.5">
          {orders.map((order) => {
            const meta = orderStatusMeta[order.status] || orderStatusMeta.pending;

            return (
              <div
                key={order.payment_reference}
                className="flex items-center justify-between gap-3 rounded-[11px] border border-white/[0.07] bg-black/25 p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-white">
                    {order.product_name}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-[#6b7192]">
                    {order.payment_reference} &middot; {formatShortDate(order.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="text-[13px] font-bold text-[#fde047]">
                    {order.product_price}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.tone}`}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NextRankPanel({ currentRank }: { currentRank: string | null }) {
  const currentIndex = rankDetails.findIndex(
    (rank) => rank.name.toLowerCase() === (currentRank || "").trim().toLowerCase()
  );
  const isTopTier = currentIndex === rankDetails.length - 1;
  const nextRank = currentIndex >= 0 ? rankDetails[currentIndex + 1] : rankDetails[0];
  const topTierPerkCount = rankDetails[rankDetails.length - 1].includes.length;
  const perksUnlocked = currentIndex >= 0 ? rankDetails[currentIndex].includes.length : 0;
  const progressPercent = Math.min(100, Math.round((perksUnlocked / topTierPerkCount) * 100));

  const description = isTopTier
    ? `You're on the top tier -- ${rankDetails[currentIndex].name} unlocks unlimited fly & ${perksUnlocked} perks.`
    : nextRank
      ? `Upgrade to ${nextRank.name} (${nextRank.price}) to unlock ${nextRank.includes.length} perks.`
      : "Purchase a rank to start unlocking perks.";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div>
        <p className="text-[13px] font-extrabold text-white">Next rank</p>
        <p className="mt-1.5 text-xs leading-6 text-[#9aa0b8]">{description}</p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] font-bold text-[#9aa0b8]">
          <span>Perks unlocked</span>
          <span>
            {perksUnlocked} / {topTierPerkCount}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#fbbf24] to-[#f0abfc]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function HeadlineStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "yellow";
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8b91ad]">{label}</p>
      <p className={`mt-1 text-[22px] font-black leading-none ${tone === "yellow" ? "text-[#fde047]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function ProfileHero({ profile }: { profile: PlayerPortalProfile }) {
  const [skinFailed, setSkinFailed] = useState(false);
  const skinUrl =
    profile.minecraft_uuid && !skinFailed
      ? `https://crafatar.com/renders/body/${profile.minecraft_uuid}?scale=6&overlay`
      : null;
  const syncedAgo = getRelativeTime(profile.last_synced_at);

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-[22px] rounded-2xl border border-white/[0.09] bg-[linear-gradient(120deg,rgba(168,85,247,0.12),rgba(37,99,235,0.06))] p-[18px] sm:p-[22px]">
      <div className="flex h-[150px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/25 sm:w-[118px]">
        {skinUrl ? (
          <img
            src={skinUrl}
            alt={`${profile.minecraft_username}'s Minecraft skin`}
            loading="lazy"
            className="h-full w-full object-contain"
            onError={() => setSkinFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 border border-dashed border-[rgba(196,181,253,0.35)] p-2 text-center"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(255,255,255,.05), rgba(255,255,255,.05) 8px, rgba(255,255,255,.02) 8px, rgba(255,255,255,.02) 16px)",
            }}
          >
            <UserRound className="h-6 w-6 text-[#c4b5fd]" />
            <span className="font-mono text-[9px] leading-tight text-[#c4b5fd]">
              Not synced yet
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="break-words text-[26px] font-black leading-tight sm:text-[34px]">
            {profile.minecraft_username}
          </h2>
          {profile.current_rank && (
            <span className="rounded-full bg-gradient-to-r from-[#fbbf24] to-[#f0abfc] px-[11px] py-1 text-[11px] font-black text-[#1a1204]">
              {profile.current_rank}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.1)] px-[11px] py-1 text-[11px] font-bold text-[#6ee7b7]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#34d399]" />
            {profile.is_online ? "Online now" : "Offline"}
          </span>
        </div>

        <p className="mt-2 text-[13px] text-[#9aa0b8]">
          Linked via <span className="font-mono text-[#c4b5fd]">/ellipsis link</span>
          {syncedAgo && <> &middot; bridge synced {syncedAgo}</>}
        </p>

        <div className="mt-[18px] flex flex-wrap gap-x-[26px] gap-y-3">
          <HeadlineStat label="Playtime" value={profile.playtime_text || "Not synced"} />
          <div className="hidden h-9 w-px bg-white/10 sm:block" />
          <HeadlineStat label="Balance" value={profile.balance_text || "Not synced"} tone="yellow" />
          <div className="hidden h-9 w-px bg-white/10 sm:block" />
          <HeadlineStat label="Votes" value={profile.votes_total ?? 0} />
        </div>
      </div>
    </div>
  );
}

function AuthPanel({
  mode,
  setMode,
  onAuthed,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onAuthed: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setMessage("");
    setError("");

    if (!email.trim() || password.length < 6) {
      setError("Enter a valid email and a password with at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const result =
      mode === "login"
        ? await signInPlayerAccount({ email, password })
        : await signUpPlayerAccount({ email, password });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup" && !result.session) {
      setMessage(
        "Account created. If email confirmation is required, confirm it and log in -- either way, your Minecraft account isn't linked yet. That happens in-game with a generated code, right after you log in."
      );
      return;
    }

    onAuthed();
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#c4b5fd]">
        <KeyRound className="h-4 w-4" />
        Player Login
      </div>

      <h1 className="text-2xl font-extrabold text-white md:text-[28px]">
        Access your Ellipsis SMP profile.
      </h1>

      <p className="mt-3 text-[13px] leading-6 text-[#9aa0b8]">
        Log in to claim your Minecraft account, view your server progress, and
        prepare your website profile connection.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
            mode === "login"
              ? "border-[rgba(168,85,247,0.4)] bg-[rgba(168,85,247,0.14)] text-white"
              : "border-white/[0.08] bg-black/20 text-[#9aa0b8] hover:border-white/[0.16]"
          }`}
        >
          Log In
        </button>

        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
            mode === "signup"
              ? "border-[rgba(244,114,182,0.4)] bg-[rgba(244,114,182,0.14)] text-white"
              : "border-white/[0.08] bg-black/20 text-[#9aa0b8] hover:border-white/[0.16]"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="mt-6 space-y-3.5">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-white outline-none placeholder:text-[#565d78] focus:border-white/20"
        />

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Password"
          className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-white outline-none placeholder:text-[#565d78] focus:border-white/20"
        />

        {error && (
          <div className="flex gap-3 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] p-4 text-[13px] text-[#fca5a5]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="flex gap-3 rounded-xl border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.08)] p-4 text-[13px] text-[#6ee7b7]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#a855f7] px-5 py-3 font-bold text-[#150829] transition hover:bg-[#9333ea] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Please wait..."
            : mode === "login"
              ? "Log In"
              : "Create Account"}
        </button>
      </div>
    </div>
  );
}

function ClaimPanel({
  onClaimCreated,
}: {
  onClaimCreated: (claim: MinecraftProfileClaim) => void;
}) {
  const [requestedUsername, setRequestedUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateClaim() {
    setError("");
    setIsSubmitting(true);

    const result = await requestMinecraftProfileClaim(requestedUsername);

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error?.message || "Could not create claim code.");
      return;
    }

    onClaimCreated(result.data);
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#f9a8d4]">
        <Link2 className="h-4 w-4" />
        Link Minecraft Account
      </div>

      <h2 className="text-xl font-extrabold text-white">Generate a claim code.</h2>

      <p className="mt-2 text-[13px] leading-6 text-[#9aa0b8]">
        Create a short code, then use it in-game. This proves the website account
        belongs to the real Minecraft player.
      </p>

      <div className="mt-5 space-y-3.5">
        <input
          value={requestedUsername}
          onChange={(event) => setRequestedUsername(event.target.value)}
          placeholder="Optional: Minecraft IGN"
          className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-white outline-none placeholder:text-[#565d78] focus:border-white/20"
        />

        {error && (
          <div className="flex gap-3 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] p-4 text-[13px] text-[#fca5a5]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleCreateClaim}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#f472b6] px-5 py-3 font-bold text-[#1a0714] transition hover:bg-[#ec4899] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Generating..." : "Generate Claim Code"}
        </button>
      </div>
    </div>
  );
}

function ClaimCodeCard({ claim }: { claim: MinecraftProfileClaim }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(claim.claim_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.06)] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6ee7b7]">
            Claim Code
          </p>
          <p className="mt-3 font-mono text-4xl font-black tracking-[0.16em] text-white">
            {claim.claim_code}
          </p>
          <p className="mt-3 text-[13px] text-[#a7f3d0]">
            Expires: {formatDate(claim.expires_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(52,211,153,0.3)] bg-black/20 px-4 py-3 text-sm font-bold text-[#a7f3d0] transition hover:bg-black/30"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
        <p className="text-sm font-bold text-white">Next step in-game:</p>
        <p className="mt-3 rounded-lg bg-black/40 p-4 font-mono text-sm text-[#c4b5fd]">
          /ellipsis link {claim.claim_code}
        </p>
        <p className="mt-3 text-xs leading-6 text-[#6b7192]">
          Run this in-game while online on Ellipsis SMP to finish linking your
          account. Your profile unlocks here automatically once it's confirmed.
        </p>
      </div>
    </div>
  );
}

function ProfilePanel({ profile }: { profile: PlayerPortalProfile }) {
  const [showUuid, setShowUuid] = useState(false);
  const uuidText = profile.minecraft_uuid || "Not available";

  return (
    <div className="space-y-4">
      <ProfileHero profile={profile} />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-2xl border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.08)] p-[22px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#d8b4fe]">
            Leaderboard rank
          </p>
          <p className="mt-2 text-[56px] font-black leading-none">
            {profile.leaderboard_position ? `#${profile.leaderboard_position}` : "—"}
          </p>
          <p className="mt-1.5 text-[13px] text-[#c4c9dc]">
            Score {(profile.leaderboard_score ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard label="K / D" value={getKillDeathRatio(profile.kills, profile.deaths)} />
          <StatCard label="Kills" value={profile.kills ?? 0} />
          <StatCard label="Mob Kills" value={profile.mob_kills ?? 0} />
          <StatCard label="Blocks Broken" value={profile.blocks_broken ?? 0} />
          <StatCard label="Blocks Placed" value={profile.blocks_placed ?? 0} />
          <StatCard label="World" value={profile.active_world || "Unknown"} />
          <StatCard label="First Joined" value={formatShortDate(profile.first_joined_at)} />
          <StatCard label="Last Seen" value={formatShortDate(profile.last_seen_at)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <OrderHistoryPanel />
        <NextRankPanel currentRank={profile.current_rank} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <div className="min-w-0">
          <span className="text-xs font-bold text-[#8b91ad]">Private identifier (UUID)</span>
          <span className="ml-2 break-all font-mono text-xs text-[#c4c9dc]">
            {showUuid ? uuidText : "•••• ••••-••••-••••"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowUuid((value) => !value)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-1.5 text-xs font-bold text-[#c4b5fd] transition hover:bg-white/[0.05]"
        >
          {showUuid ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showUuid ? "Hide" : "Reveal"}
        </button>
      </div>
    </div>
  );
}

export default function PlayerAccountPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerPortalProfile | null>(null);
  const [claim, setClaim] = useState<MinecraftProfileClaim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function loadAccount() {
    setIsLoading(true);
    setNotice("");

    const userResult = await getCurrentPortalUser();
    setUser(userResult.user);

    if (userResult.user) {
      const profileResult = await fetchMyMinecraftProfile();
      setProfile(profileResult.data);

      if (profileResult.error) {
        setNotice(profileResult.error.message);
      }
    } else {
      setProfile(null);
    }

    setIsLoading(false);
  }

  async function handleSignOut() {
    await signOutPlayerAccount();
    setUser(null);
    setProfile(null);
    setClaim(null);
  }

  useEffect(() => {
    void loadAccount();
  }, []);

  const pageSubtitle = useMemo(() => {
    if (!user) return "Log in to claim your Minecraft account.";
    if (profile) return "Your linked Minecraft progress and private profile hub.";
    return "Generate a claim code and link your Minecraft account in-game.";
  }, [profile, user]);

  return (
    <PageShell>
      <section className="bg-[#030014] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#a78bfa]">
                Player Account
              </p>
              <h1 className="mt-2 text-[26px] font-extrabold sm:text-[30px]">
                Your Ellipsis SMP profile
              </h1>
              <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#9aa0b8]">
                {pageSubtitle}
              </p>
            </div>

            {user && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={loadAccount}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-[#c4c9dc] transition hover:bg-white/[0.06]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.06)] px-4 py-2.5 text-sm font-bold text-[#fca5a5] transition hover:bg-[rgba(248,113,113,0.12)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <Sparkles className="mx-auto h-8 w-8 animate-pulse text-[#a78bfa]" />
              <p className="mt-4 font-bold">Loading player portal...</p>
            </div>
          )}

          {!isLoading && !user && (
            <AuthPanel mode={authMode} setMode={setAuthMode} onAuthed={loadAccount} />
          )}

          {!isLoading && user && (
            <div className="space-y-4">
              {notice && (
                <div className="rounded-xl border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.06)] p-4 text-[13px] text-[#fbbf24]">
                  {notice}
                </div>
              )}

              {profile ? (
                <ProfilePanel profile={profile} />
              ) : (
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <ClaimPanel onClaimCreated={setClaim} />
                  {claim ? (
                    <ClaimCodeCard claim={claim} />
                  ) : (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                      <h2 className="text-xl font-extrabold text-white">
                        Secure claim flow
                      </h2>
                      <p className="mt-3 text-[13px] leading-6 text-[#9aa0b8]">
                        Your website account is ready. Generate a claim code,
                        then connect it from inside Minecraft. This protects
                        player profiles from fake IGN claims.
                      </p>

                      <div className="mt-5 space-y-3 text-[13px] text-[#9aa0b8]">
                        <p>1. Generate a claim code.</p>
                        <p>2. Join Ellipsis SMP with your real Minecraft account.</p>
                        <p>3. Run the in-game link command.</p>
                        <p>4. Your profile will unlock on the website.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
