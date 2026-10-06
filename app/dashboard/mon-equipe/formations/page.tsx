// ============================================================
// app/dashboard/mon-equipe/formations/page.tsx
// Page "Besoins de Formation" N+1 — 100% Données Réelles
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Skeleton } from "@/components/ui";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { ArrowPathIcon, CheckCircleIcon } from "@/components/ui/Icons";
import type { EvaluationCycle } from "@/types";

export default function FormationsN1Page() {
  const { user, role } = useAuth();
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFormations = async () => {
    setIsLoading(true);
    try {
      const data = await evaluationsApi.getN1TeamEvaluations();
      setEvaluations(data || []);
    } catch (err) {
      console.error("[FormationsN1Page] Error fetching evaluations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  // Extraire les besoins de formation réels (supporte à la fois le tableau formations et besoinFormation)
  const formationsList = evaluations.flatMap((e) => {
    const collabName = `${e.salarie?.prenom || ""} ${e.salarie?.nom || ""}`.trim() || "Collaborateur";
    const collabPoste = e.salarie?.poste || "Collaborateur";

    if (Array.isArray(e.formations) && e.formations.length > 0) {
      return e.formations.map((f: any) => ({
        id: f.id || `${e.id}-${f.intitule}`,
        collab: collabName,
        poste: collabPoste,
        formation: f.intitule || f.formation || "",
        delai: f.delai || "À planifier",
        priorite: f.priorite || "MOYENNE",
        objectifVise: f.objectifVise || "",
      }));
    }

    const singleText = (e as any).besoinFormation || (e as any).evaluationN1?.besoinFormation;
    if (singleText) {
      return [{
        id: e.id,
        collab: collabName,
        poste: collabPoste,
        formation: singleText,
        delai: "À planifier",
        priorite: "MOYENNE",
        objectifVise: "",
      }];
    }
    return [];
  });

  return (
    <AppShell role={role || "N1"} userName={user ? `${user.prenom} ${user.nom}` : "Manager"} userEmail={user?.email || ""} notifCount={0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <PageHeader
            title="Besoins de Formation Identifiés"
            subtitle="Préconisations émises par le manager lors des entretiens d'évaluation"
            breadcrumbs={[{ label: "Espace N+1" }, { label: "Formations" }]}
          />

          <button
            onClick={fetchFormations}
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

        <Card padding="lg">
          <CardHeader 
            title="Plan de Formation de l'Équipe" 
            subtitle={`${formationsList.length} besoin(s) identifié(s) dans les fiches`} 
            icon="🎓" 
          />

          {isLoading ? (
            <div style={{ padding: 20 }}>
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full mb-3" />
            </div>
          ) : formationsList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <CheckCircleIcon size={36} color="#94A3B8" />
              <h4 style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", margin: "12px 0 4px 0" }}>
                Aucun besoin de formation identifié pour le moment
              </h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, maxWidth: 480, marginInline: "auto" }}>
                Les formations recommandées lors des saisies d'évaluation de vos collaborateurs apparaîtront directement ici.
              </p>
            </div>
          ) : (
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
                  {formationsList.map((f) => (
                    <tr key={f.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "16px", fontSize: 14, fontWeight: 800, color: "#000000" }}>
                        {f.collab}
                        <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b" }}>{f.poste}</span>
                      </td>
                      <td style={{ padding: "16px", fontSize: 14, fontWeight: 600, color: "#334155" }}>{f.formation}</td>
                      <td style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#F0822A" }}>{f.delai}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 0,
                          background: "#EFF6FF",
                          color: "#2563EB"
                        }}>
                          {f.priorite}
                        </span>
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
