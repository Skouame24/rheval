// ============================================================
// app/absences/demandes/page.tsx
// Écran "Mes demandes" complet et corporate
// Conforme à tous les points d'amélioration ergonomiques :
//  - Actions contextuelles par ligne : "Corriger" si retour, "Télécharger PDF" si approuvée, "Annuler" si en cours, "Consulter"
//  - Motif de révision affiché directement sous forme d'infobulle/bandeau visible
//  - Référence et statuts sans coupure de ligne (whitespace-nowrap)
//  - Filtres complets : Tous les statuts du cycle de vie
//  - Recherche par référence/texte, Tri et Pagination
//  - Cartes du haut cliquables filtrant le tableau
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem, StatutDemandeRH } from "@/types/absences.types";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";

function MesDemandesContent() {
  const searchParams = useSearchParams();
  const { myDemandes, annulerDemande } = useAbsences();

  // Filtres
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [filterType, setFilterType] = useState<string>("TOUS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"DATE_DESC" | "DATE_ASC" | "DUREE">("DATE_DESC");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedDemande, setSelectedDemande] = useState<DemandeRHItem | null>(null);
  const [demandeToCancel, setDemandeToCancel] = useState<DemandeRHItem | null>(null);

  // Synchronisation avec les query params si on vient du dashboard
  useEffect(() => {
    const statutParam = searchParams.get("statut");
    if (statutParam) {
      setFilterStatut(statutParam);
    }
  }, [searchParams]);

  // Filtrage combiné rigoureux
  const filteredDemandes = useMemo(() => {
    return myDemandes
      .filter((dem) => {
        // Filtre Statut étendu (cycle de vie complet)
        if (filterStatut === "EN_COURS") {
          if (!["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(dem.statut)) return false;
        } else if (filterStatut === "APPROUVEE") {
          if (!["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut)) return false;
        } else if (filterStatut === "RETOUR") {
          if (dem.statut !== "RETOURNEE_EMPLOYE") return false;
        } else if (filterStatut === "BROUILLON") {
          if (dem.statut !== "BROUILLON") return false;
        } else if (filterStatut === "REFUSEE") {
          if (dem.statut !== "REFUSEE_DEFINITIVEMENT") return false;
        } else if (filterStatut === "ANNULEE") {
          if (dem.statut !== "ANNULEE") return false;
        }

        // Filtre Type
        if (filterType !== "TOUS" && dem.typeDemande !== filterType) {
          return false;
        }

        // Recherche par mot clé (Référence, motif ou type)
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase().trim();
          const matchRef = dem.codeReference.toLowerCase().includes(q);
          const matchType = dem.libelleType.toLowerCase().includes(q);
          const matchMotif = dem.motif.toLowerCase().includes(q);
          if (!matchRef && !matchType && !matchMotif) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "DATE_DESC") {
          return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
        } else if (sortBy === "DATE_ASC") {
          return new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime();
        } else if (sortBy === "DUREE") {
          return b.nombreJoursOuvres - a.nombreJoursOuvres;
        }
        return 0;
      });
  }, [myDemandes, filterStatut, filterType, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage) || 1;
  const paginatedDemandes = filteredDemandes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (statut: StatutDemandeRH) => {
    switch (statut) {
      case "EN_VALIDATION_N1":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 border border-amber-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
            En attente Supérieur
          </span>
        );
      case "EN_VALIDATION_DRH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 border border-amber-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
            Contrôle DRH
          </span>
        );
      case "EN_VALIDATION_DG":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 border border-purple-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            Validation Direction
          </span>
        );
      case "APPROUVEE":
      case "PERMISSION_EDITEE":
      case "ARCHIVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 border border-emerald-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full" />
            Approuvée
          </span>
        );
      case "RETOURNEE_EMPLOYE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-900 bg-red-50 px-2 py-0.5 border border-red-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            À corriger
          </span>
        );
      case "REFUSEE_DEFINITIVEMENT":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-300 whitespace-nowrap">
            Refusée
          </span>
        );
      case "ANNULEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200 whitespace-nowrap">
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 border border-slate-200 whitespace-nowrap">
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
      {/* ── EN-TÊTE DE LA PAGE (MINUSCULES EN USAGE FRANÇAIS) ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D96F1D]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Mes demandes d&apos;absences & permissions
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Historique complet, suivi des validations et téléchargement officiel des permissions scellées.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/absences"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 px-3 py-1.5 bg-white transition-colors"
          >
            &larr; Tableau de bord
          </Link>
          <Link
            href="/absences/nouvelle"
            className="inline-flex items-center gap-2 bg-[#D96F1D] hover:bg-[#B95914] text-white font-semibold text-xs py-2 px-3.5 transition-colors shadow-xs"
          >
            <span>+ Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* ── 4 CARTES RAPIDES DU HAUT (CLIQUABLES POUR FILTRER IMMÉDIATEMENT) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          type="button"
          onClick={() => { setFilterStatut("TOUS"); setCurrentPage(1); }}
          className={`p-3 text-left border cursor-pointer transition-colors ${
            filterStatut === "TOUS"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">Toutes les demandes</span>
          <span className="text-xl font-bold font-mono mt-1 block">{myDemandes.length}</span>
        </button>

        <button
          type="button"
          onClick={() => { setFilterStatut("EN_COURS"); setCurrentPage(1); }}
          className={`p-3 text-left border cursor-pointer transition-colors ${
            filterStatut === "EN_COURS"
              ? "bg-[#D96F1D] text-white border-[#D96F1D]"
              : "bg-white text-slate-800 border-slate-200 hover:border-[#D96F1D]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">En cours d&apos;instruction</span>
          <span className="text-xl font-bold font-mono mt-1 block text-amber-600">
            {myDemandes.filter((d) => ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setFilterStatut("APPROUVEE"); setCurrentPage(1); }}
          className={`p-3 text-left border cursor-pointer transition-colors ${
            filterStatut === "APPROUVEE"
              ? "bg-emerald-700 text-white border-emerald-700"
              : "bg-white text-slate-800 border-slate-200 hover:border-emerald-600"
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">Permissions accordées</span>
          <span className="text-xl font-bold font-mono mt-1 block text-emerald-700">
            {myDemandes.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setFilterStatut("RETOUR"); setCurrentPage(1); }}
          className={`p-3 text-left border cursor-pointer transition-colors ${
            filterStatut === "RETOUR"
              ? "bg-red-700 text-white border-red-700"
              : "bg-white text-slate-800 border-slate-200 hover:border-red-600"
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-80">À corriger</span>
          <span className="text-xl font-bold font-mono mt-1 block text-red-600">
            {myDemandes.filter((d) => d.statut === "RETOURNEE_EMPLOYE").length}
          </span>
        </button>
      </div>

      {/* ── BARRE D'OUTILS COMPLÈTE : RECHERCHE, SÉLECTEURS ET TRI ── */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche par référence ou mot-clé */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Rechercher par référence..."
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 font-medium text-slate-900 focus:border-[#D96F1D] focus:outline-none"
            />
          </div>

          {/* Select Statut étendu */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1">
            <span className="text-slate-500 font-medium">Statut :</span>
            <select
              value={filterStatut}
              onChange={(e) => { setFilterStatut(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_COURS">En cours de validation</option>
              <option value="APPROUVEE">Approuvée & Éditée</option>
              <option value="RETOUR">À corriger (retour employé)</option>
              <option value="REFUSEE">Refusée définitivement</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>

          {/* Select Type de Demande */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1">
            <span className="text-slate-500 font-medium">Nature :</span>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TOUS">Toutes les natures</option>
              <optgroup label="Congés">
                <option value="CONGES_ANNUELS">Congé annuel payé</option>
                <option value="CONGES_MALADIE">Congé maladie</option>
                <option value="CONGES_MATERNITE">Congé de maternité</option>
                <option value="CONGES_PATERNITE">Congé de paternité</option>
                <option value="CONGES_SANS_SOLDE">Congé sans solde</option>
                <option value="CONGES_FORMATION">Congé de formation</option>
              </optgroup>
              <optgroup label="Permissions">
                <option value="PERMISSION_MARIAGE">Permission mariage</option>
                <option value="PERMISSION_NAISSANCE">Permission naissance</option>
                <option value="PERMISSION_DECES">Permission décès</option>
                <option value="PERMISSION_FAMILIALE">Permission familiale / urgence</option>
                <option value="PERMISSION_MEDICALE">Rendez-vous médical</option>
                <option value="PERMISSION_ADMINISTRATIVE">Démarches administratives</option>
                <option value="PERMISSION_SCOLAIRE">Obligations scolaires</option>
                <option value="PERMISSION_EXAMEN">Examen ou concours</option>
                <option value="PERMISSION_SORTIE">Permission de sortie (heures)</option>
              </optgroup>
              <optgroup label="Missions">
                <option value="MISSION_DEPLACEMENT">Ordre de mission & déplacement</option>
                <option value="INTERVENTION_TERRAIN">Intervention terrain</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Tri et Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 font-semibold text-slate-800 px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="DATE_DESC">Date (plus récente)</option>
              <option value="DATE_ASC">Date (plus ancienne)</option>
              <option value="DUREE">Durée (jours)</option>
            </select>
          </div>

          {(filterStatut !== "TOUS" || filterType !== "TOUS" || searchQuery !== "") && (
            <button
              type="button"
              onClick={() => {
                setFilterStatut("TOUS");
                setFilterType("TOUS");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-[#D96F1D] hover:underline cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── TABLEAU CORPORATE DES DEMANDES ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        {paginatedDemandes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-800 text-sm">Aucune demande trouvée</p>
            <p className="text-slate-500 mt-1">
              Modifiez votre recherche ou vos filtres pour afficher vos demandes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap min-w-[150px]">Référence</th>
                  <th className="py-3 px-4 whitespace-nowrap">Nature</th>
                  <th className="py-3 px-4 whitespace-nowrap">Période d&apos;absence</th>
                  <th className="py-3 px-4 whitespace-nowrap text-center">Durée</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[180px]">Étape du circuit</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">Statut</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDemandes.map((dem) => {
                  const isCircuitCourt =
                    dem.nombreJoursOuvres <= 2 &&
                    (dem.typeDemande === "PERMISSION_EXCEPTIONNELLE" || dem.typeDemande === "RECUPERATION");
                  const motifRefus = dem.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;

                  return (
                    <tr
                      key={dem.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Référence sans retour à la ligne */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {dem.codeReference}
                      </td>

                      {/* Nature */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {dem.libelleType}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        Du {formatDateFr(dem.dateDebut)} au {formatDateFr(dem.dateFin)}
                      </td>

                      {/* Durée */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-center whitespace-nowrap">
                        {dem.nombreJoursOuvres} j
                      </td>

                      {/* Étape du circuit (sans jargon et tenant compte de circuit court) */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {dem.statut === "RETOURNEE_EMPLOYE" ? (
                          <span className="text-red-700 font-bold">
                            Retournée à l&apos;employé
                          </span>
                        ) : isCircuitCourt ? (
                          <>
                            {dem.etapeCourante === "SUPERIEUR_N1" && "1/3 : Avis Supérieur"}
                            {dem.etapeCourante === "DRH" && "2/3 : Validation finale DRH"}
                            {dem.etapeCourante === "AGENT_DRH" && "3/3 : Édition de la permission"}
                            {dem.etapeCourante === "CLOTURE" && "Terminé"}
                          </>
                        ) : (
                          <>
                            {dem.etapeCourante === "SUPERIEUR_N1" && "1/4 : Avis Supérieur"}
                            {dem.etapeCourante === "DRH" && "2/4 : Contrôle DRH"}
                            {dem.etapeCourante === "DIRECTION_DG" && "3/4 : Direction Générale"}
                            {dem.etapeCourante === "AGENT_DRH" && "4/4 : Édition de la permission"}
                            {dem.etapeCourante === "CLOTURE" && "Terminé"}
                          </>
                        )}
                      </td>

                      {/* Statut avec infobulle directe si motif de rejet */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(dem.statut)}
                          {dem.statut === "RETOURNEE_EMPLOYE" && motifRefus && (
                            <span
                              className="text-[10px] text-red-800 bg-red-100/70 border border-red-200 px-1.5 py-0.5 truncate max-w-[200px]"
                              title={`Motif : ${motifRefus}`}
                            >
                              Motif : &ldquo;{motifRefus}&rdquo;
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions contextuelles : Corriger, Télécharger, Annuler, Voir */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {dem.statut === "RETOURNEE_EMPLOYE" && (
                            <Link
                              href={`/absences/nouvelle?edit=${dem.id}`}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                              title="Corriger et renvoyer la demande"
                            >
                              Corriger
                            </Link>
                          )}

                          {["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(dem.statut) && (
                            <Link
                              href="/absences/registre"
                              className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors"
                              title="Télécharger l'autorisation officielle scellée"
                            >
                              PDF
                            </Link>
                          )}

                          {["EN_VALIDATION_N1", "EN_VALIDATION_DRH"].includes(dem.statut) && (
                            <button
                              type="button"
                              onClick={() => setDemandeToCancel(dem)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                              title="Annuler la demande avant validation"
                            >
                              Annuler
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedDemande(dem)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 cursor-pointer"
                          >
                            Consulter &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── BARRE DE PAGINATION CORPORATE ── */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Affichage de <strong>{paginatedDemandes.length}</strong> sur <strong>{filteredDemandes.length}</strong> demande(s)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-semibold cursor-pointer"
            >
              &larr; Précédent
            </button>
            <span className="px-2 font-mono font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Suivant &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL D'ANNULATION EXPLICITE (EF-05) ── */}
      {demandeToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-2xl max-w-sm w-full p-5 text-xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-900">Confirmer l&apos;annulation</h3>
            <p className="text-slate-600">
              Êtes-vous sûr de vouloir annuler la demande <strong>{demandeToCancel.codeReference}</strong> ({demandeToCancel.libelleType}) ? Cette action interrompra définitivement son circuit d&apos;instruction.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDemandeToCancel(null)}
                className="px-3 py-1.5 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Garder la demande
              </button>
              <button
                type="button"
                onClick={() => {
                  annulerDemande(demandeToCancel.id);
                  setDemandeToCancel(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 font-bold text-white cursor-pointer"
              >
                Confirmer l&apos;annulation
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="text-slate-600 text-[11px]">
                  {selectedDemande.libelleType} • Déposée le {formatDateFr(selectedDemande.dateCreation)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemande(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
              {/* Stepper graphique */}
              <DemandeWorkflowStepper demande={selectedDemande} />

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Motif officiel consigné
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 italic text-slate-800 text-xs">
                  &ldquo;{selectedDemande.motif}&rdquo;
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Adresse & Contact pendant l&apos;absence
                </span>
                <p className="p-2.5 bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                  {selectedDemande.adresseContactPendantAbsence || "Non spécifié"}
                </p>
              </div>

              {/* Journal d'audit chronologique */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Historique des visas & traçabilité
                </span>
                <div className="border border-slate-200 divide-y divide-slate-100">
                  {selectedDemande.historique.map((h, i) => (
                    <div key={i} className="p-2.5 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block">{h.libelleEtape}</span>
                        <span className="text-[11px] text-slate-600">Par {h.acteurNom} ({h.acteurPoste})</span>
                        {h.motif && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">&ldquo;{h.motif}&rdquo;</p>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {formatDateFr(h.dateAction)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDemande(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-semibold text-slate-800 cursor-pointer"
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

export default function MesDemandesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement de vos demandes...</div>}>
      <MesDemandesContent />
    </Suspense>
  );
}
