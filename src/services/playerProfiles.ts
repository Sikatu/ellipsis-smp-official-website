import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type {
  MinecraftPlayerProfile,
  PlayerProfileClaim,
} from "../types/playerProfiles";

function getPlayerKey(minecraftUsername: string) {
  return minecraftUsername.trim().toLowerCase();
}

export async function fetchMinecraftPlayerProfiles(limit = 250) {
  const { data, error } = await supabase
    .from("minecraft_player_profiles")
    .select("*")
    .order("leaderboard_position", { ascending: true, nullsFirst: false })
    .order("leaderboard_score", { ascending: false })
    .limit(limit);

  return { data: (data as MinecraftPlayerProfile[]) || [], error };
}

export async function fetchMinecraftPlayerProfile(minecraftUsername: string) {
  const playerKey = getPlayerKey(minecraftUsername);

  const { data, error } = await supabase
    .from("minecraft_player_profiles")
    .select("*")
    .eq("player_key", playerKey)
    .maybeSingle();

  return { data: (data as MinecraftPlayerProfile | null) || null, error };
}

export async function fetchMyMinecraftProfiles() {
  const { data, error } = await supabase
    .from("minecraft_player_profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  return { data: (data as MinecraftPlayerProfile[]) || [], error };
}

export async function fetchMyPlayerClaims() {
  const { data, error } = await supabase
    .from("player_profile_claims")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as PlayerProfileClaim[]) || [], error };
}

export async function submitPlayerProfileClaim({
  user,
  minecraftUsername,
  discordUsername,
  proofNote,
}: {
  user: User | null;
  minecraftUsername: string;
  discordUsername: string;
  proofNote: string;
}) {
  if (!user) return { error: new Error("You need to sign in first.") };

  const cleanIgn = minecraftUsername.trim();
  if (!cleanIgn) return { error: new Error("Enter your Minecraft username.") };

  const { error } = await supabase.from("player_profile_claims").insert({
    user_id: user.id,
    player_key: getPlayerKey(cleanIgn),
    minecraft_username: cleanIgn,
    discord_username: discordUsername.trim() || null,
    proof_note: proofNote.trim() || null,
    status: "pending",
  });

  return { error };
}

export function getProfileDisplayRank(profile: MinecraftPlayerProfile | null | undefined) {
  return profile?.current_rank?.trim() || "Member";
}

export function getFormattedPlaytime(minutes: number) {
  if (!minutes) return "0h";
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) return `${days}d ${remainingHours}h`;
  return `${hours}h`;
}

export function getPlayerProfileSummary(profiles: MinecraftPlayerProfile[]) {
  const online = profiles.filter((profile) => profile.is_online).length;
  const linked = profiles.filter((profile) => profile.user_id).length;
  const ranked = profiles.filter((profile) => profile.current_rank !== "Member").length;
  const totalBalance = profiles.reduce((total, profile) => total + Number(profile.balance || 0), 0);
  const totalPlaytime = profiles.reduce(
    (total, profile) => total + Number(profile.total_playtime_minutes || 0),
    0,
  );
  const topProfile = [...profiles].sort(
    (a, b) => Number(b.leaderboard_score || 0) - Number(a.leaderboard_score || 0),
  )[0];

  return {
    online,
    linked,
    ranked,
    totalBalance,
    averageBalance: profiles.length > 0 ? Math.round(totalBalance / profiles.length) : 0,
    totalPlaytime,
    averagePlaytime:
      profiles.length > 0 ? Math.round(totalPlaytime / profiles.length) : 0,
    topProfile,
  };
}
