// ============================================================
// features/evaluation/components/ModalDefinirObjectifs.tsx
// Modal de Définition des Objectifs par le Manager N+1 (Charte Agilly Bords Carrés)
// ============================================================

"use client";
import { useState } from "react";

interface ModalDefinirObjectifsProps {
  isOpen: boolean;
  onClose: () => void;
  salariedName: string;
  salariedPoste: string;
}

export function ModalDefinirObjectifs({ isOpen, onClose, salariedName, salariedPoste }: ModalDefinirObjectifsProps) {
  const [objectifs, setObjectifs] = useState([
    {
      id: "1",
      intitule: "Monter en compétences sur les sujets d'IA/Modèles ou frameworks d'orchestration d'ici le 30 novembre 2026",
      ponderation: 30,
      criteres: {
        t18_20: "Validation autonome de 6/6 compétences sans assistance + 1 cas d'usage prod (15-30 nov)",
        t15_17: "Validation autonome de 6/6 compétences entre le 1er et le 14 décembre 2026",
        t12_14: "Validation autonome de 4 à 5/6 compétences, au plus tard le 31 décembre 2026",
        t0_11:  "Validation autonome de 3/6 compétences ou moins au 31 décembre 2026"
      }
    },
    {
      id: "2",
      intitule: "Maintenir la qualité de développement des plateformes web & mobile",
      ponderation: 35,
      criteres: {
        t18_20: "0 bug critique en prod, 100% revues de code, 100% corrections mineures < 48h",
        t15_17: "1 à 2 bugs critiques (corrigés sous 48h), 90% revues de code, 90% corrections < 48h",
        t12_14: "3 à 5 bugs critiques, entre 70% et 89% revues de code",
        t0_11:  "Plus de 5 bugs critiques ou incident majeur non résolu"
      }
    },
    {
      id: "3",
      intitule: "La documentation des activités (PV de recette, Rapports d'intervention)",
      ponderation: 35,
      criteres: {
        t18_20: "Taux de couverture documentaire de 90% à 100% sur toute la période",
        t15_17: "Taux de couverture documentaire entre 80% et 89% sur toute la période",
        t12_14: "Taux de couverture documentaire entre 70% et 79% sur toute la période",
        t0_11:  "Taux de couverture documentaire inférieur à 70%"
      }
    }
  ]);

  if (!isOpen) return null;

  const totalPonderation = objectifs.reduce((acc, o) => acc + (o.ponderation || 0), 0);

  const handleAddObjectif = () => {
    setObjectifs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        intitule: "",
        ponderation: 0,
        criteres: { t18_20: "", t15_17: "", t12_14: "", t0_11: "" }
      }
    ]);
  };

  const handleDeleteObjectif = (id: string) => {
    if (objectifs.length <= 1) {
      alert("Vous devez conserver au moins 1 objectif de performance.");
      return;
    }
    setObjectifs((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSave = () => {
    if (totalPonderation !== 100) {
      alert(`Attention : La somme des pondérations est de ${totalPonderation}%. Le total doit être exactement 100%.`);
      return;
    }
    alert(`Les ${objectifs.length} objectifs pour ${salariedName} ont été enregistrés et transmis au salarié !`);
    onClose();
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
                Définir les Objectifs de Performance (N+1)
              </h2>
              <p className="text-xs font-bold text-[#F0822A] m-0 mt-0.5">
                Collaborateur : {salariedName} ({salariedPoste})
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

        {/* Barre du total de pondération & Ajouter */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              Total des Pondérations :{" "}
              <strong className={totalPonderation === 100 ? "text-emerald-600 font-extrabold text-sm" : "text-rose-600 font-extrabold text-sm"}>
                {totalPonderation}% / 100%
              </strong>
            </span>
            {totalPonderation === 100 ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-none">
                ✓ Conforme (100%)
              </span>
            ) : (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-none">
                ⚠️ Reste : {100 - totalPonderation}%
              </span>
            )}
          </div>

          <button
            onClick={handleAddObjectif}
            className="px-4 py-2 bg-[#F0822A] text-white font-extrabold text-xs rounded-none border border-transparent hover:bg-[#d97220] transition-all cursor-pointer"
          >
            + Ajouter un Objectif
          </button>
        </div>

        {/* Body Scrollable Tailwind Natif */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#F7F8FA]">
          {objectifs.map((obj, index) => (
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
                    <label className="text-xs font-bold text-slate-500">Pondération :</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={obj.ponderation}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setObjectifs((prev) => prev.map((o) => (o.id === obj.id ? { ...o, ponderation: val } : o)));
                      }}
                      className="w-16 h-9 text-center font-extrabold text-slate-900 border border-slate-300 rounded-none outline-none focus:border-[#F0822A]"
                    />
                    <span className="text-xs font-bold text-slate-700">%</span>
                  </div>

                  {objectifs.length > 1 && (
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
                  Intitulé de l'Objectif
                </label>
                <input
                  type="text"
                  value={obj.intitule}
                  onChange={(e) => {
                    const text = e.target.value;
                    setObjectifs((prev) => prev.map((o) => (o.id === obj.id ? { ...o, intitule: text } : o)));
                  }}
                  placeholder="Saisir l'intitulé de l'objectif..."
                  className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white text-slate-900"
                />
              </div>

              {/* Grille 4 Tranches */}
              <div className="bg-slate-50 p-4 rounded-none border border-slate-200 flex flex-col gap-2.5">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Grille des Indicateurs de Mesure (4 Tranches) :
                </span>

                <CritereRow tranche="18 - 20 (Excellence)" color="text-emerald-700" value={obj.criteres.t18_20} onChange={(val) => {
                  setObjectifs((prev) => prev.map((o) => (o.id === obj.id ? { ...o, criteres: { ...o.criteres, t18_20: val } } : o)));
                }} />

                <CritereRow tranche="15 - 17 (Très Bon)" color="text-amber-700" value={obj.criteres.t15_17} onChange={(val) => {
                  setObjectifs((prev) => prev.map((o) => (o.id === obj.id ? { ...o, criteres: { ...o.criteres, t15_17: val } } : o)));
                }} />

                <CritereRow tranche="12 - 14 (Satisfaisant)" color="text-blue-700" value={obj.criteres.t12_14} onChange={(val) => {
                  setObjectifs((prev) => prev.map((o) => (o.id === obj.id ? { ...o, criteres: { ...o.criteres, t12_14: val } } : o)));
                }} />

                <CritereRow tranche="0 - 11 (Insuffisant)" color="text-rose-700" value={obj.criteres.t0_11} onChange={(val) => {
                  setObjectifs((prev) => prev.map((o) => (o.id === obj.id ? { ...o, criteres: { ...o.criteres, t0_11: val } } : o)));
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 font-bold text-sm rounded-none hover:bg-slate-100 transition-all cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#F0822A] text-white font-extrabold text-sm rounded-none hover:bg-[#d97220] transition-all cursor-pointer"
          >
            💾 Transmettre les {objectifs.length} Objectifs au Salarié
          </button>
        </div>

      </div>
    </div>
  );
}

function CritereRow({ tranche, color, value, onChange }: { tranche: string; color: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-extrabold ${color} bg-white px-3 py-1.5 border border-slate-200 w-44 shrink-0 rounded-none`}>
        Tranche {tranche}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Critère d'atteinte..."
        className="flex-1 h-9 px-3 border border-slate-300 rounded-none text-xs font-medium outline-none focus:border-[#F0822A] bg-white text-slate-900"
      />
    </div>
  );
}
