"use client";

// ============================================================
// app/portail/preferences/page.tsx — Mes préférences
// ============================================================

import PortailLoading from "../loading";
import { usePortailSession } from "@/features/portail/hooks/usePortailSession";
import { PreferencesView } from "@/features/portail/components/PreferencesView";

export default function PreferencesPage() {
  const { user, role, isLoading, logout, libelleRole, openApp } = usePortailSession();

  if (isLoading) return <PortailLoading />;
  if (!user || !role) return null;

  return (
    <PreferencesView
      prenom={user.prenom}
      nom={user.nom}
      libelleRole={libelleRole}
      onLogout={logout}
      onOpenApp={openApp}
    />
  );
}
