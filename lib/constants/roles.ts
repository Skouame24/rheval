// ============================================================
// lib/constants/roles.ts
// Définition des rôles applicatifs et leurs métadonnées
// ============================================================

import type { Role } from "@/types";

export const ROLES = {
  SALARIE: "SALARIE",
  RH: "RH",
  DRH: "DRH",
  ADMIN: "ADMIN",
  N1: "N1",
  N2: "N2",
} as const;

export interface RoleMetadata {
  label: string;
  labelCourt: string;
  description: string;
  color: string;       // Couleur texte
  bg: string;          // Couleur fond badge
  border: string;      // Couleur bordure badge
  emoji: string;
}

export const ROLE_METADATA: Record<Role, RoleMetadata> = {
  SALARIE: {
    label: "Salarié",
    labelCourt: "Salarié",
    description: "Est évalué, consulte son statut et reçoit des notifications",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    emoji: "👤",
  },
  RH: {
    label: "Ressources Humaines (Suivi Operateur)",
    labelCourt: "RH",
    description: "Suivi opérationnel, relances et préparation des arbitrages",
    color: "#1E3A8A",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    emoji: "📝",
  },
  DRH: {
    label: "Direction des Ressources Humaines",
    labelCourt: "DRH",
    description: "Arbitrage final, validation des arbitrages et clôture des exercices",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    emoji: "⚖️",
  },
  ADMIN: {
    label: "Administrateur",
    labelCourt: "Admin",
    description: "Gère les utilisateurs, les rôles et consulte le journal d'audit",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    emoji: "🔧",
  },
  N1: {
    label: "Manager N+1",
    labelCourt: "N+1",
    description: "Réalise la 1ère évaluation de ses collaborateurs",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    emoji: "👔",
  },
  N2: {
    label: "Manager N+2",
    labelCourt: "N+2",
    description: "Réalise son évaluation indépendante et participe à l'arbitrage",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    emoji: "🏢",
  },
};
