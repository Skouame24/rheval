// ============================================================
// lib/api/evaluations.api.ts
// Service Évaluations — basé sur la doc CADRAGE section 5
// Endpoints : /api/evaluations/*, /api/n1/evaluations/*, /api/n2/evaluations/*
// ============================================================

import { client } from "./client";
import type {
  EvaluationCycle,
  StatutEvaluation,
  ValiderEvaluationDto,
} from "@/types";

// ─── Types ──────────────────────────────────────────────────

export interface SignSalarieDto {
  observation: string;
}

export interface SignResponse {
  success: boolean;
  message: string;
}

export interface HistoriqueItem {
  annee: number;
  libelle: string;
  note: number;
  statut: StatutEvaluation;
  dateValidation: string;
}

export interface HistoriqueFilters {
  annee?: number;
  statut?: StatutEvaluation;
}

// ─── Service ────────────────────────────────────────────────

export const evaluationsApi = {
  /**
   * GET /api/evaluations/me/current
   * Récupère l'évaluation en cours du salarié connecté.
   * US-01 — DashboardSalarie
   */
  getMyCurrent: async (): Promise<EvaluationCycle | null> => {
    try {
      const res = await client.get<EvaluationCycle>("/evaluations/me/current");
      if (res) return res;
      return null;
    } catch (err) {
      // Si on reçoit une erreur (ex: 404) on renvoie null plutôt que de faire planter l'UX
      console.error("[evaluationsApi.getMyCurrent] Backend error:", err);
      return null;
    }
  },

  /**
   * GET /api/evaluations/me/history?annee=&statut=
   * Récupère l'historique des évaluations du salarié connecté.
   * US-03 — HistoriqueSalariePage
   */
  getMyHistory: async (filters?: HistoriqueFilters): Promise<HistoriqueItem[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.annee) params.set("annee", String(filters.annee));
      if (filters?.statut) params.set("statut", filters.statut);
      const res = await client.get<HistoriqueItem[]>(`/evaluations/me/history?${params}`);
      if (res && res.length > 0) return res;
      return [];
    } catch (err) {
      console.error("[evaluationsApi.getMyHistory] Backend error:", err);
      throw err;
    }
  },

  /**
   * POST /api/evaluations/:id/sign-salarie
   * Signature électronique du salarié.
   * US-04 — FicheEvaluationModal section signatures
   */
  signSalarie: async (id: string, dto: SignSalarieDto): Promise<SignResponse> => {
    try {
      return await client.post<SignResponse>(`/evaluations/${id}/sign-salarie`, dto);
    } catch (err) {
      console.error("[evaluationsApi.signSalarie] Backend error:", err);
      throw err;
    }
  },

  /**
   * PUT /api/n1/evaluations/:id
   * Saisie des notes /20 et commentaires par le Manager N+1.
   * US-07 — FicheEvaluationModal (rôle N1)
   */
  submitNotesN1: async (id: string, dto: ValiderEvaluationDto): Promise<EvaluationCycle> => {
    try {
      return await client.put<EvaluationCycle>(`/n1/evaluations/${id}`, dto);
    } catch (err) {
      console.error("[evaluationsApi.submitNotesN1] Backend error:", err);
      throw err;
    }
  },

  /**
   * PUT /api/n2/evaluations/:id
   * Contre-évaluation hiérarchique N+2 (avec détection écart > 2 pts).
   * US-08 & US-09 — DashboardN2 / FicheEvaluationModal (rôle N2)
   */
  submitNotesN2: async (id: string, dto: ValiderEvaluationDto): Promise<EvaluationCycle> => {
    try {
      return await client.put<EvaluationCycle>(`/n2/evaluations/${id}`, dto);
    } catch (err) {
      console.error("[evaluationsApi.submitNotesN2] Backend error:", err);
      throw err;
    }
  },

  /**
   * GET /api/rh/evaluations (toutes les fiches pour la RH)
   * US-10 — DashboardRH tableau récapitulatif
   */
  getAllForRh: async (): Promise<EvaluationCycle[]> => {
    try {
      const res = await client.get<EvaluationCycle[]>("/rh/evaluations");
      if (res && res.length > 0) return res;
      return [];
    } catch (err) {
      console.error("[evaluationsApi.getAllForRh] Backend error:", err);
      throw err;
    }
  },

  /**
   * Récupère toutes les évaluations des collaborateurs d'un N1.
   * Utilisé dans DashboardN1 et mon-equipe/evaluations.
   */
  getN1TeamEvaluations: async (): Promise<EvaluationCycle[]> => {
    try {
      const res = await client.get<EvaluationCycle[]>("/n1/evaluations");
      if (res && res.length > 0) return res;
      return [];
    } catch (err) {
      console.error("[evaluationsApi.getN1TeamEvaluations] Backend error:", err);
      throw err;
    }
  },
};
