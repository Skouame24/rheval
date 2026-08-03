// ============================================================
// app/dashboard/rh/organigramme/page.tsx
// Page "Organigramme & Structure Hiérarchique" RH (Soft UI 100% Inline CSS)
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { UsersIcon, ScaleIcon, CheckCircleIcon } from "@/components/ui/Icons";

const EQUIPE_TECHNIQUE = [
  { nom: "Ebenezer Samuel KOUAME", poste: "Développeur Full-Stack (IA & Orchestration)", email: "e.kouame@agilly.com", type: "Salarié / Développeur" },
  { nom: "Mariam Koné", poste: "UI/UX Designer Senior", email: "m.kone@agilly.com", type: "Salariée / Designer" },
  { nom: "Oumar Bah", poste: "Développeur Mobile (iOS / Android)", email: "o.bah@agilly.com", type: "Salarié / Développeur" },
  { nom: "Aissatou Camara", poste: "QA Engineer & Test Automatisé", email: "a.camara@agilly.com", type: "Salariée / QA" },
  { nom: "Mamadou Sylla", poste: "DevOps & Cloud Specialist", email: "m.sylla@agilly.com", type: "Salarié / DevOps" },
];

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
    n2: "R/A (Validation DSI)",
    rh: "I (Alerte si écart)",
    desc: "Revue globale et approbation par le Directeur des Systèmes d'Information (DSI)"
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
  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        <PageHeader
          title="Organigramme & Matrice des Rôles (RACI)"
          subtitle="Département Digital AGILLY · Structure des Rattachements Hiérarchiques & Chaîne d'Évaluation"
          breadcrumbs={[{ label: "Espace RH" }, { label: "Organigramme & Rôles" }]}
        />

        {/* SECTION 1 : VUE ARBORESCENTE DE L'ORGANIGRAMME */}
        <Card padding="lg">
          <CardHeader 
            title="Arborescence du Département Digital & Systèmes d'Information" 
            subtitle="Chaîne hiérarchique directe : DSI (N+2) ➔ Responsable Technique (N+1) ➔ Équipe Technique (Salariés)" 
            icon="🌳" 
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 28, background: "#F8FAFC", padding: 32, borderRadius: 24, border: "1px solid #E2E8F0" }}>
            
            {/* BLOC RH (TRANSVERSAL) */}
            <div style={{
              background: "#1E293B",
              color: "#FFFFFF",
              padding: "12px 24px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 6px 18px rgba(30, 41, 59, 0.25)"
            }}>
              <UsersIcon size={20} color="#F0822A" />
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#F0822A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Supervision Transversale</span>
                <p style={{ fontSize: 13, fontWeight: 900, margin: 0 }}>Direction des Ressources Humaines (DRH)</p>
              </div>
            </div>

            <div style={{ width: 2, height: 20, background: "#CBD5E1" }} />

            {/* NIVEAU N+2 : DSI */}
            <div style={{
              background: "#EFF6FF",
              border: "2px solid #3B82F6",
              padding: "18px 32px",
              borderRadius: 20,
              textAlign: "center",
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.12)"
            }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#2563EB", background: "#FFFFFF", padding: "3px 12px", borderRadius: 8, border: "1px solid #BFDBFE" }}>
                NIVEAU N+2 · DIRECTION DÉPARTEMENT
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "8px 0 2px 0" }}>
                Directeur des Systèmes d'Information (DSI)
              </h3>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", margin: 0 }}>
                Supervision stratégique du Département Digital & Validation N+2 des Fiches
              </p>
            </div>

            <div style={{ width: 2, height: 24, background: "#3B82F6" }} />

            {/* NIVEAU N+1 : RESPONSABLE TECHNIQUE */}
            <div style={{
              background: "#FFF7ED",
              border: "2px solid #F0822A",
              padding: "18px 32px",
              borderRadius: 20,
              textAlign: "center",
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 8px 24px rgba(240, 130, 42, 0.15)"
            }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#EA580C", background: "#FFFFFF", padding: "3px 12px", borderRadius: 8, border: "1px solid #FFEDD5" }}>
                NIVEAU N+1 · MANAGER DIRECT
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "8px 0 2px 0" }}>
                Sevan AKOUMIA — Responsable Technique
              </h3>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", margin: 0 }}>
                Lead & Encadrement direct de l'Équipe Technique (Notateur N+1 des Objectifs)
              </p>
            </div>

            <div style={{ width: 2, height: 24, background: "#F0822A" }} />

            {/* BRANCHE DES SALARIÉS (ÉQUIPE TECHNIQUE) */}
            <div style={{ width: "100%", textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#059669", background: "#ECFDF5", padding: "4px 14px", borderRadius: 10, border: "1px solid #A7F3D0", display: "inline-block", marginBottom: 16 }}>
                NIVEAU SALARIÉS · ÉQUIPE TECHNIQUE & DIGITAL (ÉVALUÉS)
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                {EQUIPE_TECHNIQUE.map((sal, idx) => (
                  <div key={idx} style={{
                    background: "#FFFFFF",
                    padding: 16,
                    borderRadius: 16,
                    border: "1px solid #E2E8F0",
                    textAlign: "left",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {sal.nom.charAt(0)}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#059669", textTransform: "uppercase" }}>{sal.type}</span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 900, color: "#000000", margin: 0 }}>{sal.nom}</h4>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>{sal.poste}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, display: "block" }}>{sal.email}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Card>

        {/* SECTION 2 : MATRICE RACI DES RÔLES DANS LE PROCESSUS D'ÉVALUATION */}
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
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#059669" }}>Salarié (Développeur)</th>
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#F0822A" }}>N+1 (Responsable Tech)</th>
                  <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#2563EB" }}>N+2 (DSI)</th>
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
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#ECFDF5", color: "#047857", padding: "6px 12px", borderRadius: 8 }}>{step.salarie}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#FFF7ED", color: "#C2410C", padding: "6px 12px", borderRadius: 8 }}>{step.n1}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#EFF6FF", color: "#1D4ED8", padding: "6px 12px", borderRadius: 8 }}>{step.n2}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "#FEF2F2", color: "#B91C1C", padding: "6px 12px", borderRadius: 8 }}>{step.rh}</span>
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

