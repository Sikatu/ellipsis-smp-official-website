import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  HelpCircle,
  PackageCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  Ticket,
  Truck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";

type OrderStatus = "pending" | "verified" | "delivered" | "rejected";

type TrackedOrder = {
  created_at: string;
  product_name: string;
  product_price: string;
  payment_reference: string;
  status: OrderStatus;
};

const supportCards = [
  {
    icon: ReceiptText,
    title: "Receipt-based tracking",
    description: "Orders are linked to the payment claim submitted during checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Manual verification",
    description: "Staff checks the receipt before approving and delivering the purchase.",
  },
  {
    icon: Ticket,
    title: "Ticket fallback",
    description: "If something looks wrong, open a Discord ticket with your order ID.",
  },
];

const statusMeta: Record<
  OrderStatus,
  {
    label: string;
    title: string;
    description: string;
    tone: string;
    icon: typeof Clock3;
  }
> = {
  pending: {
    label: "Pending",
    title: "Waiting for staff verification",
    description:
      "Your claim was received. Staff still needs to check the receipt and order details.",
    tone: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100",
    icon: Clock3,
  },
  verified: {
    label: "Verified",
    title: "Payment verified",
    description:
      "Staff confirmed the payment. Your purchase is waiting for in-game delivery.",
    tone: "border-blue-400/30 bg-blue-500/10 text-blue-100",
    icon: ShieldCheck,
  },
  delivered: {
    label: "Delivered",
    title: "Purchase delivered",
    description:
      "Your purchase has been delivered in-game. Keep the order ID for your records.",
    tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    icon: PackageCheck,
  },
  rejected: {
    label: "Needs Review",
    title: "Order needs staff review",
    description:
      "The claim was rejected or could not be verified. Please contact staff through Discord.",
    tone: "border-red-400/30 bg-red-500/10 text-red-100",
    icon: AlertTriangle,
  },
};

const timelineSteps: {
  status: Exclude<OrderStatus, "rejected">;
  title: string;
  description: string;
  icon: typeof Clock3;
}[] = [
  {
    status: "pending",
    title: "Claim Submitted",
    description: "Your payment claim and receipt were received.",
    icon: ReceiptText,
  },
  {
    status: "verified",
    title: "Payment Verified",
    description: "Staff confirmed your payment and order details.",
    icon: ShieldCheck,
  },
  {
    status: "delivered",
    title: "Delivered In-Game",
    description: "Your purchase has been delivered to your account.",
    icon: Truck,
  },
];

