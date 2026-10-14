// ============================================================
// app/dashboard/mon-equipe/notifications/page.tsx
// Notifications Manager N+1 / N+2
// ============================================================

"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationsView } from "@/features/notifications/components/NotificationsView";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationsN1Page() {
  const { user } = useAuth();
  const displayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Manager";

  return (
    <AppShell
      role={user?.role || "N1"}
      userName={displayName}
      userEmail={user?.email || "manager@agilly.net"}
    >
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
        <PageHeader
          title="Notifications Équipe & Direction"
          subtitle="Alertes, validations requises et suivi du cycle d'évaluation"
          breadcrumbs={[
            { label: "Mon Équipe", href: "/dashboard/mon-equipe" },
            { label: "Notifications" },
          ]}
        />

        <NotificationsView
          title="Centre de notifications"
          subtitle="Alertes, validations requises et suivi du cycle d'évaluation"
        />
      </div>
    </AppShell>
  );
}
