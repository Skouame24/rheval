// ============================================================
// lib/api/auth.api.ts
// Service Auth — Authentification Microsoft Entra ID (Azure AD) + Fallback Démo
// Prêt à basculer vers Entra ID dès réception des clés IT dans .env.local
// ============================================================

import { client } from "./client";
import type { Role, User } from "@/types";

export interface LoginDto {
  email: string;
  password?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface MicrosoftUserProfile {
  oid: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  manager?: {
    id: string;
    displayName: string;
    mail: string;
  };
}

// Vérifie si la configuration Entra ID est active dans l'environnement
export const isEntraIdConfigured = (): boolean => {
  return (
    !!process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_ID !== "votre-frontend-client-id" &&
    process.env.AZURE_AD_CLIENT_ID !== "placeholder-client-id"
  );
};

export const authApi = {
  /**
   * Se connecter via Microsoft Entra ID (SSO / Outlook)
   */
  loginMicrosoft: async (accessToken?: string): Promise<AuthResponse> => {
    return client.post<AuthResponse>("/auth/azure-ad", { accessToken });
  },

  /**
   * Authentification classique / fallback
   */
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    return client.post<AuthResponse>("/auth/login", dto);
  },

  /**
   * Récupère le profil courant
   */
  getMe: async (): Promise<User> => {
    return client.get<User>("/employees/me");
  },
};
