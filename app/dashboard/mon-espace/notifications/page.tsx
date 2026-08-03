// ============================================================
// app/dashboard/salarie/notifications/page.tsx
// ============================================================
"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CheckCircleIcon, ClockIcon } from "@/components/ui/Icons";

const NOTIFICATIONS = [
  {
    id: "0",
    type: "HEADER",
    title: "Centre de notifications",
    description: "Activités récentes",
    date: "",
    read: true,
  },
  {
    id: "1",
    type: "INFO",
    title: "Évaluation N+1 soumise",
    description: "Votre responsable N+1 Sevan AKOUMIA a soumis son évaluation.",
    date: "10 juillet 2026",
    read: true,
  },
  {
    id: "2",
    type: "VALIDATION",
    title: "Évaluation N+2 soumise",
    description: "La direction technique N+2 a validé son appréciation.",
    date: "18 juillet 2026",
    read: true,
  },
  {
    id: "3",
    type: "ACTION",
    title: "Action requise : Signature",
    description: "Votre dossier est prêt pour votre signature électronique.",
    date: "20 juillet 2026",
    read: false,
  }
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">
      <PageHeader
        title="Mes Notifications"
        subtitle="Toutes vos alertes et activités relatives au cycle"
        breadcrumbs={[{ label: "Mon espace", href: "/dashboard/salarie" }, { label: "Notifications" }]}
      />

      <div className="bg-white border border-gray-200 rounded-none shadow-sm flex flex-col">
        {NOTIFICATIONS.map((notif, idx) => (
          <div 
            key={notif.id}
            className={`
              p-6 flex items-start gap-6 bg-white transition-colors
              ${idx !== NOTIFICATIONS.length - 1 ? 'border-b border-gray-100' : ''}
              ${notif.type !== 'HEADER' ? 'hover:bg-gray-50 cursor-pointer' : ''}
            `}
          >
            <div className="shrink-0 mt-1">
              {notif.type === "HEADER" && (
                <div className="w-12 h-12 flex items-center justify-center bg-orange-50 text-agilly-primary rounded-none border border-orange-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
              )}
              {(notif.type === "INFO" || notif.type === "VALIDATION") && (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-500 rounded-none border border-gray-200">
                  <CheckCircleIcon size={20} />
                </div>
              )}
              {notif.type === "ACTION" && (
                <div className="w-12 h-12 flex items-center justify-center bg-orange-50 text-agilly-primary rounded-none border border-orange-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className={`text-base m-0 mb-1 ${notif.type === 'HEADER' || !notif.read ? 'font-bold text-agilly-black' : 'font-semibold text-gray-800'}`}>
                {notif.title}
              </h3>
              <p className={`text-sm m-0 ${notif.type === 'HEADER' ? 'text-gray-500' : 'text-gray-600'}`}>
                {notif.description}
              </p>
              {notif.date && (
                <p className="text-xs font-semibold text-gray-400 mt-2">
                  {notif.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
