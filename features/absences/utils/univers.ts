// ============================================================
// features/absences/utils/univers.ts
// Les deux univers de l'application : Congés & permissions / Missions.
//
// Règle unique : tout ce qui concerne les missions vit sous
// /absences/missions/… — l'univers se déduit donc de l'URL, sans
// ambiguïté, et la navigation ne « bascule » plus d'un univers à l'autre.
// ============================================================

import { isMissionDemande } from "./demandes";

export type Univers = "CONGES" | "MISSIONS";

export function universDepuisChemin(pathname: string): Univers {
  return pathname.startsWith("/absences/missions") ? "MISSIONS" : "CONGES";
}

export const ROUTES_UNIVERS: Record<
  Univers,
  {
    libelle: string;
    accueil: string;
    demandes: string;
    nouvelle: string;
    planning: string;
    registre: string;
    validations: string;
    workflows: string;
    rapports: string;
  }
> = {
  CONGES: {
    libelle: "Congés & permissions",
    accueil: "/absences",
    demandes: "/absences/demandes",
    nouvelle: "/absences/nouvelle?type=CONGES_ANNUELS&univers=CONGES",
    planning: "/absences/planning",
    registre: "/absences/registre",
    validations: "/absences/validations",
    workflows: "/absences/workflows",
    rapports: "/absences/rapports",
  },
  MISSIONS: {
    libelle: "Missions & interventions",
    accueil: "/absences/missions",
    demandes: "/absences/missions/demandes",
    nouvelle: "/absences/missions/nouvelle?type=MISSION_DEPLACEMENT&univers=MISSIONS",
    planning: "/absences/missions/planning",
    registre: "/absences/missions/registre",
    validations: "/absences/missions/validations",
    workflows: "/absences/missions/workflows",
    rapports: "/absences/missions/rapports",
  },
};

/** Une demande appartient-elle à l'univers ? (missions/interventions vs congés/permissions) */
export function appartientAUnivers(demande: Parameters<typeof isMissionDemande>[0], univers: Univers): boolean {
  return univers === "MISSIONS" ? isMissionDemande(demande) : !isMissionDemande(demande);
}
