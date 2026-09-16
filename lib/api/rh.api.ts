// ============================================================
// lib/api/rh.api.ts
// Service RH — /api/rh/dashboard/stats, arbitrages, export
// US-10, US-12, US-13 — ArbitrationModule + ExcelPdfEngineModule NestJS
// ============================================================

import { client } from "./client";
import type { EvaluationCycle, Arbitrage } from "@/types";
import type { ResultatBonus, Bareme } from "@/types/bonus.types";

// ─── Types ──────────────────────────────────────────────────

export interface RhDashboardStats {
  totalSalaries: number;
  fichesCompletes: number;
  fichesEnCours: number;
  fichesNonDemarrees: number;
  tauxCompletion: number;
  moyenneGlobale: number;
  arbitragesOuverts: number;
  cycleActif: { id: string; annee: number; libelle: string; statut: string } | null;
  repartitionStatuts: Record<string, number>;
}

export interface ResolveArbitrageDto {
  decision: string;
  noteFinale: number;
}

// ─── Service ────────────────────────────────────────────────

export const rhApi = {
  /**
   * GET /api/rh/dashboard/stats
   * KPIs consolidés pour le tableau de bord RH.
   * US-10 — DashboardRH
   */
  getDashboardStats: async (): Promise<RhDashboardStats> => {
    return client.get<RhDashboardStats>("/rh/dashboard/stats");
  },

  /**
   * GET /api/rh/arbitrages
   * Liste tous les dossiers d'arbitrage ouverts.
   * US-12 — pilotage-rh/arbitrages
   */
  getArbitrages: async (): Promise<EvaluationCycle[]> => {
    return client.get<EvaluationCycle[]>("/rh/arbitrages");
  },

  /**
   * POST /api/rh/arbitrages/:id/resolve
   * Enregistre la décision d'arbitrage RH + note finale.
   * US-12 — ModalArbitrageRH
   * Body : { decision: string, noteFinale: number }
   */
  resolveArbitrage: async (
    arbitrageId: string,
    dto: ResolveArbitrageDto
  ): Promise<{ success: boolean; message: string }> => {
    return client.post(`/rh/arbitrages/${arbitrageId}/resolve`, dto);
  },

  /**
   * GET /api/rh/export/excel?cycleId=
   * Télécharge le fichier Excel officiel Agilly.
   * US-13 — ExportRhPage
   */
  exportExcel: async (cycleId: string): Promise<void> => {
    return client.download(`/rh/export/excel?cycleId=${cycleId}`, `AGILLY_RHEVAL_Export_${cycleId}.xlsx`);
  },

  /**
   * GET /api/rh/bonus/resultats?cycleId=
   * Récupère les résultats de calcul des bonus.
   * pilotage-rh/bonus
   */
  getBonusResultats: async (cycleId?: string): Promise<ResultatBonus[]> => {
    const params = cycleId ? `?cycleId=${cycleId}` : "";
    return client.get<ResultatBonus[]>(`/rh/bonus/resultats${params}`);
  },

  /**
   * GET /api/rh/bareme/actif
   * Récupère le barème de bonus du cycle actif.
   */
  getBaremeActif: async (): Promise<Bareme> => {
    return client.get<Bareme>("/rh/bareme/actif");
  },
};
