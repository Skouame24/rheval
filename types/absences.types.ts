// ============================================================
// types/absences.types.ts
// Modélisation complète conforme au formulaire officiel Agilly
// ("FORMULAIRE DE DEMANDE DE PERMISSION - BULLETIN INDIVIDUEL")
// ============================================================

export type FamilleDemandeRH = "CONGES" | "PERMISSIONS" | "MISSIONS";

export type TypeDemandeRH =
  // ── FAMILLE 1 : CONGÉS FORMELS (6) ──
  | "CONGES_ANNUELS"
  | "CONGES_MALADIE"
  | "CONGES_MATERNITE"
  | "CONGES_PATERNITE"
  | "CONGES_SANS_SOLDE"
  | "CONGES_FORMATION"
  // ── FAMILLE 2 : PERMISSIONS D'ABSENCE (9) ──
  | "PERMISSION_MARIAGE"
  | "PERMISSION_NAISSANCE"
  | "PERMISSION_DECES"
  | "PERMISSION_FAMILIALE"
  | "PERMISSION_MEDICALE"
  | "PERMISSION_ADMINISTRATIVE"
  | "PERMISSION_SCOLAIRE"
  | "PERMISSION_EXAMEN"
  | "PERMISSION_SORTIE"
  // ── FAMILLE 3 : MISSIONS & DÉPLACEMENTS (2) ──
  | "MISSION_DEPLACEMENT"
  | "INTERVENTION_TERRAIN"
  // Rétrocompatibilité
  | "RECUPERATION"
  | "ABSENCE_NON_PAYEE"
  | "PERMISSION_EXCEPTIONNELLE";

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

export interface PersonaUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: RoleActeurRH;
  labelRole: string;
  poste: string;
  departement: string;
  service: string;
  matricule: string;
  numeroCnss?: string;
  avatarBg?: string;
}

export interface DemandeurInfo {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  poste: string; // Fonction
  departement: string;
  service: string;
  telephone: string;
  numeroCnss?: string; // N° CNSS de l'employé
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
  balanceCongesPayesSolde: number; // Balance DRH sur le bulletin
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

  // Dates & Durée (Du ... Au ... inclus)
  dateDebut: string;
  dateFin: string;
  estDemiJourneeDebut?: boolean;
  estDemiJourneeFin?: boolean;
  nombreJoursOuvres: number;
  nombreJoursCalendaires?: number;
  
  // Plage horaire (pour permission de sortie)
  heureDebut?: string; // ex: "10:00"
  heureFin?: string;   // ex: "12:30"
  dureeHeures?: number; // ex: 2.5
  familleDemande?: FamilleDemandeRH;
  
  // Champs spécifiques du formulaire officiel Agilly
  motif: string; // Motif de la permission
  adresseContactPendantAbsence: string; // Adresse et contact téléphonique pendant l'absence
  destination?: string; // pour mission/déplacement
  moyenTransport?: string;
  fraisPrevisionnels?: number;

  // Compteurs & Règles de gestion
  cycleRetoursCount: number; // Max 2 avant refus définitif
  alertesQuorumService?: string;

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
  tauxPresence: number;
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

export interface TypeDemandeConfig {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  necessiteSolde: boolean;
  pieceRequise: boolean;
  delaiMinJours: number;
  dureeMaxJours?: number | null;
  workflowN1: boolean;
  workflowDrh: boolean;
  workflowDg: boolean;
  seuilDgJours: number;
  description?: string | null;
  actif: boolean;
  createdAt?: string;
}

