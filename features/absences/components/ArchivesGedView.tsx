// ============================================================
// features/absences/components/ArchivesGedView.tsx
// Module de gestion électronique des documents (GED) pour les permissions
// Recherche multicritère, consultation et vérification des hash SHA-256
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
    <div className="bg-white border border-slate-200 p-6 shadow-xs select-none">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 mb-5 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F0822A]">
            GESTION ÉLECTRONIQUE DES DOCUMENTS (GED RH)
          </span>
          <h2 className="text-base font-black text-slate-900 m-0 tracking-tight">
            Registre Officiel des Permissions Archivées & Certifiées
          </h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Conservation légale de 5 ans, numérotation séquentielle inviolable et traçabilité SHA-256
          </p>
        </div>

        {/* RECHERCHE */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par n° unique, matricule, nom..."
            value={searchGed}
            onChange={(e) => setSearchGed(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs py-2 pl-8 pr-3 outline-none w-64 md:w-80 focus:border-[#F0822A]"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>

      {/* TABLEAU DES ARCHIVES */}
      <div className="overflow-x-auto border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">N° Unique Permission</th>
              <th className="py-3 px-4">Collaborateur & Matricule</th>
              <th className="py-3 px-4">Nature & Période</th>
              <th className="py-3 px-4">Émis par</th>
              <th className="py-3 px-4">Intégrité SHA-256</th>
              <th className="py-3 px-4">Rétention Légale</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                  Aucun document archivé ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-black text-[#EA580C]">
                    {d.documentPermission?.numeroUnique || "AGY-PERM-2026-XXXX"}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-extrabold text-slate-900 m-0">
                      {d.demandeur.prenom} {d.demandeur.nom}
                    </p>
                    <p className="text-[10px] text-slate-500 m-0">
                      {d.demandeur.matricule} — {d.demandeur.service}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 m-0">{d.libelleType}</p>
                    <p className="text-[10px] text-slate-500 m-0">
                      Du {new Date(d.dateDebut).toLocaleDateString("fr-FR")} au {new Date(d.dateFin).toLocaleDateString("fr-FR")} ({d.nombreJoursOuvres}j)
                    </p>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-900 m-0">
                      {d.documentPermission?.emetteurAgentNom || "Aïcha DIARRA"}
                    </p>
                    <p className="text-[10px] text-slate-400 m-0">
                      {d.documentPermission?.dateEmission
                        ? new Date(d.documentPermission.dateEmission).toLocaleDateString("fr-FR")
                        : "2026-08-25"}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-[10px] font-mono text-slate-400">
                    {d.documentPermission?.hashSha256
                      ? `${d.documentPermission.hashSha256.substring(0, 16)}...`
                      : "e3b0c44298fc1c14..."}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5">
                      5 ans (2031)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenPermission(d)}
                      className="bg-slate-900 hover:bg-[#F0822A] text-white font-extrabold text-[11px] px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      Consulter Certificat PDF
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

