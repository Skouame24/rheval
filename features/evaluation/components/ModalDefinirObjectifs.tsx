// ============================================================
// features/evaluation/components/ModalDefinirObjectifs.tsx
// Modal de Définition des Objectifs (Salarié / N+1 / N+2 / RH — Charte Agilly Soft UI)
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { objectivesApi } from "@/lib/api/objectives.api";

interface ModalDefinirObjectifsProps {
  isOpen: boolean;
  onClose: () => void;
  salariedName: string;
  salariedPoste: string;
  salariedId?: string;
  isN1Validated?: boolean;
  objectifs?: any[];
  onSaved?: () => void;
}

interface ObjectifItem {
  id: string;
  intitule: string;
  ponderation: number;
  criteres: {
    t18_20: string;
    t15_17: string;
    t12_14: string;
    t0_11: string;
  };
}

export function ModalDefinirObjectifs({
  isOpen,
  onClose,
  salariedName,
  salariedPoste,
  salariedId,
  isN1Validated = false,
  objectifs = [],
  onSaved,
}: ModalDefinirObjectifsProps) {
  const { user, role } = useAuth();

  // Seuls N+2, M. AKPA, M. KONAN, DRH, ADMIN et N+1 ont le droit de modifier
  const isSuperUser =
    role === "N2" ||
    role === "DRH" ||
    role === "RH" ||
    role === "ADMIN" ||
    user?.nom?.toUpperCase() === "AKPA" ||
    user?.nom?.toUpperCase() === "KONAN";

  const isSalarie = role === "SALARIE";
  const canEdit = !isSalarie && (isSuperUser || role === "N1");

  const [objectifsState, setObjectifsState] = useState<ObjectifItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les objectifs
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const loadData = async () => {
      // 1. Si les objectifs sont déjà passés en props (ex: depuis la fiche chargée), les afficher immédiatement !
      if (objectifs && objectifs.length > 0) {
        mapAndSetObjectifs(objectifs);
        setIsLoading(false);
        return;
      }

      // 2. Sinon, interroger l'API pour ce salarié
      if (salariedId) {
        try {
          setIsLoading(true);
          // Timeout de sécurité de 3 secondes pour ne jamais bloquer l'UI
          const timeoutPromise = new Promise<any[]>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 3000)
          );
          const data = await Promise.race([
            objectivesApi.getBySalarieId(salariedId),
            timeoutPromise,
          ]);

          if (data && data.length > 0) {
            mapAndSetObjectifs(data);
          } else {
            initDefaultObjectif();
          }
        } catch (err: any) {
          console.warn("Chargement API objectifs dépassé ou échoué, initialisation par défaut:", err);
          initDefaultObjectif();
        } finally {
          setIsLoading(false);
        }
      } else {
        initDefaultObjectif();
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, salariedId]);

  const initDefaultObjectif = () => {
    setObjectifsState([
      {
        id: `new-${Date.now()}`,
        intitule: "",
        ponderation: 100,
        criteres: { t18_20: "", t15_17: "", t12_14: "", t0_11: "" },
      },
    ]);
  };

  const mapAndSetObjectifs = (list: any[]) => {
    const mapped: ObjectifItem[] = list.map((obj: any, idx: number) => {
      const inds = obj.indicateurs || [];
      const ind18 = inds.find((i: any) => Number(i.noteMin) >= 18 || Number(i.noteMax) === 20);
      const ind15 = inds.find((i: any) => Number(i.noteMin) === 15 || Number(i.noteMax) === 17);
      const ind12 = inds.find((i: any) => Number(i.noteMin) === 12 || Number(i.noteMax) === 14);
      const ind0 = inds.find((i: any) => Number(i.noteMin) === 0 || Number(i.noteMax) === 11);

      return {
        id: obj.id || `obj-${idx}`,
        intitule: obj.intitule || "",
        ponderation: obj.ponderation !== undefined && obj.ponderation !== null ? Number(obj.ponderation) : 0,
        criteres: {
          t18_20: ind18?.intitule ?? inds[0]?.intitule ?? "",
          t15_17: ind15?.intitule ?? inds[1]?.intitule ?? "",
          t12_14: ind12?.intitule ?? inds[2]?.intitule ?? "",
          t0_11: ind0?.intitule ?? inds[3]?.intitule ?? "",
        },
      };
    });
    setObjectifsState(mapped.length > 0 ? mapped : [
      {
        id: `new-${Date.now()}`,
        intitule: "",
        ponderation: 100,
        criteres: { t18_20: "", t15_17: "", t12_14: "", t0_11: "" },
      },
    ]);
  };

  if (!isOpen) return null;

  const totalPonderation = objectifsState.reduce(
    (acc, o) => acc + (Number(o.ponderation) || 0),
    0
  );

  const handleAddObjectif = () => {
    if (!canEdit) return;
    setIsLoading(false);
    setObjectifsState((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        intitule: "",
        ponderation: 0,
        criteres: { t18_20: "", t15_17: "", t12_14: "", t0_11: "" },
      },
    ]);
  };

  const handleDeleteObjectif = (id: string) => {
    if (!canEdit) return;
    if (objectifsState.length <= 1) {
      alert("Vous devez conserver au moins 1 objectif de performance.");
      return;
    }
    setObjectifsState((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSave = async () => {
    if (!canEdit) return;

    // Validation des intitulés
    const invalidObj = objectifsState.find((o) => !o.intitule || o.intitule.trim() === "");
    if (invalidObj) {
      setErrorMessage("Veuillez renseigner un intitulé pour chaque objectif avant d'enregistrer.");
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

      setSuccessMessage(`Les ${objectifsState.length} objectifs ont été enregistrés avec succès dans le système.`);
      
      if (onSaved) {
        onSaved();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Erreur enregistrement objectifs:", err);
      setErrorMessage(err.message || "Erreur de connexion lors de la sauvegarde des objectifs.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-none border border-slate-200 shadow-2xl flex flex-col overflow-hidden font-sans">
        {/* Ligne d'accent Orange Agilly */}
        <div className="h-1.5 w-full bg-[#F0822A] shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-lg">
              🎯
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 m-0">
                {isSalarie ? "Consultation de mes Objectifs (Fixés par N+1)" : "Définir les Objectifs de Performance"}
              </h2>
              <p className="text-xs font-bold text-[#F0822A] m-0 mt-0.5">
                Collaborateur : {salariedName} {salariedPoste ? `(${salariedPoste})` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-none border border-slate-200 bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Notifications / Erreurs / Succès */}
        {errorMessage && (
          <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 flex items-center gap-3">
            <span className="text-rose-600 font-bold text-sm">⚠️</span>
            <p className="text-xs font-bold text-rose-800 m-0">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-3">
            <span className="text-emerald-600 font-bold text-sm">✓</span>
            <p className="text-xs font-bold text-emerald-800 m-0">{successMessage}</p>
          </div>
        )}

        {/* Message d'Information sur les Autorisations */}
        {!canEdit && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
            <span className="text-sm">🔒</span>
            <p className="text-xs font-bold text-amber-800 m-0">
              <strong>Consultation uniquement :</strong> En tant que salarié, vous n'avez pas l'autorisation de modifier les objectifs. Seul votre manager hiérarchique (N+1) peut les fixer et les modifier.
            </p>
          </div>
        )}

        {/* Barre du total de pondération & Ajouter */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              Total des Pondérations :{" "}
              <strong
                className={
                  totalPonderation === 100
                    ? "text-emerald-600 font-extrabold text-sm"
                    : "text-[#F0822A] font-extrabold text-sm"
                }
              >
                {totalPonderation}%
              </strong>
            </span>
            {totalPonderation === 100 ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-none">
                ✓ Conforme (100%)
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-none">
                ℹ️ Reste à répartir : {100 - totalPonderation}% (Pondération indicative)
              </span>
            )}
          </div>

          {canEdit && (
            <button
              onClick={handleAddObjectif}
              className="px-4 py-2 bg-[#F0822A] text-white font-extrabold text-xs rounded-none border border-transparent hover:bg-[#d97220] transition-all cursor-pointer shadow-sm"
            >
              + Ajouter un Objectif
            </button>
          )}
        </div>

        {/* Body Scrollable Tailwind Natif */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#F7F8FA]">
          {isLoading && objectifsState.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#F0822A] border-t-transparent animate-spin rounded-none" />
              <span className="text-xs font-bold text-slate-500">Chargement des objectifs du collaborateur...</span>
            </div>
          ) : (
            objectifsState.map((obj, index) => (
              <div
                key={obj.id}
                className="bg-white p-6 rounded-none border border-slate-200 shadow-sm flex flex-col gap-4"
              >
                {/* Header Objectif */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-extrabold text-[#F0822A] bg-[#FFF7ED] px-3 py-1 rounded-none border border-[#FFEDD5]">
                    OBJECTIF PERFORMANCE #{index + 1}
                  </span>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-500">
                        Pondération :
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={!canEdit}
                        value={obj.ponderation}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setObjectifsState((prev) =>
                            prev.map((o) =>
                              o.id === obj.id ? { ...o, ponderation: val } : o
                            )
                          );
                        }}
                        className="w-16 h-9 text-center font-extrabold text-slate-900 border border-slate-300 rounded-none outline-none focus:border-[#F0822A] disabled:bg-slate-100"
                      />
                      <span className="text-xs font-bold text-slate-700">%</span>
                    </div>

                    {canEdit && objectifsState.length > 1 && (
                      <button
                        onClick={() => handleDeleteObjectif(obj.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-none hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        🗑️ Supprimer
                      </button>
                    )}
                  </div>
                </div>

                {/* Titre */}
                <div>
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    Intitulé de l'Objectif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={obj.intitule}
                    onChange={(e) => {
                      const text = e.target.value;
                      setObjectifsState((prev) =>
                        prev.map((o) =>
                          o.id === obj.id ? { ...o, intitule: text } : o
                        )
                      );
                    }}
                    placeholder="Saisir l'intitulé de l'objectif (ex: Pilotage du déploiement AGILLY)..."
                    className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white text-slate-900 disabled:bg-slate-100"
                  />
                </div>

                {/* Grille 4 Tranches */}
                <div className="bg-slate-50 p-4 rounded-none border border-slate-200 flex flex-col gap-2.5">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Grille des Indicateurs de Mesure (4 Tranches d'évaluation) :
                  </span>

                  <CritereRow
                    tranche="18 - 20 (Excellence)"
                    color="text-emerald-700"
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

                  <CritereRow
                    tranche="15 - 17 (Très Bon)"
                    color="text-amber-700"
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

                  <CritereRow
                    tranche="12 - 14 (Satisfaisant)"
                    color="text-blue-700"
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

                  <CritereRow
                    tranche="0 - 11 (Insuffisant)"
                    color="text-rose-700"
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
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 font-bold text-sm rounded-none hover:bg-slate-100 transition-all cursor-pointer"
          >
            Fermer
          </button>
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#F0822A] text-white font-extrabold text-sm rounded-none hover:bg-[#d97220] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-none inline-block" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <span>💾 Enregistrer & Transmettre ({objectifsState.length} Objectifs)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CritereRow({
  tranche,
  color,
  value,
  disabled = false,
  onChange,
}: {
  tranche: string;
  color: string;
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-xs font-extrabold ${color} bg-white px-3 py-1.5 border border-slate-200 w-44 shrink-0 rounded-none`}
      >
        Tranche {tranche}
      </span>
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Critère d'atteinte..."
        className="flex-1 h-9 px-3 border border-slate-300 rounded-none text-xs font-medium outline-none focus:border-[#F0822A] bg-white text-slate-900 disabled:bg-slate-100"
      />
    </div>
  );
}
