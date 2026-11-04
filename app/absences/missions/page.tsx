// ============================================================
// app/absences/missions/page.tsx
// Redirection fluide vers le tableau de suivi des demandes
// ============================================================

import { redirect } from "next/navigation";

export default function MissionsPage() {
  redirect("/absences/demandes");
}
