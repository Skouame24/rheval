// ============================================================
// components/shared/WorkflowStepper.tsx
// Workflow officiel AGILLY — 6 étapes
// FIXATION_OBJECTIFS → AUTO_EVALUATION → EVALUATION_N1 → EVALUATION_N2 → VALIDATION_DRH → VALIDE/CLOTURE
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
  { id: 2, label: "Fixation Objectifs", actor: "Manager N+1", description: "Fixation des objectifs et pondérations par le N+1" },
  { id: 3, label: "Auto-évaluation", actor: "Salarié", description: "Saisie des auto-notes par le salarié (notes uniquement)" },
  { id: 4, label: "Évaluation N+1", actor: "Manager N+1", description: "Notes, commentaires et formations par le N+1" },
  { id: 5, label: "Avis & Visa", actor: "Salarié", description: "Consultation des notes N+1 (lecture seule)" },
  { id: 6, label: "Évaluation N+2", actor: "Direction N+2", description: "Contre-évaluation et re-notation par le N+2" },
  { id: 7, label: "Validation RH", actor: "DRH", description: "Validation finale ou arbitrage par la Direction RH" },
  { id: 8, label: "Clôture", actor: "DRH", description: "Fiche validée et clôturée définitivement" },
];

interface WorkflowStepperProps {
  currentStep: StepId;
  hasArbitrage?: boolean;
  isCompleted?: boolean;
}

export function WorkflowStepper({ currentStep, hasArbitrage = false, isCompleted = false }: WorkflowStepperProps) {
  const displayStep = isCompleted ? 8 : currentStep;
  const isAllDone = isCompleted || currentStep >= 8;

  return (
    <div className="bg-white border border-slate-200 rounded-none p-4 md:p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`flex items-center justify-center w-7 h-7 rounded-none font-bold text-xs border ${
            isCompleted 
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-[#F0822A]/10 text-[#F0822A] border-[#F0822A]/30"
          }`}>
            {isCompleted ? "✓" : displayStep}
          </span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {isCompleted
              ? "Workflow AGILLY — Dossier Validé & Clôturé"
              : `Workflow AGILLY — Étape ${displayStep}/8 : ${WORKFLOW_STEPS[displayStep - 1]?.label}`}
          </h3>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-none border ${
          isCompleted
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-slate-100 text-slate-700 border-slate-200"
        }`}>
          {isCompleted ? (
            <>Statut : <strong className="text-emerald-700 font-bold">Validé & Clôturé (RH)</strong></>
          ) : (
            <>Acteur requis : <strong className="text-[#F0822A] font-bold">{WORKFLOW_STEPS[displayStep - 1]?.actor}</strong></>
          )}
        </span>
      </div>

      {/* Barre de progression des 8 étapes */}
      <div className="relative flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
        {WORKFLOW_STEPS.map((step) => {
          const isDone = isCompleted ? true : step.id < currentStep;
          const isCurrent = !isCompleted && step.id === currentStep;
          const isArbitrageStep = step.id === 7;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center min-w-[80px] relative group">
              {/* Ligne connectrice */}
              {step.id > 1 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-[3px] -z-0 transition-colors duration-300 ${
                    isDone ? "bg-[#F0822A]" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Carré d'étape */}
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
                className={`mt-2 text-[10px] font-semibold text-center leading-tight transition-colors ${
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
