// ============================================================
// types/bonus.types.ts
// Types liés au calcul du bonus et au barème
// ============================================================

import type { UserSummary } from "./user.types";
import type { CycleSummary } from "./cycle.types";

// Un palier du barème configuré par la RH (paramétrable sans dev)
export interface PalierBareme {
  id: string;
  baremeId: string;
  seuilMin: number;   // En % — ex: 80
  seuilMax: number;   // En % — ex: 100
  tauxBonus: number;  // En % — ex: 15
  libelle: string;    // ex: "Très bon"
}

// Barème complet d'un cycle (défini par le CODIR, paramétré par la RH)
export interface Bareme {
  id: string;
  cycleId: string;
  cycle: CycleSummary;
  paliers: PalierBareme[];
  createdAt: string;
  updatedAt: string;
}

// Résultat du calcul de bonus pour un salarié
export interface ResultatBonus {
  id: string;
  salarieId: string;
  salarie: UserSummary;
  cycleId: string;
  cycle: CycleSummary;
  noteFinale: number;        // /20
  tauxAtteinte: number;      // En % = (noteFinale / 20) * 100
  tauxBonusEstime: number;   // En % — issu du barème selon le taux d'atteinte
  palierApplique: PalierBareme;
  dateCalcul: string;
}

// Ligne du fichier Excel exporté
export interface LigneExportBonus {
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
  noteFinale: number;
  tauxAtteinte: number;
  tauxBonusEstime: number;
  palierLibelle: string;
  cycle: string;
}

// DTOs
export interface CreateBaremeDto {
  cycleId: string;
  paliers: {
    seuilMin: number;
    seuilMax: number;
    tauxBonus: number;
    libelle: string;
  }[];
}

export interface UpdateBaremeDto extends Partial<CreateBaremeDto> {}
