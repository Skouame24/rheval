// ============================================================
// app/absences/page.tsx
// Tableau de bord personnel du salarié — Agilly RHEVAL Enterprise
// Interface Corporate : Congés & Permissions vs Missions & Déplacements
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";
import { DemandeRHItem } from "@/types/absences.types";

const fr = (iso: string) => iso.split("T")[0].split("-").reverse().join("/");

// Icônes vectorielles corporate épurées
function CalendarSvg({ className = "w-4 h-4 text-current" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BriefcaseSvg({ className = "w-4 h-4 text-current" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ArrowRightSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function isMissionItem(d: DemandeRHItem): boolean {
  return (
    d.familleDemande === "MISSIONS" ||
    d.typeDemande === "MISSION_DEPLACEMENT" ||
    d.typeDemande === "INTERVENTION_TERRAIN" ||
    d.libelleType?.toLowerCase().includes("mission") ||
    d.libelleType?.toLowerCase().includes("intervention")
  );
}

function isCongeAnnuelItem(d: DemandeRHItem): boolean {
  return (
    d.typeDemande === "CONGES_ANNUELS" ||
    d.libelleType?.toLowerCase().includes("annuel") ||
    d.libelleType?.toLowerCase().includes("payé")
  );
}

export default function AbsencesDashboardPage() {
  const { currentPersona, myDemandes, soldeConges, isLoading } = useAbsences();
  const [activeTab, setActiveTab] = useState<"CONGES" | "MISSIONS">("CONGES");

  // Séparation en deux univers étanches
  const demandesConges = useMemo(() => myDemandes.filter((d) => !isMissionItem(d)), [myDemandes]);
  const demandesMissions = useMemo(() => myDemandes.filter((d) => isMissionItem(d)), [myDemandes]);

  // Demandes en cours
  const enCoursConges = useMemo(
    () =>
      demandesConges.filter((d) =>
        ["RETOURNEE_EMPLOYE", "EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)
      ),
    [demandesConges]
  );

  const enCoursMissions = useMemo(
    () =>
      demandesMissions.filter((d) =>
        ["RETOURNEE_EMPLOYE", "EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)
      ),
    [demandesMissions]
  );

  // Demandes approuvées prêtes
  const approuveesConges = useMemo(
    () => demandesConges.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)),
    [demandesConges]
  );

  const approuveesMissions = useMemo(
    () => demandesMissions.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)),
    [demandesMissions]
  );

  // Métriques professionnelles
  const statsMissions = useMemo(() => {
    const totalMissions = demandesMissions.length;
    const joursTerrain = demandesMissions
      .filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut))
      .reduce((acc, d) => acc + (d.nombreJoursOuvres || 0), 0);
    const fraisCumules = demandesMissions.reduce(
      (acc, d) => acc + (d.fraisPrevisionnels || 0),
      0
    );
    return { totalMissions, joursTerrain, fraisCumules };
  }, [demandesMissions]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. EN-TÊTE CORPORATE HARMONISÉ ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tableau de bord
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bonjour <strong>{currentPersona.prenom} {currentPersona.nom}</strong> • Suivi des congés, autorisations et ordres de mission.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/absences/planning"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 px-3.5 py-2 bg-white transition-all shadow-2xs"
          >
            Planning d&apos;équipe
          </Link>
          <Link
            href={activeTab === "CONGES" ? "/absences/nouvelle?type=CONGES_ANNUELS" : "/absences/nouvelle?type=MISSION_DEPLACEMENT"}
            className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs py-2 px-4 transition-all shadow-2xs active:scale-[0.99]"
          >
            <span>{activeTab === "CONGES" ? "+ Nouvelle demande de congé" : "+ Nouvel ordre de mission"}</span>
          </Link>
        </div>
      </div>

      {/* ── 2. ONGLETS DE NAVIGATION CORPORATE (SANS EMOJI) ── */}
      <div className="flex border-b border-slate-200 bg-white px-2">
        <button
          onClick={() => setActiveTab("CONGES")}
          type="button"
          className={`py-3 px-5 text-xs font-bold transition-all flex items-center gap-2.5 border-b-2 -mb-[1px] cursor-pointer ${
            activeTab === "CONGES"
              ? "border-[#F0822A] text-[#F0822A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarSvg className={activeTab === "CONGES" ? "w-4 h-4 text-[#F0822A]" : "w-4 h-4 text-slate-400"} />
          <span>Congés & Permissions</span>
          {enCoursConges.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-[#C25E00]">
              {enCoursConges.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("MISSIONS")}
          type="button"
          className={`py-3 px-5 text-xs font-bold transition-all flex items-center gap-2.5 border-b-2 -mb-[1px] cursor-pointer ${
            activeTab === "MISSIONS"
              ? "border-[#F0822A] text-[#F0822A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BriefcaseSvg className={activeTab === "MISSIONS" ? "w-4 h-4 text-[#F0822A]" : "w-4 h-4 text-slate-400"} />
          <span>Missions & Déplacements</span>
          {enCoursMissions.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
              {enCoursMissions.length}
            </span>
          )}
        </button>
      </div>

      {/* ── 3A. UNIVERS 1 : CONGÉS & PERMISSIONS (IMPACT SOLDE) ── */}
      {activeTab === "CONGES" && (
        <div className="flex flex-col gap-6">
          {/* Métriques Soldes RH */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Droits & Compteurs de congés
              </span>
              <Link href="/absences/soldes" className="text-xs font-semibold text-[#D96F1D] hover:underline">
                Relevé détaillé →
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 divide-x divide-slate-100 text-xs animate-pulse">
                <div className="px-3 first:pl-0 space-y-2">
                  <div className="h-3 w-24 bg-slate-200" />
                  <div className="h-7 w-16 bg-slate-300" />
                </div>
                <div className="px-3 space-y-2">
                  <div className="h-3 w-28 bg-slate-200" />
                  <div className="h-7 w-16 bg-slate-300" />
                </div>
                <div className="px-3 space-y-2">
                  <div className="h-3 w-24 bg-slate-200" />
                  <div className="h-7 w-16 bg-slate-300" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0 text-xs">
                <div className="sm:px-4 first:pl-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Congés Payés Annuels</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    {soldeConges.joursRestants} <span className="text-xs font-normal text-slate-500">jours restants</span>
                  </p>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {soldeConges.joursPris} j consommés sur {soldeConges.joursAcquis} j acquis
                  </span>
                </div>

                <div className="sm:px-4 pt-3 sm:pt-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Permissions Conventionnelles</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    {soldeConges.repartition.permissionsAnnuelles.solde} <span className="text-xs font-normal text-slate-500">jours disponibles</span>
                  </p>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Quota légal de 10 jours • Solde annuel préservé
                  </span>
                </div>

                <div className="sm:px-4 pt-3 sm:pt-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Récupérations & Repos</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    {soldeConges.repartition.recuperations.solde} <span className="text-xs font-normal text-slate-500">jours</span>
                  </p>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Astreintes et heures compensées
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Accès rapide aux types de congés */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
              Types de demandes fréquents
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/absences/nouvelle?type=CONGES_ANNUELS"
                className="bg-white border border-slate-200 hover:border-[#F0822A] p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-6 h-0.5 bg-[#F0822A] mb-3" />
                  <span className="text-xs font-bold text-slate-900 block">Congés Annuels</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                    Repos légal rémunéré • Décompté du solde
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F0822A] mt-4">
                  <span>Déposer</span>
                  <ArrowRightSvg />
                </div>
              </Link>

              <Link
                href="/absences/nouvelle?type=PERMISSION_FAMILIALE"
                className="bg-white border border-slate-200 hover:border-slate-400 p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-6 h-0.5 bg-slate-600 mb-3" />
                  <span className="text-xs font-bold text-slate-900 block">Permissions Exceptionnelles</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                    Mariage, naissance, obsèques • Quota de 10 jours
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mt-4">
                  <span>Demander</span>
                  <ArrowRightSvg />
                </div>
              </Link>

              <Link
                href="/absences/nouvelle?type=CONGES_MALADIE"
                className="bg-white border border-slate-200 hover:border-slate-400 p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-6 h-0.5 bg-slate-600 mb-3" />
                  <span className="text-xs font-bold text-slate-900 block">Arrêt Maladie</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                    Certificat médical à fournir sous 48h
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mt-4">
                  <span>Transmettre</span>
                  <ArrowRightSvg />
                </div>
              </Link>
            </div>
          </div>

          {/* Liste des demandes de congés en cours */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Demandes de congés & permissions en cours ({enCoursConges.length})
              </span>
              <Link href="/absences/demandes" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Historique complet →
              </Link>
            </div>

            {enCoursConges.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
                <p className="font-bold text-slate-700 text-sm">Aucun congé ou permission en cours de validation</p>
                <p className="mt-1">Toutes vos demandes ont été traitées.</p>
              </div>
            ) : (
              enCoursConges.map((d) => {
                const motif = d.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;
                const deduct = isCongeAnnuelItem(d);

                return (
                  <div key={d.id} className="bg-white border border-slate-200 p-5 flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{d.libelleType}</span>
                          <span className="text-xs font-mono text-slate-400">({d.codeReference})</span>
                          {deduct ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                              Décompte solde : -{d.nombreJoursOuvres} j
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200">
                              Solde CP préservé
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Période : <strong>Du {fr(d.dateDebut)} au {fr(d.dateFin)}</strong> · {d.nombreJoursOuvres} jour(s) ouvré(s)
                        </p>
                      </div>

                      {d.statut === "RETOURNEE_EMPLOYE" && (
                        <Link
                          href={`/absences/nouvelle?edit=${d.id}`}
                          className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 transition-colors"
                        >
                          Corriger le dossier
                        </Link>
                      )}
                    </div>

                    <DemandeWorkflowStepper demande={d} />

                    {motif && d.statut === "RETOURNEE_EMPLOYE" && (
                      <div className="text-xs text-red-900 bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                        <span className="font-bold text-red-600 shrink-0">Observation :</span>
                        <span className="italic">&ldquo;{motif}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          {/* Titre d'absence approuvé */}
          {approuveesConges.length > 0 && (
            <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 p-4 flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Autorisation validée : {approuveesConges[0].libelleType} ({approuveesConges[0].codeReference})
                </p>
                <p className="text-slate-500 text-xs mt-0.5 m-0">
                  Dossier finalisé et archivé. Le titre officiel d&apos;absence est disponible.
                </p>
              </div>
              <Link
                href="/absences/registre"
                className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 font-bold text-slate-800 transition-colors whitespace-nowrap shadow-2xs"
              >
                Télécharger l&apos;autorisation (PDF)
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── 3B. UNIVERS 2 : MISSIONS & DÉPLACEMENTS (IMPACT FINANCIER) ── */}
      {activeTab === "MISSIONS" && (
        <div className="flex flex-col gap-6">
          {/* Métriques Missions & Engagements */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Indicateurs Missions & Engagements Opérationnels
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0 text-xs">
              <div className="sm:px-4 first:pl-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Missions Réalisées</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {statsMissions.totalMissions}
                </p>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Dossiers professionnels enregistrés
                </span>
              </div>

              <div className="sm:px-4 pt-3 sm:pt-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Jours d&apos;Intervention Terrain</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {statsMissions.joursTerrain} <span className="text-xs font-normal text-slate-500">jours</span>
                </p>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Temps de travail effectif (Solde CP préservé)
                </span>
              </div>

              <div className="sm:px-4 pt-3 sm:pt-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Frais Prévisionnels & Débours</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {statsMissions.fraisCumules > 0
                    ? `${statsMissions.fraisCumules.toLocaleString("fr-FR")} FCFA`
                    : "0 FCFA"}
                </p>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Per diem, hébergement et transports
                </span>
              </div>
            </div>
          </div>

          {/* Accès rapide aux types de missions */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
              Nouvelle activité terrain
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/absences/nouvelle?type=MISSION_DEPLACEMENT"
                className="bg-white border border-slate-200 hover:border-[#F0822A] p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-6 h-0.5 bg-[#F0822A] mb-3" />
                  <span className="text-xs font-bold text-slate-900 block">Ordre de Mission & Déplacement</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                    Déplacement province, international ou séminaire client • Validation budgétaire
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F0822A] mt-4">
                  <span>Déclarer la mission</span>
                  <ArrowRightSvg />
                </div>
              </Link>

              <Link
                href="/absences/nouvelle?type=INTERVENTION_TERRAIN"
                className="bg-white border border-slate-200 hover:border-slate-400 p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-6 h-0.5 bg-slate-600 mb-3" />
                  <span className="text-xs font-bold text-slate-900 block">Intervention Technique sur Site</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                    Installation, datacenter, maintenance client ou astreinte
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mt-4">
                  <span>Planifier l&apos;intervention</span>
                  <ArrowRightSvg />
                </div>
              </Link>
            </div>
          </div>

          {/* Missions en cours */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Ordres de mission en cours de validation ({enCoursMissions.length})
              </span>
              <Link href="/absences/demandes" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Historique complet →
              </Link>
            </div>

            {enCoursMissions.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
                <p className="font-bold text-slate-700 text-sm">Aucun ordre de mission en cours</p>
                <p className="mt-1">Tous vos déplacements ont été validés par le N+1 et la Finance.</p>
              </div>
            ) : (
              enCoursMissions.map((d) => {
                const motif = d.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;

                return (
                  <div key={d.id} className="bg-white border border-slate-200 p-5 flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{d.libelleType}</span>
                          <span className="text-xs font-mono text-slate-400">({d.codeReference})</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                            Frais prévisionnels : {d.fraisPrevisionnels ? `${d.fraisPrevisionnels.toLocaleString("fr-FR")} FCFA` : "Prise en charge directe"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Période : <strong>Du {fr(d.dateDebut)} au {fr(d.dateFin)}</strong> · {d.nombreJoursOuvres} jour(s)
                          {d.destination && <span> · Destination : <strong>{d.destination}</strong></span>}
                        </p>
                      </div>

                      {d.statut === "RETOURNEE_EMPLOYE" && (
                        <Link
                          href={`/absences/nouvelle?edit=${d.id}`}
                          className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 transition-colors"
                        >
                          Corriger le dossier
                        </Link>
                      )}
                    </div>

                    <DemandeWorkflowStepper demande={d} />

                    {motif && d.statut === "RETOURNEE_EMPLOYE" && (
                      <div className="text-xs text-red-900 bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                        <span className="font-bold text-red-600 shrink-0">Observation :</span>
                        <span className="italic">&ldquo;{motif}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          {/* Ordre de mission validé */}
          {approuveesMissions.length > 0 && (
            <div className="bg-white border border-slate-200 border-l-4 border-l-slate-800 p-4 flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Ordre de Mission (ODM) signé : {approuveesMissions[0].libelleType} ({approuveesMissions[0].codeReference})
                </p>
                <p className="text-slate-500 text-xs mt-0.5 m-0">
                  Validé par la Direction Générale et visé par la Finance. Votre ordre de mission officiel est scellé.
                </p>
              </div>
              <Link
                href="/absences/registre"
                className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 font-bold text-slate-800 transition-colors whitespace-nowrap shadow-2xs"
              >
                Télécharger l&apos;ODM (PDF)
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
