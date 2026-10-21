// ============================================================
// app/absences/planning/page.tsx
// Vrai Calendrier Mensuel (Grille 7 colonnes Lun-Dim) + Vue Gantt Équipe
// Interface soft, corporate, épurée avec jours fériés et filtrage par nature
// ============================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

// Jours fériés officiels
const JOURS_FERIES: Record<string, string> = {
  "2026-11-01": "Toussaint",
  "2026-11-15": "Journée Nationale de la Paix",
  "2026-12-25": "Noël",
  "2027-01-01": "Jour de l'An",
};

// Données d'absences complètes avec dates précises
interface AbsenceCalendarEvent {
  id: string;
  collaborateur: string;
  poste: string;
  departement: string;
  isMe?: boolean;
  typeKey: "CONGES_ANNUELS" | "PERMISSION_EXCEPTIONNELLE" | "MISSION_DEPLACEMENT" | "INTERVENTION_TERRAIN" | "CONGES_MALADIE" | "RECUPERATION";
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  motif: string;
  statut: string;
}

const CALENDAR_EVENTS: AbsenceCalendarEvent[] = [
  {
    id: "evt-1",
    collaborateur: "KOUAME Ebenezer Samuel",
    poste: "Directeur des Systèmes d'Information",
    departement: "DSI",
    isMe: true,
    typeKey: "CONGES_ANNUELS",
    startDate: "2026-11-03",
    endDate: "2026-11-06",
    motif: "Congé de détente annuel (Cluster Datacenter)",
    statut: "En cours de validation",
  },
  {
    id: "evt-2",
    collaborateur: "KONE Aminata",
    poste: "Analyste Fonctionnelle Applicatif",
    departement: "DSI",
    typeKey: "PERMISSION_EXCEPTIONNELLE",
    startDate: "2026-11-12",
    endDate: "2026-11-13",
    motif: "Événement familial",
    statut: "Approuvée",
  },
  {
    id: "evt-3",
    collaborateur: "DIABATE Ousmane",
    poste: "Ingénieur Systèmes & Cloud",
    departement: "DSI",
    typeKey: "MISSION_DEPLACEMENT",
    startDate: "2026-11-09",
    endDate: "2026-11-11",
    motif: "Mission technique San Pedro",
    statut: "Approuvée",
  },
  {
    id: "evt-4",
    collaborateur: "YAO Kouassi Jean",
    poste: "Développeur Fullstack",
    departement: "DSI",
    typeKey: "INTERVENTION_TERRAIN",
    startDate: "2026-11-17",
    endDate: "2026-11-18",
    motif: "Intervention Datacenter client",
    statut: "Approuvée",
  },
  {
    id: "evt-5",
    collaborateur: "TRAORE Fanta",
    poste: "Administratrice Bases de Données",
    departement: "DSI",
    typeKey: "CONGES_MALADIE",
    startDate: "2026-11-16",
    endDate: "2026-11-18",
    motif: "Arrêt maladie justifié",
    statut: "Approuvée",
  },
  {
    id: "evt-6",
    collaborateur: "CISSE Ibrahim",
    poste: "Technicien Réseaux & Support",
    departement: "DSI",
    typeKey: "RECUPERATION",
    startDate: "2026-11-04",
    endDate: "2026-11-05",
    motif: "Récupération astreinte week-end",
    statut: "Approuvée",
  },
  {
    id: "evt-7",
    collaborateur: "TOURE Marie-Claire",
    poste: "Directrice Ressources Humaines",
    departement: "DRH",
    typeKey: "CONGES_ANNUELS",
    startDate: "2026-11-23",
    endDate: "2026-11-27",
    motif: "Congé annuel RH",
    statut: "Approuvée",
  },
];

