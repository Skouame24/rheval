// ============================================================
// app/absences/planning/page.tsx
// Planning d'équipe — Diagramme de Gantt & Histogramme de Quorum
// Contrôle de présence et quorum de service (RG-04)
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

// Équipe du Pôle DSI (14 collaborateurs)
const TEAM_MEMBERS = [
  { id: "tm-1", nom: "KOUAME Ebenezer Samuel", poste: "Directeur des SI", departement: "DSI" },
  { id: "tm-2", nom: "KOUASSI Samuel", poste: "Resp. Infrastructure", departement: "DSI" },
  { id: "tm-3", nom: "KONE Aminata", poste: "Analyste Fonctionnelle", departement: "DSI" },
  { id: "tm-4", nom: "DIABATE Ousmane", poste: "Ingénieur Cloud DevOps", departement: "DSI" },
  { id: "tm-5", nom: "YAO Kouassi Jean", poste: "Développeur Fullstack", departement: "DSI" },
  { id: "tm-6", nom: "TRAORE Fanta", poste: "Administratrice BDD", departement: "DSI" },
  { id: "tm-7", nom: "CISSE Ibrahim", poste: "Support & Réseau", departement: "DSI" },
];

// Jours du mois de Novembre 2026 (du 1er au 20)
const DAYS_OF_MONTH = Array.from({ length: 20 }, (_, i) => {
  const dayNum = i + 1;
  const dateObj = new Date(2026, 10, dayNum); // Novembre 2026
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const dayName = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][dateObj.getDay()];
  return {
    dayNum,
    dayName,
    isWeekend,
    dateStr: `2026-11-${dayNum < 10 ? "0" + dayNum : dayNum}`,
  };
});

// Congés posés par collaborateur pour le diagramme de Gantt
const GANTT_LEAVES: Record<
  string,
  { start: number; end: number; type: string; bg: string; statut: string }[]
> = {
  "tm-1": [
    { start: 3, end: 6, type: "Congés Annuels", bg: "bg-[#F0822A]", statut: "EN_ATTENTE" },
  ],
  "tm-3": [
    { start: 12, end: 13, type: "Permission Exceptionnelle", bg: "bg-amber-600", statut: "VALIDE" },
  ],
  "tm-4": [
    { start: 9, end: 11, type: "Mission / Déplacement", bg: "bg-purple-600", statut: "VALIDE" },
  ],
  "tm-6": [
    { start: 16, end: 18, type: "Congé Maladie", bg: "bg-emerald-600", statut: "VALIDE" },
  ],
};

