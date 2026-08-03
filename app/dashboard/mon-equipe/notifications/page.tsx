// ============================================================
// app/dashboard/n1/notifications/page.tsx
// Page "Notifications" N+1 (Soft UI Inline CSS)
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";

const NOTIFS_N1 = [
  { id: "1", title: "Rappel : Évaluation Ebenezer KOUAME", text: "Le dossier d'Ebenezer Samuel KOUAME attend votre saisie des notes.", date: "Aujourd'hui, 09:30", lu: false },
  { id: "2", title: "Rappel : Évaluation Mariam Koné", text: "L'échéance de soumission approche (31 décembre 2026).", date: "Hier, 14:15", lu: false },
  { id: "3", title: "Validation N+2 effectuée", text: "La direction N+2 a approuvé l'évaluation d'Oumar Bah.", date: "18 déc. 2026", lu: true },
];

export default function NotificationsN1Page() {
  return (
    <AppShell role="N1" userName="Sevan AKOUMIA" userEmail="sevan.akoumia@agilly.com" notifCount={2}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Mes Notifications Manager"
          subtitle="Alertes et rappels de soumission d'évaluations"
          breadcrumbs={[{ label: "Espace N+1" }, { label: "Notifications" }]}
        />

        <Card padding="none" style={{ overflow: "hidden" }}>
          <div style={{ padding: "24px 28px 16px 28px", borderBottom: "1px solid #F1F5F9" }}>
            <CardHeader title="Centre de notifications N+1" subtitle="Alertes récentes" icon="🔔" />
          </div>

          <div style={{ background: "#FAFAFA" }}>
            {NOTIFS_N1.map((n, idx) => (
              <div
                key={n.id}
                style={{
                  padding: "20px 28px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  borderBottom: idx !== NOTIFS_N1.length - 1 ? "1px solid #F1F5F9" : "none",
                  background: n.lu ? "transparent" : "#FFFFFF"
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: n.lu ? "#F1F5F9" : "#FFF7ED",
                  border: n.lu ? "1px solid #E2E8F0" : "1px solid #FDBA74",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {n.lu ? "✓" : "🔔"}
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0" }}>{n.title}</h4>
                  <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{n.text}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", margin: "6px 0 0 0" }}>{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
