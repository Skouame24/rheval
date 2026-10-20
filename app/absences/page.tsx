// ============================================================
// app/absences/page.tsx
// Tableau de bord d'accueil du salarié
// Conforme aux retours utilisateurs :
//  - Titres en minuscules selon l'usage français
//  - Cartes cliquables filtrant directement vers la liste
//  - Barre de solde visuelle (26 j = 8 consommés + 4 en attente + 14 disponibles)
//  - Textes corporate sans jargon ("Supérieur", "en attente")
//  - Contraste élevé (WCAG AAA / AA >= 4.5:1)
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";

export default function AbsencesDashboardPage() {
  const router = useRouter();
  const { currentPersona, myDemandes, soldeConges } = useAbsences();

  // Recherche de la demande la plus prioritaire dans le circuit
  const activeDemande =
    myDemandes.find((d) =>
      ["RETOURNEE_EMPLOYE", "EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)
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

  // Calculs pour la barre de solde
  const totalEnvelope = soldeConges.joursAcquis || 26;
  const pctConsommes = Math.round((soldeConges.joursPris / totalEnvelope) * 100);
  const pctAttente = Math.round((soldeConges.joursEnAttente / totalEnvelope) * 100);
  const pctDisponibles = 100 - pctConsommes - pctAttente;

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DU TABLEAU DE BORD (MINUSCULES EN USAGE FRANÇAIS) ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#D96F1D]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tableau de bord — absences & congés
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Bonjour <strong className="text-slate-900">{currentPersona.prenom} {currentPersona.nom}</strong> ({currentPersona.poste}) • Suivi en temps réel de votre situation.
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
            className="inline-flex items-center gap-2 bg-[#D96F1D] hover:bg-[#B95914] text-white font-semibold text-xs py-2 px-3.5 transition-colors shadow-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* ── BARRE VISUELLE DU SOLDE DE CONGÉS (26 j = 8 consommés + 4 en attente + 14 disponibles) ── */}
      <div className="bg-white border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Enveloppe annuelle des congés payés ({totalEnvelope} jours légaux)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Consommation, demandes en cours d&apos;instruction et solde immédiatement disponible.
            </p>
          </div>
          <Link
            href="/absences/soldes"
            className="text-xs font-bold text-[#D96F1D] hover:underline"
          >
            Détails des droits & récupérations &rarr;
          </Link>
        </div>

        {/* Barre segmentée avec contrastes élevés */}
        <div className="w-full h-4 bg-slate-100 flex overflow-hidden border border-slate-200">
          <div
            style={{ width: `${pctConsommes}%` }}
            className="bg-slate-700 hover:bg-slate-800 transition-all"
            title={`${soldeConges.joursPris} j consommés (${pctConsommes}%)`}
          />
          <div
            style={{ width: `${pctAttente}%` }}
            className="bg-[#D96F1D] hover:bg-[#B95914] transition-all"
            title={`${soldeConges.joursEnAttente} j en attente d'instruction (${pctAttente}%)`}
          />
          <div
            style={{ width: `${pctDisponibles}%` }}
            className="bg-emerald-600 hover:bg-emerald-700 transition-all"
            title={`${soldeConges.joursRestants} j disponibles (${pctDisponibles}%)`}
          />
        </div>

        {/* Légende de la barre */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-slate-700 shrink-0" />
            <span className="text-slate-700 font-medium">Consommés : <strong>{soldeConges.joursPris} j</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#D96F1D] shrink-0" />
            <span className="text-slate-900 font-medium">En attente de validation : <strong className="text-[#B95914]">{soldeConges.joursEnAttente} j</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-600 shrink-0" />
            <span className="text-slate-900 font-medium">Disponibles : <strong className="text-emerald-800">{soldeConges.joursRestants} j</strong></span>
          </div>
        </div>
      </div>

      {/* ── 1. BANDEAU DE CARTES RÉCAPITULATIF (CLIQUABLES & FILTRANTES) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde Congés */}
        <Link
          href="/absences/soldes"
          className="bg-white border border-slate-200 hover:border-slate-400 p-4 flex flex-col justify-between transition-colors group cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
            Solde congés payés
          </span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {soldeConges.joursRestants}
            </span>
            <span className="text-xs font-semibold text-slate-600">jours disponibles</span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>{soldeConges.joursPris} j consommés</span>
            <span className="text-[#B95914] font-bold">{soldeConges.joursEnAttente} j en attente</span>
          </div>
        </Link>

        {/* Demandes en validation */}
        <button
          type="button"
          onClick={() => router.push("/absences/demandes?statut=EN_COURS")}
          className="bg-white border border-slate-200 hover:border-amber-400 p-4 flex flex-col justify-between text-left transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 w-full">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              En cours de validation
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-amber-900">
              {countEnCours}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {countEnCours > 1 ? "demandes actives" : "demande active"}
            </span>
          </div>
          <span className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 group-hover:text-slate-900 w-full">
            Chez le Supérieur, la DRH ou la Direction &rarr;
          </span>
        </button>

        {/* Validées */}
        <button
          type="button"
          onClick={() => router.push("/absences/demandes?statut=APPROUVEE")}
          className="bg-white border border-slate-200 hover:border-emerald-400 p-4 flex flex-col justify-between text-left transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 w-full">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              Approuvées cette année
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-emerald-800">
              {countValidees}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {countValidees > 1 ? "demandes finalisées" : "demande finalisée"}
            </span>
          </div>
          <span className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 group-hover:text-slate-900 w-full">
            Permissions officielles émises &rarr;
          </span>
        </button>

        {/* À corriger */}
        <button
          type="button"
          onClick={() => router.push("/absences/demandes?statut=RETOUR")}
          className="bg-white border border-slate-200 hover:border-red-400 p-4 flex flex-col justify-between text-left transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 w-full">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              À corriger
            </span>
            <span className="w-2 h-2 rounded-full bg-red-600" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-red-800">
              {countRetours}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {countRetours > 1 ? "actions requises" : "action requise"}
            </span>
          </div>
          <span className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 group-hover:text-slate-900 w-full">
            {countRetours > 0 ? "Voir le motif de révision &rarr;" : "Aucun dossier en retour"}
          </span>
        </button>
      </div>

      {/* ── 2. BLOC MAJEUR : STEPPER VISUEL DU WORKFLOW (OÙ EN EST LE DOSSIER ?) ── */}
      {activeDemande && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#D96F1D]" />
              <h2 className="text-sm font-bold text-slate-900">
                Suivi de votre demande en cours : {activeDemande.libelleType} ({activeDemande.codeReference})
              </h2>
            </div>
            <Link
              href="/absences/demandes"
              className="text-xs font-bold text-[#D96F1D] hover:underline"
            >
              Voir le détail complet &rarr;
            </Link>
          </div>

          <DemandeWorkflowStepper demande={activeDemande} />
        </div>
      )}

      {/* ── 3. LISTE DES ACTIVITÉS RÉCENTES & ACCÈS DIRECTS ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Dernières demandes déposées
          </h3>
          <Link
            href="/absences/demandes"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Consulter l&apos;historique complet &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {myDemandes.slice(0, 3).map((dem) => (
            <div
              key={dem.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-2 h-2 mt-1.5 shrink-0 ${
                    dem.statut === "APPROUVEE"
                      ? "bg-emerald-600"
                      : dem.statut === "RETOURNEE_EMPLOYE"
                      ? "bg-red-600"
                      : "bg-[#D96F1D]"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{dem.libelleType}</span>
                    <span className="font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      ({dem.codeReference})
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Du {dem.dateDebut} au {dem.dateFin} • <strong>{dem.nombreJoursOuvres} j</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[11px] text-slate-600 font-medium">
                  {dem.statut === "RETOURNEE_EMPLOYE"
                    ? "Retournée à l'employé"
                    : dem.etapeCourante === "SUPERIEUR_N1"
                    ? "En attente Supérieur"
                    : dem.etapeCourante === "DRH"
                    ? "En contrôle DRH"
                    : dem.etapeCourante === "DIRECTION_DG"
                    ? "En validation DG"
                    : "Approuvée"}
                </span>

                <Link
                  href="/absences/demandes"
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300"
                >
                  Consulter &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
