// ============================================================
// features/evaluation/components/FicheEvaluationModal.tsx
// Fiche d'Évaluation Officielle AGILLY — Design Soft UI Enterprise
// ============================================================

"use client";
import { useState } from "react";
import { WorkflowStepper } from "@/components/shared/WorkflowStepper";

interface FicheEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  dossier?: {
    nom: string;
    prenom: string;
    poste: string;
    direction?: string;
  } | null;
}


interface ObjectifData {
  id: string;
  numero: number;
  intitule: string;
  ponderation: number;
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

const INITIAL_OBJECTIFS: ObjectifData[] = [
  {
    id: "obj-1",
    numero: 1,
    intitule: "Monter en compétences sur les sujets d'IA/Modèles ou frameworks d'orchestration d'ici le 30 novembre 2026",
    ponderation: 30,
    noteObtenue: 18.5,
    trancheSelectionnee: "18 – 20",
    commentaire: "Excellente montée en compétence, cas d'usage LangChain déployé avec succès sur l'environnement de recette.",
    criteres: [
      { tranche: "18 – 20", label: "Excellence", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", min: 18, max: 20, defaultNote: 19, texte: "Validation autonome de 6/6 compétences lors d'une mise en situation pratique réalisée sans assistance (15-30 nov 2026), avec au moins 1 cas d'usage déployé en conditions réelles" },
      { tranche: "15 – 17", label: "Très Bon", color: "#F0822A", bg: "#FFF7ED", border: "#FFEDD5", min: 15, max: 17, defaultNote: 16, texte: "Validation autonome de 6/6 compétences entre le 1er et le 14 décembre 2026" },
      { tranche: "12 – 14", label: "Satisfaisant", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", min: 12, max: 14, defaultNote: 13, texte: "Validation autonome de 4 à 5/6 compétences, au plus tard le 31 décembre 2026" },
      { tranche: "0 – 11",  label: "Insuffisant", color: "#EF4444", bg: "#FEF2F2", border: "#FEE2E2", min: 0,  max: 11, defaultNote: 8,  texte: "Validation autonome de 3/6 compétences ou moins, ou mise en situation non réalisée au 31 décembre 2026" },
    ]
  },
  {
    id: "obj-2",
    numero: 2,
    intitule: "Maintenir la qualité de développement des plateformes web & mobile",
    ponderation: 35,
    noteObtenue: 16.0,
    trancheSelectionnee: "15 – 17",
    commentaire: "Très bonne réactivité sur la correction des anomalies et respect strict du workflow de code review.",
    criteres: [
      { tranche: "18 – 20", label: "Excellence", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", min: 18, max: 20, defaultNote: 19, texte: "0 bug critique en production, 100% des livraisons passées en revue de code avant déploiement, 100% des anomalies mineures corrigées sous 48h, aucun incident majeur" },
      { tranche: "15 – 17", label: "Très Bon", color: "#F0822A", bg: "#FFF7ED", border: "#FFEDD5", min: 15, max: 17, defaultNote: 16, texte: "1 à 2 bugs critiques (corrigés sous 48h), au moins 90% des livraisons passées en revue de code, 90% des anomalies mineures corrigées sous 48h" },
      { tranche: "12 – 14", label: "Satisfaisant", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", min: 12, max: 14, defaultNote: 13, texte: "3 à 5 bugs critiques, entre 70% et 89% des livraisons passées en revue de code, délai moyen entre 48h et 5 jours" },
      { tranche: "0 – 11",  label: "Insuffisant", color: "#EF4444", bg: "#FEF2F2", border: "#FEE2E2", min: 0,  max: 11, defaultNote: 8,  texte: "Plus de 5 bugs critiques, moins de 70% de revues de code, ou incident majeur non résolu sous 5 jours" },
    ]
  },
  {
    id: "obj-3",
    numero: 3,
    intitule: "La documentation des activités à partir du 1er août 2026 (PV de recette, Rapports d'intervention)",
    ponderation: 35,
    noteObtenue: 15.5,
    trancheSelectionnee: "15 – 17",
    commentaire: "Documentation claire et complète pour l'ensemble des livraisons majeures.",
    criteres: [
      { tranche: "18 – 20", label: "Excellence", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", min: 18, max: 20, defaultNote: 19, texte: "Taux de couverture documentaire de 90% à 100% sur toute la période" },
      { tranche: "15 – 17", label: "Très Bon", color: "#F0822A", bg: "#FFF7ED", border: "#FFEDD5", min: 15, max: 17, defaultNote: 16, texte: "Taux de couverture documentaire entre 80% et 89% sur toute la période" },
      { tranche: "12 – 14", label: "Satisfaisant", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", min: 12, max: 14, defaultNote: 13, texte: "Taux de couverture documentaire entre 70% et 79% sur toute la période" },
      { tranche: "0 – 11",  label: "Insuffisant", color: "#EF4444", bg: "#FEF2F2", border: "#FEE2E2", min: 0,  max: 11, defaultNote: 8,  texte: "Taux de couverture documentaire inférieur à 70% sur toute la période" },
    ]
  }
];

export function FicheEvaluationModal({ isOpen, onClose, readOnly = false, dossier }: FicheEvaluationModalProps) {
  const [signed, setSigned] = useState(false);
  const [observationSalarie, setObservationSalarie] = useState("");
  const [objectifs, setObjectifs] = useState<ObjectifData[]>(INITIAL_OBJECTIFS);

  if (!isOpen) return null;

  // Calcul dynamique de la Note Globale Pondérée
  const noteGlobalePonderee = objectifs.reduce((acc, obj) => {
    return acc + (obj.noteObtenue * (obj.ponderation / 100));
  }, 0);

  const tauxGlobal = ((noteGlobalePonderee / 20) * 100).toFixed(1);

  const handleSelectTranche = (objId: string, critere: { tranche: string; defaultNote: number }) => {
    if (readOnly) return;
    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          return {
            ...o,
            trancheSelectionnee: critere.tranche,
            noteObtenue: critere.defaultNote,
          };
        }
        return o;
      })
    );
  };

  const handleNoteChange = (objId: string, valStr: string) => {
    if (readOnly) return;
    const val = parseFloat(valStr) || 0;
    const clampedVal = Math.min(20, Math.max(0, val));

    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id === objId) {
          const matchedCritere = o.criteres.find(
            (c) => clampedVal >= c.min && clampedVal <= c.max
          ) || o.criteres[o.criteres.length - 1];

          return {
            ...o,
            noteObtenue: clampedVal,
            trancheSelectionnee: matchedCritere.tranche,
          };
        }
        return o;
      })
    );
  };

  const handleCommentaireChange = (objId: string, text: string) => {
    if (readOnly) return;
    setObjectifs((prev) =>
      prev.map((o) => (o.id === objId ? { ...o, commentaire: text } : o))
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
        maxWidth: 1080,
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
          padding: "20px 32px",
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
              boxShadow: "none"
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
              transition: "all 0.2s ease"
            }}
          >✕</button>
        </div>

        {/* ── BODY SCROLLABLE ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, background: "#F7F8FA" }}>
          
          {/* STEPPER DE WORKFLOW 8 ÉTAPES */}
          <WorkflowStepper currentStep={4} />

          {/* SECTION 1 : HERO SALARIÉ CARD */}
          <div style={{
            background: "#FFFFFF",
            padding: 24,
            borderRadius: 0,
            border: "1px solid #E2E8F0",
            boxShadow: "none",
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
                  boxShadow: "none",
                  border: "2px solid #FFFFFF"
                }}>
                  {dossier ? `${dossier.prenom.charAt(0)}${dossier.nom.charAt(0)}` : "EK"}
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#F0822A", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                    Fiche du Collaborateur
                  </span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "#000000", margin: "2px 0 0 0", letterSpacing: -0.5 }}>
                    {dossier ? `${dossier.prenom} ${dossier.nom}` : "Ebenezer Samuel KOUAME"}
                  </h3>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>
                    {dossier ? `${dossier.poste}${dossier.direction ? ` · ${dossier.direction}` : ""}` : "Développeur Full-Stack · Executive / Pôle Digital"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <TagChip icon="🆔" label="Matricule" value="AG-2024-089" />
                <TagChip icon="📍" label="Site" value="Abidjan AGILLY 1" />
                <TagChip icon="📅" label="Période" value="01 juin - 31 déc 2026" />
              </div>
            </div>

            {/* Manager N+1 Box */}
            <div style={{
              background: "#FFF7ED",
              padding: "14px 20px",
              borderRadius: 0,
              border: "1px solid #FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>👨‍💼</span>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#EA580C", textTransform: "uppercase" }}>Supérieur Hiérarchique (N+1)</span>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#000000", margin: 0 }}>Sevan AKOUMIA (Responsable Technique)</p>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "4px 10px", borderRadius: 0 }}>
                ✓ Évaluation Complétée
              </span>
            </div>
          </div>

          {/* SECTION 2 : GRILLE D'OBJECTIFS DE PERFORMANCE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0, letterSpacing: -0.4 }}>
                  2. Grille des Objectifs & Barème de Notation
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
                  Cliquez sur l'une des 4 tranches pour attribuer le niveau d'atteinte
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#F0822A", background: "#FFF7ED", padding: "6px 14px", borderRadius: 0, border: "1px solid #FFEDD5" }}>
                3 Objectifs · Total 100%
              </span>
            </div>

            {objectifs.map((obj) => (
              <div 
                key={obj.id} 
                style={{
                  background: "#FFFFFF",
                  padding: 28,
                  borderRadius: 0,
                  border: "1px solid #E2E8F0",
                  boxShadow: "none"
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

                  <div style={{ background: "#F8FAFC", padding: "10px 18px", borderRadius: 0, border: "1px solid #E2E8F0", textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", display: "block" }}>Note & Taux Objectif</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#F0822A" }}>{obj.noteObtenue} <span style={{ fontSize: 13, color: "#94a3b8" }}>/ 20</span></span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#EA580C", display: "block", marginTop: 2 }}>({((obj.noteObtenue / 20) * 100).toFixed(1)} %)</span>
                  </div>
                </div>

                {/* 4 Tranches d'Indicateurs Stylisées */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px 0" }}>
                    Sélectionner la tranche de réalisation :
                  </p>

                  {obj.criteres.map((c, i) => {
                    const isSelected = obj.trancheSelectionnee === c.tranche;
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
                          cursor: readOnly ? "default" : "pointer",
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
                          transition: "all 0.15s ease"
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
                            boxShadow: "none"
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
                      Ajuster la Note /20
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        disabled={readOnly}
                        value={obj.noteObtenue}
                        onChange={(e) => handleNoteChange(obj.id, e.target.value)}
                        style={{
                          width: 86,
                          height: 44,
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#000000",
                          background: "#FFFFFF",
                          border: "2px solid #F0822A",
                          borderRadius: 0,
                          textAlign: "center",
                          outline: "none",
                          boxShadow: "none"
                        }}
                      />
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#94a3b8" }}>/ 20</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 240 }}>
                    <label style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      Commentaires & Justification du N+1
                    </label>
                    <textarea
                      rows={2}
                      disabled={readOnly}
                      value={obj.commentaire}
                      onChange={(e) => handleCommentaireChange(obj.id, e.target.value)}
                      placeholder="Ajouter une appréciation ou justification..."
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#000000",
                        background: readOnly ? "transparent" : "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        borderRadius: 0,
                        outline: "none",
                        resize: "vertical"
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 3 : FORMATION À ENVISAGER */}
          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 0, border: "1px solid #E2E8F0", boxShadow: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F0822A", margin: 0 }}>
                3. Plan de Formation Recommandé
              </h3>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "4px 10px", borderRadius: 0 }}>
                1 Formation Validée
              </span>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#475569" }}>Intitulé de la Formation</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#475569" }}>Délai Souhaité</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#475569" }}>Priorité</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#000000" }}>Architecture Fine-Tuning & Orchestration IA (LangChain / LlamaIndex)</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#F0822A" }}>Q1 2027</td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", background: "#FEF2F2", padding: "4px 10px", borderRadius: 0, border: "1px solid #FEE2E2" }}>
                      Priorité Haute
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 4 : WORKFLOW & SIGNATURES DES 4 ACTEURS */}
          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 0, border: "1px solid #E2E8F0", boxShadow: "none" }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#F0822A", margin: "0 0 20px 0" }}>
              4. Validation & Workflow des 4 Signatures
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
              {/* N+1 */}
              <SignatureBox 
                step={1}
                role="Supérieur N+1"
                nom="Sevan AKOUMIA"
                signe={true}
                date="15 déc. 2026"
                observation="Évaluation validée. Collaborateur très impliqué et performant."
              />

              {/* Salarié */}
              <div style={{
                padding: 18,
                borderRadius: 0,
                border: signed ? "2px solid #10B981" : "2px dashed #F0822A",
                background: signed ? "#F0FDF4" : "#FFF7ED",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Étape 02</span>
                    <span style={{ fontSize: 10, fontWeight: 900, color: signed ? "#059669" : "#EA580C" }}>
                      {signed ? "✓ Signé" : "⚡ Votre tour"}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#F0822A", textTransform: "uppercase", marginTop: 4 }}>Évalué (Salarié)</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#000000", marginTop: 2 }}>{dossier ? `${dossier.prenom} ${dossier.nom}` : "Ebenezer Samuel KOUAME"}</div>
                </div>

                {signed ? (
                  <div style={{ marginTop: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "4px 8px", borderRadius: 0 }}>✓ Signé le 16 déc. 2026</span>
                    {observationSalarie && <p style={{ fontSize: 12, color: "#334155", marginTop: 6, fontStyle: "italic" }}>"{observationSalarie}"</p>}
                  </div>
                ) : readOnly ? (
                  <div style={{ marginTop: 14 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#D97706",
                      background: "#FEF3C7",
                      padding: "4px 8px",
                      borderRadius: 0
                    }}>
                      ⏳ Non signé
                    </span>
                  </div>
                ) : (
                  <div style={{ marginTop: 14 }}>
                    <textarea
                      placeholder="Ajouter une observation (facultatif)..."
                      value={observationSalarie}
                      onChange={(e) => setObservationSalarie(e.target.value)}
                      style={{ width: "100%", padding: 8, borderRadius: 0, border: "1px solid #CBD5E1", fontSize: 12, marginBottom: 8, outline: "none" }}
                    />
                    <button
                      onClick={() => setSigned(true)}
                      style={{ width: "100%", padding: "10px", background: "#F0822A", color: "#FFFFFF", border: "none", borderRadius: 0, fontWeight: 900, fontSize: 12, cursor: "pointer", boxShadow: "none" }}
                    >
                      ✍️ Signer la Fiche Officielle
                    </button>
                  </div>
                )}
              </div>

              {/* N+2 */}
              <SignatureBox 
                step={3}
                role="Supérieur N+2"
                nom="Direction Technique"
                signe={true}
                date="18 déc. 2026"
                observation="Avis favorable. Excellente progression."
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
              border: "4px solid #F0822A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: "#F0822A",
              background: "#FFF7ED"
            }}>
              {tauxGlobal}%
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Moyenne Générale & Taux d'atteinte</span>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#000000", margin: 0, lineHeight: 1 }}>
                {noteGlobalePonderee.toFixed(2)} / 20 <span style={{ fontSize: 15, color: "#F0822A", fontWeight: 800 }}>({tauxGlobal} %)</span>
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
              style={{ padding: "12px 24px", borderRadius: 0, border: "none", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 14, cursor: "pointer", boxShadow: "none" }}
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
            {signe ? "✓ Signé" : "⏳ En attente"}
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
