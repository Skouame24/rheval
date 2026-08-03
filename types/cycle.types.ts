// ============================================================
// types/cycle.types.ts
// Types liés aux cycles d'évaluation et aux objectifs
// ============================================================

export type StatutCycle = "BROUILLON" | "ACTIF" | "CLOTURE";

export interface Cycle {
  id: string;
  annee: number;
  libelle: string; // ex: "Évaluation annuelle 2025"
  dateDebut: string;
  dateFin: string;
  statut: StatutCycle;
  objectifs: Objectif[];
  createdAt: string;
  updatedAt: string;
}

export interface CycleSummary {
  id: string;
  annee: number;
  libelle: string;
  statut: StatutCycle;
  dateDebut: string;
  dateFin: string;
}

export interface Objectif {
  id: string;
  cycleId: string;
  intitule: string;
  description: string;
  ponderation: number; // En % — la somme de tous les objectifs d'un cycle = 100%
  createdAt: string;
}

// DTOs
export interface CreateCycleDto {
  annee: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  objectifs: CreateObjectifDto[];
}

export interface CreateObjectifDto {
  intitule: string;
  description: string;
  ponderation: number;
}
