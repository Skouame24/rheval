// ============================================================
// lib/api/objectives.api.ts
// Service Objectifs — GET/POST /api/objectifs/*, /api/n1/objectifs
// US-02, US-06 — ObjectivesModule NestJS
// ============================================================

import { client } from "./client";
import type { Objectif, CreateObjectifDto } from "@/types";

// ─── Types ──────────────────────────────────────────────────

export interface CreateObjectifItemDto {
  id?: string;
  intitule: string;
  description?: string;
  ponderation?: number;
  criteres?: {
    t18_20?: string;
    t15_17?: string;
    t12_14?: string;
    t0_11?: string;
  };
}

export interface CreateObjectifsDto {
  salarieId: string;
  cycleId?: string;
  objectifs: CreateObjectifItemDto[];
}

// ─── Service ────────────────────────────────────────────────

export const objectivesApi = {
  /**
   * GET /api/objectifs/me
   * Récupère les objectifs définis pour le salarié connecté.
   * US-02 — ObjectifsSalariePage
   */
  getMyObjectifs: async (): Promise<any[]> => {
    return client.get<any[]>("/objectifs/me");
  },

  /**
   * GET /api/n1/objectifs/:salarieId
   * Récupère les objectifs définis par le N+1 pour un salarié donné.
   */
  getBySalarieId: async (salarieId: string): Promise<any[]> => {
    return client.get<any[]>(`/n1/objectifs/${salarieId}`);
  },

  /**
   * POST /api/n1/objectifs
   * Crée / met à jour les objectifs pour un salarié.
   * US-06 — ModalDefinirObjectifs
   */
  create: async (dto: CreateObjectifsDto): Promise<any[]> => {
    return client.post<any[]>("/n1/objectifs", dto);
  },

  /**
   * PUT /api/n1/objectifs/:id
   * Modifie un objectif existant.
   */
  update: async (
    id: string,
    dto: Partial<CreateObjectifDto>
  ): Promise<any> => {
    return client.put<any>(`/n1/objectifs/${id}`, dto);
  },
};
