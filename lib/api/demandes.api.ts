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
  TypeDemandeConfig,
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
    case "INTERVENTION_TERRAIN":
      return "ORDRE_MISSION";
    case "PERMISSION_MARIAGE":
    case "PERMISSION_NAISSANCE":
    case "PERMISSION_DECES":
    case "PERMISSION_FAMILIALE":
    case "PERMISSION_MEDICALE":
    case "PERMISSION_ADMINISTRATIVE":
    case "PERMISSION_SCOLAIRE":
    case "PERMISSION_EXAMEN":
    case "PERMISSION_SORTIE":
      return "PERMISSION_ABSENCE";
    case "CONGES_MATERNITE":
    case "CONGES_PATERNITE":
    case "CONGES_SANS_SOLDE":
    case "CONGES_FORMATION":
      return "CONGE_EXCEPTIONNEL";
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
    case "EN_VALIDATION_N1":
      return "EN_VALIDATION_N1";
    case "EN_ATTENTE_DRH":
    case "EN_VALIDATION_DRH":
      return "EN_VALIDATION_DRH";
    case "EN_ATTENTE_DG":
    case "EN_VALIDATION_DG":
      return "EN_VALIDATION_DG";
    case "APPROUVEE":
      return "APPROUVEE";
    case "PERMISSION_EDITEE":
      return "PERMISSION_EDITEE";
    case "ARCHIVEE":
      return "ARCHIVEE";
    case "RETOURNEE_EMPLOYE":
    case "RETOURNEE_N1":
    case "RETOURNEE_DRH":
    case "RETOURNEE":
      return "RETOURNEE_EMPLOYE";
    case "REFUSEE":
    case "REFUSEE_DEFINITIVEMENT":
      return "REFUSEE_DEFINITIVEMENT";
    case "ANNULEE":
      return "ANNULEE";
    default:
      return "EN_VALIDATION_N1";
  }
}

