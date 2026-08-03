// ============================================================
// lib/constants/routes.ts
// Toutes les routes de l'app centralisées — jamais de strings en dur
// ============================================================

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  HOME: "/",

  // Portail (SSO global)
  PORTAIL: "/portail",

  // Dashboards
  DASHBOARD: {
    RH: "/dashboard/pilotage-rh",
    N1: "/dashboard/mon-equipe",
    N2: "/dashboard/mon-equipe",
    SALARIE: "/dashboard/mon-espace",
    ADMIN: "/dashboard/admin",
  },

  // Salariés
  SALARIES: {
    LIST: "/salaries",
    DETAIL: (id: string) => `/salaries/${id}`,
    NEW: "/salaries/nouveau",
    EDIT: (id: string) => `/salaries/${id}/modifier`,
  },

  // Cycles d'évaluation
  CYCLES: {
    LIST: "/cycles",
    DETAIL: (id: string) => `/cycles/${id}`,
    NEW: "/cycles/nouveau",
  },

  // Évaluations
  EVALUATIONS: {
    LIST: "/evaluations",
    DETAIL: (id: string) => `/evaluations/${id}`,
    NEW: "/evaluations/nouvelle",
  },

  // Arbitrages
  ARBITRAGES: {
    LIST: "/arbitrages",
    DETAIL: (id: string) => `/arbitrages/${id}`,
  },

  // Bonus
  BONUS: {
    INDEX: "/bonus",
    BAREME: "/bonus/bareme",
    EXPORT: "/bonus/export",
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
  },

  // Organigramme
  ORGANIGRAMME: "/organigramme",

  // Admin
  ADMIN: {
    UTILISATEURS: "/admin/utilisateurs",
    AUDIT: "/admin/audit",
    PARAMETRES: "/admin/parametres",
  },
} as const;

// Redirige vers le bon dashboard selon le rôle
export const ROLE_DASHBOARD: Record<string, string> = {
  SALARIE: ROUTES.DASHBOARD.SALARIE,
  N1: ROUTES.DASHBOARD.N1,
  N2: ROUTES.DASHBOARD.N2,
  RH: ROUTES.DASHBOARD.RH,
  ADMIN: ROUTES.DASHBOARD.ADMIN,
};
