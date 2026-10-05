// ============================================================
// app/dashboard/mon-equipe/evaluations/page.tsx
// Page Évaluations de l'Équipe — Multi-rôles N+1 et N+2
// Données 100% dynamiques issues de l'API avec FicheEvaluationModal
// ============================================================

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Button, TableSkeleton } from "@/components/ui";
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
} from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { useAuth } from "@/contexts/AuthContext";
import { exportEvaluationToExcel } from "@/lib/utils/exportExcelEvaluation";
import type { EvaluationCycle, StatutEvaluation } from "@/types";

export default function EvaluationsEquipePage() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFicheId, setSelectedFicheId] = useState<string | null>(null);
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

  // Filtrage
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        `${item.salarie?.prenom || ""} ${item.salarie?.nom || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.salarie?.poste || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatut =
        filtreStatut === "TOUS" ||
        (filtreStatut === "A_TRAITER" &&
          (isN2
            ? item.statut === "EVALUATION_N2" || item.statut === "VALIDATION_N2"
            : item.statut === "EVALUATION_N1" || item.statut === "EN_ATTENTE_N1")) ||
        (filtreStatut === "TERMINE" &&
          (item.statut === "VALIDATION_DRH" || item.statut === "CLOTURE" || item.statut === "VALIDE"));

      return matchSearch && matchStatut;
    });
  }, [evaluations, searchQuery, filtreStatut, isN2]);

  // Métriques
  const totalCount = evaluations.length;
  const aTraiterCount = useMemo(() => {
    return evaluations.filter((e) =>
      isN2
        ? e.statut === "EVALUATION_N2" || e.statut === "VALIDATION_N2"
        : e.statut === "EVALUATION_N1" || e.statut === "EN_ATTENTE_N1"
    ).length;
  }, [evaluations, isN2]);

  const clotureesCount = useMemo(() => {
    return evaluations.filter(
      (e) => e.statut === "VALIDATION_DRH" || e.statut === "CLOTURE" || e.statut === "VALIDE"
    ).length;
  }, [evaluations]);

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
      role={userRole}
      userName={displayName}
      userEmail={user?.email || "manager@agilly.com"}
      notifCount={aTraiterCount}
    >
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
        {/* Modale d'évaluation */}
        {selectedFicheId && (
          <FicheEvaluationModal
            isOpen={true}
            evaluationId={selectedFicheId}
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

        <PageHeader
          title={isN2 ? "Supervision des Évaluations (N+2)" : "Évaluations de l'Équipe (N+1)"}
          subtitle="Saisie des appréciations, notation de performance et suivi des parcours de formation"
          breadcrumbs={[
            { label: "Mon Équipe", href: "/dashboard/mon-equipe" },
            { label: "Évaluations à valider" },
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

        {/* KPIs rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total fiches</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <UsersIcon size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">À évaluer / valider</p>
              <p className="text-2xl font-black text-[#F0822A] mt-1">{aTraiterCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#F0822A] flex items-center justify-center">
              <ClockIcon size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Finalisées / Validées</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{clotureesCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircleIcon size={20} />
            </div>
          </div>
        </div>

        {/* Section Principale */}
        <Card padding="none" className="overflow-hidden bg-white border border-slate-200">
          {/* Barre d'outils et recherche */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFiltreStatut("TOUS")}
                className={`px-3 py-1.5 text-xs font-bold transition-colors border ${
                  filtreStatut === "TOUS"
                    ? "bg-[#F0822A] text-white border-[#F0822A]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Toutes ({totalCount})
              </button>
              <button
                onClick={() => setFiltreStatut("A_TRAITER")}
                className={`px-3 py-1.5 text-xs font-bold transition-colors border ${
                  filtreStatut === "A_TRAITER"
                    ? "bg-[#F0822A] text-white border-[#F0822A]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                À traiter ({aTraiterCount})
              </button>
              <button
                onClick={() => setFiltreStatut("TERMINE")}
                className={`px-3 py-1.5 text-xs font-bold transition-colors border ${
                  filtreStatut === "TERMINE"
                    ? "bg-[#F0822A] text-white border-[#F0822A]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Finalisées ({clotureesCount})
              </button>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Rechercher par collaborateur, poste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-none focus:border-[#F0822A] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Liste des fiches */}
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
            ) : filteredEvaluations.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<CheckCircleIcon size={32} className="text-emerald-500" />}
                  title="Aucune fiche d'évaluation"
                  description={
                    searchQuery
                      ? "Aucun résultat ne correspond à votre recherche."
                      : "Toutes les fiches d'évaluation de votre équipe sont à jour pour cette étape."
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredEvaluations.map((item) => {
                  const salariePrenom = item.salarie?.prenom || "";
                  const salarieNom = item.salarie?.nom || "Collaborateur";
                  const initial = (salariePrenom ? salariePrenom.charAt(0) : salarieNom.charAt(0)).toUpperCase();
                  const noteVal = item.noteGlobale != null ? Number(item.noteGlobale) : null;
                  const formations = (item as any)?.formations || [];

                  const needsAction = isN2
                    ? item.statut === "EVALUATION_N2" || item.statut === "VALIDATION_N2"
                    : item.statut === "EVALUATION_N1" || item.statut === "EN_ATTENTE_N1";

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
                          {formations.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                              <GraduationCapIcon size={12} className="text-[#F0822A] shrink-0" />
                              <span className="truncate max-w-xs">
                                Formation : {formations[0].intitule}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Note & Actions */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
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

                        {/* Bouton d'action principal */}
                        <Button
                          variant={needsAction ? "primary" : "secondary"}
                          size="sm"
                          leftIcon={needsAction ? <PencilIcon size={14} /> : <EyeIcon size={14} />}
                          onClick={() => setSelectedFicheId(item.id)}
                        >
                          {needsAction ? "Évaluer & Noter" : "Consulter la fiche"}
                        </Button>

                        {/* Bouton Export Excel */}
                        <button
                          onClick={() => handleExportSingle(item)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title="Télécharger la fiche individuelle sous format Excel (.xlsx)"
                        >
                          <FileSpreadsheetIcon size={14} className="text-emerald-700" />
                          <span className="hidden sm:inline">Exporter Excel</span>
                        </button>
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
