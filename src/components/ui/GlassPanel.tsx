import { type ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
};

function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`rounded-[2rem] border border-purple-500/20 bg-white/[0.06] shadow-[0_0_45px_rgba(168,85,247,0.12)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export default GlassPanel;
