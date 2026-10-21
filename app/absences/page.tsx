// ============================================================
// app/absences/page.tsx
// Accueil épuré : 1 chiffre clé, 1 bouton, mes demandes en cours avec leur circuit.
// Calqué sur le schéma du processus (Demande → Supérieur → DRH → Direction → Archivage)
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";

const fr = (iso: string) => iso.split("T")[0].split("-").reverse().join("/");

export default function AbsencesDashboardPage() {
  const { currentPersona, myDemandes, soldeConges } = useAbsences();

  const enCours = myDemandes.filter((d) =>
    ["RETOURNEE_EMPLOYE", "EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG", "APPROUVEE"].includes(d.statut)
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-2">
      {/* En-tête : bonjour + solde + action */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Bonjour {currentPersona.prenom.split(" ")[0]}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {soldeConges.joursRestants} <span className="text-base font-medium text-slate-500">jours de congés disponibles</span>
          </p>
        </div>
        <Link
          href="/absences/nouvelle"
          className="bg-[#D96F1D] hover:bg-[#B95914] text-white text-sm font-semibold px-4 py-2.5 transition-colors"
        >
          + Nouvelle demande
        </Link>
      </div>

      {/* Demandes en cours */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Mes demandes en cours</h2>
          <Link href="/absences/demandes" className="text-xs text-slate-500 hover:text-slate-900">
            Tout voir →
          </Link>
        </div>

        {enCours.length === 0 && (
          <div className="bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
            Aucune demande en cours.
          </div>
        )}

        {enCours.map((d) => {
          const motif = d.historique.find((h) => h.decision === "REFUSE_RETOUR")?.motif;
          return (
            <div key={d.id} className="bg-white border border-slate-200 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{d.libelleType}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Du {fr(d.dateDebut)} au {fr(d.dateFin)} · {d.nombreJoursOuvres} j
                  </p>
                </div>
                {d.statut === "RETOURNEE_EMPLOYE" ? (
                  <Link
                    href={`/absences/nouvelle?edit=${d.id}`}
                    className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5"
                  >
                    Corriger
                  </Link>
                ) : d.statut === "APPROUVEE" ? (
                  <span className="text-xs font-semibold text-emerald-700">Approuvée</span>
                ) : null}
              </div>

              <DemandeWorkflowStepper demande={d} />

              {motif && d.statut === "RETOURNEE_EMPLOYE" && (
                <p className="text-xs text-red-800 bg-red-50 border-l-2 border-red-600 px-3 py-2">
                  Motif : {motif}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
