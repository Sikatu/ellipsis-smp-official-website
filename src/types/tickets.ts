export type TicketCategory = "support" | "ban_appeal" | "staff_application";
export type TicketStatus = "open" | "claimed" | "resolved" | "closed";
export type TicketMessageAuthorType = "player" | "staff" | "system" | "ai";
export type TicketMessageSource = "website" | "discord";

export type Ticket = {
  id: string;
  ticket_number: number;
  category: TicketCategory;
  subcategory: string | null;
  subject: string;
  answers: Record<string, string>;
  status: TicketStatus;
  opened_by_user_id: string | null;
  opened_by_email: string | null;
  minecraft_username: string | null;
  discord_username: string | null;
  discord_user_id: string | null;
  claimed_by_admin_user_id: string | null;
  guest_access_token: string;
  discord_guild_id: string | null;
  discord_channel_id: string | null;
  discord_thread_id: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  author_type: TicketMessageAuthorType;
  author_user_id: string | null;
  author_display_name: string;
  author_discord_id: string | null;
  source: TicketMessageSource;
  discord_message_id: string | null;
  body: string;
  created_at: string;
};

export type TicketAuditLog = {
  id: string;
  ticket_id: string | null;
  admin_user_id: string | null;
  admin_email: string | null;
  action: string;
  previous_status: TicketStatus | null;
  next_status: TicketStatus | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type GuestTicketSummary = {
  id: string;
  ticket_number: number;
  category: TicketCategory;
  subcategory: string | null;
  subject: string;
  status: TicketStatus;
  created_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
};

export type GuestTicketMessage = {
  id: string;
  author_type: TicketMessageAuthorType;
  author_display_name: string;
  body: string;
  created_at: string;
};
