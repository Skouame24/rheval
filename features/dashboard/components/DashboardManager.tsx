// ============================================================
// features/dashboard/components/DashboardManager.tsx — IBM Carbon x Agilly
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, AvatarWithName, ProgressBar, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateRelative } from "@/lib/utils/formatDate";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { FicheEvaluation360ManagerModal } from "@/features/evaluation/components/FicheEvaluation360ManagerModal";
import { ModalDefinirObjectifs } from "./ModalDefinirObjectifs";
import type { StatutEvaluation, User } from "@/types";
import { employeesApi } from "@/lib/api/employees.api";

import { UsersIcon, CheckCircleIcon, ClockIcon, PencilIcon, EyeIcon, ChartBarIcon, ScaleIcon, TargetIcon } from "@/components/ui/Icons";

const STATS = [
  { label: "Collaborateurs à évaluer", value: "5", subValue: "2 restants (Équipe directe)", icon: <UsersIcon size={20} className="text-agilly-primary" />, progress: 60 },
  { label: "Validations N+2 requises", value: "3", subValue: "En attente", icon: <CheckCircleIcon size={20} className="text-green-600" />, color: "text-green-600", bg: "bg-green-50" },
  { label: "Arbitrages en cours", value: "1", subValue: "Action requise", icon: <ScaleIcon size={20} className="text-red-600" />, color: "text-red-600", bg: "bg-red-50" },
  { label: "Évaluations soumises", value: "8", subValue: "Ce cycle", icon: <ChartBarIcon size={20} className="text-[#F0822A]" />, color: "text-[#F0822A]", bg: "bg-[#FFF7ED]" },
];



export function DashboardManager() {
  const [selectedCollab, setSelectedCollab] = useState<string | null>(null);
  const [objectifsModalOpen, setObjectifsModalOpen] = useState<string | null>(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);
  const [equipeDirecte, setEquipeDirecte] = useState<User[]>([]);
  const [equipeN2, setEquipeN2] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      employeesApi.getMyTeam(),
      employeesApi.getN2Subordinates()
    ]).then(([team1, team2]) => {
      setEquipeDirecte(team1);
      setEquipeN2(team2);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">

      {/* Modal pour évaluer la fiche classique */}
      <FicheEvaluationModal
        isOpen={selectedCollab !== null}
        onClose={() => setSelectedCollab(null)}
      />

      {/* Modal pour Évaluation 360° Managers & Cadres */}
      <FicheEvaluation360ManagerModal
        isOpen={is360ModalOpen}
        onClose={() => setIs360ModalOpen(false)}
      />

      {/* Modal pour définir les objectifs */}
      <ModalDefinirObjectifs
        isOpen={objectifsModalOpen !== null}
        onClose={() => setObjectifsModalOpen(null)}
        salarieName={equipeDirecte.find(e => e.id === objectifsModalOpen)?.nom || ""}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Espace Manager"
          subtitle="Pilotez votre équipe directe et vos validations hiérarchiques."
          breadcrumbs={[{ label: "Tableau de bord Manager" }]}
        />

        <Button
          variant="primary"
          onClick={() => setIs360ModalOpen(true)}
          className="bg-[#F0822A] hover:bg-[#D97706] text-white font-extrabold shadow-sm"
        >
          🌟 Évaluation 360° Cadres & Managers
        </Button>
      </div>

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
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">
                Chargement des collaborateurs...
              </div>
            ) : equipeDirecte.length === 0 ? (
              <div className="p-10 text-center">
                <h4 className="text-lg font-bold text-slate-800">Aucun collaborateur direct rattaché</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Aucun collaborateur n'est actuellement configuré sous votre responsabilité N+1.
                </p>
              </div>
            ) : (
              equipeDirecte.map((c, idx) => (
                <div
                  key={c.id}
                  className={`
                    p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-white transition-colors
                    ${idx !== equipeDirecte.length - 1 ? "border-b border-gray-200" : ""}
                    border-l-2 border-transparent hover:border-l-agilly-primary hover:bg-[#F4F7FB]
                  `}
                >
                  <div className="flex-1 flex items-center gap-4">
                    <AvatarWithName nom={c.nom} prenom={c.prenom} poste={c.poste} role="SALARIE" size="sm" />
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <EvaluationStatusBadge statut={"EN_ATTENTE_N1"} size="sm" />

                    <div className="flex shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<PencilIcon size={14} />}
                        onClick={() => setSelectedCollab(c.id)}
                      >
                        Évaluer
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Validations N2 & Arbitrages */}
        <div className="flex flex-col gap-6">
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
              <CardHeader title="Mes Validations (N+2)" subtitle="Revues hiérarchiques en attente" />
            </div>
            <div className="bg-[#F4F7FB]">
              {isLoading ? (
                <div className="p-5 text-center text-gray-500 font-semibold animate-pulse">
                  Chargement...
                </div>
              ) : equipeN2.length === 0 ? (
                <div className="p-5 text-center">
                  <p className="text-sm text-slate-500">Aucune validation N+2 requise pour le moment.</p>
                </div>
              ) : (
                equipeN2.map((ev, idx) => (
                  <div key={ev.id} className={`p-5 flex items-center gap-4 bg-white border-l-2 border-transparent hover:border-agilly-primary hover:bg-[#F4F7FB] transition-colors ${idx !== equipeN2.length - 1 ? "border-b border-gray-200" : ""}`}>
                    <AvatarWithName nom={ev.nom} prenom={ev.prenom} poste={ev.poste} role="SALARIE" size="sm" />
                    <div className="flex-1 flex items-center justify-end gap-4">
                      <EvaluationStatusBadge statut={"EN_ATTENTE_N2"} size="sm" />
                      <Button variant="secondary" size="sm" leftIcon={<EyeIcon size={14} />}>
                        Revoir
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
              <CardHeader title="Arbitrages en cours" subtitle="Alerte : Écart > 2 points (N1 vs N2)" />
            </div>
            <div className="bg-[#F4F7FB]">
              <div className="p-5 text-center">
                <p className="text-sm text-slate-500">Aucun dossier en arbitrage.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
