// ============================================================
// app/dashboard/pilotage-rh/organigramme/page.tsx
// Page "Organigramme & Structure Hiérarchique" RH — 100% Données Réelles
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Skeleton } from "@/components/ui";
import { UsersIcon, ScaleIcon, ArrowPathIcon } from "@/components/ui/Icons";
import { employeesApi } from "@/lib/api/employees.api";
import type { User } from "@/types";

const RACI_STEPS = [
  {
    etape: "1. Définition des Objectifs",
    salarie: "C (Consulté)",
    n1: "A (Approbateur / Rédacteur)",
    n2: "I (Informé)",
    rh: "R (Responsable Cadre)",
    desc: "Fixation des objectifs de performance annuels et pondérations par le N+1"
  },
  {
    etape: "2. Évaluation de Performance",
    salarie: "I (Auto-regard)",
    n1: "R/A (Rédacteur & Notateur)",
    n2: "C (Revue prioritaire)",
    rh: "I (Suivi avancement)",
    desc: "Attribution des notes /20 et pourcentages d'atteinte par le Responsable Technique N+1"
  },
  {
    etape: "3. Validation Hiérarchique N+2",
    salarie: "I (En attente)",
    n1: "C (Support)",
    n2: "R/A (Validation N+2)",
    rh: "I (Alerte si écart)",
    desc: "Revue globale et approbation par le N+2 de direction"
  },
  {
    etape: "4. Arbitrage RH (si litige)",
    salarie: "I (Informé)",
    n1: "C (Partie au débat)",
    n2: "C (Partie au débat)",
    rh: "R/A (Décision Finale RH)",
    desc: "Tranchage et fixation de la note arbitrée par la DRH si l'écart N+1/N+2 excède le seuil"
  },
  {
    etape: "5. Clôture & Signature",
    salarie: "A (Signataire)",
    n1: "A (Signataire N+1)",
    n2: "A (Signataire N+2)",
    rh: "R (Clôture du Cycle)",
    desc: "Signature électronique des 4 acteurs et génération de la fiche officielle"
  }
];

