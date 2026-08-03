// ============================================================
// components/ui/ProgressBar.tsx
// Barre de progression animée pour le taux d'atteinte
// ============================================================

import { cn } from "@/lib/utils/cn";
import { getCouleurTaux } from "@/lib/utils/formatNote";

interface ProgressBarProps {
  value: number;       // 0 à 100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  colorAuto?: boolean; // Si true, la couleur s'adapte automatiquement au taux
  color?: string;      // Couleur custom (hex)
  className?: string;
  animated?: boolean;
}

const sizeMap = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

export function ProgressBar({
  value,
  showLabel = false,
  size = "md",
  colorAuto = true,
  color,
  className,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const autoColor = getCouleurTaux(clamped);
  const fillColor = color ?? (colorAuto ? autoColor.color : "var(--agilly-blue-600)");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold" style={{ color: fillColor }}>
            {autoColor.label}
          </span>
          <span className="text-xs font-bold" style={{ color: fillColor }}>
            {clamped.toFixed(1)} %
          </span>
        </div>
      )}
      <div
        className={cn("w-full overflow-hidden rounded-none", sizeMap[size])}
        style={{ background: "var(--neutral-100)" }}
      >
        <div
          className={cn("h-full rounded-none", animated && "transition-all duration-700 ease-out")}
          style={{
            width: `${clamped}%`,
            background: fillColor,
          }}
        />
      </div>
    </div>
  );
}

// ─── Barre circulaire (pour les stat cards) ─────────────────

interface CircularProgressProps {
  value: number; // 0 à 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 6,
  color,
  showLabel = true,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const autoColor = getCouleurTaux(clamped);
  const fillColor = color ?? autoColor.color;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute text-xs font-bold"
          style={{ color: fillColor }}
        >
          {clamped.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
