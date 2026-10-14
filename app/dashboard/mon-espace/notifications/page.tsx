// ============================================================
// app/dashboard/mon-espace/notifications/page.tsx
// Centre de notifications — Mon Espace Collaborateur
// ============================================================

"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationsView } from "@/features/notifications/components/NotificationsView";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Mes Notifications"
        subtitle="Toutes vos alertes et activités relatives au cycle d'évaluation"
        breadcrumbs={[
          { label: "Mon espace", href: "/dashboard/mon-espace" },
          { label: "Notifications" },
        ]}
      />

      <NotificationsView
        title="Centre de notifications"
        subtitle="Toutes vos alertes et activités relatives au cycle d'évaluation"
      />
    </div>
  );
}
