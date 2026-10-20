// ============================================================
// app/absences/page.tsx
// Application Officielle AGILLY ABSENCES & CONGÉS (Portail SSO)
// Refonte Visuelle Propre, Moderne & Structurée — Clean Design
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MOCK_PERSONAS,
  INITIAL_DEMANDES,
  MOCK_SOLDE_CONGES,
  PersonaUser,
} from "@/lib/mock/absences.mock";
import { DemandeRHItem } from "@/types/absences.types";
import { AbsencesHeader } from "@/features/absences/components/AbsencesHeader";
import { StatistiquesAbsencesCharts } from "@/features/absences/components/StatistiquesAbsencesCharts";
import { SoldesCongesCard } from "@/features/absences/components/SoldesCongesCard";
import { DemandesListTable } from "@/features/absences/components/DemandesListTable";
import { NouvelleDemandeModal } from "@/features/absences/components/NouvelleDemandeModal";
import { ValidationModal } from "@/features/absences/components/ValidationModal";
import { PermissionViewerModal } from "@/features/absences/components/PermissionViewerModal";
import { PlanningEquipeView } from "@/features/absences/components/PlanningEquipeView";
import { ArchivesGedView } from "@/features/absences/components/ArchivesGedView";

export default function AbsencesPage() {
  const { user } = useAuth();

  // ── ÉTAT DU PERSONA CONNECTÉ ──
  const [currentPersona, setCurrentPersona] = useState<PersonaUser>(MOCK_PERSONAS[0]);

  // Synchronisation avec la session utilisateur
  useEffect(() => {
    if (user) {
      setCurrentPersona((prev) => ({
        ...prev,
        nom: user.nom || prev.nom,
        prenom: user.prenom || prev.prenom,
        email: user.email || prev.email,
        poste: user.poste || prev.poste,
        departement: user.departement || prev.departement,
      }));
    }
  }, [user]);

  // ── LISTE RÉACTIVE DES DEMANDES RH ──
  const [demandes, setDemandes] = useState<DemandeRHItem[]>(INITIAL_DEMANDES);

  // ── ONGLETS DE NAVIGATION DANS L'APPLICATION ──
  const [mainNav, setMainNav] = useState<"DASHBOARD" | "DEMANDES" | "SOLDES" | "PLANNING" | "GED">("DASHBOARD");

  // ── MODALES ACTIVES ──
  const [isNewDemandeOpen, setIsNewDemandeOpen] = useState(false);
  const [selectedDemandeForDetail, setSelectedDemandeForDetail] = useState<DemandeRHItem | null>(null);
  const [selectedDemandeForValidation, setSelectedDemandeForValidation] = useState<DemandeRHItem | null>(null);
  const [selectedDemandeForPermission, setSelectedDemandeForPermission] = useState<DemandeRHItem | null>(null);

  // Compteur des demandes attendant l'action du rôle connecté
  const pendingCountForCurrentRole = demandes.filter((d) => {
    if (currentPersona.role === "SUPERIEUR_N1" && d.statut === "EN_VALIDATION_N1") return true;
    if (currentPersona.role === "DRH" && d.statut === "EN_VALIDATION_DRH") return true;
    if (currentPersona.role === "DIRECTION_DG" && d.statut === "EN_VALIDATION_DG") return true;
    if (currentPersona.role === "AGENT_DRH" && d.statut === "APPROUVEE") return true;
    return false;
  }).length;

  // ── ACTIONS SUR LE WORKFLOW ──

  const handleCreateDemande = (nouvelle: DemandeRHItem) => {
    setDemandes((prev) => [nouvelle, ...prev]);
    setMainNav("DEMANDES");
  };

  const handleApproveDemande = (demandeId: string, observation?: string) => {
    setDemandes((prev) =>
      prev.map((d) => {
        if (d.id !== demandeId) return d;

        let nextStatut = d.statut;
        let nextEtape = d.etapeCourante;

        if (d.statut === "EN_VALIDATION_N1") {
          nextStatut = "EN_VALIDATION_DRH";
          nextEtape = "DRH";
        } else if (d.statut === "EN_VALIDATION_DRH") {
          if (d.typeDemande === "PERMISSION_EXCEPTIONNELLE" && d.nombreJoursOuvres <= 2) {
            nextStatut = "APPROUVEE";
            nextEtape = "AGENT_DRH";
          } else {
            nextStatut = "EN_VALIDATION_DG";
            nextEtape = "DIRECTION_DG";
          }
        } else if (d.statut === "EN_VALIDATION_DG") {
          nextStatut = "APPROUVEE";
          nextEtape = "AGENT_DRH";
        }

        const newHisto = {
          id: `hist-${Date.now()}`,
          etape: d.etapeCourante,
          libelleEtape: `Validation Accordée (${currentPersona.labelRole})`,
          acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
          acteurPoste: currentPersona.poste,
          acteurRole: currentPersona.role,
          decision: "VALIDE" as const,
          motif: observation || "Demande approuvée sans réserve.",
          dateAction: new Date().toISOString(),
        };

        return {
          ...d,
          statut: nextStatut,
          etapeCourante: nextEtape,
          historique: [...d.historique, newHisto],
          dateDerniereAction: new Date().toISOString(),
        };
      })
    );
  };

  const handleRejectReturn = (demandeId: string, motifObligatoire: string) => {
    setDemandes((prev) =>
      prev.map((d) => {
        if (d.id !== demandeId) return d;

        let nextStatut = d.statut;
        let nextEtape = d.etapeCourante;

        if (d.statut === "EN_VALIDATION_DG") {
          nextStatut = "EN_VALIDATION_DRH";
          nextEtape = "DRH";
        } else if (d.statut === "EN_VALIDATION_DRH") {
          nextStatut = "EN_VALIDATION_N1";
          nextEtape = "SUPERIEUR_N1";
        } else if (d.statut === "EN_VALIDATION_N1") {
          nextStatut = "RETOURNEE_EMPLOYE";
          nextEtape = "SUPERIEUR_N1";
        }

        const newHisto = {
          id: `hist-${Date.now()}`,
          etape: d.etapeCourante,
          libelleEtape: `Refus avec retour (${currentPersona.labelRole})`,
          acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
          acteurPoste: currentPersona.poste,
          acteurRole: currentPersona.role,
          decision: "REFUSE_RETOUR" as const,
          motif: motifObligatoire,
          dateAction: new Date().toISOString(),
        };

        return {
          ...d,
          statut: nextStatut,
          etapeCourante: nextEtape,
          cycleRetoursCount: d.cycleRetoursCount + 1,
          historique: [...d.historique, newHisto],
          dateDerniereAction: new Date().toISOString(),
        };
      })
    );
  };

  const handleRejectDefinitif = (demandeId: string, motif: string) => {
    setDemandes((prev) =>
      prev.map((d) => {
        if (d.id !== demandeId) return d;
        return {
          ...d,
          statut: "REFUSEE_DEFINITIVEMENT",
          cycleRetoursCount: d.cycleRetoursCount + 1,
          historique: [
            ...d.historique,
            {
              id: `hist-${Date.now()}`,
              etape: d.etapeCourante,
              libelleEtape: "Refus Définitif Clôturé",
              acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
              acteurPoste: currentPersona.poste,
              acteurRole: currentPersona.role,
              decision: "REFUSE_DEFINITIF" as const,
              motif: motif || "Plafond d'allers-retours atteint. Demande refusée définitivement.",
              dateAction: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const handleGeneratePermission = (demande: DemandeRHItem) => {
    const numGenere = `AGY-PERM-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const updatedDoc = {
      numeroUnique: numGenere,
      qrCodeUrl: `https://portal.agilly.com/verify/perm/${numGenere}`,
      tokenVerification: `tok-${Date.now()}`,
      dateEmission: new Date().toISOString(),
      emetteurAgentNom: `${currentPersona.prenom} ${currentPersona.nom}`,
      emetteurAgentMatricule: currentPersona.matricule,
      cachetOfficiel: true,
      signatureElectronique: true,
      hashSha256: "b4c2e817a992d4f8901235ecba99234851abcf18992384aedfc09812",
      dureeConservationAnnees: 5,
      balanceCongesPayesSolde: 14.5,
    };

    setDemandes((prev) =>
      prev.map((d) => {
        if (d.id !== demande.id) return d;
        return {
          ...d,
          statut: "ARCHIVEE",
          etapeCourante: "CLOTURE",
          documentPermission: updatedDoc,
          historique: [
            ...d.historique,
            {
              id: `hist-${Date.now()}`,
              etape: "AGENT_DRH",
              libelleEtape: "Édition Permission & Archivage GED",
              acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
              acteurPoste: currentPersona.poste,
              acteurRole: "AGENT_DRH" as const,
              decision: "ARCHIVE" as const,
              motif: `Permission générée sous la référence [${numGenere}] et scellée dans la GED.`,
              dateAction: new Date().toISOString(),
            },
          ],
        };
      })
    );

    setSelectedDemandeForPermission({
      ...demande,
      statut: "ARCHIVEE",
      documentPermission: updatedDoc,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900 flex flex-col">
      
      {/* ── EN-TÊTE ÉPURÉ ── */}
      <AbsencesHeader
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        pendingCountForCurrentRole={pendingCountForCurrentRole}
        onOpenNewDemande={() => setIsNewDemandeOpen(true)}
      />

      {/* ── BARRE DE NAVIGATION MODULAIRE SOIGNÉE ── */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-16 z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto h-12">
            {[
              { id: "DASHBOARD", label: "Vue d'ensemble" },
              { id: "DEMANDES", label: "Demandes RH", count: demandes.length },
              { id: "SOLDES", label: "Soldes de congés" },
              { id: "PLANNING", label: "Planning d'équipe" },
              { id: "GED", label: "Archives GED", count: demandes.filter((d) => d.documentPermission).length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setMainNav(item.id as any)}
                className={`flex items-center gap-2 h-full px-4 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  mainNav === item.id
                    ? "border-[#F0822A] text-[#F0822A]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      mainNav === item.id
                        ? "bg-orange-50 text-[#F0822A]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── CONTENU PRINCIPAL PAR ONGLET ── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        
        {/* ONGLET 1 : TABLEAU DE BORD & KPIS */}
        {mainNav === "DASHBOARD" && (
          <div className="space-y-6">
            <StatistiquesAbsencesCharts
              totalDemandesEnCours={demandes.filter((d) => d.statut.startsWith("EN_VALIDATION")).length}
              totalApprouvees={demandes.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)).length}
              totalArchives={demandes.filter((d) => d.documentPermission).length}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 m-0">
                  Dernières demandes en cours
                </h3>
                <button
                  onClick={() => setMainNav("DEMANDES")}
                  className="text-xs font-semibold text-[#F0822A] hover:underline"
                >
                  Voir toutes les demandes →
                </button>
              </div>
              <DemandesListTable
                demandes={demandes.slice(0, 4)}
                currentPersona={currentPersona}
                onSelectDemande={setSelectedDemandeForDetail}
                onOpenPermission={setSelectedDemandeForPermission}
                onValidateDirect={setSelectedDemandeForValidation}
              />
            </div>
          </div>
        )}

        {/* ONGLET 2 : DEMANDES */}
        {mainNav === "DEMANDES" && (
          <div className="space-y-6">
            <DemandesListTable
              demandes={demandes}
              currentPersona={currentPersona}
              onSelectDemande={setSelectedDemandeForDetail}
              onOpenPermission={setSelectedDemandeForPermission}
              onValidateDirect={setSelectedDemandeForValidation}
            />
          </div>
        )}

        {/* ONGLET 3 : SOLDES DE CONGÉS */}
        {mainNav === "SOLDES" && (
          <div className="space-y-6">
            <SoldesCongesCard
              solde={MOCK_SOLDE_CONGES}
              collaborateurNom={`${currentPersona.prenom} ${currentPersona.nom}`}
            />
          </div>
        )}

        {/* ONGLET 4 : PLANNING D'ÉQUIPE */}
        {mainNav === "PLANNING" && (
          <div className="space-y-6">
            <PlanningEquipeView />
          </div>
        )}

        {/* ONGLET 5 : ARCHIVES GED */}
        {mainNav === "GED" && (
          <div className="space-y-6">
            <ArchivesGedView
              demandes={demandes}
              onOpenPermission={setSelectedDemandeForPermission}
            />
          </div>
        )}

      </main>

      {/* ── MODALES INTERACTIVES ── */}

      {/* 1. Modal Nouvelle Demande */}
      <NouvelleDemandeModal
        isOpen={isNewDemandeOpen}
        onClose={() => setIsNewDemandeOpen(false)}
        currentPersona={currentPersona}
        onSubmit={handleCreateDemande}
      />

      {/* 2. Modal Validation & Examen */}
      <ValidationModal
        isOpen={selectedDemandeForValidation !== null || selectedDemandeForDetail !== null}
        onClose={() => {
          setSelectedDemandeForValidation(null);
          setSelectedDemandeForDetail(null);
        }}
        demande={selectedDemandeForValidation || selectedDemandeForDetail}
        currentPersona={currentPersona}
        onApprove={handleApproveDemande}
        onRejectReturn={handleRejectReturn}
        onRejectDefinitif={handleRejectDefinitif}
        onGeneratePermission={handleGeneratePermission}
      />

      {/* 3. Modal Permission Officielle */}
      <PermissionViewerModal
        isOpen={selectedDemandeForPermission !== null}
        onClose={() => setSelectedDemandeForPermission(null)}
        demande={selectedDemandeForPermission}
      />

      {/* ── PIED DE PAGE DISCRET ── */}
      <footer className="py-6 px-8 text-center text-xs text-slate-400 mt-auto border-t border-slate-200/60 bg-white">
        AGILLY GROUP © {new Date().getFullYear()} — Module Absences & Congés
      </footer>
    </div>
  );
}
