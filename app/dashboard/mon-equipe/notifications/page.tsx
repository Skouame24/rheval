// ============================================================
// app/dashboard/mon-equipe/notifications/page.tsx
// Notifications Manager N+1 / N+2
// ============================================================

"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { CheckIcon, ClockIcon } from "@/components/ui/Icons";
import { useAuth } from "@/contexts/AuthContext";

const NOTIFS_N1 = [
  {
    id: "1",
    title: "Campagne d'évaluation en cours",
    text: "Pensez à compléter les évaluations de vos collaborateurs directs avant la date limite.",
    date: "Aujourd'hui, 09:30",
    lu: false,
  },
  {
    id: "2",
    title: "Validation des fiches",
    text: "Les fiches d'évaluation soumises seront automatiquement transmises à la direction N+2.",
    date: "Hier, 14:15",
    lu: false,
  },
  {
    id: "3",
    title: "Cycle d'évaluation ouvert",
    text: "Le cycle annuel d'évaluation des performances est officiellement ouvert.",
    date: "Récemment",
    lu: true,
  },
];

export default function NotificationsN1Page() {
  const { user } = useAuth();
  const displayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Manager";

  return (
    <AppShell
      role={user?.role || "N1"}
      userName={displayName}
      userEmail={user?.email || "manager@agilly.com"}
    >
      <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto w-full">
        <PageHeader
          title="Notifications Manager"
          subtitle="Alertes et rappels de suivi du cycle d'évaluation"
          breadcrumbs={[
            { label: "Mon Équipe", href: "/dashboard/mon-equipe" },
            { label: "Notifications" },
          ]}
        />

        <Card padding="none" className="overflow-hidden bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200 bg-white">
            <CardHeader
              title="Centre de notifications"
              subtitle="Alertes récentes et rappels de cycle"
              icon={<ClockIcon size={20} className="text-[#F0822A]" />}
            />
          </div>

          <div className="divide-y divide-slate-100">
            {NOTIFS_N1.map((n) => (
              <div
                key={n.id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  n.lu ? "bg-white" : "bg-amber-50/20"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                    n.lu
                      ? "bg-slate-100 border-slate-200 text-slate-400"
                      : "bg-[#FFF0E0] border-[#F0822A33] text-[#F0822A]"
                  }`}
                >
                  {n.lu ? <CheckIcon size={16} /> : <ClockIcon size={16} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-slate-900 m-0">{n.title}</h4>
                    <span className="text-[11px] font-semibold text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 m-0">{n.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

