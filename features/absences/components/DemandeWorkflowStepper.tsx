// ============================================================
// features/absences/components/DemandeWorkflowStepper.tsx
// Stepper minimal calqué sur le schéma officiel du processus :
// Demande → Validation Supérieur → Validation DRH → Validation Direction → Édition & archivage
// (Circuit court RG-01 : la Direction est sautée pour permission/récupération ≤ 2 j)
// ============================================================

"use client";

import React from "react";
import { DemandeRHItem } from "@/types/absences.types";

export function DemandeWorkflowStepper({ demande }: { demande: DemandeRHItem }) {
  const court =
    demande.nombreJoursOuvres <= 2 &&
    (demande.typeDemande === "PERMISSION_EXCEPTIONNELLE" || demande.typeDemande === "RECUPERATION");

  const steps = [
    { key: "DEP", label: "Demande", who: "Vous" },
    { key: "SUP", label: "Supérieur", who: "Validation" },
    { key: "DRH", label: "DRH", who: "Validation" },
    ...(court ? [] : [{ key: "DG", label: "Direction", who: "Validation" }]),
    { key: "ARC", label: "Permission", who: "Édition & archivage" },
  ];

  const indexByStatut: Record<string, number> = {
    BROUILLON: 0,
    RETOURNEE_EMPLOYE: 0,
    SOUMISE: 1,
    EN_VALIDATION_N1: 1,
    EN_VALIDATION_DRH: 2,
    EN_VALIDATION_DG: 3,
    APPROUVEE: steps.length - 1,
    PERMISSION_EDITEE: steps.length - 1,
    ARCHIVEE: steps.length,
  };
  const current = indexByStatut[demande.statut] ?? 1;
  const retour = demande.statut === "RETOURNEE_EMPLOYE";

  return (
    <div className="flex items-start">
      {steps.map((s, i) => {
        const done = i < current && !retour;
        const active = i === current;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center text-center w-20 shrink-0">
              <div
                className={`w-6 h-6 flex items-center justify-center text-[11px] font-bold ${
                  active && retour
                    ? "bg-red-600 text-white"
                    : done
                    ? "bg-slate-900 text-white"
                    : active
                    ? "bg-[#D96F1D] text-white"
                    : "bg-white border border-slate-300 text-slate-400"
                }`}
              >
                {done ? "✓" : active && retour ? "!" : i + 1}
              </div>
              <span className={`mt-1.5 text-[11px] font-semibold ${active || done ? "text-slate-900" : "text-slate-400"}`}>
                {s.label}
              </span>
              <span className="text-[10px] text-slate-500">{active && retour ? "À corriger" : s.who}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mt-3 ${i < current && !retour ? "bg-slate-900" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
