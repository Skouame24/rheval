// ============================================================
// features/absences/components/PlanningEquipeView.tsx
// Planning d'équipe moderne et serein — Clean Design
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
        return <span className="bg-blue-100 text-blue-700 font-semibold text-[10px] px-1 py-0.5 rounded block text-center">Congé</span>;
      case "MISSION":
        return <span className="bg-purple-100 text-purple-700 font-semibold text-[10px] px-1 py-0.5 rounded block text-center">Mission</span>;
      case "MALADIE":
        return <span className="bg-emerald-100 text-emerald-700 font-semibold text-[10px] px-1 py-0.5 rounded block text-center">Maladie</span>;
      case "WEEKEND":
        return <span className="text-slate-300 font-normal text-[9px] block text-center">WE</span>;
      default:
        return <span className="text-slate-200 block text-center">•</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs font-sans">
      
      {/* EN-TÊTE ÉPURÉ */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 m-0">
            Calendrier des présences de l'équipe
          </h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Planning mensuel et visualisation des départs validés
          </p>
        </div>

        {/* FILTRE SERVICE */}
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg text-xs font-medium py-1.5 px-3 outline-none cursor-pointer focus:border-[#F0822A]"
        >
          <option value="TOUS">Tous les services</option>
          <option value="Infrastructure">Infrastructure IT</option>
          <option value="Projets Clients">Projets Clients</option>
          <option value="Commercial">Commercial</option>
          <option value="DSI Applicatif">DSI Applicatif</option>
          <option value="Ressources Humaines">Ressources Humaines</option>
        </select>
      </div>

      {/* LÉGENDE DOUCE */}
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
        <span className="text-slate-400 font-normal">Légende :</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Congé payé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Mission
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Maladie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Week-end
        </span>
      </div>

      {/* TABLEAU CALENDRIER */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4 text-left w-52 border-r border-slate-100">Collaborateur</th>
              {daysInView.map((d) => (
                <th key={d} className="py-2.5 px-1 text-center w-10 border-r border-slate-100 font-medium">
                  {d}
                  <span className="block text-[9px] font-normal text-slate-400">
                    {[7, 8, 14, 15].includes(d) ? "WE" : "J"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTeam.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-100">
                  <p className="m-0 leading-tight">{c.nom}</p>
                  <p className="text-[11px] text-slate-400 font-normal m-0">{c.service}</p>
                </td>
                {daysInView.map((d) => (
                  <td
                    key={d}
                    className={`py-2 px-1 text-center border-r border-slate-100 ${
                      [7, 8, 14, 15].includes(d) ? "bg-slate-50/50" : ""
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
