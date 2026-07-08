type PremiumBadgeProps = {
  children: string;
  tone?: "purple" | "blue" | "yellow" | "green" | "pink" | "red";
};

const tones = {
  purple: "border-purple-400/25 bg-purple-500/10 text-purple-200",
  blue: "border-blue-400/25 bg-blue-500/10 text-blue-200",
  yellow: "border-yellow-400/25 bg-yellow-500/10 text-yellow-200",
  green: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  pink: "border-pink-400/25 bg-pink-500/10 text-pink-200",
  red: "border-red-400/25 bg-red-500/10 text-red-200",
};

function PremiumBadge({ children, tone = "purple" }: PremiumBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default PremiumBadge;
