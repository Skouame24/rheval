// ============================================================
// types/user.types.ts
// Types liés aux utilisateurs et aux rôles
// ============================================================

export type Role = "SALARIE" | "RH" | "DRH" | "ADMIN" | "N1" | "N2";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  poste: string;
  departement: string;
  telephone?: string;        // Mobile depuis Microsoft Graph
  n1?: UserSummary;          // Manager direct
  n2?: UserSummary;          // Supérieur du manager
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Version légère pour les références (ex: dans évaluation)
export interface UserSummary {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  poste: string;
}

// DTO pour la création / modification d'un utilisateur
export interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  poste: string;
  departement: string;
  n1Id?: string;
  n2Id?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
