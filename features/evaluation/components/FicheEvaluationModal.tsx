// ============================================================
// features/evaluation/components/FicheEvaluationModal.tsx
// Fiche d'Évaluation Officielle AGILLY — Design Soft UI Enterprise
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { WorkflowStepper } from "@/components/shared/WorkflowStepper";
import { useAuth } from "@/contexts/AuthContext";

interface FicheEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  isAutoEvaluationMode?: boolean;
  isVisaMode?: boolean;
  currentStep?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  dossier?: {
    nom: string;
    prenom: string;
    poste: string;
    direction?: string;
  } | null;
  objectifs?: any[];
}

interface ObjectifData {
  id: string;
  numero: number;
  intitule: string;
  ponderation: number;
  noteSalarie: number;
  commentaireSalarie: string;
  noteObtenue: number;
  commentaire: string;
  trancheSelectionnee: string;
  criteres: {
    tranche: string;
    label: string;
    color: string;
    bg: string;
    border: string;
    min: number;
    max: number;
    defaultNote: number;
    texte: string;
  }[];
}

const INITIAL_OBJECTIFS: ObjectifData[] = [];

export function FicheEvaluationModal({
  isOpen,
  onClose,
  readOnly = false,
  isAutoEvaluationMode = false,
  isVisaMode = false,
  currentStep = 4,
  dossier,
  objectifs: apiObjectifs,
}: FicheEvaluationModalProps) {
  const { user, role } = useAuth();
  const [objectifs, setObjectifs] = useState<ObjectifData[]>(INITIAL_OBJECTIFS);
  const [activeTab, setActiveTab] = useState<"N1" | "SALARIE">(isAutoEvaluationMode ? "SALARIE" : "N1");

  // Clé stable basée sur le contenu réel (IDs) — immune aux références instables
  const apiObjectifsKey = apiObjectifs?.map((o: any) => o.id).join(",") ?? "";

  useEffect(() => {
    // Guard: si apiObjectifs est undefined/null/vide on réinitialise
    if (!apiObjectifs || apiObjectifs.length === 0) {
      setObjectifs(INITIAL_OBJECTIFS);
      return;
    }

    setObjectifs(apiObjectifs.map((obj: any, idx: number) => {
      const evalSalarie = obj.evaluations?.find((e: any) => e.examinateurId === obj.fiche?.salarieId) || {};
      const evalN1 = obj.evaluations?.find((e: any) => e.examinateurId !== obj.fiche?.salarieId) || {};

      return {
        id: obj.id,
        numero: idx + 1,
        intitule: obj.intitule,
        ponderation: obj.ponderation ?? (idx === 0 ? 50 : 25),
        noteSalarie: evalSalarie.note ? Number(evalSalarie.note) : 0,
        commentaireSalarie: evalSalarie.observation || "",
        noteObtenue: evalN1.note ? Number(evalN1.note) : 0,
        commentaire: evalN1.observation || "",
        trancheSelectionnee: "",
        criteres: [
          {
            tranche: "18 à 20",
            label: "Excellence",
            color: "#10B981",
            bg: "#ECFDF5",
            border: "#10B981",
            min: 18,
            max: 20,
            defaultNote: 19,
            texte: obj.indicateurs?.[0]?.intitule || "Performance exceptionnelle"
          },
          {
            tranche: "15 à 17",
            label: "Très Bon",
            color: "#3B82F6",
            bg: "#EFF6FF",
            border: "#3B82F6",
            min: 15,
            max: 17,
            defaultNote: 16,
            texte: "Objectif atteint avec succès"
          },
          {
            tranche: "12 à 14",
            label: "Satisfaisant",
            color: "#F59E0B",
            bg: "#FFFBEB",
            border: "#F59E0B",
            min: 12,
            max: 14,
            defaultNote: 13,
            texte: "Objectif partiellement atteint"
          },
          {
            tranche: "0 à 11",
            label: "Insuffisant",
            color: "#EF4444",
            bg: "#FEF2F2",
            border: "#EF4444",
            min: 0,
            max: 11,
            defaultNote: 8,
            texte: "Objectif non atteint"
          }
        ]
      };
    }));
  // apiObjectifsKey est une string stable — ne change que si les IDs changent vraiment
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiObjectifsKey]);

  const collabNom = dossier ? `${dossier.prenom} ${dossier.nom}` : (user ? `${user.prenom} ${user.nom}` : "Collaborateur Agilly");
  const collabInitials = dossier ? `${dossier.prenom.charAt(0)}${dossier.nom.charAt(0)}` : (user ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}` : "AG");
  const collabPoste = dossier ? `${dossier.poste}${dossier.direction ? ` · ${dossier.direction}` : ""}` : (user ? `${user.poste || "Collaborateur"} · ${user.departement || "Direction Générale"}` : "Collaborateur Agilly");

  // Visa Salarié State
  const [visaSalarieAccord, setVisaSalarieAccord] = useState<boolean | null>(true);
  const [visaSalarieObservation, setVisaSalarieObservation] = useState("");
  const [visaSalarieSubmitted, setVisaSalarieSubmitted] = useState(false);

  if (!isOpen) return null;

  const isSalarie = role === "SALARIE";

  // Calcul dynamique de la Note Globale Pondérée N+1
  const noteGlobaleN1 = objectifs.reduce((acc, obj) => {
    return acc + (obj.noteObtenue * (obj.ponderation / 100));
  }, 0);

  // Calcul dynamique de l'Auto-Note Globale Pondérée Salarié
  const noteGlobaleSalarie = objectifs.reduce((acc, obj) => {
    return acc + (obj.noteSalarie * (obj.ponderation / 100));
  }, 0);

  const noteAffichee = activeTab === "SALARIE" ? noteGlobaleSalarie : noteGlobaleN1;
  const tauxGlobal = ((noteAffichee / 20) * 100).toFixed(1);

  // Gestion du clic sur une tranche de barème
  const handleSelectTranche = (objId: string, critere: { tranche: string; min: number; max: number; defaultNote: number }) => {
    if (readOnly && !isAutoEvaluationMode) return;

    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          const currentNote = activeTab === "SALARIE" ? o.noteSalarie : o.noteObtenue;
          // Si la note actuelle est déjà dans la tranche cliquée, on la garde ; sinon on applique la valeur par défaut indicative
          const isNoteInTier = currentNote >= critere.min && currentNote <= critere.max;
          const newNote = isNoteInTier ? currentNote : critere.defaultNote;

          if (activeTab === "SALARIE") {
            return {
              ...o,
              noteSalarie: newNote,
            };
          } else {
            return {
              ...o,
              trancheSelectionnee: critere.tranche,
              noteObtenue: newNote,
            };
          }
        }
        return o;
      })
    );
  };

  // Ajustement manuel de la note avec calcul dynamique de la tranche correspondante
  const handleNoteChange = (objId: string, valStr: string) => {
    if (readOnly && !isAutoEvaluationMode) return;
    const val = parseFloat(valStr) || 0;
    const clampedVal = Math.min(20, Math.max(0, val));

    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          const matchedCritere = o.criteres.find(
            (c) => clampedVal >= c.min && clampedVal <= c.max
          ) || o.criteres[o.criteres.length - 1];

          if (activeTab === "SALARIE") {
            return {
              ...o,
              noteSalarie: clampedVal,
            };
          } else {
            return {
              ...o,
              noteObtenue: clampedVal,
              trancheSelectionnee: matchedCritere.tranche,
            };
          }
        }
        return o;
      })
    );
  };

  const handleCommentaireChange = (objId: string, text: string) => {
    if (readOnly && !isAutoEvaluationMode) return;
    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          return activeTab === "SALARIE"
            ? { ...o, commentaireSalarie: text }
            : { ...o, commentaire: text };
        }
        return o;
      })
    );
  };

  const handleSubmitVisa = () => {
    if (visaSalarieAccord === null) {
      alert("Veuillez sélectionner soit 'Accord (OK)', soit 'Désaccord (NON OK)'.");
      return;
    }
    setVisaSalarieSubmitted(true);
    alert(
      visaSalarieAccord
        ? "✓ Votre Visa 'Accord (OK)' sur l'évaluation N+1 a été enregistré avec succès !"
        : "⚠️ Votre Visa 'Désaccord (NON OK)' a été enregistré. Le dossier passe en revue N+2 / RH."
    );
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 24px",
    }}>
      <div style={{
        background: "#FFFFFF",
        width: "100%",
        maxWidth: 1120,
        maxHeight: "94vh",
        borderRadius: 0,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans', sans-serif"
      }}>

        {/* ── TOP ACCENT BRAND BAR ── */}
        <div style={{ height: 6, width: "100%", background: "#F0822A" }} />

        {/* ── HEADER MODAL LUXURY ── */}
        <div style={{
          padding: "18px 32px",
          background: "#FFFFFF",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 0,
              background: "#FFF7ED",
              border: "1px solid #F0822A",
              color: "#F0822A",
              fontWeight: 900,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              A
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: -0.5 }}>
                  Fiche d'Évaluation de Performance Officielle
                </h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", background: "#ECFDF5", padding: "4px 10px", borderRadius: 0, border: "1px solid #10B981/30" }}>
                  🟢 Document Officiel Actif
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", margin: "2px 0 0 0", fontWeight: 600 }}>
                AGILLY RHEVAL · Campagne Annuelle 2026 · Format Conforme Excel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 0,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* ── TOGGLE ONGLET VUE MANAGER N+1 VS AUTO-ÉVALUATION SALARIÉ ── */}
        <div style={{
          padding: "10px 32px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setActiveTab("N1")}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 0,
                border: activeTab === "N1" ? "2px solid #F0822A" : "1px solid #CBD5E1",
                background: activeTab === "N1" ? "#FFF7ED" : "#FFFFFF",
                color: activeTab === "N1" ? "#F0822A" : "#64748B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              📊 Évaluation Manager N+1 ({noteGlobaleN1.toFixed(2)}/20)
            </button>
            <button
              onClick={() => setActiveTab("SALARIE")}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 0,
                border: activeTab === "SALARIE" ? "2px solid #0284C7" : "1px solid #CBD5E1",
                background: activeTab === "SALARIE" ? "#F0F9FF" : "#FFFFFF",
                color: activeTab === "SALARIE" ? "#0284C7" : "#64748B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              ✍️ Auto-évaluation Salarié ({noteGlobaleSalarie.toFixed(2)}/20)
            </button>
          </div>

          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
            {activeTab === "SALARIE" ? "Saisie / Consultation des auto-notes du salarié" : "Évaluation et appréciations hiérarchiques N+1"}
          </span>
        </div>

        {/* ── BODY SCROLLABLE ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24, background: "#F7F8FA" }}>
          
          {/* STEPPER DE WORKFLOW 8 ÉTAPES */}
          <WorkflowStepper currentStep={currentStep} />

          {/* SECTION 1 : HERO SALARIÉ CARD */}
          <div style={{
            background: "#FFFFFF",
            padding: 24,
            borderRadius: 0,
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 0,
                  background: "#F0822A",
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFFFFF"
                }}>
                  {collabInitials}
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#F0822A", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                    Fiche du Collaborateur
                  </span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "#000000", margin: "2px 0 0 0", letterSpacing: -0.5 }}>
                    {collabNom}
                  </h3>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>
                    {collabPoste}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <TagChip icon="🆔" label="Matricule" value={dossier ? "—" : (user?.id ? `AGY-${user.id.replace(/-/g,"").slice(-6).toUpperCase()}` : "—")} />
                <TagChip icon="📍" label="Département" value={dossier?.direction ?? user?.departement ?? "—"} />
                <TagChip icon="📅" label="Cycle" value={"Campagne Annuelle 2026"} />
              </div>
            </div>

            {/* Manager N+1 & Auto-éval Info Box */}
            <div style={{
              background: "#FFF7ED",
              padding: "14px 20px",
              borderRadius: 0,
              border: "1px solid #FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>👨‍💼</span>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#EA580C", textTransform: "uppercase" }}>Supérieur Hiérarchique (N+1)</span>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#000000", margin: 0 }}>
                    {dossier
                      ? "—"
                      : user?.n1
                        ? `${user.n1.prenom} ${user.n1.nom}${user.n1.poste ? ` (${user.n1.poste})` : ""}`
                        : "Non renseigné"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0284C7", background: "#E0F2FE", padding: "4px 10px", borderRadius: 0 }}>
                  Auto-éval Salarié : {noteGlobaleSalarie.toFixed(2)}/20
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "4px 10px", borderRadius: 0 }}>
                  Note N+1 : {noteGlobaleN1.toFixed(2)}/20
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2 : GRILLE D'OBJECTIFS DE PERFORMANCE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0, letterSpacing: -0.4 }}>
                  2. Grille des Objectifs & Barème de Notation {activeTab === "SALARIE" ? "(Auto-évaluation)" : "(Manager N+1)"}
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
                  Cliquez sur l'une des 4 tranches pour attribuer le niveau d'atteinte et ajustez la note si nécessaire
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#F0822A", background: "#FFF7ED", padding: "6px 14px", borderRadius: 0, border: "1px solid #FFEDD5" }}>
                {objectifs.length} Objectif{objectifs.length > 1 ? "s" : ""} · Total {objectifs.reduce((s, o) => s + (o.ponderation ?? 0), 0)}%
              </span>
            </div>

            {objectifs.length === 0 ? (
              <div style={{ background: "#FFFFFF", padding: 28, borderRadius: 0, border: "1px solid #E2E8F0", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontWeight: 600 }}>Aucun objectif fixé pour ce collaborateur.</p>
              </div>
            ) : (
              objectifs.map((obj) => {
              const currentNote = activeTab === "SALARIE" ? obj.noteSalarie : obj.noteObtenue;
              const currentComment = activeTab === "SALARIE" ? obj.commentaireSalarie : obj.commentaire;

              return (
                <div 
                  key={obj.id} 
                  style={{
                    background: "#FFFFFF",
                    padding: 28,
                    borderRadius: 0,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {/* Header Objectif */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: "#F0822A", background: "#FFF7ED", padding: "4px 10px", borderRadius: 0, border: "1px solid #FFEDD5" }}>
                          OBJECTIF DE PERFORMANCE 0{obj.numero}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                          Pondération : <strong style={{ color: "#F0822A" }}>{obj.ponderation}%</strong>
                        </span>
                      </div>
                      <h4 style={{ fontSize: 17, fontWeight: 900, color: "#000000", margin: 0, lineHeight: 1.3 }}>
                        {obj.intitule}
                      </h4>
                    </div>

                    {/* Comparateur Side-by-Side Auto-Note Salarié vs Note N+1 */}
                    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                      <div style={{ background: "#F0F9FF", padding: "8px 14px", borderRadius: 0, border: "1px solid #BAE6FD", textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "#0284C7", textTransform: "uppercase", display: "block" }}>Auto-Note Salarié</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#0369A1" }}>{obj.noteSalarie} <span style={{ fontSize: 11, color: "#94a3b8" }}>/20</span></span>
                      </div>
                      <div style={{ background: "#FFF7ED", padding: "8px 14px", borderRadius: 0, border: "1px solid #FFEDD5", textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "#EA580C", textTransform: "uppercase", display: "block" }}>Note N+1 Manager</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#F0822A" }}>{obj.noteObtenue} <span style={{ fontSize: 11, color: "#94a3b8" }}>/20</span></span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Tranches d'Indicateurs Stylisées */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px 0" }}>
                      Sélectionner la tranche de réalisation :
                    </p>

                    {obj.criteres.map((c, i) => {
                      const isSelected = currentNote >= c.min && currentNote <= c.max;
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleSelectTranche(obj.id, c)}
                          style={{
                            padding: "16px 20px",
                            borderRadius: 0,
                            border: isSelected ? `2px solid ${c.color}` : "1px solid #E2E8F0",
                            background: isSelected ? c.bg : "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            cursor: readOnly && !isAutoEvaluationMode ? "default" : "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? `0 4px 16px ${c.color}22` : "none",
                          }}
                        >
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: 0,
                            border: isSelected ? `6px solid ${c.color}` : "2px solid #CBD5E1",
                            background: "#FFFFFF",
                            flexShrink: 0,
                          }} />

                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "6px 12px",
                            borderRadius: 0,
                            background: isSelected ? c.color : "#F1F5F9",
                            color: isSelected ? "#FFFFFF" : "#475569",
                            flexShrink: 0,
                            minWidth: 84
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 900 }}>{c.tranche}</span>
                            <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", opacity: 0.9 }}>{c.label}</span>
                          </div>

                          <span style={{ fontSize: 13, fontWeight: isSelected ? 800 : 500, color: isSelected ? "#000000" : "#475569", flex: 1, lineHeight: 1.4 }}>
                            {c.texte}
                          </span>

                          {isSelected && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 900,
                              color: c.color,
                              background: "#FFFFFF",
                              padding: "4px 10px",
                              borderRadius: 0,
                              border: `1px solid ${c.border}`,
                            }}>
                              ✓ Niveau Validé
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Saisie de la Note exacte & Commentaire */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 18, background: "#F8FAFC", padding: 18, borderRadius: 0, border: "1px solid #E2E8F0" }}>
                    <div style={{ width: 190, flexShrink: 0 }}>
                      <label style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Ajuster la Note /20 ({activeTab === "SALARIE" ? "Auto-note" : "N+1"})
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          disabled={readOnly && !isAutoEvaluationMode}
                          value={currentNote}
                          onChange={(e) => handleNoteChange(obj.id, e.target.value)}
                          style={{
                            width: 86,
                            height: 44,
                            fontSize: 18,
                            fontWeight: 900,
                            color: "#000000",
                            background: "#FFFFFF",
                            border: activeTab === "SALARIE" ? "2px solid #0284C7" : "2px solid #F0822A",
                            borderRadius: 0,
                            textAlign: "center",
                            outline: "none",
                          }}
                        />
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#94a3b8" }}>/ 20</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 240 }}>
                      <label style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        {activeTab === "SALARIE" ? "Auto-commentaire du Salarié" : "Commentaires & Justification du N+1"}
                      </label>
                      <textarea
                        rows={2}
                        disabled={readOnly && !isAutoEvaluationMode}
                        value={currentComment}
                        onChange={(e) => handleCommentaireChange(obj.id, e.target.value)}
                        placeholder={activeTab === "SALARIE" ? "Commenter votre réalisation sur cet objectif..." : "Ajouter une appréciation ou justification..."}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#000000",
                          background: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          borderRadius: 0,
                          outline: "none",
                          resize: "vertical"
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>

          {/* SECTION 3 : FORMATION À ENVISAGER */}
          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 0, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F0822A", margin: 0 }}>
                3. Plan de Formation Recommandé
              </h3>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", background: "#F8FAFC", padding: "4px 10px", borderRadius: 0, border: "1px solid #E2E8F0" }}>
                À compléter par le N+1
              </span>
            </div>
            <div style={{ padding: "20px", background: "#F8FAFC", border: "1px dashed #CBD5E1", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, fontWeight: 600 }}>
                Aucune formation planifiée pour ce cycle. Le manager N+1 peut en ajouter lors de l'évaluation.
              </p>
            </div>
          </div>

          {/* SECTION 4 : WORKFLOW & VISA SALARIÉ (OK / NON OK) / SIGNATURES DES 4 ACTEURS */}
          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 0, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F0822A", margin: "0 0 20px 0" }}>
              4. Validation, Visa Salarié & Signatures des 4 Acteurs
            </h3>

            {/* MODULE VISA SALARIÉ (SI VISA EN COURS OU SALARIÉ CONNECTÉ) */}
            {(isVisaMode || isSalarie) && (
              <div style={{
                marginBottom: 24,
                padding: 20,
                background: visaSalarieSubmitted ? "#F0FDF4" : "#FFF7ED",
                border: visaSalarieSubmitted ? "2px solid #10B981" : "2px solid #F0822A",
                borderRadius: 0,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 900, color: "#000000", margin: 0 }}>
                    ✍️ Avis & Visa du Salarié sur la Note N+1 ({noteGlobaleN1.toFixed(2)}/20)
                  </h4>
                  {visaSalarieSubmitted ? (
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#059669", background: "#D1FAE5", padding: "4px 10px", borderRadius: 0 }}>
                      ✓ Visa Enregistré
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#EA580C", background: "#FFEDD5", padding: "4px 10px", borderRadius: 0 }}>
                      ⚡ Action Requise Salarié
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px 0" }}>
                  Après la saisie des évaluations par votre N+1, veuillez donner votre accord ou désaccord sur la note et les appréciations.
                </p>

                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <button
                    onClick={() => setVisaSalarieAccord(true)}
                    disabled={visaSalarieSubmitted}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 0,
                      border: visaSalarieAccord === true ? "2px solid #10B981" : "1px solid #CBD5E1",
                      background: visaSalarieAccord === true ? "#ECFDF5" : "#FFFFFF",
                      color: visaSalarieAccord === true ? "#047857" : "#475569",
                      fontWeight: 900,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    👍 D'accord / OK (Note & Appréciation Validées)
                  </button>

                  <button
                    onClick={() => setVisaSalarieAccord(false)}
                    disabled={visaSalarieSubmitted}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 0,
                      border: visaSalarieAccord === false ? "2px solid #EF4444" : "1px solid #CBD5E1",
                      background: visaSalarieAccord === false ? "#FEF2F2" : "#FFFFFF",
                      color: visaSalarieAccord === false ? "#B91C1C" : "#475569",
                      fontWeight: 900,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    👎 Pas d'accord / NON OK (Motif d'observation requis)
                  </button>
                </div>

                <textarea
                  disabled={visaSalarieSubmitted}
                  placeholder="Remarques ou observations du salarié..."
                  value={visaSalarieObservation}
                  onChange={(e) => setVisaSalarieObservation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: 13,
                    borderRadius: 0,
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    marginBottom: 14,
                    outline: "none"
                  }}
                  rows={2}
                />

                {!visaSalarieSubmitted && (
                  <button
                    onClick={handleSubmitVisa}
                    style={{
                      padding: "10px 24px",
                      background: "#F0822A",
                      color: "#FFFFFF",
                      fontWeight: 900,
                      fontSize: 13,
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 0
                    }}
                  >
                    💾 Valider mon Visa Salarié
                  </button>
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
              {/* N+1 */}
              <SignatureBox 
                step={1}
                role="Supérieur N+1"
                nom={user?.n1 ? `${user.n1.prenom} ${user.n1.nom}` : (dossier ? "N+1" : "Non renseigné")}
                signe={false}
                date="En attente"
                observation="En attente de l'évaluation N+1."
              />

              {/* Salarié */}
              <SignatureBox 
                step={2}
                role="Évalué (Salarié)"
                nom={collabNom}
                signe={visaSalarieSubmitted}
                date={visaSalarieSubmitted ? "16 déc. 2026" : "En attente"}
                observation={visaSalarieSubmitted ? (visaSalarieAccord ? `✓ OK / Accord — "${visaSalarieObservation || "Vu et approuvé."}"` : `⚠️ NON OK / Désaccord — "${visaSalarieObservation}"`) : "Visa salarié en cours."}
              />

              {/* N+2 */}
              <SignatureBox 
                step={3}
                role="Supérieur N+2"
                nom={user?.n2 ? `${user.n2.prenom} ${user.n2.nom}` : "—"}
                signe={false}
                date="En attente"
                observation="En attente de validation N+1."
              />

              {/* DRH */}
              <SignatureBox 
                step={4}
                role="Direction RH"
                nom="Pôle RH AGILLY"
                signe={false}
                date="En attente"
                observation="Dossier en cours de revue finale par la RH."
              />
            </div>
          </div>

        </div>

        {/* ── FOOTER MODAL FLOATING ── */}
        <div style={{ padding: "20px 36px", background: "#FFFFFF", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 0,
              border: activeTab === "SALARIE" ? "4px solid #0284C7" : "4px solid #F0822A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: activeTab === "SALARIE" ? "#0284C7" : "#F0822A",
              background: activeTab === "SALARIE" ? "#F0F9FF" : "#FFF7ED"
            }}>
              {tauxGlobal}%
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>
                {activeTab === "SALARIE" ? "Auto-Moyenne Salarié" : "Moyenne N+1 & Taux d'atteinte"}
              </span>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#000000", margin: 0, lineHeight: 1 }}>
                {noteAffichee.toFixed(2)} / 20 <span style={{ fontSize: 15, color: "#F0822A", fontWeight: 800 }}>({tauxGlobal} %)</span>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
              style={{ padding: "12px 20px", borderRadius: 0, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
            >
              Fermer
            </button>
            <button
              onClick={() => alert("Génération de la Fiche Officielle Excel d'Agilly en cours...")}
              style={{ padding: "12px 24px", borderRadius: 0, border: "none", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 14, cursor: "pointer" }}
            >
              📥 Exporter la Fiche Excel Officielle
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function TagChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: "#F8FAFC", padding: "8px 14px", borderRadius: 0, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <div>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", display: "block" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#000000" }}>{value}</span>
      </div>
    </div>
  );
}

function SignatureBox({ step, role, nom, signe, date, observation }: any) {
  return (
    <div style={{
      padding: 18,
      borderRadius: 0,
      border: "1px solid #E2E8F0",
      background: signe ? "#F8FAFC" : "#FAFAFA",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Étape 0{step}</span>
          <span style={{ fontSize: 10, fontWeight: 900, color: signe ? "#059669" : "#D97706" }}>
            {signe ? "✓ Signé / Validé" : "⏳ En attente"}
          </span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 900, color: "#F0822A", textTransform: "uppercase", marginTop: 4 }}>{role}</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#000000", marginTop: 2 }}>{nom}</div>
      </div>
      
      <div style={{ marginTop: 14 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          color: signe ? "#059669" : "#D97706",
          background: signe ? "#D1FAE5" : "#FEF3C7",
          padding: "4px 8px",
          borderRadius: 0
        }}>
          {signe ? `✓ Validé (${date})` : "⏳ Non signé"}
        </span>
        {observation && <p style={{ fontSize: 12, color: "#475569", marginTop: 8, fontStyle: "italic" }}>"{observation}"</p>}
      </div>
    </div>
  );
}
