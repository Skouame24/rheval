// ============================================================
// app/absences/page.tsx
// Tableau de bord personnel du salarié — Soft, aéré, centré sur ses 3 besoins vitaux :
// 1. Déposer une demande (Congé, Permission, Mission, Intervention)
// 2. Connaître ses soldes d'un coup d'œil
// 3. Suivre le circuit vivant de sa demande en cours (Schéma officiel)
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";

const fr = (iso: string) => iso.split("T")[0].split("-").reverse().join("/");

export default function AbsencesDashboardPage() {
  const { currentPersona, myDemandes, soldeConges } = useAbsences();

  // Demandes en cours de circuit
  const enCours = myDemandes.filter((d) =>
    ["RETOURNEE_EMPLOYE", "EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)
  );

  // Demandes validées prêtes (permission disponible)
  const approuvees = myDemandes.filter((d) =>
    ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-2">
      {/* ── 1. EN-TÊTE ACCUEIL SOFT ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Espace Salarié
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bonjour {currentPersona.prenom.split(" ")[0]} · Gérez vos congés, permissions, missions et interventions en toute simplicité.
          </p>
        </div>

        <Link
          href="/absences/planning"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 transition-colors self-start sm:self-auto"
        >
          📅 Voir le planning d&apos;équipe
        </Link>
      </div>

      {/* ── 2. CARTES D'ACCÈS RAPIDE PAR NATURE (CONGÉ, PERMISSION, MISSION, INTERVENTION) ── */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Faire une nouvelle demande
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/absences/nouvelle?type=CONGES_ANNUELS"
            className="bg-white border border-slate-200 hover:border-blue-500 p-4 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                🌴
              </div>
              <span className="text-xs font-bold text-slate-900 block">Congés</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Annuels ou maladie</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 mt-3 group-hover:translate-x-0.5 transition-transform inline-block">
              Poser →
            </span>
          </Link>

          <Link
            href="/absences/nouvelle?type=PERMISSION_EXCEPTIONNELLE"
            className="bg-white border border-slate-200 hover:border-[#D96F1D] p-4 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 bg-orange-50 text-[#D96F1D] flex items-center justify-center font-bold text-sm mb-2 group-hover:bg-[#D96F1D] group-hover:text-white transition-colors">
                ✉️
              </div>
              <span className="text-xs font-bold text-slate-900 block">Permission</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Événement familial</span>
            </div>
            <span className="text-[11px] font-semibold text-[#D96F1D] mt-3 group-hover:translate-x-0.5 transition-transform inline-block">
              Demander →
            </span>
          </Link>

          <Link
            href="/absences/nouvelle?type=MISSION_DEPLACEMENT"
            className="bg-white border border-slate-200 hover:border-purple-500 p-4 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                ✈️
              </div>
              <span className="text-xs font-bold text-slate-900 block">Mission</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Déplacement & frais</span>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 mt-3 group-hover:translate-x-0.5 transition-transform inline-block">
              Déclarer →
            </span>
          </Link>

          <Link
            href="/absences/nouvelle?type=INTERVENTION_TERRAIN"
            className="bg-white border border-slate-200 hover:border-amber-500 p-4 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                🔧
              </div>
              <span className="text-xs font-bold text-slate-900 block">Intervention</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Site client ou astreinte</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 mt-3 group-hover:translate-x-0.5 transition-transform inline-block">
              Planifier →
            </span>
          </Link>
        </div>
      </div>

      {/* ── 3. RÉSUMÉ DES SOLDES DU SALARIÉ (SOFT & COMPACT) ── */}
      <div className="bg-white border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Mes soldes & compteurs disponibles
          </span>
          <Link href="/absences/soldes" className="text-xs font-semibold text-[#D96F1D] hover:underline">
            Voir le relevé détaillé →
          </Link>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 text-xs">
          <div className="px-3 first:pl-0">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Congés payés</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {soldeConges.joursRestants} <span className="text-xs font-normal text-slate-500">j</span>
            </p>
            <span className="text-[10px] text-slate-400">{soldeConges.joursPris} j consommés sur {soldeConges.joursAcquis} j</span>
          </div>

          <div className="px-3">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Permissions autorisées</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {soldeConges.repartition.permissionsAnnuelles.solde} <span className="text-xs font-normal text-slate-500">j</span>
            </p>
            <span className="text-[10px] text-slate-400">Quota annuel légal restant</span>
          </div>

          <div className="px-3">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Récupérations</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {soldeConges.repartition.recuperations.solde} <span className="text-xs font-normal text-slate-500">j</span>
            </p>
            <span className="text-[10px] text-slate-400">Heures sup & astreintes</span>
          </div>
        </div>
      </div>

      {/* ── 4. MES DEMANDES EN COURS AVEC CIRCUIT SCHÉMA OFFICIEL ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Suivi en temps réel de mes demandes ({enCours.length})
          </span>
          <Link href="/absences/demandes" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            Voir tout l&apos;historique →
          </Link>
        </div>

        {enCours.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-700 text-sm">Aucune demande en cours de circuit</p>
            <p className="mt-1">Vous n&apos;avez aucune demande en attente de visa chez vos supérieurs ou à la DRH.</p>
          </div>
        ) : (
          enCours.map((d) => {
            const motif = d.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;
            return (
              <div key={d.id} className="bg-white border border-slate-200 p-4 flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{d.libelleType}</span>
                      <span className="text-[10px] font-mono text-slate-400">({d.codeReference})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Période : <strong>Du {fr(d.dateDebut)} au {fr(d.dateFin)}</strong> · {d.nombreJoursOuvres} jour(s)
                    </p>
                  </div>

                  {d.statut === "RETOURNEE_EMPLOYE" && (
                    <Link
                      href={`/absences/nouvelle?edit=${d.id}`}
                      className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1 transition-colors"
                    >
                      Corriger & Renvoyer
                    </Link>
                  )}
                </div>

                {/* Stepper minimal calqué sur le diagramme drawio */}
                <DemandeWorkflowStepper demande={d} />

                {/* Si retournée avec motif */}
                {motif && d.statut === "RETOURNEE_EMPLOYE" && (
                  <div className="text-xs text-red-900 bg-red-50 border border-red-200 p-2.5 flex items-start gap-2">
                    <span className="font-bold text-red-600">Motif de retour du supérieur :</span>
                    <span className="italic">&ldquo;{motif}&rdquo;</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* ── 5. DERNIÈRE PERMISSION APPROUVÉE ET PRÊTE À TÉLÉCHARGER ── */}
      {approuvees.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </span>
            <div>
              <p className="font-bold text-emerald-950">
                Permission prête : {approuvees[0].libelleType} ({approuvees[0].codeReference})
              </p>
              <p className="text-emerald-800 text-[11px]">
                Validée et éditée. Votre document officiel scellé est disponible au téléchargement.
              </p>
            </div>
          </div>
          <Link
            href="/absences/registre"
            className="px-3 py-1.5 bg-white border border-emerald-300 font-bold text-emerald-900 hover:bg-emerald-100 transition-colors whitespace-nowrap"
          >
            Télécharger le PDF
          </Link>
        </div>
      )}
    </div>
  );
}
