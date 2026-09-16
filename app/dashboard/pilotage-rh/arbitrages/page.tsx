// ============================================================
// app/dashboard/rh/arbitrages/page.tsx
// Page Arbitrages RH — Soft UI + Vector SVG Icons
// Données centralisées via useArbitrages() hook
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalArbitrageRH } from "@/features/evaluation/components/ModalArbitrageRH";
import { ScaleIcon, CheckCircleIcon } from "@/components/ui/Icons";
import { useArbitrages } from "@/lib/hooks/useRhDashboard";
import type { EvaluationCycle } from "@/types";

export default function RhArbitragesPage() {
  const [selectedFicheModal, setSelectedFicheModal] = useState<string | null>(null);
  const [arbitrageModalItem, setArbitrageModalItem] = useState<EvaluationCycle | null>(null);
  const { arbitrages, isLoading, error } = useArbitrages();

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 40 }}>
        <FicheEvaluationModal isOpen={selectedFicheModal !== null} onClose={() => setSelectedFicheModal(null)} />
        <ModalArbitrageRH
          isOpen={arbitrageModalItem !== null}
          onClose={() => setArbitrageModalItem(null)}
          dossier={arbitrageModalItem ? {
            id: arbitrageModalItem.id,
            nom: arbitrageModalItem.salarie.nom,
            prenom: arbitrageModalItem.salarie.prenom,
            poste: arbitrageModalItem.salarie.poste,
            direction: arbitrageModalItem.salarie.poste,
            n1: (arbitrageModalItem as any).evaluationN1?.evaluateur
              ? `${(arbitrageModalItem as any).evaluationN1.evaluateur.prenom} ${(arbitrageModalItem as any).evaluationN1.evaluateur.nom}`
              : "Manager N+1",
            noteN1: (arbitrageModalItem as any).evaluationN1?.moyenneNotes ?? 0,
            noteN2: (arbitrageModalItem as any).evaluationN2?.moyenneNotes ?? 0,
          } : null}
          onSuccess={() => setArbitrageModalItem(null)}
        />

        <PageHeader
          title="Arbitrages Ressources Humaines"
          subtitle="Dossiers en désaccord entre évaluation N+1 et validation N+2"
          breadcrumbs={[{ label: "Espace RH" }, { label: "Arbitrages RH" }]}
        />

        {/* Loading / Error states */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ width: 36, height: 36, border: "4px solid #F0822A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 14 }}>Chargement des arbitrages…</p>
          </div>
        )}
        {error && <div style={{ background: "#FEF2F2", padding: 16, borderRadius: 8 }}><p style={{ color: "#B91C1C", margin: 0 }}>⚠️ {error}</p></div>}
        {!isLoading && arbitrages.length === 0 && (
          <div style={{ textAlign: "center", padding: 48 }}>
            <p style={{ fontSize: 40 }}>✅</p>
            <p style={{ fontWeight: 700, color: "#16a34a" }}>Aucun arbitrage en cours !</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {arbitrages.map(item => {
            const anyItem = item as any;
            const noteN1 = anyItem.evaluationN1?.moyenneNotes ?? 0;
            const noteN2 = anyItem.evaluationN2?.moyenneNotes ?? 0;
            const ecartVal = Math.abs(noteN1 - noteN2);
            const isArbitrage = item.statut === "ARBITRAGE";
            return (
            <Card key={item.id} hoverable padding="lg" style={{ border: isArbitrage ? "2px solid #FEE2E2" : "1px solid #A7F3D0", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: isArbitrage ? "#FEF2F2" : "#ECFDF5", color: isArbitrage ? "#DC2626" : "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScaleIcon size={22} color={isArbitrage ? "#DC2626" : "#059669"} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>{item.salarie.prenom} {item.salarie.nom}</h3>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>{item.salarie.poste}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 900, color: isArbitrage ? "#DC2626" : "#059669", background: isArbitrage ? "#FEF2F2" : "#D1FAE5", padding: "4px 10px", borderRadius: 8 }}>
                  {isArbitrage ? "Action RH requise" : "Résolu"}
                </span>
              </div>

              <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ margin: 0, color: "#334155" }}>
                  <strong>Manager N+1 :</strong>{" "}
                  {anyItem.evaluationN1?.evaluateur ? `${anyItem.evaluationN1.evaluateur.prenom} ${anyItem.evaluationN1.evaluateur.nom}` : "N+1"}{" — "}
                  <span style={{ color: "#F0822A", fontWeight: 800 }}>{noteN1.toFixed(1)} / 20 ({((noteN1 / 20) * 100).toFixed(1)} %)</span>
                </p>
                <p style={{ margin: 0, color: "#334155" }}>
                  <strong>Valideur N+2 :</strong>{" "}
                  {anyItem.evaluationN2?.evaluateur ? `${anyItem.evaluationN2.evaluateur.prenom} ${anyItem.evaluationN2.evaluateur.nom}` : "N+2"}{" — "}
                  <span style={{ color: "#3B82F6", fontWeight: 800 }}>{noteN2.toFixed(1)} / 20 ({((noteN2 / 20) * 100).toFixed(1)} %)</span>
                </p>
                <p style={{ margin: "4px 0 0 0", color: "#94A3B8", fontSize: 12 }}><em>Écart détecté : {ecartVal.toFixed(1)} pts — seuil : 2.0 pts</em></p>
              </div>

              {isArbitrage ? (
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
          );
          })}
        </div>
      </div>
    </AppShell>
  );
}
