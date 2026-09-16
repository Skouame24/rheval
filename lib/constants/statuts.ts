// ============================================================
// lib/constants/statuts.ts
// Statuts du cycle d'évaluation — Design Agilly Soft UI
// ============================================================

import type { StatutEvaluation } from "@/types";

export interface StatutMetadata {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  step: number;       // Numéro d'étape pour la timeline (1 à 5)
  isFinal: boolean;   // Vrai si c'est un état terminal
}

export const STATUT_METADATA: Record<StatutEvaluation, StatutMetadata> = {
  FIXATION_OBJECTIFS: {
    label: "🎯 Fixation / Auto-objectifs",
    description: "Saisie des objectifs par le salarié et le manager N+1",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    step: 1,
    isFinal: false,
  },
  MI_PARCOURS: {
    label: "📊 Évaluation Mi-Parcours",
    description: "Point d'étape sur l'avancement des objectifs",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 2,
    isFinal: false,
  },
  AUTO_EVALUATION: {
    label: "✍️ Auto-évaluation Salarié",
    description: "Le salarié saisit ses auto-notes et auto-commentaires",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 3,
    isFinal: false,
  },
  EN_ATTENTE_N1: {
    label: "⏳ Notation N+1",
    description: "Attribution des notes et des commentaires par le manager direct",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 4,
    isFinal: false,
  },
  EVALUATION_N1: {
    label: "⏳ Notation N+1",
    description: "Attribution des notes et des commentaires par le manager direct",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 4,
    isFinal: false,
  },
  VISA_SALARIE: {
    label: "👍/👎 Visa & Avis Salarié",
    description: "Consultation des notes N+1 et validation (OK / NON OK)",
    color: "#F0822A",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 5,
    isFinal: false,
  },
  EN_ATTENTE_N2: {
    label: "🔍 Revue & Contre-note N+2",
    description: "Contre-évaluation par la direction hiérarchique N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 6,
    isFinal: false,
  },
  VALIDATION_N2: {
    label: "🔍 Revue & Contre-note N+2",
    description: "Contre-évaluation par la direction hiérarchique N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 6,
    isFinal: false,
  },
  EN_ATTENTE_RH: {
    label: "⏳ Validation RH",
    description: "Revue finale et validation par le Pôle DRH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 7,
    isFinal: false,
  },
  VALIDATION_DRH: {
    label: "⏳ Validation RH",
    description: "Revue finale et validation par le Pôle DRH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 7,
    isFinal: false,
  },
  ARBITRAGE: {
    label: "⚖️ Arbitrage RH en cours",
    description: "Écart de note > 2 points — dossier en arbitrage N+2 + DRH",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    step: 7,
    isFinal: false,
  },
  VALIDE: {
    label: "✓ Validé & Signé",
    description: "Évaluation définitivement validée et signée par les 4 acteurs",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 8,
    isFinal: false,
  },
  CLOTURE: {
    label: "🔒 Clôturé & Archivé",
    description: "Cycle d'évaluation clôturé et archivé",
    color: "#475569",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    step: 8,
    isFinal: true,
  },
};

// Ordre de progression de la machine à états (8 étapes)
export const STATUT_FLOW: StatutEvaluation[] = [
  "FIXATION_OBJECTIFS",
  "MI_PARCOURS",
  "AUTO_EVALUATION",
  "EVALUATION_N1",
  "VISA_SALARIE",
  "VALIDATION_N2",
  "VALIDATION_DRH",
  "VALIDE",
];
