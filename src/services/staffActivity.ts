import { supabase } from "../lib/supabase";
import type { AdminProfile, OrderAuditLog } from "../types/admin";
import type { MinecraftAdminAction } from "../types/minecraftActions";
import {
  minecraftActionLabels,
  minecraftActionStatusLabels,
} from "./minecraftActions";

export type StaffActivitySummary = {
  key: string;
  displayName: string;
  email: string | null;
  role: string;
  orderUpdates: number;
  ordersVerified: number;
  ordersDelivered: number;
  ordersRejected: number;
  minecraftQueued: number;
  minecraftProcessed: number;
  minecraftCompleted: number;
  minecraftFailed: number;
  minecraftCancelled: number;
  totalActions: number;
  lastActivity: string | null;
};

export type StaffActivityEvent = {
  id: string;
  type: "order" | "minecraft";
  staffKey: string;
  staffName: string;
  title: string;
  subtitle: string;
  createdAt: string;
};

export type StaffActivityDashboard = {
  summaries: StaffActivitySummary[];
  events: StaffActivityEvent[];
  totals: {
    staffActive: number;
    orderUpdates: number;
    minecraftQueued: number;
    minecraftCompleted: number;
    minecraftFailed: number;
    minecraftCancelled: number;
  };
};

function getProfileDisplayName(profile: AdminProfile | null | undefined) {
  const displayName = profile?.display_name?.trim();

  if (displayName && !displayName.includes("@")) return displayName;

  return profile?.email?.split("@")[0] || "Unknown Staff";
}

function metadataDisplayName(log: OrderAuditLog) {
  const value = log.metadata?.admin_display_name;

  if (typeof value === "string" && value.trim() && !value.includes("@")) {
    return value.trim();
  }

  return null;
}

function getOrCreateSummary(
  map: Map<string, StaffActivitySummary>,
  staff: {
    key: string;
    displayName: string;
    email?: string | null;
    role?: string | null;
  },
) {
  if (!map.has(staff.key)) {
    map.set(staff.key, {
      key: staff.key,
      displayName: staff.displayName,
      email: staff.email || null,
      role: staff.role || "staff",
      orderUpdates: 0,
      ordersVerified: 0,
      ordersDelivered: 0,
      ordersRejected: 0,
      minecraftQueued: 0,
      minecraftProcessed: 0,
      minecraftCompleted: 0,
      minecraftFailed: 0,
      minecraftCancelled: 0,
      totalActions: 0,
      lastActivity: null,
    });
  }

  return map.get(staff.key)!;
}

function updateLastActivity(summary: StaffActivitySummary, createdAt: string) {
  if (!summary.lastActivity || new Date(createdAt) > new Date(summary.lastActivity)) {
    summary.lastActivity = createdAt;
  }
}

function getStaffFromProfile(
  profile: AdminProfile | null | undefined,
  fallback: {
    userId?: string | null;
    email?: string | null;
    displayName?: string | null;
  },
) {
  const key =
    profile?.user_id ||
    fallback.userId ||
    profile?.email ||
    fallback.email ||
    "unknown-staff";

  return {
    key,
    displayName:
      getProfileDisplayName(profile) ||
      fallback.displayName ||
      fallback.email?.split("@")[0] ||
      "Unknown Staff",
    email: profile?.email || fallback.email || null,
    role: profile?.role || "staff",
  };
}

