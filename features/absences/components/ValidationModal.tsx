// ============================================================
// features/absences/components/ValidationModal.tsx
// Fenêtre de décision d'approbation ou de rejet — Clean Light Design
// ============================================================

"use client";

import { useState } from "react";
import { DemandeRHItem } from "@/types/absences.types";
import { PersonaUser } from "@/types/absences.types";
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col font-sans">
        
        {/* EN-TÊTE MODERNE */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#F0822A]">
                {demande.codeReference}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {demande.libelleType}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 m-0">
              Examen de la demande · {demande.demandeur.prenom} {demande.demandeur.nom}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-base font-bold"
          >
            &times;
          </button>
        </div>

        {/* STEPPER DU WORKFLOW */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-100">
          <DemandeWorkflowStepper demande={demande} />
        </div>

        {/* CORPS DE L'EXAMEN */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* SYNTHÈSE DU DEMANDEUR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 rounded-xl p-4 border border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Demandeur</span>
              <p className="font-bold text-slate-900 text-sm m-0">
                {demande.demandeur.prenom} {demande.demandeur.nom}
              </p>
              <p className="text-slate-600 m-0">{demande.demandeur.poste}</p>
              <p className="text-slate-400 m-0 text-[11px]">{demande.demandeur.service}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Période sollicitée</span>
              <p className="font-bold text-slate-900 text-sm m-0">
                Du {new Date(demande.dateDebut).toLocaleDateString("fr-FR")} au {new Date(demande.dateFin).toLocaleDateString("fr-FR")}
              </p>
              <p className="text-[#EA580C] font-semibold m-0">
                {demande.nombreJoursOuvres} jour(s) ouvré(s) décompté(s)
              </p>
              {demande.destination && (
                <p className="text-slate-600 font-medium m-0 mt-0.5">
                  Destination : {demande.destination}
                </p>
              )}
            </div>
          </div>

          {/* MOTIF DÉCLARÉ */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Motif de la demande
            </span>
            <p className="text-slate-800 font-normal leading-relaxed m-0">
              "{demande.motif}"
            </p>
          </div>

          {/* PIÈCES JOINTES */}
          {demande.piecesJointes.length > 0 && (
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Documents justificatifs joints
              </span>
              <div className="space-y-1.5">
                {demande.piecesJointes.map((pj) => (
                  <div key={pj.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-medium text-slate-700">{pj.nomOriginal} ({pj.taille})</span>
                    <span className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline">Ouvrir PJ</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORIQUE DU WORKFLOW */}
          <div className="rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-50/70 px-4 py-2.5 text-xs font-semibold text-slate-600 border-b border-slate-100">
              Journal d'audit du circuit
            </div>
            <div className="divide-y divide-slate-100 p-1">
              {demande.historique.map((h) => (
                <div key={h.id} className="p-3 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{h.acteurNom}</span>
                      <span className="text-slate-400 text-[11px]">({h.acteurPoste})</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          h.decision === "VALIDE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                            : h.decision === "REFUSE_RETOUR"
                            ? "bg-rose-50 text-rose-700 border border-rose-200/70"
                            : "bg-blue-50 text-blue-700 border border-blue-200/70"
                        }`}
                      >
                        {h.decision}
                      </span>
                    </div>
                    {h.motif && (
                      <p className="text-slate-600 italic m-0 mt-1 font-normal">
                        "{h.motif}"
                      </p>
                    )}
                  </div>
                  <span className="text-slate-400 text-[11px] shrink-0 font-medium">
                    {new Date(h.dateAction).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULAIRE DE VALIDATION ACCORDÉE */}
          {modeAction === "APPROUVER" && (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
              <span className="text-xs font-bold text-emerald-900 block">
                Confirmer l'accord managérial
              </span>
              <p className="text-emerald-800 m-0 leading-relaxed font-normal">
                En tant que <strong className="font-semibold">{currentPersona.labelRole}</strong>, vous approuvez formellement cette demande.
              </p>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Commentaire facultatif :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Validé, bonne mission !"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModeAction("OVERVIEW")}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Valider définitivement (OK)
                </button>
              </div>
            </div>
          )}

          {/* FORMULAIRE DE REJET AVEC RETOUR */}
          {modeAction === "REFUSER" && (
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">
                  Refus avec retour à l'étape précédente
                </span>
                <span className="text-[11px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Retour vers : {getDestinataireRetour()}
                </span>
              </div>

              <div>
                <label className="block text-rose-950 font-semibold mb-1">
                  Motif obligatoire du refus (RG-05) :
                </label>
                <textarea
                  rows={2}
                  placeholder="Précisez la raison du refus pour permettre au collaborateur d'ajuster sa demande..."
                  value={motifRefus}
                  onChange={(e) => setMotifRefus(e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-lg p-2.5 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModeAction("OVERVIEW")}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Confirmer le rejet avec motif
                </button>
              </div>
            </div>
          )}

        </div>

        {/* PIED DE MODALE */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          {modeAction === "OVERVIEW" && (
            <div className="flex items-center gap-2.5">
              {currentPersona.role === "AGENT_DRH" && demande.statut === "APPROUVEE" && (
                <button
                  type="button"
                  onClick={() => {
                    onGeneratePermission(demande);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold cursor-pointer shadow-xs"
                >
                  Éditer la permission (PDF numéroté)
                </button>
              )}

              {["SUPERIEUR_N1", "DRH", "DIRECTION_DG"].includes(currentPersona.role) &&
                ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(demande.statut) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModeAction("REFUSER")}
                      className="px-4 py-2 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold cursor-pointer transition-colors"
                    >
                      Refuser / Retourner
                    </button>
                    <button
                      type="button"
                      onClick={() => setModeAction("APPROUVER")}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs transition-colors"
                    >
                      Valider la demande
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
