// ============================================================
// app/absences/demandes/page.tsx
// Écran "Mes Demandes" dédié : Tableau complet et filtres en <select>
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem, StatutDemandeRH } from "@/types/absences.types";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";

export default function MesDemandesPage() {
  const { myDemandes, annulerDemande } = useAbsences();

  // Filtres simples sous forme de <select>
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [filterType, setFilterType] = useState<string>("TOUS");
  const [selectedDemande, setSelectedDemande] = useState<DemandeRHItem | null>(null);

  // Filtrage combiné simple
  const filteredDemandes = useMemo(() => {
    return myDemandes.filter((dem) => {
      // Filtre statut
      if (filterStatut === "EN_COURS") {
        if (!["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(dem.statut)) {
          return false;
        }
      } else if (filterStatut === "APPROUVEE") {
        if (!["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut)) {
          return false;
        }
      } else if (filterStatut === "RETOUR") {
        if (!["RETOURNEE_EMPLOYE", "REFUSEE_DEFINITIVEMENT"].includes(dem.statut)) {
          return false;
        }
      }

      // Filtre nature
      if (filterType !== "TOUS" && dem.typeDemande !== filterType) {
        return false;
      }

      return true;
    });
  }, [myDemandes, filterStatut, filterType]);

  const getStatusBadge = (statut: StatutDemandeRH) => {
    switch (statut) {
      case "EN_VALIDATION_N1":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            En attente N+1
          </span>
        );
      case "EN_VALIDATION_DRH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Contrôle DRH
          </span>
        );
      case "EN_VALIDATION_DG":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-800 bg-purple-50 px-2 py-0.5 border border-purple-200">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            Validation DG
          </span>
        );
      case "APPROUVEE":
      case "PERMISSION_EDITEE":
      case "ARCHIVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            Approuvée
          </span>
        );
      case "RETOURNEE_EMPLOYE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-800 bg-red-50 px-2 py-0.5 border border-red-200">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            À corriger
          </span>
        );
      case "ANNULEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-200">
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 border border-slate-200">
            {statut}
          </span>
        );
    }
  };

  const formatDateFr = (isoStr: string) => {
    if (!isoStr) return "-";
    const parts = isoStr.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DE LA PAGE MES DEMANDES ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Historique & Suivi de Mes Demandes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consultez toutes vos demandes d&apos;absences, le workflow associé et téléchargez vos permissions validées.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/absences"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 bg-white"
          >
            &larr; Tableau de bord
          </Link>
          <Link
            href="/absences/nouvelle"
            className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs py-2 px-3.5 transition-colors shadow-xs"
          >
            <span>+ Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* ── BARRE DE SÉLECTION & FILTRES SIMPLES (AVEC DES <select>) ── */}
      <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Select Statut */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5">
            <span className="text-slate-400 font-medium">Statut :</span>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TOUS">Tous les statuts ({myDemandes.length})</option>
              <option value="EN_COURS">En cours de validation</option>
              <option value="APPROUVEE">Approuvées / Émises</option>
              <option value="RETOUR">À corriger</option>
            </select>
          </div>

          {/* Select Type de Demande */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5">
            <span className="text-slate-400 font-medium">Type de demande :</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TOUS">Toutes les natures</option>
              <option value="CONGES_ANNUELS">Congés Annuels</option>
              <option value="PERMISSION_EXCEPTIONNELLE">Permission Exceptionnelle</option>
              <option value="MISSION_DEPLACEMENT">Mission / Déplacement</option>
              <option value="INTERVENTION_TERRAIN">Intervention Terrain</option>
              <option value="CONGES_MALADIE">Congés Maladie</option>
              <option value="RECUPERATION">Récupération</option>
              <option value="ABSENCE_NON_PAYEE">Absence non payée</option>
            </select>
          </div>
        </div>

        {(filterStatut !== "TOUS" || filterType !== "TOUS") && (
          <button
            type="button"
            onClick={() => {
              setFilterStatut("TOUS");
              setFilterType("TOUS");
            }}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* ── TABLEAU COMPLET DES DEMANDES ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        {filteredDemandes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-800 text-sm">Aucune demande trouvée</p>
            <p className="text-slate-400 mt-1">
              Modifiez votre sélection de filtre pour afficher les autres demandes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Nature</th>
                  <th className="py-3 px-4">Période (Du / Au)</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Étape du circuit</th>
                  <th className="py-3 px-4">Progression</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDemandes.map((dem) => (
                  <tr
                    key={dem.id}
                    onClick={() => setSelectedDemande(dem)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-[#F0822A]">
                      {dem.codeReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {dem.libelleType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      Du {formatDateFr(dem.dateDebut)} au {formatDateFr(dem.dateFin)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {dem.nombreJoursOuvres} j
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {dem.etapeCourante === "SUPERIEUR_N1" && "1/4 : Supérieur N+1"}
                      {dem.etapeCourante === "DRH" && "2/4 : Contrôle DRH"}
                      {dem.etapeCourante === "DIRECTION_DG" && "3/4 : Direction DG"}
                      {dem.etapeCourante === "AGENT_DRH" && "4/4 : Édition Bulletin"}
                      {dem.etapeCourante === "CLOTURE" && "Terminé ✓"}
                    </td>
                    <td className="py-3.5 px-4 min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <div className={`h-1.5 flex-1 ${["SOUMISE", "EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG", "APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut) ? "bg-[#F0822A]" : "bg-slate-200"}`} />
                        <div className={`h-1.5 flex-1 ${["EN_VALIDATION_DRH", "EN_VALIDATION_DG", "APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut) ? "bg-[#F0822A]" : dem.statut === "EN_VALIDATION_N1" ? "bg-amber-400 animate-pulse" : "bg-slate-200"}`} />
                        <div className={`h-1.5 flex-1 ${["EN_VALIDATION_DG", "APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut) ? "bg-[#F0822A]" : dem.statut === "EN_VALIDATION_DRH" ? "bg-amber-400 animate-pulse" : "bg-slate-200"}`} />
                        <div className={`h-1.5 flex-1 ${["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut) ? "bg-emerald-600" : dem.statut === "EN_VALIDATION_DG" ? "bg-amber-400 animate-pulse" : "bg-slate-200"}`} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(dem.statut)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDemande(dem);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300"
                      >
                        Consulter &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TIROIR D'INSPECTION AVEC LE STEPPER COMPLET ── */}
      {selectedDemande && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDemande(null)}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 text-xs">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900 block">
                  {selectedDemande.codeReference}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {selectedDemande.libelleType} • Déposée le {formatDateFr(selectedDemande.dateCreation)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemande(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
              {/* Stepper graphique */}
              <DemandeWorkflowStepper demande={selectedDemande} />

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Statut
                </span>
                {getStatusBadge(selectedDemande.statut)}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Période demandée
                </span>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  Du {formatDateFr(selectedDemande.dateDebut)} au {formatDateFr(selectedDemande.dateFin)}
                </p>
                <p className="text-slate-600 font-medium">
                  {selectedDemande.nombreJoursOuvres} jours ouvrés ({selectedDemande.nombreJoursCalendaires || selectedDemande.nombreJoursOuvres} calendaires)
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Motif
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 italic text-slate-800 leading-relaxed">
                  &ldquo;{selectedDemande.motif}&rdquo;
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Contact d&apos;urgence
                </span>
                <p className="font-medium text-slate-800">
                  {selectedDemande.adresseContactPendantAbsence || "Non renseigné"}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Historique des validations
                </span>
                <div className="flex flex-col gap-2">
                  {selectedDemande.historique.map((h) => (
                    <div key={h.id} className="p-2.5 bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{h.libelleEtape}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {formatDateFr(h.dateAction)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Par {h.acteurNom} ({h.acteurPoste})</span>
                      {h.motif && <p className="text-[11px] text-slate-600 italic mt-0.5">&ldquo;{h.motif}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(
                selectedDemande.statut
              ) ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Confirmez-vous l'annulation de cette demande ?")) {
                      annulerDemande(selectedDemande.id);
                      setSelectedDemande(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 cursor-pointer"
                >
                  Annuler la demande
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Dossier clôturé</span>
              )}

              <button
                type="button"
                onClick={() => setSelectedDemande(null)}
                className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
