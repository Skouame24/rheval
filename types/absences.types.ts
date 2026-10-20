// ============================================================
// types/absences.types.ts
// Modélisation complète du module Digitalisation RH - Demandes & Workflow
// Conforme au Cahier des charges Agilly & BPMN Swimming Lanes
// ============================================================

export type TypeDemandeRH =
  | "CONGE_PAYE"
  | "CONGE_EXCEPTIONNEL"
  | "PERMISSION_ABSENCE"
  | "REPOS_MALADIE"
  | "MISSION_DEPLACEMENT"
  | "INTERVENTION_TERRAIN";

export type StatutDemandeRH =
  | "BROUILLON"
  | "SOUMISE"
  | "EN_VALIDATION_N1"
  | "EN_VALIDATION_DRH"
  | "EN_VALIDATION_DG"
  | "RETOURNEE_EMPLOYE"
  | "APPROUVEE"
  | "PERMISSION_EDITEE"
  | "ARCHIVEE"
  | "REFUSEE_DEFINITIVEMENT"
  | "ANNULEE"
  | "EXPIREE";

export type EtapeValidationRH =
  | "SUPERIEUR_N1"
  | "DRH"
  | "DIRECTION_DG"
  | "AGENT_DRH"
  | "CLOTURE";

export type RoleActeurRH =
  | "SALARIE"
  | "SUPERIEUR_N1"
  | "DRH"
  | "DIRECTION_DG"
  | "AGENT_DRH"
  | "ADMIN";

export interface DemandeurInfo {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  departement: string;
  service: string;
  telephone: string;
  photoUrl?: string;
  managerNom?: string;
  managerEmail?: string;
}

export interface PieceJointe {
  id: string;
  nomOriginal: string;
  taille: string;
  typeMime: string;
  urlFichier: string;
  dateUpload: string;
}

export interface HistoriqueValidation {
  id: string;
  etape: EtapeValidationRH;
  libelleEtape: string;
  acteurNom: string;
  acteurPoste: string;
  acteurRole: RoleActeurRH;
  decision: "VALIDE" | "REFUSE_RETOUR" | "REFUSE_DEFINITIF" | "EDITE" | "ARCHIVE";
  motif?: string;
  dateAction: string;
  estDelegation?: boolean;
  deleguePar?: string;
}

export interface DocumentPermissionPDF {
  numeroUnique: string; // Ex: AGY-PERM-2026-00042
  qrCodeUrl: string;
  tokenVerification: string;
  dateEmission: string;
  emetteurAgentNom: string;
  emetteurAgentMatricule: string;
  cachetOfficiel: boolean;
  signatureElectronique: boolean;
  hashSha256: string;
  dureeConservationAnnees: number;
}

export interface DemandeRHItem {
  id: string;
  codeReference: string; // DEM-2026-XXXX
  typeDemande: TypeDemandeRH;
  libelleType: string;
  statut: StatutDemandeRH;
  etapeCourante: EtapeValidationRH;
  
  // Demandeur
  demandeur: DemandeurInfo;

  // Dates & Durée
  dateDebut: string;
  dateFin: string;
  estDemiJourneeDebut?: boolean;
  estDemiJourneeFin?: boolean;
  nombreJoursOuvres: number;
  
  // Détails spécifiques
  motif: string;
  destination?: string; // pour mission/déplacement
  moyenTransport?: string;
  fraisPrevisionnels?: number;

  // Compteurs & Règles de gestion
  cycleRetoursCount: number; // Max 2 avant refus définitif
  alertesQuorumService?: string; // Ex: "Effectif restant: 65% (seuil min: 50%)"

  // Justificatifs & Validations
  piecesJointes: PieceJointe[];
  historique: HistoriqueValidation[];
  documentPermission?: DocumentPermissionPDF;

  dateCreation: string;
  dateDerniereAction: string;
}

export interface SoldeCongesInfo {
  annee: number;
  joursAcquis: number;
  joursPris: number;
  joursEnAttente: number;
  joursRestants: number;
  repartition: {
    congesPayes: { acquis: number; pris: number; solde: number };
    permissionsAnnuelles: { quotaTotal: number; prises: number; solde: number };
    recuperations: { acquises: number; prises: number; solde: number };
  };
}

export interface StatistiqueServiceAbsence {
  service: string;
  totalEffectif: number;
  enCongeActuellement: number;
  tauxPresence: number; // en pourcentage
  conformeQuorum: boolean;
}

export interface KPIOverview {
  totalDemandesMois: number;
  enAttenteValidation: number;
  approuveesMois: number;
  tauxRefusPourcent: number;
  delaiMoyenHeures: number;
  permissionsEditees: number;
  archivesGedTotal: number;
}

