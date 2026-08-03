// ============================================================
// app/dashboard/rh/export/page.tsx
// Page "Export Excel & Rapports" RH (Soft UI Inline CSS)
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";

export default function ExportRhPage() {
  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Exportation Excel & Génération de Rapports"
          subtitle="Téléchargez les fiches d'évaluation officielles et les tableaux de synthèse"
          breadcrumbs={[{ label: "Espace RH" }, { label: "Export Excel" }]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <Card padding="lg">
            <CardHeader title="Fiches d'Évaluation Officiel (Format Excel / PDF)" subtitle="Export individuel par salarié" icon="📄" />
            <p style={{ fontSize: 13, color: "#64748b", margin: "12px 0 20px 0" }}>
              Générez le document Excel d'Agilly identique au modèle officiel avec la grille des tranches 18-20, 15-17, 12-14, 0-11, le plan de formation et les 4 tampons de signature.
            </p>
            <button
              onClick={() => alert("Génération du pack complet des fiches d'évaluation Excel d'Agilly...")}
              style={{ width: "100%", padding: "12px", background: "#F0822A", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: "pointer" }}
            >
              📥 Exporter le Pack Complet (Zip Excel)
            </button>
          </Card>

          <Card padding="lg">
            <CardHeader title="Tableau de Synthèse Général (XLSX)" subtitle="Bilan consolidé de tous les salariés" icon="📊" />
            <p style={{ fontSize: 13, color: "#64748b", margin: "12px 0 20px 0" }}>
              Téléchargez le tableau récapitulatif contenant les notes N+1, N+2, les moyennes finales pondérées, les taux d'atteinte et le catalogue des formations demandées.
            </p>
            <button
              onClick={() => alert("Exportation de la synthèse globale en cours...")}
              style={{ width: "100%", padding: "12px", background: "#000000", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: "pointer" }}
            >
              📊 Exporter la Synthèse Consolidée
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
