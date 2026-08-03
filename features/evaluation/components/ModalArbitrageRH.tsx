// ============================================================
// features/evaluation/components/ModalArbitrageRH.tsx
// Modal de Saisie de la Note Conclue suite à l'Arbitrage RH (Design System Cyberwize / Agilly.net)
// ============================================================

"use client";
import { useState } from "react";
import { ScaleIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface ModalArbitrageRHProps {
  isOpen: boolean;
  onClose: () => void;
  dossier?: {
    id: string;
    nom: string;
    prenom: string;
    poste: string;
    direction: string;
    n1: string;
    noteN1: number;
    noteN2: number;
  } | null;
  onSuccess?: (id: string, noteFinale: number, commentaire: string) => void;
}

export function ModalArbitrageRH({ isOpen, onClose, dossier, onSuccess }: ModalArbitrageRHProps) {
  const [noteConclue, setNoteConclue] = useState<number>(16.0);
  const [pvCommentaire, setPvCommentaire] = useState<string>(
    "Suite à la réunion physique d'arbitrage RH tenue ce jour avec le N+1 et le N+2, la note finale retenue pour le cycle 2026 est validée."
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !dossier) return null;

  const ecart = Math.abs(dossier.noteN1 - dossier.noteN2).toFixed(1);
  const ecartPct = ((Math.abs(dossier.noteN1 - dossier.noteN2) / 20) * 100).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(dossier.id, noteConclue, pvCommentaire);
      }
      setSubmitted(false);
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 110,
      background: "rgba(17, 24, 39, 0.65)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 24px",
    }}>
      <div style={{
        background: "#FFFFFF",
        width: "100%",
        maxWidth: 640,
        borderRadius: 0,
        boxShadow: "0 25px 70px rgba(17, 24, 39, 0.35), 0 0 0 1px rgba(0,0,0,0.08)",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans', sans-serif"
      }}>
        {/* Bandeau supérieur Orange Agilly */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #F0822A 0%, #C7610C 100%)" }} />

        {/* Header Modal Navy Exécutif */}
        <div style={{
          padding: "22px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#111827",
          color: "#FFFFFF"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 0,
              background: "#DC2626",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)"
            }}>
              <ScaleIcon size={22} color="#FFFFFF" />
            </div>
            <div>
              <span className="eyebrow" style={{ color: "#F0822A" }}>// SÉANCE D'ARBITRAGE RH</span>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", margin: "2px 0 0 0", letterSpacing: "-0.02em" }}>
                Décision & Arbitrage DRH
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 0,
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >✕</button>
        </div>

        {/* Contenu Formulaire */}
        <form onSubmit={handleSubmit} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, background: "#FCFBFA", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          
          {/* Card Collaborateur */}
          <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 0, border: "1px solid #E8E4DE", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.1em" }}>Dossier en Désaccord</span>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: "#111827", margin: "2px 0 0 0" }}>{dossier.prenom} {dossier.nom}</h4>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#535B6A", margin: "2px 0 0 0" }}>{dossier.poste} · Direction {dossier.direction}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#DC2626", background: "#FEF2F2", padding: "4px 12px", borderRadius: 0, border: "1px solid #FEE2E2", display: "inline-block" }}>
                Écart {ecart} pts ({ecartPct} %)
              </span>
            </div>
          </div>

          {/* BAROMÈTRE D'ARBITRAGE DUAL (N+1 vs N+2) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 0, border: "1px solid #E8E4DE", borderTop: "4px solid #F0822A", textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#6B6359", textTransform: "uppercase", letterSpacing: "0.08em" }}>Note & Taux N+1</span>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#F0822A", margin: "4px 0 0 0" }}>
                {dossier.noteN1} <span style={{ fontSize: 13, color: "#94A3B8" }}>/ 20</span>
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#C7610C", margin: "2px 0 0 0" }}>
                {((dossier.noteN1 / 20) * 100).toFixed(1)} %
              </p>
            </div>
            <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 0, border: "1px solid #E8E4DE", borderTop: "4px solid #0060AC", textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#6B6359", textTransform: "uppercase", letterSpacing: "0.08em" }}>Note & Taux N+2</span>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#0060AC", margin: "4px 0 0 0" }}>
                {dossier.noteN2} <span style={{ fontSize: 13, color: "#94A3B8" }}>/ 20</span>
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#0060AC", margin: "2px 0 0 0" }}>
                {((dossier.noteN2 / 20) * 100).toFixed(1)} %
              </p>
            </div>
          </div>

          {/* Champ 1 : Saisie Note Conclue d'Arbitrage & Pourcentage Instantané */}
          <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 0, border: "2px solid #F0822A", boxShadow: "0 4px 16px rgba(240, 130, 42, 0.08)" }}>
            <label style={{ fontSize: 11, fontWeight: 900, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 8, letterSpacing: "0.06em" }}>
              🎯 Note Finale Conclue (/20) & Taux d'Atteinte (%)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                required
                value={noteConclue}
                onChange={(e) => setNoteConclue(parseFloat(e.target.value) || 0)}
                style={{
                  width: 110,
                  height: 48,
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#111827",
                  background: "#FFF8F2",
                  border: "2px solid #F0822A",
                  borderRadius: 0,
                  textAlign: "center",
                  outline: "none"
                }}
              />
              <div style={{
                background: "#ECFDF5",
                border: "1.5px solid #A7F3D0",
                padding: "8px 16px",
                borderRadius: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#047857", textTransform: "uppercase" }}>Taux équivalent</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#10B981" }}>
                  {((noteConclue / 20) * 100).toFixed(1)} %
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#535B6A", flex: 1 }}>
                Cette note arbitrée annulera et remplacera les propositions antérieures.
              </span>
            </div>
          </div>

          {/* Champ 2 : PV / Décision RH */}
          <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 0, border: "1px solid #E8E4DE" }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#535B6A", display: "block", marginBottom: 8 }}>
              📝 Procès-Verbal d'Arbitrage & Conclusions DRH
            </label>
            <textarea
              rows={3}
              required
              value={pvCommentaire}
              onChange={(e) => setPvCommentaire(e.target.value)}
              placeholder="Indiquer les conclusions de la séance physique d'arbitrage..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 0,
                border: "1px solid #E8E4DE",
                fontSize: 13,
                fontWeight: 500,
                color: "#111827",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          {/* Boutons Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 0,
                border: "1px solid #E8E4DE",
                background: "#FFFFFF",
                color: "#535B6A",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitted}
              className="btn-primary"
              style={{ flex: 2, gap: "8px", borderRadius: 0 }}
            >
              <CheckCircleIcon size={18} color="#FFFFFF" />
              {submitted ? "Enregistrement..." : "Valider & Enregistrer l'Arbitrage RH"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

