// ============================================================
// features/dashboard/components/DashboardN1.tsx — IBM Carbon
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, AvatarWithName, ProgressBar, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateRelative } from "@/lib/utils/formatDate";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import type { StatutEvaluation, User } from "@/types";
import { employeesApi } from "@/lib/api/employees.api";

import { UsersIcon, CheckCircleIcon, ClockIcon, GraduationCapIcon, GridIcon, ListIcon, PencilIcon, EyeIcon, ChartBarIcon } from "@/components/ui/Icons";

const STATS = [
  { label: "Collaborateurs à évaluer", value: "5", subValue: "2 restants", icon: <UsersIcon size={20} className="text-agilly-primary" />, progress: 60 },
  { label: "Évaluations soumises", value: "3", subValue: "ce cycle", icon: <CheckCircleIcon size={20} className="text-green-600" />, color: "text-green-600", bg: "bg-green-50" },
  { label: "En attente de ma part", value: "2", subValue: "À compléter", icon: <ClockIcon size={20} className="text-orange-600" />, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Besoins de formation", value: "4", subValue: "identifiés", icon: <GraduationCapIcon size={20} className="text-blue-600" />, color: "text-blue-600", bg: "bg-blue-50" },
];



export function DashboardN1() {
  const [selectedCollab, setSelectedCollab] = useState<string | null>(null);
  const [collaborateurs, setCollaborateurs] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    employeesApi.getMyTeam().then((data) => {
      setCollaborateurs(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const activeCollab = collaborateurs.find((c) => c.id === selectedCollab);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">

      <FicheEvaluationModal
        isOpen={selectedCollab !== null}
        onClose={() => setSelectedCollab(null)}
        dossier={activeCollab ? {
          nom: activeCollab.nom,
          prenom: activeCollab.prenom,
          poste: activeCollab.poste,
          direction: "Direction Technique",
        } : undefined}
      />

      <PageHeader
        title="Mes évaluations Manager"
        subtitle="Cycle 2026 — Vos collaborateurs directs (N+1)"
        breadcrumbs={[{ label: "Tableau de bord N+1" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Liste collaborateurs */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-200 flex items-center justify-between bg-white">
          <CardHeader title="Mes collaborateurs" subtitle="Statut de leurs fiches de performance" />
          <span className="text-[10px] font-bold px-3 py-1 bg-[#FFF0E0] text-agilly-primary border border-[#F0822A33] uppercase tracking-wider hidden sm:block">
            2 en attente
          </span>
        </div>

        <div className="bg-[#F4F7FB]">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">
              Chargement des collaborateurs...
            </div>
          ) : collaborateurs.length === 0 ? (
            <div className="p-10 text-center">
              <h4 className="text-lg font-bold text-slate-800">Aucun collaborateur direct rattaché</h4>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Aucun collaborateur n'est actuellement configuré sous votre responsabilité N+1. Vous pouvez synchroniser l'annuaire Microsoft Entra ID ou contacter l'administration RH.
              </p>
            </div>
          ) : (
            collaborateurs.map((c, idx) => (
              <div
                key={c.id}
                onClick={() => setSelectedCollab(c.id)}
                className={`
                  p-5 md:p-6 flex items-center gap-6 cursor-pointer bg-white transition-colors
                  ${idx !== collaborateurs.length - 1 ? "border-b border-gray-200" : ""}
                  hover:border-agilly-primary border-l-2 border-transparent hover:border-l-agilly-primary hover:bg-[#F4F7FB]
                `}
              >
                <AvatarWithName nom={c.nom} prenom={c.prenom} poste={c.poste} role="SALARIE" size="sm" />

                <div className="flex-1 flex items-center justify-between gap-4">
                  <EvaluationStatusBadge statut={"EN_ATTENTE_N1" as StatutEvaluation} size="sm" />

                  <div className="flex items-center gap-4 shrink-0">
                    <div onClick={(e) => { e.stopPropagation(); setSelectedCollab(c.id); }}>
                      <Button
                        variant={"primary"}
                        size="sm"
                        leftIcon={<PencilIcon size={14} />}
                      >
                        Évaluer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Progression globale */}
      <Card padding="lg">
        <CardHeader title="Ma progression ce cycle" subtitle="5 collaborateurs sous votre responsabilité" icon={<ChartBarIcon size={20} className="text-agilly-primary" />} />
        <div className="mt-4">
          <ProgressBar value={60} showLabel size="lg" animated color="#FF8C00" colorAuto={false} />
          <p className="text-sm font-semibold text-agilly-gray mt-4 m-0">
            3 fiches d'évaluation transmises sur 5 — 2 restantes à compléter
          </p>
        </div>
      </Card>

    </div>
  );
}
