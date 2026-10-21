// ============================================================
// features/absences/components/AbsencesTopBar.tsx
// Barre supérieure minimale : titre de page + cloche + initiales
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

const TITLES: [string, string][] = [
  ["/absences/demandes", "Mes demandes"],
  ["/absences/nouvelle", "Nouvelle demande"],
  ["/absences/validations", "À valider"],
  ["/absences/planning", "Agenda"],
  ["/absences/soldes", "Mes soldes"],
  ["/absences/registre", "Archives"],
  ["/absences/rapports", "Rapports"],
];

export function AbsencesTopBar() {
  const pathname = usePathname();
  const { currentPersona, pendingValidationsCount } = useAbsences();
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Accueil";

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <span className="text-sm font-semibold text-slate-900">{title}</span>
      <div className="flex items-center gap-4">
        {pendingValidationsCount > 0 && (
          <Link href="/absences/validations" className="text-xs font-semibold text-[#B95914]">
            {pendingValidationsCount} à valider
          </Link>
        )}
        <button type="button" className="relative text-slate-500 hover:text-slate-900" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D96F1D] rounded-full" />
        </button>
        <div
          className="w-8 h-8 bg-slate-900 text-white text-xs font-bold flex items-center justify-center"
          title={`${currentPersona.prenom} ${currentPersona.nom}`}
        >
          {currentPersona.prenom.charAt(0)}
          {currentPersona.nom.charAt(0)}
        </div>
      </div>
    </header>
  );
}
