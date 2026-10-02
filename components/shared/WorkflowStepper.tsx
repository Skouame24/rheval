// ============================================================
// components/shared/WorkflowStepper.tsx
// Workflow Officiel AGILLY — 6 étapes institutionnelles
// FIXATION_OBJECTIFS → AUTO_EVALUATION → EVALUATION_N1 → EVALUATION_N2 → VALIDATION_DRH → VALIDE/CLOTURE
// ============================================================

"use client";

import React from "react";

export type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WorkflowStep {
  id: number;
  label: string;
  actor: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, label: "Fixation Objectifs", actor: "Manager N+1 / N+2", description: "Définition des objectifs et pondérations" },
  { id: 2, label: "Auto-évaluation", actor: "Collaborateur", description: "Saisie des notes d'auto-évaluation sur 20" },
  { id: 3, label: "Évaluation N+1", actor: "Manager N+1", description: "Notation, observations et plan de formation" },
  { id: 4, label: "Évaluation N+2", actor: "Direction N+2", description: "Revue hiérarchique et notation N+2" },
  { id: 5, label: "Validation RH", actor: "Direction RH", description: "Validation officielle ou arbitrage RH" },
  { id: 6, label: "Clôture", actor: "Direction RH", description: "Dossier archivé et validé définitivement" },
];

interface WorkflowStepperProps {
  currentStep: number;
  hasArbitrage?: boolean;
  isCompleted?: boolean;
  isCollabManager?: boolean;
}

export function WorkflowStepper({ currentStep, hasArbitrage = false, isCompleted = false, isCollabManager = false }: WorkflowStepperProps) {
  // Normalisation du step entre 1 et 6
  let normalizedStep = currentStep;
  if (currentStep >= 7 || isCompleted) {
    normalizedStep = 6;
  } else if (currentStep === 6) {
    normalizedStep = 4;
  } else if (currentStep === 5) {
    normalizedStep = 5;
  } else if (currentStep === 4) {
    normalizedStep = 3;
  } else if (currentStep === 3) {
    normalizedStep = 2;
  } else if (currentStep <= 2) {
    normalizedStep = 1;
  }

  const displayStep = isCompleted ? 6 : normalizedStep;
  const currentStepObj = WORKFLOW_STEPS[Math.min(Math.max(displayStep - 1, 0), WORKFLOW_STEPS.length - 1)];

  return (
    <div className="bg-white border border-slate-200 p-4 md:p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center justify-center w-6 h-6 font-bold text-xs border ${
            isCompleted 
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : "bg-slate-100 text-slate-800 border-slate-300"
          }`}>
            {isCompleted ? "✓" : displayStep}
          </span>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
            {isCompleted
              ? "Cycle d'Évaluation — Dossier Validé & Clôturé"
              : `Processus d'Évaluation — Étape ${displayStep}/6 : ${currentStepObj?.label}`}
          </h3>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 border ${
          isCompleted
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-slate-50 text-slate-700 border-slate-200"
        }`}>
          {isCompleted ? (
            <>Statut : <strong className="text-emerald-700 font-bold">Validé & Clôturé</strong></>
          ) : (
            <>Acteur en charge : <strong className="text-slate-900 font-bold">{currentStepObj?.actor}</strong></>
          )}
        </span>
      </div>

      {/* Barre de progression des 6 étapes institutionnelles */}
      <div className="relative flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
        {WORKFLOW_STEPS.map((step) => {
          const isDone = isCompleted ? true : step.id < displayStep;
          const isCurrent = !isCompleted && step.id === displayStep;
          const isArbitrageStep = step.id === 5;
          const isSkippedForManager = isCollabManager && step.id === 3;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center min-w-[90px] relative group">
              {/* Ligne connectrice */}
              {step.id > 1 && (
                <div
                  className={`absolute top-3.5 -left-1/2 w-full h-[2px] -z-0 transition-colors duration-200 ${
                    isDone ? "bg-slate-800" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Jalon d'étape */}
              <div
                className={`w-7 h-7 flex items-center justify-center font-bold text-[11px] transition-all duration-200 z-10 border ${
                  isCurrent
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : isDone
                    ? "bg-slate-800 text-white border-slate-800"
                    : isArbitrageStep && hasArbitrage
                    ? "bg-amber-600 text-white border-amber-600 animate-pulse"
                    : isSkippedForManager
                    ? "bg-slate-100 text-slate-400 border-dashed border-slate-300"
                    : "bg-white text-slate-400 border-slate-300"
                }`}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isSkippedForManager ? (
                  "—"
                ) : (
                  step.id
                )}
              </div>

              {/* Libellé */}
              <span
                className={`mt-2 text-[10px] tracking-tight text-center leading-tight transition-colors ${
                  isCurrent
                    ? "text-slate-900 font-bold"
                    : isDone
                    ? "text-slate-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {step.label}
                {isSkippedForManager && <span className="block text-[8px] text-slate-400">(N/A Manager)</span>}
              </span>

              {/* Info-bulle institutionnelle */}
              <div className="absolute top-11 hidden group-hover:block z-20 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                <p className="font-bold text-slate-200">{step.actor}</p>
                <p className="text-slate-400">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
