export type OrderStatusValue = "pending" | "verified" | "delivered" | "rejected";

type StatusChipProps = {
  status: OrderStatusValue;
  className?: string;
};

const statusLabels: Record<OrderStatusValue, string> = {
  pending: "Pending",
  verified: "Verified",
  delivered: "Delivered",
  rejected: "Rejected",
};

const statusClasses: Record<OrderStatusValue, string> = {
  pending: "text-[#fbbf24] bg-[rgba(251,191,36,0.14)] border-[rgba(251,191,36,0.25)]",
  verified: "text-[#60a5fa] bg-[rgba(96,165,250,0.14)] border-[rgba(96,165,250,0.25)]",
  delivered: "text-[#34d399] bg-[rgba(52,211,153,0.14)] border-[rgba(52,211,153,0.25)]",
  rejected: "text-[#f87171] bg-[rgba(248,113,113,0.14)] border-[rgba(248,113,113,0.25)]",
};

function StatusChip({ status, className = "" }: StatusChipProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${statusClasses[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export default StatusChip;
