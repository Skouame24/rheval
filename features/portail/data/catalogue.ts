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
  /** Classes Tailwind d'accent (icône, bordure haute, survol). */
  accent: { text: string; bg: string; border: string; top: string; hoverBorder: string; hoverBg: string; dot: string };
}

export const DEPARTEMENTS: Departement[] = [
  {
    code: "RH",
    label: "Ressources Humaines",
    accent: { text: "text-agilly-primary", bg: "bg-orange-50", border: "border-orange-100", top: "border-t-agilly-primary", hoverBorder: "hover:border-agilly-primary/60", hoverBg: "group-hover:bg-orange-50/70", dot: "bg-agilly-primary" },
  },
  {
    code: "FINANCE",
    label: "Finance & Comptabilité",
    accent: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", top: "border-t-emerald-600", hoverBorder: "hover:border-emerald-500/60", hoverBg: "group-hover:bg-emerald-50/70", dot: "bg-emerald-600" },
  },
  {
    code: "OPERATIONS",
    label: "Opérations",
    accent: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", top: "border-t-blue-600", hoverBorder: "hover:border-blue-500/60", hoverBg: "group-hover:bg-blue-50/70", dot: "bg-blue-600" },
  },
];

export const APPLICATIONS: PortailApp[] = [
  {
    id: "rheval",
    nom: "Performances",
    description: "Évaluations annuelles de performance, entretiens et suivi des objectifs.",
    departement: "RH",
    icon: "performance",
    href: "@dashboard",
    statut: "DISPONIBLE",
  },
  {
    id: "absences",
    nom: "Absences & Congés",
    description: "Congés payés, permissions, absences et contrôle des soldes en temps réel.",
    departement: "RH",
    icon: "absences",
    href: "/absences",
    statut: "DISPONIBLE",
  },
  {
    id: "competences",
    nom: "Évaluation Compétences",
    description: "Référentiel métier, cartographie des compétences et plans de carrière.",
    departement: "RH",
    icon: "competences",
    statut: "BIENTOT",
  },
  {
    id: "caisse",
    nom: "Pièces de caisse",
    description: "Avances et dépenses de caisse, circuit de validation DFC et archivage.",
    departement: "FINANCE",
    icon: "caisse",
    statut: "BIENTOT",
  },
  {
    id: "missions",
    nom: "Missions & Interventions",
    description: "Ordres de mission, déplacements professionnels et interventions terrain.",
    departement: "OPERATIONS",
    icon: "missions",
    href: "/absences/missions",
    statut: "DISPONIBLE",
  },
];

export function getDepartement(code: DepartementCode): Departement {
  return DEPARTEMENTS.find((d) => d.code === code) ?? DEPARTEMENTS[0];
}
