// ============================================================
// lib/utils/notificationScope.ts
// À quelle application appartient une notification ?
// Source : le champ `application` envoyé par le backend.
// Repli (anciennes notifications / backend pas encore à jour) : le lien.
// ============================================================

import type { AppNotification } from "@/lib/api/notifications.api";

export type ApplicationNotif = "rheval" | "absences" | "missions" | "caisse" | "portail";

/** Applications affichées par la cloche RHEVAL (évaluations) */
export const APPS_EVALUATION: ApplicationNotif[] = ["rheval"];
/** Applications affichées par la cloche Absences (qui héberge aussi les missions) */
export const APPS_ABSENCES: ApplicationNotif[] = ["absences", "missions"];

export function applicationDe(n: Pick<AppNotification, "lien" | "application">): ApplicationNotif {
  if (n.application) return n.application as ApplicationNotif;
  const lien = n.lien ?? "";
  if (lien.startsWith("/absences/missions") || lien.startsWith("/absences/interventions")) return "missions";
  if (lien.startsWith("/absences")) return "absences";
  if (lien.startsWith("/caisse")) return "caisse";
  if (lien.startsWith("/portail")) return "portail";
  return "rheval";
}

export const isAbsenceNotif = (n: Pick<AppNotification, "lien" | "application">): boolean =>
  APPS_ABSENCES.includes(applicationDe(n));

export const isEvalNotif = (n: Pick<AppNotification, "lien" | "application">): boolean =>
  APPS_EVALUATION.includes(applicationDe(n));
