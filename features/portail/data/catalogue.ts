// ============================================================
// features/portail/data/catalogue.ts
// Catalogue des applications de l'écosystème Agilly.
// Ajouter une application = ajouter une entrée ici (à terme : table en base).
// ============================================================

export type DepartementCode = "RH" | "FINANCE" | "OPERATIONS";

export type AppIconKey = "performance" | "absences" | "missions" | "competences" | "caisse";

export interface PortailApp {
  id: string;
  nom: string;
  description: string;
  departement: DepartementCode;
  icon: AppIconKey;
  /** Route interne. "@dashboard" = tableau de bord RHEVAL selon le rôle de l'utilisateur. */
  href?: string;
  statut: "DISPONIBLE" | "BIENTOT";
}

export interface Departement {
  code: DepartementCode;
  label: string;
  /** Classes Tailwind d'accent (icône, survol). */
  accent: { text: string; bg: string; border: string };
}

export const DEPARTEMENTS: Departement[] = [
  {
    code: "RH",
    label: "Ressources Humaines",
    accent: { text: "text-agilly-primary", bg: "bg-orange-50", border: "border-orange-100" },
  },
  {
    code: "FINANCE",
    label: "Finance & Comptabilité",
    accent: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  },
  {
    code: "OPERATIONS",
    label: "Opérations",
    accent: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  },
];

export const APPLICATIONS: PortailApp[] = [
  {
    id: "rheval",
    nom: "Performances",
    description: "Évaluations annuelles, objectifs et entretiens.",
    departement: "RH",
    icon: "performance",
    href: "@dashboard",
    statut: "DISPONIBLE",
  },
  {
    id: "absences",
    nom: "Absences & Congés",
    description: "Congés, permissions et suivi des soldes.",
    departement: "RH",
    icon: "absences",
    href: "/absences",
    statut: "DISPONIBLE",
  },
  {
    id: "competences",
    nom: "Évaluation Compétences",
    description: "Référentiel métier et plans de carrière.",
    departement: "RH",
    icon: "competences",
    statut: "BIENTOT",
  },
  {
    id: "caisse",
    nom: "Pièces de caisse",
    description: "Avances et dépenses de caisse, validation DFC.",
    departement: "FINANCE",
    icon: "caisse",
    statut: "BIENTOT",
  },
  {
    id: "missions",
    nom: "Missions & Interventions",
    description: "Ordres de mission, déplacements et interventions.",
    departement: "OPERATIONS",
    icon: "missions",
    href: "/absences/missions",
    statut: "DISPONIBLE",
  },
];

export function getDepartement(code: DepartementCode): Departement {
  return DEPARTEMENTS.find((d) => d.code === code) ?? DEPARTEMENTS[0];
}
