// ============================================================
// app/dashboard/mon-equipe/formations/page.tsx
// Page "Besoins de Formation" N+1 — Données Réelles de l'Équipe
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, PageHeaderSkeleton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import type { EvaluationCycle } from "@/types";

export default function FormationsN1Page() {
  const { user, role } = useAuth();
  const [formations, setFormations] = useState<Array<{ id: string; collab: string; formation: string; delai: string; priorite: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    evaluationsApi
      .getN1TeamEvaluations()
      .then((data: EvaluationCycle[]) => {
        const extracted: Array<{ id: string; collab: string; formation: string; delai: string; priorite: string }> = [];
        for (const fiche of (data || [])) {
          const collabName = `${fiche.salarie?.prenom ?? ""} ${fiche.salarie?.nom ?? ""}`.trim() || "Collaborateur";
          if ((fiche as any).besoinFormation && (fiche as any).besoinFormation.trim() !== "") {
            extracted.push({
              id: fiche.id,
              collab: collabName,
              formation: (fiche as any).besoinFormation,
              delai: "À planifier",
              priorite: "Moyenne",
            });
          }
        }
        setFormations(extracted);
      })
      .catch(() => setFormations([]))
      .finally(() => setIsLoading(false));
  }, []);

  const managerName = user ? `${user.prenom} ${user.nom}`.trim() : "Manager N+1";
  const managerEmail = user?.email || "manager@agilly.com";

  return (
    <AppShell role={role || "N1"} userName={managerName} userEmail={managerEmail} notifCount={0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Besoins de Formation Identifiés"
          subtitle="Préconisations émises par le manager lors des entretiens d'évaluation"
          breadcrumbs={[{ label: "Espace N+1" }, { label: "Formations" }]}
        />

        {isLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <Card padding="lg">
            <CardHeader
              title="Plan de Formation de l'Équipe"
              subtitle={`${formations.length} formation(s) répertoriée(s) pour votre équipe`}
              icon="🎓"
            />

            <div style={{ overflowX: "auto", marginTop: 20 }}>
              {formations.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748B" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px 0", color: "#0F172A" }}>
                    Aucun besoin de formation identifié pour le moment
                  </p>
                  <p style={{ fontSize: 12, margin: 0 }}>
                    Les souhaits et besoins de formation apparaîtront ici lors de la notation et des entretiens d'évaluation.
                  </p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Collaborateur</th>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Formation Préconisée</th>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Délai Souhaité</th>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Priorité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formations.map((f) => (
                      <tr key={f.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "16px", fontSize: 14, fontWeight: 800, color: "#000000" }}>{f.collab}</td>
                        <td style={{ padding: "16px", fontSize: 14, fontWeight: 600, color: "#334155" }}>{f.formation}</td>
                        <td style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#F0822A" }}>{f.delai}</td>
                        <td style={{ padding: "16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "4px 10px",
                              borderRadius: 0,
                              background: f.priorite === "Haute" ? "#FEE2E2" : "#FEF3C7",
                              color: f.priorite === "Haute" ? "#DC2626" : "#D97706",
                            }}
                          >
                            {f.priorite}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
