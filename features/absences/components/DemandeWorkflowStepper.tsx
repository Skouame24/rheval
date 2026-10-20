// ============================================================
// features/absences/components/DemandeWorkflowStepper.tsx
// Stepper moderne et fluide — Timeline de validation horizontale
// ============================================================

"use client";

import { DemandeRHItem } from "@/types/absences.types";

interface DemandeWorkflowStepperProps {
  demande: DemandeRHItem;
}

export function DemandeWorkflowStepper({ demande }: DemandeWorkflowStepperProps) {
  const getStepIndex = (): number => {
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
        return 5;
      case "ARCHIVEE":
        return 6;
      case "RETOURNEE_EMPLOYE":
        return 2;
      case "REFUSEE_DEFINITIVEMENT":
      case "ANNULEE":
      case "EXPIREE":
        return -1;
      default:
        return 2;
    }
  };

  const currentIndex = getStepIndex();
  const isRetournee = demande.statut === "RETOURNEE_EMPLOYE";
  const isRefusee = demande.statut === "REFUSEE_DEFINITIVEMENT";

  const steps = [
    { num: 1, label: "Dépôt", role: "Salarié" },
    { num: 2, label: "Supérieur N+1", role: "Manager" },
    { num: 3, label: "Contrôle DRH", role: "Direction RH" },
    { num: 4, label: "Direction DG", role: "Direction Générale" },
    { num: 5, label: "Édition PDF", role: "Agent DRH" },
    { num: 6, label: "Clôture & GED", role: "Système" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs font-sans">
      
      {/* ── EN-TÊTE ÉPURÉ ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F0822A]" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Circuit de validation séquentiel (Workflow officiel Agilly)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {demande.cycleRetoursCount > 0 && (
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 rounded-full">
              Cycle de retour : {demande.cycleRetoursCount} / 2 max
            </span>
          )}
          <span className="font-medium text-slate-400">Réf : {demande.codeReference}</span>
        </div>
      </div>

      {/* ── BANNIÈRE EN CAS DE RETOUR AVEC MOTIF ── */}
      {isRetournee && (
        <div className="mb-6 p-4 bg-rose-50/60 rounded-xl border border-rose-200/80 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-rose-900 m-0">
                Demande retournée pour révision par le valideur
              </p>
              <p className="text-rose-800 font-medium m-0 mt-1 leading-relaxed">
                Motif communiqué : "
                <span className="font-semibold text-rose-950">
                  {demande.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif || "Motif non précisé"}
                </span>
                "
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TIMELINE HORIZONTALE FLUIDE ── */}
      <div className="relative flex items-center justify-between">
        {/* Ligne d'arrière-plan */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />

        {steps.map((st) => {
          const isPassed = currentIndex > st.num || currentIndex === 6;
          const isCurrent = currentIndex === st.num && !isRefusee;

          return (
            <div key={st.num} className="relative z-10 flex flex-col items-center text-center px-1">
              {/* Cercle étape */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isPassed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isCurrent
                    ? "bg-[#F0822A] text-white ring-4 ring-orange-100 shadow-xs"
                    : "bg-white border-2 border-slate-300 text-slate-400"
                }`}
              >
                {isPassed ? "✓" : st.num}
              </div>

              {/* Labels */}
              <div className="mt-2.5 space-y-0.5">
                <p
                  className={`text-xs font-semibold m-0 leading-tight ${
                    isCurrent ? "text-[#F0822A]" : isPassed ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {st.label}
                </p>
                <p className="text-[10px] text-slate-400 m-0 font-medium">
                  {st.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
