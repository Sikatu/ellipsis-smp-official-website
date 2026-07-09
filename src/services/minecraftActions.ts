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
  give_crate_key: "Give Crate Key",
  give_item: "Give Item",
  give_kit: "Give Kit",
  jail: "Jail Player",
  unjail: "Unjail Player",
  temp_ban: "Temp Ban Player",
  unban: "Unban Player",
  kick: "Kick Player",
  mute: "Mute Player",
  unmute: "Unmute Player",
  warn: "Warn Player",
  whitelist_add: "Whitelist Add",
  whitelist_remove: "Whitelist Remove",
  maintenance_enable: "Enable Maintenance",
  maintenance_disable: "Disable Maintenance",
  manual_delivery: "Manual Delivery",
  server_broadcast: "Server Broadcast",
  title_broadcast: "Title Broadcast",
  actionbar_broadcast: "Action Bar Broadcast",
  sound_broadcast: "Sound Broadcast",
  approved_command: "Approved Command",
  sync_all_profiles: "Sync All Players",
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

  switch (action.action_type) {
    case "give_rank":
      return `Rank: ${String(payload.rank || "N/A")}`;

    case "give_coins":
      return `Coins: ${String(payload.amount || "N/A")}`;

    case "give_crate_key":
      return `Crate: ${String(payload.crate || "N/A")} · Amount: ${String(payload.amount || "N/A")}`;

    case "give_item":
      return `Item: ${String(payload.item || "N/A")} · Amount: ${String(payload.amount || "N/A")}`;

    case "give_kit":
      return `Kit: ${String(payload.kit || "N/A")}`;

    case "temp_ban":
    case "mute":
      return `Duration: ${String(payload.duration || "N/A")} · Reason: ${String(payload.reason || action.reason || "No reason")}`;

    case "jail":
    case "unjail":
    case "unban":
    case "kick":
    case "unmute":
    case "warn":
      return `Reason: ${String(payload.reason || action.reason || "No reason")}`;

    case "whitelist_add":
    case "whitelist_remove":
      return `Player: ${action.minecraft_username}`;

    case "maintenance_enable":
      return "Maintenance mode: enable";

    case "maintenance_disable":
      return "Maintenance mode: disable";

    case "manual_delivery":
      return `Delivery: ${String(payload.deliveryType || payload.productName || "Manual review")}`;

    case "server_broadcast":
    case "title_broadcast":
    case "actionbar_broadcast":
    case "sound_broadcast":
      return `Broadcast: ${String(payload.title || "Announcement")} — ${String(payload.message || "No message")}`;

    case "approved_command":
      return `Approved Command: ${String(payload.commandKey || "N/A")}`;

    case "sync_all_profiles":
      return "Resyncing every known player's profile from the live server.";

    default:
      return "No extra payload.";
  }
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
export async function createSyncAllProfilesAction(): Promise<{
  data: MinecraftAdminAction | null;
  error: Error | null;
  warning: string | null;
}> {
  const { data, error } = await supabase
    .from("minecraft_admin_actions")
    .insert({
      player_key: "server",
      minecraft_username: "SERVER",
      discord_username: null,
      action_type: "sync_all_profiles",
      payload: {},
      reason: "Staff requested a full player data resync.",
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
      ? `Sync queued, but Discord notification failed: ${notifyResult.error.message}`
      : null,
  };
}

export async function createServerBroadcastAction({
  title,
  message,
  style,
  audience,
}: {
  title: string;
  message: string;
  style: "premium" | "event" | "warning" | "maintenance";
  audience: "all";
}): Promise<{
  data: MinecraftAdminAction | null;
  error: Error | null;
  warning: string | null;
}> {
  const cleanTitle = title.trim() || "Ellipsis SMP";
  const cleanMessage = message.trim();

  if (!cleanMessage) {
    return {
      data: null,
      error: new Error("Announcement message is required."),
      warning: null,
    };
  }

  const { data, error } = await supabase
    .from("minecraft_admin_actions")
    .insert({
      player_key: "server",
      minecraft_username: "SERVER",
      discord_username: null,
      action_type: "server_broadcast",
      payload: {
        title: cleanTitle,
        message: cleanMessage,
        style,
        audience,
      },
      reason: `Owner announcement: ${cleanTitle}`,
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
      ? `Announcement queued, but Discord notification failed: ${notifyResult.error.message}`
      : null,
  };
}
