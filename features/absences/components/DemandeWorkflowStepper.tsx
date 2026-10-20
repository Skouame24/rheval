// ============================================================
// features/absences/components/DemandeWorkflowStepper.tsx
// Stepper de circuit séquentiel — Design épuré IBM Carbon
// Affiche clairement : Étape 1 (Salarié) -> Étape 2 (N+1) -> Étape 3 (DRH) -> Étape 4 (DG) -> Clôture
// ============================================================

"use client";

import React from "react";
import { DemandeRHItem } from "@/types/absences.types";

interface DemandeWorkflowStepperProps {
  demande: DemandeRHItem;
}

export function DemandeWorkflowStepper({ demande }: DemandeWorkflowStepperProps) {
  // Détermination de l'étape active dans le circuit nominal (Section 3 du CDC)
  const getStepNumber = (): number => {
    switch (demande.statut) {
      case "BROUILLON":
        return 1;
      case "SOUMISE":
      case "EN_VALIDATION_N1":
        return 2;
      case "EN_VALIDATION_DRH":
        return 3;
      case "EN_VALIDATION_DG":
        return 4;
      case "APPROUVEE":
      case "PERMISSION_EDITEE":
      case "ARCHIVEE":
        return 5;
      case "RETOURNEE_EMPLOYE":
        return 2; // Renvoyé pour correction
      case "REFUSEE_DEFINITIVEMENT":
      case "ANNULEE":
        return -1;
      default:
        return 2;
    }
  };

  const currentStep = getStepNumber();
  const isRetournee = demande.statut === "RETOURNEE_EMPLOYE";

  const steps = [
    { num: 1, label: "Dépôt", role: "Salarié", acteur: demande.demandeur.prenom.split(" ")[0] },
    { num: 2, label: "Avis N+1", role: "Supérieur", acteur: "Manager" },
    { num: 3, label: "Contrôle", role: "DRH", acteur: "Directrice RH" },
    { num: 4, label: "Validation", role: "Direction DG", acteur: "Christian BAMBA" },
    { num: 5, label: "Bulletin & GED", role: "Clôture", acteur: "Agent RH" },
  ];

  return (
    <div className="bg-white border border-slate-200 p-4 font-sans text-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Circuit hiérarchique de validation
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {currentStep === 5 ? "Dossier validé & scellé" : `Étape ${currentStep}/5 en cours`}
        </span>
      </div>

      {/* Alerte si le dossier a été retourné pour révision (§3.2) */}
      {isRetournee && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-900 flex items-start gap-2">
          <span className="font-bold text-red-600">!</span>
          <div>
            <p className="font-bold">Demande retournée à corriger</p>
            <p className="text-[11px] text-red-700">
              Motif du valideur : &ldquo;{demande.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif || "Veuillez ajuster les dates ou le justificatif."}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Stepper horizontal épuré */}
      <div className="relative flex items-center justify-between pt-2 pb-1">
        {/* Ligne grise en arrière-plan */}
        <div className="absolute left-6 right-6 top-6 h-0.5 bg-slate-200 -z-0" />

        {steps.map((st) => {
          const isCompleted = currentStep > st.num || currentStep === 5;
          const isCurrent = currentStep === st.num;

          return (
            <div key={st.num} className="relative z-10 flex flex-col items-center text-center px-1">
              <div
                className={`w-7 h-7 flex items-center justify-center font-bold text-xs transition-colors ${
                  isCompleted
                    ? "bg-slate-900 text-white"
                    : isCurrent
                    ? "bg-[#F0822A] text-white ring-4 ring-[#FFF4EB]"
                    : "bg-white border border-slate-300 text-slate-400"
                }`}
              >
                {isCompleted ? "✓" : st.num}
              </div>

              <div className="mt-1.5 flex flex-col">
                <span
                  className={`text-[11px] font-bold leading-tight ${
                    isCurrent ? "text-[#F0822A]" : isCompleted ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {st.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  {st.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
