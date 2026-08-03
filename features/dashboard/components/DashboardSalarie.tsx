// ============================================================
// features/dashboard/components/DashboardSalarie.tsx — Soft UI Enterprise
// ============================================================

"use client";

import { useState } from "react";
import { Card, CardHeader, Button } from "@/components/ui";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { STATUT_FLOW, STATUT_METADATA } from "@/lib/constants/statuts";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import type { StatutEvaluation } from "@/types";
import { EyeIcon } from "@/components/ui/Icons";

const MON_EVALUATION = {
  cycle: "Cycle d'Évaluation Annuelle 2026",
  statut: "EN_ATTENTE_RH" as StatutEvaluation,
  dateDebut: "01 juin 2026",
  dateFin: "31 décembre 2026",
  objectifs: [
    { id: "1", intitule: "Monter en compétences sur les sujets d'IA/Modèles ou frameworks d'orchestration", ponderation: 30, noteN1: 18.5, noteN2: 18.0 },
    { id: "2", intitule: "Maintenir la qualité de développement des plateformes web & mobile", ponderation: 35, noteN1: 16.0, noteN2: 16.0 },
    { id: "3", intitule: "La documentation des activités (PV de recette, Rapports d'intervention)", ponderation: 35, noteN1: 15.5, noteN2: 15.5 },
  ],
  evaluationN1: { note: 16.6, date: "2026-12-15", evaluateur: "Sevan AKOUMIA (N+1)" },
  evaluationN2: { note: 16.5, date: "2026-12-18", evaluateur: "Direction Technique (N+2)" },
};

function CycleTimeline({ statut }: { statut: StatutEvaluation }) {
  const currentStep = STATUT_METADATA[statut].step;
  const steps = STATUT_FLOW;

  return (
    <div className="relative mt-8 mb-4 px-2 overflow-hidden">
      {/* Ligne de fond fine Soft UI */}
      <div className="absolute top-4 left-8 right-8 h-[3px] bg-slate-200/80 rounded-full" />

      {/* Ligne de progression fine */}
      <div
        className="absolute top-4 left-8 h-[3px] bg-[#F0822A] transition-all duration-700 rounded-full"
        style={{ width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1))) * 100}%`, maxWidth: "calc(100% - 64px)" }}
      />

      <div className="relative flex justify-between">
        {steps.map((s) => {
          const meta = STATUT_METADATA[s];
          const done = meta.step < currentStep;
          const active = meta.step === currentStep;

          return (
            <div key={s} className="flex flex-col items-center gap-2.5 w-24">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold z-10 transition-all duration-300
                  ${done ? "bg-emerald-500 text-white shadow-sm" : active ? "bg-[#F0822A] text-white shadow-[0_0_0_4px_rgba(240,130,42,0.2)] scale-110" : "bg-white border-2 border-slate-200 text-slate-400"}
                `}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  meta.step
                )}
              </div>
              <span className={`text-[11px] text-center font-bold tracking-tight uppercase ${active ? "text-[#F0822A]" : done ? "text-slate-800" : "text-slate-400"}`}>
                {meta.label.replace("⏳ ", "").replace("🔍 ", "").replace("✓ ", "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardSalarie() {
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
      
      <FicheEvaluationModal isOpen={isFicheModalOpen} onClose={() => setIsFicheModalOpen(false)} />

      {/* Page Header */}
      <PageHeader
        title="Espace Salarié — Bilan d'Évaluation"
        subtitle="Suivi en direct de votre performance annuelle et consultation de la fiche officielle Excel"
        breadcrumbs={[{ label: "Mon Espace" }, { label: "Tableau de Bord" }]}
      />

      {/* Hero Card : Progression du Cycle */}
      <Card padding="lg">
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                CAMPAGNE ANNUELLE OFFICIELLE
              </span>
              <EvaluationStatusBadge statut={MON_EVALUATION.statut} size="md" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight">
              {MON_EVALUATION.cycle}
            </h3>
            <p className="text-sm font-semibold text-slate-500 m-0 mt-2">
              Période d'évaluation : <strong className="text-slate-900">{MON_EVALUATION.dateDebut}</strong> au <strong className="text-slate-900">{MON_EVALUATION.dateFin}</strong>
            </p>
          </div>

          {/* Taux Global & Note Provisoire */}
          <div className="bg-[#FFF7ED] p-4 md:px-6 md:py-4 rounded-none border border-[#F0822A]/30 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-none bg-[#F0822A] text-white flex items-center justify-center text-base font-extrabold shadow-sm shrink-0">
              83%
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#F0822A] uppercase tracking-widest">NOTE GLOBALE PONDÉRÉE</span>
              <p className="text-3xl font-extrabold text-slate-900 m-0 leading-none tracking-tight">
                16.57 <span className="text-sm font-bold text-slate-400">/ 20</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Visual Progress */}
        <CycleTimeline statut={MON_EVALUATION.statut} />

        {/* CTA Consulter Fiche Officielle */}
        <div className="border-t border-slate-200 pt-6 mt-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-none border border-emerald-200">
            <span className="w-2 h-2 rounded-none bg-emerald-500 shrink-0 animate-pulse" />
            <span className="text-xs font-bold">
              Votre dossier a été validé par Sevan AKOUMIA (N+1) et la Direction Technique (N+2).
            </span>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsFicheModalOpen(true)}
            leftIcon={<EyeIcon size={16} />}
          >
            Consulter ma Fiche Officielle Excel
          </Button>
        </div>
      </Card>

      {/* Mes Objectifs du Cycle */}
      <Card padding="lg">
        <CardHeader title="Objectifs de Performance & Barèmes Assignés" subtitle="3 objectifs pondérés (Total 100%) définis par votre Manager N+1" />

        <div className="flex flex-col gap-4 mt-6">
          {MON_EVALUATION.objectifs.map((obj, i) => (
            <div key={obj.id} className="bg-slate-50 p-5 rounded-none border border-slate-200 hover:border-slate-300 transition-all flex flex-wrap justify-between items-center gap-5">
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold text-[#F0822A] bg-[#FFF7ED] px-3 py-0.5 rounded-none border border-[#F0822A]/30 uppercase">
                    OBJECTIF 0{i + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Pondération : <strong className="text-slate-900">{obj.ponderation}%</strong>
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 m-0 leading-snug">{obj.intitule}</h4>
              </div>

              <div className="bg-white p-3 md:px-5 md:py-3 rounded-none border border-slate-200 text-right shrink-0 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">Note Attribuée</span>
                <p className="text-xl font-extrabold text-[#F0822A] m-0">{obj.noteN1} <span className="text-xs font-bold text-slate-400">/ 20</span></p>
              </div>
            </div>
          ))}
        </div>
      </Card>


    </div>
  );
}

