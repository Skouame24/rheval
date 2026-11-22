// ============================================================
// features/portail/data/notifApps.ts
// Présentation des applications émettrices dans la cloche du portail
// ============================================================

import type { ApplicationNotif } from "@/lib/utils/notificationScope";

export const NOTIF_APPS: Record<ApplicationNotif, { label: string; dot: string; text: string; soft: string }> = {
  rheval: { label: "Performances", dot: "bg-agilly-primary", text: "text-agilly-primary", soft: "bg-orange-50" },
  absences: { label: "Congés", dot: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-50" },
  missions: { label: "Missions", dot: "bg-blue-600", text: "text-blue-700", soft: "bg-blue-50" },
  caisse: { label: "Caisse", dot: "bg-emerald-600", text: "text-emerald-700", soft: "bg-emerald-50" },
  portail: { label: "Portail", dot: "bg-slate-500", text: "text-slate-700", soft: "bg-slate-100" },
};

export const ORDRE_APPS: ApplicationNotif[] = ["rheval", "absences", "missions", "caisse", "portail"];
