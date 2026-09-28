// ============================================================
// app/dashboard/mon-equipe/notifications/page.tsx
// Page "Notifications" N+1 — Alertes Réelles
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, PageHeaderSkeleton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import type { EvaluationCycle } from "@/types";

interface NotificationItem {
  id: string;
  title: string;
  text: string;
  date: string;
  lu: boolean;
}

export default function NotificationsN1Page() {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    evaluationsApi
      .getN1TeamEvaluations()
      .then((data: EvaluationCycle[]) => {
        const notifs: NotificationItem[] = [];
        for (const fiche of (data || [])) {
          const collabName = `${fiche.salarie?.prenom ?? ""} ${fiche.salarie?.nom ?? ""}`.trim() || "Collaborateur";
          if (fiche.statut === "FIXATION_OBJECTIFS") {
            notifs.push({
              id: `notif-obj-${fiche.id}`,
              title: `Fixation des objectifs : ${collabName}`,
              text: `La fiche d'évaluation de ${collabName} est en phase de fixation des objectifs de performance.`,
              date: "En cours",
              lu: false,
            });
          } else if (fiche.statut === "EVALUATION_N1") {
            notifs.push({
              id: `notif-eval-${fiche.id}`,
              title: `Évaluation à réaliser : ${collabName}`,
              text: `L'auto-évaluation a été transmise. Veuillez procéder à la notation et à l'appréciation managériale.`,
              date: "Action requise",
              lu: false,
            });
          }
        }
        setNotifications(notifs);
      })
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  }, []);

  const managerName = user ? `${user.prenom} ${user.nom}`.trim() : "Manager N+1";
  const managerEmail = user?.email || "manager@agilly.com";

  return (
    <AppShell role={role || "N1"} userName={managerName} userEmail={managerEmail} notifCount={notifications.length}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Mes Notifications Manager"
          subtitle="Alertes et rappels de soumission d'évaluations de votre équipe"
          breadcrumbs={[{ label: "Espace N+1" }, { label: "Notifications" }]}
        />

        {isLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <Card padding="none" style={{ overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 16px 28px", borderBottom: "1px solid #F1F5F9" }}>
              <CardHeader
                title="Centre de notifications N+1"
                subtitle={`${notifications.length} notification(s) active(s)`}
                icon="🔔"
              />
            </div>

            <div style={{ background: "#FAFAFA" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748B", background: "#FFFFFF" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px 0", color: "#0F172A" }}>
                    Aucune nouvelle notification
                  </p>
                  <p style={{ fontSize: 12, margin: 0 }}>
                    Toutes les actions requises pour votre équipe sont à jour.
                  </p>
                </div>
              ) : (
                notifications.map((n, idx) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "20px 28px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      borderBottom: idx !== notifications.length - 1 ? "1px solid #F1F5F9" : "none",
                      background: n.lu ? "transparent" : "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: n.lu ? "#F1F5F9" : "#FFF7ED",
                        border: n.lu ? "1px solid #E2E8F0" : "1px solid #FDBA74",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {n.lu ? "✓" : "🔔"}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0" }}>{n.title}</h4>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{n.text}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#F0822A", marginTop: 4, display: "inline-block" }}>
                        {n.date}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
