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

export function getMinecraftActionPayloadSummary(action: MinecraftAdminAction) {
  const payload = action.payload || {};

  if (action.action_type === "give_rank") {
    return `Rank: ${String(payload.rank || "N/A")}`;
  }

  if (action.action_type === "give_coins") {
    return `Coins: ${String(payload.amount || "N/A")}`;
  }

  if (action.action_type === "temp_ban") {
    return `Duration: ${String(payload.duration || "N/A")}`;
  }

  if (action.action_type === "manual_delivery") {
    return `Delivery: ${String(payload.deliveryType || payload.productName || "Manual review")}`;
  }

  return "No extra payload.";
}

async function notifyDiscordMinecraftAction({
  action,
  previousStatus,
}: {
  action: MinecraftAdminAction;
  previousStatus: MinecraftActionStatus | "new";
}): Promise<{ error: Error | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    return { error: new Error("Missing admin session token.") };
  }

  const response = await fetch("/api/admin-minecraft-action-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      actionId: action.id,
      actionType: action.action_type,
      actionLabel: minecraftActionLabels[action.action_type],
      minecraftUsername: action.minecraft_username,
      discordUsername: action.discord_username || "N/A",
      payloadSummary: getMinecraftActionPayloadSummary(action),
      reason: action.reason || "No reason provided.",
      resultMessage: action.result_message || "",
      source: action.automated ? "Automated" : "Manual",
      sourceOrderReference: action.source_order_reference || "N/A",
      previousStatus,
      status: action.status,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return {
      error: new Error(data?.error || "Discord notification failed."),
    };
  }

  return { error: null };
}

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
  warning: string | null;
}> {
  const playerKey = getPlayerKey(minecraftUsername);

  if (!playerKey) {
    return {
      data: null,
      error: new Error("Missing Minecraft username."),
      warning: null,
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

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
      warning: null,
    };
  }

  const action = data as MinecraftAdminAction;
  const notifyResult = await notifyDiscordMinecraftAction({
    action,
    previousStatus: "new",
  });

  return {
    data: action,
    error: null,
    warning: notifyResult.error
      ? `Minecraft action queued, but Discord notification failed: ${notifyResult.error.message}`
      : null,
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

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
      warning: null,
    };
  }

  const action = data as MinecraftAdminAction;
  const notifyResult = await notifyDiscordMinecraftAction({
    action,
    previousStatus: "new",
  });

  return {
    data: action,
    error: null,
    warning: notifyResult.error
      ? `Minecraft action queued, but Discord notification failed: ${notifyResult.error.message}`
      : null,
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
  warning: string | null;
}> {
  const { data: currentAction, error: currentError } = await supabase
    .from("minecraft_admin_actions")
    .select("*")
    .eq("id", actionId)
    .maybeSingle();

  if (currentError) {
    return {
      data: null,
      error: new Error(currentError.message),
      warning: null,
    };
  }

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

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
      warning: null,
    };
  }

  const action = data as MinecraftAdminAction;
  const notifyResult = await notifyDiscordMinecraftAction({
    action,
    previousStatus: (currentAction?.status as MinecraftActionStatus | undefined) || "new",
  });

  return {
    data: action,
    error: null,
    warning: notifyResult.error
      ? `Minecraft action updated, but Discord notification failed: ${notifyResult.error.message}`
      : null,
  };
}
