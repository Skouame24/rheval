// ============================================================
// lib/utils/notificationScope.ts
// Source unique de la séparation RH EVAL / Absences & Missions.
// Les notifications du module Absences portent toujours un lien "/absences...".
// ============================================================

import type { AppNotification } from "@/lib/api/notifications.api";

export const isAbsenceNotif = (n: Pick<AppNotification, "lien">): boolean =>
  Boolean(n.lien?.startsWith("/absences"));

export const isEvalNotif = (n: Pick<AppNotification, "lien">): boolean =>
  !isAbsenceNotif(n);
