import type { Role } from "@/types";

export interface TestProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  roleLabel: string;
  poste: string;
  departement: string;
  managerId: string | null;
  isCodir: boolean;
  badgeBg: string;
}

export const TEST_PROFILES: TestProfile[] = [
  {
    id: "0a5c4c64-abdd-4f4f-a3af-00057ebdddfb",
    nom: "KOUAME",
    prenom: "Ebenezer Samuel",
    email: "ebenezer.kouame@agilly.net",
    role: "SALARIE",
    roleLabel: "Salarié",
    poste: "Développeur Fullstack",
    departement: "Holding/Business Unit Digital",
    managerId: "abe87afa-a80b-4a48-bed2-72b525325c81",
    isCodir: false,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "abe87afa-a80b-4a48-bed2-72b525325c81",
    nom: "KOFFI",
    prenom: "Jean-Marc",
    email: "responsable.digital@agilly.net",
    role: "N1",
    roleLabel: "Responsable",
    poste: "Responsable Pôle Digital & Web",
    departement: "Holding/Business Unit Digital",
    managerId: "dir-digital-8822-4a48-bed2-72b525325c81",
    isCodir: false,
    badgeBg: "bg-orange-50 text-[#F0822A] border-orange-200",
  },
  {
    id: "dir-digital-8822-4a48-bed2-72b525325c81",
    nom: "KABLAN",
    prenom: "Didier",
    email: "directeur.digital@agilly.net",
    role: "N2",
    roleLabel: "Directeur",
    poste: "Directeur des Systèmes d'Information & Digital",
    departement: "Direction Générale / Digital",
    managerId: "drh-agilly-9933-4a48-bed2-72b525325c81",
    isCodir: true,
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "drh-agilly-9933-4a48-bed2-72b525325c81",
    nom: "BAH",
    prenom: "Aissatou",
    email: "drh@agilly.net",
    role: "DRH",
    roleLabel: "DRH",
    poste: "Directrice des Ressources Humaines",
    departement: "Direction des Ressources Humaines",
    managerId: null,
    isCodir: true,
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "asst-rh-1144-4a48-bed2-72b525325c81",
    nom: "DIOP",
    prenom: "Fatou",
    email: "assistante.rh@agilly.net",
    role: "RH",
    roleLabel: "Assistante RH",
    poste: "Assistante Ressources Humaines",
    departement: "Direction des Ressources Humaines",
    managerId: "drh-agilly-9933-4a48-bed2-72b525325c81",
    isCodir: false,
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
  },
];

