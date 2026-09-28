// ============================================================
// app/dashboard/pilotage-rh/evaluations/page.tsx
// Page Évaluations RH — 100% Données Réelles Neon PostgreSQL
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Skeleton } from "@/components/ui";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ScaleIcon, CheckCircleIcon, EyeIcon, FileSpreadsheetIcon, ArrowPathIcon } from "@/components/ui/Icons";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { exportEvaluationToExcel } from "@/lib/utils/exportExcelEvaluation";
import type { EvaluationCycle } from "@/types";

export default function RhEvaluationsPage() {
  const [filter, setFilter] = useState<string>("TOUT");
  const [selectedModal, setSelectedModal] = useState<EvaluationCycle | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await evaluationsApi.getAllForRh();
      setEvaluations(data || []);
    } catch (err: any) {
      console.error("[RhEvaluationsPage] Error loading evaluations:", err);
      setError("Erreur lors de la récupération des évaluations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const filteredItems = evaluations.filter((item) => {
    if (filter === "EN_ATTENTE") {
      return ["EN_ATTENTE_RH", "EN_ATTENTE_N1", "EN_ATTENTE_N2", "FIXATION_OBJECTIFS"].includes(item.statut);
    }
    if (filter === "ARBITRAGE") return item.statut === "ARBITRAGE";
    if (filter === "VALIDE") return ["VALIDE", "CLOTURE"].includes(item.statut);
    return true;
  });

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "ARBITRAGE":
        return { label: "Arbitrage RH Requis", bg: "#FEF2F2", color: "#DC2626", border: "#FEE2E2" };
      case "VALIDE":
      case "CLOTURE":
        return { label: "Validé & Clôturé", bg: "#D1FAE5", color: "#059669", border: "#A7F3D0" };
      case "EN_ATTENTE_RH":
        return { label: "En attente RH", bg: "#FFF7ED", color: "#EA580C", border: "#FFEDD5" };
      case "EN_ATTENTE_N1":
        return { label: "En attente N+1", bg: "#EFF6FF", color: "#2563EB", border: "#DBEAFE" };
      default:
        return { label: statut, bg: "#F1F5F9", color: "#475569", border: "#E2E8F0" };
    }
  };

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 40 }}>
        
        <FicheEvaluationModal 
          isOpen={selectedModal !== null} 
          onClose={() => setSelectedModal(null)} 
          evaluationId={selectedModal?.id}
          dossier={selectedModal ? {
            id: selectedModal.id,
            ficheId: selectedModal.id,
            salarieId: selectedModal.salarie?.id,
            nom: selectedModal.salarie?.nom || "",
            prenom: selectedModal.salarie?.prenom || "",
            poste: selectedModal.salarie?.poste || "",
            direction: (selectedModal.salarie as any)?.departement || "Direction",
          } : null}
          objectifs={selectedModal?.objectifs || []}
          readOnly={true}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <PageHeader
            title="Toutes les Évaluations"
            subtitle={`${evaluations.length} fiche(s) d'évaluation enregistrée(s)`}
            breadcrumbs={[{ label: "Espace RH" }, { label: "Évaluations" }]}
          />

          <button
            onClick={fetchEvaluations}
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

        {/* Filtres */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { id: "TOUT", label: `Toutes les fiches (${evaluations.length})` },
            { id: "EN_ATTENTE", label: `En cours (${evaluations.filter(e => !["VALIDE", "CLOTURE", "ARBITRAGE"].includes(e.statut)).length})` },
            { id: "ARBITRAGE", label: `Arbitrages (${evaluations.filter(e => e.statut === "ARBITRAGE").length})` },
            { id: "VALIDE", label: `Validées (${evaluations.filter(e => ["VALIDE", "CLOTURE"].includes(e.statut)).length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 0,
                border: filter === f.id ? "1px solid #F0822A" : "1px solid #E2E8F0",
                background: filter === f.id ? "#F0822A" : "#FFFFFF",
                color: filter === f.id ? "#FFFFFF" : "#475569",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chargement */}
        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-28 mb-4" />
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: 16, color: "#991B1B", fontSize: 13, fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Liste vide */}
        {!isLoading && !error && filteredItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <CheckCircleIcon size={40} color="#94A3B8" />
            <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "12px 0 4px 0" }}>
              Aucune évaluation dans cette catégorie
            </h4>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Toutes les évaluations sont à jour ou aucune fiche ne correspond au filtre sélectionné.
            </p>
          </div>
        )}

        {/* Cartes Évaluations Réelles */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filteredItems.map(item => {
              const badge = getStatutBadge(item.statut);
              const note = item.noteGlobale != null ? `${Number(item.noteGlobale).toFixed(1)} / 20` : "En attente";
              const dateCreation = item.dateCreation ? new Date(item.dateCreation).toLocaleDateString("fr-FR") : "-";

              return (
                <Card key={item.id} hoverable padding="lg" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 0, background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {(item.salarie?.prenom || item.salarie?.nom || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>
                            {item.salarie?.prenom} {item.salarie?.nom}
                          </h3>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>
                            {item.salarie?.poste || "Collaborateur"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 0, border: "1px solid #E2E8F0", marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Direction :</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A" }}>{(item.salarie as any)?.departement || "Agilly"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Note Finale :</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: "#F0822A" }}>{note}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Date ouverture :</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{dateCreation}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>Objectifs fixés :</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{item.objectifs?.length || 0}</span>
                      </div>
                    </div>

                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 900,
                      padding: "6px 12px",
                      borderRadius: 0,
                      marginBottom: 16,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`
                    }}>
                      {item.statut === "ARBITRAGE" && <ScaleIcon size={14} color="#DC2626" />}
                      {["VALIDE", "CLOTURE"].includes(item.statut) && <CheckCircleIcon size={14} color="#059669" />}
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setSelectedModal(item)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 0,
                        border: "none",
                        background: "#0F172A",
                        color: "#FFFFFF",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <EyeIcon size={14} color="#FFFFFF" /> Consulter la Fiche
                    </button>
                    <button
                      onClick={() => exportEvaluationToExcel(item)}
                      title="Télécharger la fiche Excel officielle"
                      style={{
                        padding: "10px 14px",
                        borderRadius: 0,
                        border: "1px solid #A7F3D0",
                        background: "#ECFDF5",
                        color: "#059669",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FileSpreadsheetIcon size={14} color="#059669" /> Excel
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
