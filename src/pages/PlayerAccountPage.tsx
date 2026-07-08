import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  LogOut,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import PageShell from "./PageShell";
import StatCard from "../components/ui/StatCard";
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
    tone: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
    icon: Clock3,
  },
  verified: {
    label: "Verified",
    tone: "border-blue-400/25 bg-blue-500/10 text-blue-100",
    icon: ShieldCheck,
  },
  delivered: {
    label: "Delivered",
    tone: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
    icon: PackageCheck,
  },
  rejected: {
    label: "Needs Review",
    tone: "border-red-400/25 bg-red-500/10 text-red-100",
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
    <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-200">
        <ReceiptText className="h-4 w-4" />
        Order History
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400">Loading your orders...</p>
      )}

      {!isLoading && error && (
        <p className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </p>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
          No orders yet. Purchases made under your linked Minecraft username
          will show up here automatically.
        </p>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="grid gap-3">
          {orders.map((order) => {
            const meta = orderStatusMeta[order.status] || orderStatusMeta.pending;
            const StatusIcon = meta.icon;

            return (
              <div
                key={order.payment_reference}
                className="rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-black text-white">
                      {order.product_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {order.payment_reference}  -  {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-black text-yellow-300">
                      {order.product_price}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${meta.tone}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6 shadow-[0_0_70px_rgba(168,85,247,0.18)] backdrop-blur-xl md:p-8">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-200">
        <KeyRound className="h-4 w-4" />
        Player Login
      </div>

      <h1 className="text-3xl font-black text-white md:text-4xl">
        Access your Ellipsis SMP profile.
      </h1>

      <p className="mt-3 text-sm leading-7 text-gray-300">
        Log in to claim your Minecraft account, view your server progress, and
        prepare your website profile connection.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
            mode === "login"
              ? "border-purple-300/50 bg-purple-400/20 text-white"
              : "border-white/10 bg-black/20 text-gray-300 hover:border-white/20"
          }`}
        >
          Log In
        </button>

        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
            mode === "signup"
              ? "border-pink-300/50 bg-pink-400/20 text-white"
              : "border-white/10 bg-black/20 text-gray-300 hover:border-white/20"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-300/50"
        />

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Password"
          className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-300/50"
        />

        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="flex gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-purple-300 px-5 py-3 font-black text-black transition hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-pink-200">
        <Link2 className="h-4 w-4" />
        Link Minecraft Account
      </div>

      <h2 className="text-2xl font-black text-white">Generate a claim code.</h2>

      <p className="mt-2 text-sm leading-7 text-gray-300">
        Create a short code, then use it in-game. This proves the website account
        belongs to the real Minecraft player.
      </p>

      <div className="mt-5 space-y-4">
        <input
          value={requestedUsername}
          onChange={(event) => setRequestedUsername(event.target.value)}
          placeholder="Optional: Minecraft IGN"
          className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-300/50"
        />

        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleCreateClaim}
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-pink-300 px-5 py-3 font-black text-black transition hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
            Claim Code
          </p>
          <p className="mt-3 font-mono text-4xl font-black tracking-[0.16em] text-white">
            {claim.claim_code}
          </p>
          <p className="mt-3 text-sm text-emerald-100/80">
            Expires: {formatDate(claim.expires_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-black/20 px-4 py-3 text-sm font-black text-emerald-100 transition hover:bg-black/30"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
        <p className="text-sm font-black text-white">Next step in-game:</p>
        <p className="mt-3 rounded-xl bg-black/40 p-4 font-mono text-sm text-purple-100">
          /ellipsis link {claim.claim_code}
        </p>
        <p className="mt-3 text-xs leading-6 text-gray-400">
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
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              Linked Profile
            </div>

            <h2 className="text-3xl font-black text-white">
              {profile.minecraft_username}
            </h2>

            <p className="mt-2 text-sm text-gray-300">
              {profile.is_online ? "Online now" : "Offline"}  -  Linked{" "}
              {formatDate(profile.linked_at)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              Current Rank
            </p>
            <p className="mt-2 text-xl font-black text-white">
              {profile.current_rank || "Not synced yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Balance" value={profile.balance_text || "Not synced"} />
        <StatCard label="Playtime" value={profile.playtime_text || "Not synced"} />
        <StatCard label="Votes" value={profile.votes_total ?? 0} />
        <StatCard
          label="Leaderboard"
          value={profile.leaderboard_position ? `#${profile.leaderboard_position}` : "Unranked"}
        />
        <StatCard label="Score" value={profile.leaderboard_score ?? 0} />
        <StatCard label="Kills" value={profile.kills ?? 0} />
        <StatCard label="K / D" value={getKillDeathRatio(profile.kills, profile.deaths)} />
        <StatCard
          label="Status"
          value={profile.is_online ? "Online" : "Offline"}
          tone={profile.is_online ? "emerald" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderHistoryPanel />

        <div className="space-y-6">
          <InfoPanel title="World Progress">
            <MiniRow label="Blocks Broken" value={profile.blocks_broken ?? 0} />
            <MiniRow label="Blocks Placed" value={profile.blocks_placed ?? 0} />
            <MiniRow label="Mob Kills" value={profile.mob_kills ?? 0} />
            <MiniRow label="Active World" value={profile.active_world || "Unknown"} />
          </InfoPanel>

          <InfoPanel title="Sync Details">
            <MiniRow label="First Joined" value={formatDate(profile.first_joined_at)} />
            <MiniRow label="Last Seen" value={formatDate(profile.last_seen_at)} />
            <MiniRow label="Last Synced" value={profile.last_synced_at ? formatDate(profile.last_synced_at) : "Waiting for bridge"} />
            <MiniRow label="Location" value={profile.location_summary || "Private"} />
          </InfoPanel>
        </div>
      </div>

      <Link
        to="/track"
        className="group flex items-center justify-between gap-4 rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6 transition hover:border-purple-300/50 hover:bg-white/[0.08]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black text-white">Track an order</p>
            <p className="mt-1 text-sm text-gray-400">
              Check the status of a payment claim or delivery.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-purple-300 transition group-hover:translate-x-1" />
      </Link>

      <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              Private Identifier
            </p>
            <p className="mt-2 text-sm text-gray-400">
              UUID is hidden by default for safety.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUuid((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-black/30 px-4 py-3 text-sm font-black text-purple-100 transition hover:bg-white/[0.08]"
          >
            {showUuid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showUuid ? "Hide UUID" : "Reveal UUID"}
          </button>
        </div>

        <p className="mt-5 break-all rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-sm text-gray-200">
          {showUuid ? uuidText : "----"}
        </p>
      </div>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-black text-white">{value}</span>
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
      <section className="relative overflow-hidden bg-[#030014] px-4 py-20 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-200">
                <UserRound className="h-4 w-4" />
                Player Account
              </div>

              <h1 className="text-4xl font-black md:text-6xl">
                Your Ellipsis SMP profile portal.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-300 md:text-base">
                {pageSubtitle}
              </p>
            </div>

            {user && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={loadAccount}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 text-sm font-black transition hover:bg-white/10"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-10 text-center">
              <Sparkles className="mx-auto h-8 w-8 animate-pulse text-purple-300" />
              <p className="mt-4 font-black">Loading player portal...</p>
            </div>
          )}

          {!isLoading && !user && (
            <AuthPanel mode={authMode} setMode={setAuthMode} onAuthed={loadAccount} />
          )}

          {!isLoading && user && (
            <div className="space-y-6">
              {notice && (
                <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm text-yellow-100">
                  {notice}
                </div>
              )}

              {profile ? (
                <ProfilePanel profile={profile} />
              ) : (
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <ClaimPanel onClaimCreated={setClaim} />
                  {claim ? (
                    <ClaimCodeCard claim={claim} />
                  ) : (
                    <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.04] p-6">
                      <h2 className="text-2xl font-black text-white">
                        Secure claim flow
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-gray-300">
                        Your website account is ready. Generate a claim code,
                        then connect it from inside Minecraft. This protects
                        player profiles from fake IGN claims.
                      </p>

                      <div className="mt-5 space-y-3 text-sm text-gray-300">
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