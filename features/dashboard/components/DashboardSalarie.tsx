// ============================================================
// features/dashboard/components/DashboardSalarie.tsx — Soft UI Enterprise
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, Button } from "@/components/ui";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { STATUT_FLOW, STATUT_METADATA } from "@/lib/constants/statuts";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import type { StatutEvaluation } from "@/types";
import { EyeIcon } from "@/components/ui/Icons";
import { useCurrentEvaluation } from "@/lib/hooks/useEvaluation";
import { useAuth } from "@/contexts/AuthContext";

function CycleTimeline({ statut }: { statut: StatutEvaluation }) {
  const currentStep = STATUT_METADATA[statut]?.step ?? 4;
  const steps = STATUT_FLOW;

  return (
    <div className="relative mt-8 mb-4 px-2 overflow-hidden">
      {/* Ligne de fond fine Soft UI */}
      <div className="absolute top-4 left-8 right-8 h-[3px] bg-slate-200/80 rounded-full" />

      {/* Ligne de progression fine */}
      <div
        className="absolute top-4 left-8 h-[3px] bg-[#F0822A] transition-all duration-700 rounded-full"
        style={{
          width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1))) * 100}%`,
          maxWidth: "calc(100% - 64px)",
        }}
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
                  ${
                    done
                      ? "bg-emerald-500 text-white shadow-sm"
                      : active
                      ? "bg-[#F0822A] text-white shadow-[0_0_0_4px_rgba(240,130,42,0.2)] scale-110"
                      : "bg-white border-2 border-slate-200 text-slate-400"
                  }
                `}
              >
                {done ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  meta.step
                )}
              </div>
              <span
                className={`text-[11px] text-center font-bold tracking-tight uppercase ${
                  active
                    ? "text-[#F0822A]"
                    : done
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {meta.label
                  .replace("⏳ ", "")
                  .replace("🔍 ", "")
                  .replace("✓ ", "")
                  .replace("🎯 ", "")
                  .replace("✍️ ", "")
                  .replace("👍/👎 ", "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardSalarie() {
  const { user } = useAuth();
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);
  const [isDefinirObjectifsOpen, setIsDefinirObjectifsOpen] = useState(false);
  const [autoEvalMode, setAutoEvalMode] = useState(false);
  const [visaMode, setVisaMode] = useState(false);

  const { evaluation, isLoading, error } = useCurrentEvaluation();

  // ── Résolution des champs affichés depuis les données API ──
  const statut = (evaluation?.statut ?? "EN_ATTENTE_N1") as StatutEvaluation;
  const cycleLibelle = evaluation?.cycle?.libelle ?? "Cycle d'Évaluation Annuelle 2026";
  const noteAffichee = evaluation?.noteGlobale ? Number(evaluation.noteGlobale) : null;
  const tauxAtteinte = noteAffichee !== null ? Math.round((noteAffichee / 20) * 100) : null;
  // Stabilise la référence du tableau — évite la boucle infinie dans FicheEvaluationModal
  const objectifs = useMemo(() => evaluation?.objectifs ?? [], [evaluation?.objectifs]);
  const evaluateurN1 = user?.n1 ? { prenom: user.n1.prenom || "Manager", nom: user.n1.nom || "" } : null; // Temporaire, l'API ne renvoie pas l'évaluateur directement comme avant
  const evaluateurN2 = user?.n2 ? { prenom: user.n2.prenom, nom: user.n2.nom } : null;

  const openFicheModal = (options?: { autoEval?: boolean; visa?: boolean }) => {
    setAutoEvalMode(!!options?.autoEval);
    setVisaMode(!!options?.visa);
    setIsFicheModalOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #F0822A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>Chargement de votre évaluation…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: 24, margin: 24 }}>
        <p style={{ color: "#B91C1C", fontWeight: 700, margin: 0 }}>⚠️ Erreur : {error}</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
        <PageHeader
          title="Espace Salarié — Bilan d'Évaluation"
          subtitle="Suivi en direct de votre performance annuelle"
          breadcrumbs={[{ label: "Mon Espace" }, { label: "Tableau de Bord" }]}
        />
        <Card padding="lg">
          <div className="bg-slate-50 border border-slate-200 rounded-none p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-3xl shadow-sm mb-4">
              ℹ️
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Aucune évaluation en cours</h3>
            <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">
              Vous n'avez pas d'évaluation active pour la période en cours. Dès que la Direction RH ouvrira la campagne annuelle ou que votre supérieur N+1 fixera vos objectifs, votre fiche apparaîtra ici.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
      <FicheEvaluationModal
        isOpen={isFicheModalOpen}
        onClose={() => setIsFicheModalOpen(false)}
        isAutoEvaluationMode={autoEvalMode}
        isVisaMode={visaMode}
        currentStep={autoEvalMode ? 3 : visaMode ? 5 : 4}
        dossier={user ? {
          nom: user.nom,
          prenom: user.prenom,
          poste: user.poste || "Collaborateur Agilly",
          direction: user.departement || "Direction Générale",
        } : undefined}
        objectifs={objectifs}
      />

      <ModalDefinirObjectifs
        isOpen={isDefinirObjectifsOpen}
        onClose={() => setIsDefinirObjectifsOpen(false)}
        salariedName={`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Collaborateur"}
        salariedPoste={user?.poste ?? "Collaborateur Agilly"}
        isN1Validated={false}
        objectifs={objectifs}
      />

      {/* Page Header */}
      <PageHeader
        title="Espace Salarié — Bilan d'Évaluation"
        subtitle="Suivi en direct de votre performance annuelle, consultation de vos objectifs fixés par le manager et auto-évaluation"
        breadcrumbs={[{ label: "Mon Espace" }, { label: "Tableau de Bord" }]}
      />

      {/* Raccourcis d'actions Salarié */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setIsDefinirObjectifsOpen(true)}
          className="p-4 bg-white border border-blue-200 hover:border-blue-400 text-blue-900 rounded-none shadow-sm flex items-center gap-3 transition-all cursor-pointer text-left"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center border border-blue-200 shrink-0">
            🎯
          </div>
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Étape 02</span>
            <span className="text-sm font-extrabold block">Consulter mes Objectifs (Fixés par N+1)</span>
          </div>
        </button>

        <button
          onClick={() => openFicheModal({ autoEval: true })}
          className="p-4 bg-white border border-sky-200 hover:border-sky-400 text-sky-900 rounded-none shadow-sm flex items-center gap-3 transition-all cursor-pointer text-left"
        >
          <div className="w-10 h-10 bg-sky-50 text-sky-600 font-extrabold text-lg flex items-center justify-center border border-sky-200 shrink-0">
            ✍️
          </div>
          <div>
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider block">Étape 03</span>
            <span className="text-sm font-extrabold block">Faire mon Auto-évaluation</span>
          </div>
        </button>
      </div>

      {/* Hero Card : Progression du Cycle */}
      <Card padding="lg">
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                CAMPAGNE ANNUELLE OFFICIELLE
              </span>
              <EvaluationStatusBadge statut={statut} size="md" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight">
              {cycleLibelle}
            </h3>
            <p className="text-sm font-semibold text-slate-500 m-0 mt-2">
              Période d'évaluation :{" "}
              <strong className="text-slate-900">
                {evaluation?.cycle?.dateDebut
                  ? new Date(evaluation.cycle.dateDebut).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : "01 janvier 2026"}
              </strong>{" "}
              au{" "}
              <strong className="text-slate-900">
                {evaluation?.cycle?.dateFin
                  ? new Date(evaluation.cycle.dateFin).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : "31 décembre 2026"}
              </strong>
            </p>
          </div>

          {/* Taux Global & Note Provisoire */}
          <div className="bg-[#FFF7ED] p-4 md:px-6 md:py-4 rounded-none border border-[#F0822A]/30 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-none bg-[#F0822A] text-white flex items-center justify-center text-base font-extrabold shadow-sm shrink-0">
              {tauxAtteinte !== null ? `${tauxAtteinte}%` : "—"}
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#F0822A] uppercase tracking-widest">
                NOTE GLOBALE PONDÉRÉE
              </span>
              <p className="text-3xl font-extrabold text-slate-900 m-0 leading-none tracking-tight">
                {noteAffichee !== null ? noteAffichee.toFixed(2) : "—"}{" "}
                <span className="text-sm font-bold text-slate-400">/ 20</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Visual Progress */}
        <CycleTimeline statut={statut} />

        {/* CTA Consulter Fiche Officielle */}
        <div className="border-t border-slate-200 pt-6 mt-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-none border border-emerald-200">
            <span className="w-2 h-2 rounded-none bg-emerald-500 shrink-0 animate-pulse" />
            <span className="text-xs font-bold">
              Votre dossier est en cours de traitement. Evalué par{" "}
              {evaluateurN1
                ? `${evaluateurN1.prenom} ${evaluateurN1.nom}`.trim()
                : "votre Responsable N+1"}
              {evaluateurN2
                ? ` et ${evaluateurN2.prenom} ${evaluateurN2.nom}`.trim()
                : ""}.
            </span>
          </div>

          <Button
            variant="primary"
            onClick={() => openFicheModal()}
            leftIcon={<EyeIcon size={16} />}
          >
            Consulter ma Fiche Officielle Excel
          </Button>
        </div>
      </Card>

      {/* Mes Objectifs du Cycle */}
      <Card padding="lg">
        <CardHeader
          title="Objectifs de Performance & Barèmes Assignés"
          subtitle={
            objectifs.length > 0
              ? `${objectifs.length} objectif${objectifs.length > 1 ? "s" : ""} défini${objectifs.length > 1 ? "s" : ""} pour le cycle 2026`
              : "Aucun objectif assigné pour le moment (en attente de saisie par le Manager N+1)"
          }
        />

        <div className="flex flex-col gap-4 mt-6">
          {objectifs.length === 0 && (
            <div className="bg-slate-50 p-8 rounded-none border border-slate-200 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm font-bold text-slate-700 m-0">Aucun objectif fixé pour ce cycle.</p>
              <p className="text-xs text-slate-500 mt-1 m-0">Votre responsable N+1 n'a pas encore défini vos objectifs opérationnels pour l'année 2026.</p>
            </div>
          )}

          {objectifs.map((obj: any, i: number) => (
            <div
              key={obj.id}
              className="bg-slate-50 p-5 rounded-none border border-slate-200 hover:border-slate-300 transition-all flex flex-wrap justify-between items-center gap-5"
            >
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold text-[#F0822A] bg-[#FFF7ED] px-3 py-0.5 rounded-none border border-[#F0822A]/30 uppercase">
                    OBJECTIF {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Pondération :{" "}
                    <strong className="text-slate-900">
                      — %
                    </strong>
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 m-0 leading-snug">
                  {obj.intitule ?? "Objectif"}
                </h4>
              </div>

              <div className="bg-white p-3 md:px-5 md:py-3 rounded-none border border-slate-200 text-right shrink-0 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Note Globale
                </span>
                <p className="text-xl font-extrabold text-[#F0822A] m-0">
                  {obj.noteGlobale ?? "—"}{" "}
                  <span className="text-xs font-bold text-slate-400">/ 20</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

