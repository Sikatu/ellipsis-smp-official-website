import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
} from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export type ButtonVariant = "primary" | "secondary" | "instant" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:scale-[1.02]",
  secondary:
    "border border-purple-500/30 bg-white/[0.06] text-purple-100 hover:bg-white/[0.1]",
  instant:
    "bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#04140d] shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:scale-[1.02]",
  ghost:
    "border border-white/10 bg-transparent text-gray-200 hover:bg-white/[0.06]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm md:text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-black transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";

function classesFor(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string
) {
  return twMerge(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classesFor(variant, size, fullWidth, className)}
      {...props}
    />
  );
}

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={classesFor(variant, size, fullWidth, className)}
      {...props}
    />
  );
}

type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

/** For external links. Use LinkButton for in-app routes instead. */
export function AnchorButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: AnchorButtonProps) {
  return (
    <a
      className={classesFor(variant, size, fullWidth, className)}
      {...props}
    />
  );
}

export default Button;
