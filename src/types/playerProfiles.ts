export type PlayerClaimStatus = "pending" | "approved" | "rejected";

export type MinecraftPlayerProfile = {
  id: string;
  user_id: string | null;
  player_key: string;
  minecraft_username: string;
  discord_username: string | null;
  current_rank: string;
  rank_weight: number;
  leaderboard_position: number | null;
  leaderboard_score: number;
  balance: number;
  total_playtime_minutes: number;
  votes: number;
  kills: number;
  deaths: number;
  mob_kills: number;
  blocks_broken: number;
  blocks_placed: number;
  is_online: boolean;
  first_joined_at: string | null;
  last_seen_at: string | null;
  last_synced_at: string | null;
  location_summary: string | null;
  active_world: string | null;
  achievements: Record<string, unknown>;
  progression: Record<string, unknown>;
  economy: Record<string, unknown>;
  raw_stats: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PlayerProfileClaim = {
  id: string;
  user_id: string;
  player_key: string;
  minecraft_username: string;
  discord_username: string | null;
  status: PlayerClaimStatus;
  proof_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerProfileUpsertPayload = Partial<
  Omit<MinecraftPlayerProfile, "id" | "created_at" | "updated_at">
> & {
  minecraft_username: string;
};
