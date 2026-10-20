// ============================================================
// app/absences/rapports/page.tsx
// Rapports & Pilotage RH — Statistiques, Histogrammes & SLA (EF-30 à EF-33)
// Recharts : histogramme empilé par service, SLA par étape
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

// Données fictives consolidées par département
const STATS_PAR_DEPARTEMENT = [
  { service: "DSI", congesAnnuels: 18, missions: 6, permissions: 4, maladie: 2 },
  { service: "Projets", congesAnnuels: 22, missions: 8, permissions: 5, maladie: 3 },
  { service: "Finance", congesAnnuels: 10, missions: 2, permissions: 2, maladie: 1 },
  { service: "RH", congesAnnuels: 8, missions: 3, permissions: 3, maladie: 1 },
  { service: "Commercial", congesAnnuels: 14, missions: 12, permissions: 3, maladie: 2 },
];

// Délais moyens de traitement par étape (en heures)
const DELAIS_PAR_ETAPE = [
  { etape: "Supérieur N+1", heures: 14, cible: 24 },
  { etape: "Contrôle DRH", heures: 22, cible: 24 },
  { etape: "Direction DG", heures: 36, cible: 48 },
  { etape: "Édition GED", heures: 8, cible: 24 },
];

export default function RapportsPilotagePage() {
  const { kpis } = useAbsences();
  const [isMounted, setIsMounted] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleExport = (format: "EXCEL" | "PDF") => {
    setExportNotice(`Génération de l'export ${format} des statistiques RH 2026 en cours...`);
    setTimeout(() => {
      setExportNotice(`Export ${format} généré avec succès (Rapport_Absences_Agilly_2026.${format.toLowerCase()}).`);
      setTimeout(() => setExportNotice(null), 3500);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DE LA PAGE ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Rapports & Pilotage RH des Absences
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indicateurs clés de performance, respect des délais d&apos;arbitrage et volumétrie par département.
          </p>
        </div>

        {/* Boutons d'exportation de données (EF-33) */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleExport("EXCEL")}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport("PDF")}
            className="px-3.5 py-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Rapport PDF</span>
          </button>
        </div>
      </div>

      {/* Notification d'export */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{exportNotice}</span>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-emerald-700 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* ── 1. BANDEAU DE 4 INDICATEURS CLÉS DE PILOTAGE ── */}
      <div className="bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Demandes Traitées
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {kpis.totalDemandesMois}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1.5">dossiers</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {kpis.approuveesMois} validées définitivement
          </span>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Délai Moyen de Validation
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {kpis.delaiMoyenHeures}h
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1.5">par demande</span>
          </div>
          <span className="text-[11px] text-slate-500">Objectif SLA entreprise : &lt; 48h</span>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Taux de Refus / Retour
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {kpis.tauxRefusPourcent}%
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1.5">des dépôts</span>
          </div>
          <span className="text-[11px] text-slate-500">2 demandes réorientées ce mois</span>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Archives GED Conformes
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {kpis.archivesGedTotal}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1.5">bulletins numérotés</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">100% avec cachet eIDAS</span>
        </div>
      </div>

      {/* ── 2. GRAPHIQUES : HISTOGRAMME EMPILÉ PAR DÉPARTEMENT + SLA PAR ÉTAPE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Histogramme empilé des absences par département */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 flex flex-col justify-between">
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Volume d&apos;absences par département & nature
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cumul en jours ouvrés sur l&apos;exercice 2026
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-200">
              5 départements
            </span>
          </div>

          <div className="w-full h-72">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STATS_PAR_DEPARTEMENT} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="service" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Bar dataKey="congesAnnuels" name="Congés Annuels" fill="#2563EB" stackId="a" />
                  <Bar dataKey="missions" name="Missions" fill="#7C3AED" stackId="a" />
                  <Bar dataKey="permissions" name="Permissions" fill="#F0822A" stackId="a" />
                  <Bar dataKey="maladie" name="Maladie" fill="#059669" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Chargement du graphique...
              </div>
            )}
          </div>
        </div>

        {/* SLA & Délais de traitement par étape */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 flex flex-col justify-between">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Délai moyen de réponse par niveau (SLA)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identification des goulets d&apos;étranglement dans le circuit
            </p>
          </div>

          <div className="flex flex-col gap-4 my-auto">
            {DELAIS_PAR_ETAPE.map((item, idx) => {
              const pct = Math.min(100, Math.round((item.heures / item.cible) * 100));
              const isOver = item.heures > item.cible;
              return (
                <div key={idx} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.etape}</span>
                    <span className="font-mono text-slate-600">
                      <strong>{item.heures}h</strong> (Cible : {item.cible}h)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 border border-slate-200 flex overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-[#F0822A]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>0h</span>
                    <span>Taux de respect : {100 - (isOver ? 15 : 0)}%</span>
                    <span>Max {item.cible}h</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Circuit nominal le plus rapide :</span>
            <span className="font-mono font-bold text-emerald-700">Supérieur N+1 (14h)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

