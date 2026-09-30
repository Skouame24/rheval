// ============================================================
// lib/constants/statuts.ts
// Statuts du cycle d'évaluation — Design Agilly Soft UI
// Workflow: FIXATION_OBJECTIFS → AUTO_EVALUATION → EVALUATION_N1 → EVALUATION_N2 → VALIDATION_DRH → VALIDE/CLOTURE
// ============================================================

import type { StatutEvaluation } from "@/types";

export interface StatutMetadata {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  step: number;       // Numéro d'étape pour la timeline (1 à 6)
  isFinal: boolean;   // Vrai si c'est un état terminal
}

export const STATUT_METADATA: Record<StatutEvaluation, StatutMetadata> = {
  FIXATION_OBJECTIFS: {
    label: "🎯 Fixation des Objectifs",
    description: "Le N+1 définit les objectifs et pondérations du salarié",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    step: 1,
    isFinal: false,
  },
  MI_PARCOURS: {
    label: "📊 Mi-Parcours",
    description: "Point d'étape sur l'avancement des objectifs",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 2,
    isFinal: false,
  },
  AUTO_EVALUATION: {
    label: "✍️ Auto-évaluation Salarié",
    description: "Le salarié saisit ses auto-notes (notes uniquement, pas de commentaires)",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 2,
    isFinal: false,
  },
  // Alias legacy — mappés sur EVALUATION_N1
  EN_ATTENTE_N1: {
    label: "⏳ Évaluation N+1",
    description: "Attribution des notes, commentaires et formations par le N+1",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 3,
    isFinal: false,
  },
  EVALUATION_N1: {
    label: "⏳ Évaluation N+1",
    description: "Attribution des notes, commentaires et formations par le N+1",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 3,
    isFinal: false,
  },
  // Alias legacy — VISA_SALARIE n'existe plus dans le nouveau workflow
  VISA_SALARIE: {
    label: "⏳ Évaluation N+1",
    description: "Attribution des notes par le manager direct",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 3,
    isFinal: false,
  },
  // Alias legacy — mappés sur EVALUATION_N2
  EN_ATTENTE_N2: {
    label: "🔍 Évaluation N+2",
    description: "Évaluation et notation par la direction hiérarchique N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  VALIDATION_N2: {
    label: "🔍 Évaluation N+2",
    description: "Évaluation et notation par la direction hiérarchique N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  EVALUATION_N2: {
    label: "🔍 Évaluation N+2",
    description: "Évaluation et notation par la direction hiérarchique N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  // Alias legacy
  EN_ATTENTE_RH: {
    label: "⏳ Validation RH",
    description: "Revue finale et validation par le Pôle DRH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 5,
    isFinal: false,
  },
  VALIDATION_DRH: {
    label: "⏳ Validation RH",
    description: "Revue finale et validation par le Pôle DRH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 5,
    isFinal: false,
  },
  ARBITRAGE: {
    label: "⚖️ Arbitrage RH",
    description: "Dossier en arbitrage — désaccord de notation",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    step: 5,
    isFinal: false,
  },
  VALIDE: {
    label: "✓ Validé",
    description: "Évaluation définitivement validée par la Direction RH",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 6,
    isFinal: false,
  },
  CLOTURE: {
    label: "🔒 Clôturé & Archivé",
    description: "Cycle d'évaluation clôturé et archivé",
    color: "#475569",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    step: 6,
    isFinal: true,
  },
};

// Ordre de progression officiel (6 étapes)
// Salarié simple : FIXATION_OBJECTIFS → AUTO_EVALUATION → EVALUATION_N1 → EVALUATION_N2 → VALIDATION_DRH → VALIDE/CLOTURE
// Manager (N+1) : FIXATION_OBJECTIFS → AUTO_EVALUATION → EVALUATION_N2 → VALIDATION_DRH → VALIDE/CLOTURE
export const STATUT_FLOW: StatutEvaluation[] = [
  "FIXATION_OBJECTIFS",
  "AUTO_EVALUATION",
  "EVALUATION_N1",
  "EVALUATION_N2",
  "VALIDATION_DRH",
  "VALIDE",
];
