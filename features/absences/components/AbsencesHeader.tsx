// ============================================================
// features/absences/components/AbsencesHeader.tsx
// En-tête officiel Agilly Absences & Congés avec Persona Switcher
// ============================================================

"use client";

import Link from "next/link";
import { PersonaUser, MOCK_PERSONAS } from "@/lib/mock/absences.mock";

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
      {/* ── BARRE DE CONTEXTE AGILLY BRAND ── */}
      <div className="bg-slate-900 text-white px-4 md:px-8 py-2 text-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Link
            href="/portail"
            className="flex items-center gap-1.5 text-slate-300 hover:text-[#F0822A] transition-colors font-bold uppercase tracking-wider text-[11px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Portail Agilly SSO
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-medium">Système de Dématérialisation RH & Permissions Officielles</span>
        </div>

        {/* SELECTEUR DE PROFIL POUR TESTER LES 5 ACTEURS DU WORKFLOW */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F0822A] bg-orange-950/80 px-2 py-0.5 border border-orange-800">
            SIMULER LE RÔLE :
          </span>
          <select
            value={currentPersona.id}
            onChange={(e) => {
              const found = MOCK_PERSONAS.find((p) => p.id === e.target.value);
              if (found) onSelectPersona(found);
            }}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold py-1 px-3 outline-none hover:border-[#F0822A] transition-colors cursor-pointer rounded-none"
          >
            {MOCK_PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.labelRole} — {p.prenom} {p.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── BANNIÈRE PRINCIPALE DE L'APPLICATION ── */}
      <div className="px-4 md:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FFF7ED] border-2 border-[#F0822A] text-[#F0822A] flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="0" ry="0"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="m9 16 2 2 4-4"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight m-0">
                ABSENCES & CONGÉS
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] px-2 py-0.5">
                Workflows & Permissions
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              Gestion des congés, permissions, repos maladie, missions et interventions terrain
            </p>
          </div>
        </div>

        {/* ── ACTIONS RAPIDES & UTILISATEUR ACTIF ── */}
        <div className="flex items-center gap-3">
          {/* Badge du rôle actif */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2">
            <div className={`w-8 h-8 ${currentPersona.avatarBg} text-white font-black text-xs flex items-center justify-center`}>
              {currentPersona.prenom[0]}{currentPersona.nom[0]}
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 m-0 leading-tight">
                {currentPersona.prenom} {currentPersona.nom}
              </p>
              <p className="text-[10px] font-bold text-[#F0822A] uppercase tracking-wider m-0">
                {currentPersona.labelRole}
              </p>
            </div>
            {pendingCountForCurrentRole > 0 && (
              <span className="ml-2 bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5" title="Demandes en attente de votre décision">
                {pendingCountForCurrentRole} à valider
              </span>
            )}
          </div>

          {/* Bouton Nouvelle Demande */}
          <button
            onClick={onOpenNewDemande}
            className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 transition-colors shadow-sm cursor-pointer border border-[#D96F1D]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvelle Demande
          </button>
        </div>
      </div>
    </header>
  );
}

