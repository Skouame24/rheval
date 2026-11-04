// ============================================================
// features/absences/components/OfficialDocumentViewerModal.tsx
// Visualiseur officiel universel :
//  - Si demande en cours : Suivi du dossier et circuit de validation
//  - Si approuvée : Ordre de Mission A4 ou Fiche d'Intervention A4 scellé
//  - Bulletin Individuel de Permission & Congé standard
// Respect strict du Design System Soft UI Enterprise (rounded-none)
// ============================================================

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DemandeRHItem } from "@/types/absences.types";

interface OfficialDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  demande: DemandeRHItem | null;
}

function isMissionItem(d: DemandeRHItem): boolean {
  return (
    d.familleDemande === "MISSIONS" ||
    d.typeDemande === "MISSION_DEPLACEMENT" ||
    d.typeDemande === "INTERVENTION_TERRAIN" ||
    d.libelleType?.toLowerCase().includes("mission") ||
    d.libelleType?.toLowerCase().includes("intervention")
  );
}

export function OfficialDocumentViewerModal({
  isOpen,
  onClose,
  demande,
}: OfficialDocumentViewerModalProps) {
  if (!isOpen || !demande) return null;

  const isMission = isMissionItem(demande);
  const isIntervention =
    demande.typeDemande === "INTERVENTION_TERRAIN" ||
    demande.libelleType?.toLowerCase().includes("intervention");

  // Statut de validation officielle par la Direction Générale
  const isApproved =
    demande.statut === "APPROUVEE" ||
    demande.statut === "PERMISSION_EDITEE" ||
    demande.statut === "ARCHIVEE" ||
    demande.etapeCourante === "CLOTURE";

  // Référence officielle séquentielle
  const numSeq = demande.codeReference.replace(/\D/g, "").slice(-4) || "01";
  const numUnique =
    demande.documentPermission?.numeroUnique ||
    (isMission ? `JPC/2026-${numSeq}` : `AGY-PERM-2026-${numSeq}`);

  const formatDateFr = (isoStr: string) => {
    if (!isoStr) return "-";
    const parts = isoStr.split("T")[0].split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoStr;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 w-full max-w-4xl max-h-[96vh] overflow-y-auto shadow-2xl flex flex-col font-sans rounded-none">
        
        {/* BARRE SUPÉRIEURE D'ACTIONS (NON IMPRIMABLE) */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase text-[#C25E00] tracking-wider block">
              {isMission
                ? isIntervention
                  ? "Fiche d'Intervention Technique"
                  : "Ordre de Mission Officiel"
                : "Bulletin Officiel de Permission"}
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {demande.codeReference}
            </span>
            {isApproved ? (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5">
                ✓ Validé &amp; Scellé DG
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5">
                ⏳ En cours d&apos;arbitrage
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isApproved && (
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs px-4 py-2 rounded-none transition-colors cursor-pointer shadow-xs flex items-center gap-2 active:scale-[0.99]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Télécharger / Imprimer PDF A4</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-300 flex items-center justify-center transition-colors cursor-pointer text-lg font-bold rounded-none"
              title="Fermer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* ── CAS 1 : DOSSIER DE MISSION EN COURS DE VALIDATION (PAS ENCORE SCELLÉ) ── */}
        {isMission && !isApproved ? (
          <div className="p-6 sm:p-8 flex flex-col gap-6 bg-slate-50">
            {/* Bannière explicative */}
            <div className="bg-amber-50/80 border border-amber-300 p-4 flex items-start gap-3">
              <span className="text-amber-700 text-lg">⏳</span>
              <div>
                <span className="text-xs font-black uppercase text-amber-950 block">
                  Demande de mission en cours d&apos;instruction
                </span>
                <p className="text-xs text-amber-900 mt-0.5 m-0 leading-relaxed">
                  L&apos;<strong>Ordre de mission officiel A4 scellé et signé par la Direction Générale</strong> sera automatiquement généré et téléchargeable dès l&apos;accord final du Directeur Général (ou de son intérimaire désigné).
                </p>
              </div>
            </div>

            {/* Circuit de validation stepper */}
            <div className="bg-white border border-slate-200 p-5 shadow-2xs flex flex-col gap-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                Progression du circuit d&apos;approbation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 flex flex-col gap-1">
                  <span className="font-bold text-emerald-950">1. Avis Responsable N+1</span>
                  <span className="text-[10px] text-emerald-800">✓ Favorable (Transmis)</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 flex flex-col gap-1">
                  <span className="font-bold text-emerald-950">2. Contrôle Direction RH</span>
                  <span className="text-[10px] text-emerald-800">✓ Conforme au barème</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-300 flex flex-col gap-1">
                  <span className="font-bold text-amber-950">3. Accord &amp; Signature DG</span>
                  <span className="text-[10px] font-semibold text-amber-800">● En attente de signature</span>
                </div>
              </div>
            </div>

            {/* Récapitulatif du dossier de mission */}
            <div className="bg-white border border-slate-200 p-5 shadow-2xs flex flex-col gap-4 text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#C25E00] border-b border-slate-200 pb-2">
                Détails du déplacement soumis
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Demandeur</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {demande.demandeur.prenom} {demande.demandeur.nom}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Matricule : {demande.demandeur.matricule} • {demande.demandeur.poste}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Destination / Lieu</span>
                  <span className="font-bold text-slate-900 text-sm">
                    📍 {demande.destination || "Côte d'Ivoire"}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Moyen de transport : {demande.moyenTransport || "Véhicule de service"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Période sollicitée</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Du {formatDateFr(demande.dateDebut)} au {formatDateFr(demande.dateFin)}
                  </span>
                  <span className="text-[#F0822A] font-bold block text-[11px]">
                    {demande.nombreJoursOuvres} jour(s) ouvré(s)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Frais prévisionnels estimés</span>
                  <span className="font-mono font-black text-[#F0822A] text-base">
                    {demande.fraisPrevisionnels
                      ? `${Number(demande.fraisPrevisionnels).toLocaleString("fr-FR")} FCFA`
                      : "Selon barème kilométrique"}
                  </span>
                  <span className="text-slate-500 block text-[10px]">
                    Prise en charge intégrale Agilly
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Objet de la mission</span>
                <p className="bg-slate-50 p-3 border border-slate-200 text-slate-800 m-0 leading-relaxed italic">
                  &ldquo;{demande.motif}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-none transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* ── CAS 2 : DOCUMENT OFFICIEL A4 (VALIDÉ OU BULLETIN DE CONGÉ SCELLÉ) ── */
          <div className="p-4 sm:p-8 flex justify-center bg-slate-100/70">
            <div
              id="printable-a4-document"
              className="bg-white border border-slate-300 shadow-xl w-full max-w-[650px] min-h-[820px] p-8 sm:p-12 text-slate-900 flex flex-col justify-between font-sans rounded-none print:border-none print:shadow-none print:p-0 print:m-0"
            >
              {isMission ? (
                isIntervention ? (
                  /* ── FEUILLE A4 : FICHE D'INTERVENTION TECHNIQUE (IMAGE 2) ── */
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
                      <div className="flex flex-col gap-1 pl-2 pt-1 font-bold text-slate-900">
                        <span>• {demande.demandeur.prenom} {demande.demandeur.nom} (Intervenant Principal)</span>
                        <span className="font-medium text-slate-800">• Équipe support &amp; réseaux Agilly</span>
                      </div>
                    </div>

                    {/* Section 1 : Description des Prestations Techniques */}
                    <div className="flex flex-col gap-2 text-xs">
                      <span className="font-extrabold underline text-slate-900 text-xs">
                        1 - Description des Prestations Techniques
                      </span>

                      <div className="flex flex-col gap-3 pl-2 pt-1">
                        <div>
                          <span className="font-black text-slate-900 flex items-center gap-1.5">
                            <span>▲</span> DOMINO :
                          </span>
                          <p className="m-0 mt-0.5 text-slate-700 leading-relaxed pl-4">
                            Migration des serveurs vers la version 11 et installation de VERSE.
                          </p>
                        </div>

                        <div>
                          <span className="font-black text-slate-900 flex items-center gap-1.5">
                            <span>▲</span> WINDOWS :
                          </span>
                          <p className="m-0 mt-0.5 text-slate-700 leading-relaxed pl-4">
                            Migration OS vers 2016 SERVER et passage à Edge.
                          </p>
                        </div>

                        <div>
                          <span className="font-black text-slate-900 flex items-center gap-1.5">
                            <span>▲</span> INFRASTRUCTURES / RÉSEAUX :
                          </span>
                          <p className="m-0 mt-0.5 text-slate-700 leading-relaxed pl-4">
                            {demande.motif || "Sécurisation des routeurs et pare-feu principaux."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 : Conditions Financières */}
                    <div className="flex flex-col gap-1.5 text-xs pt-2">
                      <span className="font-extrabold underline text-slate-900 text-xs">
                        2 - Conditions financières
                      </span>
                      <div className="pl-2 pt-1">
                        <span className="font-medium text-slate-800">
                          Tarif contractuel : <strong className="font-extrabold text-slate-900">720 000 FCFA / jour</strong>
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
                        <span className="text-emerald-700 font-bold text-[9px]">✓ Homologué DG</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── FEUILLE A4 : ORDRE DE MISSION OFFICIEL (IMAGE 1) ── */
                  <div className="flex flex-col gap-8">
                    {/* En-tête Agilly */}
                    <div className="flex items-start justify-between pb-4">
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
                    <div className="text-center pt-2">
                      <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 m-0">
                        ORDRE DE MISSION N° {numUnique}
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
                          M. {demande.demandeur.prenom} {demande.demandeur.nom.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                        <span className="col-span-5 font-bold text-slate-800">
                          Pour se rendre en mission à :
                        </span>
                        <span className="col-span-7 font-bold uppercase text-slate-900">
                          {demande.destination || "À BOUAKÉ"}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                        <span className="col-span-5 font-bold text-slate-800">
                          Objet de la mission :
                        </span>
                        <span className="col-span-7 font-bold uppercase text-slate-900">
                          {demande.motif || "ASSISTANCE TECHNIQUE"}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                        <span className="col-span-5 font-bold text-slate-800">
                          Moyen de transport :
                        </span>
                        <span className="col-span-7 font-bold uppercase text-slate-900">
                          {demande.moyenTransport || "VÉHICULE DE SERVICE"}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                        <span className="col-span-5 font-bold text-slate-800">
                          Date de départ :
                        </span>
                        <span className="col-span-7 font-mono font-bold text-slate-900">
                          {formatDateFr(demande.dateDebut)}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                        <span className="col-span-5 font-bold text-slate-800">
                          Date de retour :
                        </span>
                        <span className="col-span-7 font-mono font-bold text-slate-900">
                          {formatDateFr(demande.dateFin)}
                        </span>
                      </div>
                    </div>

                    {/* Signature en bas à droite */}
                    <div className="pt-16 sm:pt-20 flex flex-col items-end text-right px-2 sm:px-6">
                      <span className="text-xs text-slate-700 italic">
                        Fait à Abidjan, le {formatDateFr(demande.dateCreation || new Date().toISOString())}
                      </span>
                      <div className="mt-6 flex flex-col items-center">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          M. GÉRARD KONAN
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          Directeur Général
                        </span>
                        <span className="text-[9px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          ✓ Signé &amp; Scellé électroniquement
                        </span>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* ── BULLETIN STANDARD DE PERMISSION / CONGÉ ── */
                <div className="flex flex-col gap-5 text-xs">
                  <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F0822A] text-white font-black text-xl flex items-center justify-center">
                        A
                      </div>
                      <div>
                        <h1 className="text-base font-black tracking-tight text-slate-900 m-0">
                          AGILLY SOLUTIONS
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold m-0">
                          Direction des Ressources Humaines
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="border border-slate-800 px-3 py-1 font-mono font-black text-xs bg-slate-50">
                        {numUnique}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                        {formatDateFr(demande.dateCreation)}
                      </span>
                    </div>
                  </div>

                  <div className="text-center py-2 bg-slate-100 border border-slate-300">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 m-0">
                      BULLETIN OFFICIEL DE PERMISSION / CONGÉ
                    </h2>
                  </div>

                  <div className="border border-slate-800 p-3">
                    <span className="font-extrabold text-[11px] uppercase block mb-1 text-[#C25E00]">
                      1. IDENTIFICATION DU SALARIÉ
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Demandeur : <strong>{demande.demandeur.prenom} {demande.demandeur.nom}</strong></div>
                      <div>Matricule : <strong className="font-mono">{demande.demandeur.matricule}</strong></div>
                      <div>Fonction : {demande.demandeur.poste}</div>
                      <div>Département : {demande.demandeur.departement}</div>
                    </div>
                  </div>

                  <div className="border border-slate-800 p-3">
                    <span className="font-extrabold text-[11px] uppercase block mb-1 text-[#C25E00]">
                      2. PÉRIODE &amp; DÉCOMPTE
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Du : <strong className="font-mono">{formatDateFr(demande.dateDebut)}</strong></div>
                      <div>Au : <strong className="font-mono">{formatDateFr(demande.dateFin)}</strong></div>
                      <div>Durée ouvrée : <strong className="text-[#F0822A]">{demande.nombreJoursOuvres} jour(s)</strong></div>
                    </div>
                  </div>

                  <div className="border border-slate-800 p-3">
                    <span className="font-extrabold text-[11px] uppercase block mb-1 text-slate-800">
                      3. MOTIF
                    </span>
                    <p className="italic text-slate-800 m-0">&ldquo;{demande.motif}&rdquo;</p>
                  </div>

                  <div className="pt-6 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                    <span>Certifié conforme Agilly Cloud GED</span>
                    <span className="font-bold text-emerald-700">✓ HOMOLOGUÉ &amp; SCELLÉ</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
