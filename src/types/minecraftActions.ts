export type MinecraftActionType =
  | "give_rank"
  | "give_coins"
  | "give_crate_key"
  | "give_item"
  | "give_kit"
  | "jail"
  | "unjail"
  | "temp_ban"
  | "unban"
  | "kick"
  | "mute"
  | "unmute"
  | "warn"
  | "whitelist_add"
  | "whitelist_remove"
  | "maintenance_enable"
  | "maintenance_disable"
  | "manual_delivery"
  | "server_broadcast"
  | "title_broadcast"
  | "actionbar_broadcast"
  | "sound_broadcast"
  | "approved_command"
  | "sync_all_profiles";

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
  source_order_id: string | null;
  source_order_reference: string | null;
  automated: boolean;
  created_by: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
};