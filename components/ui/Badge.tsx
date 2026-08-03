// ============================================================
// components/ui/Badge.tsx — IBM Carbon Style
// ============================================================

import React from "react";

export type BadgeColor = "blue" | "green" | "yellow" | "red" | "purple" | "gray" | "orange";

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
  customColor?: string;
  customBg?: string;
  customBorder?: string;
}

const colorMap: Record<BadgeColor, { color: string; bg: string; border: string }> = {
  orange: { color: "#C7610C", bg: "#FFF8F2", border: "#F0822A33" },
  blue:   { color: "#0060AC", bg: "#F0F8FF", border: "#0060AC33" },
  green:  { color: "#10B981", bg: "#ECFDF5", border: "#10B98133" },
  yellow: { color: "#D97706", bg: "#FFFBEB", border: "#D9770633" },
  red:    { color: "#DC2626", bg: "#FEF2F2", border: "#DC262633" },
  purple: { color: "#7C3AED", bg: "#F5F3FF", border: "#7C3AED33" },
  gray:   { color: "#535B6A", bg: "#F8FAFC", border: "#E8E4DE" },
};

export function Badge({
  label,
  color = "orange",
  dot = true,
  size = "md",
  className = "",
  customColor,
  customBg,
  customBorder,
}: BadgeProps) {
  const styles = colorMap[color] || colorMap.orange;
  const finalColor  = customColor  ?? styles.color;
  const finalBg     = customBg     ?? styles.bg;
  const finalBorder = customBorder ?? styles.border;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"} ${className}`}
      style={{
        border: `1px solid ${finalBorder}`,
        background: finalBg,
        color: finalColor,
      }}
    >
      {dot && (
        <span
          className="shrink-0 w-1.5 h-1.5 rounded-none"
          style={{ background: finalColor }}
        />
      )}
      {label}
    </span>
  );
}
