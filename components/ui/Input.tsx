// ============================================================
// components/ui/Input.tsx
// Champ de saisie texte
// ============================================================

import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold"
          style={{ color: "var(--neutral-700)" }}
        >
          {label}
          {props.required && <span className="ml-0.5" style={{ color: "var(--color-error)" }}>*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--neutral-400)" }}>
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          className={cn(
            "w-full rounded-none border text-sm outline-none transition-all duration-150",
            "placeholder:text-[var(--neutral-400)]",
            leftIcon  ? "pl-9"  : "pl-3.5",
            rightIcon ? "pr-9"  : "pr-3.5",
            "py-2.5",
            error
              ? "border-[var(--color-error)] bg-[var(--color-error-bg)]"
              : "border-[var(--neutral-200)] bg-[var(--neutral-50)] focus:border-agilly-primary focus:bg-white",
            className
          )}
          style={{ color: "var(--neutral-800)" }}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--neutral-400)" }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-error)" }}>
          ⚠ {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--neutral-500)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Textarea ───────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold" style={{ color: "var(--neutral-700)" }}>
          {label}
          {props.required && <span className="ml-0.5" style={{ color: "var(--color-error)" }}>*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full rounded-none border text-sm outline-none transition-all duration-150 p-3.5 resize-none",
          "placeholder:text-[var(--neutral-400)]",
          error
            ? "border-[var(--color-error)] bg-[var(--color-error-bg)]"
            : "border-[var(--neutral-200)] bg-[var(--neutral-50)] focus:border-agilly-primary focus:bg-white",
          className
        )}
        style={{ color: "var(--neutral-800)" }}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs font-medium" style={{ color: "var(--color-error)" }}>⚠ {error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: "var(--neutral-500)" }}>{hint}</p>}
    </div>
  );
}
