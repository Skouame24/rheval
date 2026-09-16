// ============================================================
// app/dashboard/n1/collaborateurs/page.tsx
// Page "Mes Collaborateurs" N+1 (Soft UI Inline CSS avec Modal de Fixation des Objectifs)
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { ModalDefinirObjectifs } from "@/features/evaluation/components/ModalDefinirObjectifs";
import { useMyTeam } from "@/lib/hooks/useTeam";
import type { User } from "@/types";

// TEAM data supprimée — remplacée par useMyTeam()

export default function CollaborateursN1Page() {
  const [selectedCollab, setSelectedCollab] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, error, search } = useMyTeam();

  const filteredTeam = search(searchQuery);

  return (
    <AppShell role="N1" userName="Sevan AKOUMIA" userEmail="sevan.akoumia@agilly.com" notifCount={2}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        {selectedCollab && (
          <ModalDefinirObjectifs
            isOpen={true}
            onClose={() => setSelectedCollab(null)}
            salariedName={`${selectedCollab.prenom} ${selectedCollab.nom}`}
            salariedPoste={selectedCollab.poste}
          />
        )}

        {isLoading && (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ width: 36, height: 36, border: "4px solid #F0822A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 14 }}>Chargement de l'équipe…</p>
          </div>
        )}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: 16 }}>
            <p style={{ color: "#B91C1C", fontWeight: 700, margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        <PageHeader
          title="Mes Collaborateurs Directs"
          subtitle="Définissez et gérez les objectifs de performance de votre équipe"
          breadcrumbs={[{ label: "Espace N+1" }, { label: "Collaborateurs" }]}
        />

        <Card padding="lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
            <CardHeader title="Liste des Collaborateurs" subtitle={`${filteredTeam.length} salariés rattachés à Sevan AKOUMIA`} icon="👥" />
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Rechercher (Nom, prénom, poste)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-sm focus:border-agilly-primary focus:outline-none focus:ring-1 focus:ring-agilly-primary transition-colors"
              />
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
            {filteredTeam.map((member: User) => (
              <div
                key={member.id}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F0822A", color: "#FFFFFF", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {member.prenom.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 900, color: "#000000", margin: 0 }}>{member.prenom} {member.nom}</h4>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#F0822A", margin: "2px 0 0 0" }}>{member.poste}</p>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>✉️ {member.email}</p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>📅 Dept : {member.departement}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5" }}>
                    {member.role}
                  </span>
                  <button
                    onClick={() => setSelectedCollab(member)}
                    style={{ padding: "8px 14px", background: "#F0822A", color: "#FFFFFF", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 12px rgba(240,130,42,0.2)" }}
                  >
                    🎯 Fixer les Objectifs
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
