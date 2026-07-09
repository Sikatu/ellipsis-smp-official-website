import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Lock,
  MessageSquareText,
  PackageCheck,
  Send,
  ShieldCheck,
  Ticket as TicketIcon,
} from "lucide-react";
import PageShell from "./PageShell";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
import { getCurrentPortalUser } from "../services/playerProfilePortal";
import {
  createTicket,
  fetchGuestTicket,
  fetchGuestTicketMessages,
  fetchMyTickets,
  fetchTicketMessages,
  postGuestTicketReply,
  postTicketMessage,
  subscribeToTickets,
} from "../services/tickets";
import { TICKET_CATEGORIES, getTicketCategoryDefinition } from "../lib/ticketCategories";
import type {
  GuestTicketMessage,
  GuestTicketSummary,
  Ticket,
  TicketMessage,
  TicketStatus,
} from "../types/tickets";

const statusMeta: Record<
  TicketStatus,
  { label: string; tone: string; icon: typeof Clock3 }
> = {
  open: {
    label: "Open",
    tone: "border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.1)] text-[#fef3c7]",
    icon: Clock3,
  },
  claimed: {
    label: "In Progress",
    tone: "border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.1)] text-[#dbeafe]",
    icon: ShieldCheck,
  },
  resolved: {
    label: "Resolved",
    tone: "border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.1)] text-[#d1fae5]",
    icon: PackageCheck,
  },
  closed: {
    label: "Closed",
    tone: "border-white/[0.15] bg-white/[0.05] text-gray-200",
    icon: CheckCircle2,
  },
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${meta.tone}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function MessageThread({
  messages,
}: {
  messages: { author_type: string; author_display_name: string; body: string; created_at: string }[];
}) {
  if (messages.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center text-sm text-gray-400">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {messages.map((message, index) => {
        const isStaff = message.author_type === "staff";
        const isSystem = message.author_type === "system" || message.author_type === "ai";

        return (
          <div
            key={index}
            className={`rounded-2xl border p-4 ${
              isSystem
                ? "border-purple-400/20 bg-purple-500/10"
                : isStaff
                  ? "border-blue-400/20 bg-blue-500/10"
                  : "border-white/10 bg-black/25"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-300">
                {message.author_display_name || (isStaff ? "Staff" : "You")}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-100">
              {message.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function NewTicketForm({
  isLoggedIn,
  onCreated,
}: {
  isLoggedIn: boolean;
  onCreated: (result: { ticketNumber: number; guestAccessToken: string; isGuest: boolean }) => void;
}) {
  const [category, setCategory] = useState(TICKET_CATEGORIES[0].value);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const definition = getTicketCategoryDefinition(category);

  function updateAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function selectCategory(value: typeof category) {
    setCategory(value);
    setAnswers({});
    setError("");
  }

  const canSubmit = definition.questions
    .filter((question) => question.required)
    .every((question) => (answers[question.key] || "").trim());

  const requiresLoginButGuest = !definition.allowGuest && !isLoggedIn;

  async function handleSubmit() {
    setError("");

    if (requiresLoginButGuest) {
      setError("You must be logged in to submit this ticket type.");
      return;
    }

    if (!canSubmit) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    const subcategory = answers.subcategory || "";
    const subject = `${definition.label}${subcategory ? ` - ${subcategory}` : ""}`;

    const result = await createTicket({
      category,
      subcategory,
      subject,
      answers,
      minecraftUsername: answers.minecraft_ign,
      discordUsername: answers.discord_username,
    });

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error?.message || "Failed to create ticket.");
      return;
    }

    onCreated({
      ticketNumber: result.data.ticketNumber,
      guestAccessToken: result.data.guestAccessToken,
      isGuest: !isLoggedIn,
    });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {TICKET_CATEGORIES.map((entry) => (
          <button
            key={entry.value}
            type="button"
            onClick={() => selectCategory(entry.value)}
            className={`rounded-2xl border p-4 text-left transition ${
              category === entry.value
                ? "border-purple-300 bg-purple-500/20 text-white shadow-[0_0_25px_rgba(168,85,247,0.22)]"
                : "border-purple-500/20 bg-black/25 text-gray-300 hover:bg-white/10"
            }`}
          >
            <p className="font-black">{entry.label}</p>
            <p className="mt-1 text-xs leading-5 text-gray-400">{entry.description}</p>
            {!entry.allowGuest && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-yellow-300">
                <Lock className="h-3 w-3" />
                Login required
              </p>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6">
        {requiresLoginButGuest && (
          <div className="flex gap-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            You'll need to log in before this ticket type can be submitted. You
            can still fill out the form below, but log in first to send it.
          </div>
        )}

        {definition.questions.map((question) => (
          <label key={question.key} className="grid gap-2 text-sm font-bold text-gray-300">
            <span>
              {question.label}
              {question.required && <span className="text-yellow-300"> *</span>}
            </span>
            {question.type === "select" && (
              <select
                value={answers[question.key] || ""}
                onChange={(event) => updateAnswer(question.key, event.target.value)}
                className="rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 font-semibold text-white outline-none focus:border-purple-300"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {(question.options || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {question.type === "text" && (
              <input
                value={answers[question.key] || ""}
                onChange={(event) => updateAnswer(question.key, event.target.value)}
                placeholder={question.placeholder}
                className="rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 font-semibold text-white outline-none placeholder:text-gray-600 focus:border-purple-300"
              />
            )}
            {question.type === "textarea" && (
              <textarea
                value={answers[question.key] || ""}
                onChange={(event) => updateAnswer(question.key, event.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="resize-none rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 font-semibold text-white outline-none placeholder:text-gray-600 focus:border-purple-300"
              />
            )}
          </label>
        ))}

        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isSubmitting || requiresLoginButGuest} size="lg" className="py-4">
          <Send className="h-4 w-4" />
          {isSubmitting
            ? "Submitting..."
            : requiresLoginButGuest
              ? "Log In to Submit"
              : "Submit Ticket"}
        </Button>
      </div>
    </div>
  );
}

function MyTicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  async function loadTickets() {
    const result = await fetchMyTickets();
    setTickets(result.data);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadTickets();
    const unsubscribe = subscribeToTickets(() => {
      void loadTickets();
      if (expandedId) void loadMessages(expandedId);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMessages(ticketId: string) {
    const result = await fetchTicketMessages(ticketId);
    setMessages(result.data);
  }

  async function toggleExpand(ticketId: string) {
    if (expandedId === ticketId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(ticketId);
    await loadMessages(ticketId);
  }

  async function sendReply(ticketId: string) {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    await postTicketMessage({
      ticketId,
      body: replyText,
      authorType: "player",
      authorDisplayName: "You",
    });
    setReplyText("");
    setIsSendingReply(false);
    await loadMessages(ticketId);
  }

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading your tickets...</p>;
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-10 text-center">
        <TicketIcon className="mx-auto h-8 w-8 text-purple-300" />
        <p className="mt-4 text-gray-400">You haven't submitted any tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="rounded-[1.75rem] border border-purple-500/20 bg-white/[0.05] p-5">
          <button
            type="button"
            onClick={() => toggleExpand(ticket.id)}
            className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="font-black text-white">
                #{ticket.ticket_number} — {ticket.subject}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
            <StatusBadge status={ticket.status} />
          </button>

          {expandedId === ticket.id && (
            <div className="mt-4 grid gap-4 border-t border-purple-500/15 pt-4">
              <MessageThread messages={messages} />

              {ticket.status !== "closed" && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-300"
                  />
                  <Button onClick={() => sendReply(ticket.id)} disabled={isSendingReply}>
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GuestTicketView({ token }: { token: string }) {
  const [ticket, setTicket] = useState<GuestTicketSummary | null>(null);
  const [messages, setMessages] = useState<GuestTicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  async function load() {
    const [ticketResult, messagesResult] = await Promise.all([
      fetchGuestTicket(token),
      fetchGuestTicketMessages(token),
    ]);

    if (ticketResult.error || !ticketResult.data) {
      setNotice(ticketResult.error?.message || "Ticket not found.");
      setIsLoading(false);
      return;
    }

    setTicket(ticketResult.data);
    setMessages(messagesResult.data);
    setIsLoading(false);
  }

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function sendReply() {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    await postGuestTicketReply({ guestAccessToken: token, body: replyText, displayName: "Guest" });
    setReplyText("");
    setIsSendingReply(false);
    await load();
  }

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading ticket...</p>;
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-6 text-red-100">
        {notice || "Ticket not found."}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              Ticket #{ticket.ticket_number}
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">{ticket.subject}</h2>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        {ticket.resolution_note && (
          <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            {ticket.resolution_note}
          </p>
        )}
      </div>

      <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.05] p-6">
        <div className="mb-4 inline-flex items-center gap-2 text-sm font-black text-purple-200">
          <MessageSquareText className="h-4 w-4" />
          Conversation
        </div>
        <MessageThread messages={messages} />

        {ticket.status !== "closed" && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="Type a reply..."
              className="flex-1 rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-300"
            />
            <Button onClick={sendReply} disabled={isSendingReply}>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TicketsPage() {
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("token");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [view, setView] = useState<"new" | "mine">("new");
  const [createdSummary, setCreatedSummary] = useState<{
    ticketNumber: number;
    guestAccessToken: string;
    isGuest: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCurrentPortalUser().then(({ user }) => {
      setIsLoggedIn(Boolean(user));
      setIsCheckingAuth(false);
    });
  }, []);

  const guestTrackingUrl = useMemo(() => {
    if (!createdSummary) return "";
    return `${window.location.origin}/tickets?token=${createdSummary.guestAccessToken}`;
  }, [createdSummary]);

  async function copyTrackingUrl() {
    if (!guestTrackingUrl) return;
    try {
      await navigator.clipboard.writeText(guestTrackingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <PageShell
      seo={{
        title: "Support Tickets | Ellipsis SMP Minecraft Server",
        description:
          "Need help on Ellipsis SMP? Open a support ticket and our staff team will assist you with orders, account issues, and more.",
        path: "/tickets",
      }}
    >
      <section className="relative overflow-hidden bg-[#030014] px-4 py-20 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_30%)]" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-200">
            <TicketIcon className="h-4 w-4" />
            Ellipsis SMP Tickets
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            Get help from <GradientText>the Ellipsis SMP team.</GradientText>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
            Open a support request, submit a ban or mute appeal, or apply for a staff
            position — all tracked right here.
          </p>

          <div className="mt-10">
            {guestToken ? (
              <GuestTicketView token={guestToken} />
            ) : createdSummary ? (
              <div className="rounded-[2rem] border border-emerald-400/25 bg-emerald-400/10 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                  <h2 className="text-xl font-black text-white">
                    Ticket #{createdSummary.ticketNumber} submitted!
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                  Our team will respond as soon as possible.
                  {createdSummary.isGuest &&
                    " Save the link below to track your ticket and reply to staff."}
                </p>

                {createdSummary.isGuest && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      readOnly
                      value={guestTrackingUrl}
                      className="flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-mono text-sm text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={copyTrackingUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-400/20"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy Link"}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setCreatedSummary(null)}
                  className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-gray-200 hover:bg-white/10"
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <>
                {isLoggedIn && !isCheckingAuth && (
                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setView("new")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                        view === "new"
                          ? "border-purple-300 bg-purple-500/20 text-white"
                          : "border-white/10 bg-black/20 text-gray-300"
                      }`}
                    >
                      New Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("mine")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                        view === "mine"
                          ? "border-purple-300 bg-purple-500/20 text-white"
                          : "border-white/10 bg-black/20 text-gray-300"
                      }`}
                    >
                      My Tickets
                    </button>
                  </div>
                )}

                {view === "new" || !isLoggedIn ? (
                  <NewTicketForm isLoggedIn={isLoggedIn} onCreated={setCreatedSummary} />
                ) : (
                  <MyTicketsPanel />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
