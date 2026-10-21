// ============================================================
// features/evaluation/components/ModalAccordObjectifsSalarie.tsx
// Modal Soft UI d'Accord & Prise de Connaissance des Objectifs par le Salarié (Étape 4)
// Design System Soft UI Agilly Enterprise
// ============================================================

"use client";

import { useState } from "react";
import { CheckCircleIcon, TargetIcon, CheckIcon } from "@/components/ui/Icons";
import { evaluationsApi } from "@/lib/api/evaluations.api";

interface ModalAccordObjectifsSalarieProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  objectifs: Array<{
    id?: string;
    intitule: string;
    ponderation?: number;
    description?: string;
  }>;
  cycleLibelle?: string;
  onSuccess: () => void;
}

export function ModalAccordObjectifsSalarie({
  isOpen,
  onClose,
  evaluationId,
  objectifs = [],
  cycleLibelle = "Campagne Annuelle 2026",
  onSuccess,
}: ModalAccordObjectifsSalarieProps) {
  const [observation, setObservation] = useState("");
  const [hasAttested, setHasAttested] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPonderation = objectifs.reduce((acc, obj) => acc + (Number(obj.ponderation) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAttested) {
      setErrorMessage("Veuillez cocher la case d'attestation pour confirmer votre accord.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await evaluationsApi.validateObjectifsSalarie(evaluationId, {
        accord: true,
        observation: observation.trim() || "Accord et prise de connaissance des objectifs confirmés par le salarié.",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("[ModalAccordObjectifsSalarie] Erreur validation:", err);
      setErrorMessage(err?.message || "Une erreur est survenue lors de la validation de vos objectifs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl border border-slate-200/80 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* En-tête douce Agilly */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border-b border-emerald-100 flex items-start gap-4">
          <div className="w-11 h-11 bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircleIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                Étape 4 sur 8 • Accord Salarié
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {cycleLibelle}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 m-0 mt-1 tracking-tight">
              Prise de Connaissance & Accord sur vos Objectifs
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 leading-none transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Alerte explicative soft */}
          <div className="bg-slate-50 border border-slate-200/90 p-4 text-xs text-slate-700 leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span>🎯</span>
              <span>Validation de votre feuille de route annuelle</span>
            </div>
            <p className="m-0 text-slate-600">
              Vos objectifs ont été fixés d&apos;un commun accord avec votre <strong>Responsable N+1</strong>, vérifiés par la <strong>Direction des RH</strong> et formellement visés par votre <strong>Direction N+2</strong>.
            </p>
          </div>

          {/* Récapitulatif des objectifs assignés */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Synthèse des Objectifs Assignés ({objectifs.length})
              </span>
              <span className={`text-xs font-black px-2 py-0.5 ${totalPonderation === 100 ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-amber-700 bg-amber-50"}`}>
                Pondération totale : {totalPonderation}%
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 divide-y divide-slate-100 bg-white">
              {objectifs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Aucun objectif répertorié.
                </div>
              ) : (
                objectifs.map((obj, idx) => (
                  <div key={obj.id || idx} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-[10px] font-black text-[#F0822A] bg-orange-50 border border-orange-200 px-1.5 py-0.5 shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 m-0 leading-snug">
                          {obj.intitule}
                        </p>
                        {obj.description && (
                          <p className="text-[11px] text-slate-500 m-0 mt-0.5 line-clamp-1">
                            {obj.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {obj.ponderation !== undefined && (
                      <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 shrink-0">
                        {obj.ponderation}%
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Champ d'observation optionnel */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Observations ou précisions éventuelles <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Objectifs bien compris et pris en compte. Les moyens nécessaires ont été convenus lors de l'entretien..."
              rows={2}
              disabled={isSubmitting}
              className="w-full p-3 border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all resize-none"
            />
          </div>

          {/* Case d'engagement formel */}
          <label className="flex items-start gap-3 p-3 bg-emerald-50/60 border border-emerald-200/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAttested}
              onChange={(e) => setHasAttested(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 w-4 h-4 accent-emerald-600 rounded-none cursor-pointer"
            />
            <span className="text-xs font-semibold text-emerald-950 leading-relaxed">
              Je confirme avoir pris connaissance de mes objectifs pour le cycle et je donne mon accord sur cette feuille de route annuelle.
            </span>
          </label>

          {/* Message d'erreur si présent */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span>⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Relire plus tard
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasAttested}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin inline-block" />
                  <span>Confirmation en cours...</span>
                </>
              ) : (
                <>
                  <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />
                  <span>Confirmer mon Accord</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
