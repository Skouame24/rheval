// ============================================================
// components/shared/WorkflowStepper.tsx
// Workflow Officiel AGILLY — Processus complet en 8 étapes
// Phase 1 : Fixation (N+1 -> RH -> N+2 -> Accord Salarié)
// Phase 2 : Évaluation (N+1 -> Validation Note N+2 -> Accord Salarié -> Clôture/Arbitrage RH)
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
  { id: 1, label: "Fixation Objectifs", actor: "Responsable (N+1)", description: "Définition des objectifs et pondérations (somme = 100%)" },
  { id: 2, label: "Validation RH", actor: "Direction RH", description: "Contrôle de conformité et validation des objectifs" },
  { id: 3, label: "Validation Direction", actor: "Direction (N+2)", description: "Validation hiérarchique des objectifs fixés" },
  { id: 4, label: "Accord Salarié", actor: "Collaborateur (Salarié)", description: "Prise de connaissance et visa d'accord sur les objectifs annuels" },
  { id: 5, label: "Évaluation Manager", actor: "Responsable (N+1)", description: "Évaluation exclusive et notation par le responsable direct N+1" },
  { id: 6, label: "Validation Note", actor: "Direction (N+2)", description: "Revue hiérarchique et validation de la note par la Direction N+2" },
  { id: 7, label: "Accord Salarié", actor: "Collaborateur (Salarié)", description: "Visa d'accord pour clôture ou contestation pour arbitrage RH" },
  { id: 8, label: "Clôture / Arbitrage", actor: "Direction RH", description: "Clôture définitive du dossier ou arbitrage RH en cas de contestation" },
];

interface WorkflowStepperProps {
  currentStep: number;
  hasArbitrage?: boolean;
  isCompleted?: boolean;
  isCollabManager?: boolean;
}

export function WorkflowStepper({ currentStep, hasArbitrage = false, isCompleted = false, isCollabManager = false }: WorkflowStepperProps) {
  const totalSteps = WORKFLOW_STEPS.length;
  const displayStep = isCompleted ? totalSteps : Math.min(Math.max(currentStep, 1), totalSteps);
  const currentStepObj = WORKFLOW_STEPS[Math.min(Math.max(displayStep - 1, 0), totalSteps - 1)];

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
              : `Processus d'Évaluation — Étape ${displayStep}/${totalSteps} : ${currentStepObj?.label}`}
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

      {/* Barre de progression des 8 étapes institutionnelles */}
      <div className="relative flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
        {WORKFLOW_STEPS.map((step) => {
          const isDone = isCompleted ? true : step.id < displayStep;
          const isCurrent = !isCompleted && step.id === displayStep;
          const isArbitrageStep = step.id === 8;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center min-w-[85px] relative group">
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
                    : "bg-white text-slate-400 border-slate-300"
                }`}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
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
