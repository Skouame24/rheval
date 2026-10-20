// ============================================================
// features/absences/components/DemandesListTable.tsx
// Tableau moderne et fluide des demandes RH — Clean Design
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { DemandeRHItem, StatutDemandeRH } from "@/types/absences.types";
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

  const canPersonaAct = (demande: DemandeRHItem): boolean => {
    if (currentPersona.role === "SUPERIEUR_N1" && demande.statut === "EN_VALIDATION_N1") return true;
    if (currentPersona.role === "DRH" && demande.statut === "EN_VALIDATION_DRH") return true;
    if (currentPersona.role === "DIRECTION_DG" && demande.statut === "EN_VALIDATION_DG") return true;
    if (currentPersona.role === "AGENT_DRH" && demande.statut === "APPROUVEE") return true;
    return false;
  };

  const filteredDemandes = useMemo(() => {
    return demandes.filter((d) => {
      if (activeTab === "A_VALIDER" && !canPersonaAct(d)) return false;
      if (activeTab === "MES_DEMANDES" && d.demandeur.id !== currentPersona.id) return false;
      if (activeTab === "APPROUVEES" && !["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)) return false;
      if (activeTab === "RETOURS" && d.statut !== "RETOURNEE_EMPLOYE") return false;

      if (filterType !== "ALL" && d.typeDemande !== filterType) return false;

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
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EA580C] border border-orange-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Supérieur N+1
          </span>
        );
      case "EN_VALIDATION_DRH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Contrôle DRH
          </span>
        );
      case "EN_VALIDATION_DG":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Direction Générale
          </span>
        );
      case "APPROUVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approuvée (À éditer)
          </span>
        );
      case "PERMISSION_EDITEE":
      case "ARCHIVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Archivée GED
          </span>
        );
      case "RETOURNEE_EMPLOYE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Retournée (Non OK)
          </span>
        );
      case "BROUILLON":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Brouillon
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {statut}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs font-sans overflow-hidden">
      
      {/* ── BARRE D'ONGLETS ET FILTRES DOUCE ── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-slate-50/40">
        
        {/* Onglets Pilules Douces */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "TOUTES", label: "Toutes", count: demandes.length },
            {
              id: "A_VALIDER",
              label: "À valider",
              count: demandes.filter(canPersonaAct).length,
              urgent: demandes.filter(canPersonaAct).length > 0,
            },
            {
              id: "MES_DEMANDES",
              label: "Mes demandes",
              count: demandes.filter((d) => d.demandeur.id === currentPersona.id).length,
            },
            {
              id: "APPROUVEES",
              label: "Validées",
              count: demandes.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)).length,
            },
            {
              id: "RETOURS",
              label: "Retours",
              count: demandes.filter((d) => d.statut === "RETOURNEE_EMPLOYE").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  tab.urgent
                    ? "bg-amber-100 text-amber-800"
                    : activeTab === tab.id
                    ? "bg-slate-100 text-slate-700"
                    : "bg-slate-200/70 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Barre de Recherche et Type */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-8 pr-3 outline-none w-44 sm:w-56 focus:border-[#F0822A] focus:ring-2 focus:ring-orange-100/80 transition-all"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs font-medium py-1.5 px-2.5 outline-none cursor-pointer focus:border-[#F0822A] transition-all text-slate-700"
          >
            <option value="ALL">Tous les types</option>
            <option value="CONGES_ANNUELS">Congés Annuels</option>
            <option value="PERMISSION_EXCEPTIONNELLE">Permission Exceptionnelle</option>
            <option value="CONGES_MALADIE">Congés Maladie</option>
            <option value="RECUPERATION">Récupération</option>
            <option value="MISSION_DEPLACEMENT">Mission / Déplacement</option>
            <option value="INTERVENTION_TERRAIN">Intervention Terrain</option>
            <option value="ABSENCE_NON_PAYEE">Absence autorisée non payée</option>
          </select>
        </div>

      </div>

      {/* ── TABLEAU DES DEMANDES RESPIRANT ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-5 font-semibold">Référence</th>
              <th className="py-3.5 px-4 font-semibold">Demandeur</th>
              <th className="py-3.5 px-4 font-semibold">Nature</th>
              <th className="py-3.5 px-4 font-semibold">Période & Durée</th>
              <th className="py-3.5 px-4 font-semibold">Statut</th>
              <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDemandes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  Aucune demande ne correspond à ces critères.
                </td>
              </tr>
            ) : (
              filteredDemandes.map((demande) => {
                const canAct = canPersonaAct(demande);

                return (
                  <tr
                    key={demande.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      canAct ? "bg-orange-50/20" : ""
                    }`}
                  >
                    {/* Référence */}
                    <td className="py-4 px-5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {canAct && <span className="w-1.5 h-1.5 rounded-full bg-[#F0822A]" />}
                        <span>{demande.codeReference}</span>
                      </div>
                    </td>

                    {/* Demandeur */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                          {demande.demandeur.prenom[0]}{demande.demandeur.nom[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 m-0 leading-tight">
                            {demande.demandeur.prenom} {demande.demandeur.nom}
                          </p>
                          <p className="text-[11px] text-slate-400 m-0">
                            {demande.demandeur.service}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Nature & Motif */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800 m-0">
                        {demande.libelleType}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px] m-0 font-normal">
                        {demande.motif}
                      </p>
                    </td>

                    {/* Période & Durée */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">
                        {new Date(demande.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} —{" "}
                        {new Date(demande.dateFin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </div>
                      <span className="text-[11px] font-semibold text-[#EA580C]">
                        {demande.nombreJoursOuvres} jour(s)
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="py-4 px-4">
                      {getStatutBadge(demande.statut)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canAct && (
                          <button
                            onClick={() => onValidateDirect(demande)}
                            className="bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer shadow-xs transition-colors"
                          >
                            {currentPersona.role === "AGENT_DRH" ? "Éditer PDF" : "Examiner"}
                          </button>
                        )}

                        {demande.documentPermission && (
                          <button
                            onClick={() => onOpenPermission(demande)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors border border-blue-200/70"
                          >
                            PDF
                          </button>
                        )}

                        <button
                          onClick={() => onSelectDemande(demande)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
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
