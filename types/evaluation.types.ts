// ============================================================
// types/evaluation.types.ts
// Types liés aux évaluations et à l'arbitrage
// ============================================================

import type { UserSummary } from "./user.types";
import type { CycleSummary, Objectif } from "./cycle.types";

// Statuts possibles d'un cycle d'évaluation (machine à états)
export type StatutEvaluation =
  | "EN_ATTENTE_N1"    // En attente de l'évaluation du manager N+1
  | "EN_ATTENTE_N2"    // En attente de l'évaluation du manager N+2
  | "EN_ATTENTE_RH"    // En attente de validation par la RH
  | "ARBITRAGE"        // Désaccord — arbitrage conjoint N+2 + RH en cours
  | "VALIDE"           // Validé par la RH
  | "CLOTURE";         // Cycle clôturé

// Qui a réalisé l'évaluation
export type TypeEvaluateur = "N1" | "N2" | "RH";

// Note attribuée par un évaluateur pour un objectif
export interface NoteObjectif {
  objectifId: string;
  objectif: Objectif;
  note: number; // /20
  commentaire?: string;
}

// Une évaluation individuelle (N+1, N+2 ou RH)
export interface Evaluation {
  id: string;
  cycleId: string;
  salarieId: string;
  evaluateurId: string;
  evaluateur: UserSummary;
  type: TypeEvaluateur;
  notes: NoteObjectif[];         // Notes par objectif
  moyenneNotes: number;          // Calculé : moyenne pondérée /20
  competences: string[];         // Liste de compétences observées
  besoinFormation: string;       // Texte libre
  observations: string;          // Observations générales
  statut: StatutEvaluation;
  dateCreation: string;
  dateSoumission?: string;
}

// Vue complète d'un cycle d'évaluation pour un salarié
export interface EvaluationCycle {
  id: string;
  cycle: CycleSummary;
  salarie: UserSummary;
  statut: StatutEvaluation;
  evaluationN1?: Evaluation;
  evaluationN2?: Evaluation;
  evaluationRH?: Evaluation;
  arbitrage?: Arbitrage;
  noteFinale?: number;           // /20 — calculée après validation RH
  tauxAtteinte?: number;         // En % = (noteFinale / 20) * 100
  dateCreation: string;
  dateCloture?: string;
}

// Dossier d'arbitrage
export interface Arbitrage {
  id: string;
  evaluationCycleId: string;
  motif: string;                 // Motif du désaccord
  decision?: string;             // Décision conjointe enregistrée
  noteDecidee?: number;          // /20 — note retenue après arbitrage
  rhId: string;
  n2Id: string;
  rh: UserSummary;
  n2: UserSummary;
  statut: "OUVERT" | "RESOLU";
  dateOuverture: string;
  dateDecision?: string;
}

// DTOs
export interface CreateEvaluationDto {
  cycleId: string;
  salarieId: string;
  type: TypeEvaluateur;
  notes: { objectifId: string; note: number; commentaire?: string }[];
  competences: string[];
  besoinFormation: string;
  observations: string;
}

export interface ValiderEvaluationDto {
  evaluationCycleId: string;
  observations: string;
  notes: { objectifId: string; note: number }[];
}

export interface OuvrirArbitrageDto {
  evaluationCycleId: string;
  motif: string;
}

export interface EnregistrerDecisionDto {
  arbitrageId: string;
  decision: string;
  noteDecidee: number;
}
