// ============================================================
// app/absences/planning/page.tsx
// Agenda universel des absences & présences
// Code couleur net par type de permission (Congé, Permission, Mission, Intervention)
// Vue accessible à TOUT collaborateur pour savoir qui est présent/absent
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React, { useState } from "react";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

// Équipe avec postes et départements
const TEAM_MEMBERS = [
  { id: "tm-1", nom: "KOUAME Ebenezer Samuel", poste: "Directeur des Systèmes d'Information", departement: "DSI" },
  { id: "tm-2", nom: "KOUASSI Samuel", poste: "Responsable Infrastructure & DevOps", departement: "DSI" },
  { id: "tm-3", nom: "KONE Aminata", poste: "Analyste Fonctionnelle Applicatif", departement: "DSI" },
  { id: "tm-4", nom: "DIABATE Ousmane", poste: "Ingénieur Systèmes & Cloud", departement: "DSI" },
  { id: "tm-5", nom: "YAO Kouassi Jean", poste: "Développeur Fullstack", departement: "DSI" },
  { id: "tm-6", nom: "TRAORE Fanta", poste: "Administratrice Bases de Données", departement: "DSI" },
  { id: "tm-7", nom: "CISSE Ibrahim", poste: "Technicien Réseaux & Support", departement: "DSI" },
  { id: "tm-8", nom: "TOURE Marie-Claire", poste: "Directrice des Ressources Humaines", departement: "DRH" },
  { id: "tm-9", nom: "BAMBA Christian", poste: "Président Directeur Général (Gérant)", departement: "Direction" },
];

// Légende et couleurs précises par nature de permission
const COULEURS_NATURE: Record<string, { libelle: string; bg: string; border: string; text: string }> = {
  CONGES_ANNUELS: {
    libelle: "Congés Annuels",
    bg: "bg-blue-600",
    border: "border-blue-700",
    text: "text-white",
  },
  PERMISSION_EXCEPTIONNELLE: {
    libelle: "Permission Exceptionnelle",
    bg: "bg-[#F0822A]",
    border: "border-[#D96F1D]",
    text: "text-white",
  },
  MISSION_DEPLACEMENT: {
    libelle: "Mission / Déplacement",
    bg: "bg-purple-600",
    border: "border-purple-700",
    text: "text-white",
  },
  INTERVENTION_TERRAIN: {
    libelle: "Intervention Terrain",
    bg: "bg-amber-600",
    border: "border-amber-700",
    text: "text-white",
  },
  CONGES_MALADIE: {
    libelle: "Congé Maladie",
    bg: "bg-emerald-600",
    border: "border-emerald-700",
    text: "text-white",
  },
  RECUPERATION: {
    libelle: "Récupération",
    bg: "bg-slate-700",
    border: "border-slate-800",
    text: "text-white",
  },
};

// Jours du mois de Novembre 2026 (du 1er au 21)
const DAYS_OF_MONTH = Array.from({ length: 21 }, (_, i) => {
  const dayNum = i + 1;
  const dateObj = new Date(2026, 10, dayNum);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const dayName = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][dateObj.getDay()];
  return {
    dayNum,
    dayName,
    isWeekend,
    dateStr: `2026-11-${dayNum < 10 ? "0" + dayNum : dayNum}`,
  };
});

// Événements d'absences dans l'agenda
const CALENDAR_EVENTS: Record<
  string,
  { start: number; end: number; typeKey: string; motif: string; statut: string }[]
> = {
  "tm-1": [
    { start: 3, end: 6, typeKey: "CONGES_ANNUELS", motif: "Congé annuel de détente", statut: "En validation N+1" },
  ],
  "tm-3": [
    { start: 12, end: 13, typeKey: "PERMISSION_EXCEPTIONNELLE", motif: "Événement familial", statut: "Approuvée" },
  ],
  "tm-4": [
    { start: 9, end: 11, typeKey: "MISSION_DEPLACEMENT", motif: "Mission technique San Pedro", statut: "Approuvée" },
  ],
  "tm-5": [
    { start: 17, end: 18, typeKey: "INTERVENTION_TERRAIN", motif: "Intervention Datacenter client", statut: "Approuvée" },
  ],
  "tm-6": [
    { start: 16, end: 18, typeKey: "CONGES_MALADIE", motif: "Arrêt médical", statut: "Approuvée" },
  ],
  "tm-7": [
    { start: 4, end: 5, typeKey: "RECUPERATION", motif: "Récupération astreinte weekend", statut: "Approuvée" },
  ],
};

