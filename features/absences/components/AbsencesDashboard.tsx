// ============================================================
// Tableau de bord personnel Congés ou Missions — Agilly RHEVAL Enterprise
// ============================================================

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";
import { DemandeRHItem } from "@/types/absences.types";
import { isMissionDemande } from "@/features/absences/utils/demandes";

const fr = (iso: string) => iso.split("T")[0].split("-").reverse().join("/");

function ArrowRightSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function isCongeAnnuelItem(d: DemandeRHItem): boolean {
  return (
    d.typeDemande === "CONGES_ANNUELS" ||
    d.libelleType?.toLowerCase().includes("annuel") ||
    d.libelleType?.toLowerCase().includes("payé")
  );
}

export function AbsencesDashboard({ mode }: { mode: "CONGES" | "MISSIONS" }) {
  const { currentPersona, myDemandes, soldeConges, isLoading } = useAbsences();
  // Séparation en deux univers étanches
  const demandesConges = useMemo(() => myDemandes.filter((d) => !isMissionDemande(d)), [myDemandes]);
  const demandesMissions = useMemo(() => myDemandes.filter(isMissionDemande), [myDemandes]);

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
              {mode === "CONGES" ? "Congés & Permissions" : "Missions & Interventions"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bonjour <strong>{currentPersona.prenom} {currentPersona.nom}</strong> •{" "}
            {mode === "CONGES"
              ? "Suivi de vos congés, permissions et soldes."
              : "Suivi de vos missions, interventions et frais associés."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={mode === "MISSIONS" ? "/absences/missions/planning" : "/absences/planning"}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 px-3.5 py-2 bg-white transition-all shadow-2xs"
          >
            Planning d&apos;équipe
          </Link>
          <Link
            href={
              mode === "CONGES"
                ? "/absences/nouvelle?type=CONGES_ANNUELS&univers=CONGES"
                : "/absences/missions/nouvelle?type=MISSION_DEPLACEMENT&univers=MISSIONS"
            }
            className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs py-2 px-4 transition-all shadow-2xs active:scale-[0.99]"
          >
            <span>{mode === "CONGES" ? "+ Nouvelle demande de congé" : "+ Nouvel ordre de mission"}</span>
          </Link>
        </div>
      </div>

      {/* ── 3A. UNIVERS 1 : CONGÉS & PERMISSIONS (IMPACT SOLDE) ── */}
      {mode === "CONGES" && (
        <div className="flex flex-col gap-6">
          {/* Accès rapide aux types de congés */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
              Types de demandes fréquents
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/absences/nouvelle?type=CONGES_ANNUELS&univers=CONGES"
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
                href="/absences/nouvelle?type=PERMISSION_FAMILIALE&univers=CONGES"
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
                href="/absences/nouvelle?type=CONGES_MALADIE&univers=CONGES"
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

          {/* Liste des demandes de congés en cours */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Demandes de congés & permissions en cours ({enCoursConges.length})
              </span>
              <Link href="/absences/demandes?univers=CONGES" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
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
                          href={`/absences/nouvelle?edit=${d.id}&univers=CONGES`}
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
                href="/absences/registre?univers=CONGES"
                className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 font-bold text-slate-800 transition-colors whitespace-nowrap shadow-2xs"
              >
                Télécharger l&apos;autorisation (PDF)
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── 3B. UNIVERS 2 : MISSIONS & INTERVENTIONS (IMPACT FINANCIER) ── */}
      {mode === "MISSIONS" && (
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
                href="/absences/missions/nouvelle?type=MISSION_DEPLACEMENT&univers=MISSIONS"
                className="bg-white border border-slate-200 hover:border-[#F0822A] p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-6 h-0.5 bg-[#F0822A] mb-3" />
                  <span className="text-xs font-bold text-slate-900 block">Ordre de Mission & Intervention</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                    Intervention site client, province ou international • Validation budgétaire
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F0822A] mt-4">
                  <span>Déclarer la mission</span>
                  <ArrowRightSvg />
                </div>
              </Link>

              <Link
                href="/absences/missions/nouvelle?type=INTERVENTION_TERRAIN&univers=MISSIONS"
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
              <Link href="/absences/missions/demandes" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
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
                          <span className="text-xs font-mono text-slate-400">({d.numeroOrdreMission || d.codeReference})</span>
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
                          href={`/absences/missions/nouvelle?edit=${d.id}&univers=MISSIONS`}
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
                  Ordre de Mission (ODM) signé : {approuveesMissions[0].libelleType} ({approuveesMissions[0].numeroOrdreMission || approuveesMissions[0].codeReference})
                </p>
                <p className="text-slate-500 text-xs mt-0.5 m-0">
                  Validé par la Direction Générale et visé par la Finance. Votre ordre de mission officiel est scellé.
                </p>
              </div>
              <Link
                href="/absences/missions/registre"
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

