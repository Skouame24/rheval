// ============================================================
// app/dashboard/n1/formations/page.tsx
// Page "Besoins de Formation" N+1 (Soft UI Inline CSS)
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";

const FORMATIONS = [
  { id: "1", collab: "Ebenezer Samuel KOUAME", formation: "Architecture Fine-Tuning & Orchestration IA (LangChain / LlamaIndex)", delai: "Q1 2027", priorite: "Haute" },
  { id: "2", collab: "Mariam Koné", formation: "Design System & Figma Advanced Auto-Layout", delai: "Q2 2027", priorite: "Moyenne" },
  { id: "3", collab: "Oumar Bah", formation: "Flutter & React Native Cross-Platform Performance", delai: "Q1 2027", priorite: "Haute" },
  { id: "4", collab: "Aissatou Camara", formation: "Automation Testing avec Playwright & Cypress", delai: "Q3 2027", priorite: "Moyenne" },
];

export default function FormationsN1Page() {
  return (
    <AppShell role="N1" userName="Sevan AKOUMIA" userEmail="sevan.akoumia@agilly.com" notifCount={2}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Besoins de Formation Identifiés"
          subtitle="Préconisations émises par le manager N+1 lors des évaluations"
          breadcrumbs={[{ label: "Espace N+1" }, { label: "Formations" }]}
        />

        <Card padding="lg">
          <CardHeader title="Plan Annuel de Formation" subtitle="4 formations répertoriées pour votre équipe" icon="🎓" />

          <div style={{ overflowX: "auto", marginTop: 20 }}>
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
                {FORMATIONS.map((f) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px", fontSize: 14, fontWeight: 800, color: "#000000" }}>{f.collab}</td>
                    <td style={{ padding: "16px", fontSize: 14, fontWeight: 600, color: "#334155" }}>{f.formation}</td>
                    <td style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#F0822A" }}>{f.delai}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: f.priorite === "Haute" ? "#FEE2E2" : "#FEF3C7",
                        color: f.priorite === "Haute" ? "#DC2626" : "#D97706"
                      }}>
                        {f.priorite}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
