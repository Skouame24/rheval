// ============================================================
// features/absences/components/MissionsDocumentEditor.tsx
// Éditeur et visualiseur A4 interactif :
//  - Onglet 1 : Ordre de Mission (A4)
//  - Onglet 2 : Intervention Technique (Multi-employés)
// Conforme pixel-perfect aux spécifications Agilly
// Respect strict du Design System Soft UI Enterprise & Charte Agilly
// ============================================================

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DemandeRHItem } from "@/types/absences.types";

export interface MissionsDocumentEditorProps {
  initialDemande?: DemandeRHItem | null;
  onClose?: () => void;
  isModal?: boolean;
}

export function MissionsDocumentEditor({
  initialDemande,
  onClose,
  isModal = false,
}: MissionsDocumentEditorProps) {
  // Onglet actif : "ODM" (Ordre de Mission A4) ou "INTERVENTION" (Intervention Technique Multi-employés)
  const isInterventionDefault =
    initialDemande?.typeDemande === "INTERVENTION_TERRAIN" ||
    initialDemande?.libelleType?.toLowerCase().includes("intervention");

  const [activeTab, setActiveTab] = useState<"ODM" | "INTERVENTION">(
    isInterventionDefault ? "INTERVENTION" : "ODM"
  );

  // ── ÉTAT POUR L'ORDRE DE MISSION (A4) ──
  const defaultNumOrdre =
    initialDemande?.codeReference
      ? `JPC/${initialDemande.codeReference.replace(/\D/g, "").slice(-4) || "2020-01"}`
      : "JPC/2020-01";

  const defaultNomEmploye = initialDemande?.demandeur
    ? `M. ${initialDemande.demandeur.prenom} ${initialDemande.demandeur.nom.toUpperCase()}`
    : "M. Alain COULIBALY";

  const defaultDestination =
    initialDemande?.destination || "AU MALAWI - TRANSIT PAR L'ÉTHIOPIE";

  const defaultObjet =
    initialDemande?.motif || "ASSISTANCE TECHNIQUE";

  const defaultTransport =
    initialDemande?.moyenTransport || "AVION";

  const defaultDateDepart = initialDemande?.dateDebut
    ? initialDemande.dateDebut.split("T")[0]
    : "2020-02-15";

  const defaultDateRetour = initialDemande?.dateFin
    ? initialDemande.dateFin.split("T")[0]
    : "2020-02-20";

  const [numeroOrdre, setNumeroOrdre] = useState(defaultNumOrdre);
  const [nomDonneOrdre, setNomDonneOrdre] = useState(defaultNomEmploye);
  const [lieuMission, setLieuMission] = useState(defaultDestination);
  const [objetMission, setObjetMission] = useState(defaultObjet);
  const [moyenTransport, setMoyenTransport] = useState(defaultTransport);
  const [dateDepart, setDateDepart] = useState(defaultDateDepart);
  const [dateRetour, setDateRetour] = useState(defaultDateRetour);

  // ── ÉTAT POUR L'INTERVENTION TECHNIQUE (MULTI-EMPLOYÉS) ──
  const [intervenantPrincipal, setIntervenantPrincipal] = useState(
    initialDemande?.demandeur
      ? `${initialDemande.demandeur.prenom} ${initialDemande.demandeur.nom.toUpperCase()} (${initialDemande.demandeur.departement || "Afrik IT"})`
      : "Aimé COULIBALY (Afrik IT)"
  );

  const [collaborateurs, setCollaborateurs] = useState<string[]>([
    "Jean KOUASSI (Technicien Réseaux)",
  ]);

  const [prestationDomino, setPrestationDomino] = useState(
    "Migration des serveurs vers la version 11 et installation de VERSE."
  );
  const [prestationWindows, setPrestationWindows] = useState(
    "Migration OS vers 2016 SERVER et passage à Edge."
  );
  const [prestationInfra, setPrestationInfra] = useState(
    "Sécurisation des routeurs et pare-feu principaux."
  );

  const [tarifContractuel, setTarifContractuel] = useState("720 000 FCFA / jour");

  // Ajouter / Supprimer un collaborateur
  const handleAddCollaborateur = () => {
    setCollaborateurs([...collaborateurs, "Nouveau collaborateur (Rôle)"]);
  };

  const handleUpdateCollaborateur = (index: number, val: string) => {
    const updated = [...collaborateurs];
    updated[index] = val;
    setCollaborateurs(updated);
  };

  const handleRemoveCollaborateur = (index: number) => {
    setCollaborateurs(collaborateurs.filter((_, i) => i !== index));
  };

  // Formatage des dates pour le document A4 (JJ/MM/AAAA)
  const formatDateA4 = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Date actuelle pour "Fait à Abidjan, le..."
  const dateFaitLe = formatDateA4(dateDepart || new Date().toISOString());

  // Déclenchement de l'impression
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`w-full flex flex-col font-sans select-none ${isModal ? "p-0" : "p-4 sm:p-6"}`}>
      
      {/* ── BARRE D'ONGLETS SUPÉRIEURE (NON IMPRIMABLE) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ODM")}
            className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer rounded-full shadow-xs ${
              activeTab === "ODM"
                ? "bg-[#F0822A] text-white hover:bg-[#D96F1D]"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Ordre de Mission (A4)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INTERVENTION")}
            className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer rounded-full shadow-xs ${
              activeTab === "INTERVENTION"
                ? "bg-[#F0822A] text-white hover:bg-[#D96F1D]"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Intervention Technique (Multi-employés)
          </button>
        </div>

        {/* Bouton Fermer si modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-300 flex items-center justify-center transition-colors cursor-pointer text-base font-bold rounded-none"
            title="Fermer le document"
          >
            &times;
          </button>
        )}
      </div>

      {/* ── CORPS DU MODULE : COLONNE GAUCHE ÉDITION & COLONNE DROITE APERÇU A4 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================ */}
        {/* COLONNE GAUCHE (5 cols) : FORMULAIRE D'ÉDITION               */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 sm:p-6 flex flex-col gap-5 shadow-xs rounded-none print:hidden">
          
          {activeTab === "ODM" ? (
            /* ── FORMULAIRE : PARAMÈTRES DE L'ORDRE DE MISSION ── */
            <>
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide m-0">
                  Paramètres de l&apos;Ordre de Mission
                </h3>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Numéro d&apos;Ordre de Mission
                </label>
                <input
                  type="text"
                  value={numeroOrdre}
                  onChange={(e) => setNumeroOrdre(e.target.value)}
                  placeholder="Ex: JPC/2020-01"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Donne ordre à (Nom & Prénom)
                </label>
                <input
                  type="text"
                  value={nomDonneOrdre}
                  onChange={(e) => setNomDonneOrdre(e.target.value)}
                  placeholder="Ex: M. Alain COULIBALY"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Pour se rendre en mission à
                </label>
                <input
                  type="text"
                  value={lieuMission}
                  onChange={(e) => setLieuMission(e.target.value)}
                  placeholder="Ex: AU MALAWI - TRANSIT PAR L'ÉTHIOPIE"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Objet de la mission
                </label>
                <input
                  type="text"
                  value={objetMission}
                  onChange={(e) => setObjetMission(e.target.value)}
                  placeholder="Ex: ASSISTANCE TECHNIQUE"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Moyen de transport
                </label>
                <div className="relative">
                  <select
                    value={moyenTransport}
                    onChange={(e) => setMoyenTransport(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 pr-8 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none cursor-pointer appearance-none rounded-none"
                  >
                    <option value="AVION">AVION</option>
                    <option value="VÉHICULE DE SERVICE">VÉHICULE DE SERVICE</option>
                    <option value="VÉHICULE PERSONNEL">VÉHICULE PERSONNEL</option>
                    <option value="TRANSPORT EN COMMUN (CAR / BUS)">TRANSPORT EN COMMUN (CAR / BUS)</option>
                    <option value="TRAIN (SITARAIL)">TRAIN (SITARAIL)</option>
                    <option value="BATEAU-BUS / NAVETTE">BATEAU-BUS / NAVETTE</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold">
                    ▼
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">
                    Date départ
                  </label>
                  <input
                    type="date"
                    value={dateDepart}
                    onChange={(e) => setDateDepart(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">
                    Date retour
                  </label>
                  <input
                    type="date"
                    value={dateRetour}
                    onChange={(e) => setDateRetour(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full mt-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs py-3 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span>Imprimer / Exporter PDF A4</span>
              </button>
            </>
          ) : (
            /* ── FORMULAIRE : INTERVENTION TECHNIQUE (MULTI-EMPLOYÉS) ── */
            <>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide m-0">
                  Intervention Technique (Multi-employés)
                </h3>
                <button
                  type="button"
                  onClick={handleAddCollaborateur}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>+</span>
                  <span>Employé</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Intervenant Principal
                </label>
                <input
                  type="text"
                  value={intervenantPrincipal}
                  onChange={(e) => setIntervenantPrincipal(e.target.value)}
                  placeholder="Ex: Aimé COULIBALY (Afrik IT)"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Collaborateurs / Équipe Technique
                </label>
                <div className="flex flex-col gap-2">
                  {collaborateurs.map((collab, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={collab}
                        onChange={(e) => handleUpdateCollaborateur(idx, e.target.value)}
                        placeholder="Ex: Jean KOUASSI (Technicien Réseaux)"
                        className="flex-1 bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none rounded-none"
                      />
                      {collaborateurs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborateur(idx)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center cursor-pointer text-xs font-bold"
                          title="Supprimer ce collaborateur"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 border-t border-slate-200">
                <span className="text-slate-800 font-bold text-xs">
                  Prestations Techniques
                </span>

                <div>
                  <label className="block text-slate-600 text-[11px] font-bold uppercase mb-1">
                    DOMINO
                  </label>
                  <textarea
                    rows={2}
                    value={prestationDomino}
                    onChange={(e) => setPrestationDomino(e.target.value)}
                    placeholder="Migration des serveurs..."
                    className="w-full bg-slate-50/70 border border-slate-300 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none rounded-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-bold uppercase mb-1">
                    WINDOWS
                  </label>
                  <textarea
                    rows={2}
                    value={prestationWindows}
                    onChange={(e) => setPrestationWindows(e.target.value)}
                    placeholder="Migration OS..."
                    className="w-full bg-slate-50/70 border border-slate-300 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none rounded-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-bold uppercase mb-1">
                    INFRASTRUCTURES / RÉSEAUX
                  </label>
                  <textarea
                    rows={2}
                    value={prestationInfra}
                    onChange={(e) => setPrestationInfra(e.target.value)}
                    placeholder="Sécurisation des routeurs..."
                    className="w-full bg-slate-50/70 border border-slate-300 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none rounded-none resize-y"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Tarif Contractuel
                </label>
                <input
                  type="text"
                  value={tarifContractuel}
                  onChange={(e) => setTarifContractuel(e.target.value)}
                  placeholder="Ex: 720 000 FCFA / jour"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none rounded-none"
                />
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full mt-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs py-3 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span>Imprimer Fiche d&apos;Intervention A4</span>
              </button>
            </>
          )}

        </div>

        {/* ============================================================ */}
        {/* COLONNE DROITE (7 cols) : APERÇU FEUILLE A4 EN TEMPS RÉEL     */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex justify-center bg-slate-100/70 p-4 sm:p-6 border border-slate-200">
          
          <div
            id="a4-printable-document"
            className="bg-white border border-slate-300 shadow-xl w-full max-w-[650px] min-h-[840px] p-8 sm:p-12 text-slate-900 flex flex-col justify-between font-sans rounded-none print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {activeTab === "ODM" ? (
              /* ── DOCUMENT A4 : ORDRE DE MISSION OFFICIEL ── */
              <div className="flex flex-col gap-8">
                
                {/* En-tête Agilly */}
                <div className="flex items-start justify-between border-b border-transparent pb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.png"
                        alt="Agilly"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                      <span className="text-2xl font-black tracking-tight text-slate-900">
                        agil<span className="text-[#F0822A]">ly</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">
                      Services Managés • Cloud &amp; Cyber Sécurité
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-slate-600 leading-snug">
                    <p className="m-0 font-medium">22 rue des Carrossiers</p>
                    <p className="m-0 font-medium">Treichville - Zone 3</p>
                    <p className="m-0 font-medium">Abidjan</p>
                    <p className="m-0 font-medium">Côte d&apos;Ivoire</p>
                  </div>
                </div>

                {/* Titre & Sous-titre */}
                <div className="text-center pt-4">
                  <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 m-0">
                    ORDRE DE MISSION N° {numeroOrdre || "JPC/2020-01"}
                  </h1>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#F0822A] mt-2 mb-0">
                    LE DIRECTEUR GÉNÉRAL
                  </h2>
                </div>

                {/* Grille des mentions obligatoires */}
                <div className="flex flex-col gap-4 text-xs pt-4 px-2 sm:px-6">
                  <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                    <span className="col-span-5 font-bold text-slate-800">
                      Donne ordre à :
                    </span>
                    <span className="col-span-7 font-extrabold uppercase text-slate-900">
                      {nomDonneOrdre || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                    <span className="col-span-5 font-bold text-slate-800">
                      Pour se rendre en mission à :
                    </span>
                    <span className="col-span-7 font-bold uppercase text-slate-900">
                      {lieuMission || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                    <span className="col-span-5 font-bold text-slate-800">
                      Objet de la mission :
                    </span>
                    <span className="col-span-7 font-bold uppercase text-slate-900">
                      {objetMission || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                    <span className="col-span-5 font-bold text-slate-800">
                      Moyen de transport :
                    </span>
                    <span className="col-span-7 font-bold uppercase text-slate-900">
                      {moyenTransport || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                    <span className="col-span-5 font-bold text-slate-800">
                      Date de départ :
                    </span>
                    <span className="col-span-7 font-mono font-bold text-slate-900">
                      {formatDateA4(dateDepart)}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                    <span className="col-span-5 font-bold text-slate-800">
                      Date de retour :
                    </span>
                    <span className="col-span-7 font-mono font-bold text-slate-900">
                      {formatDateA4(dateRetour)}
                    </span>
                  </div>
                </div>

                {/* Signature en bas à droite */}
                <div className="pt-16 sm:pt-24 flex flex-col items-end text-right px-2 sm:px-6">
                  <span className="text-xs text-slate-700 italic">
                    Fait à Abidjan, le {dateFaitLe}
                  </span>
                  <div className="mt-6 flex flex-col items-center">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      M. GÉRARD KONAN
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Directeur Général
                    </span>
                    <div className="w-24 border-b border-slate-300 mt-8" />
                  </div>
                </div>

              </div>
            ) : (
              /* ── DOCUMENT A4 : FICHE D'INTERVENTION TECHNIQUE ── */
              <div className="flex flex-col gap-6">
                
                {/* En-tête Agilly */}
                <div className="flex items-start justify-between pb-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.png"
                        alt="Agilly"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                      <span className="text-2xl font-black tracking-tight text-slate-900">
                        agil<span className="text-[#F0822A]">ly</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">
                      Services Managés • Cloud &amp; Cyber Sécurité
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-slate-600 leading-snug">
                    <p className="m-0 font-medium">22 rue des carrossiers Zone 3</p>
                    <p className="m-0 font-medium">Treichville Abidjan</p>
                  </div>
                </div>

                {/* Cadre Titre Fiche d'Intervention */}
                <div className="border border-slate-900 py-2.5 text-center my-1">
                  <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 m-0">
                    FICHE D&apos;INTERVENTION TECHNIQUE
                  </h1>
                </div>

                {/* Équipe d'Intervention / Employés */}
                <div className="border border-slate-300 p-3.5 bg-slate-50/50 flex flex-col gap-1.5 text-xs">
                  <span className="font-extrabold uppercase text-[11px] text-slate-800 tracking-wide">
                    EQUIPE D&apos;INTERVENTION / EMPLOYES :
                  </span>
                  <div className="flex flex-col gap-1 pl-2 pt-1">
                    {intervenantPrincipal && (
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <span>•</span>
                        <span>{intervenantPrincipal}</span>
                      </div>
                    )}
                    {collaborateurs.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-800 font-medium">
                        <span>•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 1 : Description des Prestations Techniques */}
                <div className="flex flex-col gap-2 text-xs">
                  <span className="font-extrabold underline text-slate-900 text-xs">
                    1 - Description des Prestations Techniques
                  </span>

                  <div className="flex flex-col gap-3 pl-2 pt-1">
                    {prestationDomino && (
                      <div>
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>▲</span> DOMINO :
                        </span>
                        <p className="m-0 mt-0.5 text-slate-700 leading-relaxed pl-4">
                          {prestationDomino}
                        </p>
                      </div>
                    )}

                    {prestationWindows && (
                      <div>
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>▲</span> WINDOWS :
                        </span>
                        <p className="m-0 mt-0.5 text-slate-700 leading-relaxed pl-4">
                          {prestationWindows}
                        </p>
                      </div>
                    )}

                    {prestationInfra && (
                      <div>
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>▲</span> INFRASTRUCTURES / RÉSEAUX :
                        </span>
                        <p className="m-0 mt-0.5 text-slate-700 leading-relaxed pl-4">
                          {prestationInfra}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2 : Conditions Financières */}
                <div className="flex flex-col gap-1.5 text-xs pt-2">
                  <span className="font-extrabold underline text-slate-900 text-xs">
                    2 - Conditions financières
                  </span>
                  <div className="pl-2 pt-1">
                    <span className="font-medium text-slate-800">
                      Tarif contractuel : <strong className="font-extrabold text-slate-900">{tarifContractuel || "-"}</strong>
                    </span>
                  </div>
                </div>

                {/* Visas en pied de fiche */}
                <div className="pt-12 grid grid-cols-2 gap-6 text-center text-[10px]">
                  <div className="border border-slate-300 p-3 flex flex-col justify-between min-h-[70px]">
                    <span className="font-bold text-slate-700 uppercase">Visa Client / Réception</span>
                    <span className="text-slate-400 font-mono text-[9px]">Date &amp; Cachet</span>
                  </div>
                  <div className="border border-slate-300 p-3 flex flex-col justify-between min-h-[70px]">
                    <span className="font-bold text-slate-700 uppercase">Visa Direction Agilly</span>
                    <span className="text-slate-400 font-mono text-[9px]">Homologué</span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

