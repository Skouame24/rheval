// ============================================================
// lib/api/cycles.api.ts
// Service Cycles — POST/GET /api/rh/cycles
// US-11 — CyclesModule NestJS (Rôle RH/ADMIN)
// ============================================================

import { client } from "./client";
import type { Cycle, CreateCycleDto } from "@/types";

export const cyclesApi = {
  /**
   * GET /api/rh/cycles
   * Liste tous les cycles d'évaluation (actifs et clôturés).
   * US-11 — DashboardRH / pilotage-rh/cycles
   */
  getAll: async (): Promise<Cycle[]> => {
    try {
      const res = await client.get<Cycle[]>("/rh/cycles");
      if (res && res.length > 0) return res;
      return [];
    } catch (err) {
      console.error("[cyclesApi.getAll] Backend error:", err);
      throw err;
    }
  },

  /**
   * GET /api/rh/cycles/actif
   * Récupère le cycle actuellement actif.
   */
  getActif: async (): Promise<Cycle | null> => {
    try {
      const res = await client.get<Cycle | null>("/rh/cycles/actif");
      if (res) return res;
      return null;
    } catch (err) {
      console.error("[cyclesApi.getActif] Backend error:", err);
      throw err;
    }
  },

  /**
   * POST /api/rh/cycles
   * Crée et ouvre un nouveau cycle d'évaluation.
   * US-11 — ModalCreerCycle
   * Body : { annee, libelle, dateDebut, dateFin }
   */
  create: async (dto: CreateCycleDto): Promise<Cycle> => {
    try {
      return await client.post<Cycle>("/rh/cycles", dto);
    } catch (err) {
      console.error("[cyclesApi.create] Backend error:", err);
      throw err;
    }
  },

  /**
   * PUT /api/rh/cycles/:id/cloturer
   * Clôture un cycle d'évaluation.
   */
  cloturer: async (id: string): Promise<Cycle> => {
    try {
      return await client.put<Cycle>(`/rh/cycles/${id}/cloturer`);
    } catch (err) {
      console.error("[cyclesApi.cloturer] Backend error:", err);
      throw err;
    }
  },
};
