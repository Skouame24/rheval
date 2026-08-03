// ============================================================
// components/shared/StatCard.tsx — IBM Carbon Style
// ============================================================

import { CircularProgress } from "@/components/ui/ProgressBar";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color?: string;       
  bg?: string;          
  trend?: {
    value: number;
    label: string;
  };
  progress?: number;    
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  color = "text-agilly-primary",
  bg = "bg-gray-50",
  trend,
  progress,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 p-5 rounded-none flex items-center justify-between gap-4 min-w-0 flex-1 hover:border-agilly-primary transition-colors ${className}`}
    >
      {/* Côté Gauche — Textes */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-agilly-gray uppercase tracking-widest m-0 mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </p>

        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-bold text-agilly-black leading-none tracking-tight">
            {value}
          </span>
        </div>

        {subValue && (
          <p className="text-xs font-semibold text-agilly-gray m-0 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {subValue}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-none ${trend.value >= 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}
            </span>
            <span className="text-[10px] font-semibold text-agilly-gray">{trend.label}</span>
          </div>
        )}
      </div>

      {/* Côté Droit — Icône ou Jauge */}
      <div className="shrink-0 flex items-center justify-center">
        {progress !== undefined ? (
          <div className="w-12 h-12">
            <CircularProgress value={progress} size={48} strokeWidth={4} color="#FF8C00" />
          </div>
        ) : (
          <div
            className={`w-12 h-12 border border-gray-200 rounded-none flex items-center justify-center text-xl shrink-0 ${bg} ${color}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
