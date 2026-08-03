// ============================================================
// lib/api/client.ts
// Instance fetch configurée — point d'entrée unique pour tous les appels API
// Tous les fichiers *.api.ts utilisent ce client, jamais fetch() directement
// ============================================================

import type { ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

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

  // Injection du token JWT depuis le localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("agilly_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// ─── Gestion de la réponse ──────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorPayload: ApiError;
    try {
      errorPayload = await response.json();
    } catch {
      errorPayload = {
        message: "Une erreur inattendue s'est produite",
        code: "UNKNOWN_ERROR",
        statusCode: response.status,
      };
    }
    throw new ApiRequestError(errorPayload);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ─── Méthodes HTTP ──────────────────────────────────────────

export const client = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(!!body),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  // Téléchargement de fichier (ex: export Excel)
  download: async (endpoint: string, filename: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
