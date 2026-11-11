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
    roleLabel: "Salarié / Développeur",
    poste: "Développeur Fullstack",
    departement: "Direction Juridique & Digital",
    managerId: "1f77edad-716c-4552-b96f-58ec7d1ee1d7",
    isCodir: false,
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "1f77edad-716c-4552-b96f-58ec7d1ee1d7",
    nom: "TIANGBO",
    prenom: "Ange-Dieudonne",
    email: "ange.tiangbo@agilly.net",
    role: "N1",
    roleLabel: "Responsable / Manager N+1",
    poste: "Responsable Juridique & Conformité",
    departement: "Direction Juridique",
    managerId: "aaf364d4-b002-4ae1-943d-d7ab5ec90a9a",
    isCodir: false,
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "c970e84d-5fd5-4cb9-8c4e-7cccc14ad269",
    nom: "YAO",
    prenom: "Germaine",
    email: "germaine.yao@agilly.net",
    role: "DRH",
    roleLabel: "Direction des Ressources Humaines (DRH)",
    poste: "Directrice des Ressources Humaines",
    departement: "Direction des Ressources Humaines",
    managerId: "aaf364d4-b002-4ae1-943d-d7ab5ec90a9a",
    isCodir: true,
    badgeBg: "bg-purple-100 text-purple-800 border-purple-300",
  },
  {
    id: "aaf364d4-b002-4ae1-943d-d7ab5ec90a9a",
    nom: "AKPA",
    prenom: "David Martial",
    email: "david.akpa@agilly.net",
    role: "N2",
    roleLabel: "Directeur de Département (N+2)",
    poste: "Directeur Exécutif Pôle Opérations",
    departement: "Direction Exécutive",
    managerId: "pdg-christian-bamba-0001",
    isCodir: true,
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  {
    id: "pdg-christian-bamba-0001",
    nom: "BAMBA",
    prenom: "Christian",
    email: "christian.bamba@agilly.com",
    role: "N2",
    roleLabel: "PDG / Direction Générale du Groupe",
    poste: "Président Directeur Général (PDG)",
    departement: "Direction Générale",
    managerId: null,
    isCodir: true,
    badgeBg: "bg-orange-100 text-orange-900 border-orange-400",
  },
];

