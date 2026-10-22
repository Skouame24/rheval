// ============================================================
// lib/api/demandes.api.ts
// Client API pour le module Absences, Congés & Ordres de Mission
// Connecté au backend NestJS modulaire et à la base dédiée
// ============================================================

import { client } from "./client";
import {
  DemandeRHItem,
  SoldeCongesInfo,
  TypeDemandeRH,
  StatutDemandeRH,
  EtapeValidationRH,
} from "@/types/absences.types";

export interface CreateDemandeInput {
  typeCode: string;
  dateDebut: string;
  dateFin: string;
  demiJourneeDebut?: boolean;
  demiJourneeFin?: boolean;
  motif: string;
  destination?: string;
  moyenTransport?: string;
  fraisEstimes?: number;
}

export interface DecisionValidationInput {
  decision: "APPROUVE" | "RETOURNE" | "REFUSE";
  motif?: string;
}

// Convertisseur type backend vers type frontend
function mapBackendTypeToFrontend(backendCode: string): TypeDemandeRH {
  switch (backendCode) {
    case "CONGE_ANNUEL":
      return "CONGES_ANNUELS";
    case "REPOS_MALADIE":
      return "CONGES_MALADIE";
    case "CONGE_EXCEPTIONNEL":
      return "PERMISSION_EXCEPTIONNELLE";
    case "ORDRE_MISSION":
      return "MISSION_DEPLACEMENT";
    case "INTERVENTION_TERRAIN":
      return "INTERVENTION_TERRAIN";
    case "PERMISSION_ABSENCE":
    default:
      return "PERMISSION_EXCEPTIONNELLE";
  }
}

// Convertisseur type frontend vers type backend
export function mapFrontendTypeToBackend(frontendType: string): string {
  switch (frontendType) {
    case "CONGES_ANNUELS":
      return "CONGE_ANNUEL";
    case "CONGES_MALADIE":
      return "REPOS_MALADIE";
    case "MISSION_DEPLACEMENT":
      return "ORDRE_MISSION";
    case "INTERVENTION_TERRAIN":
      return "INTERVENTION_TERRAIN";
    case "PERMISSION_EXCEPTIONNELLE":
    default:
      return "CONGE_EXCEPTIONNEL";
  }
}

// Convertisseur statut backend vers frontend
function mapBackendStatutToFrontend(status: string): StatutDemandeRH {
  switch (status) {
    case "BROUILLON":
      return "BROUILLON";
    case "EN_ATTENTE_N1":
      return "EN_VALIDATION_N1";
    case "EN_ATTENTE_DRH":
      return "EN_VALIDATION_DRH";
    case "EN_ATTENTE_DG":
      return "EN_VALIDATION_DG";
    case "APPROUVEE":
      return "APPROUVEE";
    case "RETOURNEE":
      return "RETOURNEE_EMPLOYE";
    case "REFUSEE":
      return "REFUSEE_DEFINITIVEMENT";
    case "ANNULEE":
      return "ANNULEE";
    default:
      return "EN_VALIDATION_N1";
  }
}

// Transformateur d'une entité backend vers DemandeRHItem
export function transformBackendDemande(b: any): DemandeRHItem {
  return {
    id: b.id,
    codeReference: b.numeroDemande || `DEM-${b.id.substring(0, 6)}`,
    typeDemande: mapBackendTypeToFrontend(b.typeCode),
    libelleType: b.type?.libelle || b.typeCode,
    statut: mapBackendStatutToFrontend(b.statut),
    etapeCourante: (b.etapeValidation === "N1"
      ? "SUPERIEUR_N1"
      : b.etapeValidation === "DRH"
      ? "DRH"
      : b.etapeValidation === "DG"
      ? "DIRECTION_DG"
      : "CLOTURE") as EtapeValidationRH,
    demandeur: {
      id: b.salarieId,
      matricule: b.salarieMatricule || "EMP-AGY",
      nom: b.salarieNom ? b.salarieNom.split(" ").slice(1).join(" ") : "",
      prenom: b.salarieNom ? b.salarieNom.split(" ")[0] : "Collaborateur",
      email: b.salarieEmail || "",
      poste: b.salariePoste || "Collaborateur",
      departement: b.salarieDirection || "Direction Générale",
      service: b.salarieDirection || "",
      telephone: "+225 07 00 00 00 00",
    },
    dateDebut: b.dateDebut ? new Date(b.dateDebut).toISOString().split("T")[0] : "",
    dateFin: b.dateFin ? new Date(b.dateFin).toISOString().split("T")[0] : "",
    estDemiJourneeDebut: b.demiJourneeDebut || false,
    estDemiJourneeFin: b.demiJourneeFin || false,
    nombreJoursOuvres: Number(b.nombreJoursOuvres || 0),
    motif: b.motif || "",
    adresseContactPendantAbsence: b.adresseContact || "Abidjan, Côte d'Ivoire",
    destination: b.destination || undefined,
    moyenTransport: b.moyenTransport || undefined,
    fraisPrevisionnels: b.fraisEstimes ? Number(b.fraisEstimes) : undefined,
    cycleRetoursCount: 0,
    piecesJointes: (b.piecesJointes || []).map((pj: any) => ({
      id: pj.id,
      nomOriginal: pj.nomOriginal,
      taille: `${Math.round(pj.tailleOctets / 1024)} Ko`,
      typeMime: pj.typeMime,
      urlFichier: pj.cheminFichier,
      dateUpload: pj.createdAt,
    })),
    historique: (b.validations || []).map((v: any) => ({
      id: v.id,
      etape: (v.etape === "N1"
        ? "SUPERIEUR_N1"
        : v.etape === "DRH"
        ? "DRH"
        : "DIRECTION_DG") as EtapeValidationRH,
      libelleEtape: `Validation ${v.etape}`,
      acteurNom: v.valideurNom || "Manager",
      acteurPoste: v.valideurPoste || "Responsable",
      acteurRole: (v.etape === "N1"
        ? "SUPERIEUR_N1"
        : v.etape === "DRH"
        ? "DRH"
        : "DIRECTION_DG"),
      decision: v.decision === "APPROUVE" ? "VALIDE" : v.decision === "RETOURNE" ? "REFUSE_RETOUR" : "REFUSE_DEFINITIF",
      motif: v.commentaire || undefined,
      dateAction: v.createdAt,
    })),
    dateCreation: b.createdAt,
    dateDerniereAction: b.updatedAt,
  };
}

