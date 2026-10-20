// ============================================================
// app/absences/planning/page.tsx
// Agenda Universel & Synthèse des Congés, Permissions & Jours Fériés
// Design épuré, soft, corporate IBM Carbon x Agilly
// Respecte les exigences :
//  - Vue globale calendrier équipe avec color-coding par nature
//  - Jours fériés officiels mis en évidence (bandeau strié / badge ambre doux)
//  - Synthèse personnelle de l'agent connecté : historique des congés passés, en cours et à venir
//  - Décompte des jours fériés légaux et impact sur les congés
// ============================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

// Jours fériés officiels (Côte d'Ivoire / Corporate)
const JOURS_FERIES_2026: Record<number, { nom: string; date: string; paye: boolean }> = {
  1: { nom: "Toussaint", date: "Dimanche 1 Nov", paye: true },
  15: { nom: "Journée Nationale de la Paix", date: "Dimanche 15 Nov", paye: true },
};

// Historique récapitulatif des congés et permissions passés pour le salarié
const HISTORIQUE_CONGES_SALARIE = [
  {
    id: "hist-01",
    type: "Congés Annuels",
    codeType: "CONGES_ANNUELS",
    periode: "Du 12 Août au 28 Août 2026",
    jours: 14,
    statut: "Consommé",
    bulletinNum: "PERM-2026-08-041",
    motif: "Congé principal d'été",
  },
  {
    id: "hist-02",
    type: "Permission Exceptionnelle",
    codeType: "PERMISSION_EXCEPTIONNELLE",
    periode: "Du 10 Juin au 11 Juin 2026",
    jours: 2,
    statut: "Consommé",
    bulletinNum: "PERM-2026-06-018",
    motif: "Mariage familial au village",
  },
  {
    id: "hist-03",
    type: "Mission / Déplacement",
    codeType: "MISSION_DEPLACEMENT",
    periode: "Du 14 Avril au 17 Avril 2026",
    jours: 4,
    statut: "Effectué",
    bulletinNum: "MISS-2026-04-009",
    motif: "Audit d'infrastructure télécom Yamoussoukro",
  },
  {
    id: "hist-04",
    type: "Congé Maladie",
    codeType: "CONGES_MALADIE",
    periode: "Du 19 Février au 20 Février 2026",
    jours: 2,
    statut: "Justifié",
    bulletinNum: "PERM-2026-02-005",
    motif: "Syndrome grippal (certificat transmis)",
  },
];

// Collaborateurs affichés dans l'agenda
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

