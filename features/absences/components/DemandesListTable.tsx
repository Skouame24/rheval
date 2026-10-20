// ============================================================
// features/absences/components/DemandesListTable.tsx
// Tableau complet des demandes RH avec filtres, recherche et badges
// Conforme au Design System Agilly (Bords droits, typographie nette)
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { DemandeRHItem, StatutDemandeRH, TypeDemandeRH } from "@/types/absences.types";
import { PersonaUser } from "@/lib/mock/absences.mock";

interface DemandesListTableProps {
  demandes: DemandeRHItem[];
  currentPersona: PersonaUser;
  onSelectDemande: (demande: DemandeRHItem) => void;
  onOpenPermission: (demande: DemandeRHItem) => void;
  onValidateDirect: (demande: DemandeRHItem) => void;
}

export function DemandesListTable({
  demandes,
  currentPersona,
  onSelectDemande,
  onOpenPermission,
  onValidateDirect,
}: DemandesListTableProps) {
  const [activeTab, setActiveTab] = useState<"TOUTES" | "A_VALIDER" | "MES_DEMANDES" | "APPROUVEES" | "RETOURS">("TOUTES");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Déterminer si une demande attend l'action du persona courant
  const canPersonaAct = (demande: DemandeRHItem): boolean => {
    if (currentPersona.role === "SUPERIEUR_N1" && demande.statut === "EN_VALIDATION_N1") return true;
    if (currentPersona.role === "DRH" && demande.statut === "EN_VALIDATION_DRH") return true;
    if (currentPersona.role === "DIRECTION_DG" && demande.statut === "EN_VALIDATION_DG") return true;
    if (currentPersona.role === "AGENT_DRH" && demande.statut === "APPROUVEE") return true;
    return false;
  };

  const filteredDemandes = useMemo(() => {
    return demandes.filter((d) => {
      // Filtre Onglet
      if (activeTab === "A_VALIDER" && !canPersonaAct(d)) return false;
      if (activeTab === "MES_DEMANDES" && d.demandeur.id !== currentPersona.id) return false;
      if (activeTab === "APPROUVEES" && !["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)) return false;
      if (activeTab === "RETOURS" && d.statut !== "RETOURNEE_EMPLOYE") return false;

      // Filtre Type
      if (filterType !== "ALL" && d.typeDemande !== filterType) return false;

      // Recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchRef = d.codeReference.toLowerCase().includes(query);
        const matchNom = `${d.demandeur.prenom} ${d.demandeur.nom}`.toLowerCase().includes(query);
        const matchDept = d.demandeur.departement.toLowerCase().includes(query);
        const matchMotif = d.motif.toLowerCase().includes(query);
        if (!matchRef && !matchNom && !matchDept && !matchMotif) return false;
      }

      return true;
    });
  }, [demandes, activeTab, filterType, searchQuery, currentPersona]);

  const getStatutBadge = (statut: StatutDemandeRH) => {
    switch (statut) {
      case "EN_VALIDATION_N1":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-orange-50 text-[#EA580C] border border-orange-200">
            Attente Supérieur
          </span>
        );
      case "EN_VALIDATION_DRH":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
            Attente DRH
          </span>
        );
      case "EN_VALIDATION_DG":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200">
            Attente DG
          </span>
        );
      case "APPROUVEE":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300">
            Approuvée (À éditer)
          </span>
        );
      case "PERMISSION_EDITEE":
      case "ARCHIVEE":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
            Archivée GED
          </span>
        );
      case "RETOURNEE_EMPLOYE":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-50 text-red-700 border border-red-300">
            Retournée (Non OK)
          </span>
        );
      case "BROUILLON":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-300">
            Brouillon
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700">
            {statut}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xs select-none">
      {/* ── BARRE D'ONGLETS STYLES CARBONE ── */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 md:px-6 pt-3 flex-wrap gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: "TOUTES", label: "Toutes les demandes", count: demandes.length },
            {
              id: "A_VALIDER",
              label: "À Valider par moi",
              count: demandes.filter(canPersonaAct).length,
              urgent: demandes.filter(canPersonaAct).length > 0,
            },
            {
              id: "MES_DEMANDES",
              label: "Mes Propres Demandes",
              count: demandes.filter((d) => d.demandeur.id === currentPersona.id).length,
            },
            {
              id: "APPROUVEES",
              label: "Validées & GED",
              count: demandes.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)).length,
            },
            {
              id: "RETOURS",
              label: "Retours avec motif",
              count: demandes.filter((d) => d.statut === "RETOURNEE_EMPLOYE").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 border-b-[#F0822A] shadow-xs"
                  : "text-slate-500 border-b-transparent hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 font-black ${
                  tab.urgent
                    ? "bg-red-600 text-white"
                    : activeTab === tab.id
                    ? "bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* RECHERCHE ET FILTRE */}
        <div className="flex items-center gap-2 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher réf, nom, motif..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 text-xs py-1.5 pl-8 pr-3 outline-none w-48 md:w-64 focus:border-[#F0822A]"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-300 text-xs py-1.5 px-2 outline-none cursor-pointer focus:border-[#F0822A]"
          >
            <option value="ALL">Tous types</option>
            <option value="CONGE_PAYE">Congé Payé</option>
            <option value="PERMISSION_ABSENCE">Permission</option>
            <option value="MISSION_DEPLACEMENT">Mission</option>
            <option value="INTERVENTION_TERRAIN">Intervention</option>
            <option value="REPOS_MALADIE">Maladie</option>
          </select>
        </div>
      </div>

      {/* ── TABLEAU PRINCIPAL DES DEMANDES ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Référence</th>
              <th className="py-3 px-4">Demandeur</th>
              <th className="py-3 px-4">Nature de l'Absence</th>
              <th className="py-3 px-4">Période & Durée</th>
              <th className="py-3 px-4">Étape du Circuit</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredDemandes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  Aucune demande ne correspond aux critères sélectionnés.
                </td>
              </tr>
            ) : (
              filteredDemandes.map((demande) => {
                const canAct = canPersonaAct(demande);

                return (
                  <tr
                    key={demande.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      canAct ? "bg-orange-50/30" : ""
                    }`}
                  >
                    {/* Référence */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {canAct && <span className="w-2 h-2 bg-[#F0822A] inline-block animate-pulse" />}
                        {demande.codeReference}
                      </div>
                    </td>

                    {/* Demandeur */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          {demande.demandeur.prenom[0]}{demande.demandeur.nom[0]}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 m-0 leading-tight">
                            {demande.demandeur.prenom} {demande.demandeur.nom}
                          </p>
                          <p className="text-[10px] text-slate-500 m-0">
                            {demande.demandeur.service} ({demande.demandeur.matricule})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type & Motif */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 m-0">
                        {demande.libelleType}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[220px] m-0">
                        {demande.motif}
                      </p>
                    </td>

                    {/* Période & Durée */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        Du {new Date(demande.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} au{" "}
                        {new Date(demande.dateFin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </div>
                      <span className="text-[10px] font-black text-[#F0822A] uppercase">
                        {demande.nombreJoursOuvres} jour(s) ouvré(s)
                      </span>
                    </td>

                    {/* Étape */}
                    <td className="py-3.5 px-4 text-[11px]">
                      <span className="font-bold text-slate-700">
                        {demande.statut === "ARCHIVEE" ? "Archivé GED" : demande.etapeCourante}
                      </span>
                      {demande.cycleRetoursCount > 0 && (
                        <p className="text-[9px] font-extrabold text-red-600 m-0">
                          Cycle retour: {demande.cycleRetoursCount}/2
                        </p>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="py-3.5 px-4">
                      {getStatutBadge(demande.statut)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Bouton Action Rapide si le rôle actif peut agir */}
                        {canAct && (
                          <button
                            onClick={() => onValidateDirect(demande)}
                            className="bg-[#F0822A] hover:bg-[#D96F1D] text-white font-extrabold text-[11px] px-3 py-1 cursor-pointer shadow-xs transition-colors"
                          >
                            {currentPersona.role === "AGENT_DRH" ? "Éditer PDF" : "Examiner & Valider"}
                          </button>
                        )}

                        {/* Bouton PDF si disponible */}
                        {demande.documentPermission && (
                          <button
                            onClick={() => onOpenPermission(demande)}
                            className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-extrabold text-[11px] px-2.5 py-1 cursor-pointer transition-colors"
                            title="Consulter la permission officielle"
                          >
                            PDF
                          </button>
                        )}

                        {/* Bouton Détail */}
                        <button
                          onClick={() => onSelectDemande(demande)}
                          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-[11px] px-2.5 py-1 cursor-pointer transition-colors"
                        >
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

