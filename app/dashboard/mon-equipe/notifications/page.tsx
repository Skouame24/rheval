// ============================================================
// app/dashboard/mon-equipe/notifications/page.tsx
// Page "Notifications" N+1 — 100% Dynamique issue des Fiches d'Équipe
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Skeleton } from "@/components/ui";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { CheckCircleIcon, ArrowPathIcon } from "@/components/ui/Icons";
import type { EvaluationCycle } from "@/types";

export default function NotificationsN1Page() {
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await evaluationsApi.getN1TeamEvaluations();
      setEvaluations(data || []);
    } catch (err) {
      console.error("[NotificationsN1Page] Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Génération de notifications basées sur les fiches réelles
  const notifs = evaluations.map((e) => {
    const collabName = `${e.salarie?.prenom || ""} ${e.salarie?.nom || ""}`.trim() || "Collaborateur";
    let title = `Dossier ${collabName}`;
    let text = `Statut actuel : ${e.statut}`;
    let urgent = false;

    if (e.statut === "EN_ATTENTE_N1" || e.statut === "FIXATION_OBJECTIFS") {
      title = `Action Requise : Évaluation de ${collabName}`;
      text = `Le dossier d'évaluation attend votre saisie des notes et objectifs.`;
      urgent = true;
    } else if (e.statut === "VALIDATION_N2" || e.statut === "EN_ATTENTE_N2") {
      title = `Transmis N+2 : Évaluation de ${collabName}`;
      text = `Le dossier a été soumis et attend la contre-évaluation de la direction N+2.`;
    } else if (e.statut === "ARBITRAGE") {
      title = `Arbitrage en cours : ${collabName}`;
      text = `Un arbitrage RH a été ouvert pour statuer sur les notations.`;
      urgent = true;
    } else if (e.statut === "VALIDE" || e.statut === "CLOTURE") {
      title = `Évaluation clôturée : ${collabName}`;
      text = `La fiche d'évaluation annuelle a été validée et enregistrée.`;
    }

    return {
      id: e.id,
      title,
      text,
      urgent,
      date: e.dateCreation ? new Date(e.dateCreation).toLocaleDateString("fr-FR") : "Cycle 2026",
    };
  });

  return (
    <AppShell role="N1" userName="Marc AUBERT" userEmail="manager@agilly.com" notifCount={notifs.filter(n => n.urgent).length}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <PageHeader
            title="Mes Notifications Manager"
            subtitle="Alertes et rappels de soumission pour votre équipe"
            breadcrumbs={[{ label: "Espace N+1" }, { label: "Notifications" }]}
          />

          <button
            onClick={fetchNotifs}
            title="Rafraîchir"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              fontSize: 13,
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            <ArrowPathIcon size={14} />
            Actualiser
          </button>
        </div>

        <Card padding="none" style={{ overflow: "hidden" }}>
          <div style={{ padding: "24px 28px 16px 28px", borderBottom: "1px solid #F1F5F9" }}>
            <CardHeader title="Centre de notifications N+1" subtitle="Alertes basées sur vos fiches d'évaluation" icon="🔔" />
          </div>

          {isLoading ? (
            <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <Skeleton className="h-14 w-full mb-3" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : notifs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <CheckCircleIcon size={36} color="#94A3B8" />
              <h4 style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", margin: "12px 0 4px 0" }}>
                Aucune alerte pour votre équipe
              </h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                Tous les dossiers d'évaluation de vos collaborateurs sont à jour.
              </p>
            </div>
          ) : (
            <div style={{ background: "#FAFAFA" }}>
              {notifs.map((n, idx) => (
                <div
                  key={n.id}
                  style={{
                    padding: "20px 28px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    borderBottom: idx !== notifs.length - 1 ? "1px solid #F1F5F9" : "none",
                    background: n.urgent ? "#FFF7ED" : "#FFFFFF"
                  }}
                >
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 0,
                    background: n.urgent ? "#FFEDD5" : "#F1F5F9",
                    border: n.urgent ? "1px solid #FDBA74" : "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {n.urgent ? "🔔" : "✓"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>{n.title}</h4>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{n.date}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{n.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
