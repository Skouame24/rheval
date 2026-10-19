// ============================================================
// app/dashboard/mon-equipe/evaluations/page.tsx
// Page Évaluations de l'Équipe — Double onglet ergonomique :
// 1) 🎯 Fixation des Objectifs (Phase 1 : début d'année)
// 2) 📝 Évaluations & Notations (Phase 2 : bilan & fin d'année)
// ============================================================

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Button, TableSkeleton } from "@/components/ui";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  EyeIcon,
  GraduationCapIcon,
  FileSpreadsheetIcon,
  ArrowPathIcon,
  TargetIcon,
} from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { useAuth } from "@/contexts/AuthContext";
import { detectRoleFromPoste } from "@/lib/utils/roleDetector";
import { exportEvaluationToExcel } from "@/lib/utils/exportExcelEvaluation";
import type { EvaluationCycle, StatutEvaluation } from "@/types";

const STATUTS_PHASE_OBJECTIFS = [
  "FIXATION_OBJECTIFS",
  "VALIDATION_OBJECTIFS_N2",
  "VALIDATION_OBJECTIFS_SALARIE",
];

export default function EvaluationsEquipePage() {
  const { user } = useAuth();
  const detected = detectRoleFromPoste(user?.poste, user?.email);
  const isPdg =
    detected.displayRole === "PDG" ||
    (user?.poste || "").toLowerCase().includes("pdg") ||
    (user?.email || "").toLowerCase().includes("christian.bamba");

  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modales
  const [selectedFicheId, setSelectedFicheId] = useState<string | null>(null);
  const [selectedFicheForObjectifs, setSelectedFicheForObjectifs] = useState<EvaluationCycle | null>(null);

  // Navigation par phase principale (Objectifs vs Évaluations)
  const [phaseTab, setPhaseTab] = useState<"OBJECTIFS" | "EVALUATIONS">("OBJECTIFS");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<string>("TOUS");

  const isN2 = user?.role === "N2";
  const userRole = isN2 ? "N2" : "N1";

  const displayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Manager";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = isN2
        ? await evaluationsApi.getN2TeamEvaluations()
        : await evaluationsApi.getN1TeamEvaluations();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("[EvaluationsEquipePage] Erreur chargement:", err);
      setError("Impossible de charger les fiches d'évaluation de l'équipe.");
    } finally {
      setIsLoading(false);
    }
  }, [isN2]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Séparation des fiches par phase
  const fichesObjectifs = useMemo(() => {
    return evaluations.filter((item) => STATUTS_PHASE_OBJECTIFS.includes(item.statut));
  }, [evaluations]);

  const fichesEvaluations = useMemo(() => {
    return evaluations.filter((item) => !STATUTS_PHASE_OBJECTIFS.includes(item.statut));
  }, [evaluations]);

  // Ensemble courant selon l'onglet actif
  const currentPhaseList = phaseTab === "OBJECTIFS" ? fichesObjectifs : fichesEvaluations;

  // Filtrage recherche & sous-statut
  const filteredList = useMemo(() => {
    return currentPhaseList.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        `${item.salarie?.prenom || ""} ${item.salarie?.nom || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.salarie?.poste || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (phaseTab === "OBJECTIFS") {
        const matchStatut =
          filtreStatut === "TOUS" ||
          (filtreStatut === "A_FIXER" && item.statut === "FIXATION_OBJECTIFS") ||
          (filtreStatut === "A_VALIDER" && item.statut === "VALIDATION_OBJECTIFS_N2") ||
          (filtreStatut === "CONFIRMES" && item.statut === "VALIDATION_OBJECTIFS_SALARIE");
        return matchSearch && matchStatut;
      } else {
        const matchStatut =
          filtreStatut === "TOUS" ||
          (filtreStatut === "A_NOTER" && (
            item.statut === "EVALUATION_N1" ||
            item.statut === "EN_ATTENTE_N1" ||
            item.statut === "AUTO_EVALUATION" ||
            item.statut === "VALIDATION_OBJECTIFS_SALARIE"
          )) ||
          (filtreStatut === "A_VALIDER" && (
            item.statut === "EVALUATION_N2" ||
            item.statut === "VALIDATION_N2" ||
            item.statut === "VALIDATION_NOTES_N2" ||
            item.statut === "EN_ATTENTE_N2"
          )) ||
          (filtreStatut === "CLOTURES" && (item.statut === "VALIDE" || item.statut === "CLOTURE"));
        return matchSearch && matchStatut;
      }
    });
  }, [currentPhaseList, searchQuery, filtreStatut, phaseTab]);

  // Métriques
  const totalObjectifsCount = fichesObjectifs.length;
  const totalEvaluationsCount = fichesEvaluations.length;

  const aTraiterPhaseCount = useMemo(() => {
    if (phaseTab === "OBJECTIFS") {
      return fichesObjectifs.filter((e) =>
        e.statut === "FIXATION_OBJECTIFS" || e.statut === "VALIDATION_OBJECTIFS_N2"
      ).length;
    } else {
      return fichesEvaluations.filter((e) =>
        e.statut === "EVALUATION_N1" ||
        e.statut === "EN_ATTENTE_N1" ||
        e.statut === "AUTO_EVALUATION" ||
        e.statut === "VALIDATION_OBJECTIFS_SALARIE" ||
        e.statut === "EVALUATION_N2" ||
        e.statut === "VALIDATION_N2" ||
        e.statut === "VALIDATION_NOTES_N2" ||
        e.statut === "EN_ATTENTE_N2"
      ).length;
    }
  }, [phaseTab, fichesObjectifs, fichesEvaluations]);

  const handleExportSingle = (item: EvaluationCycle) => {
    exportEvaluationToExcel({
      salarie: {
        nom: item.salarie?.nom || "Collaborateur",
        prenom: item.salarie?.prenom || "",
        matricule: (item.salarie as any)?.matricule || "N/A",
        poste: item.salarie?.poste || "Collaborateur",
        departement: (item.salarie as any)?.departement || "Direction",
        direction: (item.salarie as any)?.direction || "Direction",
        site: "Abidjan - AGILLY",
      },
      n1: {
        nom: displayName,
        poste: user?.poste || "Manager",
      },
      cycle: item.cycle,
      statut: item.statut,
      noteGlobale: item.noteGlobale,
      objectifs: item.objectifs || [],
      formations: (item as any)?.formations || [],
      observationN1: (item as any)?.observations || "",
    });
  };

  return (
    <AppShell
      role={user?.role || userRole}
      userName={displayName}
      userEmail={user?.email || "manager@agilly.com"}
      notifCount={aTraiterPhaseCount}
    >
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full font-sans">
        
        {/* Modale d'évaluation (Notes & Formations) */}
        {selectedFicheId && (
          <FicheEvaluationModal
            isOpen={true}
            evaluationId={selectedFicheId}
            role={isN2 ? "N2" : "N1"}
            onClose={() => {
              setSelectedFicheId(null);
              loadData();
            }}
            onSaved={() => {
              setSelectedFicheId(null);
              loadData();
            }}
          />
        )}

        {/* Modale de Fixation des Objectifs */}
        {selectedFicheForObjectifs && (
          <ModalDefinirObjectifs
            isOpen={true}
            onClose={() => setSelectedFicheForObjectifs(null)}
            salariedId={selectedFicheForObjectifs.salarie?.id}
            evaluationId={selectedFicheForObjectifs.id}
            salariedName={`${selectedFicheForObjectifs.salarie?.prenom || ""} ${selectedFicheForObjectifs.salarie?.nom || ""}`.trim() || "Collaborateur"}
            salariedPoste={selectedFicheForObjectifs.salarie?.poste}
            statut={selectedFicheForObjectifs.statut}
            isDirectReport={(selectedFicheForObjectifs.salarie as any)?.managerId === user?.id}
            objectifs={selectedFicheForObjectifs.objectifs}
            readOnly={false}
            onSaved={() => {
              setSelectedFicheForObjectifs(null);
              loadData();
            }}
          />
        )}

        <PageHeader
          title={
            isPdg
              ? "Supervision des Évaluations — Direction Générale"
              : isN2
              ? "Campagne d'Évaluation de la Direction"
              : "Campagne d'Évaluation de l'Équipe"
          }
          subtitle={
            isPdg
              ? "Vue d'ensemble et supervision de toutes les fiches de fixation d'objectifs et de notation de l'entreprise Agilly"
              : "Suivez distinctement la fixation des objectifs de début d'année et l'évaluation des performances"
          }
          breadcrumbs={[
            { label: "Tableau de bord", href: "/dashboard/mon-equipe" },
            { label: phaseTab === "OBJECTIFS" ? "Fixation des Objectifs" : "Évaluations & Notations" },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowPathIcon size={14} />}
              onClick={loadData}
              disabled={isLoading}
            >
              Actualiser
            </Button>
          }
        />

        {/* ─── SÉLECTEUR D'ONGLETS MAJEURS : OBJECTIFS vs ÉVALUATIONS ─── */}
        <div className="flex items-center gap-3 border-b-2 border-slate-200 bg-white px-2 pt-2 shadow-2xs">
          <button
            onClick={() => {
              setPhaseTab("OBJECTIFS");
              setFiltreStatut("TOUS");
            }}
            className={`flex items-center gap-2.5 px-5 py-3.5 text-sm font-extrabold transition-all border-b-3 cursor-pointer ${
              phaseTab === "OBJECTIFS"
                ? "border-[#F0822A] text-[#F0822A] bg-orange-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <TargetIcon size={18} />
            <span>Phase 1 · Fixation des Objectifs</span>
            <span className={`text-xs px-2 py-0.5 rounded-none font-bold ${
              phaseTab === "OBJECTIFS" ? "bg-[#F0822A] text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {totalObjectifsCount}
            </span>
          </button>

          <button
            onClick={() => {
              setPhaseTab("EVALUATIONS");
              setFiltreStatut("TOUS");
            }}
            className={`flex items-center gap-2.5 px-5 py-3.5 text-sm font-extrabold transition-all border-b-3 cursor-pointer ${
              phaseTab === "EVALUATIONS"
                ? "border-[#F0822A] text-[#F0822A] bg-orange-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <PencilIcon size={18} />
            <span>Phase 2 · Évaluations & Notations</span>
            <span className={`text-xs px-2 py-0.5 rounded-none font-bold ${
              phaseTab === "EVALUATIONS" ? "bg-[#F0822A] text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {totalEvaluationsCount}
            </span>
          </button>
        </div>

        {/* ─── SECTION PRINCIPALE ─── */}
        <Card padding="none" className="overflow-hidden bg-white border border-slate-200 shadow-2xs">
          
          {/* Barre de filtres et recherche */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFiltreStatut("TOUS")}
                className={`px-3 py-1.5 text-xs font-bold transition-colors border cursor-pointer ${
                  filtreStatut === "TOUS"
                    ? "bg-[#F0822A] text-white border-[#F0822A]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Tous ({currentPhaseList.length})
              </button>

              {phaseTab === "OBJECTIFS" ? (
                <>
                  <button
                    onClick={() => setFiltreStatut("A_FIXER")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors border cursor-pointer ${
                      filtreStatut === "A_FIXER"
                        ? "bg-[#F0822A] text-white border-[#F0822A]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    À fixer ({fichesObjectifs.filter((f) => f.statut === "FIXATION_OBJECTIFS").length})
                  </button>
                  <button
                    onClick={() => setFiltreStatut("A_VALIDER")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors border cursor-pointer ${
                      filtreStatut === "A_VALIDER"
                        ? "bg-[#F0822A] text-white border-[#F0822A]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    En validation N+2 ({fichesObjectifs.filter((f) => f.statut === "VALIDATION_OBJECTIFS_N2").length})
                  </button>
                  <button
                    onClick={() => setFiltreStatut("CONFIRMES")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors border cursor-pointer ${
                      filtreStatut === "CONFIRMES"
                        ? "bg-[#F0822A] text-white border-[#F0822A]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Attente Accord Salarié ({fichesObjectifs.filter((f) => f.statut === "VALIDATION_OBJECTIFS_SALARIE").length})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setFiltreStatut("A_NOTER")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors border cursor-pointer ${
                      filtreStatut === "A_NOTER"
                        ? "bg-[#F0822A] text-white border-[#F0822A]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    À noter N+1 ({fichesEvaluations.filter((f) => f.statut === "EVALUATION_N1" || f.statut === "EN_ATTENTE_N1").length})
                  </button>
                  <button
                    onClick={() => setFiltreStatut("A_VALIDER")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors border cursor-pointer ${
                      filtreStatut === "A_VALIDER"
                        ? "bg-[#F0822A] text-white border-[#F0822A]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    À valider Direction ({fichesEvaluations.filter((f) => f.statut === "EVALUATION_N2" || f.statut === "VALIDATION_N2" || f.statut === "VALIDATION_NOTES_N2" || f.statut === "EN_ATTENTE_N2").length})
                  </button>
                  <button
                    onClick={() => setFiltreStatut("CLOTURES")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors border cursor-pointer ${
                      filtreStatut === "CLOTURES"
                        ? "bg-[#F0822A] text-white border-[#F0822A]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Validées / Clôturées ({fichesEvaluations.filter((f) => f.statut === "VALIDE" || f.statut === "CLOTURE").length})
                  </button>
                </>
              )}
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Rechercher par nom, poste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-none focus:border-[#F0822A] focus:outline-none transition-colors bg-white"
              />
            </div>
          </div>

          {/* Liste des dossiers */}
          <div>
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton rows={4} />
              </div>
            ) : error ? (
              <div className="p-6">
                <EmptyState
                  icon={<ClockIcon size={32} className="text-red-500" />}
                  title="Erreur de chargement"
                  description={error}
                  action={
                    <Button variant="secondary" size="sm" onClick={loadData}>
                      Réessayer
                    </Button>
                  }
                />
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircleIcon size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 m-0">Aucun dossier dans cette catégorie</p>
                <p className="text-xs text-slate-500 mt-1 mb-0">
                  {searchQuery
                    ? "Aucun résultat ne correspond à votre recherche."
                    : phaseTab === "OBJECTIFS"
                    ? "Tous les objectifs de votre périmètre ont été fixés et validés."
                    : "Aucune évaluation n'est actuellement en attente de notation."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const salariePrenom = item.salarie?.prenom || "";
                  const salarieNom = item.salarie?.nom || "Collaborateur";
                  const initial = (salariePrenom ? salariePrenom.charAt(0) : salarieNom.charAt(0)).toUpperCase();
                  const noteVal = item.noteGlobale != null ? Number(item.noteGlobale) : null;
                  const isDirectReport = item.salarie?.managerId === user?.id;

                  return (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Identité collaborateur */}
                      <div className="flex items-start sm:items-center gap-4 min-w-[260px]">
                        <div className="w-10 h-10 rounded-full bg-[#F0822A] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 m-0">
                              {salariePrenom} {salarieNom}
                            </h4>
                            <EvaluationStatusBadge statut={item.statut as StatutEvaluation} size="sm" />
                          </div>
                          <p className="text-xs font-semibold text-[#F0822A] mt-0.5 m-0">
                            {item.salarie?.poste || "Collaborateur"}
                          </p>
                          {(item.salarie as any)?.departement && (
                            <p className="text-[11px] text-slate-400 mt-0.5 m-0">
                              {(item.salarie as any).departement}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions selon l'onglet actif */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
                        
                        {/* ─── ONGLET FIXATION DES OBJECTIFS ─── */}
                        {phaseTab === "OBJECTIFS" ? (
                          <>
                            {item.statut === "FIXATION_OBJECTIFS" && (
                              isDirectReport ? (
                                <button
                                  onClick={() => setSelectedFicheForObjectifs(item)}
                                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#F0822A] hover:bg-orange-600 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                  <TargetIcon size={14} />
                                  Fixer les objectifs
                                </button>
                              ) : (
                                <span className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 inline-flex items-center gap-1.5 cursor-not-allowed">
                                  ⏳ En attente du N+1
                                </span>
                              )
                            )}

                            {item.statut === "VALIDATION_OBJECTIFS_N2" && (
                              isN2 && !isDirectReport ? (
                                <button
                                  onClick={() => setSelectedFicheForObjectifs(item)}
                                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                  <CheckCircleIcon size={14} />
                                  Valider les objectifs
                                </button>
                              ) : (
                                <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 inline-flex items-center gap-1.5 cursor-not-allowed">
                                  ⏳ En attente de validation Direction N+2
                                </span>
                              )
                            )}

                            {item.statut === "VALIDATION_OBJECTIFS_SALARIE" && (
                              <span className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 inline-flex items-center gap-1.5 cursor-not-allowed">
                                ⏳ En attente d'accord du salarié
                              </span>
                            )}

                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<EyeIcon size={14} />}
                              onClick={() => setSelectedFicheId(item.id)}
                            >
                              Consulter
                            </Button>
                          </>
                        ) : (
                          /* ─── ONGLET ÉVALUATIONS & NOTATIONS ─── */
                          <>
                            {noteVal !== null ? (
                              <div className="bg-slate-50 px-3 py-1.5 border border-slate-200 text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Note Globale
                                </span>
                                <span className="text-base font-black text-slate-900">
                                  {noteVal}
                                  <span className="text-xs text-slate-400 font-normal">/20</span>
                                </span>
                              </div>
                            ) : (
                              <div className="bg-slate-50 px-3 py-1.5 border border-slate-200 text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Note Globale
                                </span>
                                <span className="text-xs font-bold text-slate-400">Non noté</span>
                              </div>
                            )}

                            {(
                              item.statut === "EVALUATION_N1" ||
                              item.statut === "EN_ATTENTE_N1" ||
                              item.statut === "AUTO_EVALUATION" ||
                              item.statut === "VALIDATION_OBJECTIFS_SALARIE"
                            ) ? (
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<PencilIcon size={14} />}
                                onClick={() => setSelectedFicheId(item.id)}
                              >
                                Évaluer & Noter
                              </Button>
                            ) : (
                              item.statut === "EVALUATION_N2" ||
                              item.statut === "VALIDATION_N2" ||
                              item.statut === "VALIDATION_NOTES_N2" ||
                              item.statut === "EN_ATTENTE_N2"
                            ) ? (
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<CheckCircleIcon size={14} />}
                                onClick={() => setSelectedFicheId(item.id)}
                              >
                                Valider l'évaluation
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<EyeIcon size={14} />}
                                onClick={() => setSelectedFicheId(item.id)}
                              >
                                Consulter la fiche
                              </Button>
                            )}

                            <button
                              onClick={() => handleExportSingle(item)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              title="Télécharger la fiche individuelle sous format Excel (.xlsx)"
                            >
                              <FileSpreadsheetIcon size={14} className="text-emerald-700" />
                              <span className="hidden sm:inline">Excel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
