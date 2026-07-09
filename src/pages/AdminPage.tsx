import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { AdminAuth } from "../components/admin/AdminAuth";
import { AdminStaffApproval } from "../components/admin/AdminStaffApproval";
import { AdminOrderCard } from "../components/admin/AdminOrderCard";
import { StaffNotesModal } from "../components/admin/StaffNotesModal";
import { ReceiptPreviewModal } from "../components/admin/ReceiptPreviewModal";
import { AdminAuditLog } from "../components/admin/AdminAuditLog";
import { AdminDashboardTabs } from "../components/admin/AdminDashboardTabs";
import { AdminCommandCenter } from "../components/admin/AdminCommandCenter";
import type { AdminTab } from "../components/admin/AdminDashboardTabs";
import { AdminPlayersPanel } from "../components/admin/AdminPlayersPanel";
import { AdminTicketQueuePanel } from "../components/admin/AdminTicketQueuePanel";
import { AdminMinecraftActionCenter } from "../components/admin/AdminMinecraftActionCenter";
import { AdminAnnouncementCenter } from "../components/admin/AdminAnnouncementCenter";
import { AdminServerOperationsPanel } from "../components/admin/AdminServerOperationsPanel";
import { AdminSettingsPanel } from "../components/admin/AdminSettingsPanel";
import { AdminStaffPanel } from "../components/admin/AdminStaffPanel";
import { AdminStaffActivityPanel } from "../components/admin/AdminStaffActivityPanel";
import KpiTile from "../components/admin/KpiTile";
import { formatOrderAge, getOrderAgeMinutes } from "../lib/orderAge";
import {
  fetchOrders,
  getReceiptUrl,
  subscribeToOrders,
  updateOrderStatus,
  updateStaffNotesDb,
  notifyDiscordOrderAction,
} from "../services/admin";
import { createMinecraftActionForVerifiedOrder } from "../services/minecraftActions";
import type {
  AccessState,
  AdminProfile,
  AuthMode,
  Order,
  OrderStatus,
  StatusFilter,
} from "../types/admin";
import {
  roleDescriptions,
  canManageOrders,
  hasFullAccess,
  getAdminDisplayName,
} from "../lib/adminPermissions";

const NEEDS_ATTENTION_MINUTES = 30;

const filters: { label: string; value: StatusFilter }[] = [
  { label: "Needs Attention", value: "needs_attention" },
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Delivered", value: "delivered" },
  { label: "Rejected", value: "rejected" },
];

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: { title: "Command Center", subtitle: "Staff operations at a glance" },
  orders: { title: "Order Queue", subtitle: "Triage, verify, and deliver player purchases" },
  tickets: { title: "Tickets", subtitle: "Support requests, ban appeals, and staff applications" },
  players: { title: "Players", subtitle: "Linked accounts and player-facing history" },
  minecraft: { title: "Minecraft Queue", subtitle: "Automated and manual delivery actions" },
  announcements: { title: "Announcements", subtitle: "Broadcast messages to the server" },
  server_ops: { title: "Server Ops", subtitle: "Server-side operational controls" },
  activity: { title: "Staff Activity", subtitle: "Recent staff actions across the dashboard" },
  staff: { title: "Staff", subtitle: "Roster, roles, and permissions" },
  logs: { title: "Global Audit Log", subtitle: "Every status change and staff action" },
  settings: { title: "Settings", subtitle: "Dashboard and realtime configuration" },
};


