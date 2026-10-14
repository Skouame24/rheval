// ============================================================
// components/layout/AppShell.tsx
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Breadcrumbs } from "./Breadcrumbs";
import type { Role } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { notificationsApi } from "@/lib/api";

interface AppShellProps {
  role?: Role;
  userName?: string;
  userEmail?: string;
  pageTitle?: string;
  notifCount?: number;
  children: React.ReactNode;
}

export function AppShell({
  role: defaultRole = "SALARIE",
  userName: defaultUserName = "Utilisateur",
  userEmail: defaultUserEmail = "",
  pageTitle,
  notifCount: initialNotifCount = 0,
  children,
}: AppShellProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(initialNotifCount);

  const role = user?.role || defaultRole;
  const userName = user 
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim() 
    : defaultUserName;
  const userEmail = user?.email || defaultUserEmail;

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignorer silencieusement si hors ligne ou non authentifié
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Écouter l'événement global de mise à jour des notifications
    const handleUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener("notifications-updated", handleUpdate);
    // Intervalle doux de rafraîchissement (toutes les 45 secondes)
    const interval = setInterval(fetchUnreadCount, 45000);

    return () => {
      window.removeEventListener("notifications-updated", handleUpdate);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] font-sans antialiased text-slate-900">
      {/* Sidebar fixe */}
      <Sidebar role={role} userName={userName} userEmail={userEmail} />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header sticky avec compteur dynamique */}
        <Header
          role={role}
          userName={userName}
          pageTitle={pageTitle}
          notifCount={unreadCount}
        />

        {/* Contenu scrollable */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* Fil d'Ariane pour ne jamais se perdre */}
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
