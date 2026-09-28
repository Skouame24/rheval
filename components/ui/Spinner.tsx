// ============================================================
// components/ui/Spinner.tsx
// ============================================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "white" | "dark" | "brand" | "primary" | "orange";
}

const sizeMap = { sm: 14, md: 20, lg: 28, xl: 36 };
const colorMap = {
  white: "#ffffff",
  dark: "#0F172A",
  brand: "#F0822A",
  primary: "#F0822A",
  orange: "#F0822A",
};

export function Spinner({ size = "md", color = "primary" }: SpinnerProps) {
  const s = sizeMap[size];
  const c = colorMap[color];

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="3" opacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