export default function OrganigrammeRhPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await employeesApi.getAllUsers();
      setUsers(data || []);
    } catch (e) {
      console.error("[OrganigrammeRhPage] Error fetching users:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const drhUsers = users.filter((u) => u.role === "DRH" || u.role === "RH");
  const n2Users = users.filter((u) => u.role === "N2");
  const n1Users = users.filter((u) => u.role === "N1");
  const salarieUsers = users.filter((u) => u.role === "SALARIE");

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <PageHeader
            title="Organigramme & Matrice des Rôles (RACI)"
            subtitle="Structure hiérarchique réelle issue de l'annuaire d'entreprise"
            breadcrumbs={[{ label: "Espace RH" }, { label: "Organigramme & Rôles" }]}
          />

          <button
            onClick={fetchUsers}
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

        {/* SECTION 1 : VUE ARBORESCENTE DE L'ORGANIGRAMME */}
        <Card padding="lg">
          <CardHeader 
            title="Chaîne Hiérarchique de l'Organisation" 
            subtitle="Rattachements hiérarchiques réels (DRH ➔ N+2 ➔ N+1 ➔ Salariés)" 
            icon="🌳" 
          />

          {isLoading ? (
            <div style={{ padding: 32 }}>
              <Skeleton className="h-16 w-1/2 mx-auto mb-4" />
              <Skeleton className="h-16 w-1/2 mx-auto mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 28, background: "#F8FAFC", padding: 32, borderRadius: 0, border: "1px solid #E2E8F0" }}>
              
              {/* BLOC RH (TRANSVERSAL) */}
              <div style={{
                background: "#0F172A",
                color: "#FFFFFF",
                padding: "14px 28px",
                borderRadius: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                maxWidth: 480,
                width: "100%",
                justifyContent: "center",
              }}>
                <UsersIcon size={20} color="#F0822A" />
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#F0822A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Supervision Transversale & Arbitrage
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 900, margin: "2px 0 0 0" }}>
                    {drhUsers.length > 0 
                      ? drhUsers.map(u => `${u.prenom} ${u.nom}`).join(", ") 
                      : "Direction des Ressources Humaines (DRH)"}
                  </p>
                </div>
              </div>

              <div style={{ width: 2, height: 20, background: "#CBD5E1" }} />

              {/* NIVEAU N+2 : DIRECTION */}
              <div style={{
                background: "#EFF6FF",
                border: "2px solid #3B82F6",
                padding: "18px 32px",
                borderRadius: 0,
                textAlign: "center",
                maxWidth: 480,
                width: "100%",
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#2563EB", background: "#FFFFFF", padding: "3px 12px", border: "1px solid #BFDBFE" }}>
                  NIVEAU N+2 · DIRECTION
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "8px 0 2px 0" }}>
                  {n2Users.length > 0 
                    ? n2Users.map(u => `${u.prenom} ${u.nom} (${u.poste || "Direction N+2"})`).join(", ")
                    : "Direction N+2 (Validation Hiérarchique)"}
                </h3>
              </div>

              <div style={{ width: 2, height: 24, background: "#3B82F6" }} />

              {/* NIVEAU N+1 : MANAGERS */}
              <div style={{
                background: "#FFF7ED",
                border: "2px solid #F0822A",
                padding: "18px 32px",
                borderRadius: 0,
                textAlign: "center",
                maxWidth: 480,
                width: "100%",
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#EA580C", background: "#FFFFFF", padding: "3px 12px", border: "1px solid #FFEDD5" }}>
                  NIVEAU N+1 · MANAGERS DIRECTS
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "8px 0 2px 0" }}>
                  {n1Users.length > 0 
                    ? n1Users.map(u => `${u.prenom} ${u.nom} (${u.poste || "Manager N+1"})`).join(", ")
                    : "Managers N+1 (Évaluateurs Directs)"}
                </h3>
              </div>

              <div style={{ width: 2, height: 24, background: "#F0822A" }} />

              {/* NIVEAU SALARIÉS */}
              <div style={{ width: "100%", textAlign: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#059669", background: "#ECFDF5", padding: "4px 14px", border: "1px solid #A7F3D0", display: "inline-block", marginBottom: 16 }}>
                  COLLABORATEURS & ÉQUIPES ({salarieUsers.length} Salarié(s))
                </span>

                {salarieUsers.length === 0 ? (
                  <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", padding: 24 }}>
                    <p style={{ margin: 0, color: "#64748B", fontSize: 13, fontWeight: 600 }}>
                      Aucun profil salarié enregistré avec ce rôle.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                    {salarieUsers.map((sal) => (
                      <div key={sal.id} style={{
                        background: "#FFFFFF",
                        padding: 16,
                        borderRadius: 0,
                        border: "1px solid #E2E8F0",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 0, background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {(sal.prenom || sal.nom || "?").charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 900, color: "#059669", textTransform: "uppercase" }}>
                              {sal.departement || "Salarié"}
                            </span>
                          </div>
                          <h4 style={{ fontSize: 14, fontWeight: 900, color: "#000000", margin: 0 }}>
                            {sal.prenom} {sal.nom}
                          </h4>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>
                            {sal.poste || "Poste non spécifié"}
                          </p>
                        </div>
                        <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, display: "block", wordBreak: "break-all" }}>
                          {sal.email}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </Card>

        {/* SECTION 2 : MATRICE RACI DES RÔLES */}
        <Card padding="lg">
          <CardHeader 
            title="Matrice RACI du Processus d'Évaluation de Performance" 
            subtitle="R (Réalisateur) · A (Approbateur) · C (Consulté) · I (Informé)" 
            icon={<ScaleIcon size={20} color="#F0822A" />} 
          />

          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Étape du Processus</th>
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#059669" }}>Salarié</th>
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#F0822A" }}>N+1 (Manager Direct)</th>
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#2563EB" }}>N+2 (Direction)</th>
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#DC2626" }}>RH (Ressources Humaines)</th>
                </tr>
              </thead>
              <tbody>
                {RACI_STEPS.map((step, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px" }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", margin: 0 }}>{step.etape}</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>{step.desc}</p>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#ECFDF5", color: "#047857", padding: "4px 10px" }}>{step.salarie}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#FFF7ED", color: "#C2410C", padding: "4px 10px" }}>{step.n1}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px" }}>{step.n2}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#FEF2F2", color: "#B91C1C", padding: "4px 10px" }}>{step.rh}</span>
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
