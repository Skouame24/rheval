// ============================================================
// features/dashboard/components/DashboardRH.tsx — IBM Carbon
// ============================================================

"use client";
import { useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, ProgressBar, AvatarWithName, Badge, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateCourte } from "@/lib/utils/formatDate";
import { formatNote, formatTaux } from "@/lib/utils/formatNote";
import type { StatutEvaluation } from "@/types";
import { UsersIcon, CheckCircleIcon, ScaleIcon, ChartBarIcon, ArrowDownTrayIcon, ArrowPathIcon, EyeIcon } from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";

// ─── Données de démo ────────────────────────────────────────

const STATS = [
  {
    label: "Salariés évalués",
    value: "34",
    subValue: "sur 47 au total",
    icon: <UsersIcon size={20} className="text-agilly-primary" />,
    color: "text-agilly-primary",
    bg: "bg-[#FFF0E0]",
    trend: { value: 8, label: "vs cycle précédent" },
    progress: 72,
  },
  {
    label: "Évaluations en attente",
    value: "6",
    subValue: "3 N+1 · 2 N+2 · 1 RH",
    icon: <CheckCircleIcon size={20} className="text-orange-600" />,
    color: "text-orange-600",
    bg: "bg-orange-50",
    trend: { value: -2, label: "vs semaine dernière" },
  },
  {
    label: "Arbitrages ouverts",
    value: "2",
    subValue: "Décision requise",
    icon: <ScaleIcon size={20} className="text-red-600" />,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    label: "Taux d'atteinte moyen",
    value: "76.4 %",
    subValue: "Cycle 2026",
    icon: <ChartBarIcon size={20} className="text-green-600" />,
    color: "text-green-600",
    bg: "bg-green-50",
    trend: { value: 4, label: "vs cycle 2025" },
    progress: 76,
  },
];

const EVALUATIONS_RECENTES: {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  role: string;
  statut: StatutEvaluation;
  noteFinale?: number;
  tauxAtteinte?: number;
  date: string;
}[] = [
  {
    id: "1", nom: "KOUAME", prenom: "Ebenezer Samuel", poste: "Dev Fullstack (IA)", role: "SALARIE",
    statut: "EN_ATTENTE_RH", date: "2026-12-20",
  },
  {
    id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", role: "SALARIE",
    statut: "ARBITRAGE", date: "2026-12-18",
  },
  {
    id: "3", nom: "Bah", prenom: "Oumar", poste: "Dev Mobile", role: "SALARIE",
    statut: "VALIDE", noteFinale: 15.0, tauxAtteinte: 75.0, date: "2026-12-15",
  },
  {
    id: "4", nom: "Camara", prenom: "Aissatou", poste: "QA Engineer", role: "SALARIE",
    statut: "VALIDE", noteFinale: 14.5, tauxAtteinte: 72.5, date: "2026-12-12",
  },
  {
    id: "5", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", role: "SALARIE",
    statut: "VALIDE", noteFinale: 17.0, tauxAtteinte: 85, date: "2026-12-10",
  },
];

const PIPELINE = [
  { label: "En attente N+1", count: 3, color: "#D97706" },
  { label: "En attente N+2", count: 2, color: "#7C3AED" },
  { label: "En attente RH",  count: 1, color: "#0060AC" },
  { label: "Arbitrage",      count: 2, color: "#DC2626" },
  { label: "Validés",        count: 19, color: "#10B981" },
  { label: "Clôturés",       count: 7, color: "#535B6A" },
];

// ─── Composant ──────────────────────────────────────────────

export function DashboardRH() {
  const [selectedFicheId, setSelectedFicheId] = useState<string | null>(null);

  const selectedDossier = EVALUATIONS_RECENTES.find(e => e.id === selectedFicheId);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">
      <FicheEvaluationModal
        isOpen={selectedFicheId !== null}
        onClose={() => setSelectedFicheId(null)}
        dossier={selectedDossier ? {
          nom: selectedDossier.nom,
          prenom: selectedDossier.prenom,
          poste: selectedDossier.poste,
          direction: "Technique"
        } : null}
        readOnly={true}
      />

      {/* En-tête */}
      <PageHeader
        title="Tableau de bord RH"
        subtitle="Cycle d'évaluation 2026 — Vue globale"
        breadcrumbs={[{ label: "Accueil" }, { label: "Tableau de bord RH" }]}
        actions={
          <Button variant="primary" leftIcon={<ArrowDownTrayIcon size={16} />} size="sm">
            Exporter Excel
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Ligne 2 — Pipeline + Évaluations récentes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pipeline */}
        <Card className="xl:col-span-1" padding="md">
          <CardHeader title="Pipeline des évaluations" subtitle="Cycle 2026" icon={<ChartBarIcon size={20} className="text-agilly-primary" />} />
          <div className="flex flex-col gap-4 mt-6">
            {PIPELINE.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-agilly-gray uppercase tracking-wider">
                      {p.label}
                    </span>
                    <span className="text-xs font-bold text-agilly-black">
                      {p.count}
                    </span>
                  </div>
                  <ProgressBar
                    value={(p.count / 34) * 100}
                    size="sm"
                    colorAuto={false}
                    color={p.color}
                    animated
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tableau évaluations récentes */}
        <Card className="xl:col-span-2" padding="none">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-200 bg-white">
            <CardHeader title="Évaluations récentes" subtitle="Dernières activités du cycle — Cliquer sur une ligne pour consulter" />
            <Button variant="ghost" size="sm">Voir tout →</Button>
          </div>

          <div className="bg-[#F4F7FB]">
            {EVALUATIONS_RECENTES.map((ev, idx) => (
              <div
                key={ev.id}
                onClick={() => setSelectedFicheId(ev.id)}
                title="Cliquer pour consulter les détails complets de la fiche"
                className={`px-5 py-4 flex items-center gap-4 bg-white border-l-4 border-transparent hover:border-l-[#F0822A] hover:bg-orange-50/40 transition-all cursor-pointer ${idx !== EVALUATIONS_RECENTES.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <AvatarWithName
                  nom={ev.nom}
                  prenom={ev.prenom}
                  poste={ev.poste}
                  role={ev.role as any}
                  size="sm"
                />
                <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                  <EvaluationStatusBadge statut={ev.statut} size="sm" />
                  <div className="text-right flex-shrink-0 flex items-center gap-3">
                    {ev.noteFinale !== undefined ? (
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 m-0">
                          {formatNote(ev.noteFinale)}
                        </p>
                        <p className="text-[10px] text-slate-500 m-0 mt-0.5">
                          {formatTaux(ev.tauxAtteinte!)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 m-0 font-semibold">
                        {formatDateCourte(ev.date)}
                      </p>
                    )}
                    <span className="text-xs font-bold text-[#F0822A] bg-[#FFF7ED] px-2 py-1 border border-[#FFEDD5]">
                      🔍 Fiche
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>


      {/* Ligne 3 — Actions rapides */}
      <Card padding="md">
        <CardHeader title="Actions rapides" icon={<GridIcon size={20} className="text-agilly-primary" />} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {[
            { label: "Nouveau cycle",         icon: <ArrowPathIcon size={16} />, variant: "primary"   as const },
            { label: "Ouvrir arbitrage",       icon: <ScaleIcon size={16} />, variant: "secondary" as const },
            { label: "Paramètres",   icon: <EyeIcon size={16} />, variant: "secondary" as const },
            { label: "Exporter résultats", icon: <ArrowDownTrayIcon size={16} />, variant: "secondary" as const },
          ].map((a) => (
            <Button key={a.label} variant={a.variant} fullWidth leftIcon={a.icon} size="md">
              {a.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
