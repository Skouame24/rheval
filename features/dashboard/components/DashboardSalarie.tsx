// ============================================================
// features/dashboard/components/DashboardSalarie.tsx — Soft UI Enterprise
// ============================================================

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, Button, PageHeaderSkeleton, StatCardSkeleton, Skeleton } from "@/components/ui";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { STATUT_FLOW, STATUT_METADATA } from "@/lib/constants/statuts";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import type { StatutEvaluation } from "@/types";
import { EyeIcon, TargetIcon, PencilIcon, FileTextIcon } from "@/components/ui/Icons";
import { EmptyState } from "@/components/ui/EmptyState";
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

  const { evaluation, isLoading, error, refetch } = useCurrentEvaluation();

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
    setAutoEvalMode(true);
    setVisaMode(!!options?.visa);
    setIsFicheModalOpen(true);
  };

  const isPdg =
    (user?.poste || "").toLowerCase().includes("pdg") ||
    (user?.email || "").toLowerCase().includes("christian.bamba");

  if (isPdg) {
    return (
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full animate-fade-in">
        <PageHeader
          title="Direction Générale & Présidence"
          subtitle="En tant que PDG, vous n'êtes pas assujetti aux évaluations de performance subordonnées."
          breadcrumbs={[{ label: "Direction Générale" }, { label: "Vue Exécutive" }]}
        />
        <Card padding="lg" className="border-l-4 border-l-[#F0822A] bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-extrabold bg-[#FFF7ED] text-[#F0822A] border border-[#F0822A]/30">
                <span>👑 DIRIGEANT ULTIME — NON ÉVALUÉ</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Vous disposez d'une vue d'ensemble sur toute l'entreprise Agilly
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Le PDG évalue les membres du Comité de Direction (Directeur Technique, Directrice RH, Directeurs opérationnels) et supervise l'ensemble des fiches d'évaluation de tous les départements.
              </p>
            </div>
            <Link
              href="/dashboard/mon-equipe"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold bg-[#F0822A] text-white hover:bg-[#D96B16] transition-all shadow-sm shrink-0"
            >
              <span>Accéder à la Vue d'Ensemble</span>
              <span>→</span>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full animate-fade-in">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <Card padding="lg">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center justify-between gap-4 py-4 px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <Skeleton className="w-8 h-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card padding="lg">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          </div>
          <div>
            <Card padding="lg">
              <Skeleton className="h-6 w-36 mb-4" />
              <Skeleton className="h-24 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 m-6">
        <p className="text-red-700 font-bold text-sm m-0">Erreur : {error}</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
        <PageHeader
          title="Mon Bilan d'Évaluation"
          subtitle="Suivi individuel de vos objectifs annuels et de votre performance"
          breadcrumbs={[{ label: "Mon Espace" }, { label: "Tableau de Bord" }]}
        />
        <Card padding="none">
          <EmptyState
            icon={<FileTextIcon size={24} className="text-slate-400" />}
            title="Aucune évaluation en cours"
            description="Vous n'avez pas d'évaluation active pour la période en cours. Dès que la Direction RH ouvrira la campagne annuelle ou que votre responsable hiérarchique fixera vos objectifs, votre fiche apparaîtra ici."
          />
        </Card>
      </div>
    );
  }

  const hasObjectifs = Boolean(objectifs && objectifs.length > 0);

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
      <FicheEvaluationModal
        isOpen={isFicheModalOpen}
        onClose={() => setIsFicheModalOpen(false)}
        role="SALARIE"
        readOnly={true}
        currentStep={3}
        evaluationId={evaluation?.id}
        dossier={user ? {
          id: user.id,
          salarieId: user.id,
          nom: user.nom,
          prenom: user.prenom,
          poste: user.poste || "Collaborateur Agilly",
          direction: user.departement || "Direction Générale",
          role: user.role,
        } : undefined}
        objectifs={objectifs}
        onSaved={refetch}
      />

      <ModalDefinirObjectifs
        isOpen={isDefinirObjectifsOpen}
        onClose={() => setIsDefinirObjectifsOpen(false)}
        salariedId={user?.id}
        evaluationId={evaluation?.id}
        statut={statut}
        salariedName={`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Collaborateur"}
        salariedPoste={user?.poste ?? "Collaborateur Agilly"}
        isN1Validated={false}
        objectifs={objectifs}
        readOnly={true}
        onSaved={refetch}
      />

      {/* Page Header */}
      <PageHeader
        title="Mon Bilan d'Évaluation"
        subtitle="Suivi de vos objectifs annuels, consultation des retours du responsable et de la direction"
        breadcrumbs={[{ label: "Mon Espace" }, { label: "Tableau de Bord" }]}
      />

      {/* Raccourcis d'actions Salarié */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hasObjectifs ? (
          <button
            onClick={() => setIsDefinirObjectifsOpen(true)}
            className="p-4 bg-white border border-blue-200 hover:border-blue-400 text-blue-900 rounded-none shadow-sm flex items-center gap-3 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center border border-blue-200 shrink-0">
              <TargetIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Étape 01</span>
              <span className="text-sm font-extrabold block">
                {statut === "VALIDATION_OBJECTIFS_SALARIE"
                  ? "Consulter & Confirmer mes Objectifs (Action Requise)"
                  : "Consulter mes Objectifs (Fixés par mon Manager)"}
              </span>
            </div>
          </button>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 text-slate-400 rounded-none flex items-center gap-3 opacity-60 cursor-not-allowed text-left">
            <div className="w-10 h-10 bg-slate-100 text-slate-400 font-extrabold text-lg flex items-center justify-center border border-slate-200 shrink-0">
              <TargetIcon size={20} className="text-slate-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Étape 01 · En attente</span>
              <span className="text-sm font-bold text-slate-500 block">Objectifs non encore fixés par votre manager</span>
            </div>
          </div>
        )}

        {hasObjectifs ? (
          <button
            onClick={() => setIsFicheModalOpen(true)}
            className="p-4 bg-white border border-purple-200 hover:border-purple-400 text-purple-900 rounded-none shadow-sm flex items-center gap-3 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 bg-purple-50 text-purple-600 font-extrabold text-lg flex items-center justify-center border border-purple-200 shrink-0">
              <EyeIcon size={20} className="text-purple-600" />
            </div>
            <div>
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">Étape 02</span>
              <span className="text-sm font-extrabold block">
                Consulter mon Évaluation & Notations
              </span>
            </div>
          </button>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 text-slate-400 rounded-none flex items-center gap-3 opacity-60 cursor-not-allowed text-left">
            <div className="w-10 h-10 bg-slate-100 text-slate-400 font-extrabold text-lg flex items-center justify-center border border-slate-200 shrink-0">
              <EyeIcon size={20} className="text-slate-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Étape 02 · En attente</span>
              <span className="text-sm font-bold text-slate-500 block">
                Évaluation disponible dès la fixation des objectifs par votre manager
              </span>
            </div>
          </div>
        )}
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
          <div className={`flex items-center gap-3 px-4 py-2 rounded-none border ${
            ["VALIDE", "CLOTURE", "CLOTUREE"].includes(statut)
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : ["ARBITRAGE", "ARBITRAGE_RH"].includes(statut)
              ? "bg-red-50 text-red-900 border-red-300"
              : hasObjectifs
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            <span className={`w-2 h-2 rounded-none shrink-0 ${
              ["VALIDE", "CLOTURE", "CLOTUREE"].includes(statut)
                ? "bg-emerald-600"
                : ["ARBITRAGE", "ARBITRAGE_RH"].includes(statut)
                ? "bg-red-600 animate-pulse"
                : hasObjectifs
                ? "bg-emerald-500 animate-pulse"
                : "bg-amber-500"
            }`} />
            <span className="text-xs font-bold">
              {statut === "VALIDATION_OBJECTIFS_RH" ? (
                "⏳ Vos objectifs ont été rédigés par votre Manager et sont en cours de validation par les Ressources Humaines."
              ) : statut === "VALIDATION_OBJECTIFS_N2" ? (
                "⏳ Vos objectifs ont été validés par les RH et sont en cours de validation par la Direction N+2."
              ) : statut === "VALIDATION_OBJECTIFS_SALARIE" ? (
                "🎯 Vos objectifs ont été validés par votre hiérarchie et les RH. Veuillez cliquer sur « Approuver mes objectifs annuels » pour confirmer votre accord."
              ) : statut === "VALIDATION_NOTES_N2" ? (
                "⏳ Votre Manager N+1 a finalisé votre évaluation. Elle est actuellement soumise à la Direction N+2 pour validation de la note."
              ) : ["VALIDE", "CLOTURE", "CLOTUREE"].includes(statut) ? (
                "✓ Évaluation annuelle clôturée et archivée définitivement. Vos notes officielles sont enregistrées."
              ) : ["ARBITRAGE", "ARBITRAGE_RH"].includes(statut) ? (
                "⚖ Demande d'arbitrage RH en cours : vous avez contesté votre note. La Direction RH prendra contact pour l'entretien d'arbitrage afin d'arrêter la note finale."
              ) : hasObjectifs ? (
                <>
                  Votre dossier est en cours de traitement. Évalué par{" "}
                  {evaluateurN1
                    ? `${evaluateurN1.prenom} ${evaluateurN1.nom}`.trim()
                    : "votre Manager"}
                  {evaluateurN2
                    ? ` et ${evaluateurN2.prenom} ${evaluateurN2.nom}`.trim()
                    : ""}.
                </>
              ) : (
                "Campagne ouverte : vos objectifs sont en cours de définition par votre manager."
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {statut === "VALIDATION_OBJECTIFS_SALARIE" && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Confirmez-vous votre accord et prise de connaissance de vos objectifs pour 2026 ?")) return;
                    try {
                      await evaluationsApi.validateObjectifsSalarie(evaluation.id, { accord: true });
                      refetch();
                    } catch (err: any) {
                      alert("Erreur lors de la confirmation : " + (err.message || "Erreur serveur"));
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>✓ Approuver mes objectifs annuels</span>
                </button>
              )}

              {statut === "ACCORD_SALARIE" && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Confirmez-vous votre accord sur l'évaluation et la note globale attribuée ?")) return;
                    try {
                      await evaluationsApi.submitVisaSalarie(evaluation.id, { accord: true, observation: "Visa et accord accordés sans réserve." });
                      refetch();
                    } catch (err: any) {
                      alert("Erreur lors de la validation de l'accord : " + (err?.message || "Erreur serveur"));
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>✓</span> Valider mon accord
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const motif = window.prompt("Veuillez préciser le motif de votre contestation pour la Direction RH (ex: désaccord sur la note, atteinte non reconnue...) :");
                    if (motif === null) return;
                    if (!motif.trim()) {
                      alert("Un motif est requis pour solliciter l'arbitrage RH.");
                      return;
                    }
                    try {
                      await evaluationsApi.submitVisaSalarie(evaluation.id, { accord: false, observation: motif.trim() });
                      refetch();
                    } catch (err: any) {
                      alert("Erreur lors de la contestation : " + (err?.message || "Erreur serveur"));
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                  title="Contester la note et demander un arbitrage à la Direction RH"
                >
                  <span>⚖</span> Contester la note & Demander un Arbitrage RH
                </button>
              </>
            )}

            <Button
              variant={hasObjectifs ? "primary" : "secondary"}
              onClick={() => openFicheModal()}
              leftIcon={<EyeIcon size={16} />}
              disabled={!hasObjectifs}
            >
              {hasObjectifs ? "Consulter ma Fiche Officielle" : "Fiche non encore disponible"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Mes Objectifs du Cycle */}
      <Card padding="lg">
        <CardHeader
          title="Objectifs de Performance & Barèmes Assignés"
          subtitle={
            objectifs.length > 0
              ? `${objectifs.length} objectif${objectifs.length > 1 ? "s" : ""} défini${objectifs.length > 1 ? "s" : ""} pour le cycle 2026`
              : "Aucun objectif assigné pour le moment (en attente de saisie par votre responsable)"
          }
        />

        <div className="flex flex-col gap-4 mt-6">
          {objectifs.length === 0 && (
            <EmptyState
              icon={<TargetIcon size={24} className="text-slate-400" />}
              title="Aucun objectif fixé pour ce cycle"
              description="Votre responsable hiérarchique n'a pas encore défini vos objectifs opérationnels pour l'année 2026."
            />
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

