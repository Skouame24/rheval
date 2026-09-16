// ============================================================
// app/dashboard/rh/export/page.tsx
// Page "Export Excel & Rapports" RH — connectée au hook useExportRh
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { useExportRh } from "@/lib/hooks/useRhDashboard";

export default function ExportRhPage() {
  const { exportExcel, isExporting, exportError } = useExportRh();
  const CYCLE_ID = "cycle-2026";

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
            {exportError && <p style={{ color: "#EF4444", fontSize: 12, margin: "8px 0 0" }}>⚠️ {exportError}</p>}
            <button
              onClick={() => exportExcel(CYCLE_ID)}
              disabled={isExporting}
              style={{
                width: "100%", padding: "12px",
                background: isExporting ? "#94a3b8" : "#F0822A",
                color: "#FFFFFF", border: "none", borderRadius: 12,
                fontWeight: 900, fontSize: 14,
                cursor: isExporting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              {isExporting ? (
                <><div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Génération en cours…</>
              ) : (
                <>📥 Exporter le Pack Complet (Zip Excel)</>
              )}
            </button>
          </Card>

          <Card padding="lg">
            <CardHeader title="Tableau de Synthèse Général (XLSX)" subtitle="Bilan consolidé de tous les salariés" icon="📊" />
            <p style={{ fontSize: 13, color: "#64748b", margin: "12px 0 20px 0" }}>
              Téléchargez le tableau récapitulatif contenant les notes N+1, N+2, les moyennes finales pondérées, les taux d'atteinte et le catalogue des formations demandées.
            </p>
            <button
              onClick={() => exportExcel(CYCLE_ID)}
              disabled={isExporting}
              style={{
                width: "100%", padding: "12px",
                background: isExporting ? "#94a3b8" : "#000000",
                color: "#FFFFFF", border: "none", borderRadius: 12,
                fontWeight: 900, fontSize: 14,
                cursor: isExporting ? "not-allowed" : "pointer"
              }}
            >
              📊 Exporter la Synthèse Consolidée
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