export const demandesApi = {
  // Types officiels
  async getTypes(): Promise<any[]> {
    return client.get<any[]>("/demandes-rh/types");
  },

  // Mes demandes
  async getMesDemandes(): Promise<DemandeRHItem[]> {
    const raw = await client.get<any[]>("/demandes-rh/mes-demandes");
    return raw.map(transformBackendDemande);
  },

  // Détail d'une demande
  async getDemandeById(id: string): Promise<DemandeRHItem> {
    const raw = await client.get<any>(`/demandes-rh/${id}`);
    return transformBackendDemande(raw);
  },

  // Création d'une nouvelle demande
  async creerDemande(payload: CreateDemandeInput): Promise<DemandeRHItem> {
    const raw = await client.post<any>("/demandes-rh", payload);
    return transformBackendDemande(raw);
  },

  // Annulation
  async annulerDemande(id: string): Promise<DemandeRHItem> {
    const raw = await client.put<any>(`/demandes-rh/${id}/annuler`, {});
    return transformBackendDemande(raw);
  },

  // File de validation N1
  async getAValiderN1(): Promise<DemandeRHItem[]> {
    const raw = await client.get<any[]>("/validations-rh/n1/a-valider");
    return raw.map(transformBackendDemande);
  },

  // File de validation DRH
  async getAValiderDRH(): Promise<DemandeRHItem[]> {
    const raw = await client.get<any[]>("/validations-rh/drh/a-valider");
    return raw.map(transformBackendDemande);
  },

  // File de validation Direction Générale
  async getAValiderDG(): Promise<DemandeRHItem[]> {
    const raw = await client.get<any[]>("/validations-rh/dg/a-valider");
    return raw.map(transformBackendDemande);
  },

  // Décision N1
  async deciderN1(id: string, decision: "APPROUVE" | "RETOURNE" | "REFUSE", motif?: string): Promise<any> {
    return client.put(`/validations-rh/${id}/decision-n1`, { decision, motif });
  },

  // Décision DRH
  async deciderDRH(id: string, decision: "APPROUVE" | "RETOURNE" | "REFUSE", motif?: string): Promise<any> {
    return client.put(`/validations-rh/${id}/decision-drh`, { decision, motif });
  },

  // Décision DG
  async deciderDG(id: string, decision: "APPROUVE" | "RETOURNE" | "REFUSE", motif?: string): Promise<any> {
    return client.put(`/validations-rh/${id}/decision-dg`, { decision, motif });
  },

  // Soldes collaborateur connecté
  async getMonSolde(): Promise<SoldeCongesInfo> {
    const s = await client.get<any>("/soldes-conges/mon-solde");
    return {
      annee: s.annee,
      joursAcquis: Number(s.joursAcquis),
      joursPris: Number(s.joursPris),
      joursEnAttente: Number(s.joursEnAttente),
      joursRestants: Number(s.joursRestants),
      repartition: {
        congesPayes: {
          acquis: Number(s.joursAcquis),
          pris: Number(s.joursPris),
          solde: Number(s.joursRestants),
        },
        permissionsAnnuelles: {
          quotaTotal: 10,
          prises: 2,
          solde: 8,
        },
        recuperations: {
          acquises: Number(s.reliquatN1 || 0),
          prises: 0,
          solde: Number(s.reliquatN1 || 0),
        },
      },
    };
  },

  // Liste globale de tous les soldes pour RH
  async getTousLesSoldes(): Promise<any[]> {
    return client.get<any[]>("/soldes-conges/tous");
  },

  // Ajustement manuel solde (RH)
  async ajusterSolde(salarieId: string, payload: { champ: string; valeur: number; motif: string }): Promise<any> {
    return client.put(`/soldes-conges/collaborateur/${salarieId}/ajuster`, payload);
  },
};

