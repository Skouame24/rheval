// ============================================================
// app/absences/page.tsx
// Tableau de bord officiel Agilly Absences & Missions
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { AbsencesTrendAreaChart } from "@/features/absences/components/charts/AbsencesTrendAreaChart";
import { AbsencesTypeDonutChart } from "@/features/absences/components/charts/AbsencesTypeDonutChart";
import { StatutDemandeRH } from "@/types/absences.types";

export default function AbsencesDashboardPage() {
  const {
    currentPersona,
    demandes,
    soldeConges,
    kpis,
    pendingValidationsCount,
    pendingForCurrentRoleDemandes,
  } = useAbsences();

  // 4 étapes du circuit de validation séquentiel
  const getWorkflowStep = (statut: StatutDemandeRH) => {
    switch (statut) {
      case "SOUMISE":
      case "EN_VALIDATION_N1":
        return 1;
      case "EN_VALIDATION_DRH":
        return 2;
      case "EN_VALIDATION_DG":
        return 3;
      case "APPROUVEE":
      case "PERMISSION_EDITEE":
      case "ARCHIVEE":
        return 4;
      default:
        return 1;
    }
  };

  const getStatusBadge = (statut: StatutDemandeRH) => {
    switch (statut) {
      case "EN_VALIDATION_N1":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Attente N+1
          </span>
        );
      case "EN_VALIDATION_DRH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Contrôle DRH
          </span>
        );
      case "EN_VALIDATION_DG":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 border border-purple-200">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            Arbitrage DG
          </span>
        );
      case "APPROUVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Approuvée
          </span>
        );
      case "PERMISSION_EDITEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F0822A] bg-[#FFF4EB] px-2 py-0.5 border border-[#FDE3CC]">
            <span className="w-1.5 h-1.5 bg-[#F0822A] rounded-full" />
            Permission émise
          </span>
        );
      case "ARCHIVEE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-200">
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
            Archivée GED
          </span>
        );
      case "RETOURNEE_EMPLOYE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 border border-red-200">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            À réviser
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 border border-slate-200">
            {statut}
          </span>
        );
    }
  };

  // Liste des demandes à afficher en priorité
  const prioritizedDemandes =
    pendingForCurrentRoleDemandes.length > 0
      ? pendingForCurrentRoleDemandes.slice(0, 4)
      : demandes.slice(0, 4);

  // Prochaines absences au sein de l'équipe (données de synthèse)
  const upcomingTeamAbsences = [
    {
      nom: "KOUAME Ebenezer Samuel",
      poste: "DSI / Resp. Applicatif",
      dates: "03 Nov - 06 Nov 2026",
      type: "Congés Annuels",
      jours: "4 j",
    },
    {
      nom: "KOUASSI Marc",
      poste: "Ingénieur Cloud & DevOps",
      dates: "28 Oct - 30 Oct 2026",
      type: "Mission Déplacement",
      jours: "3 j",
    },
    {
      nom: "KONE Aminata",
      poste: "Analyste Fonctionnelle",
      dates: "12 Nov - 13 Nov 2026",
      type: "Permission Exceptionnelle",
      jours: "2 j",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. EN-TÊTE CADRE DU TABLEAU DE BORD ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Bonjour, {currentPersona.prenom} {currentPersona.nom}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
              {currentPersona.labelRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mardi 20 octobre 2026 • Département {currentPersona.departement} • Pôle{" "}
            {currentPersona.service}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/absences/soldes"
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
          >
            Consulter mes soldes
          </Link>
          <Link
            href="/absences/nouvelle"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#F0822A] hover:bg-[#D96F1D] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* ── 2. BANDEAU DE 4 INDICATEURS EN BANDE (STYLE IBM CARBON) ── */}
      <div className="bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        {/* KPI 1 : Solde Congés Payés */}
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Solde Congés Payés
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-400">
              Sur {soldeConges.joursAcquis} j acquis
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {soldeConges.joursRestants}
              </span>
              <span className="text-xs font-bold text-slate-500">jours restants</span>
            </div>
            {/* Jauge fine segmentée */}
            <div className="w-full h-1.5 bg-slate-100 mt-2.5 flex overflow-hidden">
              <div
                className="bg-slate-400 h-full"
                style={{ width: `${(soldeConges.joursPris / soldeConges.joursAcquis) * 100}%` }}
                title={`${soldeConges.joursPris} j pris`}
              />
              <div
                className="bg-[#F0822A] h-full"
                style={{
                  width: `${(soldeConges.joursEnAttente / soldeConges.joursAcquis) * 100}%`,
                }}
                title={`${soldeConges.joursEnAttente} j en attente`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>{soldeConges.joursPris} j consommés</span>
            <span className="text-[#F0822A] font-medium">{soldeConges.joursEnAttente} j posés</span>
          </div>
        </div>

        {/* KPI 2 : Demandes en cours pour le collaborateur */}
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mes demandes actives
            </span>
            <span className="text-[11px] font-medium text-slate-400">Circuit en direct</span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                2
              </span>
              <span className="text-xs font-bold text-slate-500">en validation</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Prochaine décision attendue :{" "}
              <span className="font-semibold text-slate-900">Supérieur N+1</span>
            </p>
          </div>
          <div className="flex items-center text-[11px] text-slate-500 pt-1">
            <span className="text-emerald-700 font-medium">1 demande déjà approuvée ce mois</span>
          </div>
        </div>

        {/* KPI 3 : File d'attente d'arbitrage (Adaptée au rôle) */}
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              À valider (Mon rôle)
            </span>
            <span className="text-[11px] font-mono text-slate-400">SLA 48h</span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-extrabold font-mono tracking-tight tabular-nums ${
                  pendingValidationsCount > 0 ? "text-[#F0822A]" : "text-slate-900"
                }`}
              >
                {pendingValidationsCount}
              </span>
              <span className="text-xs font-bold text-slate-500">dossiers en attente</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Délai moyen de réponse :{" "}
              <span className="font-semibold text-slate-900 font-mono">{kpis.delaiMoyenHeures}h</span>
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-500">Taux de refus : {kpis.tauxRefusPourcent}%</span>
            {pendingValidationsCount > 0 && (
              <Link href="/absences/validations" className="text-[#F0822A] font-bold hover:underline">
                Traiter &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* KPI 4 : Taux de présence & Quorum de service (RG-04) */}
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Présence Pôle DSI
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-200">
              Quorum OK (&gt;50%)
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                85.7%
              </span>
              <span className="text-xs font-bold text-slate-500">présents aujourd&apos;hui</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              12 présents sur un effectif de{" "}
              <span className="font-semibold text-slate-900">14 collaborateurs</span>
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>2 personnes en congé / mission</span>
            <Link href="/absences/planning" className="text-slate-700 font-medium hover:text-slate-900">
              Voir Gantt &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. VISUALISATIONS GRAPHIQUES (COURBE D'AIRE 12 MOIS + DONUT PAR TYPE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Courbe d'aire sur 12 mois (Exercice N vs N-1) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Consommation mensuelle des absences (Jours ouvrés)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparaison sur 12 mois glissants : Exercice 2026 (orange) vs Exercice 2025 (pointillés)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-[#F0822A]" />
                <span className="text-slate-700 font-medium">2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
                <span className="text-slate-500">2025</span>
              </div>
            </div>
          </div>

          <AbsencesTrendAreaChart />

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pic annuel constaté en Août (période de congés groupés d&apos;été).</span>
            <span className="font-mono font-medium text-slate-700">Total cumulé 2026 : 38,0 j</span>
          </div>
        </div>

        {/* Répartition par nature d'absence (Donut Recharts) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 flex flex-col justify-between">
          <div className="mb-3 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Répartition par nature
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              48 demandes enregistrées sur l&apos;exercice
            </p>
          </div>

          <AbsencesTypeDonutChart />

          <div className="mt-3 pt-2 text-[11px] text-slate-400 text-center">
            Les congés annuels représentent la majorité des volumes traités (50%).
          </div>
        </div>
      </div>

      {/* ── 4. ACTIONS REQUISES ET PLANNING IMMÉDIAT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Demandes prioritaires & suivi du circuit */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {pendingForCurrentRoleDemandes.length > 0
                  ? "Dossiers nécessitant votre décision"
                  : "Dernières demandes du service"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Circuit à 3 niveaux : N+1 &rarr; DRH &rarr; Direction Générale &rarr; GED
              </p>
            </div>
            <Link
              href={pendingForCurrentRoleDemandes.length > 0 ? "/absences/validations" : "/absences/demandes"}
              className="text-xs font-semibold text-[#F0822A] hover:underline"
            >
              Voir la liste complète &rarr;
            </Link>
          </div>

          {/* Tableau dense d'arbitrage */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Référence & Collaborateur</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Période</th>
                  <th className="py-2.5 px-3">Progression Circuit</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {prioritizedDemandes.map((item) => {
                  const step = getWorkflowStep(item.statut);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900">
                            {item.codeReference}
                          </span>
                          <span className="text-slate-600 font-medium">
                            {item.demandeur.prenom} {item.demandeur.nom}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Matr. {item.demandeur.matricule} • {item.demandeur.departement}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{item.libelleType}</span>
                        {item.destination && (
                          <span className="block text-[10px] text-slate-500">
                            Destination : {item.destination}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-900 font-medium">
                            {item.nombreJoursOuvres} j ouvrés
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Du {item.dateDebut.split("-").reverse().join("/")} au{" "}
                            {item.dateFin.split("-").reverse().join("/")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {/* Mini frise de progression à 4 points */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4].map((s) => (
                              <div
                                key={s}
                                className={`h-1.5 flex-1 ${
                                  s < step
                                    ? "bg-slate-700"
                                    : s === step
                                    ? "bg-[#F0822A]"
                                    : "bg-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {step === 1 && "Étape 1/4 : Supérieur N+1"}
                            {step === 2 && "Étape 2/4 : Contrôle DRH"}
                            {step === 3 && "Étape 3/4 : Direction Générale"}
                            {step === 4 && "Étape 4/4 : Document prêt / Archivé"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {getStatusBadge(item.statut)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Colonne droite : Absences à venir dans les 7 jours */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Absences à venir (7 jours)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Pôle DSI & Infrastructure</p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                Semaine 43
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {upcomingTeamAbsences.map((abs, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-slate-100 bg-slate-50/50 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{abs.nom}</p>
                      <p className="text-[10px] text-slate-500">{abs.poste}</p>
                    </div>
                    <span className="text-[11px] font-bold font-mono text-slate-900 bg-white px-1.5 py-0.5 border border-slate-200">
                      {abs.jours}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/50">
                    <span className="text-[#F0822A] font-medium">{abs.type}</span>
                    <span className="font-mono text-slate-500">{abs.dates}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Besoin d&apos;anticiper les plannings ?</span>
            <Link
              href="/absences/planning"
              className="text-xs font-semibold text-slate-900 hover:text-[#F0822A] transition-colors"
            >
              Consulter le Gantt &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
