import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  BadgeCheck,
  Coins,
  Crown,
  Gamepad2,
  Loader2,
  Lock,
  LogOut,
  Medal,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  fetchMyMinecraftProfiles,
  fetchMyPlayerClaims,
  getFormattedPlaytime,
  getProfileDisplayRank,
  submitPlayerProfileClaim,
} from "../services/playerProfiles";
import type {
  MinecraftPlayerProfile,
  PlayerProfileClaim,
} from "../types/playerProfiles";

type AuthMode = "login" | "register";

function claimStyle(status: PlayerProfileClaim["status"]) {
  if (status === "approved") return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
  if (status === "rejected") return "border-red-400/25 bg-red-500/10 text-red-200";
  return "border-yellow-400/25 bg-yellow-500/10 text-yellow-200";
}

function getWinRatio(kills: number, deaths: number) {
  if (!deaths) return kills;
  return Number((kills / deaths).toFixed(2));
}

export default function PlayerProfilePage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [profiles, setProfiles] = useState<MinecraftPlayerProfile[]>([]);
  const [claims, setClaims] = useState<PlayerProfileClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const activeProfile = profiles[0] || null;

  const profileStats = useMemo(() => {
    if (!activeProfile) {
      return {
        kd: 0,
        playtime: "0h",
        leaderboard: "Unranked",
      };
    }

    return {
      kd: getWinRatio(activeProfile.kills, activeProfile.deaths),
      playtime: getFormattedPlaytime(activeProfile.total_playtime_minutes),
      leaderboard: activeProfile.leaderboard_position
        ? `#${activeProfile.leaderboard_position}`
        : "Unranked",
    };
  }, [activeProfile]);

  async function loadPlayerData() {
    setLoading(true);
    setMessage("");

    const [profilesResult, claimsResult] = await Promise.all([
      fetchMyMinecraftProfiles(),
      fetchMyPlayerClaims(),
    ]);

    if (profilesResult.error) {
      setMessage(profilesResult.error.message);
    } else {
      setProfiles(profilesResult.data);
    }

    if (claimsResult.error) {
      setMessage(claimsResult.error.message);
    } else {
      setClaims(claimsResult.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session) {
        void loadPlayerData();
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void loadPlayerData();
      } else {
        setProfiles([]);
        setClaims([]);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setAuthLoading(true);

    const action =
      authMode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;
    if (error) {
      setMessage(error.message);
    } else if (authMode === "register") {
      setMessage("Account created. Check your email if confirmation is enabled.");
    }

    setAuthLoading(false);
  }

  async function handleClaim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setClaimLoading(true);

    const { error } = await submitPlayerProfileClaim({
      user: session?.user || null,
      minecraftUsername,
      discordUsername,
      proofNote,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMinecraftUsername("");
      setDiscordUsername("");
      setProofNote("");
      setMessage("Profile claim submitted. Staff can approve it from the admin command center.");
      await loadPlayerData();
    }

    setClaimLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <section>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">
              Ellipsis Player Profiles
            </p>
            <h1 className="mt-4 text-4xl font-black sm:text-6xl">
              Your Minecraft life, tracked in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
              Connect your website account to your Minecraft IGN to view rank, leaderboard
              position, balance, playtime, combat stats, votes, purchases, and future rewards.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Feature label="Rank" icon={<Crown className="h-5 w-5" />} />
              <Feature label="Economy" icon={<Coins className="h-5 w-5" />} />
              <Feature label="Progress" icon={<Trophy className="h-5 w-5" />} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 shadow-[0_0_60px_rgba(168,85,247,0.18)]">
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/25 p-1">
              {(["login", "register"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wider transition ${
                    authMode === mode
                      ? "bg-purple-500/25 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-gray-300">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="rounded-2xl border border-purple-500/25 bg-black/35 px-4 py-3 text-white outline-none focus:border-purple-300"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-gray-300">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  minLength={6}
                  className="rounded-2xl border border-purple-500/25 bg-black/35 px-4 py-3 text-white outline-none focus:border-purple-300"
                />
              </label>

              <button
                type="submit"
                disabled={authLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-4 font-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {authMode === "login" ? "Login" : "Create Account"}
              </button>
            </form>

            {message && (
              <div className="mt-4 rounded-2xl border border-yellow-400/25 bg-yellow-500/10 p-4 text-sm font-bold text-yellow-100">
                {message}
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">
              Player Command Profile
            </p>
            <h1 className="mt-3 text-4xl font-black">My Ellipsis Profile</h1>
            <p className="mt-2 text-sm text-gray-400">{session.user.email}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 font-black transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-yellow-400/25 bg-yellow-500/10 p-4 text-sm font-bold text-yellow-100">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading profile...
          </div>
        ) : activeProfile ? (
          <section className="mt-8 grid gap-5">
            <div className="rounded-[2rem] border border-purple-500/25 bg-gradient-to-br from-purple-500/15 via-white/[0.045] to-emerald-500/10 p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                      <UserRound className="h-7 w-7 text-emerald-300" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black">{activeProfile.minecraft_username}</h2>
                      <p className="mt-1 text-sm text-gray-300">
                        {activeProfile.discord_username || "No Discord linked"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-300">
                    Synced from the Minecraft bridge. Stats update when the bridge sends fresh
                    server data into the website.
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-5 py-4 text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-yellow-200">
                    Current Rank
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {getProfileDisplayRank(activeProfile)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileStat label="Leaderboard" value={profileStats.leaderboard} icon={<Medal className="h-5 w-5" />} />
              <ProfileStat label="Score" value={activeProfile.leaderboard_score} icon={<Trophy className="h-5 w-5" />} />
              <ProfileStat label="Balance" value={`$${activeProfile.balance}`} icon={<Coins className="h-5 w-5" />} />
              <ProfileStat label="Playtime" value={profileStats.playtime} icon={<Gamepad2 className="h-5 w-5" />} />
              <ProfileStat label="Votes" value={activeProfile.votes} icon={<Sparkles className="h-5 w-5" />} />
              <ProfileStat label="Kills" value={activeProfile.kills} icon={<ShieldCheck className="h-5 w-5" />} />
              <ProfileStat label="K/D" value={profileStats.kd} icon={<BadgeCheck className="h-5 w-5" />} />
              <ProfileStat
                label="Status"
                value={activeProfile.is_online ? "Online" : "Offline"}
                icon={<UserRound className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <InfoPanel title="World Progress">
                <MiniRow label="Blocks Broken" value={activeProfile.blocks_broken} />
                <MiniRow label="Blocks Placed" value={activeProfile.blocks_placed} />
                <MiniRow label="Mob Kills" value={activeProfile.mob_kills} />
                <MiniRow label="Active World" value={activeProfile.active_world || "Unknown"} />
              </InfoPanel>

              <InfoPanel title="Sync Details">
                <MiniRow label="First Joined" value={activeProfile.first_joined_at ? new Date(activeProfile.first_joined_at).toLocaleString() : "Unknown"} />
                <MiniRow label="Last Seen" value={activeProfile.last_seen_at ? new Date(activeProfile.last_seen_at).toLocaleString() : "Unknown"} />
                <MiniRow label="Last Synced" value={activeProfile.last_synced_at ? new Date(activeProfile.last_synced_at).toLocaleString() : "Waiting for bridge"} />
                <MiniRow label="Location" value={activeProfile.location_summary || "Private"} />
              </InfoPanel>
            </div>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1fr]">
            <div className="rounded-[2rem] border border-purple-500/25 bg-white/[0.05] p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                Claim Profile
              </p>
              <h2 className="mt-3 text-2xl font-black">Connect your Minecraft IGN</h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Submit your IGN so staff can approve it. Once approved and synced, your
                Minecraft rank, balance, playtime, and leaderboard stats will appear here.
              </p>

              <form onSubmit={handleClaim} className="mt-5 grid gap-4">
                <input
                  value={minecraftUsername}
                  onChange={(event) => setMinecraftUsername(event.target.value)}
                  placeholder="Minecraft username"
                  required
                  className="rounded-2xl border border-purple-500/25 bg-black/35 px-4 py-3 text-white outline-none focus:border-purple-300"
                />
                <input
                  value={discordUsername}
                  onChange={(event) => setDiscordUsername(event.target.value)}
                  placeholder="Discord username"
                  className="rounded-2xl border border-purple-500/25 bg-black/35 px-4 py-3 text-white outline-none focus:border-purple-300"
                />
                <textarea
                  value={proofNote}
                  onChange={(event) => setProofNote(event.target.value)}
                  placeholder="Optional proof note for staff"
                  rows={4}
                  className="resize-none rounded-2xl border border-purple-500/25 bg-black/35 px-4 py-3 text-white outline-none focus:border-purple-300"
                />
                <button
                  type="submit"
                  disabled={claimLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-4 font-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {claimLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Claim
                </button>
              </form>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                Claim History
              </p>
              <div className="mt-5 grid gap-3">
                {claims.map((claim) => (
                  <article
                    key={claim.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{claim.minecraft_username}</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {new Date(claim.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${claimStyle(claim.status)}`}>
                        {claim.status}
                      </span>
                    </div>
                  </article>
                ))}

                {claims.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-sm text-gray-400">
                    No profile claims yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Feature({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-purple-500/20 bg-white/[0.045] p-4">
      <div className="text-purple-300">{icon}</div>
      <p className="mt-3 text-sm font-black">{label}</p>
    </div>
  );
}

function ProfileStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-purple-500/20 bg-white/[0.045] p-5">
      <div className="text-purple-300">{icon}</div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
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
