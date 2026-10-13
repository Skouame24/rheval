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

export const TEST_PROFILES: TestProfile[] = [];

