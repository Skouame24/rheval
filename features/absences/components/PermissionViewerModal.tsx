// ============================================================
// features/absences/components/PermissionViewerModal.tsx
// Visualiseur haute fidélité du document PDF officiel de permission
// Comporte le numéro unique, le QR code, le cachet et signatures
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
    alert(`Téléchargement du document officiel certifié [${doc.numeroUnique}.pdf] en cours...`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-100 border border-slate-300 w-full max-w-3xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col font-sans select-none">
        
        {/* BARRE D'ACTIONS DU DOCUMENT */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b-2 border-b-[#F0822A]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase text-[#F0822A] bg-orange-950/80 px-2 py-0.5 border border-orange-800">
              GED AGILLY — CERTIFICAT RH
            </span>
            <span className="text-xs font-bold text-slate-300">
              {doc.numeroUnique}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSimulation}
              className="bg-[#F0822A] hover:bg-[#D96F1D] text-white font-extrabold text-xs px-3 py-1.5 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white font-black text-lg p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── DOCUMENT PDF VIRTUEL HAUTE FIDÉLITÉ (FORMAT A4) ── */}
        <div className="p-6 md:p-10 flex justify-center">
          <div className="bg-white border-2 border-slate-300 shadow-xl w-full max-w-2xl p-8 md:p-12 text-slate-900 relative">
            
            {/* EN-TÊTE INSTITUTIONNEL */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black tracking-tight text-slate-900">AGILLY</span>
                  <span className="text-xs font-black text-[#F0822A] tracking-widest uppercase">GROUP</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Direction des Ressources Humaines & Affaires Juridiques
                </p>
                <p className="text-[10px] text-slate-400">
                  Plateforme Numérique Officielle de Gestion du Personnel
                </p>
              </div>

              {/* NUMERO UNIQUE & QR CODE */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Numéro Unique Enregistré :</span>
                <span className="text-sm font-black text-[#EA580C] bg-orange-50 px-2 py-0.5 border border-orange-200 mt-0.5">
                  {doc.numeroUnique}
                </span>

                {/* QR CODE VECTORIEL SIMULÉ */}
                <div className="mt-2 w-16 h-16 border border-slate-300 p-1 bg-white flex flex-col items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <line x1="14" y1="14" x2="14" y2="14.01"/>
                    <line x1="18" y1="14" x2="18" y2="17"/>
                    <line x1="14" y1="18" x2="17" y2="18"/>
                    <line x1="20" y1="20" x2="20" y2="20.01"/>
                  </svg>
                  <span className="text-[7px] font-bold text-slate-400">VERIF AGILLY</span>
                </div>
              </div>
            </div>

            {/* TITRE DU DOCUMENT */}
            <div className="text-center my-6 py-3 bg-slate-50 border-y border-slate-200">
              <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-slate-900 m-0">
                AUTORISATION OFFICIELLE D'ABSENCE & PERMISSION DE SORTIE
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F0822A]">
                Document Authentifié & Tracé dans la GED Sécurisée
              </span>
            </div>

            {/* TABLEAU RÉCAPITULATIF DU COLLABORATEUR */}
            <div className="space-y-4 text-xs mb-8">
              <div className="grid grid-cols-2 gap-4 border border-slate-200 p-3 bg-slate-50/50">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Nom & Prénoms :</span>
                  <p className="font-black text-slate-900 m-0 text-sm">
                    {demande.demandeur.prenom} {demande.demandeur.nom}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Matricule Salarié :</span>
                  <p className="font-black text-slate-900 m-0 text-sm">
                    {demande.demandeur.matricule}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Direction / Département :</span>
                  <p className="font-bold text-slate-800 m-0">
                    {demande.demandeur.departement}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Poste Occupé :</span>
                  <p className="font-bold text-slate-800 m-0">
                    {demande.demandeur.poste}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 p-3 bg-white space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Nature de l'autorisation :</span>
                    <p className="font-black text-[#EA580C] m-0">
                      {demande.libelleType}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Nombre de Jours Autorisés :</span>
                    <p className="font-black text-slate-900 m-0 text-sm">
                      {demande.nombreJoursOuvres} jour(s) ouvré(s)
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Période accordée :</span>
                  <p className="font-extrabold text-slate-900 m-0">
                    Du {new Date(demande.dateDebut).toLocaleDateString("fr-FR")} au {new Date(demande.dateFin).toLocaleDateString("fr-FR")} inclus
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Motif déclaré :</span>
                  <p className="text-slate-700 italic m-0">
                    "{demande.motif}"
                  </p>
                </div>

                {demande.destination && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Destination du déplacement :</span>
                    <p className="font-bold text-slate-900 m-0">
                      📍 {demande.destination} (Moyen: {demande.moyenTransport || "Non précisé"})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* VISAS ET SIGNATURES OFFICIELLES (3 NIVEAUX) */}
            <div className="grid grid-cols-3 gap-3 border-t-2 border-slate-200 pt-6 mb-8 text-[11px]">
              {/* Visa N+1 */}
              <div className="border border-slate-200 p-2.5 text-center bg-slate-50/50">
                <span className="text-[9px] font-black uppercase text-slate-500">1. VISA RESPONSABLE N+1</span>
                <p className="font-bold text-slate-800 m-0 mt-1">Samuel KOUAME</p>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 border border-emerald-200 inline-block my-1">
                  SIGNÉ ÉLECTRONIQUEMENT
                </span>
                <p className="text-[8px] text-slate-400">Horodaté sur serveur SSO</p>
              </div>

              {/* Visa DRH */}
              <div className="border border-slate-200 p-2.5 text-center bg-slate-50/50">
                <span className="text-[9px] font-black uppercase text-slate-500">2. VISA DIRECTION RH</span>
                <p className="font-bold text-slate-800 m-0 mt-1">Marie-Claire TOURE</p>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 border border-emerald-200 inline-block my-1">
                  CONTRÔLE VALIDÉ
                </span>
                <p className="text-[8px] text-slate-400">Solde décompté & archivé</p>
              </div>

              {/* Visa Direction Générale */}
              <div className="border border-slate-200 p-2.5 text-center bg-slate-50/50">
                <span className="text-[9px] font-black uppercase text-slate-500">3. VISA DIRECTION GÉNÉRALE</span>
                <p className="font-bold text-slate-800 m-0 mt-1">Christian BAMBA</p>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 border border-emerald-200 inline-block my-1">
                  ACCORD DÉFINITIF
                </span>
                <p className="text-[8px] text-slate-400">Président Directeur Général</p>
              </div>
            </div>

            {/* CACHET OFFICIEL AGILLY & HASH DE SÉCURITÉ */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[9px] text-slate-500 flex-wrap gap-2">
              <div>
                <p className="font-bold text-slate-700 m-0">Édité par : {doc.emetteurAgentNom} ({doc.emetteurAgentMatricule})</p>
                <p className="m-0 text-[8px] font-mono text-slate-400">
                  Hash SHA-256 : {doc.hashSha256.substring(0, 32)}...
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-[#EA580C] uppercase m-0">CACHET ÉLECTRONIQUE SÉCURISÉ AGILLY</p>
                <p className="m-0 text-slate-400">Conservation légale GED : {doc.dureeConservationAnnees} ans</p>
              </div>
            </div>

          </div>
        </div>

        {/* PIED DE MODALE */}
        <div className="bg-slate-200 p-4 border-t border-slate-300 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">
            Permission enregistrée sous la référence unique : <span className="text-slate-900 font-black">{doc.numeroUnique}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 cursor-pointer"
          >
            Fermer l'Aperçu
          </button>
        </div>

      </div>
    </div>
  );
}

