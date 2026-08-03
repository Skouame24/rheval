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

const TEAM = [
  { id: "1", nom: "KOUAME", prenom: "Ebenezer Samuel", poste: "Développeur Full-Stack", email: "ebenezer.kouame@agilly.com", dateEntree: "15 mars 2024", statut: "En cours" },
  { id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", email: "mariam.kone@agilly.com", dateEntree: "01 juin 2023", statut: "En cours" },
  { id: "3", nom: "Bah", prenom: "Oumar", poste: "Développeur Mobile", email: "oumar.bah@agilly.com", dateEntree: "10 janv. 2025", statut: "Transmis N+2" },
  { id: "4", nom: "Camara", prenom: "Aissatou", poste: "QA Engineer", email: "aissatou.camara@agilly.com", dateEntree: "01 sept. 2022", statut: "Transmis RH" },
  { id: "5", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", email: "mamadou.sylla@agilly.com", dateEntree: "12 nov. 2021", statut: "Validé" },
];

export default function CollaborateursN1Page() {
  const [selectedCollab, setSelectedCollab] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeam = TEAM.filter(member => 
    member.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.poste.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
            {filteredTeam.map((member) => (
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
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>📅 Entrée : {member.dateEntree}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5" }}>
                    {member.statut}
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
