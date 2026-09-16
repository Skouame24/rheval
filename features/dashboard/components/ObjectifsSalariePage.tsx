// ============================================================
// features/dashboard/components/ObjectifsSalariePage.tsx
// ============================================================

"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Button } from "@/components/ui";
import { TargetIcon, ClockIcon, DownloadIcon } from "@/components/ui/Icons";
import { useCurrentEvaluation } from "@/lib/hooks/useEvaluation";



export function ObjectifsSalariePage() {
  const { evaluation, isLoading } = useCurrentEvaluation();
  const objectifs = evaluation?.objectifs || [];

  if (isLoading) return <div>Chargement de vos objectifs...</div>;
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full">
      <PageHeader
        title="Mes Objectifs de Performance"
        subtitle="Consultez les objectifs fixés par votre manager pour la campagne 2026."
        breadcrumbs={[{ label: "Tableau de bord", href: "/dashboard/salarie" }, { label: "Objectifs" }]}
        actions={
          <Button variant="secondary" leftIcon={<DownloadIcon size={16} />}>
            Télécharger (PDF)
          </Button>
        }

      />

      <div className="flex flex-col gap-6">
        {objectifs.length === 0 && (
          <div className="bg-white p-8 border border-gray-200 text-center text-gray-500">
            Aucun objectif fixé pour le moment.
          </div>
        )}
        {objectifs.map((obj: any, idx: number) => (
          <Card key={obj.id} padding="none" hoverable={false} className="overflow-hidden border-l-4 border-l-agilly-primary">
            <div className="p-6 bg-white flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TargetIcon size={16} className="text-agilly-primary" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Objectif {idx + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-agilly-black m-0 mb-3">{obj.intitule}</h3>
                
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-agilly-primary border border-agilly-primary/20 rounded-none">
                    Pondération : {obj.ponderation ?? "—"}%
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-none">
                    <ClockIcon size={14} />
                    {evaluation?.cycle?.dateFermeture ? new Date(evaluation.cycle.dateFermeture).toLocaleDateString('fr-FR') : "31 Décembre 2026"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#F4F7FB]">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 m-0">Indicateurs d'évaluation</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 border border-[#A7F3D0] shadow-sm">
                  <span className="inline-block px-2 py-0.5 bg-[#ECFDF5] text-[#10B981] text-xs font-bold uppercase tracking-wider mb-2 border border-[#A7F3D0]">18 à 20 (Excellence)</span>
                  <p className="text-sm text-gray-700 m-0">{obj.indicateurs?.[0]?.intitule || "Performance exceptionnelle"}</p>
                </div>
                
                <div className="bg-white p-4 border border-[#FFEDD5] shadow-sm">
                  <span className="inline-block px-2 py-0.5 bg-[#FFF7ED] text-[#F0822A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#FFEDD5]">15 à 17 (Très Bon)</span>
                  <p className="text-sm text-gray-700 m-0">Objectif atteint avec succès</p>
                </div>
                
                <div className="bg-white p-4 border border-[#BFDBFE] shadow-sm">
                  <span className="inline-block px-2 py-0.5 bg-[#EFF6FF] text-[#3B82F6] text-xs font-bold uppercase tracking-wider mb-2 border border-[#BFDBFE]">12 à 14 (Satisfaisant)</span>
                  <p className="text-sm text-gray-700 m-0">Objectif partiellement atteint</p>
                </div>
                
                <div className="bg-white p-4 border border-[#FEE2E2] shadow-sm">
                  <span className="inline-block px-2 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-xs font-bold uppercase tracking-wider mb-2 border border-[#FEE2E2]">0 à 11 (Insuffisant)</span>
                  <p className="text-sm text-gray-700 m-0">Objectif non atteint</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
