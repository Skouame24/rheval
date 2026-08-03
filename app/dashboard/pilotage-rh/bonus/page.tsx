// ============================================================
// app/dashboard/rh/bonus/page.tsx
// Page "Primes & Éligibilité Bonus" RH (Soft UI Inline CSS)
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";

const BONUS_LIST = [
  { salarie: "KOUAME Ebenezer Samuel", note: 16.6, tranche: "Excellence", eligibilite: "100% Bonus", montantEstime: "1 500 000 FCFA" },
  { salarie: "Koné Mariam", note: 17.5, tranche: "Excellence", eligibilite: "100% Bonus", montantEstime: "1 500 000 FCFA" },
  { salarie: "Bah Oumar", note: 15.0, tranche: "Très Bon", eligibilite: "75% Bonus", montantEstime: "1 125 000 FCFA" },
  { salarie: "Camara Aissatou", note: 14.5, tranche: "Satisfaisant", eligibilite: "50% Bonus", montantEstime: "750 000 FCFA" },
  { salarie: "Sylla Mamadou", note: 17.0, tranche: "Excellence", eligibilite: "100% Bonus", montantEstime: "1 500 000 FCFA" },
];

export default function BonusRhPage() {
  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Grille d'Éligibilité aux Primes & Bonus"
          subtitle="Calcul automatique des gratifications basées sur la note finale de performance"
          breadcrumbs={[{ label: "Espace RH" }, { label: "Primes & Bonus" }]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 20, border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Enveloppe Globale Estinée</span>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#F0822A", margin: "4px 0 0 0" }}>6 375 000 FCFA</p>
          </div>

          <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 20, border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Salariés Éligibles (100%)</span>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0 0 0" }}>3 Salariés</p>
          </div>
        </div>

        <Card padding="lg">
          <CardHeader title="Calculateur d'Éligibilité des Primes" subtitle="Barème de performance Agilly" icon="💰" />

          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Salarié</th>
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Note Validée</th>
                  <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Taux Éligibilité</th>
                  <th style={{ textAlign: "right", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Montant Estatif</th>
                </tr>
              </thead>
              <tbody>
                {BONUS_LIST.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px", fontSize: 14, fontWeight: 900, color: "#000000" }}>{b.salarie}</td>
                    <td style={{ padding: "16px", textAlign: "center", fontSize: 15, fontWeight: 900, color: "#F0822A" }}>{b.note} /20</td>
                    <td style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#059669" }}>{b.eligibilite}</td>
                    <td style={{ padding: "16px", textAlign: "right", fontSize: 14, fontWeight: 900, color: "#000000" }}>{b.montantEstime}</td>
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
