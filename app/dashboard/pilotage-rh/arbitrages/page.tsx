// ============================================================
// app/dashboard/rh/arbitrages/page.tsx
// Page Arbitrages RH — Soft UI + Vector SVG Icons
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalArbitrageRH } from "@/features/evaluation/components/ModalArbitrageRH";
import { ScaleIcon, CheckCircleIcon } from "@/components/ui/Icons";

const INITIAL_ARBITRAGES_RH = [
  {
    id: "2",
    nom: "Koné",
    prenom: "Mariam",
    poste: "Designer UI/UX",
    direction: "Executive",
    n1: "Sevan AKOUMIA",
    noteN1: 17.5,
    noteN2: 14.0,
    ecart: "3.5 points (17.5 %)",
    raison: "Désaccord sur l'évaluation des compétences transversales et du respect des délais.",
    statutLabel: "Action RH requise",
    statut: "ARBITRAGE",
  },
];

export default function RhArbitragesPage() {
  const [selectedFicheModal, setSelectedFicheModal] = useState<string | null>(null);
  const [arbitrageModalItem, setArbitrageModalItem] = useState<any | null>(null);
  const [arbitrages, setArbitrages] = useState(INITIAL_ARBITRAGES_RH);

  const handleArbitrageSuccess = (id: string, noteFinale: number, commentaire: string) => {
    const tauxFinal = ((noteFinale / 20) * 100).toFixed(1);
    setArbitrages(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          statut: "VALIDE",
          statutLabel: `Validé après Arbitrage RH (${noteFinale}/20 - ${tauxFinal}%)`,
        };
      }
      return item;
    }));
  };

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 40 }}>
        <FicheEvaluationModal isOpen={selectedFicheModal !== null} onClose={() => setSelectedFicheModal(null)} />
        <ModalArbitrageRH
          isOpen={arbitrageModalItem !== null}
          onClose={() => setArbitrageModalItem(null)}
          dossier={arbitrageModalItem}
          onSuccess={handleArbitrageSuccess}
        />

        <PageHeader
          title="Arbitrages Ressources Humaines"
          subtitle="Dossiers en désaccord entre évaluation N+1 et validation N+2"
          breadcrumbs={[{ label: "Espace RH" }, { label: "Arbitrages RH" }]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {arbitrages.map(item => (
            <Card key={item.id} hoverable padding="lg" style={{ border: item.statut === "ARBITRAGE" ? "2px solid #FEE2E2" : "1px solid #A7F3D0", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: item.statut === "ARBITRAGE" ? "#FEF2F2" : "#ECFDF5", color: item.statut === "ARBITRAGE" ? "#DC2626" : "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScaleIcon size={22} color={item.statut === "ARBITRAGE" ? "#DC2626" : "#059669"} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>{item.prenom} {item.nom}</h3>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>{item.poste} · {item.direction}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 900, color: item.statut === "ARBITRAGE" ? "#DC2626" : "#059669", background: item.statut === "ARBITRAGE" ? "#FEF2F2" : "#D1FAE5", padding: "4px 10px", borderRadius: 8 }}>
                  {item.statutLabel}
                </span>
              </div>

              <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ margin: 0, color: "#334155" }}>
                  <strong>Manager N+1 :</strong> {item.n1} — <span style={{ color: "#F0822A", fontWeight: 800 }}>{item.noteN1} / 20 ({((item.noteN1 / 20) * 100).toFixed(1)} %)</span>
                </p>
                <p style={{ margin: 0, color: "#334155" }}>
                  <strong>Valideur N+2 :</strong> Direction Technique — <span style={{ color: "#3B82F6", fontWeight: 800 }}>{item.noteN2} / 20 ({((item.noteN2 / 20) * 100).toFixed(1)} %)</span>
                </p>
                <p style={{ margin: "4px 0 0 0", color: "#94A3B8", fontSize: 12 }}><em>{item.raison}</em></p>
              </div>

              {item.statut === "ARBITRAGE" ? (
                <button
                  onClick={() => setArbitrageModalItem(item)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)"
                  }}
                >
                  <ScaleIcon size={18} color="#FFFFFF" />
                  Saisir la Note Conclue d'Arbitrage
                </button>
              ) : (
                <button
                  onClick={() => setSelectedFicheModal(item.id)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "#059669",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)"
                  }}
                >
                  <CheckCircleIcon size={18} color="#FFFFFF" />
                  Consulter la Fiche Clôturée
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
