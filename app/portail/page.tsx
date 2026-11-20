"use client";

// ============================================================
// app/portail/page.tsx — Accueil du Portail Agilly
// Applications par département · Actualités · Trombinoscope
// ============================================================

import PortailLoading from "./loading";
import { usePortailSession } from "@/features/portail/hooks/usePortailSession";
import { PortailAccueilView } from "@/features/portail/components/PortailAccueilView";

export default function PortailPage() {
  const { user, role, isLoading, logout, libelleRole, openApp } = usePortailSession();

  if (isLoading) return <PortailLoading />;
  if (!user || !role) return null;

  return (
    <PortailAccueilView
      prenom={user.prenom}
      nom={user.nom}
      libelleRole={libelleRole}
      onLogout={logout}
      onOpenApp={openApp}
    />
  );
}
