// ============================================================
// app/dashboard/mon-equipe/evaluations/page.tsx
// Page "Mes Évaluations N+1" — Fiches réelles de l'équipe (100% Connecté Backend)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { useAuth } from "@/contexts/AuthContext";
import { exportEvaluationToExcel } from "@/lib/utils/exportExcelEvaluation";
import type { EvaluationCycle, StatutEvaluation } from "@/types";

export default function EvaluationsN1Page() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [selectedFicheModal, setSelectedFicheModal] = useState<EvaluationCycle | null>(null);
  const [selectedCollabForObjectifs, setSelectedCollabForObjectifs] = useState<{
    id: string;
    name: string;
    poste?: string;
  } | null>(null);

  const isN2 = user?.role === "N2" || user?.role === "DRH";

  const loadEvaluations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = isN2
        ? await evaluationsApi.getN2TeamEvaluations()
        : await evaluationsApi.getN1TeamEvaluations();
      setEvaluations(data || []);
    } catch (err: any) {
      console.error("[EvaluationsN1Page] Erreur chargement évaluations:", err);
      setError(err.message || "Erreur de communication avec le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, [user?.role, user?.id]);

  const handleExportExcel = (item: EvaluationCycle) => {
    exportEvaluationToExcel({
      salarie: {
        nom: item.salarie?.nom || "",
        prenom: item.salarie?.prenom || "",
        matricule: (item.salarie as any)?.matricule || "EMP-2026-001",
        poste: item.salarie?.poste || "",
        departement: (item.salarie as any)?.departement || "Direction Technique",
        direction: (item.salarie as any)?.direction || "Executive",
        site: "Abidjan - AGILLY 1",
      },
      n1: {
        nom: user ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim() : "Marc AUBERT",
        poste: user?.poste || "Responsable Technique",
      },
      cycle: item.cycle,
      statut: item.statut,
      noteGlobale: item.noteGlobale,
      objectifs: item.objectifs || [],
      formations: (item as any)?.formations || [],
      observationN1: item.observation || "",
    });
  };

  const getStatutBadge = (statut?: StatutEvaluation | string) => {
    switch (statut) {
      case "FIXATION_OBJECTIFS":
        return {
          label: "Fixation des Objectifs",
          color: "text-amber-800",
          bg: "bg-amber-50",
          border: "border-amber-200",
        };
      case "AUTO_EVALUATION":
        return {
          label: "Auto-évaluation Salarié",
          color: "text-blue-800",
          bg: "bg-blue-50",
          border: "border-blue-200",
        };
      case "EVALUATION_N1":
      case "EN_ATTENTE_N1":
        return {
          label: "À Évaluer (N+1)",
          color: "text-[#F0822A]",
          bg: "bg-[#FFF7ED]",
          border: "border-[#FFEDD5]",
        };
      case "VALIDATION_N2":
      case "EVALUATION_N2":
      case "TRANSMIS_N2":
        return {
          label: "Revue & Validation N+2",
          color: "text-purple-800",
          bg: "bg-purple-50",
          border: "border-purple-200",
        };
      case "VISA_SALARIE":
        return {
          label: "Visa Salarié / Revue N+2",
          color: "text-amber-800",
          bg: "bg-amber-50",
          border: "border-amber-200",
        };
      case "VALIDATION_DRH":
      case "EN_ATTENTE_RH":
        return {
          label: "En Validation RH",
          color: "text-indigo-800",
          bg: "bg-indigo-50",
          border: "border-indigo-200",
        };
      case "ARBITRAGE":
        return {
          label: "Arbitrage RH Requis",
          color: "text-rose-800",
          bg: "bg-rose-50",
          border: "border-rose-200",
        };
      case "VALIDE":
      case "VALIDEE":
      case "CLOTURE":
        return {
          label: "Validée & Clôturée",
          color: "text-emerald-800",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
        };
      default:
        return {
          label: statut || "En cours",
          color: "text-slate-800",
          bg: "bg-slate-100",
          border: "border-slate-200",
        };
    }
  };

  const managerDisplayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Manager";

  return (
    <AppShell role={user?.role || "N1"} userName={managerDisplayName} userEmail={user?.email || "manager@agilly.com"}>
      <div className="flex flex-col gap-8 pb-10">
        {/* Modale Fiche d'Évaluation */}
        {selectedFicheModal && (
          <FicheEvaluationModal
            isOpen={true}
            onClose={() => {
              setSelectedFicheModal(null);
              loadEvaluations();
            }}
            readOnly={selectedFicheModal.statut === "FIXATION_OBJECTIFS"}
            role={isN2 ? "N2" : "N1"}
            evaluationId={selectedFicheModal.id}
            dossier={{
              id: selectedFicheModal.id,
              ficheId: selectedFicheModal.id,
              salarieId: selectedFicheModal.salarie?.id,
              nom: selectedFicheModal.salarie?.nom || "",
              prenom: selectedFicheModal.salarie?.prenom || "",
              poste: selectedFicheModal.salarie?.poste || "",
              direction: (selectedFicheModal.salarie as any)?.departement || "",
            }}
            objectifs={selectedFicheModal.objectifs}
            onSaved={loadEvaluations}
          />
        )}

        {/* Modale Définition Objectifs */}
        {selectedCollabForObjectifs && (
          <ModalDefinirObjectifs
            isOpen={true}
            onClose={() => {
              setSelectedCollabForObjectifs(null);
              loadEvaluations();
            }}
            salariedId={selectedCollabForObjectifs.id}
            salariedName={selectedCollabForObjectifs.name}
            salariedPoste={selectedCollabForObjectifs.poste || ""}
          />
        )}

        <PageHeader
          title={isN2 ? "Supervision des Évaluations (N+2)" : "Évaluation de Performance de l'Équipe"}
          subtitle={isN2 ? "Contre-évaluation, validation hiérarchique et suivi des formations du périmètre" : "Suivi des fiches d'évaluation, notation N+1 et gestion des objectifs"}
          breadcrumbs={[{ label: isN2 ? "Espace N+2" : "Espace N+1" }, { label: "Évaluations à valider" }]}
        />

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-none flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-rose-600 font-bold text-sm">⚠️</span>
              <p className="text-xs font-bold text-rose-800 m-0">{error}</p>
            </div>
            <button
              onClick={loadEvaluations}
              className="px-3 py-1 bg-white border border-rose-300 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm rounded-none">
          <div className="p-6 border-b border-slate-200 flex flex-wrap justify-between items-center bg-white gap-4">
            <CardHeader
              title="Évaluations des Collaborateurs"
              subtitle={`${evaluations.length} fiche(s) rattachée(s) à votre équipe (${managerDisplayName})`}
              icon="📋"
            />
            {evaluations.length > 0 && (
              <button
                onClick={() => {
                  evaluations.forEach((ev) => handleExportExcel(ev));
                }}
                className="px-4 py-2.5 bg-[#107C41] text-white font-extrabold text-xs rounded-none border border-transparent hover:bg-[#0E6C38] transition-all cursor-pointer flex items-center gap-2 shadow-sm"
              >
                📊 Exporter Tout en Excel (.xlsx)
              </button>
            )}
          </div>

          <div className="bg-[#F7F8FA]">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white">
                <div className="w-8 h-8 border-3 border-[#F0822A] border-t-transparent animate-spin rounded-none" />
                <span className="text-xs font-bold text-slate-500">Chargement des fiches de votre équipe...</span>
              </div>
            ) : evaluations.length === 0 ? (
              <div className="py-16 px-6 flex flex-col items-center justify-center text-center bg-white">
                <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center text-2xl text-slate-400 mb-4">
                  📋
                </div>
                <h4 className="text-base font-extrabold text-slate-900 m-0">Aucune évaluation en attente</h4>
                <p className="text-xs font-semibold text-slate-500 max-w-md mt-1 mb-5">
                  Toutes les fiches d'évaluation de vos collaborateurs directs sont à jour ou en phase initiale de fixation des objectifs.
                </p>
                <Link
                  href="/dashboard/mon-equipe"
                  className="px-4 py-2 bg-[#F0822A] text-white text-xs font-extrabold hover:bg-[#d97220] transition-colors rounded-none no-underline"
                >
                  Voir mes Collaborateurs
                </Link>
              </div>
            ) : (
              evaluations.map((item, idx) => {
                const badge = getStatutBadge(item.statut);
                const collabName = item.salarie
                  ? `${item.salarie.prenom ? item.salarie.prenom + " " : ""}${item.salarie.nom}`.trim()
                  : "Collaborateur";
                const isFixation = item.statut === "FIXATION_OBJECTIFS";
                const hasGrade = item.noteGlobale !== undefined && item.noteGlobale !== null && !isFixation;

                return (
                  <div
                    key={item.id}
                    className={`p-6 flex flex-wrap items-center justify-between gap-4 bg-white ${
                      idx !== evaluations.length - 1 ? "border-b border-slate-200" : ""
                    }`}
                  >
                    {/* Collaborateur Info */}
                    <div className="flex items-center gap-4 min-w-[260px]">
                      <div className="w-11 h-11 bg-[#F0822A] text-white font-black text-lg flex items-center justify-center rounded-none shrink-0 shadow-sm">
                        {collabName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900 m-0">{collabName}</h4>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 border rounded-none uppercase tracking-wider ${badge.bg} ${badge.color} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#F0822A] m-0 mt-0.5">
                          {item.salarie?.poste || "Ingénieur & Collaborateur"}
                        </p>
                        <p className="text-[11px] text-slate-500 m-0 mt-1">
                          {item.objectifs && item.objectifs.length > 0
                            ? `🎯 ${item.objectifs.length} objectif(s) de performance associé(s)`
                            : `ℹ️ Aucun objectif validé`}
                        </p>
                      </div>
                    </div>

                    {/* Statut / Note Provisoire */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="bg-[#F8FAFC] px-4 py-2.5 border border-slate-200 text-right min-w-[130px] rounded-none">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          {isFixation ? "Statut Saisie" : "Note Provisoire"}
                        </span>
                        {hasGrade ? (
                          <p className="text-xl font-black text-[#F0822A] m-0">
                            {Number(item.noteGlobale).toFixed(1)}{" "}
                            <span className="text-xs text-slate-400 font-bold">/20</span>
                          </p>
                        ) : (
                          <p className="text-xs font-extrabold text-slate-500 m-0 mt-1">
                            {isFixation ? "En Fixation" : "Non noté"}
                          </p>
                        )}
                      </div>

                      {/* Action Principale : Adapter selon le statut */}
                      {isFixation ? (
                        <button
                          onClick={() =>
                            setSelectedCollabForObjectifs({
                              id: item.salarie?.id || item.id,
                              name: collabName,
                              poste: item.salarie?.poste,
                            })
                          }
                          className="px-4 py-2 bg-[#F0822A] text-white font-extrabold text-xs rounded-none border border-transparent hover:bg-[#d97220] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          🎯 Définir les Objectifs
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedFicheModal(item)}
                          className="px-4 py-2 bg-[#F0822A] text-white font-extrabold text-xs rounded-none border border-transparent hover:bg-[#d97220] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          📝 Noter & Apprécier
                        </button>
                      )}

                      {/* Action Secondaire : Consulter la fiche */}
                      <button
                        onClick={() => setSelectedFicheModal(item)}
                        className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-none border border-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        📋 Consulter
                      </button>

                      {/* Export Excel */}
                      <button
                        onClick={() => handleExportExcel(item)}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#107C41] font-extrabold text-xs rounded-none border border-emerald-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        📊 Excel
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
