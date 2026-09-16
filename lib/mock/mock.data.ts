// ============================================================
// lib/mock/mock.data.ts
// Données fictives centralisées — AGILLY RHEVAL
// Basées sur le document CADRAGE_ET_USER_STORIES_AGILLY_RHEVAL.md
// Quand le backend NestJS sera prêt, remplacer par de vrais appels API.
// ============================================================

import type { User, UserSummary } from "@/types/user.types";
import type { Cycle, Objectif, CycleSummary } from "@/types/cycle.types";
import type {
  EvaluationCycle,
  Evaluation,
  NoteObjectif,
  Arbitrage,
} from "@/types/evaluation.types";
import type { ResultatBonus, PalierBareme, Bareme } from "@/types/bonus.types";

// ─── 1. UTILISATEURS ────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: "sal-001",
    nom: "KOUAME",
    prenom: "Ebenezer Samuel",
    email: "e.kouame@agilly.com",
    role: "SALARIE",
    poste: "Développeur Fullstack",
    departement: "Direction Technique",
    createdAt: "2024-03-15T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "sal-002",
    nom: "KONÉ",
    prenom: "Mariam",
    email: "mariam.kone@agilly.com",
    role: "SALARIE",
    poste: "Designer UI/UX",
    departement: "Direction Technique",
    createdAt: "2023-06-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "sal-003",
    nom: "BAH",
    prenom: "Oumar",
    email: "oumar.bah@agilly.com",
    role: "SALARIE",
    poste: "Développeur Mobile",
    departement: "Direction Technique",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "sal-004",
    nom: "CAMARA",
    prenom: "Aissatou",
    email: "aissatou.camara@agilly.com",
    role: "SALARIE",
    poste: "QA Engineer",
    departement: "Direction Technique",
    createdAt: "2022-09-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "sal-005",
    nom: "SYLLA",
    prenom: "Mamadou",
    email: "mamadou.sylla@agilly.com",
    role: "SALARIE",
    poste: "DevOps Engineer",
    departement: "Direction Technique",
    createdAt: "2021-11-12T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "sal-006",
    nom: "TOURÉ",
    prenom: "Fatoumata",
    email: "fatoumata.toure@agilly.com",
    role: "SALARIE",
    poste: "Chargée de Communication",
    departement: "Direction Marketing",
    createdAt: "2023-02-14T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "sal-007",
    nom: "COULIBALY",
    prenom: "Ibrahim",
    email: "ibrahim.coulibaly@agilly.com",
    role: "SALARIE",
    poste: "Analyste Financier",
    departement: "Direction Financière",
    createdAt: "2022-04-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "n1-001",
    nom: "AKOUMIA",
    prenom: "Sevan",
    email: "s.akoumia@agilly.com",
    role: "N1",
    poste: "Lead Developer / Manager N+1",
    departement: "Direction Technique",
    createdAt: "2020-05-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "n2-001",
    nom: "BAMBA",
    prenom: "Koffi Alexis",
    email: "k.bamba@agilly.com",
    role: "N2",
    poste: "Directeur des Opérations",
    departement: "Direction Générale",
    createdAt: "2018-09-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "rh-001",
    nom: "DIALLO",
    prenom: "Mariam",
    email: "m.diallo@agilly.com",
    role: "RH",
    poste: "Chargée des Ressources Humaines",
    departement: "Direction RH",
    createdAt: "2019-03-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "drh-001",
    nom: "KOUASSI",
    prenom: "Marie-Claire",
    email: "drh@agilly.com",
    role: "DRH",
    poste: "Directrice des Ressources Humaines",
    departement: "Direction Générale RH",
    createdAt: "2017-01-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "adm-001",
    nom: "AGILLY",
    prenom: "Admin",
    email: "admin@agilly.com",
    role: "ADMIN",
    poste: "Administrateur Système",
    departement: "IT & Sécurité",
    createdAt: "2017-01-01T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
];

