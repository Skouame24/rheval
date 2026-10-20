// ============================================================
// features/absences/components/ArchivesGedView.tsx
// Module de gestion électronique des documents (GED) — Clean Design
// ============================================================

"use client";

import { useState } from "react";
import { DemandeRHItem } from "@/types/absences.types";

interface ArchivesGedViewProps {
  demandes: DemandeRHItem[];
  onOpenPermission: (demande: DemandeRHItem) => void;
}

export function ArchivesGedView({ demandes, onOpenPermission }: ArchivesGedViewProps) {
  const [searchGed, setSearchGed] = useState("");

  const archivedDemandes = demandes.filter(
    (d) => d.documentPermission || d.statut === "ARCHIVEE" || d.statut === "PERMISSION_EDITEE"
  );

  const filtered = archivedDemandes.filter((d) => {
    if (!searchGed.trim()) return true;
    const q = searchGed.toLowerCase();
    const matchNum = d.documentPermission?.numeroUnique.toLowerCase().includes(q);
    const matchNom = `${d.demandeur.prenom} ${d.demandeur.nom}`.toLowerCase().includes(q);
    const matchMatricule = d.demandeur.matricule.toLowerCase().includes(q);
    const matchType = d.libelleType.toLowerCase().includes(q);
    return matchNum || matchNom || matchMatricule || matchType;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs font-sans">
      
      {/* EN-TÊTE ÉPURÉ */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 m-0">
            Archives des permissions certifiées (GED RH)
          </h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Documents avec numéro unique, durée de rétention légale de 5 ans et empreinte SHA-256
          </p>
        </div>

        {/* RECHERCHE */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher n° unique, nom, matricule..."
            value={searchGed}
            onChange={(e) => setSearchGed(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-8 pr-3 outline-none w-64 md:w-80 focus:border-[#F0822A] focus:ring-2 focus:ring-orange-100 transition-all"
          />
          <svg
            className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>

      {/* TABLEAU DES ARCHIVES */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500 font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">N° Unique</th>
              <th className="py-3.5 px-4">Collaborateur</th>
              <th className="py-3.5 px-4">Nature & Période</th>
              <th className="py-3.5 px-4">Émis par</th>
              <th className="py-3.5 px-4">Intégrité SHA-256</th>
              <th className="py-3.5 px-4">Conservation</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                  Aucun document archivé ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-[#EA580C]">
                    {d.documentPermission?.numeroUnique || "AGY-PERM-2026-XXXX"}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 m-0">
                      {d.demandeur.prenom} {d.demandeur.nom}
                    </p>
                    <p className="text-[11px] text-slate-400 m-0">{d.demandeur.service}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-800 m-0">{d.libelleType}</p>
                    <p className="text-[11px] text-slate-400 m-0">
                      {new Date(d.dateDebut).toLocaleDateString("fr-FR")} — {new Date(d.dateFin).toLocaleDateString("fr-FR")} ({d.nombreJoursOuvres}j)
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-slate-900 m-0">
                      {d.documentPermission?.emetteurAgentNom || "Aïcha DIARRA"}
                    </p>
                    <p className="text-[10px] text-slate-400 m-0">
                      {d.documentPermission?.dateEmission
                        ? new Date(d.documentPermission.dateEmission).toLocaleDateString("fr-FR")
                        : "2026-08-25"}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-[10px] font-mono text-slate-400">
                    {d.documentPermission?.hashSha256
                      ? `${d.documentPermission.hashSha256.substring(0, 14)}...`
                      : "e3b0c442..."}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-full">
                      5 ans (2031)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenPermission(d)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      Voir PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
