// ============================================================
// app/dashboard/mon-equipe/page.tsx
// Page "Mon Équipe" — Tableau de bord standardisé N+1 (Manager / DRH) ou N+2 (Direction)
// ============================================================

"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardN2 } from "@/features/dashboard/components/DashboardN2";
import { DashboardManager } from "@/features/dashboard/components/DashboardManager";
import { useAuth } from "@/contexts/AuthContext";

export default function MonEquipePage() {
  const { user } = useAuth();

  const displayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Manager";

  // Si l'utilisateur connecté est N+2 (Direction Générale ou Direction de Département)
  if (user?.role === "N2") {
    return (
      <AppShell role="N2" userName={displayName} userEmail={user?.email || "direction@agilly.com"}>
        <DashboardN2 />
      </AppShell>
    );
  }

  // Pour les Managers N+1, Responsables d'équipe et Direction RH (DRH)
  return (
    <AppShell
      role={user?.role || "N1"}
      userName={displayName}
      userEmail={user?.email || "manager@agilly.com"}
    >
      <DashboardManager />
    </AppShell>
  );
}
