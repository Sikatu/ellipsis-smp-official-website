import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
};

function RevealSection({ children, className = "" }: RevealSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default RevealSection;
