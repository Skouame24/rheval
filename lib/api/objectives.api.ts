// ============================================================
// lib/api/objectives.api.ts
// Service Objectifs — GET/POST /api/objectifs/*, /api/n1/objectifs
// US-02, US-06 — ObjectivesModule NestJS
// ============================================================

import { client } from "./client";
import type { Objectif, CreateObjectifDto } from "@/types";

// ─── Types ──────────────────────────────────────────────────

export interface CreateObjectifsDto {
  salarieId: string;
  cycleId: string;
  objectifs: CreateObjectifDto[];
}

// ─── Service ────────────────────────────────────────────────

export const objectivesApi = {
  /**
   * GET /api/objectifs/me
   * Récupère les objectifs définis pour le salarié connecté.
   * US-02 — ObjectifsSalariePage
   */
  getMyObjectifs: async (): Promise<Objectif[]> => {
    return client.get<Objectif[]>("/objectifs/me");
  },

  /**
   * GET /api/n1/objectifs/:salarieId
   * Récupère les objectifs définis par le N+1 pour un salarié donné.
   */
  getBySalarieId: async (salarieId: string): Promise<Objectif[]> => {
    return client.get<Objectif[]>(`/n1/objectifs/${salarieId}`);
  },

  /**
   * POST /api/n1/objectifs
   * Crée les objectifs pour un salarié (avec pondérations — total doit = 100%).
   * US-06 — ModalDefinirObjectifs
   * Body : { salarieId, cycleId, objectifs: [{ intitule, description, ponderation }] }
   */
  create: async (dto: CreateObjectifsDto): Promise<Objectif[]> => {
    return client.post<Objectif[]>("/n1/objectifs", dto);
  },

  /**
   * PUT /api/n1/objectifs/:id
   * Modifie un objectif existant.
   */
  update: async (
    id: string,
    dto: Partial<CreateObjectifDto>
  ): Promise<Objectif> => {
    return client.put<Objectif>(`/n1/objectifs/${id}`, dto);
  },
};
