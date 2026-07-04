import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Clock3,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  MailPlus,
  NotebookPen,
  PackageCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type OrderStatus = "pending" | "verified" | "rejected" | "delivered";
type StatusFilter = "all" | OrderStatus;
type AdminRole = "owner" | "manager" | "support";
type AdminStatus = "pending" | "approved" | "rejected";
type AccessState = "checking" | "signed-out" | "approved" | "pending" | "rejected" | "setup";
type AuthMode = "login" | "register";

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  minecraft_username: string;
  discord_username: string | null;
  product_name: string;
  product_category: string;
  product_price: string;
  quantity: string | null;
  payment_method: string;
  payment_reference: string | null;
  receipt_url: string | null;
  status: OrderStatus;
  staff_notes: string | null;
};

type AdminProfile = {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  role: AdminRole;
  status: AdminStatus;
};

const filters: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Delivered", value: "delivered" },
  { label: "Rejected", value: "rejected" },
];

const roles: { label: string; value: AdminRole; description: string }[] = [
  { label: "Owner", value: "owner", description: "Full access and staff approval." },
  { label: "Manager", value: "manager", description: "Verify, deliver, reject, and add notes." },
  { label: "Support", value: "support", description: "View orders, receipts, and support info." },
];

const statusStyles: Record<OrderStatus, string> = {
  pending: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
  verified: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  delivered: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-400/25 bg-red-500/10 text-red-200",
};

