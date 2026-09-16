// ============================================================
// lib/api/employees.api.ts
// Service Employés & Synchronisation Annuaire Microsoft Graph / Entra ID
// ============================================================

import { client } from "./client";
import type { User } from "@/types";

export interface EntraDirectoryUser {
  oid: string;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  departement: string;
  managerEmail?: string;
  managerNom?: string;
  role: string;
}

export const employeesApi = {
  /**
   * GET /api/employees/me
   */
  getMe: async (): Promise<User> => {
    try {
      const res = await client.get<User>("/employees/me");
      if (res) return res;
    } catch (err) {
      console.error("[employeesApi.getMe] Backend error:", err);
      throw err;
    }
    throw new Error("No user returned");
  },

  /**
   * GET /api/n1/collaborateurs
   */
  getMyTeam: async (): Promise<User[]> => {
    try {
      const res = await client.get<User[]>("/n1/collaborateurs");
      if (res && res.length > 0) return res;
      return [];
    } catch (err) {
      console.error("[employeesApi.getMyTeam] Backend error:", err);
      throw err;
    }
  },

  /**
   * GET /api/employees/n2-subordinates
   */
  getN2Subordinates: async (): Promise<User[]> => {
    try {
      const res = await client.get<User[]>("/employees/n2-subordinates");
      if (res && res.length > 0) return res;
      return [];
    } catch (err) {
      console.error("[employeesApi.getN2Subordinates] Backend error:", err);
      throw err;
    }
  },

  /**
   * GET /api/admin/users
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const res = await client.get<User[]>("/admin/users");
      if (res && res.length > 0) return res;
      return [];
    } catch (err) {
      console.error("[employeesApi.getAllUsers] Backend error:", err);
      throw err;
    }
  },

  /**
   * GET /api/employees/:id
   */
  getById: async (id: string): Promise<User> => {
    try {
      const res = await client.get<User>(`/employees/${id}`);
      if (res) return res;
    } catch (err) {
      console.error("[employeesApi.getById] Backend error:", err);
      throw err;
    }
    throw new Error(`Utilisateur ${id} introuvable`);
  },

  /**
   * POST /api/admin/sync-entra-directory
   * Synchronise le module Utilisateurs avec l'annuaire Microsoft Entra ID (Microsoft Graph API).
   * Récupère automatiquement les employés, leurs postes, départements et managers N+1.
   */
  syncEntraDirectory: async (): Promise<{ syncedCount: number; message: string; users: EntraDirectoryUser[] }> => {
    try {
      return await client.post<{ syncedCount: number; message: string; users: EntraDirectoryUser[] }>(
        "/admin/sync-entra-directory",
        {}
      );
    } catch (err) {
      console.error("[employeesApi.syncEntraDirectory] Backend error:", err);
      throw err;
    }
  },
};
