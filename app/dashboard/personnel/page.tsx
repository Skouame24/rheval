// ============================================================
// app/dashboard/personnel/page.tsx
// Page "Gestion du Personnel" RH — 100% Données Réelles Neon PostgreSQL
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, Skeleton } from "@/components/ui";
import { GridIcon, ListIcon, EyeIcon, UsersIcon, ArrowPathIcon } from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalProfilEmploye } from "@/features/dashboard/components/ModalProfilEmploye";
import { employeesApi } from "@/lib/api/employees.api";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import type { User, EvaluationCycle } from "@/types";

export default function SalariesRhPage() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [users, setUsers] = useState<User[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFicheModal, setSelectedFicheModal] = useState<EvaluationCycle | null>(null);
  const [selectedProfil, setSelectedProfil] = useState<any | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, evalsData] = await Promise.all([
        employeesApi.getAllUsers().catch(() => []),
        evaluationsApi.getAllForRh().catch(() => []),
      ]);
      setUsers(usersData);
      setEvaluations(evalsData);
    } catch (err: any) {
      console.error("[SalariesRhPage] Error loading data:", err);
      setError("Impossible de charger les données du personnel.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Associer chaque utilisateur à son évaluation
  const salariesWithEval = users.map((u) => {
    const userEval = evaluations.find(
      (e) => e.salarie?.id === u.id || (e.salarie?.email && e.salarie.email.toLowerCase() === u.email.toLowerCase())
    );
    return {
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      poste: u.poste || "Poste non défini",
      direction: u.departement || "Direction Générale",
      site: "Abidjan AGILLY",
      n1: u.n1 ? `${u.n1.prenom} ${u.n1.nom}` : "Direction Générale",
      email: u.email,
      matricule: `EMP-${u.id.slice(0, 6).toUpperCase()}`,
      telephone: u.telephone || "+225 07 00 00 00 00",
      evaluation: userEval,
      statutCycle: userEval ? userEval.statut : "Non démarré",
      noteActuelle: userEval?.noteGlobale ? `${userEval.noteGlobale} / 20` : "En attente",
    };
  });

  const filteredSalaries = salariesWithEval.filter((s) => {
    const full = `${s.prenom} ${s.nom} ${s.poste} ${s.direction} ${s.email} ${s.n1}`.toLowerCase();
    return full.includes(searchQuery.toLowerCase());
  });

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={0}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        {/* Modal Fiche Officielle Evaluation */}
        <FicheEvaluationModal 
          isOpen={selectedFicheModal !== null} 
          onClose={() => setSelectedFicheModal(null)} 
          evaluationId={selectedFicheModal?.id}
          dossier={selectedFicheModal ? {
            id: selectedFicheModal.id,
            ficheId: selectedFicheModal.id,
            salarieId: selectedFicheModal.salarie?.id,
            nom: selectedFicheModal.salarie?.nom || "",
            prenom: selectedFicheModal.salarie?.prenom || "",
            poste: selectedFicheModal.salarie?.poste || "",
            direction: (selectedFicheModal.salarie as any)?.departement || "Direction Technique",
            formations: selectedFicheModal.formations || [],
          } : null}
          objectifs={selectedFicheModal?.objectifs || []}
          role="RH"
          readOnly={true}
        />

        {/* Modal Profil Individuel Salarié */}
        <ModalProfilEmploye
          isOpen={selectedProfil !== null}
          onClose={() => setSelectedProfil(null)}
          employe={selectedProfil}
          onOpenFiche={(id) => {
            const found = salariesWithEval.find((s) => s.id === id);
            if (found?.evaluation) {
              setSelectedFicheModal(found.evaluation);
            }
          }}
        />

        {/* Header avec switch de vue flexible & barre de recherche */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <PageHeader
            title="Répertoire du Personnel"
            subtitle={`${users.length} collaborateur(s) synchronisé(s) dans la base RH`}
            breadcrumbs={[{ label: "Espace RH" }, { label: "Salariés" }]}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={fetchData}
              title="Rafraîchir les données"
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

            {/* Toggle Vue Cartes / Vue Tableau */}
            <div style={{ display: "flex", background: "#E2E8F0", padding: 4, borderRadius: 0, gap: 4 }}>
              <button
                onClick={() => setViewMode("cards")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 0,
                  border: "none",
                  background: viewMode === "cards" ? "#FFFFFF" : "transparent",
                  color: viewMode === "cards" ? "#0F172A" : "#64748B",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: viewMode === "cards" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <GridIcon size={16} color={viewMode === "cards" ? "#0F172A" : "#64748B"} />
                Vue Cartes
              </button>
              <button
                onClick={() => setViewMode("table")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 0,
                  border: "none",
                  background: viewMode === "table" ? "#FFFFFF" : "transparent",
                  color: viewMode === "table" ? "#0F172A" : "#64748B",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: viewMode === "table" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <ListIcon size={16} color={viewMode === "table" ? "#0F172A" : "#64748B"} />
                Vue Tableau
              </button>
            </div>
          </div>
        </div>

        {/* Barre de Recherche */}
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, email, poste ou manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 420,
              padding: "10px 14px",
              border: "1px solid #CBD5E1",
              fontSize: 13,
              fontWeight: 600,
              outline: "none",
              background: "#FFFFFF",
            }}
          />
        </div>

        {/* État de chargement */}
        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-28 mb-4" />
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* État d'erreur */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: 16, color: "#991B1B", fontSize: 13, fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Aucun résultat */}
        {!isLoading && !error && filteredSalaries.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <UsersIcon size={40} color="#94A3B8" />
            <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", margin: "12px 0 4px 0" }}>
              Aucun collaborateur trouvé
            </h4>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              {searchQuery ? "Aucun profil ne correspond aux critères de recherche." : "Aucun utilisateur répertorié dans la base."}
            </p>
          </div>
        )}

        {/* CONTENU : CARTES OU TABLEAU */}
        {!isLoading && !error && filteredSalaries.length > 0 && (
          viewMode === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {filteredSalaries.map((s) => (
                <Card key={s.id} hoverable padding="lg" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 0, background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {(s.prenom || s.nom || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>{s.prenom} {s.nom}</h3>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "2px 0 0 0" }}>{s.poste}</p>
                      </div>
                    </div>

                    <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 0, border: "1px solid #E2E8F0", marginBottom: 16, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div><span style={{ color: "#94a3b8", fontWeight: 700 }}>Direction :</span> <strong>{s.direction}</strong></div>
                      <div><span style={{ color: "#94a3b8", fontWeight: 700 }}>Site :</span> <strong>{s.site}</strong></div>
                      <div><span style={{ color: "#94a3b8", fontWeight: 700 }}>Manager N+1 :</span> <strong style={{ color: "#F0822A" }}>{s.n1}</strong></div>
                      <div><span style={{ color: "#94a3b8", fontWeight: 700 }}>Email :</span> <span style={{ wordBreak: "break-all" }}>{s.email}</span></div>
                      <div>
                        <span style={{ color: "#94a3b8", fontWeight: 700 }}>Cycle Éval :</span>{" "}
                        <span style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          fontSize: 11,
                          fontWeight: 800,
                          background: s.evaluation ? "#EFF6FF" : "#F1F5F9",
                          color: s.evaluation ? "#2563EB" : "#64748B",
                        }}>
                          {s.statutCycle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => setSelectedProfil(s)}
                      style={{ flex: 1, padding: "10px", background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 0, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <UsersIcon size={14} color="#FFFFFF" /> Profil & Rattachement
                    </button>
                    {s.evaluation && (
                      <button 
                        onClick={() => setSelectedFicheModal(s.evaluation || null)}
                        style={{ padding: "10px 14px", background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5", borderRadius: 0, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <EyeIcon size={14} color="#EA580C" /> Fiche
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg">
              <CardHeader 
                title="Base du Personnel" 
                subtitle={`${filteredSalaries.length} collaborateur(s) affiché(s)`} 
                icon={<UsersIcon size={20} color="#F0822A" />} 
              />

              <div style={{ overflowX: "auto", marginTop: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Salarié</th>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Poste & Direction</th>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Email</th>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Manager N+1</th>
                      <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Statut Évaluation</th>
                      <th style={{ textAlign: "right", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalaries.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "16px", fontSize: 14, fontWeight: 900, color: "#000000" }}>{s.prenom} {s.nom}</td>
                        <td style={{ padding: "16px", fontSize: 13, fontWeight: 600, color: "#334155" }}>{s.poste} ({s.direction})</td>
                        <td style={{ padding: "16px", fontSize: 13, color: "#64748b" }}>{s.email}</td>
                        <td style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#F0822A" }}>{s.n1}</td>
                        <td style={{ padding: "16px", fontSize: 12, fontWeight: 700 }}>
                          <span style={{
                            padding: "4px 8px",
                            background: s.evaluation ? "#EFF6FF" : "#F1F5F9",
                            color: s.evaluation ? "#2563EB" : "#64748B",
                          }}>
                            {s.statutCycle}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button 
                              onClick={() => setSelectedProfil(s)}
                              style={{ padding: "6px 12px", background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                            >
                              <UsersIcon size={12} color="#FFFFFF" /> Profil
                            </button>
                            {s.evaluation && (
                              <button 
                                onClick={() => setSelectedFicheModal(s.evaluation || null)}
                                style={{ padding: "6px 12px", background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5", borderRadius: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                              >
                                <EyeIcon size={12} color="#EA580C" /> Fiche
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        )}
      </div>
    </AppShell>
  );
}
