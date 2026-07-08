type KpiTileProps = {
  label: string;
  value: string | number;
  subline?: string;
  tone?: "neutral" | "alert";
};

function KpiTile({ label, value, subline, tone = "neutral" }: KpiTileProps) {
  const isAlert = tone === "alert";

  return (
    <div
      className={`rounded-[13px] border p-4 ${
        isAlert
          ? "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)]"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
    >
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
          isAlert ? "text-[#fca5a5]" : "text-[#8b91ad]"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-[30px] font-black leading-none ${
          isAlert ? "text-[#fca5a5]" : "text-white"
        }`}
      >
        {value}
      </p>
      {subline && (
        <p
          className={`mt-1 text-[11px] ${isAlert ? "text-[#f8717199]" : "text-[#6b7192]"}`}
        >
          {subline}
        </p>
      )}
    </div>
  );
}

export default KpiTile;
