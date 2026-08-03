// ============================================================
// app/dashboard/rh/evaluations/page.tsx
// Page Évaluations RH — Vue par cartes (Soft UI + Vector SVG Icons)
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ScaleIcon, CheckCircleIcon, EyeIcon } from "@/components/ui/Icons";

const EVALUATIONS_RH = [
  { id: "1", nom: "KOUAME", prenom: "Ebenezer Samuel", poste: "Dev Full-Stack", direction: "Executive", n1: "Sevan AKOUMIA", noteN1: 18.5, noteN2: 18.0, statut: "EN_ATTENTE_RH", statutLabel: "En attente Validation RH", date: "28/07/2026" },
  { id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", direction: "Executive", n1: "Sevan AKOUMIA", noteN1: 17.5, noteN2: 14.0, statut: "ARBITRAGE", statutLabel: "Arbitrage RH requis (Écart 3.5 pts)", date: "27/07/2026" },
  { id: "3", nom: "Bah", prenom: "Oumar", poste: "Dev Mobile", direction: "Technique", n1: "Sevan AKOUMIA", noteN1: 15.0, noteN2: 15.0, statut: "VALIDE", statutLabel: "Validé & Clôturé", date: "25/07/2026" },
  { id: "4", nom: "Camara", prenom: "Aissatou", poste: "QA Engineer", direction: "Technique", n1: "Sevan AKOUMIA", noteN1: 14.5, noteN2: 14.5, statut: "VALIDE", statutLabel: "Validé & Clôturé", date: "24/07/2026" },
  { id: "5", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", direction: "Infrastructure", n1: "Sevan AKOUMIA", noteN1: 17.0, noteN2: 17.0, statut: "VALIDE", statutLabel: "Validé & Clôturé", date: "22/07/2026" },
];

export default function RhEvaluationsPage() {
  const [filter, setFilter] = useState<string>("TOUT");
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const filteredItems = EVALUATIONS_RH.filter(item => {
    if (filter === "EN_ATTENTE") return item.statut === "EN_ATTENTE_RH";
    if (filter === "ARBITRAGE") return item.statut === "ARBITRAGE";
    if (filter === "VALIDE") return item.statut === "VALIDE";
    return true;
  });

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 40 }}>
        <FicheEvaluationModal isOpen={selectedModal !== null} onClose={() => setSelectedModal(null)} />

        <PageHeader
          title="Toutes les Évaluations"
          subtitle="Suivi complet des fiches d'évaluation du cycle 2026"
          breadcrumbs={[{ label: "Espace RH" }, { label: "Évaluations" }]}
        />

        {/* Filtres */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { id: "TOUT", label: "Toutes les fiches (5)" },
            { id: "EN_ATTENTE", label: "En attente RH (1)" },
            { id: "ARBITRAGE", label: "Arbitrages (1)" },
            { id: "VALIDE", label: "Validées (3)" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: filter === f.id ? "none" : "1px solid #E2E8F0",
                background: filter === f.id ? "#F0822A" : "#FFFFFF",
                color: filter === f.id ? "#FFFFFF" : "#475569",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: filter === f.id ? "0 4px 12px rgba(240, 130, 42, 0.25)" : "none"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cartes Évaluations */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filteredItems.map(item => (
            <Card key={item.id} hoverable padding="lg" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.prenom.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>{item.prenom} {item.nom}</h3>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>{item.poste}</p>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Direction :</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A" }}>{item.direction}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>N+1 Note & Taux :</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#F0822A" }}>{item.noteN1} / 20 ({((item.noteN1 / 20) * 100).toFixed(1)} %)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>N+2 Note & Taux :</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#3B82F6" }}>{item.noteN2} / 20 ({((item.noteN2 / 20) * 100).toFixed(1)} %)</span>
                  </div>
                </div>

                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "6px 12px",
                  borderRadius: 8,
                  marginBottom: 16,
                  background: item.statut === "ARBITRAGE" ? "#FEF2F2" : item.statut === "VALIDE" ? "#D1FAE5" : "#FFF7ED",
                  color: item.statut === "ARBITRAGE" ? "#DC2626" : item.statut === "VALIDE" ? "#059669" : "#EA580C",
                  border: item.statut === "ARBITRAGE" ? "1px solid #FEE2E2" : "none"
                }}>
                  {item.statut === "ARBITRAGE" && <ScaleIcon size={14} color="#DC2626" />}
                  {item.statut === "VALIDE" && <CheckCircleIcon size={14} color="#059669" />}
                  {item.statutLabel}
                </span>
              </div>

              <button
                onClick={() => setSelectedModal(item.id)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: item.statut === "ARBITRAGE" ? "#DC2626" : item.statut === "EN_ATTENTE_RH" ? "#F0822A" : "#000000",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: item.statut === "EN_ATTENTE_RH" ? "0 4px 14px rgba(240, 130, 42, 0.3)" : "none"
                }}
              >
                {item.statut === "ARBITRAGE" ? (
                  <><ScaleIcon size={16} color="#FFFFFF" /> Ouvrir Arbitrage</>
                ) : item.statut === "EN_ATTENTE_RH" ? (
                  <><CheckCircleIcon size={16} color="#FFFFFF" /> Valider & Clôturer</>
                ) : (
                  <><EyeIcon size={16} color="#FFFFFF" /> Consulter la Fiche</>
                )}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
