// ============================================================
// lib/utils/roleDetector.ts
// Résolution automatique et fine des rôles applicatifs et libellés
// basée sur l'intitulé du poste Microsoft 365 (Job Title) et email
// ============================================================

import type { Role } from "@/types";

export type DisplayRole = "PDG" | "DIRECTEUR" | "RESPONSABLE" | "RH" | "SALARIE" | "STAGIAIRE" | "ADMIN";

export interface RoleResolution {
  role: Role;
  displayRole: DisplayRole;
  label: string;
}

/**
 * Détermine le rôle technique et le libellé d'affichage en analysant
 * le poste (jobTitle) et l'email de l'utilisateur connecté.
 */
export function detectRoleFromPoste(poste?: string, email?: string): RoleResolution {
  const p = (poste || "").toLowerCase().trim();
  const e = (email || "").toLowerCase().trim();

  // 1. Administrateur Système
  if (e.includes("admin") || p.includes("administrateur") || p.includes("admin system")) {
    return { role: "ADMIN", displayRole: "ADMIN", label: "Administrateur" };
  }

  // 2. PDG / Directeur Général (Un seul sommet de pyramide)
  if (
    p.includes("pdg") ||
    p.includes("directeur général") ||
    p.includes("directeur general") ||
    p.includes("dg") ||
    p.includes("ceo") ||
    p.includes("président") ||
    p.includes("president")
  ) {
    return { role: "N2", displayRole: "PDG", label: "PDG" };
  }

  // 3. Directeur (N2 - Directeurs de département / Directeurs Exécutifs)
  if (
    p.includes("directeur") ||
    p.includes("director") ||
    p.includes("dirigeant") ||
    p.includes("exécutif") ||
    p.includes("executif") ||
    e.includes("n2") ||
    e.includes("bamba")
  ) {
    return { role: "N2", displayRole: "DIRECTEUR", label: "Directeur" };
  }

  // 4. DRH & Ressources Humaines (RH)
  if (
    p.includes("drh") ||
    p.includes("directeur des ressources humaines") ||
    p.includes("directrice des ressources humaines")
  ) {
    return { role: "DRH", displayRole: "RH", label: "DRH" };
  }
  if (
    p.includes("rh") ||
    p.includes("ressources humaines") ||
    p.includes("recrutement") ||
    p.includes("talent") ||
    e.includes("drh") ||
    e.includes("rh")
  ) {
    return { role: "RH", displayRole: "RH", label: "Ressources Humaines" };
  }

  // 5. Responsable / Manager d'équipe (N1)
  if (
    p.includes("responsable") ||
    p.includes("manager") ||
    p.includes("chef") ||
    p.includes("lead") ||
    p.includes("coordinateur") ||
    p.includes("superviseur") ||
    p.includes("head") ||
    e.includes("n1") ||
    e.includes("akoumia")
  ) {
    return { role: "N1", displayRole: "RESPONSABLE", label: "Responsable" };
  }

  // 6. Stagiaire
  if (p.includes("stagiaire") || p.includes("intern") || p.includes("stage")) {
    return { role: "SALARIE", displayRole: "STAGIAIRE", label: "Stagiaire" };
  }

  // 7. Salarié standard (Collaborateur)
  return { role: "SALARIE", displayRole: "SALARIE", label: "Salarié" };
}

