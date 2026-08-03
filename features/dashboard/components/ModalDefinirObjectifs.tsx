// ============================================================
// features/dashboard/components/ModalDefinirObjectifs.tsx
// ============================================================

"use client";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Input, Textarea } from "@/components/ui";
import { TrashIcon, PlusIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface ModalDefinirObjectifsProps {
  isOpen: boolean;
  onClose: () => void;
  salarieName: string;
}

interface ObjectifForm {
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

export function ModalDefinirObjectifs({ isOpen, onClose, salarieName }: ModalDefinirObjectifsProps) {
  const [objectifs, setObjectifs] = useState<ObjectifForm[]>([
    {
      id: "1",
      intitule: "",
      ponderation: 50,
      criteres: { t18_20: "", t15_17: "", t12_14: "", t0_11: "" }
    }
  ]);

  const totalPonderation = useMemo(() => {
    return objectifs.reduce((acc, obj) => acc + (Number(obj.ponderation) || 0), 0);
  }, [objectifs]);

  const isValid = totalPonderation === 100 && objectifs.every(o => o.intitule.trim() !== "");

  const handleAddObjectif = () => {
    setObjectifs([
      ...objectifs,
      {
        id: Date.now().toString(),
        intitule: "",
        ponderation: 0,
        criteres: { t18_20: "", t15_17: "", t12_14: "", t0_11: "" }
      }
    ]);
  };

  const handleRemoveObjectif = (id: string) => {
    setObjectifs(objectifs.filter((o) => o.id !== id));
  };

  const handleChange = (id: string, field: keyof ObjectifForm, value: any) => {
    setObjectifs(objectifs.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const handleCritereChange = (id: string, tranche: keyof ObjectifForm["criteres"], value: string) => {
    setObjectifs(objectifs.map((o) => {
      if (o.id === id) {
        return { ...o, criteres: { ...o.criteres, [tranche]: value } };
      }
      return o;
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fixer les objectifs : ${salarieName}`}
      subtitle="Définissez les objectifs de performance et leurs barèmes pour le cycle en cours."
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              flex items-center gap-2 px-3 py-1.5 border
              ${totalPonderation === 100 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}
            `}>
              <span className="text-xs font-bold uppercase tracking-wider">Total Pondération :</span>
              <span className="text-lg font-black">{totalPonderation}%</span>
            </div>
            {totalPonderation !== 100 && (
              <span className="text-xs text-red-600 font-medium">Le total doit être exactement de 100%</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button variant="primary" disabled={!isValid} leftIcon={<CheckCircleIcon size={16} />}>
              Valider et Transmettre
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {objectifs.map((obj, index) => (
          <div key={obj.id} className="bg-white border border-gray-200 p-5 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-agilly-primary" />
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <Input
                  label={`Objectif ${index + 1}`}
                  placeholder="Ex: Maintenir la qualité de développement..."
                  value={obj.intitule}
                  onChange={(e) => handleChange(obj.id, "intitule", e.target.value)}
                  required
                />
              </div>
              <div className="w-32">
                <Input
                  label="Pondération (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={obj.ponderation}
                  onChange={(e) => handleChange(obj.id, "ponderation", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              {objectifs.length > 1 && (
                <div className="pt-7">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveObjectif(obj.id)}
                    title="Supprimer l'objectif"
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              )}
            </div>

            {/* Grille des critères */}
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Indicateurs de mesure par tranche</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  placeholder="Critères pour obtenir 18 à 20 (Excellence)..."
                  value={obj.criteres.t18_20}
                  onChange={(e) => handleCritereChange(obj.id, "t18_20", e.target.value)}
                  className="text-sm bg-[#ECFDF5] border-[#A7F3D0] focus:border-[#10B981] placeholder:text-[#10B981]/50"
                  rows={2}
                />
                <Textarea
                  placeholder="Critères pour obtenir 15 à 17 (Très Bon)..."
                  value={obj.criteres.t15_17}
                  onChange={(e) => handleCritereChange(obj.id, "t15_17", e.target.value)}
                  className="text-sm bg-[#FFF7ED] border-[#FFEDD5] focus:border-[#F0822A] placeholder:text-[#F0822A]/50"
                  rows={2}
                />
                <Textarea
                  placeholder="Critères pour obtenir 12 à 14 (Satisfaisant)..."
                  value={obj.criteres.t12_14}
                  onChange={(e) => handleCritereChange(obj.id, "t12_14", e.target.value)}
                  className="text-sm bg-[#EFF6FF] border-[#BFDBFE] focus:border-[#3B82F6] placeholder:text-[#3B82F6]/50"
                  rows={2}
                />
                <Textarea
                  placeholder="Critères pour 0 à 11 (Insuffisant)..."
                  value={obj.criteres.t0_11}
                  onChange={(e) => handleCritereChange(obj.id, "t0_11", e.target.value)}
                  className="text-sm bg-[#FEF2F2] border-[#FEE2E2] focus:border-[#EF4444] placeholder:text-[#EF4444]/50"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="secondary"
          className="border-dashed w-full py-4 text-agilly-primary hover:bg-orange-50 hover:border-agilly-primary"
          onClick={handleAddObjectif}
          leftIcon={<PlusIcon size={18} />}
        >
          Ajouter un nouvel objectif
        </Button>
      </div>
    </Modal>
  );
}
