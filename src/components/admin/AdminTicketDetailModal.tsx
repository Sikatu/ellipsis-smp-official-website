import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import type { AdminProfile, AdminRole } from "../../types/admin";
import type { Ticket, TicketMessage, TicketStatus } from "../../types/tickets";
import {
  claimTicket,
  fetchTicketMessages,
  postTicketMessage,
  updateTicketStatus,
} from "../../services/tickets";
import { getAdminDisplayName } from "../../lib/adminPermissions";
import { AdminTicketAuditLog } from "./AdminTicketAuditLog";
import { AdminMinecraftActionModal } from "./AdminMinecraftActionModal";
import Button from "../ui/Button";

type AdminTicketDetailModalProps = {
  isOpen: boolean;
  ticket: Ticket | null;
  canManageTickets: boolean;
  userRole: AdminRole | undefined;
  session: Session | null;
  adminProfile: AdminProfile | null;
  onClose: () => void;
  onChanged: () => void;
};

const statusStyles: Record<TicketStatus, string> = {
  open: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  claimed: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  resolved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  closed: "border-gray-400/25 bg-gray-500/10 text-gray-200",
};

const questionLabels: Record<string, string> = {
  subcategory: "Category",
  minecraft_ign: "Minecraft IGN",
  discord_username: "Discord Username",
  description: "Description",
  reason: "Reason",
  pitch: "Pitch",
};

export function AdminTicketDetailModal({
  isOpen,
  ticket,
  canManageTickets,
  userRole,
  session,
  adminProfile,
  onClose,
  onChanged,
}: AdminTicketDetailModalProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !ticket) return;
    setFeedback(null);
    setResolutionNote(ticket.resolution_note || "");
    void loadMessages(ticket.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ticket?.id]);

  async function loadMessages(ticketId: string) {
    const result = await fetchTicketMessages(ticketId);
    setMessages(result.data);
  }

  if (!isOpen || !ticket) return null;

  async function handleClaim() {
    setIsUpdating(true);
    const result = await claimTicket(ticket!.id, userRole, session, adminProfile);
    setIsUpdating(false);

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else {
      setFeedback({ type: result.warning ? "warning" : "success", text: result.warning || "Ticket claimed." });
      onChanged();
    }
  }

  async function handleStatusChange(newStatus: TicketStatus) {
    if (newStatus === "resolved" || newStatus === "closed") {
      const confirmed = window.confirm(
        `Mark this ticket as ${newStatus}? The requester will see this update.`
      );
      if (!confirmed) return;
    }

    setIsUpdating(true);
    const result = await updateTicketStatus(
      ticket!.id,
      ticket!.status,
      newStatus,
      userRole,
      session,
      adminProfile,
      resolutionNote
    );
    setIsUpdating(false);

    if (result.error) {
      setFeedback({ type: "error", text: result.error.message });
    } else {
      setFeedback({ type: result.warning ? "warning" : "success", text: result.warning || `Status updated to ${newStatus}.` });
      onChanged();
    }
  }

  async function sendReply() {
    if (!replyText.trim()) return;
    setIsSendingReply(true);

    const { error } = await postTicketMessage({
      ticketId: ticket!.id,
      body: replyText,
      authorType: "staff",
      authorDisplayName: getAdminDisplayName(adminProfile),
    });

    setIsSendingReply(false);

    if (error) {
      setFeedback({ type: "error", text: error.message });
      return;
    }

    setReplyText("");
    await loadMessages(ticket!.id);
  }

  const isAppeal = ticket.category === "ban_appeal";
  const appealActionType = ticket.subcategory === "Mute" ? "unmute" : "unban";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-purple-400/25 bg-[#12091f] shadow-[0_0_70px_rgba(168,85,247,0.22)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${statusStyles[ticket.status]}`}
              >
                {ticket.status}
              </span>
              <h2 className="mt-3 text-2xl font-black text-white">
                #{ticket.ticket_number} — {ticket.subject}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close ticket modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(92vh-130px)] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-5">
              <div className="rounded-2xl border border-purple-500/20 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                  Requester
                </p>
                <div className="mt-3 grid gap-2 text-sm text-gray-300">
                  <p><strong>IGN:</strong> <span className="text-white">{ticket.minecraft_username || "N/A"}</span></p>
                  <p><strong>Discord:</strong> <span className="text-white">{ticket.discord_username || "N/A"}</span></p>
                  <p><strong>Email:</strong> <span className="text-white">{ticket.opened_by_email || "Guest"}</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                  Submitted Answers
                </p>
                <div className="mt-3 grid gap-3 text-sm">
                  {Object.entries(ticket.answers || {}).map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
                        {questionLabels[key] || key}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isAppeal && canManageTickets && ticket.status !== "closed" && (
                <button
                  type="button"
                  onClick={() => setIsAppealModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-black text-emerald-200 transition hover:bg-emerald-400/20"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Approve Appeal &amp; Queue Minecraft Action
                </button>
              )}
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-purple-500/20 bg-white/[0.045] p-5">
                <div className="mb-3 inline-flex items-center gap-2 text-sm font-black text-purple-200">
                  <MessageSquareText className="h-4 w-4" />
                  Conversation
                </div>

                <div className="grid gap-3">
                  {messages.length === 0 && (
                    <p className="text-sm text-gray-400">No messages yet.</p>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-xl border p-3 ${
                        message.author_type === "staff"
                          ? "border-blue-400/20 bg-blue-500/10"
                          : "border-white/10 bg-black/25"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-300">
                          {message.author_display_name}
                          {message.source === "discord" ? " (Discord)" : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-100">
                        {message.body}
                      </p>
                    </div>
                  ))}
                </div>

                {ticket.status !== "closed" && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Reply as staff..."
                      className="flex-1 rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-300"
                    />
                    <Button onClick={sendReply} disabled={isSendingReply} className="rounded-xl">
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                )}
              </div>

              {canManageTickets && (
                <div className="rounded-2xl border border-purple-500/20 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                    Manage Ticket
                  </p>

                  {ticket.status === "open" && (
                    <button
                      type="button"
                      onClick={handleClaim}
                      disabled={isUpdating}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 font-black text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                      Claim Ticket
                    </button>
                  )}

                  <textarea
                    value={resolutionNote}
                    onChange={(event) => setResolutionNote(event.target.value)}
                    placeholder="Resolution note (shown to the requester)"
                    rows={3}
                    className="mt-3 w-full resize-none rounded-xl border border-purple-500/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-300"
                  />

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange("resolved")}
                      disabled={isUpdating || ticket.status === "resolved"}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 font-black text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("closed")}
                      disabled={isUpdating || ticket.status === "closed"}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-400/30 bg-gray-500/10 px-4 py-3 font-black text-gray-200 transition hover:bg-gray-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </div>
                </div>
              )}

              {feedback && (
                <div
                  className={`rounded-xl border p-3 text-sm font-bold ${
                    feedback.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : feedback.type === "error"
                        ? "border-red-500/30 bg-red-500/10 text-red-200"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm font-black text-blue-200 transition hover:bg-blue-500/20"
              >
                {showAuditLog ? "Hide Audit Log" : "View Audit Log"}
              </button>

              {showAuditLog && <AdminTicketAuditLog ticketId={ticket.id} />}
            </div>
          </div>
        </div>
      </div>

      <AdminMinecraftActionModal
        isOpen={isAppealModalOpen}
        minecraftUsername={ticket.minecraft_username || ""}
        discordUsername={ticket.discord_username}
        initialActionType={appealActionType}
        canManagePlayers={canManageTickets}
        onClose={() => setIsAppealModalOpen(false)}
      />
    </div>
  );
}
