// ============================================================
// features/absences/components/PlanningEquipeView.tsx
// Planning d'équipe connecté aux données réelles de l'annuaire et des demandes
// Clean Light Design Agilly
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { employeesApi } from "@/lib/api/employees.api";

interface CollaborateurPlanning {
  id: string;
  nom: string;
  poste: string;
  service: string;
  jours: { [jour: number]: "PRESENT" | "CONGE" | "MISSION" | "MALADIE" | "WEEKEND" };
}

export function PlanningEquipeView() {
  const { currentPersona, demandes } = useAbsences();
  const [selectedService, setSelectedService] = useState("TOUS");
  const [teamUsers, setTeamUsers] = useState<any[]>([]);

  useEffect(() => {
    employeesApi
      .getMyTeam()
      .then((res) => {
        if (res && res.length > 0) {
          setTeamUsers(res);
        }
      })
      .catch(() => {});
  }, []);

  const daysInView = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  // Construction dynamique des collaborateurs à partir des profils réels
  const teamMembers = useMemo<CollaborateurPlanning[]>(() => {
    const list: CollaborateurPlanning[] = [];
    const seen = new Set<string>();

    // 1. Utilisateur connecté
    list.push({
      id: currentPersona.id,
      nom: `${currentPersona.prenom} ${currentPersona.nom}`,
      poste: currentPersona.poste,
      service: currentPersona.departement || currentPersona.service || "DSI",
      jours: {},
    });
    seen.add(currentPersona.id);
    if (currentPersona.email) seen.add(currentPersona.email.toLowerCase());

    // 2. Équipe réelle issue du backend NestJS
    for (const u of teamUsers) {
      if (!seen.has(u.id) && !seen.has((u.email || "").toLowerCase())) {
        list.push({
          id: u.id,
          nom: `${u.prenom || ""} ${u.nom || ""}`.trim() || u.email,
          poste: u.poste || "Collaborateur",
          service: u.departement || "DSI",
          jours: {},
        });
        seen.add(u.id);
        if (u.email) seen.add(u.email.toLowerCase());
      }
    }

    // 3. Autres demandeurs réels présents dans la base
    for (const d of demandes) {
      const dId = d.demandeur.id;
      const dEmail = (d.demandeur.email || "").toLowerCase();
      if (!seen.has(dId) && !seen.has(dEmail)) {
        list.push({
          id: dId,
          nom: `${d.demandeur.prenom} ${d.demandeur.nom}`,
          poste: d.demandeur.poste,
          service: d.demandeur.departement || d.demandeur.service || "DSI",
          jours: {},
        });
        seen.add(dId);
        if (dEmail) seen.add(dEmail);
      }
    }

    // Calcul des présences/absences sur les 15 jours
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    for (const member of list) {
      const memberDemandes = demandes.filter(
        (d) =>
          d.demandeur.id === member.id ||
          (d.demandeur.email && member.id && d.demandeur.email.toLowerCase() === member.id.toLowerCase())
      );

      for (const d of daysInView) {
        const dateObj = new Date(curYear, curMonth, d);
        const dayOfWeek = dateObj.getDay();
        const dateIso = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          member.jours[d] = "WEEKEND";
          continue;
        }

        const match = memberDemandes.find(
          (m) =>
            m.dateDebut <= dateIso &&
            m.dateFin >= dateIso &&
            ["APPROUVEE", "PERMISSION_EDITEE", "EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(m.statut)
        );

        if (match) {
          if (match.typeDemande === "CONGES_ANNUELS" || match.typeDemande === "CONGES_MATERNITE") {
            member.jours[d] = "CONGE";
          } else if (match.typeDemande === "MISSION_DEPLACEMENT" || match.typeDemande === "INTERVENTION_TERRAIN") {
            member.jours[d] = "MISSION";
          } else if (match.typeDemande === "CONGES_MALADIE") {
            member.jours[d] = "MALADIE";
          } else {
            member.jours[d] = "CONGE";
          }
        } else {
          member.jours[d] = "PRESENT";
        }
      }
    }

    return list;
  }, [currentPersona, teamUsers, demandes]);

  const filteredTeam = selectedService === "TOUS"
    ? teamMembers
    : teamMembers.filter((c) => c.service === selectedService);

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
