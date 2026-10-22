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
  const { currentPersona, setCurrentPersona, allPersonas, pendingValidationsCount, isLoading, refreshDemandes } = useAbsences();
  const [isSwitcherOpen, setIsSwitcherOpen] = React.useState(false);
  const switcherRef = React.useRef<HTMLDivElement>(null);

  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Accueil";

  // Fermeture du dropdown au clic en dehors
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      <div className="flex items-center gap-3 sm:gap-4">
        {/* ── TEST SWITCHER : DIRECTION JURIDIQUE & WORKFLOW DRAW.IO ── */}
        <div className="relative" ref={switcherRef}>
          <button
            type="button"
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50/90 to-white hover:from-orange-100 hover:to-orange-50/80 border border-orange-300 text-xs px-2.5 py-1.5 transition-all shadow-2xs cursor-pointer rounded-xs"
            title="Changer de rôle pour tester le workflow de validation Draw.io"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 hidden md:inline">
              Testeur :
            </span>
            <span className="font-extrabold text-slate-900 truncate max-w-[130px] sm:max-w-none">
              {currentPersona.prenom} {currentPersona.nom}
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.2 bg-[#F0822A] text-white shadow-2xs shrink-0">
              {currentPersona.labelRole}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`text-slate-500 transition-transform ${isSwitcherOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Menu Dropdown de sélection des acteurs Draw.io */}
          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-84 bg-white border border-slate-200 shadow-xl z-50 p-2 text-xs rounded-xs">
              <div className="p-2 border-b border-orange-100 bg-gradient-to-r from-orange-50/60 to-white">
                <span className="text-[10px] font-black uppercase text-[#C25E00] tracking-wider block">
                  Direction Juridique & Conformité (Test Workflow)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Sélectionnez un acteur pour tester ses autorisations et ses validations :
                </span>
              </div>

              <div className="py-1 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {allPersonas.map((p) => {
                  const isSelected = p.id === currentPersona.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setCurrentPersona(p);
                        setIsSwitcherOpen(false);
                      }}
                      className={`w-full text-left p-2.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#FFF4EB] border-l-4 border-l-[#F0822A]"
                          : "hover:bg-slate-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 ${p.avatarBg || "bg-[#F0822A]"} text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs`}>
                        {p.prenom.charAt(0)}{p.nom.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-slate-900 truncate">
                            {p.prenom} {p.nom}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {p.poste}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{p.departement}</span>
                          <span>•</span>
                          <span className="font-mono">{p.matricule}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[#F0822A] font-bold text-xs mt-1">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
