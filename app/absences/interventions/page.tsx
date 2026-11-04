// ============================================================
// app/absences/interventions/page.tsx
// Tableau de bord & Suivi DÉDIÉ aux Fiches d'Intervention Technique
// Rendu Corporate Agilly avec consultation et téléchargement PDF
// ============================================================

"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem } from "@/types/absences.types";
import { OfficialDocumentViewerModal, parseDemandeMotifAndMeta } from "@/features/absences/components/OfficialDocumentViewerModal";

function isIntervention(d: DemandeRHItem): boolean {
  return (
    d.typeDemande === "INTERVENTION_TERRAIN" ||
    d.libelleType?.toLowerCase().includes("intervention") ||
    d.motif?.includes("||INTERVENTION_META:")
  );
}

function InterventionsListPageContent() {
  const { myDemandes, isLoading } = useAbsences();
  const [selectedDemande, setSelectedDemande] = useState<DemandeRHItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const interventions = useMemo(() => {
    return myDemandes
      .filter(isIntervention)
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          m.codeReference.toLowerCase().includes(q) ||
          m.motif.toLowerCase().includes(q) ||
          (m.destination && m.destination.toLowerCase().includes(q))
        );
      });
  }, [myDemandes, searchQuery]);

  const formatDateFr = (isoStr: string) => {
    if (!isoStr) return "-";
    const parts = isoStr.split("T")[0].split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoStr;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE CORPORATE DÉDIÉ INTERVENTIONS TECHNIQUES ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-slate-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-slate-900" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Suivi des Fiches d&apos;Intervention Technique
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Déploiements et interventions techniques en équipe sur site client, suivi des visas et génération de la Fiche Technique A4.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/absences"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 px-3.5 py-2 bg-white transition-all shadow-2xs"
          >
            &larr; Espace Congés
          </Link>
          <Link
            href="/absences/interventions/nouvelle"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 transition-all shadow-2xs active:scale-[0.99]"
          >
            <span>+ Nouvelle Fiche d&apos;Intervention</span>
          </Link>
        </div>
      </div>

      {/* ── BARRE DE RECHERCHE ── */}
      <div className="bg-white border border-slate-200 p-4 flex items-center justify-between text-xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par référence, client ou prestation..."
          className="w-full max-w-sm h-8 px-2.5 bg-slate-50 border border-slate-300 font-medium text-slate-900 focus:border-slate-800 focus:outline-none"
        />
        <span className="font-mono text-slate-500 font-bold">
          {interventions.length} intervention(s) répertoriée(s)
        </span>
      </div>

      {/* ── TABLEAU DES FICHES D'INTERVENTION ── */}
      <div className="bg-white border border-slate-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Chargement des fiches d&apos;intervention...
          </div>
        ) : interventions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-800 text-sm">Aucune intervention enregistrée</p>
            <p className="text-slate-500 mt-1 mb-4">
              Vous n&apos;avez encore planifié aucune intervention technique sur site client.
            </p>
            <Link
              href="/absences/interventions/nouvelle"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2"
            >
              Créer une fiche d&apos;intervention &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-3.5 whitespace-nowrap">Réf. Fiche</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Site Client</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Équipe Technique</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Période</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Tarif Jour</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Statut Workflow</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interventions.map((dem) => {
                  const { cleanMotif, meta } = parseDemandeMotifAndMeta(dem.motif);
                  const isApproved =
                    dem.statut === "APPROUVEE" ||
                    dem.statut === "PERMISSION_EDITEE" ||
                    dem.statut === "ARCHIVEE";

                  return (
                    <tr key={dem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {dem.codeReference}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <span className="block">{meta?.clientSite || dem.destination || "Site Client"}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[240px]" title={cleanMotif}>
                          {cleanMotif}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        {meta?.equipe && meta.equipe.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900">{meta.equipe[0]}</span>
                            {meta.equipe.length > 1 && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                + {meta.equipe.length - 1} autre(s) collaborateur(s)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span>{dem.demandeur.prenom} {dem.demandeur.nom}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        Du {formatDateFr(dem.dateDebut)} au {formatDateFr(dem.dateFin)}
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {dem.nombreJoursOuvres} j ouvré(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {meta?.tarifJour
                          ? `${Number(meta.tarifJour).toLocaleString("fr-FR")} FCFA/j`
                          : "720 000 FCFA/j"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            Validé &amp; Scellé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 border border-amber-300">
                            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                            En cours de validation
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDemande(dem)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Consulter &rarr;
                          </button>
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => setSelectedDemande(dem)}
                              className="px-2.5 py-1.5 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                              title="Télécharger la Fiche d'Intervention A4 en PDF"
                            >
                              Fiche A4
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OfficialDocumentViewerModal
        isOpen={Boolean(selectedDemande)}
        onClose={() => setSelectedDemande(null)}
        demande={selectedDemande}
      />
    </div>
  );
}

export default function InterventionsListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement...</div>}>
      <InterventionsListPageContent />
    </Suspense>
  );
}

