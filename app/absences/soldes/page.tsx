// ============================================================
// app/absences/soldes/page.tsx
// Soldes & Droits à Congés — Compteurs légaux et historique
// Cadre DRH certifié & Cadencement mensuel des droits
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

export default function SoldesCongesPage() {
  const { currentPersona, soldeConges, myDemandes, isLoading } = useAbsences();
  const [selectedYear, setSelectedYear] = useState(2026);

  const totalAcquis = soldeConges.joursAcquis;
  const totalPris = soldeConges.joursPris;
  const totalEnAttente = soldeConges.joursEnAttente;
  const totalRestant = soldeConges.joursRestants;

  const pctPris = totalAcquis > 0 ? (totalPris / totalAcquis) * 100 : 0;
  const pctAttente = totalAcquis > 0 ? (totalEnAttente / totalAcquis) * 100 : 0;
  const pctRestant = totalAcquis > 0 ? (totalRestant / totalAcquis) * 100 : 100;

  // Calcul dynamique des mouvements depuis les demandes réelles
  const mouvements = useMemo(() => {
    const list = [];
    const running = soldeConges.joursRestants;

    for (const d of myDemandes) {
      if (d.typeDemande === "CONGES_ANNUELS") {
        list.push({
          date: d.dateCreation ? d.dateCreation.split("T")[0] : "2026-10-01",
          nature: `Demande de congés (${d.nombreJoursOuvres}j)`,
          reference: d.codeReference,
          variation: -Number(d.nombreJoursOuvres),
          soldeApres: running,
          operateur:
            d.statut === "APPROUVEE" || d.statut === "PERMISSION_EDITEE"
              ? "Direction / DRH"
              : "Système (En cours)",
        });
      }
    }

    list.push({
      date: `${soldeConges.annee || 2026}-01-01`,
      nature: "Droits annuels légaux de congés payés",
      reference: `ACQUIS-${soldeConges.annee || 2026}`,
      variation: +soldeConges.joursAcquis,
      soldeApres: soldeConges.joursAcquis,
      operateur: "Clôture Paie DRH / Agilly",
    });

    return list;
  }, [myDemandes, soldeConges]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DE LA PAGE ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A] shadow-xs" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Soldes & Droits à Congés Payés
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Relevé individuel officiel Agilly des compteurs de congés, permissions exceptionnelles et récupérations.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-orange-50/60 border border-orange-200 text-slate-800 font-bold">
            Matricule : <span className="font-mono text-[#C25E00]">{currentPersona.matricule}</span>
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
      {isLoading ? (
        <div className="bg-white border border-slate-200 p-6 flex flex-col gap-4 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-2">
              <div className="h-3 w-36 bg-slate-200 rounded-sm" />
              <div className="h-8 w-48 bg-slate-300 rounded-sm" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-28 bg-slate-200 rounded-sm" />
              <div className="h-4 w-28 bg-slate-200 rounded-sm" />
              <div className="h-4 w-28 bg-slate-200 rounded-sm" />
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-xs" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C25E00]">
                Enveloppe Annuelle Globale
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-4xl font-black text-[#F0822A] font-mono tracking-tight tabular-nums">
                  {totalRestant}
                </span>
                <span className="text-sm font-bold text-slate-600">
                  jours disponibles sur {totalAcquis} j acquis
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-700" />
                <span>Consommés : {totalPris} j</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-500" />
                <span>En cours : {totalEnAttente} j</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#F0822A]" />
                <span className="text-[#C25E00] font-black">Disponible : {totalRestant} j</span>
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
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${pctAttente}%` }}
              title={`En attente de validation : ${totalEnAttente} j (${pctAttente.toFixed(1)}%)`}
            />
            <div
              className="bg-[#F0822A] h-full transition-all"
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
      )}

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
              {mouvements.map((m, idx) => (
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

