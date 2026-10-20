// ============================================================
// features/absences/context/AbsencesContext.tsx
// Contexte d'état global pour le module Absences & Missions Agilly
// Permet la réactivité complète entre Sidebar, Topbar et les vues
// ============================================================

"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  DemandeRHItem,
  SoldeCongesInfo,
  KPIOverview,
  StatistiqueServiceAbsence,
  RoleActeurRH,
  EtapeValidationRH,
  StatutDemandeRH,
} from "@/types/absences.types";
import {
  MOCK_PERSONAS,
  PersonaUser,
  INITIAL_DEMANDES,
  MOCK_SOLDE_CONGES,
  MOCK_KPIS,
  MOCK_STATS_SERVICES,
  MOCK_REPARTITION_TYPES,
} from "@/lib/mock/absences.mock";
import { useAuth } from "@/contexts/AuthContext";

interface AbsencesContextType {
  // Persona actif & Démo
  currentPersona: PersonaUser;
  setCurrentPersona: (persona: PersonaUser) => void;
  allPersonas: PersonaUser[];
  isDemoDrawerOpen: boolean;
  setIsDemoDrawerOpen: (open: boolean) => void;

  // Données
  demandes: DemandeRHItem[];
  soldeConges: SoldeCongesInfo;
  kpis: KPIOverview;
  statsServices: StatistiqueServiceAbsence[];
  repartitionTypes: typeof MOCK_REPARTITION_TYPES;

  // Filtre / Recherche globale
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Compteurs & Filtrages calculés
  pendingValidationsCount: number;
  myDemandes: DemandeRHItem[];
  pendingForCurrentRoleDemandes: DemandeRHItem[];

  // Actions de workflow
  addDemande: (newDemande: Partial<DemandeRHItem>) => DemandeRHItem;
  validerDemande: (id: string, motif?: string) => void;
  refuserDemande: (id: string, motif: string) => void;
  editerPermission: (id: string) => void;
  archiverDemande: (id: string) => void;
  annulerDemande: (id: string) => void;
}

const AbsencesContext = createContext<AbsencesContextType | undefined>(undefined);

