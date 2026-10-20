// ============================================================
// features/absences/components/SoldesCongesCard.tsx
// Visualisation moderne et fluide des soldes de congés
// ============================================================

"use client";

import { SoldeCongesInfo } from "@/types/absences.types";

interface SoldesCongesCardProps {
  solde: SoldeCongesInfo;
  collaborateurNom: string;
}

export function SoldesCongesCard({ solde, collaborateurNom }: SoldesCongesCardProps) {
  const pctPris = Math.round((solde.joursPris / solde.joursAcquis) * 100);
  const pctEnAttente = Math.round((solde.joursEnAttente / solde.joursAcquis) * 100);
  const pctRestant = Math.max(0, 100 - pctPris - pctEnAttente);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs font-sans">
      
      {/* EN-TÊTE DE LA CARTE */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 mb-5 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-[#F0822A] uppercase tracking-wider">
            Exercice {solde.annee}
          </span>
          <h2 className="text-base font-bold text-slate-900 m-0 tracking-tight">
            Soldes de congés & Droits acquis — {collaborateurNom}
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full">
          Synchronisé avec la paie
        </span>
      </div>

      {/* ── 4 COMPTEURS CLÉS ÉLÉGANTS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-1">
            Droits acquis annuels
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900">{solde.joursAcquis}</span>
            <span className="text-xs font-medium text-slate-400">jours</span>
          </div>
          <span className="text-[11px] text-slate-400">2.2 jours / mois</span>
        </div>

        <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100/70">
          <p className="text-xs font-medium text-blue-700 mb-1">
            Jours consommés
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-900">{solde.joursPris}</span>
            <span className="text-xs font-medium text-blue-600">jours</span>
          </div>
          <span className="text-[11px] text-blue-600 font-medium">{pctPris}% des droits</span>
        </div>

        <div className="bg-orange-50/40 rounded-xl p-4 border border-orange-100/70">
          <p className="text-xs font-medium text-[#EA580C] mb-1">
            En cours de validation
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#EA580C]">{solde.joursEnAttente}</span>
            <span className="text-xs font-medium text-orange-600">jours</span>
          </div>
          <span className="text-[11px] text-orange-600 font-medium">Bloqués temporairement</span>
        </div>

        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
          <p className="text-xs font-medium text-emerald-800 mb-1">
            Solde net disponible
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-700">{solde.joursRestants}</span>
            <span className="text-xs font-medium text-emerald-700">jours</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">
            Immédiatement posable
          </span>
        </div>

      </div>

      {/* ── BARRE DE PROGRESSION SEGMENTÉE SOUPLE ── */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-xs font-medium text-slate-600">
          <span>Enveloppe globale ({solde.joursAcquis} jours)</span>
          <span className="font-semibold text-emerald-700">{pctRestant}% restant</span>
        </div>
        
        <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5">
          <div
            style={{ width: `${pctPris}%` }}
            className="bg-blue-500 h-full rounded-l-full transition-all duration-500"
            title={`Pris: ${solde.joursPris} jours`}
          />
          <div
            style={{ width: `${pctEnAttente}%` }}
            className="bg-[#F0822A] h-full transition-all duration-500"
            title={`En attente: ${solde.joursEnAttente} jours`}
          />
          <div
            style={{ width: `${pctRestant}%` }}
            className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
            title={`Disponible: ${solde.joursRestants} jours`}
          />
        </div>

        {/* Légende */}
        <div className="flex items-center gap-5 pt-1 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> {solde.joursPris} j consommés
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F0822A] inline-block" /> {solde.joursEnAttente} j en circuit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {solde.joursRestants} j restants nets
          </span>
        </div>
      </div>

      {/* ── DETAIL PAR NATURE DE DROITS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
          <div className="flex justify-between font-bold text-slate-800 mb-1">
            <span>Congés Payés Annuels</span>
            <span className="text-emerald-700">{solde.repartition.congesPayes.solde} j</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0">
            Acquis: {solde.repartition.congesPayes.acquis}j · Posés: {solde.repartition.congesPayes.pris}j
          </p>
        </div>

        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
          <div className="flex justify-between font-bold text-slate-800 mb-1">
            <span>Permissions Déductibles</span>
            <span className="text-[#EA580C]">{solde.repartition.permissionsAnnuelles.solde} j</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0">
            Quota légal: {solde.repartition.permissionsAnnuelles.quotaTotal}j · Pris: {solde.repartition.permissionsAnnuelles.prises}j
          </p>
        </div>

        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
          <div className="flex justify-between font-bold text-slate-800 mb-1">
            <span>Récupérations d'Heures</span>
            <span className="text-blue-700">{solde.repartition.recuperations.solde} j</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0">
            Acquises: {solde.repartition.recuperations.acquises}j · Prises: {solde.repartition.recuperations.prises}j
          </p>
        </div>
      </div>

    </div>
  );
}
