// ============================================================
// app/dashboard/pilotage-rh/evaluations/page.tsx
// Page Évaluations RH — 100% Données Réelles Neon PostgreSQL
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Skeleton, Button } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import {
  CheckCircleIcon,
  EyeIcon,
  FileSpreadsheetIcon,
  ArrowPathIcon,
  AlertTriangleIcon,
} from "@/components/ui/Icons";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { exportEvaluationToExcel } from "@/lib/utils/exportExcelEvaluation";
import { useAuth } from "@/contexts/AuthContext";
import type { EvaluationCycle, StatutEvaluation } from "@/types";

export default function RhEvaluationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("TOUT");
  const [selectedModal, setSelectedModal] = useState<EvaluationCycle | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Pôle Ressources Humaines";

  const fetchEvaluations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await evaluationsApi.getAllForRh();
      setEvaluations(data || []);
    } catch (err: unknown) {
      console.error("[RhEvaluationsPage] Error loading evaluations:", err);
      setError("Erreur lors de la récupération des évaluations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Filtrage strict aligné avec les compteurs
  const filteredItems = useMemo(() => {
    return evaluations.filter((item) => {
      if (filter === "EN_ATTENTE") {
        return !["VALIDE", "CLOTURE", "ARBITRAGE"].includes(item.statut);
      }
      if (filter === "ARBITRAGE") return item.statut === "ARBITRAGE";
      if (filter === "VALIDE") return ["VALIDE", "CLOTURE"].includes(item.statut);
      return true;
    });
  }, [evaluations, filter]);

  // Compteurs
  const enAttenteCount = useMemo(() => {
    return evaluations.filter((e) => !["VALIDE", "CLOTURE", "ARBITRAGE"].includes(e.statut)).length;
  }, [evaluations]);

  const arbitragesCount = useMemo(() => {
    return evaluations.filter((e) => e.statut === "ARBITRAGE").length;
  }, [evaluations]);

  const valideesCount = useMemo(() => {
    return evaluations.filter((e) => ["VALIDE", "CLOTURE"].includes(e.statut)).length;
  }, [evaluations]);

  return (
    <AppShell
      role="RH"
      userName={displayName}
      userEmail={user?.email || "drh@agilly.com"}
      notifCount={0}
    >
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
        <FicheEvaluationModal
          isOpen={selectedModal !== null}
          onClose={() => {
            setSelectedModal(null);
            fetchEvaluations();
          }}
          role="RH"
          readOnly={false}
          evaluationId={selectedModal?.id}
          dossier={
            selectedModal
              ? {
                  id: selectedModal.id,
                  ficheId: selectedModal.id,
                  salarieId: selectedModal.salarie?.id,
                  nom: selectedModal.salarie?.nom || "",
                  prenom: selectedModal.salarie?.prenom || "",
                  poste: selectedModal.salarie?.poste || "",
                  direction: (selectedModal.salarie as any)?.departement || "Direction Technique",
                  formations: (selectedModal as any).formations || [],
                  statut: selectedModal.statut,
                }
              : null
          }
          objectifs={selectedModal?.objectifs || []}
          onSaved={fetchEvaluations}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title="Toutes les Évaluations"
            subtitle={`${evaluations.length} fiche(s) d'évaluation enregistrée(s)`}
            breadcrumbs={[{ label: "Espace RH" }, { label: "Évaluations" }]}
          />

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowPathIcon size={14} />}
            onClick={fetchEvaluations}
            disabled={isLoading}
          >
            Actualiser
          </Button>
        </div>

        {/* Filtres par onglets */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "TOUT", label: `Toutes les fiches (${evaluations.length})` },
            { id: "EN_ATTENTE", label: `En cours (${enAttenteCount})` },
            { id: "ARBITRAGE", label: `Arbitrages (${arbitragesCount})` },
            { id: "VALIDE", label: `Validées (${valideesCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-xs font-bold transition-colors border ${
                filter === f.id
                  ? "bg-[#F0822A] text-white border-[#F0822A]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chargement */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-28 mb-4" />
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm font-semibold flex items-center gap-3">
            <AlertTriangleIcon size={18} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Liste vide parfaitement centrée */}
        {!isLoading && !error && filteredItems.length === 0 && (
          <EmptyState
            icon={<CheckCircleIcon size={28} className="text-slate-400" />}
            title="Aucune évaluation dans cette catégorie"
            description="Toutes les évaluations sont à jour ou aucune fiche ne correspond au filtre sélectionné."
            className="border border-slate-200"
          />
        )}

        {/* Cartes Évaluations Réelles */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const note =
                item.noteGlobale != null
                  ? `${Number(item.noteGlobale).toFixed(1)} / 20`
                  : "Non noté";
              const rawDate = item.dateCreation || (item as any)?.createdAt;
              const dateCreation = rawDate
                ? new Date(rawDate).toLocaleDateString("fr-FR")
                : "-";

              return (
                <Card
                  key={item.id}
                  hoverable
                  padding="lg"
                  className="flex flex-col justify-between bg-white border border-slate-200"
                >
                  <div>
                    {/* Header carte */}
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#F0822A] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {(item.salarie?.prenom || item.salarie?.nom || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate m-0">
                            {item.salarie?.prenom} {item.salarie?.nom}
                          </h3>
                          <p className="text-xs font-semibold text-[#F0822A] truncate mt-0.5 m-0">
                            {item.salarie?.poste || "Collaborateur"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Données récapitulatives */}
                    <div className="bg-slate-50 p-3.5 border border-slate-200 mb-4 flex flex-col gap-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500">Direction :</span>
                        <span className="font-bold text-slate-800">
                          {(item.salarie as any)?.departement || "Agilly"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500">Note Globale :</span>
                        <span className="font-black text-[#F0822A]">{note}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500">Créée le :</span>
                        <span className="font-medium text-slate-700">{dateCreation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500">Objectifs :</span>
                        <span className="font-bold text-slate-700">
                          {item.objectifs?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <EvaluationStatusBadge
                        statut={item.statut as StatutEvaluation}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedModal(item)}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <EyeIcon size={14} />
                      <span>Consulter la Fiche</span>
                    </button>
                    <button
                      onClick={() => exportEvaluationToExcel(item)}
                      title="Télécharger la fiche Excel officielle"
                      className="py-2 px-3 bg-white hover:bg-slate-50 text-emerald-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheetIcon size={14} className="text-emerald-700" />
                      <span>Excel</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
