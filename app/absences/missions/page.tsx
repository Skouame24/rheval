// ============================================================
// app/absences/missions/page.tsx
// Page officielle Agilly : Ordres de Mission & Interventions Techniques
// Onglets interactifs A4, calcul de barème, live preview et impression PDF
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { MissionsDocumentEditor } from "@/features/absences/components/MissionsDocumentEditor";

export default function MissionsPage() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* BANDEAU SUPÉRIEUR ET FIL D'ARIANE */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#F0822A] shadow-xs" />
            <span className="text-[11px] font-black uppercase text-[#C25E00] tracking-wider">
              Missions &amp; Interventions Techniques
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
            Édition &amp; Génération des Ordres de Mission
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl m-0">
            Générez et imprimez les ordres de mission officiels (A4) et les fiches d&apos;intervention technique multi-employés certifiés conformes Agilly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/absences/nouvelle?type=MISSION_DEPLACEMENT"
            className="bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs px-4 py-2.5 rounded-none transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            <span>Nouvelle Demande de Mission</span>
          </Link>
          <Link
            href="/absences"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-none transition-colors border border-slate-300"
          >
            ← Retour Absences
          </Link>
        </div>
      </div>

      {/* COMPOSANT D'ÉDITION & VISUALISATION A4 */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 shadow-xs">
        <MissionsDocumentEditor />
      </div>

    </div>
  );
}
