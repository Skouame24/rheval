// ============================================================
// app/absences/demandes/page.tsx
// Liste des demandes RH + Tiroir latéral d'inspection détaillé
// Respect strict du Design System IBM Carbon x Agilly
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem, StatutDemandeRH, TypeDemandeRH } from "@/types/absences.types";

export default function MesDemandesPage() {
  const { currentPersona, myDemandes, annulerDemande } = useAbsences();

  // Filtres
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [filterType, setFilterType] = useState<string>("TOUS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Demande sélectionnée pour inspection dans le tiroir latéral
  const [selectedDemande, setSelectedDemande] = useState<DemandeRHItem | null>(null);

  // Filtrage des données
  const filteredDemandes = useMemo(() => {
    return myDemandes.filter((dem) => {
      const matchSearch =
        dem.codeReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dem.libelleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dem.motif.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatut =
        filterStatut === "TOUS" ||
        (filterStatut === "EN_COURS" &&
          ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(dem.statut)) ||
        (filterStatut === "APPROUVEE" &&
          ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut)) ||
        (filterStatut === "RETOUR" &&
          ["RETOURNEE_EMPLOYE", "REFUSEE_DEFINITIVEMENT"].includes(dem.statut));

      const matchType = filterType === "TOUS" || dem.typeDemande === filterType;

      return matchSearch && matchStatut && matchType;
    });
  }, [myDemandes, searchTerm, filterStatut, filterType]);

  const getStatusBadge = (statut: StatutDemandeRH) => {
    switch (statut) {
      case "EN_VALIDATION_N1":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Attente N+1
          </span>
        );
      case "EN_VALIDATION_DRH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Contrôle DRH
          </span>
        );
      case "EN_VALIDATION_DG":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 border border-purple-200">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            Arbitrage DG
          </span>
        );
      case "APPROUVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Approuvée
          </span>
        );
      case "PERMISSION_EDITEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F0822A] bg-[#FFF4EB] px-2 py-0.5 border border-[#FDE3CC]">
            <span className="w-1.5 h-1.5 bg-[#F0822A] rounded-full" />
            Bulletin émis
          </span>
        );
      case "ARCHIVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-200">
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
            Archivée GED
          </span>
        );
      case "RETOURNEE_EMPLOYE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 border border-red-200">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            À réviser
          </span>
        );
      case "ANNULEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 border border-slate-200">
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 border border-slate-200">
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
      {/* ── EN-TÊTE DE SECTION ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Mes demandes d&apos;absences & permissions
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Suivi en temps réel de votre circuit hiérarchique, historique des avis et téléchargement des bulletins.
          </p>
        </div>

        <Link
          href="/absences/nouvelle"
          className="inline-flex items-center gap-1.5 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs py-2 px-3.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Nouvelle demande</span>
        </Link>
      </div>

      {/* ── BARRE DE FILTRES COMPACTE ── */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Recherche textuelle */}
        <div className="w-full md:w-72 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence, motif..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#F0822A]"
          />
        </div>

        {/* Sélecteurs de filtrage */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtre statut */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1">
            <span className="text-slate-400 font-medium">Statut :</span>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_COURS">En validation</option>
              <option value="APPROUVEE">Approuvées / Éditées</option>
              <option value="RETOUR">À réviser</option>
            </select>
          </div>

          {/* Filtre type */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1">
            <span className="text-slate-400 font-medium">Type :</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="TOUS">Toutes les natures</option>
              <option value="CONGES_ANNUELS">Congés Annuels</option>
              <option value="PERMISSION_EXCEPTIONNELLE">Permission Exceptionnelle</option>
              <option value="MISSION_DEPLACEMENT">Mission / Déplacement</option>
              <option value="CONGES_MALADIE">Congés Maladie</option>
              <option value="RECUPERATION">Récupération</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TABLEAU DES DEMANDES (DENSE & CORPORATE) ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        {filteredDemandes.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-900">Aucune demande trouvée</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Vous n&apos;avez aucune demande correspondant à ces critères de recherche.
            </p>
            <Link
              href="/absences/nouvelle"
              className="mt-4 px-3 py-1.5 bg-[#F0822A] text-white text-xs font-semibold hover:bg-[#D96F1D]"
            >
              Créer une demande
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Type de permission</th>
                  <th className="py-3 px-4">Période (Du / Au)</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Étape hiérarchique</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDemandes.map((dem) => (
                  <tr
                    key={dem.id}
                    onClick={() => setSelectedDemande(dem)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 group-hover:text-[#F0822A] transition-colors">
                        {dem.codeReference}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Déposée le {formatDateFr(dem.dateCreation)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{dem.libelleType}</span>
                      {dem.destination && (
                        <span className="block text-[10px] text-slate-500">
                          {dem.destination}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      Du {formatDateFr(dem.dateDebut)} au {formatDateFr(dem.dateFin)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900">
                        {dem.nombreJoursOuvres} j
                      </span>
                      <span className="text-[10px] text-slate-400 block">ouvrés</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 font-medium">
                        {dem.etapeCourante === "SUPERIEUR_N1" && "Supérieur N+1"}
                        {dem.etapeCourante === "DRH" && "Contrôle DRH"}
                        {dem.etapeCourante === "DIRECTION_DG" && "Direction Générale"}
                        {dem.etapeCourante === "AGENT_DRH" && "Édition Agent DRH"}
                        {dem.etapeCourante === "CLOTURE" && "Circuit clôturé"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(dem.statut)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDemande(dem);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TIROIR LATÉRAL D'INSPECTION (DRAWER) ── */}
      {selectedDemande && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fond obscurci */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDemande(null)}
          />

          {/* Corps du tiroir */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Entête du tiroir */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedDemande.codeReference}
                  </span>
                  {getStatusBadge(selectedDemande.statut)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Bulletin Individuel de demande • {selectedDemande.libelleType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemande(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 border border-transparent transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Contenu défilant */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 text-xs">
              {/* Carte Demandeur Officiel */}
              <div className="border border-slate-200 p-3.5 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Identité du salarié (Bulletin officiel)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nom & Prénoms</span>
                    <span className="font-bold text-slate-900">
                      {selectedDemande.demandeur.prenom} {selectedDemande.demandeur.nom}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Matricule RH</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedDemande.demandeur.matricule}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fonction</span>
                    <span className="font-medium text-slate-900">
                      {selectedDemande.demandeur.poste}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Département</span>
                    <span className="font-medium text-slate-900">
                      {selectedDemande.demandeur.departement}
                    </span>
                  </div>
                  {selectedDemande.demandeur.numeroCnss && (
                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[10px]">Numéro CNSS</span>
                      <span className="font-mono text-slate-700">
                        {selectedDemande.demandeur.numeroCnss}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Détails de la période & Motif */}
              <div className="border border-slate-200 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Période demandée
                </span>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 p-2 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Date de début (inclus)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatDateFr(selectedDemande.dateDebut)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Date de fin (inclus)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatDateFr(selectedDemande.dateFin)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 px-2 bg-[#FFF4EB] border border-[#FDE3CC] text-slate-800 mb-3">
                  <span className="font-medium">Durée totale calculée :</span>
                  <span className="font-mono font-bold text-[#F0822A]">
                    {selectedDemande.nombreJoursOuvres} jours ouvrés (
                    {selectedDemande.nombreJoursCalendaires || selectedDemande.nombreJoursOuvres}{" "}
                    calendaires)
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px]">Motif explicite de la permission :</span>
                  <p className="text-slate-800 bg-slate-50 p-2.5 border border-slate-200 italic leading-relaxed">
                    &ldquo;{selectedDemande.motif}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col gap-1 mt-2.5">
                  <span className="text-slate-400 text-[10px]">
                    Adresse et contact téléphonique pendant l&apos;absence :
                  </span>
                  <p className="text-slate-700 font-medium">
                    {selectedDemande.adresseContactPendantAbsence || "Non renseigné"}
                  </p>
                </div>
              </div>

              {/* Frise verticale d'audit et de validation */}
              <div className="border border-slate-200 p-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Journal d&apos;audit & circuit de validation
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedDemande.historique.length} événement(s)
                  </span>
                </div>

                <div className="flex flex-col gap-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedDemande.historique.map((hist) => (
                    <div key={hist.id} className="relative pl-6">
                      <span
                        className={`absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          hist.decision === "VALIDE"
                            ? "bg-emerald-600"
                            : hist.decision === "EDITE" || hist.decision === "ARCHIVE"
                            ? "bg-[#F0822A]"
                            : hist.decision === "REFUSE_RETOUR"
                            ? "bg-amber-500"
                            : "bg-red-600"
                        }`}
                      />
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-slate-900">{hist.libelleEtape}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(hist.dateAction).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        Par : {hist.acteurNom} ({hist.acteurPoste})
                      </p>
                      {hist.motif && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 mt-1 border border-slate-200">
                          {hist.motif}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulletin officiel généré (si disponible) */}
              {selectedDemande.documentPermission && (
                <div className="border border-emerald-200 bg-emerald-50/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Bulletin Officiel Disponible
                      </span>
                      <p className="font-mono font-bold text-slate-900 mt-0.5">
                        {selectedDemande.documentPermission.numeroUnique}
                      </p>
                    </div>
                    <Link
                      href="/absences/registre"
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                      Voir le document
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Barre d'action en bas du tiroir */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {/* Annulation autorisée tant que non approuvée (EF-05) */}
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
                  className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                >
                  Annuler cette demande
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Demande non modifiable</span>
              )}

              <button
                type="button"
                onClick={() => setSelectedDemande(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
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