export default function AgendaPresencesPage() {
  const { currentPersona } = useAbsences();
  const [filterDepartement, setFilterDepartement] = useState<string>("TOUS");
  const [selectedEvent, setSelectedEvent] = useState<{
    collaborateur: string;
    poste: string;
    type: string;
    dates: string;
    motif: string;
    statut: string;
  } | null>(null);

  const filteredMembers = TEAM_MEMBERS.filter((m) => {
    if (filterDepartement === "TOUS") return true;
    return m.departement === filterDepartement;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DE L'AGENDA UNIVERSEL ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Agenda des Absences & Présences de l&apos;Équipe
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultez les disponibilités de vos collègues, anticipez les chevauchements et vérifiez qui est en congé, mission ou intervention.
          </p>
        </div>

        {/* Filtre département & mois */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5">
            <span className="text-slate-400 font-medium">Département :</span>
            <select
              value={filterDepartement}
              onChange={(e) => setFilterDepartement(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TOUS">Toute l&apos;entreprise</option>
              <option value="DSI">Pôle DSI (Systèmes d&apos;Information)</option>
              <option value="DRH">Direction Ressources Humaines</option>
              <option value="Direction">Direction Générale</option>
            </select>
          </div>

          <div className="px-3 py-1.5 bg-white border border-slate-300 font-bold text-slate-800">
            Novembre 2026
          </div>
        </div>
      </div>

      {/* ── LÉGENDE DES COULEURS PAR TYPE DE PERMISSION (INGÉNIEUX & LISIBLE) ── */}
      <div className="bg-white border border-slate-200 p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Code couleur par nature d&apos;absence
        </span>
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(COULEURS_NATURE).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 ${config.bg} shadow-xs shrink-0`} />
              <span className="text-slate-700 font-medium">{config.libelle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CALENDRIER GANTT INTERACTIF DES PRÉSENCES ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-4 w-64 border-r border-slate-200 bg-slate-50/70">
                  Collaborateur ({filteredMembers.length})
                </th>
                {DAYS_OF_MONTH.map((d) => (
                  <th
                    key={d.dayNum}
                    className={`py-2 px-1 text-center font-mono border-r border-slate-100 min-w-[34px] ${
                      d.isWeekend ? "bg-slate-100 text-slate-400" : "bg-white text-slate-700"
                    }`}
                  >
                    <div>{d.dayName}</div>
                    <div className="font-bold text-slate-900">{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMembers.map((member) => {
                const events = CALENDAR_EVENTS[member.id] || [];
                return (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    {/* Colonne collaborateur */}
                    <td className="py-3 px-4 border-r border-slate-200 bg-white">
                      <p className="font-bold text-slate-900 text-xs truncate">{member.nom}</p>
                      <p className="text-[10px] text-slate-400 truncate">{member.poste}</p>
                    </td>

                    {/* Cellules des jours du calendrier */}
                    {DAYS_OF_MONTH.map((d) => {
                      const activeEvt = events.find(
                        (e) => d.dayNum >= e.start && d.dayNum <= e.end
                      );
                      const colorCfg = activeEvt ? COULEURS_NATURE[activeEvt.typeKey] : null;

                      return (
                        <td
                          key={d.dayNum}
                          className={`p-0 text-center border-r border-slate-100 relative ${
                            d.isWeekend ? "bg-slate-100/50" : ""
                          }`}
                        >
                          {activeEvt && colorCfg && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedEvent({
                                  collaborateur: member.nom,
                                  poste: member.poste,
                                  type: colorCfg.libelle,
                                  dates: `Du ${activeEvt.start} au ${activeEvt.end} Novembre 2026`,
                                  motif: activeEvt.motif,
                                  statut: activeEvt.statut,
                                })
                              }
                              className={`w-full h-7 flex items-center justify-center text-[10px] font-bold ${colorCfg.text} ${colorCfg.bg} cursor-pointer hover:opacity-90 transition-opacity`}
                              title={`${member.nom} : ${colorCfg.libelle} (${activeEvt.motif})`}
                            >
                              {d.dayNum === activeEvt.start && (
                                <span className="truncate max-w-[90px] px-1">
                                  {colorCfg.libelle.split(" ")[0]}
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TIROIR D'INFORMATION AU CLIC SUR UN ÉVÉNEMENT DU CALENDRIER ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-xl max-w-md w-full p-6 text-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Détail de l&apos;absence</span>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Collaborateur</span>
                <span className="font-bold text-slate-900 text-sm">{selectedEvent.collaborateur}</span>
                <span className="text-slate-500 text-[11px] block">{selectedEvent.poste}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Nature & Dates</span>
                <span className="font-bold text-[#F0822A]">{selectedEvent.type}</span>
                <span className="font-mono text-slate-700">{selectedEvent.dates}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Motif</span>
                <p className="p-2.5 bg-slate-50 border border-slate-200 italic text-slate-800">
                  &ldquo;{selectedEvent.motif}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Statut circuit :</span>
                <span className="font-bold text-slate-900">{selectedEvent.statut}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
