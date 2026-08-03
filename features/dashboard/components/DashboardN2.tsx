// ============================================================
// features/dashboard/components/DashboardN2.tsx — IBM Carbon
// ============================================================

"use client";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, AvatarWithName, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckCircleIcon, GridIcon, PencilIcon, EyeIcon, ScaleIcon, UsersIcon } from "@/components/ui/Icons";

const STATS = [
  { label: "Évaluations à traiter",  value: "3",  subValue: "En attente N+2",  icon: <PencilIcon size={20} className="text-purple-600" />, color: "text-purple-600",  bg: "bg-purple-50", progress: 40 },
  { label: "Évaluations soumises",   value: "8",  subValue: "ce cycle",         icon: <CheckCircleIcon size={20} className="text-green-600" />, color: "text-green-600", bg: "bg-green-50" },
  { label: "Arbitrages à traiter",   value: "1",  subValue: "Décision requise", icon: <ScaleIcon size={20} className="text-red-600" />, color: "text-red-600",   bg: "bg-red-50"   },
  { label: "Salariés supervisés",    value: "12", subValue: "sous ma supervision",icon: <UsersIcon size={20} className="text-agilly-primary" />, color: "text-agilly-primary", bg: "bg-[#FFF0E0]" },
];

const EVALUATIONS = [
  { id: "1", nom: "Koné",   prenom: "Mariam",   poste: "Designer UI/UX",  statut: "EN_ATTENTE_N2" as const, priorite: "haute" },
  { id: "2", nom: "Traoré", prenom: "Seydou",   poste: "Data Analyst",    statut: "EN_ATTENTE_N2" as const, priorite: "normale" },
  { id: "3", nom: "Diallo", prenom: "Amara",    poste: "Dev Fullstack",   statut: "EN_ATTENTE_N2" as const, priorite: "normale" },
];

const ARBITRAGES = [
  { id: "1", nom: "Coulibaly", prenom: "Ibrahim", poste: "Chef de Projet", motif: "Désaccord sur la note de performance — N+1 : 12/20 · RH attendu : 15/20" },
];

export function DashboardN2() {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">
      <PageHeader
        title="Tableau de bord N+2"
        subtitle="Cycle 2026 — Vos évaluations et arbitrages"
        breadcrumbs={[{ label: "Tableau de bord" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Évaluations à traiter */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
            <CardHeader title="Évaluations à traiter" subtitle="En attente de votre évaluation" />
          </div>
          <div className="bg-[#F4F7FB]">
            {EVALUATIONS.map((ev, idx) => (
              <div key={ev.id} className={`p-5 flex items-center gap-4 bg-white border-l-2 border-transparent hover:border-agilly-primary hover:bg-[#F4F7FB] transition-colors ${idx !== EVALUATIONS.length - 1 ? "border-b border-gray-200" : ""}`}>
                <AvatarWithName nom={ev.nom} prenom={ev.prenom} poste={ev.poste} role="SALARIE" size="sm" />
                <div className="flex-1 flex items-center justify-between">
                  <EvaluationStatusBadge statut={ev.statut} size="sm" />
                  <Button variant="primary" size="sm" leftIcon={<PencilIcon size={14} />}>
                    Évaluer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Arbitrages */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
            <CardHeader title="Arbitrages en cours" subtitle="Décision conjointe N+2 + RH" />
          </div>
          {ARBITRAGES.length > 0 ? (
            <div className="bg-[#F4F7FB]">
              {ARBITRAGES.map((arb, idx) => (
                <div key={arb.id} className={`p-5 bg-white border-l-2 border-transparent hover:border-red-600 hover:bg-red-50 transition-colors ${idx !== ARBITRAGES.length - 1 ? "border-b border-gray-200" : ""}`}>
                  <AvatarWithName nom={arb.nom} prenom={arb.prenom} poste={arb.poste} role="SALARIE" size="sm" />
                  <p className="text-xs mt-4 p-3 bg-red-50 text-red-700 border border-red-200 font-medium">
                    {arb.motif}
                  </p>
                  <div className="mt-4">
                    <Button variant="secondary" fullWidth leftIcon={<EyeIcon size={14} className="text-agilly-black" />}>
                      Consulter le dossier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50">
              <CheckCircleIcon size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">Aucun arbitrage en cours</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
