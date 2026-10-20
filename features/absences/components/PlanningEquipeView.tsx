// ============================================================
// features/absences/components/PlanningEquipeView.tsx
// Calendrier et planning d'équipe avec calcul du quorum de présence (RG-04)
// Design Agilly (Bords stricts, repères temporels clairs)
// ============================================================

"use client";

import { useState } from "react";

interface CollaborateurPlanning {
  id: string;
  nom: string;
  poste: string;
  service: string;
  jours: { [jour: number]: "PRESENT" | "CONGE" | "MISSION" | "MALADIE" | "WEEKEND" };
}

const MOCK_TEAM_PLANNING: CollaborateurPlanning[] = [
  {
    id: "collab-1",
    nom: "Ebenezer Samuel KOUAME",
    poste: "Développeur",
    service: "DSI Applicatif",
    jours: { 1: "PRESENT", 2: "PRESENT", 3: "CONGE", 4: "CONGE", 5: "CONGE", 6: "CONGE", 7: "WEEKEND", 8: "WEEKEND", 9: "PRESENT", 10: "PRESENT" },
  },
  {
    id: "collab-2",
    nom: "Ange-Patrick YAO",
    poste: "Consultant ERP",
    service: "Projets Clients",
    jours: { 1: "PRESENT", 2: "PRESENT", 3: "PRESENT", 4: "PRESENT", 5: "PRESENT", 6: "PRESENT", 7: "WEEKEND", 8: "WEEKEND", 9: "PRESENT", 10: "MISSION" },
  },
  {
    id: "collab-3",
    nom: "Estelle KOFFI",
    poste: "Dir. Clientèle",
    service: "Commercial",
    jours: { 1: "PRESENT", 2: "PRESENT", 3: "PRESENT", 4: "PRESENT", 5: "PRESENT", 6: "PRESENT", 7: "WEEKEND", 8: "WEEKEND", 9: "PRESENT", 10: "PRESENT" },
  },
  {
    id: "collab-4",
    nom: "Bakary CISSE",
    poste: "Lead Dev",
    service: "DSI Applicatif",
    jours: { 1: "PRESENT", 2: "PRESENT", 3: "PRESENT", 4: "PRESENT", 5: "PRESENT", 6: "PRESENT", 7: "WEEKEND", 8: "WEEKEND", 9: "PRESENT", 10: "PRESENT" },
  },
  {
    id: "collab-5",
    nom: "Aïcha DIARRA",
    poste: "Agent DRH",
    service: "Ressources Humaines",
    jours: { 1: "PRESENT", 2: "PRESENT", 3: "PRESENT", 4: "MALADIE", 5: "MALADIE", 6: "PRESENT", 7: "WEEKEND", 8: "WEEKEND", 9: "PRESENT", 10: "PRESENT" },
  },
];

export function PlanningEquipeView() {
  const [selectedService, setSelectedService] = useState("TOUS");
  const daysInView = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  const filteredTeam = selectedService === "TOUS" 
    ? MOCK_TEAM_PLANNING 
    : MOCK_TEAM_PLANNING.filter((c) => c.service === selectedService);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "CONGE":
        return <span className="bg-blue-600 text-white font-extrabold text-[9px] px-1 py-0.5 w-full block text-center">CONGÉ</span>;
      case "MISSION":
        return <span className="bg-purple-600 text-white font-extrabold text-[9px] px-1 py-0.5 w-full block text-center">MISSION</span>;
      case "MALADIE":
        return <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1 py-0.5 w-full block text-center">MALADIE</span>;
      case "WEEKEND":
        return <span className="bg-slate-200 text-slate-400 font-bold text-[8px] w-full block text-center">WE</span>;
      default:
        return <span className="text-slate-300 text-center block text-xs">•</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 shadow-xs select-none">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 mb-5 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F0822A]">
            PLANNING DES ABSENCES & CONTINUITÉ DE SERVICE (RG-04)
          </span>
          <h2 className="text-base font-black text-slate-900 m-0 tracking-tight">
            Calendrier Mensuel de Présence — Novembre 2026
          </h2>
        </div>

        {/* FILTRE SERVICE & LÉGENDE */}
        <div className="flex items-center gap-3">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-bold py-1.5 px-3 outline-none"
          >
            <option value="TOUS">Tous les services</option>
            <option value="Infrastructure">Infrastructure IT</option>
            <option value="Projets Clients">Projets Clients</option>
            <option value="Commercial">Commercial</option>
            <option value="DSI Applicatif">DSI Applicatif</option>
            <option value="Ressources Humaines">Ressources Humaines</option>
          </select>
        </div>
      </div>

      {/* LÉGENDE RAPIDE */}
      <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mb-4 bg-slate-50 p-2.5 border border-slate-200">
        <span className="text-slate-400 font-bold text-[10px] uppercase">Légende :</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 inline-block"/> Congé Payé</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-600 inline-block"/> Mission Extérieure</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-600 inline-block"/> Repos Maladie</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-200 inline-block"/> Week-end</span>
      </div>

      {/* TABLEAU CALENDRIER */}
      <div className="overflow-x-auto border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3 text-left w-48 border-r border-slate-200">Collaborateur</th>
              {daysInView.map((d) => (
                <th key={d} className="py-2.5 px-1 text-center w-10 border-r border-slate-200">
                  {d}
                  <span className="block text-[8px] font-normal text-slate-400">
                    {[7, 8, 14, 15].includes(d) ? "WE" : "J"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTeam.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                  <p className="m-0 leading-tight">{c.nom}</p>
                  <p className="text-[10px] text-slate-400 font-normal m-0">{c.poste} — {c.service}</p>
                </td>
                {daysInView.map((d) => (
                  <td
                    key={d}
                    className={`py-2 px-1 text-center border-r border-slate-200 ${
                      [7, 8, 14, 15].includes(d) ? "bg-slate-50" : ""
                    }`}
                  >
                    {getStatusBadge(c.jours[d])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

