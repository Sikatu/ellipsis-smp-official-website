import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ChevronRight, Search } from "lucide-react";
import type { AdminProfile, AdminRole } from "../../types/admin";
import type { Ticket, TicketStatus } from "../../types/tickets";
import { fetchAllTickets, subscribeToTickets } from "../../services/tickets";
import { AdminTicketDetailModal } from "./AdminTicketDetailModal";

type AdminTicketQueuePanelProps = {
  canManageTickets: boolean;
  userRole: AdminRole | undefined;
  session: Session | null;
  adminProfile: AdminProfile | null;
};

const statusStyles: Record<TicketStatus, string> = {
  open: "text-[#fbbf24] bg-[rgba(251,191,36,0.14)] border-[rgba(251,191,36,0.25)]",
  claimed: "text-[#60a5fa] bg-[rgba(96,165,250,0.14)] border-[rgba(96,165,250,0.25)]",
  resolved: "text-[#34d399] bg-[rgba(52,211,153,0.14)] border-[rgba(52,211,153,0.25)]",
  closed: "text-[#8b91ad] bg-white/[0.05] border-white/[0.1]",
};

const filters: { label: string; value: TicketStatus | "all" }[] = [
  { label: "Open", value: "open" },
  { label: "Claimed", value: "claimed" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "All", value: "all" },
];

const categoryLabels: Record<string, string> = {
  support: "Support",
  ban_appeal: "Ban/Mute Appeal",
  staff_application: "Staff Application",
};

export function AdminTicketQueuePanel({
  canManageTickets,
  userRole,
  session,
  adminProfile,
}: AdminTicketQueuePanelProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "all">("open");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  async function loadTickets() {
    const { data } = await fetchAllTickets();
    setTickets(data);
  }

  useEffect(() => {
    void loadTickets();
    const unsubscribe = subscribeToTickets(() => void loadTickets());
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;
    const refreshed = tickets.find((ticket) => ticket.id === selectedTicket.id);
    if (refreshed) setSelectedTicket(refreshed);
  }, [tickets, selectedTicket]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesFilter = activeFilter === "all" || ticket.status === activeFilter;

      const searchable = [
        String(ticket.ticket_number),
        ticket.subject,
        ticket.minecraft_username,
        ticket.discord_username,
        ticket.opened_by_email,
        ticket.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchable.includes(query);
    });
  }, [tickets, activeFilter, search]);

  return (
    <>
      <div className="grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7192]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ticket #, IGN, Discord, email..."
            className="w-full rounded-[10px] border border-white/[0.08] bg-black/25 px-10 py-2.5 text-sm text-white outline-none placeholder:text-[#565d78] focus:border-white/20 lg:max-w-xl"
          />
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
                activeFilter === filter.value
                  ? "bg-[rgba(168,85,247,0.16)] text-[#e9d5ff]"
                  : "border border-white/[0.1] text-[#9aa0b8] hover:bg-white/[0.04]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <div
          className="hidden gap-3 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#565d78] sm:grid"
          style={{ gridTemplateColumns: "0.8fr 1.6fr 1fr 0.9fr auto" }}
        >
          <span>Ticket</span>
          <span>Subject</span>
          <span>Requester</span>
          <span>Age</span>
          <span>Status</span>
        </div>

        {filteredTickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => setSelectedTicket(ticket)}
            className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-white/[0.05] px-4 py-3.5 text-left text-[13px] transition last:border-b-0 hover:bg-white/[0.02] sm:grid-cols-[0.8fr_1.6fr_1fr_0.9fr_auto]"
          >
            <span className="font-mono text-xs text-[#9aa0b8]">
              #{ticket.ticket_number}
              <span className="ml-1.5 hidden font-sans text-[10px] font-bold uppercase tracking-wide text-[#6b7192] sm:inline">
                {categoryLabels[ticket.category] || ticket.category}
              </span>
            </span>

            <div className="min-w-0">
              <p className="truncate font-bold text-white">{ticket.subject}</p>
              <p className="mt-0.5 truncate text-[11px] text-[#8b91ad] sm:hidden">
                {ticket.minecraft_username || ticket.opened_by_email || "Guest"}
              </p>
            </div>

            <span className="hidden truncate text-[#9aa0b8] sm:block">
              {ticket.minecraft_username || ticket.opened_by_email || "Guest"}
            </span>

            <span className="hidden text-[#9aa0b8] sm:block">
              {new Date(ticket.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>

            <div className="flex items-center justify-end gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[ticket.status]}`}
              >
                {ticket.status}
              </span>
              <ChevronRight className="hidden h-4 w-4 shrink-0 text-[#6b7192] sm:block" />
            </div>
          </button>
        ))}

        {filteredTickets.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-[13px] text-[#6b7192]">No tickets found matching your filters.</p>
          </div>
        )}
      </div>

      <AdminTicketDetailModal
        isOpen={selectedTicket !== null}
        ticket={selectedTicket}
        canManageTickets={canManageTickets}
        userRole={userRole}
        session={session}
        adminProfile={adminProfile}
        onClose={() => setSelectedTicket(null)}
        onChanged={loadTickets}
      />
    </>
  );
}