const COULEURS_NATURE: Record<string, { label: string; badge: string; dot: string; text: string; bgSoft: string }> = {
  CONGES_ANNUELS: {
    label: "Congé Annuel",
    badge: "bg-blue-600 text-white",
    dot: "bg-blue-600",
    text: "text-blue-700",
    bgSoft: "bg-blue-50 border-blue-200 text-blue-900",
  },
  PERMISSION_EXCEPTIONNELLE: {
    label: "Permission",
    badge: "bg-[#D96F1D] text-white",
    dot: "bg-[#D96F1D]",
    text: "text-[#B95914]",
    bgSoft: "bg-orange-50 border-orange-200 text-orange-950",
  },
  MISSION_DEPLACEMENT: {
    label: "Mission",
    badge: "bg-purple-600 text-white",
    dot: "bg-purple-600",
    text: "text-purple-700",
    bgSoft: "bg-purple-50 border-purple-200 text-purple-950",
  },
  INTERVENTION_TERRAIN: {
    label: "Intervention",
    badge: "bg-amber-600 text-white",
    dot: "bg-amber-600",
    text: "text-amber-800",
    bgSoft: "bg-amber-50 border-amber-200 text-amber-950",
  },
  CONGES_MALADIE: {
    label: "Maladie",
    badge: "bg-emerald-600 text-white",
    dot: "bg-emerald-600",
    text: "text-emerald-700",
    bgSoft: "bg-emerald-50 border-emerald-200 text-emerald-950",
  },
  RECUPERATION: {
    label: "Récupération",
    badge: "bg-slate-700 text-white",
    dot: "bg-slate-700",
    text: "text-slate-800",
    bgSoft: "bg-slate-100 border-slate-300 text-slate-900",
  },
};

