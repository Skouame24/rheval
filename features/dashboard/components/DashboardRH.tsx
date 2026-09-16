// ============================================================
// features/dashboard/components/DashboardRH.tsx — IBM Carbon
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, ProgressBar, AvatarWithName, Badge, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateCourte } from "@/lib/utils/formatDate";
import { formatNote, formatTaux } from "@/lib/utils/formatNote";
import type { StatutEvaluation } from "@/types";
import { UsersIcon, CheckCircleIcon, ScaleIcon, ChartBarIcon, ArrowDownTrayIcon, ArrowPathIcon, EyeIcon, GridIcon } from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { rhApi } from "@/lib/api/rh.api";

// ─── Données de démo ────────────────────────────────────────



// ─── Composant ──────────────────────────────────────────────

export function DashboardRH() {
  const [selectedFicheId, setSelectedFicheId] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      evaluationsApi.getAll(),
      rhApi.getDashboardStats()
    ]).then(([evals, dashboardStats]) => {
      setEvaluations(evals);
      setStats(dashboardStats);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const selectedDossier = evaluations.find(e => e.id === selectedFicheId);

  const dynamicStats = [
    {
      label: "Salariés évalués",
      value: stats?.salariesEvalues?.toString() || "0",
      subValue: `sur ${stats?.totalSalaries || 0} au total`,
      icon: <UsersIcon size={20} className="text-agilly-primary" />,
      color: "text-agilly-primary",
      bg: "bg-[#FFF0E0]",
      progress: stats?.totalSalaries ? Math.round((stats.salariesEvalues / stats.totalSalaries) * 100) : 0,
    },
    {
      label: "Évaluations en attente",
      value: stats?.enAttente?.toString() || "0",
      subValue: "Action requise",
      icon: <CheckCircleIcon size={20} className="text-orange-600" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Arbitrages ouverts",
      value: stats?.arbitrages?.toString() || "0",
      subValue: "Décision requise",
      icon: <ScaleIcon size={20} className="text-red-600" />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Taux d'atteinte moyen",
      value: stats?.tauxMoyen ? `${stats.tauxMoyen} %` : "0 %",
      subValue: "Cycle en cours",
      icon: <ChartBarIcon size={20} className="text-green-600" />,
      color: "text-green-600",
      bg: "bg-green-50",
      progress: stats?.tauxMoyen || 0,
    },
  ];

  const pipeline = [
    { label: "En attente N+1", count: stats?.pipeline?.attenteN1 || 0, color: "#D97706" },
    { label: "En attente N+2", count: stats?.pipeline?.attenteN2 || 0, color: "#7C3AED" },
    { label: "En attente RH",  count: stats?.pipeline?.attenteRH || 0, color: "#0060AC" },
    { label: "Arbitrage",      count: stats?.pipeline?.arbitrage || 0, color: "#DC2626" },
    { label: "Validés",        count: stats?.pipeline?.valides || 0, color: "#10B981" },
    { label: "Clôturés",       count: stats?.pipeline?.clotures || 0, color: "#535B6A" },
  ];

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
        {dynamicStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Ligne 2 — Pipeline + Évaluations récentes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pipeline */}
        <Card className="xl:col-span-1" padding="md">
          <CardHeader title="Pipeline des évaluations" subtitle="Cycle 2026" icon={<ChartBarIcon size={20} className="text-agilly-primary" />} />
          <div className="flex flex-col gap-4 mt-6">
            {pipeline.map((p) => (
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
                    value={stats?.totalSalaries ? (p.count / stats.totalSalaries) * 100 : 0}
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
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">
                Chargement des données...
              </div>
            ) : evaluations.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-slate-500 font-semibold mb-2">Aucune fiche d'évaluation initiée</p>
                <Button variant="primary" size="sm">Créer un cycle</Button>
              </div>
            ) : (
              evaluations.map((ev, idx) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedFicheId(ev.id)}
                  title="Cliquer pour consulter les détails complets de la fiche"
                  className={`px-5 py-4 flex items-center gap-4 bg-white border-l-4 border-transparent hover:border-l-[#F0822A] hover:bg-orange-50/40 transition-all cursor-pointer ${idx !== evaluations.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <AvatarWithName
                    nom={ev.nom || ev.salarie?.nom}
                    prenom={ev.prenom || ev.salarie?.prenom}
                    poste={ev.poste || "Collaborateur"}
                    role={ev.role as any || "SALARIE"}
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
                          {ev.date ? formatDateCourte(ev.date) : "N/A"}
                        </p>
                      )}
                      <span className="text-xs font-bold text-[#F0822A] bg-[#FFF7ED] px-2 py-1 border border-[#FFEDD5]">
                        🔍 Fiche
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
