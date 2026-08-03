// ============================================================
// app/dashboard/n1/evaluations/page.tsx
// Page "Mes Évaluations N+1" — Notation, Formations, Observations & Export Direct (Soft UI 100% Inline CSS)
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";

const EVALUATIONS_N1 = [
  { id: "1", nom: "KOUAME", prenom: "Ebenezer Samuel", poste: "Développeur Full-Stack", noteProvisoire: 16.6, statut: "EN_COURS", formationDemandee: "Architecture Fine-Tuning IA (LangChain)", obsN1: "Excellente progression technique." },
  { id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", noteProvisoire: 17.5, statut: "EN_COURS", formationDemandee: "Figma Advanced Component Systems", obsN1: "Livrables UI d'une grande qualité." },
  { id: "3", nom: "Bah", prenom: "Oumar", poste: "Développeur Mobile", noteProvisoire: 15.0, statut: "TRANSMIS_N2", formationDemandee: "Flutter Performance Optimization", obsN1: "Bonne implication sur la v2 mobile." },
  { id: "4", nom: "Camara", prenom: "Aissatou", poste: "QA Engineer", noteProvisoire: 14.5, statut: "VALIDEE", formationDemandee: "Automation Cypress & Playwright", obsN1: "Rigueur exemplaire dans les tests." },
  { id: "5", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", noteProvisoire: 17.0, statut: "VALIDEE", formationDemandee: "Kubernetes & Infrastructure as Code", obsN1: "Gestion parfaite du cluster." },
];

export default function EvaluationsN1Page() {
  const [selectedFicheModal, setSelectedFicheModal] = useState<string | null>(null);

  const handleExportSingle = (name: string) => {
    alert(`Exportation du fichier Excel Officiel (.xlsx) d'Agilly pour ${name}...`);
  };

  return (
    <AppShell role="N1" userName="Sevan AKOUMIA" userEmail="sevan.akoumia@agilly.com" notifCount={2}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        <FicheEvaluationModal isOpen={selectedFicheModal !== null} onClose={() => setSelectedFicheModal(null)} />

        <PageHeader
          title="Évaluation de Performance de l'Équipe"
          subtitle="Saisie des notes /20, appréciation, besoins en formation & export direct Excel"
          breadcrumbs={[{ label: "Espace N+1" }, { label: "Évaluations" }]}
        />

        <Card padding="none" style={{ overflow: "hidden" }}>
          <div style={{ padding: "24px 28px 16px 28px", borderBottom: "1px solid #F1F5F9", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", gap: 16 }}>
            <CardHeader title="Évaluations des Collaborateurs" subtitle="5 fiches gérées par Sevan AKOUMIA" icon="📋" />
            <button
              onClick={() => alert("Génération du pack complet des fiches Excel d'Agilly en cours...")}
              style={{ padding: "10px 20px", background: "#000000", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              📊 Exporter Tout en Excel Zip
            </button>
          </div>

          <div style={{ background: "#FAFAFA" }}>
            {EVALUATIONS_N1.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: "20px 28px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  borderBottom: idx !== EVALUATIONS_N1.length - 1 ? "1px solid #F1F5F9" : "none",
                  background: "#FFFFFF"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 240 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.prenom.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>{item.prenom} {item.nom}</h4>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#F0822A", margin: "2px 0 0 0" }}>{item.poste}</p>
                    <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0 0", fontStyle: "italic" }}>
                      🎓 Formation : {item.formationDemandee}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ background: "#F8FAFC", padding: "10px 18px", borderRadius: 14, border: "1px solid #E2E8F0", textAlign: "right" }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Note Provisoire</span>
                    <p style={{ fontSize: 20, fontWeight: 900, color: "#F0822A", margin: 0 }}>{item.noteProvisoire} <span style={{ fontSize: 12, color: "#94a3b8" }}>/20</span></p>
                  </div>

                  {/* Action 1 : Ouvrir l'évaluation pour noter, donner avis & formation */}
                  <button
                    onClick={() => setSelectedFicheModal(item.id)}
                    style={{ padding: "10px 18px", background: "#F0822A", color: "#FFFFFF", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(240,130,42,0.3)" }}
                  >
                    📝 Noter & Apprécier
                  </button>

                  {/* Action 2 : Exportation directe Excel Officiel de la fiche */}
                  <button
                    onClick={() => handleExportSingle(`${item.prenom} ${item.nom}`)}
                    style={{ padding: "10px 16px", background: "#FFFFFF", color: "#000000", border: "1px solid #CBD5E1", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    📥 Exporter Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </AppShell>
  );
}
