// ============================================================
// app/absences/page.tsx
// Application Officielle AGILLY ABSENCES & CONGÉS (Portail SSO)
// Respect strict de la charte graphique et du workflow BPMN
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

  // ── ÉTAT DU PERSONA CONNECTÉ (Switchable en direct) ──
  const [currentPersona, setCurrentPersona] = useState<PersonaUser>(MOCK_PERSONAS[0]);

  // Synchronisation avec la session SSO du portail
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

  // 1. Soumission d'une nouvelle demande
  const handleCreateDemande = (nouvelle: DemandeRHItem) => {
    setDemandes((prev) => [nouvelle, ...prev]);
    setMainNav("DEMANDES");
  };

  // 2. Approbation (Validation OK)
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
          // Si permission courte <= 2j, court-circuitage direct vers APPROUVEE (RG-01)
          if (d.typeDemande === "PERMISSION_ABSENCE" && d.nombreJoursOuvres <= 2) {
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

  // 3. Refus avec retour N-1 (Non OK avec motif obligatoire)
  const handleRejectReturn = (demandeId: string, motifObligatoire: string) => {
    setDemandes((prev) =>
      prev.map((d) => {
        if (d.id !== demandeId) return d;

        let nextStatut = d.statut;
        let nextEtape = d.etapeCourante;

        // Cascade de retour : DG -> DRH, DRH -> N+1, N+1 -> Salarié
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

  // 4. Refus définitif (après plafond des 2 cycles)
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

  // 5. Édition et Archivage GED de la Permission par l'Agent DRH
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

    // Ouvrir immédiatement l'aperçu du document généré
    setSelectedDemandeForPermission({
      ...demande,
      statut: "ARCHIVEE",
      documentPermission: updatedDoc,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans antialiased text-slate-900 flex flex-col">
      {/* ── EN-TÊTE PRINCIPAL ── */}
      <AbsencesHeader
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        pendingCountForCurrentRole={pendingCountForCurrentRole}
        onOpenNewDemande={() => setIsNewDemandeOpen(true)}
      />

      {/* ── BARRE DE NAVIGATION MODULAIRE (ONGLETS PRINCIPAUX) ── */}
      <nav className="bg-white border-b border-slate-200 px-4 md:px-8 shadow-xs select-none sticky top-[88px] z-20">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "DASHBOARD", label: "Vue Globale & Statistiques" },
            { id: "DEMANDES", label: "Registre des Demandes RH", count: demandes.length },
            { id: "SOLDES", label: "Mes Droits & Soldes Congés" },
            { id: "PLANNING", label: "Planning d'Équipe (Quorums)" },
            { id: "GED", label: "Archives GED des Permissions", count: demandes.filter((d) => d.documentPermission).length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMainNav(item.id as any)}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                mainNav === item.id
                  ? "border-b-[#F0822A] text-slate-900 bg-orange-50/20"
                  : "border-b-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 ${
                    mainNav === item.id
                      ? "bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CONTENU PRINCIPAL PAR ONGLET ── */}
      <main className="flex-1 p-4 md:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        
        {/* ONGLET 1 : TABLEAU DE BORD & KPIS */}
        {mainNav === "DASHBOARD" && (
          <div className="space-y-6">
            <StatistiquesAbsencesCharts
              totalDemandesEnCours={demandes.filter((d) => d.statut.startsWith("EN_VALIDATION")).length}
              totalApprouvees={demandes.filter((d) => ["APPROUVEE", "PERMISSION_EDITEE", "ARCHIVEE"].includes(d.statut)).length}
              totalArchives={demandes.filter((d) => d.documentPermission).length}
            />

            {/* Aperçu rapide des demandes nécessitant attention */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Dernières Activités sur le Circuit de Validation
                </h3>
                <button
                  onClick={() => setMainNav("DEMANDES")}
                  className="text-xs font-bold text-[#F0822A] hover:underline"
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

        {/* ONGLET 2 : REGISTRE COMPLET DES DEMANDES */}
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

      {/* 3. Modal Visualiseur Permission Officielle */}
      <PermissionViewerModal
        isOpen={selectedDemandeForPermission !== null}
        onClose={() => setSelectedDemandeForPermission(null)}
        demande={selectedDemandeForPermission}
      />

      {/* ── FOOTER OFFICIEL AGILLY ── */}
      <footer className="bg-white border-t border-slate-200 py-5 px-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-auto select-none">
        AGILLY GROUP © {new Date().getFullYear()} — MODULE ABSENCES & CONGÉS DU PORTAIL ENTREPRISE SSO
      </footer>
    </div>
  );
}

