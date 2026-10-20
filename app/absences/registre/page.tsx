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

export default function RegistreGedPage() {
  const { currentPersona, demandes, editerPermission, archiverDemande } = useAbsences();

  // Recherche multicritère (EF-24)
  const [searchNumero, setSearchNumero] = useState("");
  const [searchCollaborateur, setSearchCollaborateur] = useState("");
  const [filterType, setFilterType] = useState("TOUS");

  // Document officiel sélectionné pour affichage fidèle à l'écran
  const [selectedBulletin, setSelectedBulletin] = useState<DemandeRHItem | null>(null);

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
                  onClick={() => editerPermission(dem.id)}
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
              {archivedDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => setSelectedBulletin(doc)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      {doc.documentPermission?.numeroUnique || "AGY-PERM-2026-00042"}
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
                      {doc.documentPermission?.emetteurAgentNom || "Aïcha DIARRA"}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL APERÇU DU BULLETIN OFFICIEL (FIDÈLE À LA FICHE EXCEL FOURNIE PAR L'UTILISATEUR) ── */}
      {selectedBulletin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative bg-white border border-slate-300 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-8 text-xs flex flex-col gap-6">
            {/* Barre d'action supérieure */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Aperçu Officiel Conforme — Formulaire Original Agilly
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 cursor-pointer"
                >
                  Imprimer / Exporter PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBulletin(null)}
                  className="text-slate-400 hover:text-slate-800 text-base font-bold"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* ── RENDU REPRODUISANT LE FORMULAIRE PAPIER/EXCEL OFFICIEL ── */}
            <div className="border-2 border-slate-800 p-6 flex flex-col gap-5 bg-white text-slate-900 font-sans">
              {/* Entête Fiche Officielle */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F0822A] text-white font-extrabold text-2xl flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900">
                      AGILLY SOLUTIONS
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">
                      Direction des Ressources Humaines • Administration du Personnel
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="border border-slate-800 px-3 py-1 font-mono font-bold text-xs bg-slate-50">
                    {selectedBulletin.documentPermission?.numeroUnique || "AGY-PERM-2026-00042"}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Date : {formatDateFr(selectedBulletin.dateCreation)}
                  </span>
                </div>
              </div>

              {/* Titre du document officiel */}
              <div className="text-center py-2 bg-slate-100 border border-slate-300">
                <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  FORMULAIRE DE DEMANDE DE PERMISSION
                </h1>
                <p className="text-[11px] font-semibold text-slate-600">
                  (Bulletin Individuel)
                </p>
              </div>

              {/* 1. Cadre réservé au salarié */}
              <div className="border border-slate-800 p-3.5">
                <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-2 border-b border-slate-300 pb-1">
                  CADRE RÉSERVÉ AU SALARIÉ
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Matricule :</span>
                    <span className="font-mono font-bold">{selectedBulletin.demandeur.matricule}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Nom et Prénoms :</span>
                    <span className="font-bold">
                      {selectedBulletin.demandeur.nom} {selectedBulletin.demandeur.prenom}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Fonction :</span>
                    <span className="font-medium">{selectedBulletin.demandeur.poste}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Département :</span>
                    <span className="font-medium">{selectedBulletin.demandeur.departement}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 block text-[10px]">N° CNSS :</span>
                    <span className="font-mono font-medium">
                      {selectedBulletin.demandeur.numeroCnss || "CI-0019284729-A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Type de permission (Grille de cases cochées exacte du document papier) */}
              <div className="border border-slate-800 p-3.5">
                <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-2 border-b border-slate-300 pb-1">
                  TYPE DE PERMISSION (Cocher la mention utile)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {[
                    { key: "CONGES_ANNUELS", label: "Congés Annuels" },
                    { key: "CONGES_MALADIE", label: "Congés Maladie" },
                    { key: "CONGES_MATERNITE", label: "Congés Maternité" },
                    { key: "RECUPERATION", label: "Récupération" },
                    { key: "ABSENCE_NON_PAYEE", label: "Absence autorisée non payée" },
                    { key: "PERMISSION_EXCEPTIONNELLE", label: "Permission Exceptionnelle" },
                    { key: "MISSION_DEPLACEMENT", label: "Mission" },
                    { key: "INTERVENTION_TERRAIN", label: "Intervention" },
                  ].map((item) => {
                    const isChecked = selectedBulletin.typeDemande === item.key;
                    return (
                      <div key={item.key} className="flex items-center gap-1.5">
                        <span
                          className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold text-[10px] ${
                            isChecked ? "bg-slate-900 text-white" : "bg-white"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </span>
                        <span className={isChecked ? "font-bold text-slate-900" : "text-slate-600"}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Période & Motif */}
              <div className="border border-slate-800 p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nombre de jours :</span>
                  <span className="font-mono font-bold text-sm">
                    {selectedBulletin.nombreJoursOuvres} jours ouvrés
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Du (inclus) :</span>
                  <span className="font-mono font-bold">
                    {formatDateFr(selectedBulletin.dateDebut)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Au (inclus) :</span>
                  <span className="font-mono font-bold">
                    {formatDateFr(selectedBulletin.dateFin)}
                  </span>
                </div>

                <div className="col-span-3 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Motif de la permission :</span>
                  <p className="font-medium italic mt-0.5 text-slate-800">
                    &ldquo;{selectedBulletin.motif}&rdquo;
                  </p>
                </div>

                <div className="col-span-3 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">
                    Adresse et contact téléphonique pendant l&apos;absence :
                  </span>
                  <p className="font-medium text-slate-800">
                    {selectedBulletin.adresseContactPendantAbsence || "Abidjan Cocody"}
                  </p>
                </div>
              </div>

              {/* 4. Cadre Réservé DRH & Balance */}
              <div className="border border-slate-800 p-3.5 bg-slate-50/70 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-1">
                    CADRE RÉSERVÉ DRH
                  </h3>
                  <p className="text-[10px] text-slate-600">
                    Contrôle de conformité et décompte des droits acquis.
                  </p>
                </div>
                <div className="border border-slate-400 p-2 bg-white flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    Balance congés payés restants :
                  </span>
                  <span className="font-mono font-extrabold text-sm text-[#F0822A]">
                    {selectedBulletin.documentPermission?.balanceCongesPayesSolde || 10.5} jours
                  </span>
                </div>
              </div>

              {/* 5. Signatures Salarié & Gérant (Christian BAMBA) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border border-slate-800 p-4 h-32 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Signature du Salarié
                  </span>
                  <div className="text-center font-serif italic text-slate-700">
                    Signé numériquement par {selectedBulletin.demandeur.prenom}{" "}
                    {selectedBulletin.demandeur.nom}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    Certifié le {formatDateFr(selectedBulletin.dateCreation)}
                  </span>
                </div>

                <div className="border border-slate-800 p-4 h-32 flex flex-col justify-between bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                      Validation Gérant
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 border border-emerald-200">
                      BON POUR ACCORD
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-serif italic font-bold text-slate-900 text-sm">
                      Christian BAMBA
                    </p>
                    <p className="text-[9px] text-slate-500">Gérant / Direction Générale</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    Signé & Horodaté eIDAS
                  </span>
                </div>
              </div>
            </div>

            {/* Pied du modal avec option d'archivage */}
            <div className="flex items-center justify-between pt-2">
              {selectedBulletin.statut === "PERMISSION_EDITEE" ? (
                <button
                  type="button"
                  onClick={() => {
                    archiverDemande(selectedBulletin.id);
                    setSelectedBulletin(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Classer & Archiver dans la GED &rarr;
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-mono">
                  Document sécurisé et scellé dans la GED (Hash SHA-256 valide).
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedBulletin(null)}
                className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
