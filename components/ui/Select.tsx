// ============================================================
// components/ui/Select.tsx
// ============================================================

import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
}

export function Select({ label, options, placeholder, error, hint, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold" style={{ color: "var(--neutral-700)" }}>
          {label}
          {props.required && <span className="ml-0.5" style={{ color: "var(--color-error)" }}>*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full rounded-none border text-sm outline-none transition-all duration-150",
            "py-2.5 pl-3.5 pr-9 appearance-none cursor-pointer",
            error
              ? "border-[var(--color-error)] bg-[var(--color-error-bg)]"
              : "border-[var(--neutral-200)] bg-[var(--neutral-50)] focus:border-agilly-primary focus:bg-white",
            className
          )}
          style={{ color: "var(--neutral-800)" }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron custom */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--neutral-400)" }}>
          ▼
        </span>
      </div>
      {error && <p className="text-xs font-medium" style={{ color: "var(--color-error)" }}>⚠ {error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: "var(--neutral-500)" }}>{hint}</p>}
    </div>
  );
}
