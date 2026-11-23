// ============================================================
// lib/api/portail.api.ts
// Données du portail : anniversaires, préférences d'e-mail, avis assistant
// ============================================================

import { client } from "./client";

export interface MonAnniversaire {
  jour: number | null;
  mois: number | null;
  visible: boolean;
}

export interface AnniversaireRh {
  id: string;
  nom: string;
  email: string;
  poste: string | null;
  departement: string | null;
  jour: number | null;
  mois: number | null;
  visible: boolean;
}

export interface ResultatImport {
  misAJour: number;
  introuvables: string[];
  invalides: string[];
}

export type ModeEmail = "IMMEDIAT" | "ACTIONS" | "QUOTIDIEN" | "AUCUN";
export type PreferencesEmail = Record<string, ModeEmail>;

export const portailApi = {
  monAnniversaire: () => client.get<MonAnniversaire>("/portail/anniversaires/moi", { bypassCache: true }),

  enregistrerMonAnniversaire: (data: { jour: number | null; mois: number | null; visible: boolean }) =>
    client.put<MonAnniversaire>("/portail/anniversaires/moi", data),

  anniversairesRh: () => client.get<AnniversaireRh[]>("/rh/anniversaires", { bypassCache: true }),

  enregistrerAnniversaireRh: (id: string, data: { jour: number | null; mois: number | null }) =>
    client.put<{ id: string; jour: number | null; mois: number | null }>(`/rh/anniversaires/${encodeURIComponent(id)}`, data),

  importerAnniversaires: (texte: string) => client.post<ResultatImport>("/rh/anniversaires/import", { texte }),

  preferencesEmail: () => client.get<PreferencesEmail>("/notifications/preferences", { bypassCache: true }),

  enregistrerPreferenceEmail: (application: string, email: ModeEmail) =>
    client.put<PreferencesEmail>("/notifications/preferences", { application, email }),

  avisAssistant: (data: { entreeId: string | null; question: string; utile: boolean }) =>
    client.post<{ success: boolean }>("/portail/assistant/avis", data),
};
