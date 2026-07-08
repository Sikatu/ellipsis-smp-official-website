import { type ReactNode } from "react";

type GradientTextProps = {
  children: ReactNode;
  className?: string;
  tone?: "violet" | "gold" | "indigo" | "cyan";
};

const tones = {
  violet: "from-purple-300 via-fuchsia-300 to-blue-300",
  gold: "from-amber-400 via-fuchsia-300 to-blue-300",
  indigo: "from-indigo-400 via-violet-300 to-blue-300",
  cyan: "from-cyan-300 via-violet-300 to-fuchsia-300",
};

function GradientText({ children, className = "", tone = "violet" }: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r ${tones[tone]} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}

export default GradientText;
