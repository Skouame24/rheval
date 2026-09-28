// ============================================================
// lib/hooks/useEvaluation.ts
// Hooks React pour les évaluations — consomme evaluationsApi
// US-01, US-03, US-04 — DashboardSalarie, Historique
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import type {
  EvaluationCycle,
  StatutEvaluation,
} from "@/types";
import type { HistoriqueItem, HistoriqueFilters } from "@/lib/api/evaluations.api";

// ─── useCurrentEvaluation ───────────────────────────────────

interface UseCurrentEvaluationReturn {
  evaluation: EvaluationCycle | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Récupère l'évaluation en cours du salarié connecté.
 * Endpoint: GET /api/evaluations/me/current
 */
export function useCurrentEvaluation(): UseCurrentEvaluationReturn {
  const [evaluation, setEvaluation] = useState<EvaluationCycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await evaluationsApi.getMyCurrent();
      setEvaluation(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement de l'évaluation.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { evaluation, isLoading, error, refetch: fetch };
}

// ─── useEvaluationHistory ────────────────────────────────────

interface UseEvaluationHistoryReturn {
  history: HistoriqueItem[];
  isLoading: boolean;
  error: string | null;
  setFilters: (f: HistoriqueFilters) => void;
}

/**
 * Récupère l'historique des évaluations du salarié, avec filtres.
 * Endpoint: GET /api/evaluations/me/history?annee=&statut=
 */
export function useEvaluationHistory(): UseEvaluationHistoryReturn {
  const [history, setHistory] = useState<HistoriqueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoriqueFilters>({});

  useEffect(() => {
    setIsLoading(true);
    evaluationsApi.getMyHistory(filters)
      .then(setHistory)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur historique"))
      .finally(() => setIsLoading(false));
  }, [filters]);

  return { history, isLoading, error, setFilters };
}

// ─── useSignEvaluation ───────────────────────────────────────

interface UseSignEvaluationReturn {
  sign: (id: string, observation: string) => Promise<boolean>;
  isSigning: boolean;
  signSuccess: boolean;
  signError: string | null;
}

/**
 * Hook pour la signature électronique du salarié.
 * Endpoint: POST /api/evaluations/:id/sign-salarie
 */
export function useSignEvaluation(): UseSignEvaluationReturn {
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const sign = useCallback(async (id: string, observation: string): Promise<boolean> => {
    setIsSigning(true);
    setSignError(null);
    setSignSuccess(false);
    try {
      await evaluationsApi.signSalarie(id, { observation });
      setSignSuccess(true);
      return true;
    } catch (e: unknown) {
      setSignError(e instanceof Error ? e.message : "Erreur lors de la signature.");
      return false;
    } finally {
      setIsSigning(false);
    }
  }, []);

  return { sign, isSigning, signSuccess, signError };
}

// ─── useRhEvaluations ────────────────────────────────────────

interface UseRhEvaluationsReturn {
  evaluations: EvaluationCycle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Récupère toutes les fiches d'évaluation pour le dashboard RH.
 */
export function useRhEvaluations(): UseRhEvaluationsReturn {
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await evaluationsApi.getAllForRh();
      setEvaluations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur chargement fiches RH");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { evaluations, isLoading, error, refetch: fetch };
}
