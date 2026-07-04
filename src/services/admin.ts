import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { AdminProfile, Order, OrderStatus, AdminRole, OrderAuditLog } from "../types/admin";
import { canManageOrders, canApproveStaff } from "../lib/adminPermissions";

export async function requestPendingProfile(activeSession: Session, name: string) {
  const userEmail = activeSession.user.email?.toLowerCase();
  if (!userEmail) return;

  await supabase.from("admin_profiles").insert({
    user_id: activeSession.user.id,
    email: userEmail,
    display_name: name.trim() || null,
    role: "support",
    status: "pending",
  });
}

export async function approveAdminEmail(
  inviteEmail: string,
  inviteRole: AdminRole,
  userRole?: AdminRole | null
) {
  if (!canApproveStaff(userRole)) return { error: new Error("Unauthorized to approve staff.") };

  const normalizedEmail = inviteEmail.trim().toLowerCase();
  if (!normalizedEmail) {
    return { error: new Error("Enter a staff email first.") };
  }

  const { error } = await supabase.from("admin_profiles").upsert(
    {
      email: normalizedEmail,
      role: inviteRole,
      status: "approved",
    },
    { onConflict: "email" }
  );

  return { error, normalizedEmail };
}

export async function insertOrderAuditLog(
  orderId: string,
  action: string,
  session: Session | null,
  adminProfile: AdminProfile | null,
  previousStatus?: OrderStatus | null,
  nextStatus?: OrderStatus | null,
  metadata?: Record<string, any>
) {
  if (!adminProfile) return { error: new Error("No admin profile") };

  const { error } = await supabase.from("order_audit_logs").insert({
    order_id: orderId,
    admin_user_id: session?.user.id || null,
    admin_email: adminProfile.email,
    action,
    previous_status: previousStatus || null,
    next_status: nextStatus || null,
    metadata: {
      ...(metadata || {}),
      admin_display_name:
        adminProfile.display_name?.trim() ||
        adminProfile.email.split("@")[0] ||
        "Staff",
    },
  });

  return { error };
}

export async function updateOrderStatus(
  id: string,
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  userRole: AdminRole | undefined,
  session: Session | null,
  adminProfile: AdminProfile | null
) {
  if (!canManageOrders(userRole)) {
    return { error: new Error("Your role can view orders, but cannot update status."), warning: null };
  }

  const { error: updateError } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
  if (updateError) return { error: updateError, warning: null };

  const { error: auditError } = await insertOrderAuditLog(
    id,
    "status_update",
    session,
    adminProfile,
    currentStatus,
    newStatus
  );

  if (auditError) {
    return { error: null, warning: `Order updated, but failed to log audit: ${auditError.message}` };
  }

  return { error: null, warning: null };
}

export async function updateStaffNotesDb(
  id: string,
  nextNotes: string | null,
  userRole: AdminRole | undefined,
  session: Session | null,
  adminProfile: AdminProfile | null
) {
  if (!canManageOrders(userRole)) {
    return { error: new Error("Your role can view notes, but cannot update them.") };
  }

  const { error } = await supabase
    .from("orders")
    .update({ staff_notes: nextNotes })
    .eq("id", id);

  if (error) return { error };

  await insertOrderAuditLog(id, "staff_notes_update", session, adminProfile, null, null, { notes: nextNotes });
  return { error: null };
}

export async function fetchAuditLogs() {
  const { data, error } = await supabase
    .from("order_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return { data: (data as OrderAuditLog[]) || [], error };
}

export async function fetchAuditLogsForOrder(orderId: string) {
  const { data, error } = await supabase
    .from("order_audit_logs")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return { data: (data as OrderAuditLog[]) || [], error };
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as Order[]) || [], error };
}

export async function getReceiptUrl(path: string | null) {
  if (!path) return { error: new Error("No receipt attached to this order.") };

  const possiblePaths = path.startsWith("payment-receipts/")
    ? [path]
    : [path, `payment-receipts/${path}`];

  for (const receiptPath of possiblePaths) {
    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(receiptPath, 300);

    if (!error && data?.signedUrl) {
      return {
        signedUrl: data.signedUrl,
        label: receiptPath.split("/").pop() || "Receipt",
        error: null
      };
    }
  }

  return { error: new Error("Receipt file not found in storage.") };
}

export function subscribeToOrders(callback: () => void, onError?: (err: any) => void) {
  const channel = supabase
    .channel("orders_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      () => {
        callback();
      }
    )
    .subscribe((status, err) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || err) {
        if (onError) onError(err || new Error(`Realtime subscription failed: ${status}`));
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function notifyDiscordOrderAction(
  order: Order,
  status: OrderStatus,
  previousStatus: OrderStatus,
  session: Session | null,
  adminProfile: AdminProfile | null
) {
  if (!session?.access_token) {
    return { error: new Error("Missing admin session token.") };
  }

  const response = await fetch("/api/admin-order-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      orderId: order.payment_reference || order.id,
      ign: order.minecraft_username,
      discord: order.discord_username || "N/A",
      product: order.product_name,
      price: order.product_price,
      paymentMethod: order.payment_method,
      previousStatus,
      status,
      handledBy:
        adminProfile?.display_name?.trim() ||
        adminProfile?.email?.split("@")[0] ||
        "Staff",
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

