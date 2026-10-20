// ============================================================
// features/absences/components/DemandeWorkflowStepper.tsx
// Stepper de circuit séquentiel — Conforme RG-01 (Circuit court <= 2j ou nominal)
// Affiche distinctement les étapes réelles selon le type et la durée
// ============================================================

"use client";

import React from "react";
import { DemandeRHItem } from "@/types/absences.types";

interface DemandeWorkflowStepperProps {
  demande: DemandeRHItem;
}

export function DemandeWorkflowStepper({ demande }: DemandeWorkflowStepperProps) {
  // Détection du circuit court (RG-01) : Permission ou Récupération <= 2 jours
  const isCircuitCourt =
    demande.nombreJoursOuvres <= 2 &&
    (demande.typeDemande === "PERMISSION_EXCEPTIONNELLE" || demande.typeDemande === "RECUPERATION");

  // Définition des étapes selon le circuit réel (RG-01)
  const steps = isCircuitCourt
    ? [
        { num: 1, label: "Dépôt", role: "Salarié", acteur: demande.demandeur.prenom.split(" ")[0] },
        { num: 2, label: "Avis Supérieur", role: "Supérieur", acteur: "Manager" },
        { num: 3, label: "Validation finale", role: "DRH (Circuit court)", acteur: "Directrice RH" },
        { num: 4, label: "Édition & GED", role: "Agent DRH", acteur: "Service RH" },
      ]
    : [
        { num: 1, label: "Dépôt", role: "Salarié", acteur: demande.demandeur.prenom.split(" ")[0] },
        { num: 2, label: "Avis Supérieur", role: "Supérieur", acteur: "Manager" },
        { num: 3, label: "Contrôle", role: "DRH", acteur: "Directrice RH" },
        { num: 4, label: "Validation", role: "Direction DG", acteur: "Christian BAMBA" },
        { num: 5, label: "Édition & GED", role: "Agent DRH", acteur: "Service RH" },
      ];

  const totalSteps = steps.length;

  // Calcul du numéro d'étape active
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
        return totalSteps;
      case "RETOURNEE_EMPLOYE":
        return 1; // Retournée à l'employé pour révision
      case "REFUSEE_DEFINITIVEMENT":
      case "ANNULEE":
        return -1;
      default:
        return 2;
    }
  };

  const currentStep = getStepNumber();
  const isRetournee = demande.statut === "RETOURNEE_EMPLOYE";
  const motifRejet = demande.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;

  return (
    <div className="bg-white border border-slate-200 p-4 font-sans text-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Circuit hiérarchique de validation
          </span>
          {isCircuitCourt && (
            <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2">
              Circuit court (≤ 2j sans DG)
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-600 font-medium">
          {currentStep === totalSteps
            ? "Dossier validé & scellé"
            : isRetournee
            ? "Retournée à l'employé"
            : `Étape ${currentStep}/${totalSteps} en cours`}
        </span>
      </div>

      {/* Alerte si le dossier a été retourné pour révision (§3.2) */}
      {isRetournee && (
        <div className="p-3 bg-red-50/80 border border-red-200 text-red-950 flex items-start gap-2.5">
          <span className="w-5 h-5 bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
            !
          </span>
          <div>
            <p className="font-bold text-xs text-red-900">Demande retournée à l&apos;employé pour révision</p>
            <p className="text-[11px] text-red-800 mt-0.5">
              Motif du Supérieur : &ldquo;{motifRejet || "Merci de vérifier les pièces justificatives ou les dates."}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Stepper horizontal épuré */}
      <div className="relative flex items-center justify-between pt-2 pb-1">
        {/* Ligne grise en arrière-plan */}
        <div className="absolute left-6 right-6 top-6 h-0.5 bg-slate-200 -z-0" />

        {steps.map((st) => {
          const isCompleted = (currentStep > st.num || currentStep === totalSteps) && !isRetournee;
          const isCurrent = currentStep === st.num;

          return (
            <div key={st.num} className="relative z-10 flex flex-col items-center text-center px-1">
              <div
                className={`w-7 h-7 flex items-center justify-center font-bold text-xs transition-colors ${
                  isRetournee && st.num === 1
                    ? "bg-red-600 text-white ring-4 ring-red-100"
                    : isCompleted
                    ? "bg-slate-900 text-white"
                    : isCurrent
                    ? "bg-[#D96F1D] text-white ring-4 ring-orange-100"
                    : "bg-white border border-slate-300 text-slate-500"
                }`}
              >
                {isCompleted ? "✓" : isRetournee && st.num === 1 ? "↺" : st.num}
              </div>

              <div className="mt-1.5 flex flex-col">
                <span
                  className={`text-[11px] font-bold leading-tight ${
                    isRetournee && st.num === 1
                      ? "text-red-700"
                      : isCurrent
                      ? "text-[#D96F1D]"
                      : isCompleted
                      ? "text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {st.label}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
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
