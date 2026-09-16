// ============================================================
// features/dashboard/components/HistoriqueSalariePage.tsx
// ============================================================

"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Button } from "@/components/ui";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { CalendarIcon, EyeIcon, ChartBarIcon } from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { useEvaluationHistory } from "@/lib/hooks/useEvaluation";

export function HistoriqueSalariePage() {
  const [filtreAnnee, setFiltreAnnee] = useState("Toutes");
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null);

  const { history, isLoading, error } = useEvaluationHistory();

  // Années disponibles issues des données réelles
  const anneesDisponibles = useMemo(() => {
    const years = [...new Set(history.map((h) => String(h.annee)))].sort((a, b) => Number(b) - Number(a));
    return ["Toutes", ...years];
  }, [history]);

  const filteredHistory = useMemo(
    () => history.filter((h) => filtreAnnee === "Toutes" || String(h.annee) === filtreAnnee),
    [history, filtreAnnee]
  );

  // Stats d'évolution calculées dynamiquement
  const sortedByYear = useMemo(
    () => [...history].sort((a, b) => Number(b.annee) - Number(a.annee)),
    [history]
  );
  const derniereEval = sortedByYear[0] ?? null;
  const avantDerniereEval = sortedByYear[1] ?? null;
  const evolution = derniereEval && avantDerniereEval
    ? Number((derniereEval.note - avantDerniereEval.note).toFixed(1))
    : null;

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full">
      <FicheEvaluationModal
        isOpen={isFicheModalOpen}
        onClose={() => { setIsFicheModalOpen(false); setSelectedEvalId(null); }}
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
              ${filtreAnnee === annee
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

          {/* État chargement */}
          {isLoading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-100 border border-gray-200 animate-pulse rounded" />
              ))}
            </div>
          )}

          {/* État erreur */}
          {!isLoading && error && (
            <div className="p-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              Impossible de charger l'historique : {error}
            </div>
          )}

          {/* Résultats */}
          {!isLoading && !error && filteredHistory.map((item) => (
            <Card key={`${item.annee}-${item.libelle}`} padding="none" hoverable className="overflow-hidden">
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
                    {item.dateValidation && (
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon size={14} /> Clôturé le {item.dateValidation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Note Finale :</span>
                    <span className="text-2xl font-black text-agilly-primary">
                      {item.note}<span className="text-sm text-gray-400">/20</span>
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<EyeIcon size={14} />}
                    onClick={() => { setSelectedEvalId(String(item.annee)); setIsFicheModalOpen(true); }}
                  >
                    Consulter la fiche
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {!isLoading && !error && filteredHistory.length === 0 && (
            <div className="p-10 text-center bg-gray-50 border border-gray-200">
              <p className="text-gray-500 font-medium">Aucune évaluation trouvée pour cette année.</p>
            </div>
          )}
        </div>

        {/* Panneau évolution — dynamique */}
        <div className="md:col-span-1">
          <Card padding="md" className="sticky top-24 bg-[#F4F7FB] border-agilly-primary/20">
            <CardHeader title="Évolution" icon={<ChartBarIcon size={20} className="text-agilly-primary" />} />

            <div className="flex flex-col gap-6 mt-4">
              {isLoading ? (
                <div className="h-20 bg-gray-200 animate-pulse rounded" />
              ) : derniereEval ? (
                <>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Dernière note ({derniereEval.annee})
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-agilly-black">{derniereEval.note}</span>
                      {evolution !== null && (
                        <span className={`text-lg font-bold mb-1 ${evolution >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {evolution >= 0 ? "↑" : "↓"} {evolution >= 0 ? "+" : ""}{evolution} pts
                        </span>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-200 border-dashed" />

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Historique des notes</p>
                    <div className="flex flex-col gap-3">
                      {sortedByYear.map((item) => {
                        const pct = Math.round((item.note / 20) * 100);
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
                            <span className="text-sm font-bold w-8 text-right">{item.note}</span>
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
