// ============================================================
// app/dashboard/mon-equipe/formations/page.tsx
// Page "Besoins de Formation" N+1 / Manager (Données réelles)
// ============================================================

"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import type { EvaluationCycle } from "@/types";

export default function FormationsN1Page() {
  const { user } = useAuth();
  const [fiches, setFiches] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = user
    ? `${user.prenom ? user.prenom + " " : ""}${user.nom}`.trim()
    : "Manager";

  useEffect(() => {
    evaluationsApi.getN1TeamEvaluations()
      .then((data) => setFiches(Array.isArray(data) ? data : []))
      .catch((err) => console.error("[FormationsPage] Erreur:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Extraction de toutes les formations réelles préconisées pour les collaborateurs
  const formationsList = fiches.flatMap((fiche) => {
    const salarieNom = fiche.salarie ? `${fiche.salarie.prenom || ""} ${fiche.salarie.nom || ""}`.trim() : "Collaborateur";
    const forms = fiche.formations || [];
    return forms.map((f) => ({
      id: f.id,
      collab: salarieNom,
      formation: f.intitule,
      delai: f.delai || "Non spécifié",
      priorite: f.priorite || "MOYENNE",
    }));
  });

  return (
    <AppShell
      role={user?.role || "N1"}
      userName={displayName}
      userEmail={user?.email || "manager@agilly.net"}
      notifCount={0}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        <PageHeader
          title="Besoins de Formation Identifiés"
          subtitle="Préconisations émises lors des évaluations de performance"
          breadcrumbs={[{ label: "Mon Équipe" }, { label: "Formations" }]}
        />

        <Card padding="lg">
          <CardHeader
            title="Plan Annuel de Formation"
            subtitle={`${formationsList.length} formation${formationsList.length > 1 ? "s" : ""} répertoriée${formationsList.length > 1 ? "s" : ""} pour votre équipe`}
            icon="🎓"
          />

          <div style={{ overflowX: "auto", marginTop: 20 }}>
            {isLoading ? (
              <p style={{ padding: 20, color: "#64748b", fontSize: 13, fontStyle: "italic" }}>
                Chargement des besoins de formation...
              </p>
            ) : formationsList.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Aucun besoin de formation identifié pour le moment.</p>
                <p style={{ margin: "6px 0 0", fontSize: 12 }}>
                  Les formations recommandées apparaîtront ici dès que les managers évalueront leurs collaborateurs.
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
                  {formationsList.map((f) => (
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
                          background: f.priorite === "HAUTE" ? "#FEE2E2" : "#FEF3C7",
                          color: f.priorite === "HAUTE" ? "#DC2626" : "#D97706"
                        }}>
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
      </div>
    </AppShell>
  );
}
