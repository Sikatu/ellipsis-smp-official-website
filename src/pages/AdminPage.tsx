import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Clock3,
  LogOut,
  PackageCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  XCircle,
  RefreshCcw,
  AlertOctagon,
} from "lucide-react";
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
import { AdminMinecraftActionCenter } from "../components/admin/AdminMinecraftActionCenter";
import { AdminAnnouncementCenter } from "../components/admin/AdminAnnouncementCenter";
import { AdminServerOperationsPanel } from "../components/admin/AdminServerOperationsPanel";
import { AdminSettingsPanel } from "../components/admin/AdminSettingsPanel";
import { AdminStaffPanel } from "../components/admin/AdminStaffPanel";
import { AdminStaffActivityPanel } from "../components/admin/AdminStaffActivityPanel";
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

    return { pending, verified, delivered, rejected, needsAttention, revenue };
  }, [orders]);

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
    <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP Admin
            </p>
            <h1 className="mt-3 text-4xl font-black">Admin Dashboard</h1>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-bold text-gray-300">
                {getAdminDisplayName(adminProfile)}
              </span>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${adminProfile?.role === "owner" ? "border-purple-500/50 bg-purple-500/20 text-purple-200" :
                adminProfile?.role === "manager" ? "border-blue-500/50 bg-blue-500/20 text-blue-200" :
                  "border-gray-500/50 bg-gray-500/20 text-gray-200"
                }`}>
                {adminProfile?.role}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-400 max-w-xl">
              <strong>Permissions:</strong> {adminProfile?.role ? roleDescriptions[adminProfile.role] : "Loading..."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-white/[0.06] px-4 py-3 text-sm font-black transition hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>

            {lastUpdated && (
              <div className={`flex items-center rounded-2xl border px-4 py-3 text-sm font-bold ${realtimeStatus === "error"
                ? "border-red-500/20 bg-red-500/10 text-red-200"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                }`}>
                {realtimeStatus === "live" && (
                  <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
                {realtimeStatus === "error" && (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                {realtimeStatus === "error" ? "Offline" : `Live (Updated ${lastUpdated})`}
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 font-black transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { label: "Needs Attention", value: stats.needsAttention, icon: AlertOctagon, alert: stats.needsAttention > 0 },
            { label: "Pending", value: stats.pending, icon: Clock3 },
            { label: "Verified", value: stats.verified, icon: ShieldCheck },
            { label: "Delivered", value: stats.delivered, icon: PackageCheck },
            { label: "Rejected", value: stats.rejected, icon: XCircle },
            { label: "Revenue", value: `PHP ${stats.revenue}`, icon: ReceiptText },
          ].map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`rounded-[1.5rem] border p-5 ${stat.alert
                  ? "border-red-500/50 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  : "border-purple-500/25 bg-white/[0.06]"
                  }`}
              >
                <StatIcon className={`h-5 w-5 ${stat.alert ? "text-red-300" : "text-purple-300"}`} />
                <p className={`mt-4 text-[10px] font-black uppercase tracking-[0.18em] ${stat.alert ? "text-red-200" : "text-purple-300"}`}>
                  {stat.label}
                </p>
                <p className={`mt-2 text-2xl font-black ${stat.alert ? "text-white" : ""}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        <AdminStaffApproval userRole={adminProfile?.role} />

        <AdminDashboardTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" && (
          <AdminCommandCenter
            orders={orders}
            stats={stats}
            needsAttentionOrders={orders.filter(orderNeedsAttention)}
            realtimeStatus={realtimeStatus}
            lastUpdated={lastUpdated}
            onNavigate={setActiveTab}
            onSetOrderFilter={setActiveFilter}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === "orders" && (
          <>
            <div className="grid gap-3 rounded-[1.75rem] border border-purple-500/20 bg-white/[0.045] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by IGN, Discord, order ID, product..."
                  className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-11 py-3 text-white outline-none lg:max-w-xl"
                />
              </div>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${activeFilter === filter.value
                      ? filter.value === "needs_attention"
                        ? "border-red-400 bg-red-500/30 text-white"
                        : "border-purple-300 bg-purple-500/25 text-white"
                      : filter.value === "needs_attention"
                        ? "border-red-500/25 bg-white/[0.04] text-red-300 hover:bg-white/[0.08]"
                        : "border-purple-500/25 bg-white/[0.04] text-purple-200 hover:bg-white/[0.08]"
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
                {message}
              </div>
            )}

            <div className="mt-8 grid gap-4">
              {filteredOrders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  canManageOrders={hasManageRights}
                  onViewReceipt={openReceipt}
                  onEditNotes={(order) => setEditingNotesOrder(order)}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
              {filteredOrders.length === 0 && (
                <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.02] p-10 text-center">
                  <p className="text-gray-400">No orders found matching your filters.</p>
                </div>
              )}
            </div>
          </>        )}

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
          <AdminServerOperationsPanel canManageServer={hasManageRights} />
        )}

        {activeTab === "activity" && (
          <AdminStaffActivityPanel />
        )}

        {activeTab === "staff" && (
          <AdminStaffPanel profile={adminProfile} />
        )}

        {activeTab === "logs" && (
          <div className="mt-6">
            <h2 className="mb-4 text-2xl font-black">Global Audit Log</h2>
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














