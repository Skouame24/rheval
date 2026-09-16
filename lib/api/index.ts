// ============================================================
// lib/api/index.ts
// Point d'entrée unique — exporte tous les services API
// Usage : import { evaluationsApi, cyclesApi } from "@/lib/api"
// ============================================================

export { authApi } from "./auth.api";
export { evaluationsApi } from "./evaluations.api";
export { employeesApi } from "./employees.api";
export { cyclesApi } from "./cycles.api";
export { objectivesApi } from "./objectives.api";
export { rhApi } from "./rh.api";
export { adminApi } from "./admin.api";

// Re-export des types utiles
export type { LoginDto, AuthResponse } from "./auth.api";
export type { SignSalarieDto, HistoriqueItem, HistoriqueFilters } from "./evaluations.api";
export type { CreateObjectifsDto } from "./objectives.api";
export type { RhDashboardStats, ResolveArbitrageDto } from "./rh.api";
export type { AuditLog } from "./admin.api";
