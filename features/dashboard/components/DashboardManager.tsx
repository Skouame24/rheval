// ============================================================
// features/dashboard/components/DashboardManager.tsx
// Tableau de bord officiel Manager N+1 / Encadrant — 100% Données Réelles
// Standardisé avec IBM Carbon x Agilly Design System
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/shared/StatCard";
import { EvaluationStatusBadge } from "@/components/shared/EvaluationStatusBadge";
import { Card, CardHeader, Button, CollaborateursListSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { employeesApi } from "@/lib/api/employees.api";
import { cyclesApi } from "@/lib/api/cycles.api";
import {
  UsersIcon,
  CheckCircleIcon,
  TargetIcon,
  PencilIcon,
  EyeIcon,
  AlertTriangleIcon,
  ArrowPathIcon,
} from "@/components/ui/Icons";
import type { EvaluationCycle, User, Cycle } from "@/types";

export function DashboardManager() {
  const { user } = useAuth();
  const [fiches, setFiches] = useState<EvaluationCycle[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [activeCycle, setActiveCycle] = useState<Cycle | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"TOUS" | "A_FIXER" | "A_NOTER" | "EN_COURS">("TOUS");

  // Modales
  const [selectedCollabForObjectifs, setSelectedCollabForObjectifs] = useState<{
    id: string;
    nom: string;
    poste: string;
    readOnly: boolean;
  } | null>(null);
  const [selectedFicheModal, setSelectedFicheModal] = useState<EvaluationCycle | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fichesData, teamData, cycleData] = await Promise.all([
        evaluationsApi.getN1TeamEvaluations().catch(() => []),
        employeesApi.getMyTeam().catch(() => []),
        cyclesApi.getActif().catch(() => null),
      ]);
      setFiches(Array.isArray(fichesData) ? fichesData : []);
      setTeam(Array.isArray(teamData) ? teamData : []);
      setActiveCycle(cycleData);
    } catch (err) {
      console.error("[DashboardManager] Erreur chargement:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Carte de correspondance collaborateur -> fiche d'évaluation
  const evaluationsMap = useMemo(() => {
    const map: Record<string, EvaluationCycle> = {};
    (fiches || []).forEach((f) => {
      const sId = f.salarie?.id;
      if (sId) map[sId] = f;
    });
    return map;
  }, [fiches]);

  // Liste unifiée des collaborateurs directs avec leur fiche
  const directReports = useMemo(() => {
    // Si team renvoie des utilisateurs, on les associe à leur fiche
    if (team.length > 0) {
      return team.map((member) => ({
        user: member,
        fiche: evaluationsMap[member.id] || null,
      }));
    }
    // Secours si team est vide mais fiches contient des collaborateurs N-1
    return fiches.map((f) => ({
      user: {
        id: f.salarie?.id || f.id,
        nom: f.salarie?.nom || "Collaborateur",
        prenom: f.salarie?.prenom || "",
        email: f.salarie?.email || "",
        poste: f.salarie?.poste || "Poste non défini",
        departement: (f.salarie as any)?.departement || "Direction",
        role: "SALARIE" as const,
      },
      fiche: f,
    }));
  }, [team, fiches, evaluationsMap]);

  // Statistiques dynamiques réelles pour l'équipe directe
  const stats = useMemo(() => {
    const total = directReports.length;

    const aFixer = directReports.filter(({ fiche }) => {
      if (!fiche) return true;
      return (
        fiche.statut === "FIXATION_OBJECTIFS" &&
        (!fiche.objectifs || fiche.objectifs.length === 0)
      );
    }).length;

    const aNoter = directReports.filter(({ fiche }) => {
      if (!fiche) return false;
      return (
        fiche.statut === "EVALUATION_N1" ||
        fiche.statut === "EN_ATTENTE_N1" ||
        fiche.statut === "AUTO_EVALUATION" ||
        fiche.statut === "VALIDATION_OBJECTIFS_SALARIE"
      );
    }).length;

    const finalises = directReports.filter(({ fiche }) => {
      if (!fiche) return false;
      return [
        "VALIDATION_N2",
        "EVALUATION_N2",
        "VALIDATION_NOTES_N2",
        "VISA_SALARIE",
        "ACCORD_SALARIE",
        "VALIDE",
        "CLOTURE",
      ].includes(fiche.statut);
    }).length;

    return [
      {
        label: "Collaborateurs directs",
        value: String(total),
        subValue: "Membres de votre équipe",
        icon: <UsersIcon size={18} className="text-agilly-primary" />,
        color: "text-agilly-primary",
        bg: "bg-[#FFF0E0]",
      },
      {
        label: "Objectifs à définir",
        value: String(aFixer),
        subValue: aFixer > 0 ? "Fixation requise" : "Tous définis",
        icon: <TargetIcon size={18} className="text-amber-600" />,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "Évaluations à réaliser",
        value: String(aNoter),
        subValue: aNoter > 0 ? "Entretiens & notes N+1" : "À jour",
        icon: <PencilIcon size={18} className="text-purple-600" />,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        label: "Dossiers finalisés",
        value: String(finalises),
        subValue: "Transmis ou clôturés",
        icon: <CheckCircleIcon size={18} className="text-emerald-600" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
    ];
  }, [directReports]);

  // Filtrage selon l'onglet actif et la recherche
  const filteredReports = useMemo(() => {
    return directReports.filter(({ user: member, fiche }) => {
      // Filtre texte
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const fullName = `${member.prenom} ${member.nom}`.toLowerCase();
        const poste = (member.poste || "").toLowerCase();
        const email = (member.email || "").toLowerCase();
        if (!fullName.includes(query) && !poste.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      // Filtre onglet
      if (filterTab === "A_FIXER") {
        return (
          !fiche ||
          (fiche.statut === "FIXATION_OBJECTIFS" && (!fiche.objectifs || fiche.objectifs.length === 0))
        );
      }
      if (filterTab === "A_NOTER") {
        return (
          fiche?.statut === "EVALUATION_N1" ||
          fiche?.statut === "EN_ATTENTE_N1" ||
          fiche?.statut === "AUTO_EVALUATION" ||
          fiche?.statut === "VALIDATION_OBJECTIFS_SALARIE"
        );
      }
      if (filterTab === "EN_COURS") {
        return (
          fiche &&
          [
            "VALIDATION_OBJECTIFS_N2",
            "VALIDATION_N2",
            "EVALUATION_N2",
            "VALIDATION_NOTES_N2",
            "VALIDATION_DRH",
            "ARBITRAGE",
            "VISA_SALARIE",
            "VALIDE",
            "CLOTURE",
          ].includes(fiche.statut)
        );
      }

      return true;
    });
  }, [directReports, filterTab, searchQuery]);

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full font-sans">
      {/* Modale de fixation des objectifs */}
      {selectedCollabForObjectifs && (
        <ModalDefinirObjectifs
          isOpen={true}
          onClose={() => setSelectedCollabForObjectifs(null)}
          salariedId={selectedCollabForObjectifs.id}
          salariedName={selectedCollabForObjectifs.nom}
          salariedPoste={selectedCollabForObjectifs.poste}
          readOnly={selectedCollabForObjectifs.readOnly}
          onSaved={() => {
            setSelectedCollabForObjectifs(null);
            loadData();
          }}
        />
      )}

      {/* Modale d'évaluation (Notation N+1 & Formations) */}
      {selectedFicheModal && (
        <FicheEvaluationModal
          isOpen={true}
          evaluationId={selectedFicheModal.id}
          onClose={() => {
            setSelectedFicheModal(null);
            loadData();
          }}
          dossier={{
            id: selectedFicheModal.id,
            ficheId: selectedFicheModal.id,
            salarieId: selectedFicheModal.salarie?.id,
            nom: selectedFicheModal.salarie?.nom || "",
            prenom: selectedFicheModal.salarie?.prenom || "",
            poste: selectedFicheModal.salarie?.poste || "",
            direction: (selectedFicheModal.salarie as any)?.departement || "Direction",
            formations: selectedFicheModal.formations || [],
          }}
          objectifs={selectedFicheModal.objectifs || []}
          role="N1"
          readOnly={
            selectedFicheModal.statut === "VALIDATION_N2" ||
            selectedFicheModal.statut === "EVALUATION_N2" ||
            selectedFicheModal.statut === "VALIDATION_NOTES_N2" ||
            selectedFicheModal.statut === "VALIDATION_DRH" ||
            selectedFicheModal.statut === "VALIDE" ||
            selectedFicheModal.statut === "CLOTURE"
          }
        />
      )}

      {/* En-tête standardisé */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Tableau de bord de mon équipe"
          subtitle="Supervision de vos collaborateurs directs, fixation des objectifs et avancement des évaluations."
          breadcrumbs={[{ label: "Espace Manager" }, { label: "Tableau de bord" }]}
        />

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            leftIcon={<ArrowPathIcon size={14} className={isLoading ? "animate-spin" : ""} />}
          >
            Actualiser
          </Button>
          <Link href="/dashboard/mon-equipe/evaluations">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<EyeIcon size={14} />}
            >
              Évaluations détaillées →
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerte si aucune campagne active */}
      {activeCycle === null && (
        <div className="bg-amber-50 border border-amber-300 p-4 text-amber-900 text-sm font-semibold flex items-center gap-3">
          <AlertTriangleIcon size={20} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-bold text-amber-900 m-0">Campagne d'évaluation non ouverte</p>
            <p className="m-0 mt-0.5 text-xs text-amber-800 font-normal">
              Aucune campagne d'évaluation n'est actuellement ouverte par les RH. La fixation et la notation des objectifs débuteront dès le lancement officiel du cycle.
            </p>
          </div>
        </div>
      )}

      {/* 4 KPIs Standardisés (100% Données Réelles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            subValue={s.subValue}
            icon={s.icon}
            color={s.color}
            bg={s.bg}
          />
        ))}
      </div>

      {/* Carte Principale du Tableau de Bord */}
      <Card padding="none" className="bg-white border border-slate-200 overflow-hidden shadow-2xs">
        {/* Barre d'onglets de filtrage & Recherche */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Onglets standardisés */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterTab("TOUS")}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterTab === "TOUS"
                  ? "bg-white text-slate-900 border border-slate-300 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Tous ({directReports.length})
            </button>
            <button
              onClick={() => setFilterTab("A_FIXER")}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterTab === "A_FIXER"
                  ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              🎯 Objectifs à définir ({stats[1].value})
            </button>
            <button
              onClick={() => setFilterTab("A_NOTER")}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterTab === "A_NOTER"
                  ? "bg-purple-600 text-white shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              📝 À évaluer ({stats[2].value})
            </button>
            <button
              onClick={() => setFilterTab("EN_COURS")}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterTab === "EN_COURS"
                  ? "bg-white text-slate-900 border border-slate-300 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              En cours / Finalisés ({stats[3].value})
            </button>
          </div>

          {/* Recherche rapide */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Rechercher par nom, poste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-white rounded-none focus:border-[#F0822A] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Tableau des collaborateurs directs */}
        {isLoading ? (
          <div className="p-6">
            <CollaborateursListSkeleton count={3} />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <EmptyState
              icon={<UsersIcon size={36} className="text-slate-300" />}
              title={
                searchQuery
                  ? "Aucun collaborateur ne correspond à la recherche"
                  : filterTab === "A_FIXER"
                  ? "Tous les objectifs sont définis"
                  : filterTab === "A_NOTER"
                  ? "Aucune évaluation en attente de notation"
                  : "Aucun collaborateur direct rattaché"
              }
              description={
                searchQuery
                  ? "Vérifiez l'orthographe du nom ou du poste recherché."
                  : "Vos collaborateurs directs apparaîtront automatiquement dès leur rattachement managérial."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Collaborateur direct</th>
                  <th className="py-3 px-4">Département</th>
                  <th className="py-3 px-4">Cycle 2026</th>
                  <th className="py-3 px-4">Statut d'avancement</th>
                  <th className="py-3 px-4 text-right">Action requise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(({ user: member, fiche }) => {
                  const fullName = `${member.prenom ? member.prenom + " " : ""}${member.nom}`.trim();
                  const initials = member.prenom?.charAt(0) || member.nom?.charAt(0) || "U";
                  const hasObjectifs = Boolean(
                    (fiche && fiche.objectifs && fiche.objectifs.length > 0) ||
                    (fiche && fiche.statut && fiche.statut !== "FIXATION_OBJECTIFS")
                  );
                  const isWaitingN2 = fiche?.statut === "VALIDATION_OBJECTIFS_N2";
                  const isReadyToNote =
                    fiche?.statut === "EVALUATION_N1" ||
                    fiche?.statut === "EN_ATTENTE_N1" ||
                    fiche?.statut === "AUTO_EVALUATION" ||
                    fiche?.statut === "VALIDATION_OBJECTIFS_SALARIE";

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Identité */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F0822A] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate m-0">
                              {fullName}
                            </p>
                            <p className="text-slate-500 text-[11px] truncate m-0 mt-0.5">
                              {member.poste || "Collaborateur"} • {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Département */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {member.departement || "Direction"}
                      </td>

                      {/* Cycle */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {fiche?.cycle?.libelle || activeCycle?.libelle || "Campagne 2026"}
                      </td>

                      {/* Statut d'avancement */}
                      <td className="py-3.5 px-4">
                        {fiche?.statut ? (
                          <EvaluationStatusBadge statut={fiche.statut} size="sm" />
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                            Non démarré
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Cas 0 : En attente validation Direction (N+2) */}
                          {isWaitingN2 ? (
                            <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 inline-flex items-center gap-1.5 cursor-not-allowed">
                              ⏳ En attente validation N+2
                            </span>
                          ) : isReadyToNote && fiche ? (
                            /* Cas 1 : À évaluer (Notes & Entretien) */
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<PencilIcon size={13} />}
                              onClick={() => setSelectedFicheModal(fiche)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            >
                              Évaluer & Noter
                            </Button>
                          ) : (
                            /* Cas standard : Consulter la fiche d'évaluation */
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<EyeIcon size={13} />}
                              onClick={() => {
                                if (fiche) {
                                  setSelectedFicheModal(fiche);
                                } else {
                                  window.location.href = "/dashboard/mon-equipe/evaluations";
                                }
                              }}
                            >
                              Consulter
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
