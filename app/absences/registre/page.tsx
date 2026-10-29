// ============================================================
// app/absences/registre/page.tsx
// Registre Numérique GED & Édition des Bulletins Officiels (EF-20 à EF-24)
// Rendu fidèle au Formulaire Papier/Excel Agilly (Bulletin Individuel)
// Signatures Salarié & Gérant (Christian BAMBA)
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem } from "@/types/absences.types";
import { OfficialDocumentViewerModal } from "@/features/absences/components/OfficialDocumentViewerModal";

export default function RegistreGedPage() {
  const { currentPersona, demandes, editerPermission, archiverDemande } = useAbsences();

  // Recherche multicritère (EF-24)
  const [searchNumero, setSearchNumero] = useState("");
  const [searchCollaborateur, setSearchCollaborateur] = useState("");
  const [filterType, setFilterType] = useState("TOUS");

  // Document officiel sélectionné pour affichage fidèle à l'écran
  const [selectedBulletin, setSelectedBulletin] = useState<DemandeRHItem | null>(null);

  // Éditer le bulletin et ouvrir immédiatement le document certifié à l'écran
  const handleEditerEtOuvrir = (dem: DemandeRHItem) => {
    editerPermission(dem.id);
    const numSeq = dem.codeReference.replace(/\D/g, "").slice(-5) || "00021";
    const isMission =
      dem.familleDemande === "MISSIONS" ||
      dem.typeDemande === "MISSION_DEPLACEMENT" ||
      dem.typeDemande === "INTERVENTION_TERRAIN" ||
      dem.libelleType?.toLowerCase().includes("mission");
    const numUnique = isMission ? `AGY-ODM-2026-${numSeq}` : `AGY-PERM-2026-${numSeq}`;

    setSelectedBulletin({
      ...dem,
      statut: "PERMISSION_EDITEE",
      documentPermission: dem.documentPermission || {
        numeroUnique: numUnique,
        qrCodeUrl: `/api/qr?data=${numUnique}`,
        tokenVerification: `TOK-${Date.now().toString(36).toUpperCase()}`,
        dateEmission: new Date().toISOString(),
        emetteurAgentNom: `${currentPersona.prenom} ${currentPersona.nom}`,
        emetteurAgentMatricule: currentPersona.matricule,
        cachetOfficiel: true,
        signatureElectronique: true,
        hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        dureeConservationAnnees: 10,
        balanceCongesPayesSolde: 24,
      },
    });
  };

  // Demandes prêtes à être éditées (Agent DRH)
  const pendingToEdit = useMemo(() => {
    return demandes.filter((d) => d.statut === "APPROUVEE");
  }, [demandes]);

  // Documents déjà édités ou archivés
  const archivedDocuments = useMemo(() => {
    return demandes.filter((d) => {
      const matchStatus = d.statut === "PERMISSION_EDITEE" || d.statut === "ARCHIVEE";
      const matchNum =
        !searchNumero ||
        (d.documentPermission?.numeroUnique || d.codeReference)
          .toLowerCase()
          .includes(searchNumero.toLowerCase());
      const matchCollab =
        !searchCollaborateur ||
        `${d.demandeur.prenom} ${d.demandeur.nom} ${d.demandeur.matricule}`
          .toLowerCase()
          .includes(searchCollaborateur.toLowerCase());
      const matchType = filterType === "TOUS" || d.typeDemande === filterType;

      return matchStatus && matchNum && matchCollab && matchType;
    });
  }, [demandes, searchNumero, searchCollaborateur, filterType]);

  const formatDateFr = (isoStr: string) => {
    if (!isoStr) return "-";
    const parts = isoStr.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DU REGISTRE GED ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Registre GED & Édition des Bulletins Officiels
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Génération, numérotation séquentielle certifiée et archivage sécurisé des permissions (Conservation légale 10 ans).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1.5">
            {archivedDocuments.length} document(s) archivé(s)
          </span>
        </div>
      </div>

      {/* ── FILE D'ATTENTE « À ÉDITER » (AGENT DRH) ── */}
      {pendingToEdit.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-300 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-600 rounded-full" />
              <span className="text-xs font-bold text-amber-950 uppercase">
                Demandes approuvées en attente d&apos;édition de bulletin ({pendingToEdit.length})
              </span>
            </div>
            <span className="text-[10px] text-amber-700 font-mono">Action Agent DRH requise</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {pendingToEdit.map((dem) => (
              <div
                key={dem.id}
                className="bg-white border border-amber-200 p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {dem.codeReference}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">{dem.libelleType}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {dem.demandeur.prenom} {dem.demandeur.nom} (Matr. {dem.demandeur.matricule})
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Du {formatDateFr(dem.dateDebut)} au {formatDateFr(dem.dateFin)} •{" "}
                    {dem.nombreJoursOuvres} jours
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleEditerEtOuvrir(dem)}
                  className="px-3 py-1.5 bg-[#F0822A] hover:bg-[#D96F1D] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Éditer le bulletin &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECHERCHE MULTICRITÈRE (EF-24) ── */}
      <div className="bg-white border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Numéro de permission / Réf
          </label>
          <input
            type="text"
            value={searchNumero}
            onChange={(e) => setSearchNumero(e.target.value)}
            placeholder="Ex: AGY-PERM-2026..."
            className="w-full bg-slate-50 border border-slate-200 p-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#F0822A]"
          />
        </div>
        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Collaborateur / Matricule
          </label>
          <input
            type="text"
            value={searchCollaborateur}
            onChange={(e) => setSearchCollaborateur(e.target.value)}
            placeholder="Nom, matricule (ex: 0001)..."
            className="w-full bg-slate-50 border border-slate-200 p-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#F0822A]"
          />
        </div>
        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Nature de l&apos;absence
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#F0822A] cursor-pointer"
          >
            <option value="TOUS">Toutes les natures</option>
            <option value="CONGES_ANNUELS">Congés Annuels</option>
            <option value="PERMISSION_EXCEPTIONNELLE">Permission Exceptionnelle</option>
            <option value="MISSION_DEPLACEMENT">Mission / Déplacement</option>
            <option value="CONGES_MALADIE">Congés Maladie</option>
          </select>
        </div>
      </div>

      {/* ── TABLEAU DU REGISTRE GED ── */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Numéro Unique</th>
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Nature</th>
                <th className="py-3 px-4">Période & Durée</th>
                <th className="py-3 px-4">Émission & Agent</th>
                <th className="py-3 px-4">Statut GED</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archivedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <p className="font-bold text-slate-700 text-sm">Aucun document dans le registre GED</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Les titres d&apos;absences et permissions apparaîtront automatiquement ici dès leur validation et homologation.
                    </p>
                  </td>
                </tr>
              ) : (
                archivedDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedBulletin(doc)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {doc.documentPermission?.numeroUnique || doc.codeReference}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {doc.codeReference}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {doc.demandeur.prenom} {doc.demandeur.nom}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Matr. {doc.demandeur.matricule} • {doc.demandeur.poste}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{doc.libelleType}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-900 font-semibold block">
                        {doc.nombreJoursOuvres} jours ouvrés
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Du {formatDateFr(doc.dateDebut)} au {formatDateFr(doc.dateFin)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 block">
                        {doc.documentPermission?.emetteurAgentNom || "Agent DRH"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateFr(doc.documentPermission?.dateEmission || doc.dateDerniereAction)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.statut === "ARCHIVEE" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                          Archivé 10 ans
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F0822A] bg-[#FFF4EB] px-2 py-0.5 border border-[#FDE3CC]">
                          <span className="w-1.5 h-1.5 bg-[#F0822A] rounded-full" />
                          Édité (Prêt GED)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBulletin(doc);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
                      >
                        Aperçu Bulletin
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL APERÇU OFFICIEL (ODM & BULLETIN CERTIFIÉ) ── */}
      <OfficialDocumentViewerModal
        isOpen={Boolean(selectedBulletin)}
        onClose={() => setSelectedBulletin(null)}
        demande={selectedBulletin}
      />
    </div>
  );
}

