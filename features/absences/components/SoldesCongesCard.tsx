// ============================================================
// features/absences/components/SoldesCongesCard.tsx
// Visualisation détaillée des droits et consommations de congés
// Respect de la charte Agilly (Bords stricts, barres segmentées)
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
    <div className="bg-white border border-slate-200 p-6 shadow-xs select-none">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 mb-5 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F0822A]">
            EXERCICE ANNUEL {solde.annee}
          </span>
          <h2 className="text-base font-black text-slate-900 m-0 tracking-tight">
            Soldes de Congés & Droits Disponibles — {collaborateurNom}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Mise à jour :</span>
          <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200">
            Automatique (Paie)
          </span>
        </div>
      </div>

      {/* ── 4 COMPTEURS CLÉS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 p-4 border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Droits Acquis {solde.annee}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{solde.joursAcquis}</span>
            <span className="text-xs font-bold text-slate-500">jours</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">2.2 j / mois</span>
        </div>

        <div className="bg-blue-50/50 p-4 border border-blue-200/60">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
            Jours Consommés
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-800">{solde.joursPris}</span>
            <span className="text-xs font-bold text-blue-600">jours</span>
          </div>
          <span className="text-[10px] font-bold text-blue-600">{pctPris}% des droits</span>
        </div>

        <div className="bg-orange-50/50 p-4 border border-orange-200/60">
          <p className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider mb-1">
            En Cours de Validation
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#EA580C]">{solde.joursEnAttente}</span>
            <span className="text-xs font-bold text-orange-600">jours</span>
          </div>
          <span className="text-[10px] font-bold text-orange-600">Bloqués temporairement</span>
        </div>

        <div className="bg-emerald-50/60 p-4 border border-emerald-200">
          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
            Solde Net Restant
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-700">{solde.joursRestants}</span>
            <span className="text-xs font-bold text-emerald-800">jours</span>
          </div>
          <span className="text-[10px] font-black text-emerald-700 uppercase">
            Imméd. Posable
          </span>
        </div>
      </div>

      {/* ── BARRE DE PROGRESSION SEGMENTÉE ── */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-700 mb-1.5">
          <span>Décomposition de l'enveloppe globale ({solde.joursAcquis} jours)</span>
          <span className="text-[#F0822A]">{pctRestant}% disponible</span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 flex overflow-hidden border border-slate-200">
          {/* Pris */}
          <div
            style={{ width: `${pctPris}%` }}
            className="bg-blue-600 h-full transition-all duration-300"
            title={`Pris: ${solde.joursPris} jours (${pctPris}%)`}
          />
          {/* En attente */}
          <div
            style={{ width: `${pctEnAttente}%` }}
            className="bg-[#F0822A] h-full transition-all duration-300"
            title={`En attente: ${solde.joursEnAttente} jours (${pctEnAttente}%)`}
          />
          {/* Restant */}
          <div
            style={{ width: `${pctRestant}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title={`Disponible: ${solde.joursRestants} jours (${pctRestant}%)`}
          />
        </div>

        {/* Légende */}
        <div className="flex items-center gap-6 mt-2 text-[11px] font-bold text-slate-600 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 inline-block" /> {solde.joursPris} j consommés
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#F0822A] inline-block" /> {solde.joursEnAttente} j en circuit de validation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 inline-block" /> {solde.joursRestants} j restants nets
          </span>
        </div>
      </div>

      {/* ── DETAIL PAR NATURE D'ABSENCE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
          <div className="flex justify-between font-extrabold text-slate-900 mb-1">
            <span>Congés Payés Annuels</span>
            <span className="text-emerald-700">{solde.repartition.congesPayes.solde} j dispo</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0">
            Acquis: {solde.repartition.congesPayes.acquis}j | Posés: {solde.repartition.congesPayes.pris}j
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
          <div className="flex justify-between font-extrabold text-slate-900 mb-1">
            <span>Permissions Déductibles</span>
            <span className="text-[#EA580C]">{solde.repartition.permissionsAnnuelles.solde} j dispo</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0">
            Quota légal: {solde.repartition.permissionsAnnuelles.quotaTotal}j | Pris: {solde.repartition.permissionsAnnuelles.prises}j
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
          <div className="flex justify-between font-extrabold text-slate-900 mb-1">
            <span>Récupérations d'Heures</span>
            <span className="text-blue-700">{solde.repartition.recuperations.solde} j dispo</span>
          </div>
          <p className="text-[11px] text-slate-500 m-0">
            Acquises: {solde.repartition.recuperations.acquises}j | Prises: {solde.repartition.recuperations.prises}j
          </p>
        </div>
      </div>
    </div>
  );
}