const MOIS_NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const JOURS_SEMAINE = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function CalendarPlanningPage() {
  const { currentPersona } = useAbsences();

  // Navigation dans le temps (Par défaut : Novembre 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 = Novembre (0-indexé)
  const [selectedNature, setSelectedNature] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"MONTH" | "TIMELINE">("MONTH");
  const [activeDayDetail, setActiveDayDetail] = useState<{ dateStr: string; events: AbsenceCalendarEvent[]; ferie?: string } | null>(null);

  // Navigation mois
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10);
  };

  // Construction de la grille mensuelle (7 colonnes x N semaines)
  // Mois : currentYear, currentMonth
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Jour de la semaine du 1er du mois (0 = Dimanche, 1 = Lundi, etc.)
  // On décale pour que Lundi = 0, Dimanche = 6
  let firstDayWeekIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayWeekIndex === -1) firstDayWeekIndex = 6;

  // Jours du mois précédent pour combler
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthDays = [];
  for (let i = firstDayWeekIndex - 1; i >= 0; i--) {
    prevMonthDays.push({
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      dateStr: `${currentMonth === 0 ? currentYear - 1 : currentYear}-${String(currentMonth === 0 ? 12 : currentMonth).padStart(2, "0")}-${String(prevMonthLastDay - i).padStart(2, "0")}`,
    });
  }

  // Jours du mois en cours
  const currentMonthDays = [];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    currentMonthDays.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateStr: dayStr,
      isWeekend: new Date(currentYear, currentMonth, d).getDay() === 0 || new Date(currentYear, currentMonth, d).getDay() === 6,
      ferie: JOURS_FERIES[dayStr] || null,
    });
  }

  // Jours du mois suivant pour finir la grille (multiple de 7)
  const remainingCells = 35 - (prevMonthDays.length + currentMonthDays.length);
  const totalGridCells = remainingCells >= 0 ? 35 : 42;
  const nextMonthDaysCount = totalGridCells - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    nextMonthDays.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateStr: `${currentMonth === 11 ? currentYear + 1 : currentYear}-${String(currentMonth === 11 ? 1 : currentMonth + 2).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  const allCalendarCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Helper pour vérifier si un événement couvre une date donnée (YYYY-MM-DD)
  const getEventsForDate = (dateStr: string) => {
    return CALENDAR_EVENTS.filter((evt) => {
      if (selectedNature !== "ALL" && evt.typeKey !== selectedNature) return false;
      return dateStr >= evt.startDate && dateStr <= evt.endDate;
    });
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* ── 1. EN-TÊTE ÉPURÉ DE L'AGENDA ── */}
      <div className="bg-white border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D96F1D]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Agenda des Absences & Présences
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez les congés, départs en mission et permanences de toute l&apos;équipe sur un véritable calendrier.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Bascule Calendrier / Vue Liste */}
          <div className="flex items-center border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("MONTH")}
              className={`px-3 py-1 font-semibold cursor-pointer transition-colors ${
                viewMode === "MONTH" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Vue Mois
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TIMELINE")}
              className={`px-3 py-1 font-semibold cursor-pointer transition-colors ${
                viewMode === "TIMELINE" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Vue Liste
            </button>
          </div>

          <Link
            href="/absences/nouvelle"
            className="bg-[#D96F1D] hover:bg-[#B95914] text-white text-xs font-semibold px-3 py-1.5 transition-colors"
          >
            + Poser une absence
          </Link>
        </div>
      </div>

      {/* ── 2. BARRE D'ACTION CALENDRIER (NAVIGATION MOIS + FILTRE NATURE) ── */}
      <div className="bg-white border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Navigation mois/année */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Mois précédent"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 border-x border-slate-200 transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Mois suivant"
            >
              &rarr;
            </button>
          </div>

          <span className="text-sm font-bold text-slate-900 ml-1">
            {MOIS_NOMS[currentMonth]} {currentYear}
          </span>
        </div>

        {/* Filtre par nature d'absence */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Filtrer par nature :</span>
          <select
            value={selectedNature}
            onChange={(e) => setSelectedNature(e.target.value)}
            className="bg-slate-50 border border-slate-300 font-bold text-slate-800 px-2 py-1 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les absences ({CALENDAR_EVENTS.length})</option>
            <option value="CONGES_ANNUELS">🌴 Congés Annuels</option>
            <option value="PERMISSION_EXCEPTIONNELLE">✉️ Permissions Exceptionnelles</option>
            <option value="MISSION_DEPLACEMENT">✈️ Missions & Déplacements</option>
            <option value="INTERVENTION_TERRAIN">🔧 Interventions Terrain</option>
            <option value="CONGES_MALADIE">🩺 Repos Maladie</option>
            <option value="RECUPERATION">⏱️ Récupérations</option>
          </select>
        </div>
      </div>

      {/* ── 3. VRAI CALENDRIER MENSUEL (7 COLONNES : LUN À DIM) ── */}
      {viewMode === "MONTH" && (
        <div className="bg-white border border-slate-200 overflow-hidden shadow-2xs">
          {/* Ligne des jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-2">
            {JOURS_SEMAINE.map((jour, i) => (
              <div key={jour} className={i >= 5 ? "text-slate-400" : ""}>
                {jour}
              </div>
            ))}
          </div>

          {/* Grille des cellules du mois */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs">
            {allCalendarCells.map((cell, index) => {
              const events = getEventsForDate(cell.dateStr);
              const isToday = cell.dateStr === "2026-11-04"; // Repère temporel actuel de la démo
              const isFerie = JOURS_FERIES[cell.dateStr];

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (events.length > 0 || isFerie) {
                      setActiveDayDetail({
                        dateStr: cell.dateStr,
                        events,
                        ferie: isFerie,
                      });
                    }
                  }}
                  className={`min-h-[96px] p-1.5 flex flex-col justify-between transition-colors relative ${
                    !cell.isCurrentMonth
                      ? "bg-slate-50/50 text-slate-300 cursor-default"
                      : cell.isWeekend
                      ? "bg-slate-50/70"
                      : "bg-white hover:bg-slate-50/80 cursor-pointer"
                  } ${isToday ? "ring-2 ring-[#D96F1D] ring-inset" : ""}`}
                >
                  {/* Numéro du jour & indicateur jour férié */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block font-mono text-[11px] font-bold px-1 ${
                        isToday
                          ? "bg-[#D96F1D] text-white"
                          : cell.isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {isFerie && (
                      <span
                        className="text-[9px] bg-amber-100 text-amber-800 px-1 font-bold border border-amber-300 truncate max-w-[80px]"
                        title={isFerie}
                      >
                        ★ Férié
                      </span>
                    )}
                  </div>

                  {/* Badges des absences du jour (max 2 visibles, puis +N) */}
                  <div className="flex flex-col gap-1 mt-1 my-auto">
                    {events.slice(0, 2).map((evt) => {
                      const colorCfg = COULEURS_NATURE[evt.typeKey];
                      return (
                        <div
                          key={evt.id}
                          className={`px-1.5 py-0.5 text-[10px] font-semibold border truncate flex items-center gap-1 ${colorCfg.bgSoft}`}
                          title={`${evt.collaborateur} : ${colorCfg.label} (${evt.motif})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorCfg.dot}`} />
                          <span className="truncate">
                            {evt.isMe ? "Moi" : evt.collaborateur.split(" ")[0]} · {colorCfg.label}
                          </span>
                        </div>
                      );
                    })}

                    {events.length > 2 && (
                      <span className="text-[9px] text-slate-500 font-bold pl-1">
                        +{events.length - 2} autre(s)
                      </span>
                    )}
                  </div>

                  {/* Bas de cellule : espace respirable */}
                  <div />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. VUE LISTE COMPLÈTE & SOFT DES ABSENCES DU MOIS ── */}
      {viewMode === "TIMELINE" && (
        <div className="bg-white border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Absences déclarées en {MOIS_NOMS[currentMonth]} {currentYear} ({CALENDAR_EVENTS.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {CALENDAR_EVENTS.map((evt) => {
              const colorCfg = COULEURS_NATURE[evt.typeKey];
              return (
                <div
                  key={evt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-2.5 h-2.5 mt-1 rounded-full shrink-0 ${colorCfg.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{evt.collaborateur}</span>
                        {evt.isMe && (
                          <span className="text-[9px] bg-orange-100 text-[#B95914] px-1 font-bold">Moi</span>
                        )}
                        <span className="text-slate-400 text-[11px]">({evt.poste})</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-0.5">
                        <strong className={colorCfg.text}>{colorCfg.label}</strong> · Du {evt.startDate} au {evt.endDate}
                      </p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        &ldquo;{evt.motif}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                      {evt.statut}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. LÉGENDE FIXE ET CLAIRE DES COULEURS ── */}
      <div className="bg-white border border-slate-200 p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Légende officielle des natures d&apos;absence
        </span>
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(COULEURS_NATURE).map(([k, cfg]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-slate-700 font-medium">{cfg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-amber-700 font-bold text-xs">★</span>
            <span className="text-amber-900 font-semibold text-[11px]">Jour Férié chômé</span>
          </div>
        </div>
      </div>

      {/* ── 6. TIROIR MODAL AU CLIC SUR UN JOUR ── */}
      {activeDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-xl max-w-md w-full p-5 text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">
                Détail du {activeDayDetail.dateStr}
              </span>
              <button
                type="button"
                onClick={() => setActiveDayDetail(null)}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {activeDayDetail.ferie && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                <span className="font-bold text-amber-700">★ Jour Férié Officiel :</span>
                <span>{activeDayDetail.ferie}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {activeDayDetail.events.length === 0 ? (
                <p className="text-slate-500 py-3 text-center">Aucune absence pour ce jour.</p>
              ) : (
                activeDayDetail.events.map((evt) => {
                  const cfg = COULEURS_NATURE[evt.typeKey];
                  return (
                    <div key={evt.id} className={`p-3 border flex flex-col gap-1 ${cfg.bgSoft}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{evt.collaborateur}</span>
                        <span className="text-[10px] font-bold uppercase">{cfg.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-600">{evt.poste}</span>
                      <p className="text-[11px] italic mt-1">&ldquo;{evt.motif}&rdquo;</p>
                      <span className="text-[10px] font-semibold text-slate-500 mt-1">
                        Période : Du {evt.startDate} au {evt.endDate} · Statut : {evt.statut}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveDayDetail(null)}
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
