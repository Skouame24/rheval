// ============================================================
// lib/constants/statuts.ts
// Statuts du cycle d'évaluation — Design Agilly Soft UI
// Workflow en 8 étapes :
// 1. FIXATION_OBJECTIFS (N+1)
// 2. VALIDATION_OBJECTIFS_RH (DRH)
// 3. VALIDATION_OBJECTIFS_N2 (N+2)
// 4. VALIDATION_OBJECTIFS_SALARIE (Salarié)
// 5. EVALUATION_N1 (N+1 évalue seul)
// 6. VALIDATION_NOTES_N2 (N+2 valide la note)
// 7. ACCORD_SALARIE (Salarié accord ou contestation)
// 8. CLOTURE (Clôture définitive ou arbitrage RH)
// ============================================================

import type { StatutEvaluation } from "@/types";

export interface StatutMetadata {
  label: string;
  description: string;
  color: string;      // Couleur primaire hex
  bg: string;         // Fond badge / card
  border: string;     // Bordure badge
  step: number;       // Numéro d'étape pour la timeline (1 à 8)
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
  VALIDATION_OBJECTIFS_RH: {
    label: "Validation objectifs RH",
    description: "En attente de validation des objectifs par les Ressources Humaines",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 2,
    isFinal: false,
  },
  VALIDATION_OBJECTIFS_N2: {
    label: "Validation objectifs Direction",
    description: "En attente de validation des objectifs par la Direction N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 3,
    isFinal: false,
  },
  VALIDATION_OBJECTIFS_SALARIE: {
    label: "Accord objectifs salarié",
    description: "En attente de prise de connaissance et d'accord sur les objectifs par le collaborateur",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 4,
    isFinal: false,
  },
  MI_PARCOURS: {
    label: "Mi-parcours",
    description: "Point d'étape sur l'avancement des objectifs",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 4,
    isFinal: false,
  },
  AUTO_EVALUATION: {
    label: "Évaluation manager",
    description: "Le manager direct évalue les indicateurs et propose des formations",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 5,
    isFinal: false,
  },
  EN_ATTENTE_N1: {
    label: "Évaluation manager",
    description: "Attribution des notes, commentaires et formations par le manager",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 5,
    isFinal: false,
  },
  EVALUATION_N1: {
    label: "Évaluation manager",
    description: "Attribution des notes, commentaires et formations par le manager direct",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    step: 5,
    isFinal: false,
  },
  // Validation de la note par le N+2 (Contrôle et visa, pas de double évaluation)
  VALIDATION_NOTES_N2: {
    label: "Validation note Direction",
    description: "Revue hiérarchique et validation de la note par la Direction N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 6,
    isFinal: false,
  },
  EN_ATTENTE_N2: {
    label: "Validation note Direction",
    description: "Revue hiérarchique et validation de la note par la Direction N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 6,
    isFinal: false,
  },
  VALIDATION_N2: {
    label: "Validation note Direction",
    description: "Revue hiérarchique et validation de la note par la Direction N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 6,
    isFinal: false,
  },
  EVALUATION_N2: {
    label: "Validation note Direction",
    description: "Revue hiérarchique et validation de la note par la Direction N+2",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    step: 6,
    isFinal: false,
  },
  // Accord et visa du salarié sur la note
  ACCORD_SALARIE: {
    label: "Accord salarié",
    description: "Validation de l'accord ou contestation pour arbitrage RH",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 7,
    isFinal: false,
  },
  VISA_SALARIE: {
    label: "Accord salarié",
    description: "Validation de l'accord ou contestation pour arbitrage RH",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 7,
    isFinal: false,
  },
  // Clôture et Arbitrage RH
  EN_ATTENTE_RH: {
    label: "Validation RH",
    description: "Revue finale et clôture par la Direction RH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 8,
    isFinal: false,
  },
  VALIDATION_DRH: {
    label: "Validation RH",
    description: "Revue finale et clôture par la Direction RH",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FFEDD5",
    step: 8,
    isFinal: false,
  },
  ARBITRAGE: {
    label: "Arbitrage RH",
    description: "Dossier en arbitrage RH suite à contestation du collaborateur",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    step: 8,
    isFinal: false,
  },
  ARBITRAGE_RH: {
    label: "Arbitrage RH",
    description: "Dossier en arbitrage par la Direction RH suite à contestation",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    step: 8,
    isFinal: false,
  },
  VALIDE: {
    label: "Validé",
    description: "Évaluation définitivement validée et clôturée",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 8,
    isFinal: true,
  },
  OBJECTIFS_VALIDES: {
    label: "Objectifs validés",
    description: "Les objectifs de performance ont été approuvés",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 4,
    isFinal: false,
  },
  AUTO_EVALUATION_SOUMISE: {
    label: "Auto-évaluation soumise",
    description: "Le collaborateur a validé son auto-évaluation",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    step: 5,
    isFinal: false,
  },
  CLOTUREE: {
    label: "✓ Clôturé",
    description: "Évaluation définitivement clôturée et archivée",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 8,
    isFinal: true,
  },
  CLOTURE: {
    label: "✓ Clôturé",
    description: "Cycle d'évaluation clôturé et archivé",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    step: 8,
    isFinal: true,
  },
};

// Ordre de progression officiel en 8 étapes réelles
export const STATUT_FLOW: StatutEvaluation[] = [
  "FIXATION_OBJECTIFS",
  "VALIDATION_OBJECTIFS_RH",
  "VALIDATION_OBJECTIFS_N2",
  "VALIDATION_OBJECTIFS_SALARIE",
  "EVALUATION_N1",
  "VALIDATION_NOTES_N2",
  "ACCORD_SALARIE",
  "CLOTURE",
];
