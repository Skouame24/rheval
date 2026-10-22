// ============================================================
// features/absences/components/PermissionViewerModal.tsx
// Visualiseur du "FORMULAIRE DE DEMANDE DE PERMISSION (BULLETIN INDIVIDUEL)"
// Conforme au modèle officiel d'entreprise Agilly
// ============================================================

"use client";

import { DemandeRHItem } from "@/types/absences.types";

interface PermissionViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  demande: DemandeRHItem | null;
}

export function PermissionViewerModal({
  isOpen,
  onClose,
  demande,
}: PermissionViewerModalProps) {
  if (!isOpen || !demande || !demande.documentPermission) return null;

  const doc = demande.documentPermission;

  const handleDownloadSimulation = () => {
    alert(`Téléchargement du bulletin officiel certifié [${doc.numeroUnique}.pdf] en cours...`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-100/90 rounded-2xl border border-slate-300 w-full max-w-2xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col font-sans">
        
        {/* BARRE D'ACTIONS DU DOCUMENT */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Bulletin Individuel d'Absence Archivé
            </span>
            <span className="text-sm font-bold text-slate-900">
              {doc.numeroUnique}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadSimulation}
              className="bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-base font-bold"
            >
              &times;
            </button>
          </div>
        </div>

        {/* ── APERÇU DU FORMULAIRE OFFICIEL FORMAT A4 ── */}
        <div className="p-6 sm:p-8 flex justify-center">
          <div className="bg-white rounded-xl border border-slate-300 shadow-md w-full max-w-xl p-8 text-slate-900 relative space-y-6">
            
            {/* EN-TÊTE DU DOCUMENT */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">AGILLY</span>
                  <span className="text-xs font-bold text-[#F0822A] tracking-wider">GROUP</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 m-0">
                  Direction des Ressources Humaines
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-medium">Référence :</span>
                <span className="text-xs font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {doc.numeroUnique}
                </span>

                <div className="mt-1.5 w-12 h-12 border border-slate-200 rounded p-1 bg-white flex flex-col items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <line x1="14" y1="14" x2="14" y2="14.01"/>
                    <line x1="18" y1="14" x2="18" y2="17"/>
                  </svg>
                  <span className="text-[5px] font-bold text-slate-400">CERTIFIÉ</span>
                </div>
              </div>
            </div>

            {/* TITRE CADRÉ CONFORME AU DOCUMENT EXCEL */}
            <div className="text-center py-2.5 border-2 border-slate-900 bg-slate-50/50">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 m-0">
                FORMULAIRE DE DEMANDE DE PERMISSION
              </h2>
              <span className="text-[10px] text-slate-500 font-medium">Bulletin Individuel</span>
            </div>

            {/* TABLEAU IDENTIFICATION DU SALARIÉ */}
            <div className="border border-slate-300 text-xs divide-y divide-slate-200">
              <div className="grid grid-cols-3 p-2 bg-slate-50/60 font-medium">
                <span className="text-slate-500 font-bold">Matricule</span>
                <span className="col-span-2 font-bold text-slate-900">{demande.demandeur.matricule}</span>
              </div>
              <div className="grid grid-cols-3 p-2">
                <span className="text-slate-500 font-bold">Nom, prénoms</span>
                <span className="col-span-2 font-bold text-slate-900">{demande.demandeur.nom} {demande.demandeur.prenom}</span>
              </div>
              <div className="grid grid-cols-3 p-2 bg-slate-50/60 font-medium">
                <span className="text-slate-500 font-bold">Fonction</span>
                <span className="col-span-2 text-slate-800">{demande.demandeur.poste}</span>
              </div>
              <div className="grid grid-cols-3 p-2">
                <span className="text-slate-500 font-bold">Département</span>
                <span className="col-span-2 text-slate-800">{demande.demandeur.departement}</span>
              </div>
              <div className="grid grid-cols-3 p-2 bg-slate-50/60 font-medium">
                <span className="text-slate-500 font-bold">N° CNSS</span>
                <span className="col-span-2 text-slate-800">{demande.demandeur.numeroCnss || "CI-0019284729-A"}</span>
              </div>
            </div>

            {/* SECTION TYPE DE PERMISSION AVEC CASES À COCHER */}
            <div className="border border-slate-300 p-3 text-xs space-y-2">
              <span className="font-bold text-slate-900 block">Type de permission :</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { label: "Congés Annuels", match: "CONGES_ANNUELS" },
                  { label: "Congés Maladie", match: "CONGES_MALADIE" },
                  { label: "Congés Maternité", match: "CONGES_MATERNITE" },
                  { label: "Récupération", match: "RECUPERATION" },
                  { label: "Absence autorisée non payée", match: "ABSENCE_NON_PAYEE" },
                  { label: "Permission Exceptionnelle", match: "PERMISSION_EXCEPTIONNELLE" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border border-slate-400 flex items-center justify-center font-bold text-[9px] bg-slate-50">
                      {demande.typeDemande === item.match ? "X" : ""}
                    </span>
                    <span className={demande.typeDemande === item.match ? "font-bold text-slate-900" : "text-slate-600"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Nombre de jours (Jours calendaires) :</span>
                <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 border border-slate-300">
                  {demande.nombreJoursCalendaires || demande.nombreJoursOuvres} jour(s)
                </span>
              </div>
            </div>

            {/* SECTION PÉRIODE & MOTIF */}
            <div className="border border-slate-300 p-3 text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Période d'absence :</span>
                <span className="font-bold text-slate-900">
                  Du {new Date(demande.dateDebut).toLocaleDateString("fr-FR")} Au {new Date(demande.dateFin).toLocaleDateString("fr-FR")} inclus
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Motif de la permission :</span>
                <p className="m-0 text-slate-800 italic bg-slate-50 p-2 border border-slate-200 rounded">
                  "{demande.motif}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Adresse et contact téléphonique pendant l'absence :</span>
                <p className="m-0 text-slate-900 font-medium">
                  {demande.adresseContactPendantAbsence || "Abidjan, Contact: " + demande.demandeur.telephone}
                </p>
              </div>
            </div>

            {/* CADRE RÉSERVÉ À LA DRH (BALANCE DE CONGÉS PAYÉS) */}
            <div className="border-2 border-slate-800 p-3 text-xs bg-slate-50/40">
              <span className="font-extrabold uppercase text-[10px] text-slate-700 block mb-1">
                Cadre réservé à la DRH
              </span>
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-2 bg-white">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Balance de congés payés restants :</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {doc.balanceCongesPayesSolde || 14.5} jours
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-medium block">Date de visa DRH :</span>
                  <span className="font-bold text-slate-900">
                    {new Date(doc.dateEmission).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            {/* SIGNATURES OFFICIELLES (SIGNATURE SALARIÉ & VALIDATION GÉRANT) */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="border border-slate-300 p-3 h-24 flex flex-col justify-between bg-slate-50/30">
                <span className="font-bold text-slate-700">Signature Salarié</span>
                <div className="text-[10px] text-slate-500">
                  <p className="m-0 font-semibold text-slate-800">{demande.demandeur.prenom} {demande.demandeur.nom}</p>
                  <p className="m-0 text-[9px] text-slate-400">Signé le {new Date(demande.dateCreation).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              <div className="border border-slate-300 p-3 h-24 flex flex-col justify-between bg-slate-50/30">
                <span className="font-bold text-slate-700">Validation Gérant / Direction</span>
                <div className="text-[10px] text-slate-500">
                  <p className="m-0 font-semibold text-slate-800">Christian BAMBA (Gérant)</p>
                  <p className="m-0 text-[9px] font-semibold text-emerald-700">Visa Officiel Approuvé</p>
                </div>
              </div>
            </div>

            {/* PIED DU DOCUMENT */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-400">
              <span>Édité par : {doc.emetteurAgentNom} ({doc.emetteurAgentMatricule})</span>
              <span>GED Sécurisée Agilly Group · Conservation légale 5 ans</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
