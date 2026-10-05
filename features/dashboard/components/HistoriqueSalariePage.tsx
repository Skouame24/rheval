// ============================================================
// features/dashboard/components/HistoriqueSalariePage.tsx
// ============================================================

"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Button, HistoriqueSkeleton } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { CalendarIcon, EyeIcon, ChartBarIcon } from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { useEvaluationHistory } from "@/lib/hooks/useEvaluation";

function formatDate(d?: string) {
  if (!d) return null;
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("fr-FR");
  } catch {
    return d;
  }
}

export function HistoriqueSalariePage() {
  const [filtreAnnee, setFiltreAnnee] = useState("Toutes");
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null);

  const { history = [], isLoading, error } = useEvaluationHistory();

  // Années disponibles issues des données réelles — tous les hooks placés AVANT les retours conditionnels
  const safeHistory = useMemo(() => (Array.isArray(history) ? history : []), [history]);

  const anneesDisponibles = useMemo(() => {
    const years = [...new Set(safeHistory.map((h) => String(h.annee)))].sort((a, b) => Number(b) - Number(a));
    return ["Toutes", ...years];
  }, [safeHistory]);

  const filteredHistory = useMemo(
    () => safeHistory.filter((h) => filtreAnnee === "Toutes" || String(h.annee) === filtreAnnee),
    [safeHistory, filtreAnnee]
  );

  // Stats d'évolution calculées dynamiquement
  const sortedByYear = useMemo(
    () => [...safeHistory].sort((a, b) => Number(b.annee) - Number(a.annee)),
    [safeHistory]
  );
  const derniereEval = sortedByYear[0] ?? null;
  const avantDerniereEval = sortedByYear[1] ?? null;
  const evolution =
    derniereEval && avantDerniereEval && derniereEval.note != null && avantDerniereEval.note != null
      ? Number((Number(derniereEval.note) - Number(avantDerniereEval.note)).toFixed(1))
      : null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full">
        <PageHeader
          title="Historique des Campagnes"
          subtitle="Retrouvez toutes vos fiches d'évaluation et suivez votre évolution."
          breadcrumbs={[{ label: "Tableau de bord", href: "/dashboard/mon-espace" }, { label: "Historique" }]}
        />
        <HistoriqueSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full">
      <FicheEvaluationModal
        isOpen={isFicheModalOpen}
        evaluationId={selectedEvalId || undefined}
        readOnly={true}
        onClose={() => {
          setIsFicheModalOpen(false);
          setSelectedEvalId(null);
        }}
      />

      <PageHeader
        title="Historique des Campagnes"
        subtitle="Retrouvez toutes vos fiches d'évaluation et suivez votre évolution."
        breadcrumbs={[{ label: "Tableau de bord", href: "/dashboard/mon-espace" }, { label: "Historique" }]}
      />

      {/* Filtres dynamiques */}
      <div className="flex items-center gap-3 bg-white p-4 border border-gray-200 flex-wrap">
        <span className="text-sm font-bold text-gray-500 mr-2 uppercase tracking-wider">Filtrer par année :</span>
        {anneesDisponibles.map((annee) => (
          <button
            key={annee}
            onClick={() => setFiltreAnnee(annee)}
            className={`
              px-4 py-1.5 text-sm font-medium transition-colors border
              ${
                filtreAnnee === annee
                  ? "bg-agilly-primary text-white border-agilly-primary"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-100"
              }
            `}
          >
            {annee}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* État erreur */}
          {!isLoading && error && (
            <div className="p-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              Impossible de charger l'historique : {error}
            </div>
          )}

          {/* Résultats */}
          {!isLoading &&
            !error &&
            filteredHistory.map((item) => {
              const formattedDate = formatDate(item.dateValidation);
              return (
                <Card key={`${item.annee}-${item.id || item.libelle}`} padding="none" hoverable className="overflow-hidden">
                  <div className="p-5 md:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200">
                          {item.annee}
                        </span>
                        <EvaluationStatusBadge statut={item.statut} size="sm" />
                      </div>
                      <h3 className="text-lg font-bold text-agilly-black m-0 mb-1">{item.libelle}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        {formattedDate && (
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon size={14} /> Clôturé le {formattedDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Note Finale :</span>
                        <span className="text-2xl font-black text-agilly-primary">
                          {item.note ?? 0}
                          <span className="text-sm text-gray-400">/20</span>
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<EyeIcon size={14} />}
                        onClick={() => {
                          setSelectedEvalId(item.id || String(item.annee));
                          setIsFicheModalOpen(true);
                        }}
                      >
                        Consulter la fiche
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

          {!isLoading && !error && filteredHistory.length === 0 && (
            <EmptyState
              icon={<CalendarIcon size={32} />}
              title="Aucune évaluation trouvée"
              description="Aucune fiche d'évaluation n'est enregistrée pour cette sélection."
            />
          )}
        </div>

        {/* Panneau évolution — dynamique */}
        <div className="md:col-span-1">
          <Card padding="md" className="sticky top-24 bg-[#F4F7FB] border-agilly-primary/20">
            <CardHeader title="Évolution" icon={<ChartBarIcon size={20} className="text-agilly-primary" />} />

            <div className="flex flex-col gap-6 mt-4">
              {derniereEval ? (
                <>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Dernière note ({derniereEval.annee})
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-agilly-black">{derniereEval.note ?? 0}</span>
                      {evolution !== null && (
                        <span className={`text-lg font-bold mb-1 ${evolution >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {evolution >= 0 ? "↑" : "↓"} {evolution >= 0 ? "+" : ""}
                          {evolution} pts
                        </span>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-200 border-dashed" />

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Historique des notes</p>
                    <div className="flex flex-col gap-3">
                      {sortedByYear.map((item) => {
                        const noteVal = Number(item.note) || 0;
                        const pct = Math.round((noteVal / 20) * 100);
                        const isTop = item.note === derniereEval.note && item.annee === derniereEval.annee;
                        return (
                          <div key={item.annee} className="flex items-center justify-between">
                            <span className="text-sm font-semibold w-10 shrink-0">{item.annee}</span>
                            <div className="flex-1 mx-4 h-2 bg-gray-200">
                              <div
                                className={`h-full transition-all ${isTop ? "bg-agilly-primary" : "bg-orange-300"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold w-8 text-right">{noteVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Aucune donnée disponible.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
