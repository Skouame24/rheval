// ============================================================
// app/dashboard/admin/parametres/page.tsx
// Page "Paramètres" Admin (Soft UI Inline CSS)
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";

export default function ParametresAdminPage() {
  return (
    <AppShell role="ADMIN" userName="Administrateur Système" userEmail="admin@agilly.com">
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Paramètres Généraux d'AGILLY RHEVAL"
          subtitle="Charte graphique, seuils d'arbitrage et configurations système"
          breadcrumbs={[{ label: "Espace Admin" }, { label: "Paramètres" }]}
        />

        <Card padding="lg">
          <CardHeader title="Charte Visuelle & Identité" subtitle="Paramètres de marque" icon="🎨" />
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
            <div style={{ padding: 16, borderRadius: 14, background: "#FFF7ED", border: "1px solid #FFEDD5" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Couleur Primaire</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#F0822A", marginTop: 4 }}>Orange #F0822A</div>
            </div>

            <div style={{ padding: 16, borderRadius: 14, background: "#FAFAFA", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Couleur Sombre</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#000000", marginTop: 4 }}>Noir #000000</div>
            </div>

            <div style={{ padding: 16, borderRadius: 14, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Fond de Page</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#64748b", marginTop: 4 }}>Gris #F7F8FA</div>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader title="Seuils Métier d'Arbitrage" subtitle="Règles automatiques" icon="⚖️" />
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000000" }}>Seuil de Déclenchement d'Arbitrage RH : <strong style={{ color: "#F0822A" }}>2.0 points d'écart</strong></p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 0" }}>Toute divergence &gt; 2 points entre le N+1 et le N+2 envoie automatiquement la fiche en arbitrage RH.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
