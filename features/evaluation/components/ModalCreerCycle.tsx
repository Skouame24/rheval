// ============================================================
// features/evaluation/components/ModalCreerCycle.tsx
// Modal de Création & Lancement d'un Nouveau Cycle par la RH
// ============================================================

"use client";
import { useState } from "react";
import { rhApi } from "@/lib/api/rh.api";
import { RocketIcon, AlertTriangleIcon } from "@/components/ui/Icons";

interface ModalCreerCycleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cycleData: any) => void;
}

export function ModalCreerCycle({ isOpen, onClose, onSuccess }: ModalCreerCycleProps) {
  const currentYear = new Date().getFullYear();
  const [annee, setAnnee] = useState(String(currentYear));
  const [libelle, setLibelle] = useState(`Campagne d'Évaluation Annuelle ${currentYear}`);
  const [dateDebut, setDateDebut] = useState(`${currentYear}-01-01`);
  const [dateFin, setDateFin] = useState(`${currentYear}-12-31`);
  const [dateDebutFixation, setDateDebutFixation] = useState(`${currentYear}-01-01`);
  const [dateFinFixation, setDateFinFixation] = useState(`${currentYear}-03-31`);
  const [dateDebutEval, setDateDebutEval] = useState(`${currentYear}-06-01`);
  const [dateFinEval, setDateFinEval] = useState(`${currentYear}-12-31`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await rhApi.creerCycle({
        annee: Number(annee),
        libelle,
        dateDebut,
        dateFin,
        dateDebutFixation,
        dateFinFixation,
        dateDebutEval,
        dateFinEval,
      });
      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la création du cycle.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(0, 0, 0, 0.55)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#FFFFFF",
        width: "100%",
        maxWidth: 580,
        borderRadius: 0,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans', sans-serif",
      }}>
        {/* Top Accent */}
        <div style={{ height: 6, background: "#F0822A" }} />

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 0, background: "#FFF7ED", border: "1px solid #FFEDD5", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0822A" }}>
              <RocketIcon size={20} color="#F0822A" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#000000", margin: 0 }}>
                Lancer une Nouvelle Campagne RH
              </h2>
              <p style={{ fontSize: 12, color: "#F0822A", margin: "2px 0 0 0", fontWeight: 800 }}>
                Ouverture de la phase de fixation des objectifs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{ border: "1px solid #E2E8F0", background: "#F1F5F9", width: 34, height: 34, borderRadius: 0, cursor: "pointer", fontWeight: 900 }}
          >✕</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18, background: "#F7F8FA" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Année d&apos;Exercice
            </label>
            <input
              type="number"
              required
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
              style={{ width: "100%", height: 42, padding: "0 14px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 14, fontWeight: 800, outline: "none", background: "#FFFFFF" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Intitulé de la Campagne
            </label>
            <input
              type="text"
              required
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              style={{ width: "100%", height: 42, padding: "0 14px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 14, fontWeight: 700, outline: "none", background: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Date de Début
              </label>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 700, outline: "none", background: "#FFFFFF" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Date de Clôture Prévisionnelle
              </label>
              <input
                type="date"
                required
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 700, outline: "none", background: "#FFFFFF" }}
              />
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Début Fixation Objectifs
              </label>
              <input
                type="date"
                required
                value={dateDebutFixation}
                onChange={(e) => setDateDebutFixation(e.target.value)}
                style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 700, outline: "none", background: "#FFFFFF" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Fin Fixation Objectifs
              </label>
              <input
                type="date"
                required
                value={dateFinFixation}
                onChange={(e) => setDateFinFixation(e.target.value)}
                style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 700, outline: "none", background: "#FFFFFF" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Début Évaluation
              </label>
              <input
                type="date"
                required
                value={dateDebutEval}
                onChange={(e) => setDateDebutEval(e.target.value)}
                style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 700, outline: "none", background: "#FFFFFF" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Fin Évaluation
              </label>
              <input
                type="date"
                required
                value={dateFinEval}
                onChange={(e) => setDateFinEval(e.target.value)}
                style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 13, fontWeight: 700, outline: "none", background: "#FFFFFF" }}
              />
            </div>
          </div>

          <div style={{ background: "#FFF7ED", padding: 14, borderRadius: 0, border: "1px solid #FFEDD5", fontSize: 12, color: "#EA580C", fontWeight: 700 }}>
            <strong>Rappel du Processus :</strong> Le lancement crée le cycle en base et notifie les managers N+1 pour fixer les objectifs.
          </div>

          {errorMsg && (
            <div style={{ background: "#FEF2F2", padding: 12, border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, fontWeight: 700, borderRadius: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangleIcon size={16} color="#DC2626" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: "10px 18px", borderRadius: 0, border: "1px solid #CBD5E1", background: "#FFFFFF", fontWeight: 800, cursor: "pointer", opacity: isSubmitting ? 0.5 : 1 }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: "12px 24px", borderRadius: 0, border: "none", background: isSubmitting ? "#ccc" : "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 14, cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? "Création en cours..." : "Lancer la Campagne"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

