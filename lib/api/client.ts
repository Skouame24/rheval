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

    const savedUserStr = localStorage.getItem("agilly_user");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.id) headers["x-user-id"] = u.id;
        if (u.email) headers["x-user-email"] = u.email;
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

// ─── Cache en mémoire, Déduplication & SWR Réactif ──────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();
const DEFAULT_CACHE_TTL = 3 * 60 * 1000; // 3 minutes de persistance maximale
const STALE_REVALIDATE_TTL = 15 * 1000;  // 15 secondes avant revalidation en arrière-plan

function getCacheKey(endpoint: string): string {
  if (typeof window === "undefined") return endpoint;
  let uId = "anon";
  try {
    const savedUser = localStorage.getItem("agilly_user");
    if (savedUser) {
      uId = JSON.parse(savedUser).id || "anon";
    }
  } catch {}
  return `${uId}:${endpoint}`;
}

/** Lecture synchrone immédiate du cache (0ms) pour affichage instantané sans spinner */
export function peekApiCache<T>(endpoint: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  const key = getCacheKey(endpoint);
  const entry = apiCache.get(key);
  if (entry && Date.now() - entry.timestamp < DEFAULT_CACHE_TTL) {
    return entry.data as T;
  }
  return undefined;
}

/** Invalidation et notification automatique de toute l'application */
export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
  } else {
    for (const key of apiCache.keys()) {
      if (key.includes(prefix)) {
        apiCache.delete(key);
      }
    }
  }
  // Notifier réactivement toute l'application dans le navigateur qu'une donnée a changé
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("agilly:data_changed", { detail: { prefix } }));
  }
}

/** Écouteur global de mutation de données */
export function onDataChanged(callback: (prefix?: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ prefix?: string }>;
    callback(custom.detail?.prefix);
  };
  window.addEventListener("agilly:data_changed", handler);
  return () => window.removeEventListener("agilly:data_changed", handler);
}

// ─── Méthodes HTTP ──────────────────────────────────────────

export const client = {
  /** Invalidation manuelle du cache client */
  clearCache: clearApiCache,
  /** Lecture synchrone instantanée */
  peekCache: peekApiCache,
  /** Abonnement aux changements de données */
  onDataChanged,

  get: async <T>(
    endpoint: string,
    options?: { bypassCache?: boolean; ttl?: number }
  ): Promise<T> => {
    // Si exécuté côté serveur (SSR), pas de cache en mémoire
    if (typeof window === "undefined") {
      const response = await fetch(`${getBaseUrl()}${endpoint}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse<T>(response);
    }

    const cacheKey = getCacheKey(endpoint);
    const maxTtl = options?.ttl ?? DEFAULT_CACHE_TTL;

    // 1. Retour instantané si en cache (0ms) + Revalidation en arrière-plan (Stale-While-Revalidate)
    if (!options?.bypassCache) {
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < maxTtl) {
        const isStale = Date.now() - cached.timestamp > STALE_REVALIDATE_TTL;
        if (isStale && !pendingRequests.has(cacheKey)) {
          // Revalidation silencieuse en arrière-plan sans bloquer l'interface
          (async () => {
            try {
              const res = await fetch(`${getBaseUrl()}${endpoint}`, {
                method: "GET",
                headers: getHeaders(),
              });
              const freshData = await handleResponse<T>(res);
              const oldStr = JSON.stringify(cached.data);
              const newStr = JSON.stringify(freshData);
              if (oldStr !== newStr) {
                apiCache.set(cacheKey, { data: freshData, timestamp: Date.now() });
                window.dispatchEvent(new CustomEvent("agilly:data_changed", { detail: { prefix: endpoint } }));
              } else {
                cached.timestamp = Date.now();
              }
            } catch {}
          })();
        }
        return cached.data as T;
      }
    }

    // 2. Déduplication si la requête est déjà en cours d'exécution
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey) as Promise<T>;
    }

    // 3. Exécution de l'appel réseau
    const requestPromise = (async () => {
      try {
        const response = await fetch(`${getBaseUrl()}${endpoint}`, {
          method: "GET",
          headers: getHeaders(),
        });
        const data = await handleResponse<T>(response);
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    const result = await handleResponse<T>(response);
    // Invalidation automatique du cache après mutation et notification globale
    clearApiCache();
    return result;
  },

  put: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(!!body),
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await handleResponse<T>(response);
    clearApiCache();
    return result;
  },

  patch: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    const result = await handleResponse<T>(response);
    clearApiCache();
    return result;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await handleResponse<T>(response);
    clearApiCache();
    return result;
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
