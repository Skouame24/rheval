// ============================================================
// app/absences/soldes/page.tsx
// Soldes & Droits à Congés — Compteurs légaux et historique
// Cadre DRH certifié & Cadencement mensuel des droits
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

const MOUVEMENTS_SOLDE = [
  {
    date: "2026-10-18",
    nature: "Pose de congés annuels",
    reference: "DEM-2026-00142",
    variation: -4.0,
    soldeApres: 14.5,
    operateur: "Système (Réservation temporaire)",
  },
  {
    date: "2026-09-30",
    nature: "Acquisition mensuelle légale (2.2 j/mois)",
    reference: "PAIE-2026-09",
    variation: +2.2,
    soldeApres: 18.5,
    operateur: "Clôture Paie DRH",
  },
  {
    date: "2026-08-31",
    nature: "Acquisition mensuelle légale (2.2 j/mois)",
    reference: "PAIE-2026-08",
    variation: +2.2,
    soldeApres: 16.3,
    operateur: "Clôture Paie DRH",
  },
  {
    date: "2026-08-14",
    nature: "Congé principal d'été",
    reference: "DEM-2026-00088",
    variation: -8.0,
    soldeApres: 14.1,
    operateur: "Validation Gérant (Christian BAMBA)",
  },
  {
    date: "2026-07-31",
    nature: "Acquisition mensuelle légale (2.2 j/mois)",
    reference: "PAIE-2026-07",
    variation: +2.2,
    soldeApres: 22.1,
    operateur: "Clôture Paie DRH",
  },
];

export default function SoldesCongesPage() {
  const { currentPersona, soldeConges } = useAbsences();
  const [selectedYear, setSelectedYear] = useState(2026);

  const totalAcquis = soldeConges.joursAcquis; // 26.0
  const totalPris = soldeConges.joursPris; // 8.0
  const totalEnAttente = soldeConges.joursEnAttente; // 3.5
  const totalRestant = soldeConges.joursRestants; // 14.5

  const pctPris = (totalPris / totalAcquis) * 100;
  const pctAttente = (totalEnAttente / totalAcquis) * 100;
  const pctRestant = (totalRestant / totalAcquis) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DE LA PAGE ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Soldes & Droits à Congés Payés
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Relevé individuel des compteurs de congés, permissions exceptionnelles et récupérations.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
            Matricule : <span className="font-mono text-slate-900">{currentPersona.matricule}</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value={2026}>Exercice 2026</option>
            <option value={2025}>Exercice 2025</option>
          </select>
        </div>
      </div>

      {/* ── 1. GRAND BANDEAU : JAUGE SEGMENTÉE SUR L'ENVELOPPE ANNUELLE ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Enveloppe Annuelle Globale
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {totalRestant}
              </span>
              <span className="text-sm font-bold text-slate-500">
                jours disponibles sur {totalAcquis} j acquis
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-700" />
              <span>Consommés : {totalPris} j</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#F0822A]" />
              <span>En cours d&apos;approbation : {totalEnAttente} j</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-600" />
              <span>Solde net restant : {totalRestant} j</span>
            </span>
          </div>
        </div>

        {/* Jauge horizontale segmentée */}
        <div className="w-full h-3 bg-slate-100 flex overflow-hidden border border-slate-200">
          <div
            className="bg-slate-700 h-full transition-all"
            style={{ width: `${pctPris}%` }}
            title={`Consommé : ${totalPris} j (${pctPris.toFixed(1)}%)`}
          />
          <div
            className="bg-[#F0822A] h-full transition-all"
            style={{ width: `${pctAttente}%` }}
            title={`En attente de validation : ${totalEnAttente} j (${pctAttente.toFixed(1)}%)`}
          />
          <div
            className="bg-emerald-600 h-full transition-all"
            style={{ width: `${pctRestant}%` }}
            title={`Disponible : ${totalRestant} j (${pctRestant.toFixed(1)}%)`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>0 j</span>
          <span>Acquisition mensuelle : +2.17 jours ouvrés par mois de travail effectif</span>
          <span>Plafond annuel : {totalAcquis} j</span>
        </div>
      </div>

      {/* ── 2. LES 3 COMPTEURS OFFICIELS PAR NATURE (CADRE BULLETIN INDIVIDUEL) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compteur 1 : Congés payés légaux */}
        <div className="bg-white border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase">
                Congés Annuels Payés
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-200">
                Légal
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {soldeConges.repartition.congesPayes.solde}
              </span>
              <span className="text-xs text-slate-500 font-medium">jours restants</span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <span>Droit acquis cumulé :</span>
                <span className="font-mono font-bold text-slate-900">
                  {soldeConges.repartition.congesPayes.acquis} j
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Consommation validée :</span>
                <span className="font-mono font-bold text-slate-900">
                  {soldeConges.repartition.congesPayes.pris} j
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            Cadre de calcul conforme au Code du Travail.
          </div>
        </div>

        {/* Compteur 2 : Permissions exceptionnelles */}
        <div className="bg-white border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase">
                Permissions Exceptionnelles
              </span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 border border-amber-200">
                Événements
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {soldeConges.repartition.permissionsAnnuelles.solde}
              </span>
              <span className="text-xs text-slate-500 font-medium">jours de quota</span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <span>Quota annuel conventionnel :</span>
                <span className="font-mono font-bold text-slate-900">
                  {soldeConges.repartition.permissionsAnnuelles.quotaTotal} j
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Prises avec justificatif :</span>
                <span className="font-mono font-bold text-slate-900">
                  {soldeConges.repartition.permissionsAnnuelles.prises} j
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            Mariage, naissance, décès, fêtes religieuses.
          </div>
        </div>

        {/* Compteur 3 : Repos compensateur & Récupérations */}
        <div className="bg-white border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase">
                Récupérations & Astreintes
              </span>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 border border-purple-200">
                Astreintes DSI
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {soldeConges.repartition.recuperations.solde}
              </span>
              <span className="text-xs text-slate-500 font-medium">jours disponibles</span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <span>Heures validées N+1 :</span>
                <span className="font-mono font-bold text-slate-900">
                  {soldeConges.repartition.recuperations.acquises} j
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Jours récupérés :</span>
                <span className="font-mono font-bold text-slate-900">
                  {soldeConges.repartition.recuperations.prises} j
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            Validé lors des interventions de nuit / week-end.
          </div>
        </div>
      </div>

      {/* ── 3. HISTORIQUE DES MOUVEMENTS ET DÉCOMPTES (JOURNAL D'AUDIT COMPTABLE) ── */}
      <div className="bg-white border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Journal des mouvements de solde (Année 2026)
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Traçabilité ISO / DRH
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Opération / Nature</th>
                <th className="py-2.5 px-4">Réf. Document</th>
                <th className="py-2.5 px-4 text-right">Variation</th>
                <th className="py-2.5 px-4 text-right">Nouveau Solde</th>
                <th className="py-2.5 px-4">Opérateur / Valideur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOUVEMENTS_SOLDE.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {m.date.split("-").reverse().join("/")}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{m.nature}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.reference}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={m.variation > 0 ? "text-emerald-700" : "text-red-700"}>
                      {m.variation > 0 ? `+${m.variation}` : m.variation} j
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {m.soldeApres} j
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{m.operateur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

