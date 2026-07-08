type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "emerald";
};

const toneClasses = {
  default: "text-white",
  emerald: "text-emerald-300",
};

function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-purple-500/20 bg-white/[0.05] p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
        {label}
      </p>
      <p className={`mt-3 break-words text-2xl font-black ${toneClasses[tone]}`}>
        {value}
      </p>
    </div>
  );
}

export default StatCard;
