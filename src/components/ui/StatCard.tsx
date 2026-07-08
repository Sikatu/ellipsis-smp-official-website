type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "emerald";
};

const toneClasses = {
  default: "text-white",
  emerald: "text-[#34d399]",
};

function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-[13px] border border-white/[0.08] bg-white/[0.02] p-[15px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8b91ad]">
        {label}
      </p>
      <p className={`mt-[7px] break-words text-[22px] font-black leading-none ${toneClasses[tone]}`}>
        {value}
      </p>
    </div>
  );
}

export default StatCard;
