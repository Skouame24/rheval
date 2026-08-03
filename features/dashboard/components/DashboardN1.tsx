// ============================================================
// features/dashboard/components/DashboardN1.tsx — IBM Carbon
// ============================================================

"use client";
import { useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, AvatarWithName, ProgressBar, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateRelative } from "@/lib/utils/formatDate";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import type { StatutEvaluation } from "@/types";

import { UsersIcon, CheckCircleIcon, ClockIcon, GraduationCapIcon, GridIcon, ListIcon, PencilIcon, EyeIcon, ChartBarIcon } from "@/components/ui/Icons";

const STATS = [
  { label: "Collaborateurs à évaluer", value: "5", subValue: "2 restants", icon: <UsersIcon size={20} className="text-agilly-primary" />, progress: 60 },
  { label: "Évaluations soumises", value: "3", subValue: "ce cycle", icon: <CheckCircleIcon size={20} className="text-green-600" />, color: "text-green-600", bg: "bg-green-50" },
  { label: "En attente de ma part", value: "2", subValue: "À compléter", icon: <ClockIcon size={20} className="text-orange-600" />, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Besoins de formation", value: "4", subValue: "identifiés", icon: <GraduationCapIcon size={20} className="text-blue-600" />, color: "text-blue-600", bg: "bg-blue-50" },
];

const COLLABORATEURS: {
  id: string; nom: string; prenom: string; poste: string;
  statut: StatutEvaluation; deadline: string; urgent: boolean;
}[] = [
    { id: "1", nom: "KOUAME", prenom: "Ebenezer", poste: "Dev Full-Stack", statut: "EN_ATTENTE_N1", deadline: "2026-12-30", urgent: true },
    { id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", statut: "EN_ATTENTE_N1", deadline: "2026-12-31", urgent: false },
    { id: "3", nom: "Bah", prenom: "Oumar", poste: "Dev Mobile", statut: "EN_ATTENTE_N2", deadline: "2026-12-25", urgent: false },
    { id: "4", nom: "Camara", prenom: "Aissatou", poste: "QA Engineer", statut: "EN_ATTENTE_RH", deadline: "2026-12-20", urgent: false },
    { id: "5", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", statut: "VALIDE", deadline: "2026-12-10", urgent: false },
  ];

export function DashboardN1() {
  const [selectedCollab, setSelectedCollab] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">

      <FicheEvaluationModal
        isOpen={selectedCollab !== null}
        onClose={() => setSelectedCollab(null)}
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
          {COLLABORATEURS.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => setSelectedCollab(c.id)}
              className={`
                p-5 md:p-6 flex items-center gap-6 cursor-pointer bg-white transition-colors
                ${idx !== COLLABORATEURS.length - 1 ? "border-b border-gray-200" : ""}
                hover:border-agilly-primary border-l-2 border-transparent hover:border-l-agilly-primary hover:bg-[#F4F7FB]
              `}
            >
              <AvatarWithName nom={c.nom} prenom={c.prenom} poste={c.poste} role="SALARIE" size="sm" />

              <div className="flex-1 flex items-center justify-between gap-4">
                <EvaluationStatusBadge statut={c.statut} size="sm" />

                <div className="flex items-center gap-4 shrink-0">
                  {c.urgent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 uppercase tracking-widest hidden sm:inline-block">
                      🔴 Urgent
                    </span>
                  )}
                  <span className="text-xs font-semibold text-agilly-gray hidden md:inline-block">
                    {formatDateRelative(c.deadline)}
                  </span>

                  <div onClick={(e) => { e.stopPropagation(); setSelectedCollab(c.id); }}>
                    <Button
                      variant={c.statut === "EN_ATTENTE_N1" ? "primary" : "secondary"}
                      size="sm"
                      leftIcon={c.statut === "EN_ATTENTE_N1" ? <PencilIcon size={14} /> : <EyeIcon size={14} />}
                    >
                      {c.statut === "EN_ATTENTE_N1" ? "Évaluer" : "Voir Fiche"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
