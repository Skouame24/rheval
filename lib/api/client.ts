// ============================================================
// lib/api/client.ts
// Instance fetch configurée — point d'entrée unique pour tous les appels API
// Tous les fichiers *.api.ts utilisent ce client, jamais fetch() directement
// ============================================================

import type { ApiError } from "@/types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Dans le navigateur, toujours passer par /api/proxy (Next.js rewrite vers le backend)
    // Cela élimine 100% des erreurs CORS, Mixed Content et blocages réseau
    return "/api/proxy";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://10.5.6.8:3001/api";
}

// ─── Classe d'erreur API ────────────────────────────────────

export class ApiRequestError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.statusCode = error.statusCode;
    this.code = error.code;
    this.details = error.details;
  }
}

// ─── Headers communs ────────────────────────────────────────

function getHeaders(includeBody = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (includeBody) {
    headers["Content-Type"] = "application/json";
  }

  // Injection du token JWT et identifiant utilisateur depuis le localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("agilly_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const savedUser = localStorage.getItem("agilly_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.id) headers["x-user-id"] = u.id;
      } catch {}
    }
  }

  return headers;
}

// ─── Gestion de la réponse ──────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorPayload: ApiError;
    try {
      const body = await response.json();
      // NestJS retourne { statusCode, message, error } pour les exceptions HTTP
      const message =
        (typeof body?.message === "string" ? body.message : null) ||
        (Array.isArray(body?.message) ? body.message.join(", ") : null) ||
        body?.error ||
        `Erreur ${response.status}`;
      errorPayload = {
        message,
        code: body?.error || "API_ERROR",
        statusCode: body?.statusCode || response.status,
        details: body?.details,
      };
    } catch {
      const statusMessages: Record<number, string> = {
        400: "Données invalides.",
        401: "Non autorisé — reconnectez-vous.",
        403: "Accès refusé.",
        404: "Ressource introuvable.",
        409: "Conflit — cet élément existe déjà.",
        422: "Données non traitables.",
        500: "Erreur serveur interne — veuillez réessayer.",
        502: "Serveur inaccessible.",
        503: "Service temporairement indisponible.",
      };
      errorPayload = {
        message: statusMessages[response.status] || `Erreur ${response.status}`,
        code: "NETWORK_ERROR",
        statusCode: response.status,
      };
    }
    throw new ApiRequestError(errorPayload);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

// ─── Méthodes HTTP ──────────────────────────────────────────

export const client = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(!!body),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  // Téléchargement de fichier (ex: export Excel)
  download: async (endpoint: string, filename: string): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new ApiRequestError({
      message: "Échec du téléchargement",
      code: "DOWNLOAD_ERROR",
      statusCode: response.status,
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
