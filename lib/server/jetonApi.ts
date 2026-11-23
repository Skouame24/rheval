// ============================================================
// lib/server/jetonApi.ts — CÔTÉ SERVEUR UNIQUEMENT
// Signe le jeton d'identité court (HS256) envoyé par le proxy à l'API.
// Le secret AGILLY_API_SECRET n'est jamais exposé au navigateur.
// Doit rester aligné avec rhevalback/src/common/auth/auth.constants.ts
// ============================================================

import { createHmac } from "node:crypto";

const ISSUER = "agilly-portail";
const AUDIENCE = "agilly-api";
const DUREE_S = 120;

export interface IdentitePortail {
  /** oid Microsoft de l'utilisateur connecté */
  sub: string;
  email?: string;
  name?: string;
  /** Rôle calculé par le SSO (utilisé seulement à la création du compte) */
  role?: string;
  /** Profil simulé (honoré seulement si AUTORISER_SIMULATION=true des deux côtés) */
  sim?: string;
}

const base64url = (data: string | Buffer) => Buffer.from(data).toString("base64url");

export function secretApi(): string | null {
  const secret = process.env.AGILLY_API_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function signerJetonApi(identite: IdentitePortail, secret: string): string {
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const charge = base64url(
    JSON.stringify({ ...identite, iss: ISSUER, aud: AUDIENCE, iat: maintenant, exp: maintenant + DUREE_S }),
  );
  const signature = createHmac("sha256", secret).update(`${entete}.${charge}`).digest("base64url");
  return `${entete}.${charge}.${signature}`;
}
