// ============================================================
// features/evaluation/components/ModalCreerCycle.tsx
// Modal de Création & Lancement d'un Nouveau Cycle par la RH (Soft UI 100% Inline CSS)
// ============================================================

"use client";
import { useState } from "react";

interface ModalCreerCycleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cycleData: any) => void;
}

export function ModalCreerCycle({ isOpen, onClose, onSuccess }: ModalCreerCycleProps) {
  const [annee, setAnnee] = useState("2027");
  const [libelle, setLibelle] = useState("Campagne d'Évaluation Annuelle 2027");
  const [dateDebut, setDateDebut] = useState("2027-06-01");
  const [dateFin, setDateFin] = useState("2027-12-31");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      annee,
      libelle,
      dateDebut,
      dateFin,
      statut: "FIXATION_OBJECTIFS"
    });
    alert(`Le cycle "${libelle}" a été ouvert avec succès ! Les managers N+1 ont reçu la notification pour fixer les objectifs.`);
    onClose();
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
        fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans', sans-serif"
      }}>
        {/* Top Accent */}
        <div style={{ height: 6, background: "#F0822A" }} />

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 0, background: "#FFF7ED", border: "1px solid #FFEDD5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🚀
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

          <button onClick={onClose} style={{ border: "1px solid #E2E8F0", background: "#F1F5F9", width: 34, height: 34, borderRadius: 0, cursor: "pointer", fontWeight: 900 }}>✕</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18, background: "#F7F8FA" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Année d'Exercice
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

          <div style={{ background: "#FFF7ED", padding: 14, borderRadius: 0, border: "1px solid #FFEDD5", fontSize: 12, color: "#EA580C", fontWeight: 700 }}>
            💡 <strong>Rappel du Processus Agilly :</strong> Le lancement envoie une alerte automatique à tous les managers N+1 pour la fixation des objectifs de leurs collaborateurs.
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 18px", borderRadius: 0, border: "1px solid #CBD5E1", background: "#FFFFFF", fontWeight: 800, cursor: "pointer" }}>Annuler</button>
            <button type="submit" style={{ padding: "12px 24px", borderRadius: 0, border: "none", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>
              🚀 Lancer la Campagne
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
