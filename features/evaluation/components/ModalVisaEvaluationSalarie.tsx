// ============================================================
// features/evaluation/components/ModalVisaEvaluationSalarie.tsx
// Modal Soft UI pour le Visa / Accord du Salarié sur la Note d'Évaluation (Étape 7)
// Remplace proprement tout prompt/confirm natif par un dialogue soft Agilly
// ============================================================

"use client";

import { useState } from "react";
import { CheckCircleIcon, ScaleIcon, CheckIcon } from "@/components/ui/Icons";
import { evaluationsApi } from "@/lib/api/evaluations.api";

interface ModalVisaEvaluationSalarieProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  noteGlobale?: number | null;
  mode: "ACCORD" | "ARBITRAGE";
  onSuccess: () => void;
}

export function ModalVisaEvaluationSalarie({
  isOpen,
  onClose,
  evaluationId,
  noteGlobale,
  mode,
  onSuccess,
}: ModalVisaEvaluationSalarieProps) {
  const [observation, setObservation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAccord = mode === "ACCORD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAccord && !observation.trim()) {
      setErrorMessage("Veuillez préciser le motif de votre contestation pour la Direction des Ressources Humaines.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await evaluationsApi.submitVisaSalarie(evaluationId, {
        accord: isAccord,
        observation: observation.trim() || (isAccord ? "Visa et accord accordés sans réserve par le salarié." : ""),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("[ModalVisaEvaluationSalarie] Erreur visa:", err);
      setErrorMessage(err?.message || "Une erreur est survenue lors de l'enregistrement de votre décision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg border border-slate-200/80 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className={`px-6 py-5 border-b flex items-start gap-4 ${
          isAccord
            ? "bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border-emerald-100"
            : "bg-gradient-to-r from-rose-50 via-red-50/40 to-white border-rose-100"
        }`}>
          <div className={`w-11 h-11 text-white flex items-center justify-center shrink-0 shadow-sm ${
            isAccord ? "bg-emerald-600" : "bg-red-600"
          }`}>
            {isAccord ? (
              <CheckCircleIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <ScaleIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border ${
              isAccord
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-rose-100 text-rose-800 border-rose-300"
            }`}>
              {isAccord ? "Étape 7 • Visa & Accord Salarié" : "Étape 7 • Demande d'Arbitrage RH"}
            </span>
            <h2 className="text-lg font-black text-slate-900 m-0 mt-1 tracking-tight">
              {isAccord ? "Valider mon accord sur l'évaluation" : "Solliciter un arbitrage de la Direction RH"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 leading-none transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Note globale récap */}
          {noteGlobale !== undefined && noteGlobale !== null && (
            <div className="bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Note finale attribuée
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  Évaluation annuelle arrêtée par le N+1 et validée par le N+2
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#F0822A]">
                  {Number(noteGlobale).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-400"> / 20</span>
              </div>
            </div>
          )}

          {isAccord ? (
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-950 space-y-1.5 leading-relaxed">
              <p className="font-bold m-0">✓ Déclaration d&apos;accord sans réserve :</p>
              <p className="m-0 text-emerald-900">
                Vous confirmez avoir pris connaissance des notes et appréciations portées par vos évaluateurs. Votre dossier sera immédiatement clôturé et archivé.
              </p>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 p-4 text-xs text-rose-950 space-y-1.5 leading-relaxed">
              <p className="font-bold m-0">⚖ Procédure d&apos;arbitrage contradictoire :</p>
              <p className="m-0 text-rose-900">
                La contestation saisira formellement la Direction des Ressources Humaines. Un entretien tripartite réunira le N+1, le N+2 et la DRH pour réexaminer votre dossier.
              </p>
            </div>
          )}

          {/* Saisie commentaire / motif */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isAccord ? (
                <>Observations éventuelles <span className="text-slate-400 font-normal">(optionnel)</span></>
              ) : (
                <>Motif précis de votre contestation <span className="text-rose-600">*</span></>
              )}
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder={
                isAccord
                  ? "Ex: Accord donné sans réserve. Entretien d'évaluation constructif..."
                  : "Ex: Désaccord sur l'évaluation de l'objectif X, pièces justificatives fournies lors de l'entretien non prises en compte..."
              }
              rows={3}
              disabled={isSubmitting}
              className={`w-full p-3 border text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none ${
                isAccord
                  ? "border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  : "border-rose-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              }`}
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span>⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isAccord && !observation.trim())}
              className={`px-6 py-2.5 text-white font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 ${
                isAccord
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin inline-block" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  {isAccord ? <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} /> : <ScaleIcon size={14} />}
                  <span>{isAccord ? "Confirmer mon Accord" : "Transmettre la contestation"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