const statusOrder: Exclude<OrderStatus, "rejected">[] = [
  "pending",
  "verified",
  "delivered",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeStatus = order ? statusMeta[order.status] : null;
  const ActiveStatusIcon = activeStatus?.icon;

  const currentStepIndex = useMemo(() => {
    if (!order || order.status === "rejected") return -1;
    return statusOrder.indexOf(order.status);
  }, [order]);

  async function trackOrder(referenceOverride?: string) {
    setMessage("");
    setOrder(null);
    setCopied(false);

    const reference = (referenceOverride || orderId).trim().toUpperCase();

    if (!reference) {
      setMessage("Please enter your order ID.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .rpc("track_order", { order_reference: reference })
      .single();

    setIsLoading(false);

    if (error || !data) {
      setMessage("Order not found. Please check your order ID.");
      return;
    }

    setOrder(data as TrackedOrder);
  }

  async function copyOrderId() {
    if (!order?.payment_reference) return;

    try {
      await navigator.clipboard.writeText(order.payment_reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderReference = params.get("order");

    if (orderReference) {
      setOrderId(orderReference.toUpperCase());
      void trackOrder(orderReference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#030014] px-4 py-28 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-6 shadow-[0_0_70px_rgba(168,85,247,0.18)] backdrop-blur-xl sm:p-8 md:p-10">
            <div className="absolute right-[-7rem] top-[-7rem] h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-[-8rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-black uppercase text-purple-300">
                Track Order 3.0
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
                Check your payment claim and{" "}
                <GradientText>delivery status.</GradientText>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
                Enter your Ellipsis order ID to see whether your payment is
                pending, verified, delivered, or needs staff review.
              </p>

              <div className="mt-8 rounded-[1.5rem] border border-purple-500/25 bg-black/35 p-4 sm:p-5">
                <label
                  htmlFor="order-id"
                  className="text-xs font-black uppercase text-purple-300"
                >
                  Order ID
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    id="order-id"
                    value={orderId}
                    onChange={(event) => {
                      setOrderId(event.target.value.toUpperCase());
                      setMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void trackOrder();
                      }
                    }}
                    placeholder="Example: ELS-MR5Q467W"
                    autoComplete="off"
                    className="min-h-[56px] w-full rounded-2xl border border-purple-500/25 bg-black/45 px-4 py-4 font-black uppercase text-white outline-none transition placeholder:text-gray-600 focus:border-purple-300"
                  />

                  <Button
                    onClick={() => void trackOrder()}
                    disabled={isLoading}
                    size="lg"
                    className="min-h-[56px] py-4"
                  >
                    <Search className="h-4 w-4" />
                    {isLoading ? "Checking..." : "Track Order"}
                  </Button>
                </div>

                {message && (
                  <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {supportCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-[1.5rem] border border-purple-500/20 bg-white/[0.055] p-5 backdrop-blur-xl"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">
                        {card.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              to="/tickets"
              className="group rounded-[1.5rem] border border-yellow-400/25 bg-yellow-400/10 p-5 text-yellow-100 transition hover:-translate-y-1 hover:border-yellow-300/60 hover:bg-yellow-400/15"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/35 text-yellow-200">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Need order help?
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-yellow-50/85">
                      Open a ticket and include your order ID, Minecraft
                      username, and receipt screenshot.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {order && activeStatus && ActiveStatusIcon && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div
              className={`rounded-[2rem] border p-6 shadow-[0_0_45px_rgba(168,85,247,0.12)] backdrop-blur-xl ${activeStatus.tone}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/35">
                  <ActiveStatusIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase">
                    {activeStatus.label}
                  </p>
                  <h2 className="mt-2 text-3xl font-black leading-tight text-white">
                    {activeStatus.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-gray-100/85">
                    {activeStatus.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-black uppercase text-white/70">
                  Order Summary
                </p>
                <h3 className="mt-3 break-words text-2xl font-black text-white">
                  {order.product_name}
                </h3>
                <p className="mt-2 text-2xl font-black text-yellow-300">
                  {order.product_price}
                </p>

                <div className="mt-5 grid gap-3 text-sm text-gray-100">
                  <div className="rounded-2xl bg-white/[0.055] p-3">
                    <p className="text-xs font-black uppercase text-white/50">
                      Order ID
                    </p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-mono text-lg font-black text-white">
                        {order.payment_reference}
                      </span>
                      <button
                        type="button"
                        onClick={copyOrderId}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs font-black text-white transition hover:bg-white/10"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.055] p-3">
                    <p className="text-xs font-black uppercase text-white/50">
                      Submitted
                    </p>
                    <p className="mt-2 font-bold text-white">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-purple-500/25 bg-white/[0.06] p-5 backdrop-blur-xl sm:p-6">
              <p className="text-xs font-black uppercase text-purple-300">
                Delivery Timeline
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">
                What happens next?
              </h2>

              <div className="mt-5 grid gap-3">
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isComplete =
                    order.status !== "rejected" && index <= currentStepIndex;
                  const isCurrent =
                    order.status !== "rejected" && index === currentStepIndex;

                  return (
                    <div
                      key={step.status}
                      className={`rounded-2xl border p-4 transition ${
                        isComplete
                          ? "border-emerald-400/30 bg-emerald-500/10"
                          : "border-purple-500/20 bg-black/30"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isComplete
                              ? "bg-emerald-400/15 text-emerald-200"
                              : "bg-purple-500/15 text-purple-200"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-white">
                            {isComplete ? "Complete - " : ""}
                            {step.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-gray-300">
                            {step.description}
                          </p>
                          {isCurrent && (
                            <p className="mt-2 inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-200">
                              Current step
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {order.status === "rejected" && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/15 text-red-200">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-red-100">
                          Staff review required
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-300">
                          Open a Discord ticket and include your order ID so
                          staff can review the issue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-purple-500/20 bg-white/[0.055] p-5 backdrop-blur-xl">
            <HelpCircle className="mb-3 h-6 w-6 text-purple-200" />
            <h2 className="font-black text-white">Where is my order ID?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              It appears after checkout submission and looks like
              <span className="font-black text-purple-200"> ELS-...</span>.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-purple-500/20 bg-white/[0.055] p-5 backdrop-blur-xl">
            <Clock3 className="mb-3 h-6 w-6 text-yellow-300" />
            <h2 className="font-black text-white">How long does it take?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Manual verification usually depends on staff availability and
              receipt clarity.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="group rounded-[1.5rem] border border-purple-500/20 bg-white/[0.055] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-purple-300/50 hover:bg-white/[0.08]"
          >
            <PackageCheck className="mb-3 h-6 w-6 text-emerald-300" />
            <h2 className="font-black text-white">Need another purchase?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Return to the marketplace and start a new checkout.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-black text-purple-200">
              Open marketplace
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}

export default TrackOrderPage;