function getNumericPrice(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function getAccessMessage(accessState: AccessState) {
  if (accessState === "pending") {
    return "Your admin account exists, but it is waiting for owner approval.";
  }

  if (accessState === "rejected") {
    return "This admin account is not approved. Contact the owner if this is a mistake.";
  }

  if (accessState === "setup") {
    return "Admin approval tables are not set up yet. Run the Admin 3.0 SQL setup in Supabase first.";
  }

  return "";
}

function AdminPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [authLoading, setAuthLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [receiptPreviewLabel, setReceiptPreviewLabel] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("support");
  const [inviteMessage, setInviteMessage] = useState("");

  const canManageOrders =
    adminProfile?.role === "owner" || adminProfile?.role === "manager";
  const canApproveStaff = adminProfile?.role === "owner";

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
      await requestPendingProfile(activeSession, displayName || userEmail);
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

  async function requestPendingProfile(activeSession: Session, name: string) {
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

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrders(data || []);
    setLastUpdated(new Date().toLocaleTimeString());
  }

  async function login() {
    setAuthLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setAuthLoading(false);

    if (error || !data.session) {
      setMessage(error?.message || "Login failed.");
      return;
    }

    setSession(data.session);
    await verifyAdminAccess(data.session);
  }

  async function register() {
    setAuthLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setAuthLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      setSession(data.session);
      await requestPendingProfile(data.session, displayName);
      await verifyAdminAccess(data.session);
      return;
    }

    setAccessState("signed-out");
    setAuthMode("login");
    setMessage("Account created. Check your email if confirmation is required, then ask the owner to approve your admin access.");
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

  async function approveAdminEmail() {
    setInviteMessage("");

    if (!canApproveStaff) return;

    const normalizedEmail = inviteEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setInviteMessage("Enter a staff email first.");
      return;
    }

    const { error } = await supabase.from("admin_profiles").upsert(
      {
        email: normalizedEmail,
        role: inviteRole,
        status: "approved",
      },
      { onConflict: "email" }
    );

    if (error) {
      setInviteMessage(error.message);
      return;
    }

    setInviteMessage(`Approved ${normalizedEmail} as ${inviteRole}.`);
    setInviteEmail("");
    setInviteRole("support");
  }

  async function logOrderAction(orderId: string, action: string, nextStatus?: OrderStatus) {
    if (!adminProfile) return;

    await supabase.from("order_audit_logs").insert({
      order_id: orderId,
      admin_user_id: session?.user.id || null,
      admin_email: adminProfile.email,
      action,
      next_status: nextStatus || null,
    });
  }

  async function updateOrderStatus(id: string, status: OrderStatus) {
    if (!canManageOrders) {
      setMessage("Your role can view orders, but cannot update status.");
      return;
    }

    const { error } = await supabase.from("orders").update({ status }).eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    void logOrderAction(id, "status_update", status);
    loadOrders();
  }

  async function updateStaffNotes(id: string, currentNotes: string | null) {
    if (!canManageOrders) {
      setMessage("Your role can view notes, but cannot update them.");
      return;
    }

    const nextNotes = window.prompt("Add or update staff notes:", currentNotes || "");

    if (nextNotes === null) return;

    const { error } = await supabase
      .from("orders")
      .update({ staff_notes: nextNotes.trim() || null })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    void logOrderAction(id, "staff_notes_update");
    loadOrders();
  }

  async function openReceipt(path: string | null) {
    setMessage("");

    if (!path) {
      setMessage("No receipt attached to this order.");
      return;
    }

    const possiblePaths = path.startsWith("payment-receipts/")
      ? [path]
      : [path, `payment-receipts/${path}`];

    for (const receiptPath of possiblePaths) {
      const { data, error } = await supabase.storage
        .from("receipts")
        .createSignedUrl(receiptPath, 300);

      if (!error && data?.signedUrl) {
        setReceiptPreviewUrl(data.signedUrl);
        setReceiptPreviewLabel(receiptPath.split("/").pop() || "Receipt");
        return;
      }
    }

    setMessage("Receipt file not found in storage.");
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = activeFilter === "all" || order.status === activeFilter;

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
    const revenue = orders
      .filter((order) => order.status === "verified" || order.status === "delivered")
      .reduce((total, order) => total + getNumericPrice(order.product_price), 0);

    return { pending, verified, delivered, rejected, revenue };
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

    loadOrders();

    const intervalId = window.setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessState]);

  if (accessState !== "approved") {
    const accessMessage = getAccessMessage(accessState);

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] px-4 py-10 text-white">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
              <Lock className="h-7 w-7" />
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP Admin
            </p>
            <h1 className="mt-4 text-3xl font-black">
              {authMode === "login" ? "Staff Login" : "Request Admin Access"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Staff may create their own credentials, but admin access only
              activates after the owner approves their email and role.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-purple-500/20 bg-black/35 p-1">
              {[
                ["login", "Login"],
                ["register", "Request Access"],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setAuthMode(mode as AuthMode);
                    setMessage("");
                  }}
                  className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                    authMode === mode
                      ? "bg-purple-500/25 text-white"
                      : "text-purple-200 hover:bg-white/[0.06]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {authMode === "register" && (
                <input
                  className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none focus:border-purple-300"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              )}

              <input
                className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none focus:border-purple-300"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none focus:border-purple-300"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                onClick={authMode === "login" ? login : register}
                disabled={authLoading || accessState === "checking"}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authMode === "login" ? (
                  <KeyRound className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {authLoading || accessState === "checking"
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>

              {session && (
                <button
                  type="button"
                  onClick={logout}
                  className="w-full rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 font-black text-purple-100"
                >
                  Logout
                </button>
              )}

              {(message || accessMessage) && (
                <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-100">
                  {message || accessMessage}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-purple-500/20 bg-white/[0.045] p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
              Safe Admin Flow
            </p>
            <h2 className="mt-4 text-3xl font-black text-white">
              Staff can create credentials. Access still stays protected.
            </h2>

            <div className="mt-6 grid gap-3">
              {[
                ["1", "Staff creates account", "They use email and password on this page."],
                ["2", "Owner approves email", "Approval happens from Supabase or the owner panel."],
                ["3", "Role controls access", "Owner, manager, and support have different permissions."],
              ].map(([step, title, description]) => (
                <div
                  key={step}
                  className="rounded-2xl border border-purple-500/20 bg-black/30 p-4"
                >
                  <p className="text-xs font-black uppercase text-purple-300">
                    Step {step}
                  </p>
                  <h3 className="mt-2 font-black text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-300">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
              No one gets admin dashboard access just because they signed up.
              They must be approved in the admin profile table first.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP Admin
            </p>
            <h1 className="mt-3 text-4xl font-black">Orders Dashboard</h1>
            <p className="mt-2 text-sm text-gray-400">
              Signed in as {adminProfile?.email} / {adminProfile?.role}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {lastUpdated && (
              <div className="rounded-2xl border border-purple-500/20 bg-white/[0.05] px-4 py-3 text-sm font-bold text-purple-200">
                Updated {lastUpdated}
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 font-black"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
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
                className="rounded-[1.5rem] border border-purple-500/25 bg-white/[0.06] p-5"
              >
                <StatIcon className="h-5 w-5 text-purple-300" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-black">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {canApproveStaff && (
          <div className="mt-6 rounded-[1.75rem] border border-blue-400/20 bg-blue-500/10 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-blue-300">
                  Owner Staff Approval
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Approve a staff email
                </h2>
                <p className="mt-2 text-sm text-blue-100/80">
                  Staff can register first. Approve their email here to unlock
                  dashboard access.
                </p>
              </div>

              <div className="grid flex-1 gap-3 lg:max-w-2xl lg:grid-cols-[1fr_150px_auto]">
                <input
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="staff@email.com"
                  className="rounded-2xl border border-blue-400/25 bg-black/35 px-4 py-3 text-white outline-none"
                />
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as AdminRole)}
                  className="rounded-2xl border border-blue-400/25 bg-black/35 px-4 py-3 text-white outline-none"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={approveAdminEmail}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500/25 px-5 py-3 font-black text-blue-100"
                >
                  <MailPlus className="h-4 w-4" />
                  Approve
                </button>
              </div>
            </div>

            {inviteMessage && (
              <p className="mt-4 rounded-2xl border border-blue-300/20 bg-black/20 p-3 text-sm font-bold text-blue-100">
                {inviteMessage}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-3 rounded-[1.75rem] border border-purple-500/20 bg-white/[0.045] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
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
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  activeFilter === filter.value
                    ? "border-purple-300 bg-purple-500/25 text-white"
                    : "border-purple-500/25 bg-white/[0.04] text-purple-200"
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
            <article
              key={order.id}
              className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-5 shadow-[0_0_40px_rgba(168,85,247,0.12)] sm:p-6"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h2 className="mt-3 break-words text-2xl font-black">
                    {order.product_name}
                  </h2>
                  <p className="mt-1 font-black text-yellow-300">
                    {order.product_price}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-gray-300 sm:grid-cols-2 lg:grid-cols-3">
                    <p><strong>Order:</strong> {order.payment_reference || order.id}</p>
                    <p><strong>IGN:</strong> {order.minecraft_username}</p>
                    <p><strong>Discord:</strong> {order.discord_username || "N/A"}</p>
                    <p><strong>Customer:</strong> {order.customer_name}</p>
                    <p><strong>Category:</strong> {order.product_category}</p>
                    <p><strong>Quantity:</strong> {order.quantity || "N/A"}</p>
                    <p><strong>Payment:</strong> {order.payment_method}</p>
                    <p><strong>Staff Notes:</strong> {order.staff_notes || "None"}</p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[260px] lg:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => openReceipt(order.receipt_url)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/25 bg-black/30 px-4 py-3 font-black"
                  >
                    <Eye className="h-4 w-4" />
                    View Receipt
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStaffNotes(order.id, order.staff_notes)}
                    disabled={!canManageOrders}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 font-black text-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <NotebookPen className="h-4 w-4" />
                    Staff Notes
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, "verified")}
                    disabled={!canManageOrders}
                    className="rounded-2xl bg-emerald-500/20 px-4 py-3 font-black text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Verify
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, "delivered")}
                    disabled={!canManageOrders}
                    className="rounded-2xl bg-blue-500/20 px-4 py-3 font-black text-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mark Delivered
                  </button>

                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, "rejected")}
                    disabled={!canManageOrders}
                    className="rounded-2xl bg-red-500/20 px-4 py-3 font-black text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}

          {filteredOrders.length === 0 && (
            <div className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-8 text-center text-gray-300">
              No matching orders.
            </div>
          )}
        </div>
      </div>

      {receiptPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-purple-500/30 bg-[#080018] shadow-[0_0_80px_rgba(168,85,247,0.35)]">
            <div className="flex items-center justify-between border-b border-purple-500/20 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                  Receipt Preview
                </p>
                <p className="mt-1 text-sm text-gray-300">{receiptPreviewLabel}</p>
              </div>

              <button
                type="button"
                onClick={() => setReceiptPreviewUrl("")}
                className="rounded-xl border border-purple-500/25 bg-white/[0.06] px-4 py-2 text-sm font-black"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-5">
              <img
                src={receiptPreviewUrl}
                alt="Payment receipt"
                className="mx-auto max-h-[65vh] w-auto rounded-2xl border border-purple-500/20 object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-purple-500/20 p-5 sm:flex-row sm:justify-end">
              <a
                href={receiptPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-center text-sm font-black"
              >
                Open Full Size
              </a>

              <button
                type="button"
                onClick={() => setReceiptPreviewUrl("")}
                className="rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 text-sm font-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminPage;
