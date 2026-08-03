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
  EN_ATTENTE_N1: {
    label: "⏳ En attente N+1",
    description: "En attente de la notation par le manager direct",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 1,
    isFinal: false,
  },
  EN_ATTENTE_N2: {
    label: "🔍 En attente N+2",
    description: "En attente de la contre-évaluation par la direction",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 2,
    isFinal: false,
  },
  EN_ATTENTE_RH: {
    label: "⏳ En attente RH (Pôle DRH)",
    description: "En attente de revue et validation finale par les RH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 3,
    isFinal: false,
  },
  ARBITRAGE: {
    label: "⚖️ Arbitrage RH en cours",
    description: "Désaccord détecté — arbitrage conjoint N+2 + RH en cours",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    step: 4,
    isFinal: false,
  },
  VALIDE: {
    label: "✓ Validé & Signé",
    description: "Évaluation définitivement validée",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 5,
    isFinal: false,
  },
  CLOTURE: {
    label: "🔒 Clôturé & Archivé",
    description: "Cycle d'évaluation clôturé",
    color: "#475569",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    step: 5,
    isFinal: true,
  },
};

// Ordre de progression de la machine à états
export const STATUT_FLOW: StatutEvaluation[] = [
  "EN_ATTENTE_N1",
  "EN_ATTENTE_N2",
  "EN_ATTENTE_RH",
  "VALIDE",
];
