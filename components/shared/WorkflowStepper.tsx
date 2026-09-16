// ============================================================
// components/shared/WorkflowStepper.tsx
// ============================================================

"use client";

import React from "react";

export type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WorkflowStep {
  id: StepId;
  label: string;
  actor: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, label: "Ouverture Cycle", actor: "DRH", description: "Lancement de la campagne d'évaluation" },
  { id: 2, label: "Fixation Objectifs", actor: "Manager N+1", description: "Fixation des objectifs par le Supérieur N+1" },
  { id: 3, label: "Auto-évaluation", actor: "Salarié", description: "Saisie des auto-notes & auto-commentaires" },
  { id: 4, label: "Évaluation /20", actor: "Manager N+1", description: "Attribution des notes et des appréciations" },
  { id: 5, label: "Avis & Visa", actor: "Salarié", description: "Consultation N+1 et Visa (OK / NON OK)" },
  { id: 6, label: "Revue & Contre-note", actor: "Direction N+2", description: "Validation ou contre-évaluation hiérarchique" },
  { id: 7, label: "Arbitrage RH", actor: "DRH", description: "Uniquement si écart de note > 2.0 points" },
  { id: 8, label: "Signatures & Clôture", actor: "4 Acteurs", description: "Validation finale, signatures & export Excel" },
];

interface WorkflowStepperProps {
  currentStep: StepId;
  hasArbitrage?: boolean;
}

export function WorkflowStepper({ currentStep, hasArbitrage = false }: WorkflowStepperProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-none p-4 md:p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-none bg-[#F0822A]/10 text-[#F0822A] font-bold text-xs border border-[#F0822A]/30">
            {currentStep}
          </span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Workflow Officiel AGILLY — Étape {currentStep} sur 8 : {WORKFLOW_STEPS[currentStep - 1]?.label}
          </h3>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-none border border-slate-200">
          Acteur requis : <strong className="text-[#F0822A] font-bold">{WORKFLOW_STEPS[currentStep - 1]?.actor}</strong>
        </span>
      </div>

      {/* Barre de progression des 8 étapes */}
      <div className="relative flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
        {WORKFLOW_STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isArbitrageStep = step.id === 6;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center min-w-[90px] relative group">
              {/* Ligne connectrice */}
              {step.id > 1 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-[3px] -z-0 transition-colors duration-300 ${
                    isDone ? "bg-[#F0822A]" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Carre d'étape */}
              <div
                className={`w-8 h-8 rounded-none flex items-center justify-center font-bold text-xs transition-all duration-300 z-10 ${
                  isCurrent
                    ? "bg-[#F0822A] text-white shadow-sm border border-transparent scale-105"
                    : isDone
                    ? "bg-emerald-500 text-white border border-transparent"
                    : isArbitrageStep && hasArbitrage
                    ? "bg-amber-500 text-white animate-pulse border border-transparent"
                    : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>

              {/* Libellé */}
              <span
                className={`mt-2 text-[11px] font-semibold text-center leading-tight transition-colors ${
                  isCurrent
                    ? "text-[#F0822A] font-bold"
                    : isDone
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>

              {/* Tooltip au survol */}
              <div className="absolute top-12 hidden group-hover:block z-20 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-none shadow-md whitespace-nowrap">
                <p className="font-bold text-[#F0822A]">{step.actor}</p>
                <p>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

