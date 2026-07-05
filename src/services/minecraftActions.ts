import { supabase } from "../lib/supabase";
import type {
  MinecraftAdminAction,
  MinecraftActionStatus,
  MinecraftActionType,
} from "../types/minecraftActions";

function getPlayerKey(minecraftUsername: string) {
  return minecraftUsername.trim().toLowerCase();
}

export const minecraftActionLabels: Record<MinecraftActionType, string> = {
  give_rank: "Give Rank",
  give_coins: "Give Coins",
  jail: "Jail Player",
  unjail: "Unjail Player",
  temp_ban: "Temp Ban Player",
};

export const minecraftActionStatusLabels: Record<MinecraftActionStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export async function fetchMinecraftAdminActions(minecraftUsername: string): Promise<{
  data: MinecraftAdminAction[];
  error: Error | null;
}> {
  const playerKey = getPlayerKey(minecraftUsername);

  if (!playerKey) {
    return {
      data: [],
      error: new Error("Missing Minecraft username."),
    };
  }

  const { data, error } = await supabase
    .from("minecraft_admin_actions")
    .select("*")
    .eq("player_key", playerKey)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    data: (data || []) as MinecraftAdminAction[],
    error: error ? new Error(error.message) : null,
  };
}

export async function fetchAllMinecraftAdminActions(): Promise<{
  data: MinecraftAdminAction[];
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("minecraft_admin_actions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return {
    data: (data || []) as MinecraftAdminAction[],
    error: error ? new Error(error.message) : null,
  };
}

export async function createMinecraftAdminAction({
  minecraftUsername,
  discordUsername,
  actionType,
  payload,
  reason,
}: {
  minecraftUsername: string;
  discordUsername: string | null;
  actionType: MinecraftActionType;
  payload: Record<string, unknown>;
  reason: string;
}): Promise<{
  data: MinecraftAdminAction | null;
  error: Error | null;
}> {
  const playerKey = getPlayerKey(minecraftUsername);

  if (!playerKey) {
    return {
      data: null,
      error: new Error("Missing Minecraft username."),
    };
  }

  const { data, error } = await supabase
    .from("minecraft_admin_actions")
    .insert({
      player_key: playerKey,
      minecraft_username: minecraftUsername,
      discord_username: discordUsername,
      action_type: actionType,
      payload,
      reason: reason.trim() || "No reason provided.",
      status: "queued",
    })
    .select("*")
    .single();

  return {
    data: data as MinecraftAdminAction | null,
    error: error ? new Error(error.message) : null,
  };
}

export async function updateMinecraftAdminActionStatus({
  actionId,
  status,
  resultMessage,
}: {
  actionId: string;
  status: MinecraftActionStatus;
  resultMessage: string;
}): Promise<{
  data: MinecraftAdminAction | null;
  error: Error | null;
}> {
  const { data: userData } = await supabase.auth.getUser();

  const terminalStatuses: MinecraftActionStatus[] = ["completed", "failed", "cancelled"];
  const isTerminal = terminalStatuses.includes(status);

  const { data, error } = await supabase
    .from("minecraft_admin_actions")
    .update({
      status,
      result_message: resultMessage.trim() || null,
      processed_by: userData.user?.id || null,
      processed_at: isTerminal ? new Date().toISOString() : null,
    })
    .eq("id", actionId)
    .select("*")
    .single();

  return {
    data: data as MinecraftAdminAction | null,
    error: error ? new Error(error.message) : null,
  };
}
