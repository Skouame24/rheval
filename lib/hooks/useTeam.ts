// ============================================================
// lib/hooks/useTeam.ts
// Hook React pour l'équipe N+1 — consomme employeesApi
// US-05, US-06 — DashboardN1, CollaborateursN1Page
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";
import { employeesApi } from "@/lib/api/employees.api";
import type { User } from "@/types";

// ─── useMyTeam ───────────────────────────────────────────────

interface UseMyTeamReturn {
  team: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  /** Recherche filtrée côté client par nom/prénom/poste */
  search: (query: string) => User[];
}

/**
 * Récupère les collaborateurs directs du manager N+1 connecté.
 * Endpoint: GET /api/n1/collaborateurs
 */
export function useMyTeam(): UseMyTeamReturn {
  const [team, setTeam] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeesApi.getMyTeam();
      setTeam(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur chargement de l'équipe.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const search = useCallback(
    (query: string): User[] => {
      if (!query.trim()) return team;
      const q = query.toLowerCase();
      return team.filter(
        (u) =>
          u.nom.toLowerCase().includes(q) ||
          u.prenom.toLowerCase().includes(q) ||
          u.poste.toLowerCase().includes(q) ||
          u.departement.toLowerCase().includes(q)
      );
    },
    [team]
  );

  return { team, isLoading, error, refetch: fetch, search };
}

// ─── useN2Subordinates ───────────────────────────────────────

interface UseN2SubordinatesReturn {
  subordinates: User[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Récupère tous les salariés et N+1 sous la responsabilité d'un N+2.
 * Endpoint: GET /api/employees/n2-subordinates
 */
export function useN2Subordinates(): UseN2SubordinatesReturn {
  const [subordinates, setSubordinates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    employeesApi.getN2Subordinates()
      .then(setSubordinates)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur chargement N+2"))
      .finally(() => setIsLoading(false));
  }, []);

  return { subordinates, isLoading, error };
}
