import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Search } from "lucide-react";
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
  open: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  claimed: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  resolved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  closed: "border-gray-400/25 bg-gray-500/10 text-gray-200",
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
      <div className="grid gap-3 rounded-[1.75rem] border border-purple-500/20 bg-white/[0.045] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ticket #, IGN, Discord, email..."
            className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-11 py-3 text-white outline-none lg:max-w-xl"
          />
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                activeFilter === filter.value
                  ? "border-purple-300 bg-purple-500/25 text-white"
                  : "border-purple-500/25 bg-white/[0.04] text-purple-200 hover:bg-white/[0.08]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {filteredTickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => setSelectedTicket(ticket)}
            className="rounded-[1.5rem] border border-purple-500/20 bg-white/[0.045] p-5 text-left transition hover:border-purple-300/40 hover:bg-white/[0.08]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-black uppercase text-purple-200">
                    {categoryLabels[ticket.category] || ticket.category}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${statusStyles[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-2 font-black text-white">
                  #{ticket.ticket_number} — {ticket.subject}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {ticket.minecraft_username || ticket.opened_by_email || "Guest"} ·{" "}
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </button>
        ))}

        {filteredTickets.length === 0 && (
          <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.02] p-10 text-center">
            <p className="text-gray-400">No tickets found matching your filters.</p>
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
