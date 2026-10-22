// ============================================================
// features/absences/components/AbsencesHeader.tsx
// En-tête épuré et moderne Agilly — Clean Light Design
// ============================================================

"use client";

import Link from "next/link";
import { PersonaUser } from "@/lib/mock/absences.mock";

interface AbsencesHeaderProps {
  currentPersona: PersonaUser;
  onSelectPersona: (persona: PersonaUser) => void;
  pendingCountForCurrentRole: number;
  onOpenNewDemande: () => void;
}

export function AbsencesHeader({
  currentPersona,
  onSelectPersona,
  pendingCountForCurrentRole,
  onOpenNewDemande,
}: AbsencesHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* ── BARRE SUPÉRIEURE DE NAVIGATION DISCRÈTE ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* GAUCHE : LOGO ET FIL D'ARIANE */}
          <div className="flex items-center gap-4">
            <Link
              href="/portail"
              className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200/70 flex items-center justify-center transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-600">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 hidden sm:inline">
                Portail
              </span>
            </Link>

            <span className="text-slate-300 font-light hidden sm:inline">/</span>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F0822A] flex items-center justify-center border border-orange-100/80 shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" ry="3"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight m-0">
                  Absences & Congés
                </h1>
                <p className="text-[11px] text-slate-500 font-medium m-0 hidden md:block">
                  Gestion dématérialisée des demandes, missions et autorisations RH
                </p>
              </div>
            </div>
          </div>

          {/* DROITE : SIMULATION DU RÔLE & ACTION PRINCIPALE */}
          <div className="flex items-center gap-3">
            
            {/* Profil utilisateur connecté */}
            <div className="flex items-center bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-lg px-2.5 py-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 mr-1.5">
                {currentPersona.prenom} {currentPersona.nom}
              </span>
              <span className="text-[10px] text-slate-500 font-medium bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                {currentPersona.labelRole}
              </span>
            </div>

            {/* Badge des tâches en attente */}
            {pendingCountForCurrentRole > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingCountForCurrentRole} à traiter
              </span>
            )}

            {/* Bouton Nouvelle Demande épuré */}
            <button
              onClick={onOpenNewDemande}
              className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all duration-200 shadow-xs hover:shadow cursor-pointer active:scale-[0.98]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Nouvelle demande</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