// Codes couleur par nature d'absence
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
  const ferie = JOURS_FERIES_2026[dayNum] || null;
  return {
    dayNum,
    dayName,
    isWeekend,
    ferie,
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
  const [vueActive, setVueActive] = useState<"PLANNING_EQUIPE" | "HISTORIQUE_PERSO">("PLANNING_EQUIPE");
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
      {/* ── EN-TÊTE DE L'AGENDA & ONGLET VUES ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Agenda des Absences, Congés & Jours Fériés
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultez les disponibilités de l&apos;équipe, les jours fériés légaux et le récapitulatif de vos congés passés.
          </p>
        </div>

        {/* Boutons d'onglets soft & corporate */}
        <div className="flex items-center gap-2 border border-slate-200 p-1 bg-slate-50">
          <button
            type="button"
            onClick={() => setVueActive("PLANNING_EQUIPE")}
            className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
              vueActive === "PLANNING_EQUIPE"
                ? "bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Planning Équipe & Fériés
          </button>
          <button
            type="button"
            onClick={() => setVueActive("HISTORIQUE_PERSO")}
            className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
              vueActive === "HISTORIQUE_PERSO"
                ? "bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Mes Congés Passés ({HISTORIQUE_CONGES_SALARIE.length})
          </button>
        </div>
      </div>

      {/* ── BANDEAU SYNTHÈSE JOURS FÉRIÉS DU MOIS (OFFICIEL & CLAIR) ── */}
      <div className="bg-amber-50/70 border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
            ★
          </div>
          <div>
            <span className="font-bold text-amber-950 block">Jours Fériés Chômés & Payés — Novembre 2026</span>
            <span className="text-amber-800 text-[11px]">
              Ces jours sont automatiquement exclus du décompte des congés annuels légaux.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-amber-200 px-2.5 py-1 text-slate-800">
            <strong className="text-amber-700">Dim. 01 Nov :</strong> Toussaint
          </div>
          <div className="bg-white border border-amber-200 px-2.5 py-1 text-slate-800">
            <strong className="text-amber-700">Dim. 15 Nov :</strong> Fête Nationale de la Paix
          </div>
        </div>
      </div>

      {/* ── CONDITION VUE 1 : PLANNING ÉQUIPE ── */}
      {vueActive === "PLANNING_EQUIPE" && (
        <>
          {/* Barre d'outils filtre et légende */}
          <div className="bg-white border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Légende :</span>
              {Object.entries(COULEURS_NATURE).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 ${config.bg} shrink-0`} />
                  <span className="text-slate-700 text-[11px] font-medium">{config.libelle}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="w-3 h-3 bg-amber-200 border border-amber-400 shrink-0" />
                <span className="text-amber-900 text-[11px] font-semibold">Jour Férié</span>
              </div>
            </div>

            {/* Sélecteur de pôle */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Département :</span>
              <select
                value={filterDepartement}
                onChange={(e) => setFilterDepartement(e.target.value)}
                className="bg-slate-50 border border-slate-300 font-bold text-slate-800 px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="TOUS">Tous les pôles ({TEAM_MEMBERS.length} collaborateurs)</option>
                <option value="DSI">Pôle DSI (Systèmes d&apos;Information)</option>
                <option value="DRH">Direction Ressources Humaines</option>
                <option value="Direction">Direction Générale</option>
              </select>
            </div>
          </div>

          {/* Grille calendrier corporate */}
          <div className="bg-white border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 px-4 w-60 border-r border-slate-200 bg-slate-50/80">
                      Collaborateur ({filteredMembers.length})
                    </th>
                    {DAYS_OF_MONTH.map((d) => (
                      <th
                        key={d.dayNum}
                        className={`py-2 px-1 text-center font-mono border-r border-slate-100 min-w-[34px] ${
                          d.ferie
                            ? "bg-amber-100/70 text-amber-900"
                            : d.isWeekend
                            ? "bg-slate-100 text-slate-400"
                            : "bg-white text-slate-700"
                        }`}
                        title={d.ferie ? `${d.ferie.nom} (Jour Férié)` : undefined}
                      >
                        <div className="text-[9px]">{d.dayName}</div>
                        <div className="font-bold text-xs">{d.dayNum}</div>
                        {d.ferie && <span className="block text-[8px] text-amber-700 font-bold leading-none">★</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMembers.map((member) => {
                    const events = CALENDAR_EVENTS[member.id] || [];
                    const isMoi = member.nom.includes("KOUAME Ebenezer");
                    return (
                      <tr key={member.id} className={isMoi ? "bg-orange-50/30 hover:bg-orange-50/50" : "hover:bg-slate-50/50"}>
                        {/* Colonne collaborateur */}
                        <td className="py-2.5 px-4 border-r border-slate-200 bg-white">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs truncate">{member.nom}</span>
                            {isMoi && (
                              <span className="text-[9px] bg-orange-100 text-[#F0822A] px-1 font-bold">Moi</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{member.poste}</p>
                        </td>

                        {/* Cellules des jours */}
                        {DAYS_OF_MONTH.map((d) => {
                          const activeEvt = events.find(
                            (e) => d.dayNum >= e.start && d.dayNum <= e.end
                          );
                          const colorCfg = activeEvt ? COULEURS_NATURE[activeEvt.typeKey] : null;

                          return (
                            <td
                              key={d.dayNum}
                              className={`p-0 text-center border-r border-slate-100 relative ${
                                d.ferie
                                  ? "bg-amber-50/50"
                                  : d.isWeekend
                                  ? "bg-slate-100/40"
                                  : ""
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
                                    <span className="truncate max-w-[85px] px-1">
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
        </>
      )}

      {/* ── CONDITION VUE 2 : RÉCAPITULATIF CONGÉS PASSÉS DU SALARIÉ ── */}
      {vueActive === "HISTORIQUE_PERSO" && (
        <div className="flex flex-col gap-5">
          {/* Cartes métriques récapitulatives de consommation */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Consommé 2026</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">22 <span className="text-xs font-normal text-slate-500">jours</span></p>
              <span className="text-[11px] text-slate-500">Toutes natures confondues</span>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Congés Annuels Décomptés</span>
              <p className="text-2xl font-bold text-blue-700 mt-1">14 <span className="text-xs font-normal text-slate-500">jours</span></p>
              <span className="text-[11px] text-slate-500">Solde restant : 14.5 jours</span>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F0822A]">Permissions & Missions</span>
              <p className="text-2xl font-bold text-[#F0822A] mt-1">6 <span className="text-xs font-normal text-slate-500">jours</span></p>
              <span className="text-[11px] text-slate-500">Autorisées par la direction</span>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Repos Maladie Justifié</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">2 <span className="text-xs font-normal text-slate-500">jours</span></p>
              <span className="text-[11px] text-slate-500">Certificat médical archivé GED</span>
            </div>
          </div>

          {/* Tableau historique détaillé */}
          <div className="bg-white border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historique des congés, permissions et déplacements passés</h3>
                <p className="text-xs text-slate-500">Relevé officiel des périodes d&apos;absence déjà validées et consommées.</p>
              </div>
              <Link
                href="/absences/soldes"
                className="text-xs font-semibold text-[#F0822A] hover:underline"
              >
                Voir détails des soldes &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">N° Référence</th>
                    <th className="py-2.5 px-4">Nature</th>
                    <th className="py-2.5 px-4">Période d&apos;absence</th>
                    <th className="py-2.5 px-4 text-center">Durée</th>
                    <th className="py-2.5 px-4">Motif consigné</th>
                    <th className="py-2.5 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {HISTORIQUE_CONGES_SALARIE.map((item) => {
                    const badgeCfg = COULEURS_NATURE[item.codeType];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {item.bulletinNum}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold text-white ${badgeCfg.bg}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {item.periode}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono">
                          {item.jours} j
                        </td>
                        <td className="py-3 px-4 text-slate-600 italic">
                          &ldquo;{item.motif}&rdquo;
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-[10px]">
                            {item.statut}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AU CLIC SUR UN CRÉNEAU ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-xl max-w-md w-full p-6 text-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Détail du congé / déplacement</span>
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
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Motif consigné</span>
                <p className="p-2.5 bg-slate-50 border border-slate-200 italic text-slate-800">
                  &ldquo;{selectedEvent.motif}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Statut du circuit :</span>
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