// Transformateur d'une entité backend vers DemandeRHItem
export function transformBackendDemande(b: any): DemandeRHItem {
  const typeCode = b.typeDemande?.code || b.typeCode || "CONGE_ANNUEL";
  const libelleType = b.typeDemande?.libelle || b.type?.libelle || b.typeCode || "Congé / Absence";
  const nbJours = Number(b.nombreJours ?? b.nombreJoursOuvres ?? 0);

  const etapeCourante =
    b.etapeCourante === 1 || b.etapeValidation === "N1"
      ? "SUPERIEUR_N1"
      : b.etapeCourante === 2 || b.etapeValidation === "DRH"
      ? "DRH"
      : b.etapeCourante === 3 || b.etapeValidation === "DG"
      ? "DIRECTION_DG"
      : "CLOTURE";

  const salNom = b.salarieNom || "";
  const nameParts = salNom.trim().split(/\s+/);
  const prenom = nameParts.length > 1 ? nameParts[0] : (salNom || "Collaborateur");
  const nom = nameParts.length > 1 ? nameParts.slice(1).join(" ") : (salNom || "Agilly");

  // Historique unifié (validations + table historique)
  const histFromValidations = (b.validations || []).map((v: any) => ({
    id: v.id,
    etape: (v.etape === 1 || v.etape === "N1"
      ? "SUPERIEUR_N1"
      : v.etape === 2 || v.etape === "DRH"
      ? "DRH"
      : "DIRECTION_DG") as EtapeValidationRH,
    libelleEtape: `Visa Étape ${v.etape}`,
    acteurNom: v.valideurNom || "Manager Responsable",
    acteurPoste: v.valideurRole || "Validateur RH",
    acteurRole: (v.etape === 1 || v.etape === "N1"
      ? "SUPERIEUR_N1"
      : v.etape === 2 || v.etape === "DRH"
      ? "DRH"
      : "DIRECTION_DG") as any,
    decision: (v.decision === "APPROUVE" ? "VALIDE" : v.decision === "RETOURNE" ? "REFUSE_RETOUR" : "REFUSE_DEFINITIF") as any,
    motif: v.motif || v.commentaire || undefined,
    dateAction: v.dateDecision || v.createdAt || new Date().toISOString(),
  }));

  const histFromLogs = (b.historique || []).map((h: any) => ({
    id: h.id,
    etape: "SUPERIEUR_N1" as EtapeValidationRH,
    libelleEtape: h.action || "Action sur demande",
    acteurNom: h.auteurNom || "Collaborateur",
    acteurPoste: "Système",
    acteurRole: "SALARIE" as any,
    decision: (h.nouveauStatut === "REFUSEE" ? "REFUSE_DEFINITIF" : "VALIDE") as any,
    motif: h.commentaire || undefined,
    dateAction: h.createdAt || new Date().toISOString(),
  }));

  const combinedHist = histFromValidations.length > 0 ? histFromValidations : histFromLogs;

  return {
    id: b.id,
    codeReference: b.numeroDemande || `DEM-${b.id.substring(0, 8)}`,
    typeDemande: mapBackendTypeToFrontend(typeCode),
    libelleType: libelleType,
    statut: mapBackendStatutToFrontend(b.statut),
    etapeCourante: etapeCourante as EtapeValidationRH,
    demandeur: {
      id: b.salarieId,
      matricule: b.salarieMatricule || `EMP-${(b.salarieId || "").substring(0, 6).toUpperCase()}`,
      nom: nom,
      prenom: prenom,
      email: b.salarieEmail || "",
      poste: b.salariePoste || "Collaborateur Agilly",
      departement: b.salarieDirection || "Direction Générale",
      service: b.salarieDirection || "Direction Générale",
      telephone: "+225 07 00 00 00 00",
    },
    dateDebut: b.dateDebut ? new Date(b.dateDebut).toISOString().split("T")[0] : "",
    dateFin: b.dateFin ? new Date(b.dateFin).toISOString().split("T")[0] : "",
    estDemiJourneeDebut: b.demiJourneeDebut || false,
    estDemiJourneeFin: b.demiJourneeFin || false,
    nombreJoursOuvres: nbJours,
    nombreJoursCalendaires: nbJours,
    motif: b.motif || "",
    adresseContactPendantAbsence: b.adresseContact || "Abidjan, Côte d'Ivoire",
    destination: b.destination || undefined,
    moyenTransport: b.moyenTransport || undefined,
    fraisPrevisionnels: b.fraisEstimes ? Number(b.fraisEstimes) : undefined,
    cycleRetoursCount: b.cycleRejetCount || 0,
    piecesJointes: (b.piecesJointes || []).map((pj: any) => ({
      id: pj.id,
      nomOriginal: pj.nomFichier || pj.nomOriginal || "Document.pdf",
      taille: `${Math.round((pj.tailleOctets || 1024) / 1024)} Ko`,
      typeMime: pj.mimeType || pj.typeMime || "application/pdf",
      urlFichier: pj.cheminFichier,
      dateUpload: pj.createdAt || new Date().toISOString(),
    })),
    historique: combinedHist,
    estDelegation: Boolean(b.estDelegation),
    delegueParNom: b.delegueParNom || undefined,
    delegueMotif: b.delegueMotif || undefined,
    dateCreation: b.createdAt || new Date().toISOString(),
    dateDerniereAction: b.updatedAt || b.createdAt || new Date().toISOString(),
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
    return (raw || []).map(transformBackendDemande);
  },

  // Toutes les demandes (registre RH / Direction / planning)
  async getAllDemandes(): Promise<DemandeRHItem[]> {
    const raw = await client.get<any[]>("/demandes-rh");
    return (raw || []).map(transformBackendDemande);
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
    const annee = s?.annee || new Date().getFullYear();
    const acquis = Number(s?.joursAcquis || 0) + Number(s?.reliquatN1 || 0);
    const pris = Number(s?.joursPris || 0);
    const enAttente = Number(s?.joursEnAttente || 0);
    const restants = Number(s?.soldeRestantNet ?? Math.max(0, acquis - pris - enAttente));

    return {
      annee,
      joursAcquis: acquis,
      joursPris: pris,
      joursEnAttente: enAttente,
      joursRestants: restants,
      repartition: {
        congesPayes: {
          acquis,
          pris,
          solde: restants,
        },
        permissionsAnnuelles: {
          quotaTotal: 10,
          prises: Math.min(pris, 10),
          solde: Math.max(0, 10 - pris),
        },
        recuperations: {
          acquises: Number(s?.reliquatN1 || 0),
          prises: 0,
          solde: Number(s?.reliquatN1 || 0),
        },
      },
    };
  },

  // Édition officielle de permission et clôture
  async editerPermission(id: string): Promise<any> {
    return client.post(`/validations-rh/${id}/editer-permission`, {});
  },

  // Liste globale de tous les soldes pour RH
  async getTousLesSoldes(): Promise<any[]> {
    return client.get<any[]>("/soldes-conges/tous");
  },

  // Ajustement manuel solde (RH)
  async ajusterSolde(salarieId: string, payload: { champ: string; valeur: number; motif: string }): Promise<any> {
    return client.put(`/soldes-conges/collaborateur/${salarieId}/ajuster`, payload);
  },

  // Récupérer tous les types de demande avec leur configuration de workflow
  async getTypesDemande(): Promise<TypeDemandeConfig[]> {
    return client.get<TypeDemandeConfig[]>("/demandes-rh/types");
  },

  // Mettre à jour la configuration du workflow d'un type de demande (DRH)
  async updateTypeWorkflow(idOrCode: string, payload: Partial<TypeDemandeConfig>): Promise<TypeDemandeConfig> {
    return client.put<TypeDemandeConfig>(`/demandes-rh/types/${idOrCode}`, payload);
  },

  // ── Gestion de l'Intérim & Délégation de validation ──────────
  async getMyDelegation(): Promise<any> {
    try {
      return await client.get("/validations-rh/delegation");
    } catch {
      return null;
    }
  },

  async setDelegation(payload: { interimId: string; motif?: string; dateDebut?: string; dateFin?: string | null }): Promise<any> {
    return client.post("/validations-rh/delegation", payload);
  },

  async revokeDelegation(): Promise<any> {
    return client.delete("/validations-rh/delegation");
  },

  async getEligibleInterims(): Promise<any[]> {
    try {
      const res = await client.get<any[]>("/validations-rh/collaborateurs-eligibles");
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },
};

