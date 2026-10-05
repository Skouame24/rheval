// ============================================================
// components/ui/EmptyState.tsx — État Vide Institutionnel Agilly
// ============================================================

import React from "react";
import { CheckCircleIcon } from "./Icons";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 bg-white w-full ${className}`}
    >
      <div className="w-12 h-12 mx-auto shrink-0 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5">
        {icon || <CheckCircleIcon size={22} className="text-slate-400" />}
      </div>
      <h4 className="text-sm font-bold text-slate-800 m-0 tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-500 mt-1.5 mb-0 max-w-md leading-relaxed font-normal">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
