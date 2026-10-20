// ============================================================
// features/absences/components/AbsencesTopBar.tsx
// Barre supérieure 56px allégée et sobre (zéro surcharge)
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

export function AbsencesTopBar() {
  const pathname = usePathname();
  const { currentPersona, pendingValidationsCount, setIsDemoDrawerOpen } = useAbsences();

  const getPageTitle = () => {
    if (pathname === "/absences" || pathname === "/absences/demandes") return "Mes demandes";
    if (pathname.startsWith("/absences/nouvelle")) return "Nouvelle demande";
    if (pathname.startsWith("/absences/validations")) return "Boîte d'arbitrage";
    if (pathname.startsWith("/absences/planning")) return "Planning d'équipe";
    if (pathname.startsWith("/absences/soldes")) return "Soldes & Droits";
    if (pathname.startsWith("/absences/registre")) return "Registre & GED";
    if (pathname.startsWith("/absences/rapports")) return "Rapports & Pilotage";
    return "Absences & Congés";
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* ── GAUCHE : FIL D'ARIANE SOBRE ── */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/portail" className="text-slate-400 hover:text-slate-700 transition-colors">
          Portail
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">{getPageTitle()}</span>
      </div>

      {/* ── DROITE : STATUT & PROFIL MINIMALISTE ── */}
      <div className="flex items-center gap-4">
        {pendingValidationsCount > 0 && (
          <Link
            href="/absences/validations"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#F0822A] bg-[#FFF4EB] border border-[#FDE3CC]"
          >
            <span>{pendingValidationsCount} à valider</span>
          </Link>
        )}

        {/* Profil actif discret */}
        <button
          type="button"
          onClick={() => setIsDemoDrawerOpen(true)}
          className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
          title="Cliquez pour changer de rôle"
        >
          <div className="w-7 h-7 bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            {currentPersona.prenom.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {currentPersona.prenom.split(" ")[0]} {currentPersona.nom}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              Matr. {currentPersona.matricule}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
