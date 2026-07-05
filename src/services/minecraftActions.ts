import { supabase } from "../lib/supabase";
import { getAutomatedMinecraftActionForOrder } from "../lib/orderMinecraftAutomation";
import type { Order } from "../types/admin";
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
  manual_delivery: "Manual Delivery",
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
      automated: false,
    })
    .select("*")
    .single();

  return {
    data: data as MinecraftAdminAction | null,
    error: error ? new Error(error.message) : null,
  };
}

export async function createMinecraftActionForVerifiedOrder(order: Order): Promise<{
  data: MinecraftAdminAction | null;
  error: Error | null;
  warning: string | null;
}> {
  const playerKey = getPlayerKey(order.minecraft_username);

  if (!playerKey) {
    return {
      data: null,
      error: null,
      warning: "Order verified, but Minecraft action was not queued because IGN is missing.",
    };
  }

  const { data: existingAction, error: existingError } = await supabase
    .from("minecraft_admin_actions")
    .select("id,status")
    .eq("source_order_id", order.id)
    .eq("automated", true)
    .maybeSingle();

  if (existingError) {
    return {
      data: null,
      error: new Error(existingError.message),
      warning: null,
    };
  }

  if (existingAction) {
    return {
      data: null,
      error: null,
      warning: "Minecraft action already exists for this verified order.",
    };
  }

  const automation = getAutomatedMinecraftActionForOrder(order);

  const { data, error } = await supabase
    .from("minecraft_admin_actions")
    .insert({
      player_key: playerKey,
      minecraft_username: order.minecraft_username,
      discord_username: order.discord_username,
      action_type: automation.actionType,
      payload: automation.payload,
      reason: automation.reason,
      status: "queued",
      source_order_id: order.id,
      source_order_reference: automation.sourceOrderReference,
      automated: true,
    })
    .select("*")
    .single();

  return {
    data: data as MinecraftAdminAction | null,
    error: error ? new Error(error.message) : null,
    warning: null,
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
