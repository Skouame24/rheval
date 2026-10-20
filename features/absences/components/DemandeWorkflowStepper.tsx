// ============================================================
// features/absences/components/DemandeWorkflowStepper.tsx
// Stepper visuel fidèle au schéma BPMN Swimlane du cahier des charges
// Affiche le circuit à 3 niveaux, les boucles de refus et les motifs
// ============================================================

"use client";

import { DemandeRHItem } from "@/types/absences.types";

interface DemandeWorkflowStepperProps {
  demande: DemandeRHItem;
}

export function DemandeWorkflowStepper({ demande }: DemandeWorkflowStepperProps) {
  // Déterminer l'index actif (1 à 6)
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
        return 2; // Renvoyé au N1 / Employé
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
    { num: 1, label: "Dépôt Employé", role: "Demandeur", desc: "Saisie formulaire & PJ" },
    { num: 2, label: "Supérieur N+1", role: "Supérieur Hiérarchique", desc: "Avis managérial" },
    { num: 3, label: "Contrôle DRH", role: "Direction RH", desc: "Solde & règles de gestion" },
    { num: 4, label: "Direction Générale", role: "DG / PDG", desc: "Validation finale" },
    { num: 5, label: "Édition & GED", role: "Agent DRH", desc: "PDF officiel numéroté" },
    { num: 6, label: "Clôture", role: "Système", desc: "Notification Salarié" },
  ];

  return (
    <div className="bg-white border border-slate-200 p-5 select-none shadow-xs">
      {/* ── EN-TÊTE DU WORKFLOW ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#F0822A] inline-block"/>
          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
            Circuit de Validation Officiel Agilly (BPMN Swimlane)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {demande.cycleRetoursCount > 0 && (
            <span className="text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-200 px-2 py-0.5">
              Cycle de retour : {demande.cycleRetoursCount} / 2 max (Anti-boucle)
            </span>
          )}
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 border border-slate-200 bg-slate-50 text-slate-700">
            Réf: {demande.codeReference}
          </span>
        </div>
      </div>

      {/* ── BANNIÈRE EN CAS DE RETOUR AVEC MOTIF OBLIGATOIRE (NON OK) ── */}
      {isRetournee && (
        <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-l-red-600 border border-red-200">
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p className="text-xs font-black text-red-900 uppercase tracking-wide m-0">
                Demande Retournée par le valideur pour révision
              </p>
              <p className="text-xs text-red-800 font-medium m-0 mt-1">
                <span className="font-bold">Motif officiel du retour :</span> "
                {demande.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif || "Motif non précisé"}
                "
              </p>
              <p className="text-[11px] text-red-700 m-0 mt-1">
                Le demandeur doit corriger les pièces ou éléments avant renvoi. Conformément au règlement, max 2 retours autorisés.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── ÉTAPES DU STEPPER ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 relative">
        {steps.map((st) => {
          const isPassed = currentIndex > st.num || currentIndex === 6;
          const isCurrent = currentIndex === st.num && !isRefusee;

          return (
            <div
              key={st.num}
              className={`p-3 border transition-all ${
                isCurrent
                  ? "bg-[#FFF7ED] border-[#F0822A] shadow-xs"
                  : isPassed
                  ? "bg-emerald-50/60 border-emerald-300"
                  : "bg-slate-50 border-slate-200 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-6 h-6 flex items-center justify-center text-xs font-black ${
                    isPassed
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-[#F0822A] text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isPassed ? "✓" : st.num}
                </span>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 ${
                    isPassed
                      ? "text-emerald-800 bg-emerald-100/80"
                      : isCurrent
                      ? "text-[#EA580C] bg-[#FFEDD5]"
                      : "text-slate-400 bg-slate-100"
                  }`}
                >
                  {isPassed ? "OK" : isCurrent ? "En cours" : "Attente"}
                </span>
              </div>

              <h4 className="text-xs font-black text-slate-900 m-0 leading-tight">
                {st.label}
              </h4>
              <p className="text-[10px] font-bold text-[#F0822A] m-0 mt-0.5">
                {st.role}
              </p>
              <p className="text-[10px] text-slate-500 m-0 mt-1 font-medium">
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

