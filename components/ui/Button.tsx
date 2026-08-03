// ============================================================
// components/ui/Button.tsx — Soft UI Enterprise
// ============================================================

import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#F0822A] text-white border border-transparent hover:bg-[#D96F1D] shadow-[0_4px_14px_rgba(240,130,42,0.35)] hover:shadow-[0_6px_20px_rgba(240,130,42,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
  secondary:
    "bg-white text-slate-800 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-slate-50 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
  ghost:
    "bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-rose-500 text-white border border-transparent shadow-[0_4px_14px_rgba(244,63,94,0.3)] hover:bg-rose-600 hover:shadow-[0_6px_20px_rgba(244,63,94,0.45)] hover:-translate-y-0.5 active:translate-y-0",
  success:
    "bg-emerald-500 text-white border border-transparent shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-600 hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 active:translate-y-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3.5 py-1.5 h-8 gap-1.5 rounded-none font-semibold",
  md: "text-sm px-5 py-2.5 h-10 gap-2 rounded-none font-bold",
  lg: "text-base px-7 py-3 h-12 gap-2.5 rounded-none font-extrabold",
};


export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none shadow-none translate-y-0",
        className
      )}
      style={style}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={variant === "primary" || variant === "danger" || variant === "success" ? "white" : "dark"} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

