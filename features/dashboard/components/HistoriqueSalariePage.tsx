// ============================================================
// features/dashboard/components/HistoriqueSalariePage.tsx
// ============================================================

"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Button } from "@/components/ui";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { CalendarIcon, EyeIcon, ChartBarIcon } from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import type { StatutEvaluation } from "@/types";

const HISTORIQUE = [
  {
    id: "2025",
    annee: "2025",
    titre: "Évaluation Annuelle 2025",
    statut: "VALIDE" as StatutEvaluation,
    noteFinale: 17.2,
    dateCloture: "15 Janvier 2026",
    manager: "Sevan AKOUMIA"
  },
  {
    id: "2024",
    annee: "2024",
    titre: "Évaluation Annuelle 2024",
    statut: "VALIDE" as StatutEvaluation,
    noteFinale: 14.8,
    dateCloture: "20 Janvier 2025",
    manager: "Sevan AKOUMIA"
  },
  {
    id: "2023",
    annee: "2023",
    titre: "Évaluation Annuelle 2023",
    statut: "VALIDE" as StatutEvaluation,
    noteFinale: 15.5,
    dateCloture: "12 Janvier 2024",
    manager: "Alexandre DUPONT"
  }
];

const FILTRES_ANNEE = ["Toutes", "2025", "2024", "2023"];

export function HistoriqueSalariePage() {
  const [filtreAnnee, setFiltreAnnee] = useState("Toutes");
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);

  const filteredHistory = HISTORIQUE.filter(
    (h) => filtreAnnee === "Toutes" || h.annee === filtreAnnee
  );

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full">
      <FicheEvaluationModal isOpen={isFicheModalOpen} onClose={() => setIsFicheModalOpen(false)} />

      <PageHeader
        title="Historique des Campagnes"
        subtitle="Retrouvez toutes vos fiches d'évaluation et suivez votre évolution."
        breadcrumbs={[{ label: "Tableau de bord", href: "/dashboard/salarie" }, { label: "Historique" }]}
      />

      {/* Filtres (Pill Chips) Carbon Style */}
      <div className="flex items-center gap-3 bg-white p-4 border border-gray-200">
        <span className="text-sm font-bold text-gray-500 mr-2 uppercase tracking-wider">Filtrer par année :</span>
        {FILTRES_ANNEE.map((annee) => (
          <button
            key={annee}
            onClick={() => setFiltreAnnee(annee)}
            className={`
              px-4 py-1.5 text-sm font-medium transition-colors border
              ${filtreAnnee === annee 
                ? 'bg-agilly-primary text-white border-agilly-primary' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-100'
              }
            `}
          >
            {annee}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste de l'historique */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {filteredHistory.map((item) => (
            <Card key={item.id} padding="none" hoverable className="overflow-hidden">
              <div className="p-5 md:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200">{item.annee}</span>
                    <EvaluationStatusBadge statut={item.statut} size="sm" />
                  </div>
                  <h3 className="text-lg font-bold text-agilly-black m-0 mb-1">{item.titre}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><CalendarIcon size={14} /> Clôturé le {item.dateCloture}</span>
                    <span>•</span>
                    <span>Manager : {item.manager}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Note Finale :</span>
                    <span className="text-2xl font-black text-agilly-primary">{item.noteFinale}<span className="text-sm text-gray-400">/20</span></span>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    leftIcon={<EyeIcon size={14} />}
                    onClick={() => setIsFicheModalOpen(true)}
                  >
                    Consulter la fiche
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filteredHistory.length === 0 && (
            <div className="p-10 text-center bg-gray-50 border border-gray-200">
              <p className="text-gray-500 font-medium">Aucune évaluation trouvée pour cette année.</p>
            </div>
          )}
        </div>

        {/* Aperçu de l'évolution */}
        <div className="md:col-span-1">
          <Card padding="md" className="sticky top-24 bg-[#F4F7FB] border-agilly-primary/20">
            <CardHeader title="Évolution" icon={<ChartBarIcon size={20} className="text-agilly-primary" />} />
            
            <div className="flex flex-col gap-6 mt-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dernière note (2025)</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-agilly-black">17.2</span>
                  <span className="text-lg text-green-600 font-bold mb-1">↑ +2.4 pts</span>
                </div>
              </div>
              
              <hr className="border-gray-200 border-dashed" />
              
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Historique des notes</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">2025</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200">
                      <div className="h-full bg-agilly-primary" style={{ width: '86%' }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">17.2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">2024</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200">
                      <div className="h-full bg-orange-300" style={{ width: '74%' }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">14.8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">2023</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200">
                      <div className="h-full bg-orange-400" style={{ width: '77.5%' }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">15.5</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
