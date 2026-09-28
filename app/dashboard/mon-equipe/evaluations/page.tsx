// ============================================================
// app/dashboard/mon-equipe/evaluations/page.tsx
// Page "Mes Évaluations N+1" — Données Réelles de l'Équipe Connectée
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, PageHeaderSkeleton, CollaborateursListSkeleton } from "@/components/ui";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { useAuth } from "@/contexts/AuthContext";
import type { EvaluationCycle } from "@/types";

export default function EvaluationsN1Page() {
  const { user, role } = useAuth();
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedFicheModal, setSelectedFicheModal] = useState<EvaluationCycle | null>(null);
  const [selectedObjectifModal, setSelectedObjectifModal] = useState<EvaluationCycle | null>(null);

  const fetchTeamEvaluations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await evaluationsApi.getN1TeamEvaluations();
      setEvaluations(data || []);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des évaluations:", err);
      setError(err.message || "Impossible de charger les évaluations de votre équipe.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamEvaluations();
  }, [fetchTeamEvaluations]);

  const handleExportSingle = (name: string) => {
    alert(`Exportation du fichier Excel Officiel (.xlsx) d'Agilly pour ${name}...`);
  };

  const managerName = user ? `${user.prenom} ${user.nom}`.trim() : "Manager N+1";
  const managerEmail = user?.email || "manager@agilly.com";

  return (
    <AppShell role={role || "N1"} userName={managerName} userEmail={managerEmail} notifCount={0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        {/* Modal Notation Fiche */}
        {selectedFicheModal && (
          <FicheEvaluationModal
            isOpen={true}
            onClose={() => {
              setSelectedFicheModal(null);
              fetchTeamEvaluations();
            }}
            dossier={{
              nom: selectedFicheModal.salarie?.nom || "Collaborateur",
              prenom: selectedFicheModal.salarie?.prenom || "",
              poste: selectedFicheModal.salarie?.poste || "",
            }}
            objectifs={selectedFicheModal.objectifs || []}
          />
        )}

        {/* Modal Fixation Objectifs */}
        {selectedObjectifModal && (
          <ModalDefinirObjectifs
            isOpen={true}
            onClose={() => {
              setSelectedObjectifModal(null);
              fetchTeamEvaluations();
            }}
            salariedId={selectedObjectifModal.salarie?.id}
            salariedName={`${selectedObjectifModal.salarie?.prenom ?? ""} ${selectedObjectifModal.salarie?.nom ?? ""}`.trim()}
            salariedPoste={selectedObjectifModal.salarie?.poste || ""}
            objectifs={selectedObjectifModal.objectifs || []}
            onSaved={fetchTeamEvaluations}
          />
        )}

        <PageHeader
          title="Évaluation de Performance de l'Équipe"
          subtitle="Suivi des fiches d'évaluation réelles, saisie des notes et fixation des objectifs"
          breadcrumbs={[{ label: "Espace N+1" }, { label: "Évaluations" }]}
        />

        {isLoading ? (
          <>
            <PageHeaderSkeleton />
            <CollaborateursListSkeleton count={2} />
          </>
        ) : error ? (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: 16, borderRadius: 0 }}>
            <p style={{ color: "#B91C1C", fontWeight: 700, margin: 0 }}>⚠️ {error}</p>
          </div>
        ) : (
          <Card padding="none" style={{ overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 16px 28px", borderBottom: "1px solid #F1F5F9", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", gap: 16 }}>
              <CardHeader
                title="Évaluations des Collaborateurs"
                subtitle={`${evaluations.length} fiche(s) gérée(s) par ${managerName}`}
                icon="📋"
              />
              {evaluations.length > 0 && (
                <button
                  onClick={() => alert("Génération de l'export consolidé Excel en cours...")}
                  style={{ padding: "10px 20px", background: "#000000", color: "#FFFFFF", border: "none", borderRadius: 0, fontWeight: 900, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  📊 Exporter Tout en Excel
                </button>
              )}
            </div>

            <div style={{ background: "#FAFAFA" }}>
              {evaluations.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", background: "#FFFFFF" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
                    Aucune fiche d'évaluation active
                  </h4>
                  <p style={{ fontSize: 13, color: "#64748B", margin: 0, maxWidth: 500, marginInline: "auto" }}>
                    Les fiches d'évaluation de vos collaborateurs directs s'afficheront ici automatiquement dès l'ouverture de la campagne ou la fixation des objectifs.
                  </p>
                </div>
              ) : (
                evaluations.map((item, idx) => {
                  const salarieNom = `${item.salarie?.prenom ?? ""} ${item.salarie?.nom ?? ""}`.trim() || "Collaborateur";
                  const initial = salarieNom.charAt(0).toUpperCase() || "C";
                  const hasNote = item.noteGlobale !== undefined && item.noteGlobale !== null;
                  const statutLabel =
                    item.statut === "FIXATION_OBJECTIFS"
                      ? "Fixation d'objectifs"
                      : item.statut === "AUTO_EVALUATION"
                      ? "Auto-évaluation salarié"
                      : item.statut === "EVALUATION_N1"
                      ? "À évaluer (N+1)"
                      : item.statut === "VISA_SALARIE"
                      ? "Visa Salarié"
                      : item.statut === "EN_ATTENTE_N2"
                      ? "En attente N+2"
                      : item.statut === "VALIDE"
                      ? "Validée"
                      : item.statut;

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: "20px 28px",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        borderBottom: idx !== evaluations.length - 1 ? "1px solid #F1F5F9" : "none",
                        background: "#FFFFFF",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 260 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {initial}
                        </div>
                        <div>
                          <h4 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>
                            {salarieNom}
                          </h4>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#F0822A", margin: "2px 0 0 0" }}>
                            {item.salarie?.poste || "Collaborateur Agilly"}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5" }}>
                              {statutLabel}
                            </span>
                            <span style={{ fontSize: 11, color: "#64748B" }}>
                              • {item.objectifs?.length || 0} objectif(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        {/* Note Provisoire / Statut de notation */}
                        <div style={{ background: "#F8FAFC", padding: "10px 18px", borderRadius: 0, border: "1px solid #E2E8F0", textAlign: "right", minWidth: 130 }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>
                            Note Provisoire
                          </span>
                          {hasNote ? (
                            <p style={{ fontSize: 20, fontWeight: 900, color: "#F0822A", margin: 0 }}>
                              {item.noteGlobale} <span style={{ fontSize: 12, color: "#94A3B8" }}>/20</span>
                            </p>
                          ) : (
                            <p style={{ fontSize: 12, fontWeight: 800, color: "#64748B", margin: "4px 0 0 0" }}>
                              Non notée
                            </p>
                          )}
                        </div>

                        {/* Action 1 : Fixer / Modifier Objectifs */}
                        <button
                          onClick={() => setSelectedObjectifModal(item)}
                          style={{ padding: "10px 16px", background: "#FFF7ED", color: "#F0822A", border: "1px solid #FFEDD5", borderRadius: 0, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          🎯 Objectifs ({item.objectifs?.length || 0})
                        </button>

                        {/* Action 2 : Noter & Apprécier */}
                        <button
                          onClick={() => setSelectedFicheModal(item)}
                          style={{ padding: "10px 18px", background: "#F0822A", color: "#FFFFFF", border: "none", borderRadius: 0, fontWeight: 900, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(240,130,42,0.2)" }}
                        >
                          📝 Noter & Apprécier
                        </button>

                        {/* Action 3 : Exporter Excel */}
                        <button
                          onClick={() => handleExportSingle(salarieNom)}
                          style={{ padding: "10px 16px", background: "#FFFFFF", color: "#000000", border: "1px solid #CBD5E1", borderRadius: 0, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          📥 Excel
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
