// ============================================================
// features/portail/hooks/usePortailSession.ts
// Utilisateur connecté, libellé du rôle et ouverture d'une application
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";
import { detectRoleFromPoste } from "@/lib/utils/roleDetector";
import type { PortailApp } from "../data/catalogue";

export function usePortailSession() {
  const { user, role, isLoading, logout } = useAuth();
  const router = useRouter();

  let libelleRole = "";
  let dashboardRoute = "/dashboard/mon-espace";

  if (user && role) {
    const detected = detectRoleFromPoste(user.poste, user.email);
    const targetRole = role === "SALARIE" && detected.role !== "SALARIE" ? detected.role : role;
    libelleRole =
      detected.displayRole === "PDG"
        ? "PDG"
        : detected.displayRole === "STAGIAIRE"
          ? "Stagiaire"
          : detected.label || targetRole;
    dashboardRoute = ROLE_DASHBOARD[targetRole] || dashboardRoute;
  }

  const openApp = (app: PortailApp) => {
    if (app.statut !== "DISPONIBLE" || !app.href) return;
    router.push(app.href === "@dashboard" ? dashboardRoute : app.href);
  };

  return { user, role, isLoading, logout, libelleRole, openApp };
}