export async function fetchStaffActivityDashboard(): Promise<{
  data: StaffActivityDashboard | null;
  error: Error | null;
}> {
  const [profilesResult, orderLogsResult, minecraftActionsResult] = await Promise.all([
    supabase
      .from("admin_profiles")
      .select("id,user_id,email,display_name,role,status")
      .eq("status", "approved"),
    supabase
      .from("order_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("minecraft_admin_actions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(300),
  ]);

  if (profilesResult.error) {
    return { data: null, error: new Error(profilesResult.error.message) };
  }

  if (orderLogsResult.error) {
    return { data: null, error: new Error(orderLogsResult.error.message) };
  }

  if (minecraftActionsResult.error) {
    return { data: null, error: new Error(minecraftActionsResult.error.message) };
  }

  const profiles = (profilesResult.data || []) as AdminProfile[];
  const orderLogs = (orderLogsResult.data || []) as OrderAuditLog[];
  const minecraftActions = (minecraftActionsResult.data || []) as MinecraftAdminAction[];

  const profilesByUserId = new Map<string, AdminProfile>();
  const profilesByEmail = new Map<string, AdminProfile>();

  for (const profile of profiles) {
    if (profile.user_id) profilesByUserId.set(profile.user_id, profile);
    profilesByEmail.set(profile.email.toLowerCase(), profile);
  }

  const summariesMap = new Map<string, StaffActivitySummary>();
  const events: StaffActivityEvent[] = [];

  for (const log of orderLogs) {
    const profile =
      (log.admin_user_id ? profilesByUserId.get(log.admin_user_id) : null) ||
      (log.admin_email ? profilesByEmail.get(log.admin_email.toLowerCase()) : null);

    const staff = getStaffFromProfile(profile, {
      userId: log.admin_user_id,
      email: log.admin_email,
      displayName: metadataDisplayName(log),
    });

    const summary = getOrCreateSummary(summariesMap, staff);
    summary.orderUpdates += 1;
    summary.totalActions += 1;

    if (log.next_status === "verified") summary.ordersVerified += 1;
    if (log.next_status === "delivered") summary.ordersDelivered += 1;
    if (log.next_status === "rejected") summary.ordersRejected += 1;

    updateLastActivity(summary, log.created_at);

    events.push({
      id: `order-${log.id}`,
      type: "order",
      staffKey: staff.key,
      staffName: staff.displayName,
      title: `Order ${log.next_status || log.action}`,
      subtitle: `${log.previous_status || "none"} → ${log.next_status || "updated"}`,
      createdAt: log.created_at,
    });
  }

  for (const action of minecraftActions) {
    const createdProfile = action.created_by
      ? profilesByUserId.get(action.created_by)
      : null;

    const createdStaff = getStaffFromProfile(createdProfile, {
      userId: action.created_by,
    });

    const createdSummary = getOrCreateSummary(summariesMap, createdStaff);
    createdSummary.minecraftQueued += 1;
    createdSummary.totalActions += 1;
    updateLastActivity(createdSummary, action.created_at);

    events.push({
      id: `minecraft-created-${action.id}`,
      type: "minecraft",
      staffKey: createdStaff.key,
      staffName: createdStaff.displayName,
      title: `Queued ${minecraftActionLabels[action.action_type]}`,
      subtitle: `${action.minecraft_username} • ${action.automated ? "Automated" : "Manual"}`,
      createdAt: action.created_at,
    });

    if (action.status !== "queued") {
      const processedProfile = action.processed_by
        ? profilesByUserId.get(action.processed_by)
        : null;

      const processedStaff = getStaffFromProfile(processedProfile, {
        userId: action.processed_by || action.created_by,
      });

      const processedSummary = getOrCreateSummary(summariesMap, processedStaff);
      processedSummary.minecraftProcessed += 1;
      processedSummary.totalActions += 1;

      if (action.status === "completed") processedSummary.minecraftCompleted += 1;
      if (action.status === "failed") processedSummary.minecraftFailed += 1;
      if (action.status === "cancelled") processedSummary.minecraftCancelled += 1;

      updateLastActivity(processedSummary, action.processed_at || action.updated_at);

      events.push({
        id: `minecraft-processed-${action.id}`,
        type: "minecraft",
        staffKey: processedStaff.key,
        staffName: processedStaff.displayName,
        title: `${minecraftActionStatusLabels[action.status]} ${minecraftActionLabels[action.action_type]}`,
        subtitle: `${action.minecraft_username} • ${action.result_message || "No result message"}`,
        createdAt: action.processed_at || action.updated_at,
      });
    }
  }

  const summaries = Array.from(summariesMap.values()).sort((a, b) => {
    if (b.totalActions !== a.totalActions) return b.totalActions - a.totalActions;
    return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
  });

  const sortedEvents = events
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 75);

  return {
    data: {
      summaries,
      events: sortedEvents,
      totals: {
        staffActive: summaries.length,
        orderUpdates: summaries.reduce((total, staff) => total + staff.orderUpdates, 0),
        minecraftQueued: summaries.reduce((total, staff) => total + staff.minecraftQueued, 0),
        minecraftCompleted: summaries.reduce((total, staff) => total + staff.minecraftCompleted, 0),
        minecraftFailed: summaries.reduce((total, staff) => total + staff.minecraftFailed, 0),
        minecraftCancelled: summaries.reduce((total, staff) => total + staff.minecraftCancelled, 0),
      },
    },
    error: null,
  };
}
