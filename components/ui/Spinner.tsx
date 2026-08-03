// ============================================================
// components/ui/Spinner.tsx
// ============================================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "dark" | "brand";
}

const sizeMap = { sm: 14, md: 20, lg: 28 };
const colorMap = {
  white: "#ffffff",
  dark: "var(--neutral-700)",
  brand: "var(--agilly-blue-600)",
};

export function Spinner({ size = "md", color = "brand" }: SpinnerProps) {
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
