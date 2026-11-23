// ============================================================
// app/api/proxy/[...chemin]/route.ts
// Proxy authentifié navigateur → API (remplace l'ancien rewrite).
//
// 1. Lit la session SSO Microsoft (cookie NextAuth httpOnly, côté serveur).
// 2. Signe une identité courte avec AGILLY_API_SECRET.
// 3. Transmet la requête à l'API : le navigateur ne peut plus choisir
//    « qui il est » (l'ancien en-tête x-user-id n'est plus cru).
// ============================================================

import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { BACKEND_URL as BACKEND, identiteDepuisSession, secretApi, signerJetonApi } from "@/lib/server/jetonApi";

/** En-têtes de la requête transmis à l'API (aucun en-tête d'identité) */
const ENTETES_REQUETE = ["content-type", "accept", "accept-language"];
/** En-têtes de la réponse renvoyés au navigateur */
const ENTETES_REPONSE = ["content-type", "content-disposition", "cache-control", "last-modified", "etag"];

async function relayer(req: NextRequest): Promise<Response> {
  const secret = secretApi();
  if (!secret) {
    console.error("[proxy] AGILLY_API_SECRET absent ou trop court : configuration serveur incomplète.");
    return NextResponse.json({ statusCode: 500, message: "Configuration serveur incomplète." }, { status: 500 });
  }

  const identite = identiteDepuisSession(await getToken({ req, secret: process.env.NEXTAUTH_SECRET }));
  if (!identite) {
    return NextResponse.json({ statusCode: 401, message: "Session expirée — reconnectez-vous." }, { status: 401 });
  }

  // Simulateur de profils : environnements de test uniquement
  const profilDemande = req.headers.get("x-user-id") || undefined;
  const sim =
    process.env.AUTORISER_SIMULATION === "true" && profilDemande && profilDemande !== identite.sub ? profilDemande : undefined;

  const jeton = signerJetonApi({ ...identite, sim }, secret);

  const chemin = req.nextUrl.pathname.replace(/^\/api\/proxy/, "");
  const cible = `${BACKEND}/api${chemin}${req.nextUrl.search}`;

  const entetes = new Headers({ authorization: `Bearer ${jeton}` });
  for (const nom of ENTETES_REQUETE) {
    const valeur = req.headers.get(nom);
    if (valeur) entetes.set(nom, valeur);
  }

  const avecCorps = !["GET", "HEAD"].includes(req.method);
  let reponse: Response;
  try {
    reponse = await fetch(cible, {
      method: req.method,
      headers: entetes,
      body: avecCorps ? await req.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (e) {
    console.error("[proxy] API injoignable :", cible, e);
    return NextResponse.json({ statusCode: 502, message: "Serveur inaccessible." }, { status: 502 });
  }

  const sortie = new Headers();
  for (const nom of ENTETES_REPONSE) {
    const valeur = reponse.headers.get(nom);
    if (valeur) sortie.set(nom, valeur);
  }
  return new Response(reponse.body, { status: reponse.status, headers: sortie });
}

export const GET = relayer;
export const POST = relayer;
export const PUT = relayer;
export const PATCH = relayer;
export const DELETE = relayer;
