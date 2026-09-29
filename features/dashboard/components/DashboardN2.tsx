// ============================================================
// features/dashboard/components/DashboardN2.tsx — Espace N+2 Connecté Backend
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, AvatarWithName, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckCircleIcon, PencilIcon, EyeIcon, ScaleIcon, UsersIcon } from "@/components/ui/Icons";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import type { EvaluationCycle } from "@/types";

export function DashboardN2() {
  const [fiches, setFiches] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFicheModal, setSelectedFicheModal] = useState<EvaluationCycle | null>(null);

  useEffect(() => {
    evaluationsApi
      .getAllForRh()
      .then((data) => {
        setFiches(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("[DashboardN2] Erreur chargement fiches N2:", err);
        setFiches([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const evaluationsAValider = fiches.filter(
    (f) => f.statut === "EN_ATTENTE_N2" || f.statut === "VALIDATION_N2"
  );

  const arbitrages = fiches.filter((f) => f.statut === "ARBITRAGE");
  const evaluationsSoumises = fiches.filter(
    (f) => f.statut === "VALIDE" || f.statut === "CLOTURE"
  );

  const stats = [
    {
      label: "Évaluations à traiter",
      value: String(evaluationsAValider.length),
      subValue: evaluationsAValider.length > 0 ? "Action N+2 requise" : "À jour",
      icon: <PencilIcon size={20} className="text-purple-600" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Évaluations clôturées",
      value: String(evaluationsSoumises.length),
      subValue: "Campagne 2026",
      icon: <CheckCircleIcon size={20} className="text-green-600" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Arbitrages à traiter",
      value: String(arbitrages.length),
      subValue: arbitrages.length > 0 ? "Décision requise" : "Aucun litige",
      icon: <ScaleIcon size={20} className="text-red-600" />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Dossiers supervisés",
      value: String(fiches.length),
      subValue: "Dans votre périmètre",
      icon: <UsersIcon size={20} className="text-agilly-primary" />,
      color: "text-agilly-primary",
      bg: "bg-[#FFF0E0]",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full font-sans">
      {selectedFicheModal && (
        <FicheEvaluationModal
          isOpen={true}
          onClose={() => setSelectedFicheModal(null)}
          dossier={{
            nom: selectedFicheModal.salarie?.nom || "",
            prenom: selectedFicheModal.salarie?.prenom || "",
            poste: selectedFicheModal.salarie?.poste || "",
            direction: (selectedFicheModal.salarie as any)?.departement || "",
          }}
          objectifs={selectedFicheModal.objectifs}
        />
      )}

      <PageHeader
        title="Tableau de bord Supervision (N+2)"
        subtitle="Campagne 2026 — Revue hiérarchique, contre-évaluation et arbitrages réels"
        breadcrumbs={[{ label: "Tableau de bord N+2" }]}
      />

      {/* KPIs dynamiques réels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Évaluations N+2 à traiter */}
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm rounded-none">
          <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
            <CardHeader
              title="Évaluations à traiter"
              subtitle={`${evaluationsAValider.length} dossier(s) en attente de visa N+2`}
              icon="📝"
            />
          </div>

          <div className="bg-[#F8FAFC]">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white">
                <div className="w-7 h-7 border-2 border-[#F0822A] border-t-transparent animate-spin rounded-none" />
                <span className="text-xs text-slate-500 font-bold">Chargement des dossiers N+2...</span>
              </div>
            ) : evaluationsAValider.length > 0 ? (
              evaluationsAValider.map((ev, idx) => {
                const nom = ev.salarie?.nom || "Collaborateur";
                const prenom = ev.salarie?.prenom || "";
                const poste = ev.salarie?.poste || "Collaborateur";

                return (
                  <div
                    key={ev.id}
                    className={`p-5 flex items-center gap-4 bg-white border-l-2 border-transparent hover:border-agilly-primary hover:bg-[#F4F7FB] transition-colors ${
                      idx !== evaluationsAValider.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    <AvatarWithName nom={nom} prenom={prenom} poste={poste} role="SALARIE" size="sm" />
                    <div className="flex-1 flex items-center justify-between gap-3">
                      <EvaluationStatusBadge statut={ev.statut} size="sm" />
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<PencilIcon size={14} />}
                        onClick={() => setSelectedFicheModal(ev)}
                      >
                        Contre-évaluer
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center bg-white">
                <CheckCircleIcon size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 m-0">Toutes les contre-évaluations N+2 sont à jour</p>
                <p className="text-xs text-slate-500 mt-1 mb-0">Aucun dossier en attente de validation à ce stade.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Arbitrages réels */}
        <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm rounded-none">
          <div className="p-5 md:p-6 border-b border-gray-200 bg-white">
            <CardHeader
              title="Arbitrages hiérarchiques"
              subtitle="Écarts de notation N+1 / N+2 nécessitant décision"
              icon="⚖️"
            />
          </div>

          <div className="bg-[#F8FAFC]">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white">
                <div className="w-7 h-7 border-2 border-[#F0822A] border-t-transparent animate-spin rounded-none" />
                <span className="text-xs text-slate-500 font-bold">Vérification des arbitrages...</span>
              </div>
            ) : arbitrages.length > 0 ? (
              arbitrages.map((arb, idx) => {
                const nom = arb.salarie?.nom || "Collaborateur";
                const prenom = arb.salarie?.prenom || "";
                const poste = arb.salarie?.poste || "Collaborateur";

                return (
                  <div
                    key={arb.id}
                    className={`p-5 bg-white border-l-2 border-transparent hover:border-red-600 hover:bg-red-50 transition-colors ${
                      idx !== arbitrages.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    <AvatarWithName nom={nom} prenom={prenom} poste={poste} role="SALARIE" size="sm" />
                    <p className="text-xs mt-4 p-3 bg-red-50 text-red-700 border border-red-200 font-medium">
                      {arb.observation || "Écart de notation constaté lors de la contre-évaluation."}
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        fullWidth
                        leftIcon={<EyeIcon size={14} className="text-agilly-black" />}
                        onClick={() => setSelectedFicheModal(arb)}
                      >
                        Consulter le dossier d'arbitrage
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center bg-white">
                <CheckCircleIcon size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 m-0">Aucun arbitrage en cours</p>
                <p className="text-xs text-slate-500 mt-1 mb-0">Tous les avis N+1 et N+2 sont alignés et sans contentieux.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
