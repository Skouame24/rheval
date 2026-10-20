// ============================================================
// features/absences/components/ValidationModal.tsx
// Fenêtre de décision d'approbation ou de rejet avec motif obligatoire
// Gère la cascade N-1 et le garde-fou des 2 cycles max
// ============================================================

"use client";

import { useState } from "react";
import { DemandeRHItem } from "@/types/absences.types";
import { PersonaUser } from "@/lib/mock/absences.mock";
import { DemandeWorkflowStepper } from "./DemandeWorkflowStepper";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  demande: DemandeRHItem | null;
  currentPersona: PersonaUser;
  onApprove: (demandeId: string, observation?: string) => void;
  onRejectReturn: (demandeId: string, motifObligatoire: string) => void;
  onRejectDefinitif: (demandeId: string, motif: string) => void;
  onGeneratePermission: (demande: DemandeRHItem) => void;
}

export function ValidationModal({
  isOpen,
  onClose,
  demande,
  currentPersona,
  onApprove,
  onRejectReturn,
  onRejectDefinitif,
  onGeneratePermission,
}: ValidationModalProps) {
  if (!isOpen || !demande) return null;

  const [modeAction, setModeAction] = useState<"OVERVIEW" | "APPROUVER" | "REFUSER">("OVERVIEW");
  const [observation, setObservation] = useState("");
  const [motifRefus, setMotifRefus] = useState("");

  // Déterminer qui est le destinataire du retour en cas de rejet (RG-05)
  const getDestinataireRetour = () => {
    switch (currentPersona.role) {
      case "SUPERIEUR_N1":
        return "l'Employé (Ebenezer Samuel KOUAME)";
      case "DRH":
        return "le Supérieur Hiérarchique N+1 (Samuel KOUAME)";
      case "DIRECTION_DG":
        return "la DRH (Marie-Claire TOURE)";
      default:
        return "l'étape précédente";
    }
  };

  const isCycleMax = demande.cycleRetoursCount >= 2;

  const handleConfirmApprove = () => {
    onApprove(demande.id, observation);
    onClose();
  };

  const handleConfirmReject = () => {
    if (!motifRefus.trim()) {
      alert("Le motif de refus est obligatoire selon la règle de gestion RG-05.");
      return;
    }
    if (isCycleMax) {
      onRejectDefinitif(demande.id, motifRefus);
    } else {
      onRejectReturn(demande.id, motifRefus);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col font-sans select-none">
        
        {/* EN-TÊTE OFFICIEL */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-b-[#F0822A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F0822A]">
                EXAMEN & DÉCISION DE WORKFLOW
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 border border-slate-700">
                {demande.codeReference}
              </span>
            </div>
            <h3 className="text-lg font-black text-white m-0 tracking-tight mt-0.5">
              Demande de {demande.libelleType} — {demande.demandeur.prenom} {demande.demandeur.nom}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-black text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* STEPPER DU CIRCUIT */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <DemandeWorkflowStepper demande={demande} />
        </div>

        {/* CORPS DE L'EXAMEN */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* FICHE SYNTHÈSE DU DEMANDEUR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Demandeur :</span>
              <p className="text-sm font-black text-slate-900 m-0">
                {demande.demandeur.prenom} {demande.demandeur.nom}
              </p>
              <p className="text-slate-600 m-0">{demande.demandeur.poste}</p>
              <p className="text-[11px] text-slate-500 m-0">{demande.demandeur.service} ({demande.demandeur.matricule})</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Période & Durée :</span>
              <p className="text-sm font-black text-slate-900 m-0">
                Du {new Date(demande.dateDebut).toLocaleDateString("fr-FR")} au {new Date(demande.dateFin).toLocaleDateString("fr-FR")}
              </p>
              <p className="text-[#EA580C] font-extrabold m-0">
                {demande.nombreJoursOuvres} jour(s) ouvré(s) décompté(s)
              </p>
              {demande.destination && (
                <p className="text-slate-700 font-bold m-0 mt-0.5">
                  📍 Destination : {demande.destination}
                </p>
              )}
            </div>
          </div>

          {/* MOTIF & JUSTIFICATION */}
          <div className="bg-white p-4 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Motif déclaré par le demandeur :</span>
            <p className="text-slate-800 font-medium text-xs leading-relaxed m-0 mt-1">
              "{demande.motif}"
            </p>
          </div>

          {/* PIÈCES JOINTES */}
          {demande.piecesJointes.length > 0 && (
            <div className="bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Documents justificatifs joints :</span>
              <div className="mt-2 space-y-1.5">
                {demande.piecesJointes.map((pj) => (
                  <div key={pj.id} className="flex items-center justify-between bg-white p-2 border border-slate-200">
                    <span className="font-bold text-slate-800">📄 {pj.nomOriginal} ({pj.taille})</span>
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase">Consulter PJ</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORIQUE COMPLET DES DÉCISIONS HORODATÉES */}
          <div className="border border-slate-200">
            <div className="bg-slate-100 px-4 py-2 text-[10px] font-black text-slate-600 uppercase">
              Journal d'audit du circuit de validation
            </div>
            <div className="divide-y divide-slate-100 p-2">
              {demande.historique.map((h) => (
                <div key={h.id} className="p-2 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{h.acteurNom}</span>
                      <span className="text-[10px] text-slate-500 font-medium">({h.acteurPoste})</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 ${
                          h.decision === "VALIDE"
                            ? "bg-emerald-100 text-emerald-800"
                            : h.decision === "REFUSE_RETOUR"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {h.decision}
                      </span>
                    </div>
                    {h.motif && (
                      <p className="text-[11px] text-slate-600 italic m-0 mt-0.5">
                        "{h.motif}"
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {new Date(h.dateAction).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ZONE DE DÉCISION CONTEXTUELLE */}
          {modeAction === "APPROUVER" && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 space-y-3">
              <span className="text-xs font-black text-emerald-900 uppercase">
                Confirmer l'Approbation de la Demande
              </span>
              <p className="text-slate-700 font-medium">
                En qualité de <span className="font-bold">{currentPersona.labelRole}</span>, vous validez formellement cette demande. Elle passera à l'étape suivante.
              </p>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Observation ou note managériale (facultatif) :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Validé, bonne mission !"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full bg-white border border-emerald-300 p-2 text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModeAction("OVERVIEW")}
                  className="px-3 py-1.5 bg-white border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Confirmer la Validation (OK) ✓
                </button>
              </div>
            </div>
          )}

          {modeAction === "REFUSER" && (
            <div className="p-4 bg-red-50 border border-red-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-900 uppercase">
                  Refus avec Retour au niveau précédent (Règle RG-05)
                </span>
                <span className="text-[10px] font-black bg-red-200 text-red-900 px-2 py-0.5">
                  Retour vers : {getDestinataireRetour()}
                </span>
              </div>
              
              {isCycleMax ? (
                <div className="p-2.5 bg-red-100 text-red-900 font-bold text-[11px] border border-red-300">
                  ⚠️ Plafond des 2 cycles atteint ! Ce refus sera classé comme « REFUS DÉFINITIF ».
                </div>
              ) : (
                <p className="text-red-800 font-medium">
                  La demande retournera à <span className="font-bold">{getDestinataireRetour()}</span> avec votre motif d'explication obligatoire pour correction.
                </p>
              )}

              <div>
                <label className="block text-red-950 font-black mb-1">
                  Motif obligatoire du refus / retour * :
                </label>
                <textarea
                  rows={3}
                  placeholder="Expliquez précisément la raison du refus (pièces manquantes, incompatibilité de dates, refus de budget...)"
                  value={motifRefus}
                  onChange={(e) => setMotifRefus(e.target.value)}
                  className="w-full bg-white border border-red-300 p-2 text-xs outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModeAction("OVERVIEW")}
                  className="px-3 py-1.5 bg-white border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  {isCycleMax ? "Confirmer le Refus Définitif" : "Confirmer le Rejet avec Motif (Non OK) ✕"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* PIED DE MODALE AVEC LES BOUTONS D'ACTION */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
          >
            Fermer
          </button>

          {/* ACTIONS DISPONIBLES SI ON EST EN MODE OVERVIEW */}
          {modeAction === "OVERVIEW" && (
            <div className="flex items-center gap-3">
              {/* Cas Spécifique Agent DRH sur demande Approuvée */}
              {currentPersona.role === "AGENT_DRH" && demande.statut === "APPROUVEE" && (
                <button
                  type="button"
                  onClick={() => {
                    onGeneratePermission(demande);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-black uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Éditer la Permission Officielle (PDF Numéroté) →
                </button>
              )}

              {/* Cas Valideurs N+1, DRH ou DG */}
              {["SUPERIEUR_N1", "DRH", "DIRECTION_DG"].includes(currentPersona.role) &&
                ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(demande.statut) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModeAction("REFUSER")}
                      className="px-4 py-2 bg-white border border-red-300 text-red-700 font-black hover:bg-red-50 cursor-pointer"
                    >
                      Refuser / Renvoyer (Non OK)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeAction("APPROUVER")}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      Valider la Demande (OK) ✓
                    </button>
                  </>
                )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