export function AbsencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Persona actif (par défaut : Ebenezer Samuel KOUAME - Salarié DSI)
  const [currentPersona, setCurrentPersona] = useState<PersonaUser>(MOCK_PERSONAS[0]);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Synchronisation avec l'utilisateur authentifié si présent
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

  // Données réactives
  const [demandes, setDemandes] = useState<DemandeRHItem[]>(INITIAL_DEMANDES);
  const [soldeConges, setSoldeConges] = useState<SoldeCongesInfo>(MOCK_SOLDE_CONGES);
  const [kpis] = useState<KPIOverview>(MOCK_KPIS);
  const [statsServices] = useState<StatistiqueServiceAbsence[]>(MOCK_STATS_SERVICES);

  // Demandes déposées par le collaborateur actif (Ebenezer ou le persona en cours)
  const myDemandes = useMemo(() => {
    return demandes.filter(
      (d) =>
        d.demandeur.id === currentPersona.id ||
        d.demandeur.matricule === currentPersona.matricule ||
        d.demandeur.email === currentPersona.email
    );
  }, [demandes, currentPersona]);

  // Demandes en attente d'arbitrage selon le rôle actif
  const pendingForCurrentRoleDemandes = useMemo(() => {
    switch (currentPersona.role) {
      case "SUPERIEUR_N1":
        return demandes.filter((d) => d.statut === "EN_VALIDATION_N1");
      case "DRH":
        return demandes.filter((d) => d.statut === "EN_VALIDATION_DRH");
      case "DIRECTION_DG":
        return demandes.filter((d) => d.statut === "EN_VALIDATION_DG");
      case "AGENT_DRH":
        return demandes.filter(
          (d) => d.statut === "APPROUVEE" || d.statut === "PERMISSION_EDITEE"
        );
      case "ADMIN":
        return demandes.filter((d) =>
          ["EN_VALIDATION_N1", "EN_VALIDATION_DRH", "EN_VALIDATION_DG"].includes(d.statut)
        );
      default:
        return [];
    }
  }, [demandes, currentPersona.role]);

  const pendingValidationsCount = pendingForCurrentRoleDemandes.length;

  // Création d'une nouvelle demande
  const addDemande = (payload: Partial<DemandeRHItem>): DemandeRHItem => {
    const nextNum = demandes.length + 143;
    const codeRef = `DEM-2026-00${nextNum}`;
    const nowIso = new Date().toISOString();

    const created: DemandeRHItem = {
      id: `dem-${Date.now()}`,
      codeReference: codeRef,
      typeDemande: payload.typeDemande || "CONGES_ANNUELS",
      libelleType: payload.libelleType || "Congés Annuels",
      statut: "EN_VALIDATION_N1",
      etapeCourante: "SUPERIEUR_N1",
      demandeur: payload.demandeur || {
        id: currentPersona.id,
        matricule: currentPersona.matricule,
        nom: currentPersona.nom,
        prenom: currentPersona.prenom,
        email: currentPersona.email,
        poste: currentPersona.poste,
        departement: currentPersona.departement,
        service: currentPersona.service,
        telephone: "+225 07 48 92 11 00",
        numeroCnss: currentPersona.numeroCnss,
      },
      dateDebut: payload.dateDebut || "2026-11-10",
      dateFin: payload.dateFin || "2026-11-13",
      estDemiJourneeDebut: payload.estDemiJourneeDebut || false,
      estDemiJourneeFin: payload.estDemiJourneeFin || false,
      nombreJoursOuvres: payload.nombreJoursOuvres || 4,
      nombreJoursCalendaires: payload.nombreJoursCalendaires || 4,
      motif: payload.motif || "",
      adresseContactPendantAbsence: payload.adresseContactPendantAbsence || "",
      destination: payload.destination,
      moyenTransport: payload.moyenTransport,
      fraisPrevisionnels: payload.fraisPrevisionnels,
      cycleRetoursCount: 0,
      alertesQuorumService: "Quorum DSI respecté",
      piecesJointes: payload.piecesJointes || [],
      historique: [
        {
          id: `hist-${Date.now()}`,
          etape: "SUPERIEUR_N1",
          libelleEtape: "Dépôt de la demande",
          acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
          acteurPoste: currentPersona.poste,
          acteurRole: currentPersona.role,
          decision: "VALIDE",
          motif: "Formulaire renseigné et transmis pour validation N+1.",
          dateAction: nowIso,
        },
      ],
      dateCreation: nowIso,
      dateDerniereAction: nowIso,
    };

    setDemandes((prev) => [created, ...prev]);

    // Décompte prévisionnel du solde de congés si c'est du congé annuel
    if (payload.typeDemande === "CONGES_ANNUELS") {
      setSoldeConges((prev) => ({
        ...prev,
        joursEnAttente: prev.joursEnAttente + (payload.nombreJoursOuvres || 4),
        joursRestants: Math.max(0, prev.joursRestants - (payload.nombreJoursOuvres || 4)),
      }));
    }

    return created;
  };

  // Validation hiérarchique selon le circuit à 3 niveaux
  const validerDemande = (id: string, motif?: string) => {
    const nowIso = new Date().toISOString();

    setDemandes((prev) =>
      prev.map((dem) => {
        if (dem.id !== id) return dem;

        let nextStatut: StatutDemandeRH = dem.statut;
        let nextEtape: EtapeValidationRH = dem.etapeCourante;

        // Circuit nominal : N+1 -> DRH -> DG -> APPROUVÉE
        // Circuit court (RG-01) : si permission <= 2 jours et type permission, DRH valide directement
        if (dem.statut === "EN_VALIDATION_N1") {
          nextStatut = "EN_VALIDATION_DRH";
          nextEtape = "DRH";
        } else if (dem.statut === "EN_VALIDATION_DRH") {
          const isCourt =
            dem.nombreJoursOuvres <= 2 &&
            (dem.typeDemande === "PERMISSION_EXCEPTIONNELLE" || dem.typeDemande === "RECUPERATION");
          if (isCourt) {
            nextStatut = "APPROUVEE";
            nextEtape = "AGENT_DRH";
          } else {
            nextStatut = "EN_VALIDATION_DG";
            nextEtape = "DIRECTION_DG";
          }
        } else if (dem.statut === "EN_VALIDATION_DG") {
          nextStatut = "APPROUVEE";
          nextEtape = "AGENT_DRH";
        }

        const newHist = [
          ...dem.historique,
          {
            id: `hist-${Date.now()}`,
            etape: dem.etapeCourante,
            libelleEtape: `Avis favorable (${currentPersona.labelRole})`,
            acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
            acteurPoste: currentPersona.poste,
            acteurRole: currentPersona.role,
            decision: "VALIDE" as const,
            motif: motif || "Demande approuvée sans réserve.",
            dateAction: nowIso,
          },
        ];

        return {
          ...dem,
          statut: nextStatut,
          etapeCourante: nextEtape,
          historique: newHist,
          dateDerniereAction: nowIso,
        };
      })
    );
  };

  // Refus avec motif obligatoire et retour à l'étape précédente (§3.2)
  const refuserDemande = (id: string, motif: string) => {
    const nowIso = new Date().toISOString();

    setDemandes((prev) =>
      prev.map((dem) => {
        if (dem.id !== id) return dem;

        const nextCycleCount = dem.cycleRetoursCount + 1;
        let nextStatut: StatutDemandeRH = dem.statut;
        let nextEtape: EtapeValidationRH = dem.etapeCourante;

        // Si le plafond de 2 retours est atteint -> Refus définitif
        if (nextCycleCount >= 2) {
          nextStatut = "REFUSEE_DEFINITIVEMENT";
          nextEtape = "CLOTURE";
        } else {
          // Règles de retour §3.2 :
          // N+1 -> Employé
          // DRH -> N+1
          // DG -> DRH
          if (dem.statut === "EN_VALIDATION_N1") {
            nextStatut = "RETOURNEE_EMPLOYE";
            nextEtape = "SUPERIEUR_N1";
          } else if (dem.statut === "EN_VALIDATION_DRH") {
            nextStatut = "EN_VALIDATION_N1";
            nextEtape = "SUPERIEUR_N1";
          } else if (dem.statut === "EN_VALIDATION_DG") {
            nextStatut = "EN_VALIDATION_DRH";
            nextEtape = "DRH";
          }
        }

        const newHist = [
          ...dem.historique,
          {
            id: `hist-${Date.now()}`,
            etape: dem.etapeCourante,
            libelleEtape:
              nextStatut === "REFUSEE_DEFINITIVEMENT"
                ? "Refus Définitif"
                : `Demande de révision (${currentPersona.labelRole})`,
            acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
            acteurPoste: currentPersona.poste,
            acteurRole: currentPersona.role,
            decision:
              nextStatut === "REFUSEE_DEFINITIVEMENT"
                ? ("REFUSE_DEFINITIF" as const)
                : ("REFUSE_RETOUR" as const),
            motif: motif,
            dateAction: nowIso,
          },
        ];

        return {
          ...dem,
          statut: nextStatut,
          etapeCourante: nextEtape,
          cycleRetoursCount: nextCycleCount,
          historique: newHist,
          dateDerniereAction: nowIso,
        };
      })
    );
  };

  // Édition de la permission PDF numérotée (Agent DRH)
  const editerPermission = (id: string) => {
    const nowIso = new Date().toISOString();
    const permNum = `AGY-PERM-2026-000${Math.floor(Math.random() * 80) + 20}`;

    setDemandes((prev) =>
      prev.map((dem) => {
        if (dem.id !== id) return dem;

        return {
          ...dem,
          statut: "PERMISSION_EDITEE",
          etapeCourante: "AGENT_DRH",
          documentPermission: {
            numeroUnique: permNum,
            qrCodeUrl: `/api/qr?data=${permNum}`,
            tokenVerification: `TOK-${Date.now().toString(36).toUpperCase()}`,
            dateEmission: nowIso,
            emetteurAgentNom: `${currentPersona.prenom} ${currentPersona.nom}`,
            emetteurAgentMatricule: currentPersona.matricule,
            cachetOfficiel: true,
            signatureElectronique: true,
            hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            dureeConservationAnnees: 10,
            balanceCongesPayesSolde: 10.5,
          },
          historique: [
            ...dem.historique,
            {
              id: `hist-${Date.now()}`,
              etape: "AGENT_DRH",
              libelleEtape: "Édition du Bulletin Officiel de Permission",
              acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
              acteurPoste: currentPersona.poste,
              acteurRole: "AGENT_DRH",
              decision: "EDITE",
              motif: `Bulletin individuel généré et numéroté ${permNum}`,
              dateAction: nowIso,
            },
          ],
          dateDerniereAction: nowIso,
        };
      })
    );
  };

  // Archivage GED (Agent DRH)
  const archiverDemande = (id: string) => {
    const nowIso = new Date().toISOString();

    setDemandes((prev) =>
      prev.map((dem) => {
        if (dem.id !== id) return dem;

        return {
          ...dem,
          statut: "ARCHIVEE",
          etapeCourante: "CLOTURE",
          historique: [
            ...dem.historique,
            {
              id: `hist-${Date.now()}`,
              etape: "CLOTURE",
              libelleEtape: "Archivage GED Sécurisé",
              acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
              acteurPoste: currentPersona.poste,
              acteurRole: "AGENT_DRH",
              decision: "ARCHIVE",
              motif: "Document classé dans le registre numérique GED (Conservation 10 ans).",
              dateAction: nowIso,
            },
          ],
          dateDerniereAction: nowIso,
        };
      })
    );
  };

  // Annulation par l'employé tant que la demande n'est pas encore validée
  const annulerDemande = (id: string) => {
    const nowIso = new Date().toISOString();

    setDemandes((prev) =>
      prev.map((dem) => {
        if (dem.id !== id) return dem;

        return {
          ...dem,
          statut: "ANNULEE",
          etapeCourante: "CLOTURE",
          historique: [
            ...dem.historique,
            {
              id: `hist-${Date.now()}`,
              etape: "CLOTURE",
              libelleEtape: "Annulation par le demandeur",
              acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
              acteurPoste: currentPersona.poste,
              acteurRole: "SALARIE",
              decision: "REFUSE_DEFINITIF",
              motif: "Annulation volontaire de la demande avant décision finale.",
              dateAction: nowIso,
            },
          ],
          dateDerniereAction: nowIso,
        };
      })
    );
  };

  return (
    <AbsencesContext.Provider
      value={{
        currentPersona,
        setCurrentPersona,
        allPersonas: MOCK_PERSONAS,
        isDemoDrawerOpen,
        setIsDemoDrawerOpen,
        demandes,
        soldeConges,
        kpis,
        statsServices,
        repartitionTypes: MOCK_REPARTITION_TYPES,
        searchQuery,
        setSearchQuery,
        pendingValidationsCount,
        myDemandes,
        pendingForCurrentRoleDemandes,
        addDemande,
        validerDemande,
        refuserDemande,
        editerPermission,
        archiverDemande,
        annulerDemande,
      }}
    >
      {children}
    </AbsencesContext.Provider>
  );
}

export function useAbsences() {
  const context = useContext(AbsencesContext);
  if (!context) {
    throw new Error("useAbsences doit être utilisé au sein d'un AbsencesProvider");
  }
  return context;
}
