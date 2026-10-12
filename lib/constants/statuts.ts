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
    label: "Fixation des objectifs",
    description: "Le manager direct définit les objectifs et pondérations du salarié",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    step: 1,
    isFinal: false,
  },
  VALIDATION_OBJECTIFS_N2: {
    label: "Validation objectifs direction",
    description: "En attente de validation des objectifs par le responsable direction",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 1,
    isFinal: false,
  },
  VALIDATION_OBJECTIFS_SALARIE: {
    label: "Confirmation objectifs salarié",
    description: "En attente de confirmation et acceptation des objectifs par le collaborateur",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 1,
    isFinal: false,
  },
  MI_PARCOURS: {
    label: "Mi-parcours",
    description: "Point d'étape sur l'avancement des objectifs",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 2,
    isFinal: false,
  },
  AUTO_EVALUATION: {
    label: "Auto-évaluation",
    description: "Le salarié saisit ses auto-notes (notes uniquement, pas de commentaires)",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 2,
    isFinal: false,
  },
  // Alias legacy — mappés sur EVALUATION_N1
  EN_ATTENTE_N1: {
    label: "Évaluation manager",
    description: "Attribution des notes, commentaires et formations par le manager",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 3,
    isFinal: false,
  },
  EVALUATION_N1: {
    label: "Évaluation manager",
    description: "Attribution des notes, commentaires et formations par le manager",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 3,
    isFinal: false,
  },
  // Alias legacy — VISA_SALARIE n'existe plus dans le nouveau workflow
  VISA_SALARIE: {
    label: "Visa salarié",
    description: "Consultation et visa de l'évaluation par le collaborateur",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 3,
    isFinal: false,
  },
  // Alias legacy — mappés sur EVALUATION_N2
  EN_ATTENTE_N2: {
    label: "Validation direction",
    description: "Revue hiérarchique et visa de la direction",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  VALIDATION_N2: {
    label: "Validation direction",
    description: "Revue hiérarchique et visa de la direction",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  EVALUATION_N2: {
    label: "Validation direction",
    description: "Revue hiérarchique et visa de la direction",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  // Alias legacy
  EN_ATTENTE_RH: {
    label: "Validation RH",
    description: "Revue finale et validation par le Pôle DRH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 5,
    isFinal: false,
  },
  VALIDATION_DRH: {
    label: "Validation RH",
    description: "Revue finale et validation par le Pôle DRH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 5,
    isFinal: false,
  },
  ARBITRAGE: {
    label: "Arbitrage RH",
    description: "Dossier en arbitrage — désaccord de notation",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    step: 5,
    isFinal: false,
  },
  VALIDE: {
    label: "Validé",
    description: "Évaluation définitivement validée par la Direction RH",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 6,
    isFinal: false,
  },
  OBJECTIFS_VALIDES: {
    label: "Objectifs validés",
    description: "Les objectifs de performance ont été approuvés",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 1,
    isFinal: false,
  },
  AUTO_EVALUATION_SOUMISE: {
    label: "Auto-évaluation soumise",
    description: "Le collaborateur a validé son auto-évaluation",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 2,
    isFinal: false,
  },
  VALIDATION_NOTES_N2: {
    label: "Validation direction",
    description: "Revue hiérarchique et visa de la direction",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  ACCORD_SALARIE: {
    label: "Accord salarié",
    description: "Visa accordé par le collaborateur",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 5,
    isFinal: false,
  },
  ARBITRAGE_RH: {
    label: "Arbitrage RH",
    description: "Dossier en arbitrage par la Direction RH",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    step: 5,
    isFinal: false,
  },
  CLOTUREE: {
    label: "Clôturée",
    description: "Évaluation définitivement clôturée",
    color: "#475569",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    step: 6,
    isFinal: true,
  },
  CLOTURE: {
    label: "Clôturé",
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
