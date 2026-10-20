// ============================================================
// app/absences/demandes/page.tsx
// Liste des demandes RH — Interface Salarié claire, sobre et corporate
// Tableau lisible, filtres discrets, CTA net, tiroir d'inspection
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem, StatutDemandeRH } from "@/types/absences.types";

export default function MesDemandesPage() {
  const { currentPersona, myDemandes, annulerDemande, soldeConges } = useAbsences();

  // Filtres simples
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [selectedDemande, setSelectedDemande] = useState<DemandeRHItem | null>(null);

  // Filtrage
  const filteredDemandes = useMemo(() => {
    return myDemandes.filter((dem) => {
      if (filterStatut === "EN_COURS") {
        return ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(dem.statut);
      }
      if (filterStatut === "APPROUVEE") {
        return ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut);
      }
      if (filterStatut === "RETOUR") {
        return ["RETOURNEE_EMPLOYE", "REFUSEE_DEFINITIVEMENT"].includes(dem.statut);
      }
      return true;
    });
  }, [myDemandes, filterStatut]);

  const getStatusBadge = (statut: StatutDemandeRH) => {
    switch (statut) {
      case "EN_VALIDATION_N1":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            En attente Supérieur N+1
          </span>
        );
      case "EN_VALIDATION_DRH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Contrôle DRH
          </span>
        );
      case "EN_VALIDATION_DG":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-800 bg-purple-50 px-2.5 py-1 border border-purple-200">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            Validation Direction DG
          </span>
        );
      case "APPROUVEE":
      case "PERMISSION_EDITEE":
      case "ARCHIVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            Approuvée
          </span>
        );
      case "RETOURNEE_EMPLOYE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-800 bg-red-50 px-2.5 py-1 border border-red-200">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            À réviser
          </span>
        );
      case "ANNULEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 border border-slate-200">
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1 border border-slate-200">
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
      {/* ── EN-TÊTE ÉPURÉ AVEC SOLDE SALARIÉ ET ACTION PRINCIPALE ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Mes demandes de congés et permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Déposez et suivez vos demandes d&apos;absence selon le circuit hiérarchique.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Solde rapide visible */}
          <div className="text-right border-r border-slate-200 pr-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Solde disponible
            </span>
            <span className="text-base font-extrabold font-mono text-slate-900">
              {soldeConges.joursRestants} j
            </span>
          </div>

          <Link
            href="/absences/nouvelle"
            className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs py-2.5 px-4 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* ── ONGLETS DE FILTRAGE RAPIDE ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px text-xs">
        {[
          { key: "TOUS", label: "Toutes les demandes", count: myDemandes.length },
          {
            key: "EN_COURS",
            label: "En validation",
            count: myDemandes.filter((d) =>
              ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)
            ).length,
          },
          {
            key: "APPROUVEE",
            label: "Validées",
            count: myDemandes.filter((d) =>
              ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)
            ).length,
          },
          {
            key: "RETOUR",
            label: "À corriger",
            count: myDemandes.filter((d) =>
              ["RETOURNEE_EMPLOYE", "REFUSEE_DEFINITIVEMENT"].includes(d.statut)
            ).length,
          },
        ].map((tab) => {
          const isActive = filterStatut === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatut(tab.key)}
              className={`
                px-3 py-2 font-medium transition-colors cursor-pointer border-b-2
                ${
                  isActive
                    ? "border-[#F0822A] text-[#F0822A] font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }
              `}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 text-[11px] font-mono opacity-70">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* ── TABLEAU LISIBLE ET STRUCTURÉ ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        {filteredDemandes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-800 text-sm">Aucune demande dans cette catégorie</p>
            <p className="text-slate-400 mt-1">
              Vos demandes créées apparaîtront ici avec leur état d&apos;avancement dans le circuit.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Nature</th>
                  <th className="py-3 px-4">Période</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Circuit & Valideur</th>
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
                    <td className="py-3.5 px-4 text-slate-600">
                      {dem.etapeCourante === "SUPERIEUR_N1" && "Étape 1 : Supérieur hiérarchique"}
                      {dem.etapeCourante === "DRH" && "Étape 2 : Contrôle DRH"}
                      {dem.etapeCourante === "DIRECTION_DG" && "Étape 3 : Direction Générale"}
                      {dem.etapeCourante === "AGENT_DRH" && "Étape finale : Édition du bulletin"}
                      {dem.etapeCourante === "CLOTURE" && "Circuit terminé"}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(dem.statut)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-slate-400 group-hover:text-slate-900 font-bold">&rarr;</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TIROIR D'INSPECTION DÉTAILLÉ DE LA DEMANDE ── */}
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
                className="p-1.5 text-slate-400 hover:text-slate-800"
              >
                &times;
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">
              {/* Statut actuel */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  État actuel de la demande
                </span>
                {getStatusBadge(selectedDemande.statut)}
              </div>

              {/* Période & Durée */}
              <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dates retenues
                </span>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  Du {formatDateFr(selectedDemande.dateDebut)} au {formatDateFr(selectedDemande.dateFin)}
                </p>
                <p className="text-slate-600 font-medium">
                  {selectedDemande.nombreJoursOuvres} jours ouvrés (
                  {selectedDemande.nombreJoursCalendaires || selectedDemande.nombreJoursOuvres} calendaires)
                </p>
              </div>

              {/* Motif */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Motif déclaré
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 italic text-slate-800 leading-relaxed">
                  &ldquo;{selectedDemande.motif}&rdquo;
                </p>
              </div>

              {/* Contact d'absence */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Adresse et contact pendant l&apos;absence
                </span>
                <p className="font-medium text-slate-800">
                  {selectedDemande.adresseContactPendantAbsence || "Non renseigné"}
                </p>
              </div>

              {/* Historique du circuit */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Historique des étapes et avis
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
                  Annuler cette demande
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Non annulable</span>
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