function getNumericPrice(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function orderNeedsAttention(order: Order) {
  if (order.status === "rejected") return true;
  if (!order.minecraft_username) return true;
  if (!order.discord_username) return true;
  if (!order.receipt_url && !order.payment_reference) return true;

  if (order.status === "pending") {
    const minsSinceCreated = (new Date().getTime() - new Date(order.created_at).getTime()) / 60000;
    if (minsSinceCreated > NEEDS_ATTENTION_MINUTES) return true;
    if (!order.receipt_url) return true;
  }

  if (order.status === "verified") return true; // Verified but not delivered

  return false;
}

function AdminPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [accessState, setAccessState] = useState<AccessState>("checking");

  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");

  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [receiptPreviewLabel, setReceiptPreviewLabel] = useState("");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [editingNotesOrder, setEditingNotesOrder] = useState<Order | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const hasManageRights = canManageOrders(adminProfile?.role);
  const hasServerOpsAccess = hasFullAccess(adminProfile?.role);

  async function verifyAdminAccess(activeSession: Session) {
    setAccessState("checking");
    setMessage("");

    const userEmail = activeSession.user.email || "";
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("id,user_id,email,display_name,role,status")
      .or(`user_id.eq.${activeSession.user.id},email.eq.${userEmail.toLowerCase()}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setAdminProfile(null);
      setAccessState(error.code === "42P01" ? "setup" : "pending");
      setMessage(error.code === "42P01" ? "" : error.message);
      return;
    }

    if (!data) {
      setAdminProfile(null);
      setAccessState("pending");
      return;
    }

    const profile = data as AdminProfile;
    setAdminProfile(profile);

    if (profile.status === "approved") {
      setAccessState("approved");

      if (!profile.user_id) {
        await supabase
          .from("admin_profiles")
          .update({ user_id: activeSession.user.id })
          .eq("id", profile.id);
      }
      return;
    }

    setAccessState(profile.status);
  }

  async function loadOrders() {
    const { data, error } = await fetchOrders();
    if (error) {
      setMessage(error.message);
      return;
    }
    setOrders(data);
    setLastUpdated(new Date().toLocaleTimeString());
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setAdminProfile(null);
    setAccessState("signed-out");
    setOrders([]);
    setLastUpdated("");
    setReceiptPreviewUrl("");
    setReceiptPreviewLabel("");
  }

  async function handleRefresh() {
    setMessage("");
    setRealtimeStatus("connecting");
    await loadOrders();
    setRealtimeStatus("live");
  }

  async function handleUpdateStatus(id: string, status: OrderStatus) {
    setMessage("");

    const currentOrder = orders.find((order) => order.id === id);
    if (!currentOrder) {
      return { error: new Error("Order not found"), warning: null };
    }

    const previousStatus = currentOrder.status;

    const { error, warning } = await updateOrderStatus(
      id,
      previousStatus,
      status,
      adminProfile?.role,
      session,
      adminProfile
    );

    if (error) {
      setMessage(error.message);
      return { error, warning };
    }
    let minecraftWarning: string | null = null;

    if (status === "verified" && previousStatus !== "verified") {
      const automationResult = await createMinecraftActionForVerifiedOrder(currentOrder);

      if (automationResult.error) {
        minecraftWarning = `Order verified, but Minecraft action automation failed: ${automationResult.error.message}`;
      } else if (automationResult.warning) {
        minecraftWarning = automationResult.warning;
      }
    }

    const notifyResult = await notifyDiscordOrderAction(
      currentOrder,
      status,
      previousStatus,
      session,
      adminProfile
    );

    const discordWarning = notifyResult.error
      ? `Order updated, but Discord notification failed: ${notifyResult.error.message}`
      : null;

    const warnings = [warning, minecraftWarning, discordWarning].filter(
      (item): item is string => Boolean(item),
    );
    const finalWarning = warnings.length > 0 ? warnings.join(" ") : null;

    if (finalWarning) {
      setMessage(finalWarning);
    }

    return { error: null, warning: finalWarning };
  }
  async function handleSaveNotes(notes: string) {
    if (!editingNotesOrder) return;
    const { error } = await updateStaffNotesDb(
      editingNotesOrder.id,
      notes.trim() || null,
      adminProfile?.role,
      session,
      adminProfile
    );
    if (error) throw error;
  }

  async function openReceipt(path: string | null) {
    setMessage("");
    const { signedUrl, label, error } = await getReceiptUrl(path);

    if (error || !signedUrl) {
      setMessage(error?.message || "Failed to load receipt.");
      return;
    }

    setReceiptPreviewUrl(signedUrl);
    setReceiptPreviewLabel(label || "Receipt");
    setIsReceiptModalOpen(true);
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      let matchesFilter = false;
      if (activeFilter === "all") matchesFilter = true;
      else if (activeFilter === "needs_attention") matchesFilter = orderNeedsAttention(order);
      else matchesFilter = order.status === activeFilter;

      const searchable = [
        order.payment_reference,
        order.customer_name,
        order.minecraft_username,
        order.discord_username,
        order.product_name,
        order.product_category,
        order.payment_method,
        order.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchable.includes(query);
    });
  }, [activeFilter, orders, search]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "pending").length;
    const verified = orders.filter((order) => order.status === "verified").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;
    const rejected = orders.filter((order) => order.status === "rejected").length;
    const needsAttention = orders.filter(orderNeedsAttention).length;
    const revenue = orders
      .filter((order) => order.status === "verified" || order.status === "delivered")
      .reduce((total, order) => total + getNumericPrice(order.product_price), 0);

    const oldestPendingMinutes = orders
      .filter((order) => order.status === "pending")
      .reduce((oldest, order) => Math.max(oldest, getOrderAgeMinutes(order)), 0);

    return { pending, verified, delivered, rejected, needsAttention, revenue, oldestPendingMinutes };
  }, [orders]);

  const groupedOrders = useMemo(() => {
    const groups: { reference: string; orders: Order[] }[] = [];
    const indexByReference = new Map<string, number>();

    filteredOrders.forEach((order) => {
      const reference = order.payment_reference || order.id;
      const existingIndex = indexByReference.get(reference);

      if (existingIndex === undefined) {
        indexByReference.set(reference, groups.length);
        groups.push({ reference, orders: [order] });
      } else {
        groups[existingIndex].orders.push(order);
      }
    });

    return groups;
  }, [filteredOrders]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (!data.session) {
        setAccessState("signed-out");
        return;
      }
      setSession(data.session);
      void verifyAdminAccess(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setAdminProfile(null);
        setAccessState("signed-out");
        return;
      }
      void verifyAdminAccess(nextSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accessState !== "approved") return;

    loadOrders().then(() => setRealtimeStatus("live"));
    const unsubscribe = subscribeToOrders(
      () => {
        loadOrders();
      },
      (err) => {
        console.error(err);
        setRealtimeStatus("error");
      }
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessState]);

  if (accessState !== "approved") {
    return (
      <AdminAuth
        authMode={authMode}
        setAuthMode={setAuthMode}
        accessState={accessState}
        setAccessState={setAccessState}
        setSession={setSession}
        verifyAdminAccess={verifyAdminAccess}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a14] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminDashboardTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          ordersBadgeCount={stats.needsAttention}
          staffName={getAdminDisplayName(adminProfile)}
          staffRole={adminProfile?.role}
        />

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold">{tabTitles[activeTab].title}</h1>
                <p className="mt-1 text-[13px] text-[#9aa0b8]">{tabTitles[activeTab].subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {lastUpdated && (
                  <span
                    className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs font-bold ${
                      realtimeStatus === "error"
                        ? "border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#fca5a5]"
                        : "border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.08)] text-[#6ee7b7]"
                    }`}
                  >
                    {realtimeStatus === "live" && (
                      <span className="h-[7px] w-[7px] rounded-full bg-[#34d399]" />
                    )}
                    {realtimeStatus === "error" ? "Offline" : `Live · ${lastUpdated}`}
                  </span>
                )}

                <button
                  onClick={handleRefresh}
                  className="rounded-[10px] bg-[#a855f7] px-3.5 py-2 text-xs font-extrabold text-[#150829] transition hover:bg-[#9333ea]"
                >
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-[#9aa0b8] transition hover:bg-white/[0.06]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6b7192]">
              <span className="font-bold text-[#c4c9dc]">{getAdminDisplayName(adminProfile)}</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-bold uppercase tracking-wide text-[#9aa0b8]">
                {adminProfile?.role}
              </span>
              <span>{adminProfile?.role ? roleDescriptions[adminProfile.role] : "Loading..."}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiTile
                label="Needs Attention"
                value={stats.needsAttention}
                subline={
                  stats.oldestPendingMinutes > 0
                    ? `Oldest pending ${formatOrderAge(stats.oldestPendingMinutes)}`
                    : "All caught up"
                }
                tone="alert"
              />
              <KpiTile label="Pending" value={stats.pending} subline="Awaiting review" />
              <KpiTile label="Verified — deliver" value={stats.verified} subline="Ready to fulfill" />
              <KpiTile
                label="Revenue (today)"
                value={`PHP ${stats.revenue}`}
                subline="Verified & delivered"
              />
            </div>

            <div className="mt-5">
              <AdminStaffApproval userRole={adminProfile?.role} />
            </div>

        {activeTab === "overview" && (
          <AdminCommandCenter
            orders={orders}
            stats={stats}
            needsAttentionOrders={orders.filter(orderNeedsAttention)}
            realtimeStatus={realtimeStatus}
            lastUpdated={lastUpdated}
            canManagePlayers={hasManageRights}
            onNavigate={setActiveTab}
            onSetOrderFilter={setActiveFilter}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === "orders" && (
          <>
            <div className="grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7192]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by IGN, Discord, order ID, product..."
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

            {message && (
              <div className="mt-4 rounded-xl border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] p-4 text-sm text-[#fca5a5]">
                {message}
              </div>
            )}

            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <div
                className="hidden gap-3 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#565d78] sm:grid"
                style={{ gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr 0.9fr" }}
              >
                <span>Product / IGN</span>
                <span>Order ID</span>
                <span>Age</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              {groupedOrders.map((group) => (
                <div key={group.reference}>
                  {group.orders.length > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.015] px-4 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8b91ad]">
                        {group.reference} &middot; {group.orders.length} items
                      </p>
                      <span className="text-[13px] font-bold text-[#fde047]">
                        PHP{" "}
                        {group.orders.reduce(
                          (total, order) => total + getNumericPrice(order.product_price),
                          0
                        )}
                      </span>
                    </div>
                  )}

                  {group.orders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      order={order}
                      canManageOrders={hasManageRights}
                      onViewReceipt={openReceipt}
                      onEditNotes={(order) => setEditingNotesOrder(order)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="p-10 text-center">
                  <p className="text-[13px] text-[#6b7192]">No orders found matching your filters.</p>
                </div>
              )}
            </div>
          </>        )}

        {activeTab === "tickets" && (
          <AdminTicketQueuePanel
            canManageTickets={hasManageRights}
            userRole={adminProfile?.role}
            session={session}
            adminProfile={adminProfile}
          />
        )}

        {activeTab === "players" && (
          <AdminPlayersPanel orders={orders} canManagePlayers={hasManageRights} />
        )}

        {activeTab === "minecraft" && (
          <AdminMinecraftActionCenter canManagePlayers={hasManageRights} />
        )}

        {activeTab === "announcements" && (
          <AdminAnnouncementCenter />
        )}

        {activeTab === "server_ops" && (
          <AdminServerOperationsPanel canManageServer={hasServerOpsAccess} />
        )}

        {activeTab === "activity" && (
          <AdminStaffActivityPanel />
        )}

        {activeTab === "staff" && (
          <AdminStaffPanel profile={adminProfile} />
        )}

        {activeTab === "logs" && (
          <div className="mt-5">
            <AdminAuditLog isGlobal={true} />
          </div>
        )}

        {activeTab === "settings" && (
          <AdminSettingsPanel
            realtimeStatus={realtimeStatus}
            lastUpdated={lastUpdated}
            orderCount={orders.length}
          />
        )}
          </div>
        </div>
      </div>

      <StaffNotesModal
        isOpen={editingNotesOrder !== null}
        onClose={() => setEditingNotesOrder(null)}
        currentNotes={editingNotesOrder?.staff_notes || null}
        orderId={editingNotesOrder?.payment_reference || editingNotesOrder?.id || ""}
        onSave={handleSaveNotes}
      />

      <ReceiptPreviewModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        url={receiptPreviewUrl}
        label={receiptPreviewLabel}
      />
    </main>
  );
}

export default AdminPage;














