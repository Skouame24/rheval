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
  const { currentPersona, pendingValidationsCount, isLoading, refreshDemandes } = useAbsences();
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Accueil";

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 relative">
      {/* ── BARRE DE CHARGEMENT ANIMÉE UX (EN HAUT DU HEADER) ── */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-100 overflow-hidden z-30">
          <div className="h-full bg-[#F0822A] w-full origin-left animate-pulse" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        {isLoading && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#C25E00] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-xs">
            <svg className="animate-spin h-2.5 w-2.5 text-[#F0822A]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Actualisation...
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Bouton rafraîchir doux */}
        <button
          type="button"
          onClick={() => refreshDemandes()}
          disabled={isLoading}
          className="text-slate-400 hover:text-[#F0822A] p-1 transition-colors disabled:opacity-50"
          title="Actualiser les données"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isLoading ? "animate-spin text-[#F0822A]" : ""}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>

        {pendingValidationsCount > 0 && (
          <Link href="/absences/validations" className="text-xs font-bold text-[#C25E00] bg-orange-50 border border-orange-200 px-2.5 py-0.5 hover:bg-orange-100 transition-colors shadow-2xs">
            {pendingValidationsCount} à valider
          </Link>
        )}
        <button type="button" className="relative text-slate-500 hover:text-[#F0822A] transition-colors" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#F0822A] rounded-full ring-2 ring-white" />
        </button>
        <div
          className="w-8 h-8 bg-gradient-to-br from-[#F0822A] to-[#D96F1D] text-white text-xs font-black flex items-center justify-center shadow-xs border border-orange-200"
          title={`${currentPersona.prenom} ${currentPersona.nom}`}
        >
          {currentPersona.prenom.charAt(0)}
          {currentPersona.nom.charAt(0)}
        </div>
      </div>
    </header>
  );
}
