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

  // 2. PDG / Directeur Général / Directrice Générale (Un seul sommet de pyramide)
  if (
    p.includes("pdg") ||
    p.includes("directeur général") ||
    p.includes("directeur general") ||
    p.includes("directrice générale") ||
    p.includes("directrice generale") ||
    p.includes("dg") ||
    p.includes("ceo") ||
    p.includes("président") ||
    p.includes("présidente") ||
    p.includes("president") ||
    p.includes("presidente")
  ) {
    return { role: "N2", displayRole: "PDG", label: "PDG" };
  }

  // 3. DRH & Ressources Humaines (RH) - Placé AVANT Directeur pour intercepter "Directeur/Directrice des Ressources Humaines"
  if (
    p.includes("drh") ||
    p.includes("directeur des ressources humaines") ||
    p.includes("directrice des ressources humaines") ||
    p.includes("directeur rh") ||
    p.includes("directrice rh") ||
    p.includes("head of hr") ||
    p.includes("hr director") ||
    e.includes("drh")
  ) {
    return { role: "DRH", displayRole: "RH", label: "DRH" };
  }
  if (
    p.includes("rh") ||
    p.includes("ressources humaines") ||
    p.includes("recrutement") ||
    p.includes("talent") ||
    p.includes("human resources") ||
    p.includes("people") ||
    e.includes("rh@")
  ) {
    return { role: "RH", displayRole: "RH", label: "Ressources Humaines" };
  }

  // 4. Directeur / Directrice (N2 - Directeurs de département / Directrices Exécutives)
  if (
    p.includes("directeur") ||
    p.includes("directrice") ||
    p.includes("director") ||
    p.includes("dirigeant") ||
    p.includes("dirigeante") ||
    p.includes("exécutif") ||
    p.includes("exécutive") ||
    p.includes("executif") ||
    p.includes("executive") ||
    p.includes("vp") ||
    p.includes("vice president") ||
    p.includes("vice-president")
  ) {
    const isFem = p.includes("directrice") || p.includes("dirigeante") || p.includes("exécutive");
    return { role: "N2", displayRole: "DIRECTEUR", label: isFem ? "Directrice" : "Directeur" };
  }

  // 5. Responsable / Manager d'équipe (N1)
  if (
    p.includes("responsable") ||
    p.includes("manager") ||
    p.includes("manageur") ||
    p.includes("manageuse") ||
    p.includes("chef") ||
    p.includes("cheffe") ||
    p.includes("lead") ||
    p.includes("coordinateur") ||
    p.includes("coordinatrice") ||
    p.includes("superviseur") ||
    p.includes("superviseuse") ||
    p.includes("head") ||
    e.includes("n1")
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

