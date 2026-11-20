"use client";

// ============================================================
// app/portail/annuaire/page.tsx — Trombinoscope complet
// ============================================================

import PortailLoading from "../loading";
import { usePortailSession } from "@/features/portail/hooks/usePortailSession";
import { TrombinoscopeView } from "@/features/portail/components/TrombinoscopeView";

export default function AnnuairePage() {
  const { user, role, isLoading, logout, libelleRole, openApp } = usePortailSession();

  if (isLoading) return <PortailLoading />;
  if (!user || !role) return null;

  return (
    <TrombinoscopeView
      prenom={user.prenom}
      nom={user.nom}
      libelleRole={libelleRole}
      onLogout={logout}
      onOpenApp={openApp}
    />
  );
}
