import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type OrderStatus = "pending" | "verified" | "rejected" | "delivered";
type StatusFilter = "all" | OrderStatus;

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

const filters: { label: string; value: StatusFilter }[] = [
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

function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [receiptPreviewLabel, setReceiptPreviewLabel] = useState("");

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
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setIsLoggedIn(true);
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setOrders([]);
    setLastUpdated("");
    setReceiptPreviewUrl("");
    setReceiptPreviewLabel("");
  }

  async function updateOrderStatus(id: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    loadOrders();
  }

  async function updateStaffNotes(id: string, currentNotes: string | null) {
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
      if (isMounted && data.session) {
        setIsLoggedIn(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    loadOrders();

    const intervalId = window.setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] px-4 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
            Ellipsis SMP Admin
          </p>
          <h1 className="mt-4 text-3xl font-black">Staff Login</h1>

          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              onClick={login}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black"
            >
              Login
            </button>

            {message && <p className="text-sm text-red-300">{message}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP Admin
            </p>
            <h1 className="mt-3 text-4xl font-black">Orders Dashboard</h1>
          </div>

          <button
            onClick={logout}
            className="rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 font-black"
          >
            Logout
          </button>
        </div>

        {lastUpdated && (
          <p className="mt-4 text-sm font-bold text-purple-200">
            Last updated: {lastUpdated}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Pending", stats.pending],
            ["Verified", stats.verified],
            ["Delivered", stats.delivered],
            ["Rejected", stats.rejected],
            ["Revenue", `PHP ${stats.revenue}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[1.5rem] border border-purple-500/25 bg-white/[0.06] p-5"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                {label}
              </p>
              <p className="mt-3 text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by IGN, Discord, order ID, product..."
            className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-3 text-white outline-none lg:max-w-lg"
          />

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${activeFilter === filter.value
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
              className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 shadow-[0_0_40px_rgba(168,85,247,0.12)]"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase text-yellow-200">
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-black">{order.product_name}</h2>
                  <p className="mt-1 font-black text-yellow-300">{order.product_price}</p>

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
                    onClick={() => openReceipt(order.receipt_url)}
                    className="rounded-2xl border border-purple-500/25 bg-black/30 px-4 py-3 font-black"
                  >
                    View Receipt
                  </button>

                  <button
                    onClick={() => updateStaffNotes(order.id, order.staff_notes)}
                    className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 font-black text-yellow-200"
                  >
                    Staff Notes
                  </button>

                  <button
                    onClick={() => updateOrderStatus(order.id, "verified")}
                    className="rounded-2xl bg-emerald-500/20 px-4 py-3 font-black text-emerald-200"
                  >
                    Verify
                  </button>

                  <button
                    onClick={() => updateOrderStatus(order.id, "delivered")}
                    className="rounded-2xl bg-blue-500/20 px-4 py-3 font-black text-blue-200"
                  >
                    Mark Delivered
                  </button>

                  <button
                    onClick={() => updateOrderStatus(order.id, "rejected")}
                    className="rounded-2xl bg-red-500/20 px-4 py-3 font-black text-red-200"
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
                onClick={() => setReceiptPreviewUrl("")}
                className="rounded-2xl border border-purple-500/25 bg-white/[0.06] px-5 py-3 text-sm font-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}    </main>
  );
}

export default AdminPage;
