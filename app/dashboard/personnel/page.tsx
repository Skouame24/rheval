// ============================================================
// app/dashboard/rh/salaries/page.tsx
// Page "Gestion des Salariés" RH (Soft UI + Vector SVG Icons)
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { GridIcon, ListIcon, PencilIcon, EyeIcon, UsersIcon } from "@/components/ui/Icons";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalProfilEmploye } from "@/features/dashboard/components/ModalProfilEmploye";

const SALARIES = [
  { id: "1", nom: "KOUAME", prenom: "Ebenezer Samuel", poste: "Développeur Full-Stack (IA)", direction: "Executive", site: "Abidjan AGILLY 1", n1: "Sevan AKOUMIA", email: "e.kouame@agilly.com", matricule: "EMP-2026-001", telephone: "+225 07 01 02 03 04", statutCycle: "Saisie N+1 Terminée", noteActuelle: "18.5" },
  { id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", direction: "Executive", site: "Abidjan AGILLY 1", n1: "Sevan AKOUMIA", email: "m.kone@agilly.com", matricule: "EMP-2026-002", telephone: "+225 07 05 06 07 08", statutCycle: "Arbitrage RH Ouvert", noteActuelle: "15.75" },
  { id: "3", nom: "Bah", prenom: "Oumar", poste: "Développeur Mobile", direction: "Technique", site: "Abidjan AGILLY 1", n1: "Sevan AKOUMIA", email: "o.bah@agilly.com", matricule: "EMP-2026-003", telephone: "+225 07 09 10 11 12", statutCycle: "Validé & Clôturé", noteActuelle: "15.0" },
  { id: "4", nom: "Camara", prenom: "Aissatou", poste: "QA Engineer", direction: "Technique", site: "Abidjan AGILLY 1", n1: "Sevan AKOUMIA", email: "a.camara@agilly.com", matricule: "EMP-2026-004", telephone: "+225 07 13 14 15 16", statutCycle: "Validé & Clôturé", noteActuelle: "14.5" },
  { id: "5", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", direction: "Infrastructure", site: "Abidjan AGILLY 1", n1: "Sevan AKOUMIA", email: "m.sylla@agilly.com", matricule: "EMP-2026-005", telephone: "+225 07 17 18 19 20", statutCycle: "Validé & Clôturé", noteActuelle: "17.0" },
];

export default function SalariesRhPage() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedFicheModal, setSelectedFicheModal] = useState<string | null>(null);
  const [selectedProfilId, setSelectedProfilId] = useState<string | null>(null);

  const selectedProfil = SALARIES.find(s => s.id === selectedProfilId);

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        {/* Modal Fiche Officielle Evaluation */}
        <FicheEvaluationModal 
          isOpen={selectedFicheModal !== null} 
          onClose={() => setSelectedFicheModal(null)} 
          dossier={SALARIES.find(d => d.id === selectedFicheModal)}
          readOnly={true}
        />

        {/* Modal Profil Individuel Salarié */}
        <ModalProfilEmploye
          isOpen={selectedProfilId !== null}
          onClose={() => setSelectedProfilId(null)}
          employe={selectedProfil}
          onOpenFiche={(id) => setSelectedFicheModal(id)}
        />

        {/* Header avec switch de vue flexible */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <PageHeader
            title="Répertoire des Salariés"
            subtitle="Gestion du personnel et rattachements hiérarchiques (N+1 / N+2)"
            breadcrumbs={[{ label: "Espace RH" }, { label: "Salariés" }]}
          />

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

        {/* CONTENU FLEXIBLE : CARTES OU TABLEAU */}
        {viewMode === "cards" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {SALARIES.map((s) => (
              <Card key={s.id} hoverable padding="lg" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 0, background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.prenom.charAt(0)}
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
                    <div><span style={{ color: "#94a3b8", fontWeight: 700 }}>Email :</span> <span>{s.email}</span></div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button 
                    onClick={() => setSelectedProfilId(s.id)}
                    style={{ flex: 1, padding: "10px", background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 0, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <UsersIcon size={14} color="#FFFFFF" /> Détails de l'employé
                  </button>
                  <button 
                    onClick={() => setSelectedFicheModal(s.id)}
                    style={{ padding: "10px 14px", background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5", borderRadius: 0, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <EyeIcon size={14} color="#EA580C" /> Fiche
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg">
            <CardHeader title="Base du Personnel" subtitle="5 salariés répertoriés — Cliquer sur Détails pour voir la fiche profil" icon={<UsersIcon size={20} color="#F0822A" />} />

            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Salarié</th>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Poste & Direction</th>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Site</th>
                    <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Manager N+1</th>
                    <th style={{ textAlign: "right", padding: "14px 16px", fontSize: 12, fontWeight: 800, color: "#475569" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {SALARIES.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "16px", fontSize: 14, fontWeight: 900, color: "#000000" }}>{s.prenom} {s.nom}</td>
                      <td style={{ padding: "16px", fontSize: 13, fontWeight: 600, color: "#334155" }}>{s.poste} ({s.direction})</td>
                      <td style={{ padding: "16px", fontSize: 13, color: "#64748b" }}>{s.site}</td>
                      <td style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#F0822A" }}>{s.n1}</td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <button 
                            onClick={() => setSelectedProfilId(s.id)}
                            style={{ padding: "6px 12px", background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <UsersIcon size={12} color="#FFFFFF" /> Détails de l'employé
                          </button>
                          <button 
                            onClick={() => setSelectedFicheModal(s.id)}
                            style={{ padding: "6px 12px", background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5", borderRadius: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <EyeIcon size={12} color="#EA580C" /> Fiche
                          </button>
                        </div>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

