// ============================================================
// features/evaluation/components/ModalDefinirObjectifs.tsx
// Modal de Définition des Objectifs (N+1 / N+2 / RH — Ergonomie IBM Carbon / Agilly Soft UI)
// ============================================================

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { objectivesApi } from "@/lib/api/objectives.api";
import { ScaleIcon, TrashIcon, TargetIcon, CheckCircleIcon, AlertTriangleIcon } from "@/components/ui/Icons";

interface ModalDefinirObjectifsProps {
  isOpen: boolean;
  onClose: () => void;
  salariedName: string;
  salariedPoste?: string;
  salariedId?: string;
  isN1Validated?: boolean;
  objectifs?: any[];
  onSaved?: () => void;
}

interface ObjectifItem {
  id: string;
  intitule: string;
  ponderation: number;
  showCriteres?: boolean;
  criteres: {
    t18_20: string;
    t15_17: string;
    t12_14: string;
    t0_11: string;
  };
}

const TEMPLATES_SUGGESTIONS = [
  "Livraison des projets dans les délais et respect des jalons",
  "Qualité des livrables techniques et conformité aux standards",
  "Gestion et optimisation de la disponibilité des systèmes",
  "Développement des compétences et partage de connaissances",
];

export function ModalDefinirObjectifs({
  isOpen,
  onClose,
  salariedName,
  salariedPoste,
  salariedId,
  isN1Validated = false,
  objectifs: initialObjectifs,
  onSaved,
}: ModalDefinirObjectifsProps) {
  const { user, role } = useAuth();

  // Droit d'édition :
  // Si c'est un collaborateur qui consulte ses propres objectifs -> lecture seule
  // Si c'est un N+1, N+2, RH, DRH ou ADMIN configurant un collaborateur -> édition autorisée
  const isSelf = Boolean(user?.id && salariedId && user.id === salariedId);
  const canEdit = !isSelf;

  const [objectifsState, setObjectifsState] = useState<ObjectifItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Eviter les doubles chargements
  const loadedForIdRef = useRef<string | null>(null);

  // Initialisation par défaut
  const createDefaultItem = (weight = 100): ObjectifItem => ({
    id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    intitule: "",
    ponderation: weight,
    showCriteres: false,
    criteres: { t18_20: "", t15_17: "", t12_14: "", t0_11: "" },
  });

  const mapListToObjectifs = (list: any[]): ObjectifItem[] => {
    return list.map((obj: any, idx: number) => {
      const inds = obj.indicateurs || [];
      const ind18 = inds.find((i: any) => Number(i.noteMin) >= 18 || Number(i.noteMax) === 20);
      const ind15 = inds.find((i: any) => Number(i.noteMin) === 15 || Number(i.noteMax) === 17);
      const ind12 = inds.find((i: any) => Number(i.noteMin) === 12 || Number(i.noteMax) === 14);
      const ind0 = inds.find((i: any) => Number(i.noteMin) === 0 || Number(i.noteMax) === 11);

      return {
        id: obj.id || `obj-${idx}`,
        intitule: obj.intitule || "",
        ponderation: obj.ponderation !== undefined && obj.ponderation !== null ? Number(obj.ponderation) : 0,
        showCriteres: false,
        criteres: {
          t18_20: ind18?.intitule ?? inds[0]?.intitule ?? "",
          t15_17: ind15?.intitule ?? inds[1]?.intitule ?? "",
          t12_14: ind12?.intitule ?? inds[2]?.intitule ?? "",
          t0_11: ind0?.intitule ?? inds[3]?.intitule ?? "",
        },
      };
    });
  };

  // Chargement des objectifs à l'ouverture UNIQUEMENT
  useEffect(() => {
    if (!isOpen) {
      loadedForIdRef.current = null;
      return;
    }

    const currentTargetId = salariedId || "default";
    if (loadedForIdRef.current === currentTargetId) return;
    loadedForIdRef.current = currentTargetId;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Si des objectifs initiaux sont fournis
    if (initialObjectifs && initialObjectifs.length > 0) {
      const mapped = mapListToObjectifs(initialObjectifs);
      setObjectifsState(mapped);
      return;
    }

    // Sinon charger depuis l'API
    if (salariedId) {
      setIsLoading(true);
      objectivesApi
        .getBySalarieId(salariedId)
        .then((data) => {
          if (data && data.length > 0) {
            setObjectifsState(mapListToObjectifs(data));
          } else {
            setObjectifsState([createDefaultItem(100)]);
          }
        })
        .catch((err) => {
          console.warn("Notice: aucun objectif existant trouvé en base, initialisation vierge:", err);
          setObjectifsState([createDefaultItem(100)]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setObjectifsState([createDefaultItem(100)]);
    }
  }, [isOpen, salariedId]);

  // Calcul du total des pondérations
  const totalPonderation = useMemo(() => {
    return objectifsState.reduce((acc, o) => acc + (Number(o.ponderation) || 0), 0);
  }, [objectifsState]);

  if (!isOpen) return null;

  // Actions
  const handleAddObjectif = () => {
    if (!canEdit) return;
    setObjectifsState((prev) => {
      const remaining = Math.max(0, 100 - totalPonderation);
      return [...prev, createDefaultItem(remaining)];
    });
  };

  const handleDeleteObjectif = (id: string) => {
    if (!canEdit) return;
    if (objectifsState.length <= 1) {
      setErrorMessage("Vous devez conserver au moins 1 objectif de performance.");
      return;
    }
    setObjectifsState((prev) => prev.filter((o) => o.id !== id));
  };

  // Répartir 100% de manière équitable en 1 clic
  const handleEquilibrerPonderations = () => {
    if (!canEdit || objectifsState.length === 0) return;
    const count = objectifsState.length;
    const baseWeight = Math.floor(100 / count);
    const remainder = 100 - baseWeight * count;

    setObjectifsState((prev) =>
      prev.map((o, idx) => ({
        ...o,
        ponderation: idx === 0 ? baseWeight + remainder : baseWeight,
      }))
    );
  };

  const handleApplySuggestion = (objId: string, suggestion: string) => {
    setObjectifsState((prev) =>
      prev.map((o) => (o.id === objId ? { ...o, intitule: suggestion } : o))
    );
  };

  const toggleCriteres = (objId: string) => {
    setObjectifsState((prev) =>
      prev.map((o) => (o.id === objId ? { ...o, showCriteres: !o.showCriteres } : o))
    );
  };

  const handleSave = async () => {
    if (!canEdit) return;

    // Validation des intitulés
    const invalidObj = objectifsState.find((o) => !o.intitule || o.intitule.trim() === "");
    if (invalidObj) {
      setErrorMessage("Chaque objectif doit obligatoirement avoir un intitulé renseigné.");
      return;
    }

    const targetId = salariedId || user?.id;
    if (!targetId) {
      setErrorMessage("Erreur : Aucun collaborateur cible n'a été spécifié.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await objectivesApi.create({
        salarieId: targetId,
        objectifs: objectifsState.map((o) => ({
          id: o.id.startsWith("new-") ? undefined : o.id,
          intitule: o.intitule.trim(),
          ponderation: Number(o.ponderation) || 0,
          criteres: o.criteres,
        })),
      });

      setSuccessMessage(
        `✓ Les ${objectifsState.length} objectifs ont été validés avec succès ! Le collaborateur peut désormais renseigner son auto-évaluation.`
      );

      if (onSaved) {
        onSaved();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Erreur enregistrement objectifs:", err);
      setErrorMessage(err.message || "Erreur de communication avec le serveur.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-none border border-slate-300 shadow-2xl flex flex-col overflow-hidden font-sans">
        
        {/* Barre d'accentuation haute Agilly */}
        <div className="h-1.5 w-full bg-[#F0822A] shrink-0" />

        {/* ── HEADER ── */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-orange-50 border border-orange-200 flex items-center justify-center text-lg text-[#F0822A] font-black">
              <TargetIcon size={20} className="text-[#F0822A]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 m-0 tracking-tight">
                {isSelf ? "Mes Objectifs de Performance" : "Fixation des Objectifs de Performance"}
              </h2>
              <p className="text-xs font-bold text-[#F0822A] m-0 mt-0.5">
                Collaborateur : {salariedName} {salariedPoste ? `· ${salariedPoste}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-none border border-slate-200 bg-slate-50 text-slate-500 font-bold hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center text-sm"
            title="Fermer la fenêtre"
          >
            ✕
          </button>
        </div>

        {/* ── NOTIFICATIONS / ALERTES ── */}
        {errorMessage && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon size={16} className="text-red-600" />
              <p className="text-xs font-bold text-red-800 m-0">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-600 hover:text-red-800 font-extrabold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-base">✓</span>
            <p className="text-xs font-bold text-emerald-800 m-0">{successMessage}</p>
          </div>
        )}

        {/* ── BARRE DE CONTROLE DE PONDÉRATION & ACTIONS ── */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                Total des Pondérations
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-lg font-black ${
                    totalPonderation === 100
                      ? "text-emerald-600"
                      : totalPonderation > 100
                      ? "text-red-600"
                      : "text-[#F0822A]"
                  }`}
                >
                  {totalPonderation}%
                </span>
                {totalPonderation === 100 ? (
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 uppercase tracking-wide">
                    ✓ 100% Conforme
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wide border ${
                      totalPonderation > 100
                        ? "text-red-700 bg-red-50 border-red-300"
                        : "text-amber-800 bg-amber-50 border-amber-300"
                    }`}
                  >
                    {totalPonderation > 100
                      ? `Dépassement de +${totalPonderation - 100}%`
                      : `Reste : ${100 - totalPonderation}%`}
                  </span>
                )}
              </div>
            </div>

            {/* Jauge visuelle */}
            <div className="w-28 h-2.5 bg-slate-200 overflow-hidden hidden sm:block">
              <div
                className={`h-full transition-all duration-300 ${
                  totalPonderation === 100
                    ? "bg-emerald-500"
                    : totalPonderation > 100
                    ? "bg-red-500"
                    : "bg-[#F0822A]"
                }`}
                style={{ width: `${Math.min(totalPonderation, 100)}%` }}
              />
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              {objectifsState.length > 1 && (
                <button
                  type="button"
                  onClick={handleEquilibrerPonderations}
                  title="Répartir automatiquement les 100% équitablement"
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ScaleIcon size={14} className="text-slate-600" />
                  <span>Équilibrer (100%)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleAddObjectif}
                className="px-3.5 py-1.5 bg-[#F0822A] text-white font-black text-xs hover:bg-[#d97220] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                + Ajouter un Objectif
              </button>
            </div>
          )}
        </div>

        {/* ── CORPS DÉROULANT ── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-[#F8FAFC]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#F0822A] border-t-transparent animate-spin" />
              <span className="text-xs font-bold text-slate-500">Chargement des objectifs...</span>
            </div>
          ) : objectifsState.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 p-8">
              <p className="text-sm font-bold text-slate-600 mb-3">Aucun objectif défini pour le moment.</p>
              {canEdit && (
                <button
                  onClick={handleAddObjectif}
                  className="px-4 py-2 bg-[#F0822A] text-white text-xs font-black"
                >
                  + Créer le Premier Objectif
                </button>
              )}
            </div>
          ) : (
            objectifsState.map((obj, index) => (
              <div
                key={obj.id}
                className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col gap-4 transition-all"
              >
                {/* Header de l'objectif */}
                <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Objectif de Performance #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 border border-slate-200">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">
                        Poids :
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={!canEdit}
                        value={obj.ponderation}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                          setObjectifsState((prev) =>
                            prev.map((o) => (o.id === obj.id ? { ...o, ponderation: val } : o))
                          );
                        }}
                        className="w-14 h-7 text-center font-black text-xs text-slate-900 bg-white border border-slate-300 outline-none focus:border-[#F0822A]"
                      />
                      <span className="text-xs font-black text-slate-700">%</span>
                    </div>

                    {canEdit && objectifsState.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteObjectif(obj.id)}
                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Supprimer cet objectif"
                      >
                        <TrashIcon size={13} />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Champ intitulé */}
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1.5">
                    Intitulé de l'Objectif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={obj.intitule}
                    onChange={(e) => {
                      const text = e.target.value;
                      setObjectifsState((prev) =>
                        prev.map((o) => (o.id === obj.id ? { ...o, intitule: text } : o))
                      );
                    }}
                    placeholder="Ex: Assurer la livraison du projet X dans le respect du calendrier..."
                    className="w-full h-10 px-3.5 border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-[#F0822A] bg-white disabled:bg-slate-100"
                  />

                  {/* Suggestions rapides si champ vide */}
                  {canEdit && (!obj.intitule || obj.intitule.trim() === "") && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase py-0.5">Suggestions :</span>
                      {TEMPLATES_SUGGESTIONS.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleApplySuggestion(obj.id, sug)}
                          className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-orange-50 hover:text-[#F0822A] px-2 py-0.5 border border-slate-200 transition-colors cursor-pointer"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordéon Critères 4 tranches */}
                <div className="border border-slate-200 bg-slate-50/70 p-3">
                  <div
                    onClick={() => toggleCriteres(obj.id)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700">
                        {obj.showCriteres ? "▼" : "▶"} Grille d'évaluation indicative (4 tranches)
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {obj.criteres.t18_20 || obj.criteres.t15_17 ? "(Renseignée)" : "(Optionnel)"}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#F0822A]">
                      {obj.showCriteres ? "Masquer les critères" : "Afficher / modifier les critères"}
                    </span>
                  </div>

                  {obj.showCriteres && (
                    <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-slate-200 animate-in fade-in duration-100">
                      <CritereInputRow
                        tranche="18 à 20"
                        label="Excellence"
                        badgeBg="bg-emerald-50 text-emerald-800 border-emerald-300"
                        disabled={!canEdit}
                        value={obj.criteres.t18_20}
                        onChange={(val) => {
                          setObjectifsState((prev) =>
                            prev.map((o) =>
                              o.id === obj.id
                                ? { ...o, criteres: { ...o.criteres, t18_20: val } }
                                : o
                            )
                          );
                        }}
                      />
                      <CritereInputRow
                        tranche="15 à 17"
                        label="Très Bon"
                        badgeBg="bg-blue-50 text-blue-800 border-blue-300"
                        disabled={!canEdit}
                        value={obj.criteres.t15_17}
                        onChange={(val) => {
                          setObjectifsState((prev) =>
                            prev.map((o) =>
                              o.id === obj.id
                                ? { ...o, criteres: { ...o.criteres, t15_17: val } }
                                : o
                            )
                          );
                        }}
                      />
                      <CritereInputRow
                        tranche="12 à 14"
                        label="Satisfaisant"
                        badgeBg="bg-amber-50 text-amber-800 border-amber-300"
                        disabled={!canEdit}
                        value={obj.criteres.t12_14}
                        onChange={(val) => {
                          setObjectifsState((prev) =>
                            prev.map((o) =>
                              o.id === obj.id
                                ? { ...o, criteres: { ...o.criteres, t12_14: val } }
                                : o
                            )
                          );
                        }}
                      />
                      <CritereInputRow
                        tranche="0 à 11"
                        label="Insuffisant"
                        badgeBg="bg-rose-50 text-rose-800 border-rose-300"
                        disabled={!canEdit}
                        value={obj.criteres.t0_11}
                        onChange={(val) => {
                          setObjectifsState((prev) =>
                            prev.map((o) =>
                              o.id === obj.id
                                ? { ...o, criteres: { ...o.criteres, t0_11: val } }
                                : o
                            )
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          {canEdit && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#F0822A] hover:bg-[#d97220] text-white font-black text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin inline-block" />
                    <span>Transmission en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon size={14} />
                    <span>Transmettre & Valider les Objectifs</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CritereInputRow({
  tranche,
  label,
  badgeBg,
  value,
  disabled,
  onChange,
}: {
  tranche: string;
  label: string;
  badgeBg: string;
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
      <div
        className={`w-36 shrink-0 px-2 py-1 border text-[11px] font-black uppercase flex items-center justify-between ${badgeBg}`}
      >
        <span>{tranche}</span>
        <span className="text-[9px] font-bold opacity-80">{label}</span>
      </div>
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Critère d'atteinte ${label.toLowerCase()}...`}
        className="flex-1 h-8 px-2.5 border border-slate-300 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#F0822A] bg-white disabled:bg-slate-100"
      />
    </div>
  );
}
