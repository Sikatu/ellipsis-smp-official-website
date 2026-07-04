import type { AdminRole } from "../types/admin";

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
