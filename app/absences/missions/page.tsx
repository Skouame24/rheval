// ============================================================
// app/absences/missions/page.tsx
// Tableau de bord & Suivi DÉDIÉ aux Ordres de Mission
// Rendu Corporate Agilly avec consultation et téléchargement PDF
// ============================================================

"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem } from "@/types/absences.types";
import { DemandeWorkflowStepper } from "@/features/absences/components/DemandeWorkflowStepper";
import { OfficialDocumentViewerModal } from "@/features/absences/components/OfficialDocumentViewerModal";

function isOrdreMission(d: DemandeRHItem): boolean {
  if (
    d.typeDemande === "INTERVENTION_TERRAIN" ||
    d.libelleType?.toLowerCase().includes("intervention") ||
    d.motif?.includes("||INTERVENTION_META:")
  ) {
    return false;
  }
  return (
    d.familleDemande === "MISSIONS" ||
    d.typeDemande === "MISSION_DEPLACEMENT" ||
    d.libelleType?.toLowerCase().includes("mission")
  );
}

function MissionsListPageContent() {
  const { myDemandes, isLoading } = useAbsences();
  const [selectedDemande, setSelectedDemande] = useState<DemandeRHItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const missions = useMemo(() => {
    return myDemandes
      .filter(isOrdreMission)
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
      {/* ── EN-TÊTE CORPORATE HARMONISÉ ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Suivi des Ordres de Mission
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Déplacements professionnels enregistrés, état d&apos;avancement des visas et téléchargement de l&apos;Ordre de Mission A4 signé.
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
            href="/absences/missions/nouvelle"
            className="inline-flex items-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs py-2 px-4 transition-all shadow-2xs active:scale-[0.99]"
          >
            <span>+ Nouvel Ordre de Mission</span>
          </Link>
        </div>
      </div>

      {/* ── BARRE DE RECHERCHE ── */}
      <div className="bg-white border border-slate-200 p-4 flex items-center justify-between text-xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par référence, destination ou objet..."
          className="w-full max-w-sm h-8 px-2.5 bg-slate-50 border border-slate-300 font-medium text-slate-900 focus:border-[#F0822A] focus:outline-none"
        />
        <span className="font-mono text-slate-500 font-bold">
          {missions.length} mission(s) répertoriée(s)
        </span>
      </div>

      {/* ── TABLEAU DES ORDRES DE MISSION ── */}
      <div className="bg-white border border-slate-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Chargement des ordres de mission...
          </div>
        ) : missions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <p className="font-bold text-slate-800 text-sm">Aucun ordre de mission enregistré</p>
            <p className="text-slate-500 mt-1 mb-4">
              Vous n&apos;avez encore déposé aucun ordre de mission de déplacement.
            </p>
            <Link
              href="/absences/missions/nouvelle"
              className="inline-block bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs px-4 py-2"
            >
              Créer mon premier ordre de mission &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-3.5 whitespace-nowrap">Réf. ODM</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Missionnaire</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Trajet &amp; Destination</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Période</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Frais Déplacement</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Statut Workflow</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missions.map((dem) => {
                  const isApproved =
                    dem.statut === "APPROUVEE" ||
                    dem.statut === "PERMISSION_EDITEE" ||
                    dem.statut === "ARCHIVEE";

                  return (
                    <tr key={dem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {dem.codeReference}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {dem.demandeur.prenom} {dem.demandeur.nom}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        <span className="font-bold block">{dem.destination || "Côte d'Ivoire"}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[220px]" title={dem.motif}>
                          {dem.motif}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        Du {formatDateFr(dem.dateDebut)} au {formatDateFr(dem.dateFin)}
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {dem.nombreJoursOuvres} j ouvré(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#F0822A] whitespace-nowrap">
                        {dem.fraisPrevisionnels
                          ? `${Number(dem.fraisPrevisionnels).toLocaleString("fr-FR")} FCFA`
                          : "Barème officiel"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            Validé &amp; Signé DG
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
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#F0822A] hover:bg-[#D96F1D] transition-colors cursor-pointer"
                          >
                            Consulter &rarr;
                          </button>
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => setSelectedDemande(dem)}
                              className="px-2.5 py-1.5 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                              title="Télécharger l'Ordre de Mission A4 en PDF"
                            >
                              PDF A4
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

export default function MissionsListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement...</div>}>
      <MissionsListPageContent />
    </Suspense>
  );
}