// Helpers
export function getMockUser(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function toUserSummary(u: User): UserSummary {
  return { id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, role: u.role, poste: u.poste };
}

export const MOCK_USER_SUMMARY: Record<string, UserSummary> = Object.fromEntries(
  MOCK_USERS.map((u) => [u.id, toUserSummary(u)])
);

// ─── 2. CYCLE 2026 ──────────────────────────────────────────

export const MOCK_CYCLE_2026: Cycle = {
  id: "cycle-2026",
  annee: 2026,
  libelle: "Évaluation Annuelle 2026 — Agilly",
  dateDebut: "2026-01-15T00:00:00Z",
  dateFin: "2026-12-31T23:59:59Z",
  statut: "ACTIF",
  objectifs: [],
  createdAt: "2026-01-10T09:00:00Z",
  updatedAt: "2026-01-10T09:00:00Z",
};

export const MOCK_CYCLE_2025: Cycle = {
  id: "cycle-2025",
  annee: 2025,
  libelle: "Évaluation Annuelle 2025 — Agilly",
  dateDebut: "2025-01-20T00:00:00Z",
  dateFin: "2025-12-31T23:59:59Z",
  statut: "CLOTURE",
  objectifs: [],
  createdAt: "2025-01-10T09:00:00Z",
  updatedAt: "2026-01-08T09:00:00Z",
};

export const MOCK_CYCLES: Cycle[] = [MOCK_CYCLE_2026, MOCK_CYCLE_2025];

export const MOCK_CYCLE_SUMMARY_2026: CycleSummary = {
  id: "cycle-2026",
  annee: 2026,
  libelle: "Évaluation Annuelle 2026 — Agilly",
  statut: "ACTIF",
  dateDebut: "2026-01-15T00:00:00Z",
  dateFin: "2026-12-31T23:59:59Z",
};

// ─── 3. OBJECTIFS DU CYCLE 2026 ─────────────────────────────
// Total pondérations = 100%

export const MOCK_OBJECTIFS: Objectif[] = [
  {
    id: "obj-001",
    cycleId: "cycle-2026",
    intitule: "Qualité du Code & Bonnes Pratiques",
    description:
      "Maîtrise des standards de code (revues de code, couverture de tests, réduction de la dette technique).",
    ponderation: 30,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "obj-002",
    cycleId: "cycle-2026",
    intitule: "Respect des Délais de Livraison",
    description:
      "Taux de livraison des features dans les délais sprint définis avec le product owner.",
    ponderation: 25,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "obj-003",
    cycleId: "cycle-2026",
    intitule: "Collaboration & Communication Équipe",
    description:
      "Qualité des échanges en équipe, participation aux cérémonies Agile, aide aux collègues.",
    ponderation: 20,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "obj-004",
    cycleId: "cycle-2026",
    intitule: "Montée en Compétences Techniques",
    description:
      "Formations suivies, certifications obtenues, nouvelles technologies maîtrisées sur l'année.",
    ponderation: 15,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "obj-005",
    cycleId: "cycle-2026",
    intitule: "Initiative & Proposition d'Améliorations",
    description:
      "Propositions d'améliorations des processus internes, documentation produite, optimisations réalisées.",
    ponderation: 10,
    createdAt: "2026-01-15T10:00:00Z",
  },
];

// Enrichit le cycle avec ses objectifs
MOCK_CYCLE_2026.objectifs = MOCK_OBJECTIFS;

// ─── 4. NOTES N+1 POUR LE SALARIÉ EBENEZER ─────────────────

const MOCK_NOTES_N1_EBENEZER: NoteObjectif[] = [
  { objectifId: "obj-001", objectif: MOCK_OBJECTIFS[0], note: 17, commentaire: "Très bon niveau de qualité, peu de bugs en production. La couverture de tests dépasse les 80%." },
  { objectifId: "obj-002", objectif: MOCK_OBJECTIFS[1], note: 16, commentaire: "Livraisons régulièrement dans les délais. Un retard mineur sur le sprint 8." },
  { objectifId: "obj-003", objectif: MOCK_OBJECTIFS[2], note: 15, commentaire: "Bonne participation. Peut être plus proactif lors des stand-ups." },
  { objectifId: "obj-004", objectif: MOCK_OBJECTIFS[3], note: 18, commentaire: "A obtenu la certification AWS et suivi 2 formations React avancé." },
  { objectifId: "obj-005", objectif: MOCK_OBJECTIFS[4], note: 14, commentaire: "Quelques bonnes suggestions mais pourrait documenter davantage." },
];

// Moyenne pondérée : (17×30 + 16×25 + 15×20 + 18×15 + 14×10) / 100 = 16.3
const MOYENNE_N1_EBENEZER = 16.3;

const MOCK_EVALUATION_N1_EBENEZER: Evaluation = {
  id: "eval-n1-001",
  cycleId: "cycle-2026",
  salarieId: "sal-001",
  evaluateurId: "n1-001",
  evaluateur: toUserSummary(MOCK_USERS[7]),
  type: "N1",
  notes: MOCK_NOTES_N1_EBENEZER,
  moyenneNotes: MOYENNE_N1_EBENEZER,
  competences: ["React", "Node.js", "AWS", "TypeScript", "Tests unitaires"],
  besoinFormation: "Formation Architecture Microservices — Q1 2027 — Priorité : Haute",
  observations:
    "Ebenezer Samuel est un développeur fiable et engagé. Sa montée en compétences est remarquable. À accompagner vers plus d'autonomie sur les décisions d'architecture.",
  statut: "EN_ATTENTE_N2",
  dateCreation: "2026-07-01T09:00:00Z",
  dateSoumission: "2026-08-15T14:32:00Z",
};

// ─── 5. NOTES N+2 POUR LE SALARIÉ EBENEZER ─────────────────

const MOCK_NOTES_N2_EBENEZER: NoteObjectif[] = [
  { objectifId: "obj-001", objectif: MOCK_OBJECTIFS[0], note: 16, commentaire: "Niveau solide confirmé par les métriques SonarQube." },
  { objectifId: "obj-002", objectif: MOCK_OBJECTIFS[1], note: 16, commentaire: "Accord avec l'évaluation N+1." },
  { objectifId: "obj-003", objectif: MOCK_OBJECTIFS[2], note: 15, commentaire: "Accord." },
  { objectifId: "obj-004", objectif: MOCK_OBJECTIFS[3], note: 17, commentaire: "La certification AWS est un vrai plus pour l'équipe." },
  { objectifId: "obj-005", objectif: MOCK_OBJECTIFS[4], note: 14, commentaire: "Accord." },
];

// Moyenne pondérée N2 : (16×30 + 16×25 + 15×20 + 17×15 + 14×10) / 100 = 15.85 ≈ 15.9
const MOYENNE_N2_EBENEZER = 15.9;

const MOCK_EVALUATION_N2_EBENEZER: Evaluation = {
  id: "eval-n2-001",
  cycleId: "cycle-2026",
  salarieId: "sal-001",
  evaluateurId: "n2-001",
  evaluateur: toUserSummary(MOCK_USERS[8]),
  type: "N2",
  notes: MOCK_NOTES_N2_EBENEZER,
  moyenneNotes: MOYENNE_N2_EBENEZER,
  competences: ["Architecture logicielle", "Leadership technique"],
  besoinFormation: "Formation Architecture Microservices — Q1 2027 — Priorité : Haute",
  observations:
    "Bon profil, en progression constante. L'écart avec le N+1 est inférieur à 2 points — dossier validé directement.",
  statut: "EN_ATTENTE_N2",
  dateCreation: "2026-08-16T11:00:00Z",
  dateSoumission: "2026-08-20T16:00:00Z",
};

// ─── 6. EVALUATION CYCLE COMPLÈTE — EBENEZER ─────────────────

export const MOCK_EVAL_CYCLE_EBENEZER: any = {
  id: "evalcycle-001",
  cycle: MOCK_CYCLE_SUMMARY_2026,
  salarie: toUserSummary(MOCK_USERS[0]),
  statut: "EN_ATTENTE_N2",
  evaluationN1: MOCK_EVALUATION_N1_EBENEZER,
  evaluationN2: MOCK_EVALUATION_N2_EBENEZER,
  noteFinale: undefined,
  tauxAtteinte: undefined,
  dateCreation: "2026-07-01T09:00:00Z",
};

// ─── 7. EVALUATIONS PAR STATUT (pour le dashboard N1/N2/RH) ──

export const MOCK_EVAL_CYCLES: any[] = [
  // Ebenezer — EN_ATTENTE_N2
  MOCK_EVAL_CYCLE_EBENEZER,

  // Mariam Koné — EN_ATTENTE_N1
  {
    id: "evalcycle-002",
    cycle: MOCK_CYCLE_SUMMARY_2026,
    salarie: toUserSummary(MOCK_USERS[1]),
    statut: "EN_ATTENTE_N1",
    dateCreation: "2026-07-01T09:00:00Z",
  },

  // Oumar Bah — ARBITRAGE
  {
    id: "evalcycle-003",
    cycle: MOCK_CYCLE_SUMMARY_2026,
    salarie: toUserSummary(MOCK_USERS[2]),
    statut: "ARBITRAGE",
    evaluationN1: {
      id: "eval-n1-003",
      cycleId: "cycle-2026",
      salarieId: "sal-003",
      evaluateurId: "n1-001",
      evaluateur: toUserSummary(MOCK_USERS[7]),
      type: "N1",
      notes: MOCK_OBJECTIFS.map((o, i) => ({
        objectifId: o.id,
        objectif: o,
        note: [16, 15, 14, 13, 12][i],
      })),
      moyenneNotes: 14.9,
      competences: ["React Native", "Flutter"],
      besoinFormation: "Formation Kotlin — Q2 2027",
      observations: "Bon développeur mobile, à accompagner sur la gestion des performances.",
      statut: "ARBITRAGE",
      dateCreation: "2026-07-01T09:00:00Z",
      dateSoumission: "2026-08-10T10:00:00Z",
    },
    evaluationN2: {
      id: "eval-n2-003",
      cycleId: "cycle-2026",
      salarieId: "sal-003",
      evaluateurId: "n2-001",
      evaluateur: toUserSummary(MOCK_USERS[8]),
      type: "N2",
      notes: MOCK_OBJECTIFS.map((o, i) => ({
        objectifId: o.id,
        objectif: o,
        note: [12, 11, 12, 10, 11][i],
      })),
      moyenneNotes: 11.5,
      competences: [],
      besoinFormation: "Formation Gestion des Priorités — Q1 2027",
      observations: "Écart significatif avec l'évaluation N+1. Arbitrage RH nécessaire.",
      statut: "ARBITRAGE",
      dateCreation: "2026-08-11T09:00:00Z",
      dateSoumission: "2026-08-14T15:00:00Z",
    },
    arbitrage: {
      id: "arb-001",
      evaluationCycleId: "evalcycle-003",
      motif: "Écart de 3.4 points entre note N+1 (14.9) et note N+2 (11.5) — supérieur au seuil de 2 points.",
      statut: "OUVERT",
      rhId: "rh-001",
      n2Id: "n2-001",
      rh: toUserSummary(MOCK_USERS[9]),
      n2: toUserSummary(MOCK_USERS[8]),
      dateOuverture: "2026-08-15T09:00:00Z",
    },
    dateCreation: "2026-07-01T09:00:00Z",
  },

  // Aissatou Camara — VALIDE
  {
    id: "evalcycle-004",
    cycle: MOCK_CYCLE_SUMMARY_2026,
    salarie: toUserSummary(MOCK_USERS[3]),
    statut: "VALIDE",
    noteFinale: 17.2,
    tauxAtteinte: 86,
    evaluationN1: {
      id: "eval-n1-004",
      cycleId: "cycle-2026",
      salarieId: "sal-004",
      evaluateurId: "n1-001",
      evaluateur: toUserSummary(MOCK_USERS[7]),
      type: "N1",
      notes: MOCK_OBJECTIFS.map((o, i) => ({
        objectifId: o.id,
        objectif: o,
        note: [18, 17, 16, 18, 17][i],
      })),
      moyenneNotes: 17.2,
      competences: ["Selenium", "Cypress", "Jira", "Postman"],
      besoinFormation: "Formation Test de Performance — Q2 2027",
      observations: "Excellente QA Engineer, zéro bug critique en production sur l'année.",
      statut: "VALIDE",
      dateCreation: "2026-07-01T09:00:00Z",
      dateSoumission: "2026-08-05T10:00:00Z",
    },
    dateCreation: "2026-07-01T09:00:00Z",
    dateCloture: "2026-08-25T16:00:00Z",
  },

  // Mamadou Sylla — EN_ATTENTE_N1
  {
    id: "evalcycle-005",
    cycle: MOCK_CYCLE_SUMMARY_2026,
    salarie: toUserSummary(MOCK_USERS[4]),
    statut: "EN_ATTENTE_N1",
    dateCreation: "2026-07-01T09:00:00Z",
  },
];

// ─── 8. HISTORIQUE SALARIÉ (années précédentes) ───────────────

export const MOCK_HISTORIQUE_EBENEZER = [
  {
    annee: 2025,
    libelle: "Évaluation Annuelle 2025",
    note: 14.8,
    statut: "VALIDE" as const,
    dateValidation: "2025-12-15T16:00:00Z",
  },
  {
    annee: 2024,
    libelle: "Évaluation Annuelle 2024",
    note: 13.5,
    statut: "VALIDE" as const,
    dateValidation: "2024-12-20T16:00:00Z",
  },
];

// ─── 9. BARÈME BONUS 2026 ────────────────────────────────────

export const MOCK_PALIERS: PalierBareme[] = [
  { id: "pal-001", baremeId: "bareme-2026", seuilMin: 90, seuilMax: 100, tauxBonus: 20, libelle: "Excellence (18–20)" },
  { id: "pal-002", baremeId: "bareme-2026", seuilMin: 75, seuilMax: 89, tauxBonus: 15, libelle: "Très Bon (15–17)" },
  { id: "pal-003", baremeId: "bareme-2026", seuilMin: 60, seuilMax: 74, tauxBonus: 10, libelle: "Satisfaisant (12–14)" },
  { id: "pal-004", baremeId: "bareme-2026", seuilMin: 0, seuilMax: 59, tauxBonus: 0, libelle: "Insuffisant (0–11)" },
];

export const MOCK_BAREME: Bareme = {
  id: "bareme-2026",
  cycleId: "cycle-2026",
  cycle: MOCK_CYCLE_SUMMARY_2026,
  paliers: MOCK_PALIERS,
  createdAt: "2026-01-10T09:00:00Z",
  updatedAt: "2026-01-10T09:00:00Z",
};

export const MOCK_RESULTATS_BONUS: ResultatBonus[] = [
  {
    id: "bonus-004",
    salarieId: "sal-004",
    salarie: toUserSummary(MOCK_USERS[3]),
    cycleId: "cycle-2026",
    cycle: MOCK_CYCLE_SUMMARY_2026,
    noteFinale: 17.2,
    tauxAtteinte: 86,
    tauxBonusEstime: 15,
    palierApplique: MOCK_PALIERS[1],
    dateCalcul: "2026-08-25T17:00:00Z",
  },
];

// ─── 10. STATISTIQUES RH DASHBOARD ───────────────────────────

export const MOCK_RH_STATS = {
  totalSalaries: 7,
  fichesCompletes: 2,
  fichesEnCours: 3,
  fichesNonDemarrees: 2,
  tauxCompletion: 28,
  moyenneGlobale: 16.1,
  arbitragesOuverts: 1,
  cycleActif: MOCK_CYCLE_SUMMARY_2026,
  repartitionStatuts: {
    EN_ATTENTE_N1: 2,
    EN_ATTENTE_N2: 1,
    ARBITRAGE: 1,
    VALIDE: 1,
    CLOTURE: 0,
  },
};

// ─── 11. JOURNAL D'AUDIT ─────────────────────────────────────

export const MOCK_AUDIT_LOGS = [
  {
    id: "audit-001",
    action: "NOTE_MODIFIÉE",
    acteurId: "n1-001",
    acteurNom: "Sevan AKOUMIA",
    cible: "Évaluation Ebenezer Samuel KOUAME",
    ancienneValeur: "16",
    nouvelleValeur: "17",
    ipAdresse: "196.202.12.14",
    createdAt: "2026-08-15T14:32:11Z",
  },
  {
    id: "audit-002",
    action: "FICHE_SOUMISE",
    acteurId: "n1-001",
    acteurNom: "Sevan AKOUMIA",
    cible: "Évaluation Ebenezer Samuel KOUAME",
    ancienneValeur: "EN_COURS",
    nouvelleValeur: "EN_ATTENTE_N2",
    ipAdresse: "196.202.12.14",
    createdAt: "2026-08-15T14:33:00Z",
  },
  {
    id: "audit-003",
    action: "CONNEXION",
    acteurId: "n2-001",
    acteurNom: "Koffi Alexis BAMBA",
    cible: "Session",
    ancienneValeur: null,
    nouvelleValeur: "CONNECTÉ",
    ipAdresse: "196.202.15.22",
    createdAt: "2026-08-16T09:01:45Z",
  },
  {
    id: "audit-004",
    action: "ARBITRAGE_OUVERT",
    acteurId: "n2-001",
    acteurNom: "Koffi Alexis BAMBA",
    cible: "Évaluation Oumar BAH — écart 3.4 pts",
    ancienneValeur: "EN_ATTENTE_RH",
    nouvelleValeur: "ARBITRAGE",
    ipAdresse: "196.202.15.22",
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "audit-005",
    action: "CYCLE_OUVERT",
    acteurId: "rh-001",
    acteurNom: "Mariam DIALLO",
    cible: "Cycle 2026",
    ancienneValeur: "BROUILLON",
    nouvelleValeur: "ACTIF",
    ipAdresse: "196.202.18.5",
    createdAt: "2026-01-15T09:00:00Z",
  },
];
