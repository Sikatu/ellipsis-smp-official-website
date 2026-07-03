import { type ReactNode } from "react";

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
};

function PremiumCard({ children, className = "" }: PremiumCardProps) {
  return (
    <div
      className={`rounded-[2rem] border border-purple-500/20 bg-white/[0.055] shadow-[0_0_45px_rgba(168,85,247,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-purple-300/45 hover:bg-white/[0.085] ${className}`}
    >
      {children}
    </div>
  );
}

export default PremiumCard;
