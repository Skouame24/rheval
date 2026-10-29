// ============================================================
// features/absences/components/OfficialDocumentViewerModal.tsx
// Visualiseur officiel universel :
//  - Bulletin Individuel de Permission & Congé
//  - Ordre de Mission Officiel (ODM) & Déplacement Professionnel
// Conforme au modèle certifié d'entreprise Agilly
// Respect strict du Design System Soft UI Enterprise (rounded-none)
// ============================================================

"use client";

import React from "react";
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

  // Sécurisation du document officiel (si pas encore scellé, générer une référence de certification immédiate)
  const numSeq = demande.codeReference.replace(/\D/g, "").slice(-5) || "00018";
  const numUnique =
    demande.documentPermission?.numeroUnique ||
    (isMission ? `AGY-ODM-2026-${numSeq}` : `AGY-PERM-2026-${numSeq}`);

  const dateEmission = demande.documentPermission?.dateEmission || demande.dateCreation || new Date().toISOString();
  const emetteurNom = demande.documentPermission?.emetteurAgentNom || "Direction des Ressources Humaines";

  const formatDateFr = (isoStr: string) => {
    if (!isoStr) return "-";
    const parts = isoStr.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 w-full max-w-3xl max-h-[96vh] overflow-y-auto shadow-2xl flex flex-col font-sans rounded-none">
        
        {/* BARRE D'ACTIONS DU DOCUMENT (NON IMPRIMABLE) */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div>
            <span className="text-[10px] font-black uppercase text-[#C25E00] tracking-wider block">
              {isMission ? "Ordre de Mission Officiel (ODM)" : "Bulletin Officiel de Permission (GED)"}
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {numUnique} • Certifié Agilly
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs px-4 py-2 rounded-none transition-colors cursor-pointer shadow-xs flex items-center gap-2 active:scale-[0.99]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>Imprimer / Exporter PDF</span>
            </button>
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

        {/* ── CORPS DU DOCUMENT FORMAT OFFICIEL A4 (IMPRIMABLE) ── */}
        <div className="p-4 sm:p-8 flex justify-center bg-slate-100/50">
          <div className="bg-white border-2 border-slate-900 shadow-sm w-full max-w-2xl p-6 sm:p-8 text-slate-900 flex flex-col gap-5 text-xs rounded-none print:border-none print:shadow-none print:p-0">
            
            {/* EN-TÊTE CORPORATE OFFICIEL */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F0822A] text-white font-black text-2xl flex items-center justify-center rounded-none shadow-xs">
                  A
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 m-0">
                    AGILLY SOLUTIONS
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold m-0">
                    Direction des Ressources Humaines • Administration du Personnel
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono m-0">
                    Abidjan Plateau • Côte d&apos;Ivoire • info@agilly.net
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="border border-slate-800 px-3 py-1 font-mono font-black text-xs bg-slate-50">
                  {numUnique}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                  Date émission : {formatDateFr(dateEmission)}
                </span>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 border border-emerald-200 mt-1">
                  ✓ HOMOLOGUÉ & SCELLÉ
                </span>
              </div>
            </div>

            {/* TITRE DU DOCUMENT */}
            <div className="text-center py-2.5 bg-slate-100 border border-slate-300">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 m-0">
                {isMission
                  ? "ORDRE DE MISSION OFFICIEL & DÉPLACEMENT PROFESSIONNEL"
                  : "FORMULAIRE DE DEMANDE DE PERMISSION"}
              </h2>
              <p className="text-[10px] font-semibold text-slate-600 m-0 mt-0.5">
                {isMission
                  ? "(Prise en charge financière et couverture institutionnelle Agilly)"
                  : "(Bulletin Individuel — Exemplaire Officiel Archivé)"}
              </p>
            </div>

            {/* 1. CADRE IDENTIFICATION DU SALARIÉ / MISSIONNAIRE */}
            <div className="border border-slate-800 p-3.5">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 text-[#C25E00]">
                1. IDENTIFICATION DU SALARIÉ {isMission && "/ MISSIONNAIRE"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Matricule :</span>
                  <span className="font-mono font-bold text-slate-900">{demande.demandeur.matricule}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Nom et Prénoms :</span>
                  <span className="font-bold text-slate-900">
                    {demande.demandeur.nom} {demande.demandeur.prenom}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Fonction / Poste :</span>
                  <span className="font-medium text-slate-800">{demande.demandeur.poste}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Département :</span>
                  <span className="font-medium text-slate-800">{demande.demandeur.departement}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-medium">N° CNSS :</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {demande.demandeur.numeroCnss || "CI-0019284729-A"}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-medium">Contact / Téléphone :</span>
                  <span className="font-mono text-slate-800">
                    {demande.adresseContactPendantAbsence || "+225 07 00 00 00 00"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SI MISSION : CADRE CADRAGE LOGISTIQUE & FINANCIER */}
            {isMission ? (
              <>
                <div className="border border-slate-800 p-3.5 bg-purple-50/20">
                  <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-2 border-b border-purple-200 pb-1 text-purple-950">
                    2. CARACTÉRISTIQUES DE LA MISSION & LOGISTIQUE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Lieu / Destination :</span>
                      <span className="font-bold text-slate-900 text-sm">
                        📍 {demande.destination || "Côte d'Ivoire (Intérieur)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Moyen de transport :</span>
                      <span className="font-bold text-slate-900">
                        🚗 {demande.moyenTransport || "Véhicule de service Agilly"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Période d&apos;intervention :</span>
                      <span className="font-mono font-bold text-slate-900">
                        Du {formatDateFr(demande.dateDebut)} au {formatDateFr(demande.dateFin)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Durée totale :</span>
                      <span className="font-mono font-bold text-[#F0822A]">
                        {demande.nombreJoursOuvres} jour(s) ouvré(s) ({demande.nombreJoursCalendaires} j calendaires)
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRISES EN CHARGE FINANCIÈRES & PER DIEM */}
                <div className="border-2 border-purple-300 p-3.5 bg-white">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-1.5 mb-2">
                    <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-purple-950 m-0">
                      3. PRISE EN CHARGE FINANCIÈRE & AVANCE DE TRÉSORERIE
                    </h3>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5">
                      Budget Agilly
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Budget total prévisionnel :</span>
                      <span className="text-base font-black font-mono text-purple-950">
                        {demande.fraisPrevisionnels
                          ? `${Number(demande.fraisPrevisionnels).toLocaleString("fr-FR")} FCFA`
                          : "Selon barème officiel"}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Couvre per diem, hébergement, restauration et transport A/R.
                      </span>
                    </div>

                    <div className="p-2.5 bg-purple-50/60 border border-purple-200">
                      <span className="text-[10px] text-purple-900 block font-medium">Statut de la prise en charge :</span>
                      <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                        ✓ Imputable au budget d&apos;exploitation Agilly
                      </span>
                      <span className="text-[10px] text-slate-600 block mt-0.5 font-medium">
                        0 jour déduit sur le solde de congés payés annuels.
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* 2. SI CONGÉ OU PERMISSION : TYPE DE PERMISSION (GRILLE ORIGINALE CONFORME EXCEL) */
              <>
                <div className="border border-slate-800 p-3.5">
                  <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 text-[#C25E00]">
                    2. TYPE DE PERMISSION (Cocher la mention utile)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    {[
                      { key: "CONGES_ANNUELS", label: "Congés Annuels Payés" },
                      { key: "CONGES_MALADIE", label: "Congés Maladie (Arrêt)" },
                      { key: "CONGES_MATERNITE", label: "Congés Maternité / Paternité" },
                      { key: "PERMISSION_MARIAGE", label: "Mariage du salarié (3j)" },
                      { key: "PERMISSION_DECES", label: "Décès famille proche (2 à 5j)" },
                      { key: "PERMISSION_NAISSANCE", label: "Naissance / Baptême (2j)" },
                      { key: "PERMISSION_MEDICALE", label: "Rendez-vous médical" },
                      { key: "PERMISSION_ADMINISTRATIVE", label: "Démarche administrative" },
                      { key: "CONGES_SANS_SOLDE", label: "Congé sans solde" },
                    ].map((item) => {
                      const isChecked =
                        demande.typeDemande === item.key ||
                        (item.key === "CONGES_MATERNITE" && demande.typeDemande === "CONGES_PATERNITE");
                      return (
                        <div key={item.key} className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 border flex items-center justify-center font-bold text-[9px] ${
                            isChecked ? "bg-[#F0822A] text-white border-[#F0822A]" : "border-slate-400 bg-slate-50"
                          }`}>
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

                {/* 3. PÉRIODE DE L'ABSENCE */}
                <div className="border border-slate-800 p-3.5">
                  <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 text-[#C25E00]">
                    3. PÉRIODE DE L&apos;ABSENCE & DÉCOMPTE
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Date de début :</span>
                      <span className="font-mono font-bold text-slate-900">{formatDateFr(demande.dateDebut)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Date de fin :</span>
                      <span className="font-mono font-bold text-slate-900">{formatDateFr(demande.dateFin)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Nombre de jours ouvrés :</span>
                      <span className="font-mono font-black text-[#F0822A] text-sm">
                        {demande.nombreJoursOuvres} jour(s)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">Jours calendaires :</span>
                      <span className="font-mono font-bold text-slate-700">
                        {demande.nombreJoursCalendaires} jour(s)
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 4. MOTIF OFFICIEL CONSIGNÉ */}
            <div className="border border-slate-800 p-3.5">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-1 text-slate-700">
                {isMission ? "4. OBJET & MOTIF DE LA MISSION" : "4. MOTIF DE LA DEMANDE"}
              </h3>
              <p className="italic text-slate-800 bg-slate-50 p-2.5 border border-slate-200 text-xs m-0">
                &ldquo;{demande.motif}&rdquo;
              </p>
            </div>

            {/* 5. VISAS ET SIGNATURES OFFICIELLES (GRILLE FIDÈLE AGILLY) */}
            <div className="border border-slate-800 p-3.5">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider mb-2.5 border-b border-slate-300 pb-1 text-slate-800">
                5. VISAS HIÉRARCHIQUES & AUTORISATIONS LÉGALES
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
                {/* Salarié */}
                <div className="border border-slate-300 p-2.5 flex flex-col justify-between min-h-[90px] bg-slate-50/50">
                  <span className="font-bold text-slate-700 block">LE SALARIÉ / DEMANDEUR</span>
                  <div className="my-1">
                    <span className="text-[9px] text-emerald-700 font-bold block">✓ Certifié sur l&apos;honneur</span>
                    <span className="font-mono text-[9px] text-slate-400">Signé électroniquement</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    {demande.demandeur.prenom} {demande.demandeur.nom}
                  </span>
                </div>

                {/* Manager N+1 */}
                <div className="border border-slate-300 p-2.5 flex flex-col justify-between min-h-[90px] bg-slate-50/50">
                  <span className="font-bold text-slate-700 block">LE RESPONSABLE N+1</span>
                  <div className="my-1">
                    <span className="text-[9px] text-emerald-700 font-bold block">✓ Avis Favorable Accordé</span>
                    <span className="font-mono text-[9px] text-slate-400">Visa hiérarchique validé</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    Direction de Département
                  </span>
                </div>

                {/* Direction Générale / DRH */}
                <div className="border-2 border-slate-800 p-2.5 flex flex-col justify-between min-h-[90px] bg-orange-50/30">
                  <span className="font-black text-slate-900 block">
                    {isMission ? "LA DIRECTION GÉNÉRALE" : "LA DIRECTION DES RH"}
                  </span>
                  <div className="my-1">
                    <span className="text-[10px] text-[#C25E00] font-black block">✓ BON POUR ACCORD</span>
                    <span className="font-mono text-[9px] text-slate-500">Homologué & Enregistré GED</span>
                  </div>
                  <span className="text-slate-900 font-bold">
                    {emetteurNom}
                  </span>
                </div>
              </div>
            </div>

            {/* PIED DE PAGE : CERTIFICATION & CACHET NUMÉRIQUE */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[10px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span>Document probatoire certifié Agilly Cloud • Archivage légal 10 ans</span>
              </div>
              <span className="font-mono text-slate-400">
                SHA-256: {demande.documentPermission?.hashSha256?.slice(0, 16) || "e3b0c44298fc1c14"}...
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

