import type { AdminProfile, AdminRole } from "../types/admin";

export function hasFullAccess(role?: AdminRole | null): boolean {
  return role === "owner";
}

export function canManageOrders(role?: AdminRole | null): boolean {
  return role === "owner" || role === "manager";
}

export function canApproveStaff(role?: AdminRole | null): boolean {
  return role === "owner";
}

export const roleDescriptions: Record<AdminRole, string> = {
  owner: "Full dashboard access. Can approve staff and manage all orders.",
  manager: "Can verify, deliver, reject, and edit notes.",
  support: "View-only access. Cannot change order status or notes.",
};

function cleanDisplayName(value: string | null | undefined) {
  const cleaned = value?.trim();

  if (!cleaned) return "";
  if (cleaned.includes("@")) return "";

  return cleaned;
}

export function getAdminDisplayName(profile: AdminProfile | null | undefined) {
  const displayName = cleanDisplayName(profile?.display_name);

  if (displayName) return displayName;

  const emailName = profile?.email?.split("@")[0]?.trim();

  return emailName || "Staff";
}

export function getAuditStaffName(log: {
  admin_email: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const metadata = log.metadata && typeof log.metadata === "object" ? log.metadata : {};
  const displayName =
    typeof metadata.admin_display_name === "string"
      ? cleanDisplayName(metadata.admin_display_name)
      : "";

  if (displayName) return displayName;

  const emailName = log.admin_email?.split("@")[0]?.trim();

  return emailName || "Unknown Staff";
}
