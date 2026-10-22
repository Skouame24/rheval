// ============================================================
// app/absences/loading.tsx
// Skeleton loader global pour les transitions entre onglets Absences
// Conforme au Design System IBM Carbon x Agilly Corporate
// ============================================================

import React from "react";

export default function AbsencesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      {/* ── 1. EN-TÊTE SKELETON ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-orange-400/70" />
            <div className="h-5 w-64 bg-slate-200 rounded-sm" />
          </div>
          <div className="h-3 w-96 bg-slate-100 rounded-sm" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 bg-slate-100 rounded-sm border border-slate-200" />
          <div className="h-8 w-36 bg-orange-200/60 rounded-sm" />
        </div>
      </div>

      {/* ── 2. CARTES KPI / ACCÈS SKELETON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 p-4 flex flex-col justify-between h-28"
          >
            <div className="space-y-2">
              <div className="w-4 h-1.5 bg-slate-300 rounded-xs" />
              <div className="h-3.5 w-24 bg-slate-200 rounded-sm" />
              <div className="h-2.5 w-32 bg-slate-100 rounded-sm" />
            </div>
            <div className="h-6 w-16 bg-slate-200/80 rounded-sm self-end" />
          </div>
        ))}
      </div>

      {/* ── 3. CORPS / TABLEAU SKELETON ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="h-4 w-40 bg-slate-200 rounded-sm" />
          <div className="flex gap-2">
            <div className="h-7 w-24 bg-slate-100 rounded-sm border border-slate-200" />
            <div className="h-7 w-32 bg-slate-100 rounded-sm border border-slate-200" />
          </div>
        </div>

        {/* Lignes factices du tableau */}
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-28 bg-slate-200 rounded-sm font-mono" />
                <div className="h-3 w-40 bg-slate-100 rounded-sm" />
              </div>
              <div className="h-3 w-24 bg-slate-100 rounded-sm hidden md:block" />
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
              <div className="h-6 w-16 bg-slate-200 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

