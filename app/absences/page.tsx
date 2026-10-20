// ============================================================
// app/absences/page.tsx
// Tableau de bord d'accueil officiel du salarié / collaborateur
// - Récapitulatif : Solde disponible, demandes en cours, etc.
// - Visualisation centrale du STEPPER DE WORKFLOW : "Où en est ma demande active ?"
// - Raccourci vers la liste complète "Mes demandes" et "Nouvelle demande"
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";

export default function AbsencesDashboardPage() {
  const { currentPersona, myDemandes, soldeConges } = useAbsences();

  // Recherche de la demande la plus urgente ou active dans le workflow
  const activeDemande =
    myDemandes.find((d) =>
      ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG", "RETOURNEE_EMPLOYE"].includes(d.statut)
    ) || myDemandes[0];

  const countEnCours = myDemandes.filter((d) =>
    ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)
  ).length;

  const countValidees = myDemandes.filter((d) =>
    ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)
  ).length;

  const countRetours = myDemandes.filter((d) =>
    ["RETOURNEE_EMPLOYE", "REFUSEE_DEFINITIVEMENT"].includes(d.statut)
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DU TABLEAU DE BORD ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tableau de Bord — Absences & Congés
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bonjour <strong>{currentPersona.prenom} {currentPersona.nom}</strong> ({currentPersona.poste}) • Suivi en temps réel de votre situation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/absences/demandes"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
          >
            Voir toute la liste &rarr;
          </Link>
          <Link
            href="/absences/nouvelle"
            className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs py-2 px-3.5 transition-colors shadow-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* ── 1. BANDEAU DE CARTES RÉCAPITULATIF ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde Congés */}
        <div className="bg-white border border-slate-200 p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Solde Congés Payés
          </span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {soldeConges.joursRestants}
            </span>
            <span className="text-xs font-semibold text-slate-500">jours disponibles</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>{soldeConges.joursPris} j consommés</span>
            <span className="text-[#F0822A] font-medium">{soldeConges.joursEnAttente} j posés</span>
          </div>
        </div>

        {/* Demandes en validation */}
        <Link
          href="/absences/demandes"
          className="bg-white border border-slate-200 hover:border-amber-400 p-4 flex flex-col justify-between transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              En cours de circuit
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-amber-700">
              {countEnCours}
            </span>
            <span className="text-xs font-semibold text-slate-500">demandes actives</span>
          </div>
          <span className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 group-hover:text-slate-900">
            Chez N+1, DRH ou Direction &rarr;
          </span>
        </Link>

        {/* Validées */}
        <Link
          href="/absences/demandes"
          className="bg-white border border-slate-200 hover:border-emerald-400 p-4 flex flex-col justify-between transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Approuvées cette année
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-emerald-700">
              {countValidees}
            </span>
            <span className="text-xs font-semibold text-slate-500">dossiers finalisés</span>
          </div>
          <span className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 group-hover:text-slate-900">
            Bulletins officiels émis &rarr;
          </span>
        </Link>

        {/* À corriger */}
        <Link
          href="/absences/demandes"
          className="bg-white border border-slate-200 hover:border-red-400 p-4 flex flex-col justify-between transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              À corriger
            </span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-red-700">
              {countRetours}
            </span>
            <span className="text-xs font-semibold text-slate-500">action requise</span>
          </div>
          <span className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 group-hover:text-slate-900">
            {countRetours > 0 ? "Voir le motif de révision &rarr;" : "Aucun dossier en retour"}
          </span>
        </Link>
      </div>

      {/* ── 2. BLOC MAJEUR : STEPPER VISUEL DU WORKFLOW (OÙ EN EST LE DOSSIER ?) ── */}
      {activeDemande ? (
        <div className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {activeDemande.codeReference}
                </span>
                <span className="px-2 py-0.5 bg-[#FFF4EB] text-[#F0822A] font-semibold text-[11px] border border-[#FDE3CC]">
                  {activeDemande.libelleType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Du {activeDemande.dateDebut.split("-").reverse().join("/")} au {activeDemande.dateFin.split("-").reverse().join("/")} ({activeDemande.nombreJoursOuvres} jours) • &ldquo;{activeDemande.motif}&rdquo;
              </p>
            </div>

            <Link
              href="/absences/demandes"
              className="text-xs font-bold text-[#F0822A] hover:underline"
            >
              Consulter dans Mes Demandes &rarr;
            </Link>
          </div>

          {/* Stepper graphique */}
          <DemandeWorkflowStepper demande={activeDemande} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
          <p className="font-bold text-slate-800 text-sm">Aucune demande en cours de circuit</p>
          <p className="mt-1">Déposez votre première demande de congé ou de permission pour visualiser le workflow.</p>
        </div>
      )}

      {/* ── 3. DERNIÈRES DEMANDES RÉCENTES ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="font-bold text-slate-900 text-sm">Dernières demandes déposées</span>
          <Link href="/absences/demandes" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            Accéder à la liste complète &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {myDemandes.slice(0, 3).map((dem) => (
            <div key={dem.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-slate-900 block">{dem.codeReference}</span>
                <span className="text-slate-600 font-medium">{dem.libelleType} • {dem.nombreJoursOuvres} j</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px] block">
                  Du {dem.dateDebut.split("-").reverse().join("/")} au {dem.dateFin.split("-").reverse().join("/")}
                </span>
                <span className="font-bold text-slate-700">{dem.statut}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
