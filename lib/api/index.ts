// ============================================================
// lib/api/index.ts
// Point d'entrée unique — exporte tous les services API
// Usage : import { evaluationsApi, cyclesApi, demandesApi } from "@/lib/api"
// ============================================================

export { authApi } from "./auth.api";
export { evaluationsApi } from "./evaluations.api";
export { employeesApi } from "./employees.api";
export { cyclesApi } from "./cycles.api";
export { objectivesApi } from "./objectives.api";
export { rhApi } from "./rh.api";
export { adminApi } from "./admin.api";
export { notificationsApi } from "./notifications.api";
export { demandesApi, mapFrontendTypeToBackend } from "./demandes.api";
export { client, clearApiCache, peekApiCache, onDataChanged } from "./client";

// Re-export des types utiles
export type { LoginDto, AuthResponse } from "./auth.api";
export type { SignSalarieDto, HistoriqueItem, HistoriqueFilters } from "./evaluations.api";
export type { CreateObjectifsDto } from "./objectives.api";
export type { RhDashboardStats, ResolveArbitrageDto } from "./rh.api";
export type { AuditLog } from "./admin.api";
export type { AppNotification } from "./notifications.api";
export type { CreateDemandeInput, DecisionValidationInput } from "./demandes.api";
