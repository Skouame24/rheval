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
  onSuccess: (id: string, noteFinale: number, commentaire: string) => void | Promise<void>;
}

export function ModalArbitrageRH({ isOpen, onClose, dossier, onSuccess }: ModalArbitrageRHProps) {
  const [decisionNote, setDecisionNote] = useState<"CONFIRMER_N1" | "NOUVELLE_NOTE">("CONFIRMER_N1");
  const [noteConclue, setNoteConclue] = useState<number | "">("");
  const [pvCommentaire, setPvCommentaire] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen || !dossier) return null;

  const ecart = Math.abs(dossier.noteN1 - dossier.noteN2).toFixed(1);
  const ecartPct = ((Math.abs(dossier.noteN1 - dossier.noteN2) / 20) * 100).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    if (!pvCommentaire.trim()) {
      setSubmitError("Ajoutez le compte-rendu de la réunion avant de valider.");
      return;
    }
    if (
      decisionNote === "NOUVELLE_NOTE" &&
      (typeof noteConclue !== "number" || !Number.isFinite(noteConclue) || noteConclue < 0 || noteConclue > 20)
    ) {
      setSubmitError("Saisissez une nouvelle note comprise entre 0 et 20.");
      return;
    }

    setSubmitted(true);
    setSubmitError(null);
    try {
      const noteFinale = decisionNote === "CONFIRMER_N1"
        ? dossier.noteN1
        : Number(noteConclue);
      await onSuccess(dossier.id, noteFinale, pvCommentaire);
      onClose();
    } catch (error) {
      console.error("[ModalArbitrageRH] Erreur enregistrement arbitrage:", error);
      setSubmitError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement de l'arbitrage.");
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 110,
      background: "rgba(15, 23, 42, 0.42)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#FFFFFF",
        width: "100%",
        maxWidth: 720,
        maxHeight: "calc(100vh - 32px)",
        borderRadius: 24,
        boxShadow: "0 24px 80px rgba(15, 23, 42, 0.2)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans', sans-serif",
      }}>
        <div style={{ height: 5, flexShrink: 0, background: "linear-gradient(90deg, #F0822A 0%, #FDBA74 100%)" }} />
        <div style={{
          padding: "20px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#FFFFFF",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              background: "#FFF7ED",
              color: "#EA580C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <ScaleIcon size={22} color="#EA580C" />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#EA580C", textTransform: "uppercase" }}>
                Séance d&apos;arbitrage RH
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "3px 0 0 0", letterSpacing: "-0.02em" }}>
                Décision finale
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", background: "#F8FAFC" }}>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Card Collaborateur */}
          <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 2px 8px rgba(15,23,42,0.03)" }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#C2410C", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contestation en cours</span>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "3px 0 0 0" }}>{dossier.prenom} {dossier.nom}</h4>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#64748B", margin: "3px 0 0 0" }}>{dossier.poste} · Direction {dossier.direction}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#B91C1C", background: "#FEF2F2", padding: "6px 10px", borderRadius: 999, border: "1px solid #FECACA", display: "inline-block", whiteSpace: "nowrap" }}>
                Écart {ecart} pts ({ecartPct} %)
              </span>
            </div>
          </div>

          {/* BAROMÈTRE D'ARBITRAGE DUAL (N+1 vs N+2) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 16, border: "1px solid #FED7AA", textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#6B6359", textTransform: "uppercase", letterSpacing: "0.08em" }}>Note & Taux N+1</span>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#F0822A", margin: "4px 0 0 0" }}>
                {dossier.noteN1} <span style={{ fontSize: 13, color: "#94A3B8" }}>/ 20</span>
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#C7610C", margin: "2px 0 0 0" }}>
                {((dossier.noteN1 / 20) * 100).toFixed(1)} %
              </p>
            </div>
            <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 16, border: "1px solid #BFDBFE", textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#6B6359", textTransform: "uppercase", letterSpacing: "0.08em" }}>Note & Taux N+2</span>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#0060AC", margin: "4px 0 0 0" }}>
                {dossier.noteN2} <span style={{ fontSize: 13, color: "#94A3B8" }}>/ 20</span>
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#0060AC", margin: "2px 0 0 0" }}>
                {((dossier.noteN2 / 20) * 100).toFixed(1)} %
              </p>
            </div>
          </div>

          {/* Décision RH prise à l'issue de la réunion */}
          <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 18, border: "1px solid #FED7AA", boxShadow: "0 2px 8px rgba(249,115,22,0.05)" }}>
            <label style={{ fontSize: 11, fontWeight: 900, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 8, letterSpacing: "0.06em" }}>
              Conclusion de la réunion d&apos;arbitrage
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#334155", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="decision-note-arbitrage"
                  checked={decisionNote === "CONFIRMER_N1"}
                  onChange={() => {
                    setDecisionNote("CONFIRMER_N1");
                    setSubmitError(null);
                  }}
                />
                La note N+1 est correcte : confirmer {dossier.noteN1}/20
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#334155", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="decision-note-arbitrage"
                  checked={decisionNote === "NOUVELLE_NOTE"}
                  onChange={() => {
                    setDecisionNote("NOUVELLE_NOTE");
                    setSubmitError(null);
                  }}
                />
                La note doit être modifiée
              </label>
            </div>
            {decisionNote === "NOUVELLE_NOTE" && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  required
                  value={noteConclue}
                  onChange={(e) => {
                    setNoteConclue(e.target.value === "" ? "" : Number(e.target.value));
                    setSubmitError(null);
                  }}
                  style={{
                    width: 110,
                    height: 48,
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#111827",
                    background: "#FFF8F2",
                    border: "2px solid #F0822A",
                    borderRadius: 12,
                    textAlign: "center",
                    outline: "none"
                  }}
                />
                <div style={{
                  background: "#ECFDF5",
                  border: "1.5px solid #A7F3D0",
                  padding: "8px 16px",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#047857", textTransform: "uppercase" }}>Taux équivalent</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#10B981" }}>
                    {typeof noteConclue === "number" ? ((noteConclue / 20) * 100).toFixed(1) : "—"} %
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#535B6A", flex: 1 }}>
                  Cette note remplacera les notes proposées précédemment.
                </span>
              </div>
            )}
          </div>

          {/* Champ 2 : PV / Décision RH */}
          <div style={{ background: "#FFFFFF", padding: 18, borderRadius: 16, border: "1px solid #E2E8F0" }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#535B6A", display: "block", marginBottom: 8 }}>
              Procès-Verbal d&apos;Arbitrage & Conclusions DRH
            </label>
            <textarea
              rows={3}
              required
              value={pvCommentaire}
              onChange={(e) => {
                setPvCommentaire(e.target.value);
                setSubmitError(null);
              }}
              placeholder="Résumer la réunion et justifier la confirmation ou la modification de la note..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                fontSize: 13,
                fontWeight: 500,
                color: "#111827",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>
          {submitError && (
            <p role="alert" style={{ margin: "0 24px 16px", padding: "12px 14px", borderRadius: 12, background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: 13, fontWeight: 700 }}>
              {submitError}
            </p>
          )}

          </div>
          <div style={{ position: "sticky", bottom: 0, display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", background: "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "11px 18px",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                background: "#FFFFFF",
                color: "#475569",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitted}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 18px", border: "none", borderRadius: 12, background: submitted ? "#94A3B8" : "#F0822A", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: submitted ? "wait" : "pointer", boxShadow: "0 4px 10px rgba(240,130,42,0.22)" }}
            >
              <CheckCircleIcon size={17} color="#FFFFFF" />
              {submitted ? "Enregistrement en cours..." : "Confirmer la décision RH"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
