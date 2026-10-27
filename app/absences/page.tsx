// ============================================================
// app/absences/page.tsx
// Tableau de bord personnel du salarié — Agilly RHEVAL
// Séparation claire : 🏖️ Congés & Permissions (Impact Solde) vs 💼 Missions & Interventions (Impact Financier)
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";
import { DemandeRHItem } from "@/types/absences.types";

const fr = (iso: string) => iso.split("T")[0].split("-").reverse().join("/");

// Helper de classification par univers
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

  // Demandes en cours selon l'onglet actif
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

  // Demandes validées prêtes (titre ou ordre de mission disponible)
  const approuveesConges = useMemo(
    () => demandesConges.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)),
    [demandesConges]
  );

  const approuveesMissions = useMemo(
    () => demandesMissions.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)),
    [demandesMissions]
  );

  // Statistiques financières des missions
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
      {/* ── 1. EN-TÊTE PRINCIPAL HARMONISÉ ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A] shadow-xs" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Tableau de bord
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bonjour <strong>{currentPersona.prenom} {currentPersona.nom}</strong> • Suivi en temps réel de vos congés, permissions et déplacements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/absences/planning"
            className="text-xs font-bold text-slate-700 hover:text-[#C25E00] border border-slate-300 hover:border-[#F0822A] px-3.5 py-2 bg-white transition-all shadow-2xs"
          >
            Planning d&apos;équipe
          </Link>
          <Link
            href={activeTab === "CONGES" ? "/absences/nouvelle?type=CONGES_ANNUELS" : "/absences/nouvelle?type=MISSION_DEPLACEMENT"}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F0822A] to-[#D96F1D] hover:from-[#D96F1D] hover:to-[#B95914] text-white font-black text-xs py-2 px-4 transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
          >
            <span>{activeTab === "CONGES" ? "+ Nouveau congé / permission" : "+ Nouvelle mission / intervention"}</span>
          </Link>
        </div>
      </div>

      {/* ── 2. COMMUTATEUR D'UNIVERS : CONGÉS (SOLDE) VS MISSIONS (FINANCIER) ── */}
      <div className="bg-white border border-slate-200 p-1.5 flex flex-col sm:flex-row gap-2 shadow-2xs">
        <button
          onClick={() => setActiveTab("CONGES")}
          type="button"
          className={`flex-1 py-3 px-4 text-left transition-all flex items-center justify-between border ${
            activeTab === "CONGES"
              ? "bg-gradient-to-r from-orange-50/80 to-white border-[#F0822A] shadow-xs"
              : "bg-white border-transparent hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏖️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider ${activeTab === "CONGES" ? "text-[#C25E00]" : "text-slate-800"}`}>
                  Congés & Permissions
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Impact Solde
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 m-0">
                Congés payés, permissions exceptionnelles (10 j), maladie, maternité
              </p>
            </div>
          </div>
          {enCoursConges.length > 0 && (
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#F0822A] text-white shrink-0">
              {enCoursConges.length} en cours
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("MISSIONS")}
          type="button"
          className={`flex-1 py-3 px-4 text-left transition-all flex items-center justify-between border ${
            activeTab === "MISSIONS"
              ? "bg-gradient-to-r from-purple-50/80 to-white border-purple-600 shadow-xs"
              : "bg-white border-transparent hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💼</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider ${activeTab === "MISSIONS" ? "text-purple-700" : "text-slate-800"}`}>
                  Missions & Déplacements
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  Impact Financier
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 m-0">
                Missions clients, interventions terrain, per diem, avance & Ordre de Mission
              </p>
            </div>
          </div>
          {enCoursMissions.length > 0 && (
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-600 text-white shrink-0">
              {enCoursMissions.length} en cours
            </span>
          )}
        </button>
      </div>

      {/* ── 3A. CONTENU ONGLET 1 : CONGÉS & PERMISSIONS ── */}
      {activeTab === "CONGES" && (
        <div className="flex flex-col gap-6">
          {/* Bannière explicative de règle de solde */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 flex items-start gap-3 text-xs">
            <span className="text-emerald-700 text-base shrink-0">⚖️</span>
            <div>
              <span className="font-bold text-emerald-900 block">Règle de gestion des soldes :</span>
              <p className="text-emerald-800 mt-0.5 leading-relaxed m-0">
                Seul le <strong>Congé Annuel</strong> décompte votre solde de congés (30 jours). Les <strong>Permissions Familiales</strong> (mariage, naissance, décès) relèvent de votre quota annuel légal de 10 jours et <strong>ne diminuent pas votre solde annuel</strong>.
              </p>
            </div>
          </div>

          {/* Cartes d'accès rapide Congés */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#C25E00] block mb-2 px-1">
              Poser un congé ou une permission
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/absences/nouvelle?type=CONGES_ANNUELS"
                className="bg-gradient-to-br from-orange-50/70 to-white border-2 border-orange-200 hover:border-[#F0822A] p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-1.5 h-6 bg-[#F0822A]" />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-orange-100 text-[#C25E00] border border-orange-200">
                      Déduit du Solde
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">Congés Annuels</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Repos légal rémunéré</span>
                </div>
                <span className="text-[11px] font-bold text-[#C25E00] mt-3 group-hover:translate-x-1 transition-transform inline-block">
                  Poser →
                </span>
              </Link>

              <Link
                href="/absences/nouvelle?type=PERMISSION_FAMILIALE"
                className="bg-white border border-slate-200 hover:border-[#D96F1D] p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-1.5 h-6 bg-[#D96F1D]" />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Quota 10 j (Non déduit)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">Permission Exceptionnelle</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Mariage, naissance, décès</span>
                </div>
                <span className="text-[11px] font-semibold text-[#D96F1D] mt-3 group-hover:translate-x-0.5 transition-transform inline-block">
                  Demander →
                </span>
              </Link>

              <Link
                href="/absences/nouvelle?type=CONGES_MALADIE"
                className="bg-white border border-slate-200 hover:border-emerald-600 p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-1.5 h-6 bg-emerald-600" />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                      Arrêt Maladie
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">Maladie & Repos</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Certificat médical requis</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 mt-3 group-hover:translate-x-0.5 transition-transform inline-block">
                  Transmettre →
                </span>
              </Link>
            </div>
          </div>

          {/* Résumé des soldes du salarié */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Mes soldes disponibles (Ressources Humaines)
              </span>
              <Link href="/absences/soldes" className="text-xs font-semibold text-[#D96F1D] hover:underline">
                Voir le relevé détaillé →
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 divide-x divide-slate-100 text-xs animate-pulse">
                <div className="px-3 first:pl-0 space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded-sm" />
                  <div className="h-7 w-16 bg-slate-300 rounded-sm" />
                </div>
                <div className="px-3 space-y-2">
                  <div className="h-3 w-28 bg-slate-200 rounded-sm" />
                  <div className="h-7 w-16 bg-slate-300 rounded-sm" />
                </div>
                <div className="px-3 space-y-2">
                  <div className="h-3 w-24 bg-slate-200 rounded-sm" />
                  <div className="h-7 w-16 bg-slate-300 rounded-sm" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 divide-x divide-slate-100 text-xs">
                <div className="px-3 first:pl-0">
                  <span className="text-[10px] text-[#C25E00] block uppercase font-bold">Solde Congés Payés</span>
                  <p className="text-3xl font-black text-[#F0822A] mt-0.5 font-mono tracking-tight">
                    {soldeConges.joursRestants} <span className="text-xs font-semibold text-slate-500">j</span>
                  </p>
                  <span className="text-[10px] text-slate-400">{soldeConges.joursPris} j pris sur {soldeConges.joursAcquis} j acquis</span>
                </div>

                <div className="px-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Permissions Légales (10 j)</span>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
                    {soldeConges.repartition.permissionsAnnuelles.solde} <span className="text-xs font-normal text-slate-500">j</span>
                  </p>
                  <span className="text-[10px] text-slate-400">Quota restant sur l&apos;année</span>
                </div>

                <div className="px-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Récupérations & Astreintes</span>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
                    {soldeConges.repartition.recuperations.solde} <span className="text-xs font-normal text-slate-500">j</span>
                  </p>
                  <span className="text-[10px] text-slate-400">Heures sup compensées</span>
                </div>
              </div>
            )}
          </div>

          {/* Demandes de Congés en cours */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Suivi de mes congés & permissions en cours ({enCoursConges.length})
              </span>
              <Link href="/absences/demandes" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Consulter toutes mes demandes &rarr;
              </Link>
            </div>

            {enCoursConges.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
                <p className="font-bold text-slate-700 text-sm">Aucun congé ou permission en cours de circuit</p>
                <p className="mt-1">Vous n&apos;avez aucune demande en attente de visa chez votre N+1 ou à la DRH.</p>
              </div>
            ) : (
              enCoursConges.map((d) => {
                const motif = d.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;
                const deduct = isCongeAnnuelItem(d);

                return (
                  <div key={d.id} className="bg-white border border-slate-200 p-5 flex flex-col gap-3.5 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{d.libelleType}</span>
                          <span className="text-xs font-mono text-slate-500">({d.codeReference})</span>
                          {deduct ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-[#C25E00] border border-orange-200">
                              ⚖️ Décompte solde : -{d.nombreJoursOuvres} j
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ⚖️ Solde CP préservé (Quota légal)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Période : <strong>Du {fr(d.dateDebut)} au {fr(d.dateFin)}</strong> · {d.nombreJoursOuvres} jour(s)
                        </p>
                      </div>

                      {d.statut === "RETOURNEE_EMPLOYE" && (
                        <Link
                          href={`/absences/nouvelle?edit=${d.id}`}
                          className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 transition-colors"
                        >
                          Corriger & Renvoyer
                        </Link>
                      )}
                    </div>

                    <DemandeWorkflowStepper demande={d} />

                    {motif && d.statut === "RETOURNEE_EMPLOYE" && (
                      <div className="text-xs text-red-900 bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                        <span className="font-bold text-red-600 shrink-0">Motif de retour :</span>
                        <span className="italic">&ldquo;{motif}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          {/* Titre de congé approuvé */}
          {approuveesConges.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950 text-sm">
                    Titre d&apos;absence disponible : {approuveesConges[0].libelleType} ({approuveesConges[0].codeReference})
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5 m-0">
                    Validé et scellé. Votre autorisation officielle est prête à être téléchargée.
                  </p>
                </div>
              </div>
              <Link
                href="/absences/registre"
                className="px-3.5 py-2 bg-white border border-emerald-300 font-bold text-emerald-900 hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-2xs"
              >
                Télécharger le Titre PDF
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── 3B. CONTENU ONGLET 2 : MISSIONS & INTERVENTIONS ── */}
      {activeTab === "MISSIONS" && (
        <div className="flex flex-col gap-6">
          {/* Bannière explicative d'impact financier */}
          <div className="bg-purple-50/70 border border-purple-200 p-4 flex items-start gap-3 text-xs">
            <span className="text-purple-700 text-base shrink-0">💼</span>
            <div>
              <span className="font-bold text-purple-950 block">Temps de travail commandé & Impact Financier :</span>
              <p className="text-purple-900 mt-0.5 leading-relaxed m-0">
                Les missions et interventions sont du <strong>temps de travail effectif</strong> (aucun décompte sur vos congés). Tout déplacement implique une validation budgétaire (Finance) pour vos <strong>indemnités / per diem et avances</strong>, et aboutit à l&apos;émission d&apos;un <strong>Ordre de Mission (ODM)</strong> officiel signé par la Direction.
              </p>
            </div>
          </div>

          {/* Cartes d'accès rapide Missions */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-2 px-1">
              Déclarer une mission ou intervention client
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/absences/nouvelle?type=MISSION_DEPLACEMENT"
                className="bg-gradient-to-br from-purple-50/70 to-white border-2 border-purple-200 hover:border-purple-600 p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-1.5 h-6 bg-purple-600" />
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200">
                      Ordre de Mission (ODM)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">Mission & Déplacement</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Déplacement province, international ou séminaire client
                  </span>
                </div>
                <span className="text-[11px] font-bold text-purple-700 mt-3 group-hover:translate-x-1 transition-transform inline-block">
                  Déclarer la mission →
                </span>
              </Link>

              <Link
                href="/absences/nouvelle?type=INTERVENTION_TERRAIN"
                className="bg-white border border-slate-200 hover:border-amber-600 p-4 transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-1.5 h-6 bg-amber-600" />
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200">
                      Terrain / Astreinte
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block">Intervention Terrain</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Intervention technique sur site client ou support d&apos;urgence
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 mt-3 group-hover:translate-x-0.5 transition-transform inline-block">
                  Planifier l&apos;intervention →
                </span>
              </Link>
            </div>
          </div>

          {/* KPIs Financiers & Terrain des missions */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Indicateurs Missions & Engagements Financiers
            </span>
            <div className="grid grid-cols-3 divide-x divide-slate-100 text-xs">
              <div className="px-3 first:pl-0">
                <span className="text-[10px] text-purple-700 block uppercase font-bold">Missions Réalisées</span>
                <p className="text-3xl font-black text-purple-900 mt-0.5 font-mono tracking-tight">
                  {statsMissions.totalMissions}
                </p>
                <span className="text-[10px] text-slate-400">Total dossiers enregistrés</span>
              </div>

              <div className="px-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Jours sur le Terrain</span>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
                  {statsMissions.joursTerrain} <span className="text-xs font-normal text-slate-500">j</span>
                </p>
                <span className="text-[10px] text-emerald-600 font-bold">0 j déduit de vos congés</span>
              </div>

              <div className="px-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Frais / Avances Engagés</span>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">
                  {statsMissions.fraisCumules > 0
                    ? `${statsMissions.fraisCumules.toLocaleString("fr-FR")} F`
                    : "0 FCFA"}
                </p>
                <span className="text-[10px] text-slate-400">Per diem, transport & hôtel</span>
              </div>
            </div>
          </div>

          {/* Missions en cours de circuit */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Missions & déplacements en cours de traitement ({enCoursMissions.length})
              </span>
              <Link href="/absences/demandes" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Consulter l&apos;historique &rarr;
              </Link>
            </div>

            {enCoursMissions.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
                <p className="font-bold text-slate-700 text-sm">Aucune mission en cours de validation</p>
                <p className="mt-1">Toutes vos missions ont été traitées ou vous n&apos;avez aucun déplacement en attente de validation financière/direction.</p>
              </div>
            ) : (
              enCoursMissions.map((d) => {
                const motif = d.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;

                return (
                  <div key={d.id} className="bg-white border border-purple-200 border-l-4 border-l-purple-600 p-5 flex flex-col gap-3.5 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{d.libelleType}</span>
                          <span className="text-xs font-mono text-slate-500">({d.codeReference})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 border border-red-200">
                            💰 Impact Financier : {d.fraisPrevisionnels ? `${d.fraisPrevisionnels.toLocaleString("fr-FR")} FCFA` : "Prise en charge entreprise"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                            ⚖️ Solde CP : 0 j (Temps de travail)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Période : <strong>Du {fr(d.dateDebut)} au {fr(d.dateFin)}</strong> · {d.nombreJoursOuvres} jour(s) de mission
                          {d.destination && <span> · Destination : <strong>{d.destination}</strong></span>}
                        </p>
                      </div>

                      {d.statut === "RETOURNEE_EMPLOYE" && (
                        <Link
                          href={`/absences/nouvelle?edit=${d.id}`}
                          className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 transition-colors"
                        >
                          Corriger & Renvoyer
                        </Link>
                      )}
                    </div>

                    <DemandeWorkflowStepper demande={d} />

                    {motif && d.statut === "RETOURNEE_EMPLOYE" && (
                      <div className="text-xs text-red-900 bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                        <span className="font-bold text-red-600 shrink-0">Motif de retour :</span>
                        <span className="italic">&ldquo;{motif}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          {/* Ordre de mission prêt au téléchargement */}
          {approuveesMissions.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 p-5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                <div>
                  <p className="font-bold text-purple-950 text-sm">
                    Ordre de Mission (ODM) disponible : {approuveesMissions[0].libelleType} ({approuveesMissions[0].codeReference})
                  </p>
                  <p className="text-purple-800 text-[11px] mt-0.5 m-0">
                    Signé par la Direction Générale et visé par la Finance. Votre document légal de déplacement est prêt.
                  </p>
                </div>
              </div>
              <Link
                href="/absences/registre"
                className="px-3.5 py-2 bg-white border border-purple-300 font-bold text-purple-900 hover:bg-purple-100 transition-colors whitespace-nowrap shadow-2xs"
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
