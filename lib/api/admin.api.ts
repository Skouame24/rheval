// ============================================================
// lib/api/admin.api.ts
// Service Administration — /api/admin/users, /api/admin/audit-logs
// US-14, US-15 — AuditModule NestJS (Rôle ADMIN uniquement)
// ============================================================

import { client } from "./client";
import type { User, CreateUserDto, UpdateUserDto } from "@/types";

// ─── Types ──────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  acteurId: string;
  acteurNom: string;
  cible: string;
  ancienneValeur: string | null;
  nouvelleValeur: string | null;
  ipAdresse: string;
  createdAt: string;
}

// ─── Service ────────────────────────────────────────────────

export const adminApi = {
  /**
   * GET /api/admin/users
   * Récupère tous les utilisateurs du système.
   * US-14 — UtilisateursAdminPage
   */
  getAllUsers: async (): Promise<User[]> => {
    return client.get<User[]>("/admin/users");
  },

  /**
   * POST /api/admin/users
   * Crée un nouveau compte utilisateur avec rattachement N+1/N+2.
   * US-14
   * Body : { nom, prenom, email, role, poste, departement, n1Id?, n2Id? }
   */
  createUser: async (dto: CreateUserDto): Promise<User> => {
    return client.post<User>("/admin/users", dto);
  },

  /**
   * PUT /api/admin/users/:id
   * Modifie un utilisateur (rôle, rattachement hiérarchique, poste…).
   * US-14
   */
  updateUser: async (id: string, dto: UpdateUserDto): Promise<User> => {
    return client.put<User>(`/admin/users/${id}`, dto);
  },

  /**
   * DELETE /api/admin/users/:id
   * Supprime un utilisateur.
   */
  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    return client.delete<{ success: boolean }>(`/admin/users/${id}`);
  },

  /**
   * GET /api/admin/audit-logs
   * Journal d'audit inaltérable (accès, modifications, signatures).
   * US-15 — AuditAdminPage
   */
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return client.get<AuditLog[]>("/admin/audit-logs");
  },
};
