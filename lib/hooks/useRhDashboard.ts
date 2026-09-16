// ============================================================
// lib/hooks/useRhDashboard.ts
// Hooks React pour le tableau de bord RH — consomme rhApi
// US-10, US-12 — DashboardRH, ArbitragesPage
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";
import { rhApi } from "@/lib/api/rh.api";
import { cyclesApi } from "@/lib/api/cycles.api";
import type { EvaluationCycle } from "@/types";
import type { RhDashboardStats, ResolveArbitrageDto } from "@/lib/api/rh.api";
import type { Cycle } from "@/types";

// ─── useRhStats ──────────────────────────────────────────────

interface UseRhStatsReturn {
  stats: RhDashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * KPIs consolidés du dashboard RH.
 * Endpoint: GET /api/rh/dashboard/stats
 */
export function useRhStats(): UseRhStatsReturn {
  const [stats, setStats] = useState<RhDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rhApi.getDashboardStats();
      setStats(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur chargement stats RH");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, isLoading, error, refetch: fetch };
}

// ─── useArbitrages ───────────────────────────────────────────

interface UseArbitragesReturn {
  arbitrages: EvaluationCycle[];
  isLoading: boolean;
  error: string | null;
  resolve: (arbitrageId: string, dto: ResolveArbitrageDto) => Promise<boolean>;
  isResolving: boolean;
  refetch: () => void;
}

/**
 * Gestion des dossiers d'arbitrage RH.
 * Endpoints: GET /api/rh/arbitrages, POST /api/rh/arbitrages/:id/resolve
 */
export function useArbitrages(): UseArbitragesReturn {
  const [arbitrages, setArbitrages] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await rhApi.getArbitrages();
      setArbitrages(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur chargement arbitrages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const resolve = useCallback(async (arbitrageId: string, dto: ResolveArbitrageDto): Promise<boolean> => {
    setIsResolving(true);
    try {
      await rhApi.resolveArbitrage(arbitrageId, dto);
      await fetch(); // Rafraîchit la liste
      return true;
    } catch {
      return false;
    } finally {
      setIsResolving(false);
    }
  }, [fetch]);

  return { arbitrages, isLoading, error, resolve, isResolving, refetch: fetch };
}

// ─── useCycles ───────────────────────────────────────────────

interface UseCyclesReturn {
  cycles: Cycle[];
  cycleActif: Cycle | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Récupère tous les cycles et le cycle actif.
 * Endpoint: GET /api/rh/cycles
 */
export function useCycles(): UseCyclesReturn {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleActif, setCycleActif] = useState<Cycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [all, actif] = await Promise.all([
        cyclesApi.getAll(),
        cyclesApi.getActif(),
      ]);
      setCycles(all);
      setCycleActif(actif);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur chargement cycles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { cycles, cycleActif, isLoading, error, refetch: fetch };
}

// ─── useExportRh ─────────────────────────────────────────────

interface UseExportRhReturn {
  exportExcel: (cycleId: string) => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
}

/**
 * Déclenche l'export Excel officiel Agilly.
 * Endpoint: GET /api/rh/export/excel?cycleId=
 */
export function useExportRh(): UseExportRhReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportExcel = useCallback(async (cycleId: string): Promise<void> => {
    setIsExporting(true);
    setExportError(null);
    try {
      await rhApi.exportExcel(cycleId);
    } catch (e: unknown) {
      setExportError(e instanceof Error ? e.message : "Erreur lors de l'export.");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportExcel, isExporting, exportError };
}
