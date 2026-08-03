// ============================================================
// features/dashboard/components/DashboardManager.tsx — IBM Carbon x Agilly
// ============================================================

"use client";
import { useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, AvatarWithName, ProgressBar, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateRelative } from "@/lib/utils/formatDate";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalDefinirObjectifs } from "./ModalDefinirObjectifs";
import type { StatutEvaluation } from "@/types";

import { UsersIcon, CheckCircleIcon, ClockIcon, PencilIcon, EyeIcon, ChartBarIcon, ScaleIcon, TargetIcon } from "@/components/ui/Icons";

const STATS = [
  { label: "Collaborateurs à évaluer", value: "5", subValue: "2 restants (Équipe directe)", icon: <UsersIcon size={20} className="text-agilly-primary" />, progress: 60 },
  { label: "Validations N+2 requises", value: "3", subValue: "En attente", icon: <CheckCircleIcon size={20} className="text-green-600" />, color: "text-green-600", bg: "bg-green-50" },
  { label: "Arbitrages en cours", value: "1", subValue: "Action requise", icon: <ScaleIcon size={20} className="text-red-600" />, color: "text-red-600", bg: "bg-red-50" },
  { label: "Évaluations soumises", value: "8", subValue: "Ce cycle", icon: <ChartBarIcon size={20} className="text-blue-600" />, color: "text-blue-600", bg: "bg-blue-50" },
];

const EQUIPE_DIRECTE: {
  id: string; nom: string; prenom: string; poste: string;
  statut: StatutEvaluation | "OBJECTIFS_A_FIXER"; deadline: string; urgent: boolean;
}[] = [
    { id: "1", nom: "KOUAME", prenom: "Ebenezer", poste: "Dev Full-Stack", statut: "OBJECTIFS_A_FIXER", deadline: "2026-11-15", urgent: true },
    { id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", statut: "EN_ATTENTE_N1", deadline: "2026-12-31", urgent: false },
    { id: "3", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", statut: "VALIDE", deadline: "2026-12-10", urgent: false },
  ];

const EQUIPE_N2 = [
  { id: "4", nom: "Traoré", prenom: "Seydou", poste: "Data Analyst", statut: "EN_ATTENTE_N2" as const, priorite: "normale" },
  { id: "5", nom: "Diallo", prenom: "Amara", poste: "Dev Fullstack", statut: "EN_ATTENTE_N2" as const, priorite: "normale" },
];

export function DashboardManager() {
  const [selectedCollab, setSelectedCollab] = useState<string | null>(null);
  const [objectifsModalOpen, setObjectifsModalOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">

      {/* Modal pour évaluer la fiche */}
      <FicheEvaluationModal
        isOpen={selectedCollab !== null}
        onClose={() => setSelectedCollab(null)}
      />

      {/* Modal pour définir les objectifs */}
      <ModalDefinirObjectifs
        isOpen={objectifsModalOpen !== null}
        onClose={() => setObjectifsModalOpen(null)}
        salarieName={EQUIPE_DIRECTE.find(e => e.id === objectifsModalOpen)?.nom || ""}
      />

      <PageHeader
        title="Espace Manager"
        subtitle="Pilotez votre équipe directe et vos validations hiérarchiques."
        breadcrumbs={[{ label: "Tableau de bord Manager" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Liste équipe directe (N1) */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-200 flex items-center justify-between bg-white">
            <CardHeader title="Mon Équipe Directe" subtitle="Fixez les objectifs et évaluez." />
            <span className="text-[10px] font-bold px-3 py-1 bg-[#FFF0E0] text-agilly-primary border border-agilly-primary/20 uppercase tracking-wider hidden sm:block">
              1 action requise
            </span>
          </div>

          <div className="bg-[#F4F7FB]">
            {EQUIPE_DIRECTE.map((c, idx) => (
              <div
                key={c.id}
                className={`
                  p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-white transition-colors
                  ${idx !== EQUIPE_DIRECTE.length - 1 ? "border-b border-gray-200" : ""}
                  border-l-2 border-transparent hover:border-l-agilly-primary hover:bg-[#F4F7FB]
                `}
              >
                <div className="flex-1 flex items-center gap-4">
                  <AvatarWithName nom={c.nom} prenom={c.prenom} poste={c.poste} role="SALARIE" size="sm" />
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {c.statut === "OBJECTIFS_A_FIXER" ? (
                    <span className="text-[10px] font-bold px-2 py-1 bg-orange-50 text-agilly-primary border border-agilly-primary/20 uppercase">
                      Objectifs à fixer
                    </span>
                  ) : (
                    <EvaluationStatusBadge statut={c.statut as StatutEvaluation} size="sm" />
                  )}

                  <div className="flex shrink-0">
                    {c.statut === "OBJECTIFS_A_FIXER" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<TargetIcon size={14} />}
                        onClick={() => setObjectifsModalOpen(c.id)}
                      >
                        Fixer Objectifs
                      </Button>
                    ) : c.statut === "EN_ATTENTE_N1" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<PencilIcon size={14} />}
                        onClick={() => setSelectedCollab(c.id)}
                      >
                        Évaluer
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<EyeIcon size={14} />}
                        onClick={() => setSelectedCollab(c.id)}
                      >
                        Voir Fiche
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Validations N2 & Arbitrages */}
        <div className="flex flex-col gap-6">
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
              <CardHeader title="Mes Validations (N+2)" subtitle="Revues hiérarchiques en attente" />
            </div>
            <div className="bg-[#F4F7FB]">
              {EQUIPE_N2.map((ev, idx) => (
                <div key={ev.id} className={`p-5 flex items-center gap-4 bg-white border-l-2 border-transparent hover:border-agilly-primary hover:bg-[#F4F7FB] transition-colors ${idx !== EQUIPE_N2.length - 1 ? "border-b border-gray-200" : ""}`}>
                  <AvatarWithName nom={ev.nom} prenom={ev.prenom} poste={ev.poste} role="SALARIE" size="sm" />
                  <div className="flex-1 flex items-center justify-end gap-4">
                    <EvaluationStatusBadge statut={ev.statut} size="sm" />
                    <Button variant="secondary" size="sm" leftIcon={<EyeIcon size={14} />}>
                      Revoir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
              <CardHeader title="Arbitrages en cours" subtitle="Alerte : Écart > 2 points (N1 vs N2)" />
            </div>
            <div className="bg-[#F4F7FB]">
              <div className="p-5 bg-white border-l-2 border-transparent hover:border-red-600 hover:bg-red-50 transition-colors">
                <AvatarWithName nom="Coulibaly" prenom="Ibrahim" poste="Chef de Projet" role="SALARIE" size="sm" />
                <p className="text-xs mt-4 p-3 bg-red-50 text-red-700 border border-red-200 font-medium m-0">
                  Désaccord sur la note de performance — N+1 : 12/20 · Vous (N+2) : 15/20
                </p>
                <div className="mt-4">
                  <Button variant="secondary" fullWidth leftIcon={<ScaleIcon size={14} className="text-agilly-black" />}>
                    Ouvrir dossier d'arbitrage
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
