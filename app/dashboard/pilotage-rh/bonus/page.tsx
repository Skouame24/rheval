// ============================================================
// app/dashboard/pilotage-rh/bonus/page.tsx
// Page "Primes & Éligibilité Bonus" RH — 100% Données Réelles
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Skeleton } from "@/components/ui";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { rhApi } from "@/lib/api/rh.api";
import type { EvaluationCycle } from "@/types";
import { ArrowPathIcon, CheckCircleIcon } from "@/components/ui/Icons";

export default function BonusRhPage() {
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await evaluationsApi.getAllForRh();
      setEvaluations(data || []);
    } catch (err: any) {
      console.error("[BonusRhPage] Error fetching evaluations:", err);
      setError("Erreur lors de la récupération des données de bonus.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcul des bonus uniquement sur les fiches ayant une note globale
  const bonusList = evaluations
    .filter((e) => e.noteGlobale != null)
    .map((e) => {
      const note = Number(e.noteGlobale);
      const taux = (note / 20) * 100;
      let tranche = "Insuffisant";
      let eligibilite = "0% Bonus";
      let baseBonus = 0;

      if (taux >= 85) {
        tranche = "Excellence";
        eligibilite = "100% Bonus";
        baseBonus = 1500000;
      } else if (taux >= 75) {
        tranche = "Très Bon";
        eligibilite = "75% Bonus";
        baseBonus = 1125000;
      } else if (taux >= 60) {
        tranche = "Satisfaisant";
        eligibilite = "50% Bonus";
        baseBonus = 750000;
      }

      return {
        id: e.id,
        salarie: `${e.salarie?.prenom || ""} ${e.salarie?.nom || ""}`.trim() || "Collaborateur",
        poste: e.salarie?.poste || "Collaborateur",
        note,
        taux: taux.toFixed(1),
        tranche,
        eligibilite,
        montant: baseBonus,
        montantFormate: baseBonus > 0 ? `${baseBonus.toLocaleString("fr-FR")} FCFA` : "Non éligible",
      };
    });

  const totalEnveloppe = bonusList.reduce((acc, curr) => acc + curr.montant, 0);
  const salariesEligibles100 = bonusList.filter((b) => b.eligibilite === "100% Bonus").length;

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <PageHeader
            title="Grille d'Éligibilité aux Primes & Bonus"
            subtitle="Calcul automatisé des gratifications selon les notes validées par la hiérarchie"
            breadcrumbs={[{ label: "Espace RH" }, { label: "Primes & Bonus" }]}
          />

          <button
            onClick={fetchData}
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

        {/* KPIs Dynamiques */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 0, border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
              Enveloppe Globale Calculée
            </span>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#F0822A", margin: "4px 0 0 0" }}>
              {totalEnveloppe.toLocaleString("fr-FR")} FCFA
            </p>
          </div>

          <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 0, border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
              Salariés Éligibles (100%)
            </span>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0 0 0" }}>
              {salariesEligibles100} Salarié(s)
            </p>
          </div>

          <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 0, border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
              Dossiers Notés
            </span>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "4px 0 0 0" }}>
              {bonusList.length} / {evaluations.length}
            </p>
          </div>
        </div>

        {/* Tableau */}
        <Card padding="lg">
          <CardHeader 
            title="Calculateur d'Éligibilité des Primes" 
            subtitle="Barème officiel de performance AGILLY" 
            icon="💰" 
          />

          {isLoading ? (
            <div style={{ padding: 20 }}>
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: 16, color: "#991B1B", fontSize: 13, fontWeight: 700, marginTop: 16 }}>
              ⚠️ {error}
            </div>
          ) : bonusList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <CheckCircleIcon size={36} color="#94A3B8" />
              <h4 style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", margin: "12px 0 4px 0" }}>
                Aucune note finale validée pour l'instant
              </h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, maxWidth: 500, marginInline: "auto" }}>
                Les calculs de primes et d'éligibilité aux bonus apparaîtront automatiquement dès que les managers N+1 et la direction N+2 auront attribué et validé les notes finales.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Salarié</th>
                    <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Note Validée</th>
                    <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Taux d'Atteinte</th>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Palier & Éligibilité</th>
                    <th style={{ textAlign: "right", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Montant Estimé</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusList.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "16px", fontSize: 14, fontWeight: 900, color: "#000000" }}>
                        {b.salarie}
                        <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b" }}>{b.poste}</span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", fontSize: 15, fontWeight: 900, color: "#F0822A" }}>
                        {b.note.toFixed(1)} / 20
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", fontSize: 13, fontWeight: 800, color: "#334155" }}>
                        {b.taux}%
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, fontWeight: 800 }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 0,
                          background: b.tranche === "Excellence" ? "#ECFDF5" : b.tranche === "Très Bon" ? "#EFF6FF" : "#FFF7ED",
                          color: b.tranche === "Excellence" ? "#059669" : b.tranche === "Très Bon" ? "#2563EB" : "#EA580C",
                        }}>
                          {b.tranche} ({b.eligibilite})
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", fontSize: 14, fontWeight: 900, color: "#000000" }}>
                        {b.montantFormate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