export default function PlanningEquipePage() {
  const { currentPersona } = useAbsences();
  const [selectedService, setSelectedService] = useState("DSI");

  // Calcul du taux de présence quotidien pour l'histogramme de quorum
  const dailyQuorumStats = DAYS_OF_MONTH.map((d) => {
    if (d.isWeekend) return { ...d, presents: 0, total: 7, percent: 100, isUnderThreshold: false };
    // Compter combien sont absents ce jour-là
    let absentCount = 0;
    Object.values(GANTT_LEAVES).forEach((leaves) => {
      leaves.forEach((l) => {
        if (d.dayNum >= l.start && d.dayNum <= l.end) {
          absentCount++;
        }
      });
    });
    const presents = 7 - absentCount;
    const percent = Math.round((presents / 7) * 100);
    return {
      ...d,
      presents,
      total: 7,
      percent,
      isUnderThreshold: percent < 50, // Seuil légal RG-04
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DU PLANNING ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Planning d&apos;Équipe & Diagramme de Gantt
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervision des présences, chevauchements et respect de l&apos;effectif minimum de service (RG-04).
          </p>
        </div>

        {/* Filtre service & mois */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5">
            <span className="text-slate-400 font-medium">Service :</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="DSI">Pôle DSI (Systèmes d&apos;Information)</option>
              <option value="PROJET">Projets & Intégration</option>
              <option value="FINANCE">Finance & Comptabilité</option>
              <option value="RH">Ressources Humaines</option>
            </select>
          </div>

          <div className="px-3 py-1.5 bg-white border border-slate-300 font-bold text-slate-800">
            Novembre 2026
          </div>
        </div>
      </div>

      {/* ── 1. HISTOGRAMME DE PRÉSENCE QUOTIDIENNE (AVEC SEUIL QUORUM 50% RG-04) ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Taux de présence journalier (Règle RG-04 — Quorum minimum 50%)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Les barres en ambre/rouge signalent un risque de sous-effectif critique pour le service.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-600" />
              <span className="text-slate-600">&gt; 70% Présence optimale</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t border-dashed border-red-500" />
              <span className="text-red-700 font-bold">Ligne de seuil (50%)</span>
            </span>
          </div>
        </div>

        {/* Mini Barres de présence */}
        <div className="grid grid-cols-20 gap-1 items-end h-24 pt-4 border-b border-slate-200 relative">
          {/* Ligne repère 50% */}
          <div className="absolute left-0 right-0 top-12 border-b border-dashed border-red-400 pointer-events-none" />

          {dailyQuorumStats.map((item) => (
            <div key={item.dayNum} className="flex flex-col items-center gap-1 h-full justify-end group">
              {!item.isWeekend ? (
                <>
                  <span className="text-[9px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.percent}%
                  </span>
                  <div
                    className={`w-full transition-all ${
                      item.isUnderThreshold
                        ? "bg-red-500"
                        : item.percent < 70
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                    style={{ height: `${item.percent * 0.7}%` }}
                    title={`Jour ${item.dayNum} : ${item.presents}/${item.total} présents (${item.percent}%)`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-slate-100/60" title="Week-end" />
              )}
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                {item.dayNum}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. DIAGRAMME DE GANTT DES ABSENCES ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Diagramme de Gantt — Pôle DSI (Novembre 2026)
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#F0822A]" />
              Congés Annuels
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-purple-600" />
              Mission Déplacement
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-600" />
              Permission
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-4 w-60 border-r border-slate-200 bg-slate-50/50">
                  Collaborateur
                </th>
                {DAYS_OF_MONTH.map((d) => (
                  <th
                    key={d.dayNum}
                    className={`py-2 px-1 text-center font-mono border-r border-slate-100 ${
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
              {TEAM_MEMBERS.map((member) => {
                const leaves = GANTT_LEAVES[member.id] || [];
                return (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    {/* Colonne collaborateur */}
                    <td className="py-3 px-4 border-r border-slate-200 bg-white">
                      <p className="font-bold text-slate-900 text-xs truncate">{member.nom}</p>
                      <p className="text-[10px] text-slate-500 truncate">{member.poste}</p>
                    </td>

                    {/* Cellules des jours du mois */}
                    {DAYS_OF_MONTH.map((d) => {
                      // Vérifier si une absence couvre ce jour
                      const activeLeave = leaves.find(
                        (l) => d.dayNum >= l.start && d.dayNum <= l.end
                      );

                      return (
                        <td
                          key={d.dayNum}
                          className={`p-0 text-center border-r border-slate-100 relative ${
                            d.isWeekend ? "bg-slate-100/50" : ""
                          }`}
                        >
                          {activeLeave && (
                            <div
                              className={`h-6 flex items-center justify-center text-[10px] font-semibold text-white px-1 shadow-2xs ${
                                activeLeave.bg
                              } ${
                                d.dayNum === activeLeave.start ? "border-l-2 border-white" : ""
                              } ${
                                d.dayNum === activeLeave.end ? "border-r-2 border-white" : ""
                              }`}
                              title={`${activeLeave.type} (${activeLeave.statut})`}
                            >
                              {d.dayNum === activeLeave.start && (
                                <span className="truncate max-w-[80px]">
                                  {activeLeave.type.split(" ")[0]}
                                </span>
                              )}
                            </div>
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
    </div>
  );
}

