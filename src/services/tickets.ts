import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { AdminProfile, AdminRole } from "../types/admin";
import { canManageOrders } from "../lib/adminPermissions";
import type {
  GuestTicketMessage,
  GuestTicketSummary,
  Ticket,
  TicketAuditLog,
  TicketMessage,
  TicketStatus,
} from "../types/tickets";

export type CreateTicketInput = {
  category: string;
  subcategory: string;
  subject: string;
  answers: Record<string, string>;
  minecraftUsername?: string;
  discordUsername?: string;
};

export async function createTicket(input: CreateTicketInput): Promise<{
  data: { ticketId: string; ticketNumber: number; guestAccessToken: string } | null;
  error: Error | null;
}> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const response = await fetch("/api/create-ticket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body) {
    return {
      data: null,
      error: new Error(body?.error || "Failed to create ticket."),
    };
  }

  return {
    data: {
      ticketId: body.ticketId,
      ticketNumber: body.ticketNumber,
      guestAccessToken: body.guestAccessToken,
    },
    error: null,
  };
}

export async function fetchMyTickets(): Promise<{ data: Ticket[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    data: (data || []) as Ticket[],
    error: error ? new Error(error.message) : null,
  };
}

export async function fetchAllTickets(): Promise<{ data: Ticket[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  return {
    data: (data || []) as Ticket[],
    error: error ? new Error(error.message) : null,
  };
}

export async function fetchTicketMessages(
  ticketId: string
): Promise<{ data: TicketMessage[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return {
    data: (data || []) as TicketMessage[],
    error: error ? new Error(error.message) : null,
  };
}

export async function postTicketMessage({
  ticketId,
  body,
  authorType,
  authorDisplayName,
}: {
  ticketId: string;
  body: string;
  authorType: "player" | "staff";
  authorDisplayName: string;
}): Promise<{ error: Error | null }> {
  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_type: authorType,
    author_user_id: userData.user?.id || null,
    author_display_name: authorDisplayName,
    source: "website",
    body: body.trim(),
  });

  return { error: error ? new Error(error.message) : null };
}

async function insertTicketAuditLog(
  ticketId: string,
  action: string,
  session: Session | null,
  adminProfile: AdminProfile | null,
  previousStatus?: TicketStatus | null,
  nextStatus?: TicketStatus | null
) {
  if (!adminProfile) return { error: new Error("No admin profile") };

  const { error } = await supabase.from("ticket_audit_logs").insert({
    ticket_id: ticketId,
    admin_user_id: session?.user.id || null,
    admin_email: adminProfile.email,
    action,
    previous_status: previousStatus || null,
    next_status: nextStatus || null,
    metadata: {
      admin_display_name:
        adminProfile.display_name?.trim() || adminProfile.email.split("@")[0] || "Staff",
    },
  });

  return { error };
}

export async function claimTicket(
  ticketId: string,
  userRole: AdminRole | undefined,
  session: Session | null,
  adminProfile: AdminProfile | null
): Promise<{ error: Error | null; warning: string | null }> {
  if (!canManageOrders(userRole)) {
    return { error: new Error("Your role cannot claim tickets."), warning: null };
  }

  const { error } = await supabase
    .from("tickets")
    .update({ status: "claimed", claimed_by_admin_user_id: session?.user.id || null })
    .eq("id", ticketId);

  if (error) return { error: new Error(error.message), warning: null };

  const { error: auditError } = await insertTicketAuditLog(
    ticketId,
    "claimed",
    session,
    adminProfile,
    "open",
    "claimed"
  );

  return {
    error: null,
    warning: auditError ? `Ticket claimed, but failed to log audit: ${auditError.message}` : null,
  };
}

export async function updateTicketStatus(
  ticketId: string,
  currentStatus: TicketStatus,
  newStatus: TicketStatus,
  userRole: AdminRole | undefined,
  session: Session | null,
  adminProfile: AdminProfile | null,
  resolutionNote?: string
): Promise<{ error: Error | null; warning: string | null }> {
  if (!canManageOrders(userRole)) {
    return { error: new Error("Your role cannot update ticket status."), warning: null };
  }

  const { error } = await supabase
    .from("tickets")
    .update({
      status: newStatus,
      resolution_note: resolutionNote?.trim() || null,
      resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
      closed_at: newStatus === "closed" ? new Date().toISOString() : null,
    })
    .eq("id", ticketId);

  if (error) return { error: new Error(error.message), warning: null };

  const { error: auditError } = await insertTicketAuditLog(
    ticketId,
    "status_update",
    session,
    adminProfile,
    currentStatus,
    newStatus
  );

  return {
    error: null,
    warning: auditError ? `Ticket updated, but failed to log audit: ${auditError.message}` : null,
  };
}

export async function fetchTicketAuditLogs(
  ticketId: string
): Promise<{ data: TicketAuditLog[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("ticket_audit_logs")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false });

  return {
    data: (data || []) as TicketAuditLog[],
    error: error ? new Error(error.message) : null,
  };
}

export function subscribeToTickets(callback: () => void, onError?: (err: any) => void) {
  const channel = supabase
    .channel("tickets_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tickets" },
      () => {
        callback();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "ticket_messages" },
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

export async function fetchGuestTicket(
  guestAccessToken: string
): Promise<{ data: GuestTicketSummary | null; error: Error | null }> {
  const { data, error } = await supabase.rpc("get_ticket_by_guest_token", {
    token: guestAccessToken,
  });

  if (error) return { data: null, error: new Error(error.message) };

  const ticket = Array.isArray(data) ? data[0] : data;
  return { data: ticket ? (ticket as GuestTicketSummary) : null, error: null };
}

export async function fetchGuestTicketMessages(
  guestAccessToken: string
): Promise<{ data: GuestTicketMessage[]; error: Error | null }> {
  const { data, error } = await supabase.rpc("get_ticket_messages_by_guest_token", {
    token: guestAccessToken,
  });

  if (error) return { data: [], error: new Error(error.message) };

  return { data: (data || []) as GuestTicketMessage[], error: null };
}

export async function postGuestTicketReply({
  guestAccessToken,
  body,
  displayName,
}: {
  guestAccessToken: string;
  body: string;
  displayName: string;
}): Promise<{ error: Error | null }> {
  const response = await fetch("/api/ticket-guest-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestAccessToken, body, displayName }),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    return { error: new Error(responseBody?.error || "Failed to send reply.") };
  }

  return { error: null };
}
