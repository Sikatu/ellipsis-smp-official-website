import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type TrackedOrder = {
  created_at: string;
  product_name: string;
  product_price: string;
  payment_reference: string;
  status: "pending" | "verified" | "delivered" | "rejected";
};

function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [message, setMessage] = useState("");

  async function trackOrder(referenceOverride?: string) {
    setMessage("");
    setOrder(null);

    const reference = (referenceOverride || orderId).trim().toUpperCase();

    if (!reference) {
      setMessage("Please enter your order ID.");
      return;
    }

    const { data, error } = await supabase
      .rpc("track_order", { order_reference: reference })
      .single();

    if (error || !data) {
      setMessage("Order not found. Please check your order ID.");
      return;
    }

    setOrder(data as TrackedOrder);
  }


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderReference = params.get("order");

    if (orderReference) {
      setOrderId(orderReference.toUpperCase());
      trackOrder(orderReference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-28 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
          Ellipsis SMP
        </p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">Track Your Order</h1>
        <p className="mt-4 text-gray-300">
          Enter your order ID to check payment verification and delivery status.
        </p>

        <div className="mt-8 rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6">
          <input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Example: ELS-MR5Q467W"
            className="w-full rounded-2xl border border-purple-500/25 bg-black/40 px-4 py-4 font-black uppercase outline-none"
          />

          <button
            onClick={() => trackOrder()}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 font-black"
          >
            Track Order
          </button>

          {message && <p className="mt-4 text-sm font-bold text-red-300">{message}</p>}
        </div>

        {order && (
          <div className="mt-8 rounded-[2rem] border border-emerald-400/30 bg-emerald-500/10 p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              Order Found
            </p>
            <h2 className="mt-3 text-3xl font-black">{order.product_name}</h2>
            <p className="mt-2 text-xl font-black text-yellow-300">{order.product_price}</p>

            <div className="mt-6 grid gap-3 text-sm text-gray-200">
              <p><strong>Order ID:</strong> {order.payment_reference}</p>
              <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
              <p><strong>Submitted:</strong> {new Date(order.created_at).toLocaleString()}</p>
            </div>

            <div className="mt-8 grid gap-3">
              {[
                ["pending", "Claim Submitted", "Your payment claim was received."],
                ["verified", "Payment Verified", "Staff confirmed your payment."],
                ["delivered", "Delivered", "Your purchase has been delivered in-game."],
              ].map(([status, title, description]) => {
                const orderSteps = ["pending", "verified", "delivered"];
                const currentIndex = orderSteps.indexOf(order.status);
                const stepIndex = orderSteps.indexOf(status);
                const isComplete = order.status !== "rejected" && stepIndex <= currentIndex;

                return (
                  <div
                    key={status}
                    className={`rounded-2xl border p-4 ${
                      isComplete
                        ? "border-emerald-400/30 bg-emerald-500/10"
                        : "border-purple-500/25 bg-black/30"
                    }`}
                  >
                    <p className="font-black">{isComplete ? "Complete - " : ""}{title}</p>
                    <p className="mt-1 text-sm text-gray-300">{description}</p>
                  </div>
                );
              })}

              {order.status === "rejected" && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                  <p className="font-black text-red-200">Rejected</p>
                  <p className="mt-1 text-sm text-gray-300">
                    Your claim was rejected. Please contact staff through Discord.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default TrackOrderPage;
