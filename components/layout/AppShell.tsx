// ============================================================
// components/layout/AppShell.tsx
// ============================================================

"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Breadcrumbs } from "./Breadcrumbs";
import type { Role } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface AppShellProps {
  role: Role;
  userName: string;
  userEmail: string;
  pageTitle?: string;
  notifCount?: number;
  children: React.ReactNode;
}

export function AppShell({
  role: defaultRole,
  userName: defaultUserName,
  userEmail: defaultUserEmail,
  pageTitle,
  notifCount,
  children,
}: AppShellProps) {
  const { user } = useAuth();

  const role = user?.role || defaultRole;
  const userName = user ? `${user.prenom} ${user.nom}` : defaultUserName;
  const userEmail = user?.email || defaultUserEmail;

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] font-sans antialiased text-slate-900">
      {/* Sidebar fixe */}
      <Sidebar role={role} userName={userName} userEmail={userEmail} />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header sticky */}
        <Header
          role={role}
          userName={userName}
          pageTitle={pageTitle}
          notifCount={notifCount}
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

