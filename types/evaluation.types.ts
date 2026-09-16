// ============================================================
// types/evaluation.types.ts
// Types liés aux évaluations et à l'arbitrage
// ============================================================

import type { UserSummary } from "./user.types";
import type { CycleSummary, Objectif } from "./cycle.types";

// Statuts possibles d'un cycle d'évaluation (machine à états)
export type StatutEvaluation =
  | "FIXATION_OBJECTIFS" 
  | "MI_PARCOURS"
  | "AUTO_EVALUATION"    
  | "EVALUATION_N1"
  | "EN_ATTENTE_N1"      
  | "VISA_SALARIE"       
  | "VALIDATION_N2"
  | "EN_ATTENTE_N2"      
  | "VALIDATION_DRH"
  | "EN_ATTENTE_RH"      
  | "ARBITRAGE"          
  | "VALIDE"             
  | "CLOTURE";

// Qui a réalisé l'évaluation
export type TypeEvaluateur = "SALARIE" | "N1" | "N2" | "RH";

// Note attribuée par un évaluateur pour un objectif
export interface NoteObjectif {
  objectifId: string;
  objectif: Objectif;
  note: number; // /20
  commentaire?: string;
  noteSalarie?: number; // Auto-note /20 du salarié
  commentaireSalarie?: string; // Auto-commentaire du salarié
}

// Une évaluation individuelle (Salarié, N+1, N+2 ou RH)
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

// Visa du salarié post-évaluation N+1
export interface VisaSalarie {
  accord: boolean;               // true = OK, false = NON OK
  observation?: string;          // Observation / justification du salarié
  dateVisa: string;
}

// Vue complète d'un cycle d'évaluation pour un salarié (FicheEvaluation)
export interface EvaluationCycle {
  id: string;
  cycle: CycleSummary;
  salarie: UserSummary;
  statut: StatutEvaluation;
  noteGlobale?: number;
  observation?: string;
  objectifs: any[]; // TODO: type précis
  competences?: any[];
  bonus?: any;
  feedbacks360?: any[];
  historique?: any[];
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
