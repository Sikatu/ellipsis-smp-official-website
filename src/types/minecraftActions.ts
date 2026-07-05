export type MinecraftActionType =
  | "give_rank"
  | "give_coins"
  | "jail"
  | "unjail"
  | "temp_ban";

export type MinecraftActionStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type MinecraftAdminAction = {
  id: string;
  player_key: string;
  minecraft_username: string;
  discord_username: string | null;
  action_type: MinecraftActionType;
  payload: Record<string, unknown>;
  reason: string;
  status: MinecraftActionStatus;
  result_message: string | null;
  created_by: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
};
