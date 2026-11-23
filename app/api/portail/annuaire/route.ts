// ============================================================
// app/api/portail/annuaire/route.ts
// Annuaire des collaborateurs depuis Microsoft Graph (jeton SSO de l'utilisateur)
//
// Permissions :
//  - User.ReadBasic.All (déjà demandée au login) : nom, prénom, e-mail, photo
//  - User.Read.All (délégué, consentement admin) : poste, direction,
//    téléphone, date d'embauche. Sans elle, ces champs reviennent vides.
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { appelerApi, identiteDepuisSession } from "@/lib/server/jetonApi";

interface GraphUser {
  id: string;
  displayName?: string | null;
  givenName?: string | null;
  surname?: string | null;
  mail?: string | null;
  userPrincipalName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  mobilePhone?: string | null;
  businessPhones?: string[] | null;
  officeLocation?: string | null;
  employeeHireDate?: string | null;
  createdDateTime?: string | null;
}

const SELECT = [
  "id",
  "displayName",
  "givenName",
  "surname",
  "mail",
  "userPrincipalName",
  "jobTitle",
  "department",
  "mobilePhone",
  "businessPhones",
  "officeLocation",
  "employeeHireDate",
  "createdDateTime",
].join(",");

const MAX_UTILISATEURS = 5000;

function estUnePersonne(u: GraphUser): boolean {
  if (!u.mail) return false; // salles, comptes techniques sans boîte
  if (u.userPrincipalName?.includes("#EXT#")) return false; // invités externes
  return Boolean(u.givenName || u.surname); // boîtes partagées : ni prénom ni nom
}

function versCollaborateur(u: GraphUser) {
  let prenom = u.givenName?.trim() ?? "";
  let nom = u.surname?.trim() ?? "";
  if (!prenom && !nom && u.displayName) {
    const [p, ...reste] = u.displayName.trim().split(/\s+/);
    prenom = p;
    nom = reste.join(" ");
  }
  return {
    id: u.id,
    prenom,
    nom,
    poste: u.jobTitle?.trim() || "",
    direction: u.department?.trim() || "Non renseignée",
    email: u.mail ?? "",
    telephone: u.mobilePhone || u.businessPhones?.[0] || undefined,
    bureau: u.officeLocation || undefined,
    dateArrivee: u.employeeHireDate || u.createdDateTime || undefined,
    photoUrl: `/api/portail/photo/${u.id}`,
  };
}

/** e-mail → { jour, mois } ; carte vide si l'API est indisponible (le portail reste utilisable) */
async function chargerAnniversaires(
  identite: NonNullable<ReturnType<typeof identiteDepuisSession>>,
): Promise<Map<string, { jour: number; mois: number }>> {
  try {
    const res = await appelerApi(identite, "/portail/anniversaires");
    if (!res.ok) return new Map();
    const liste: { email: string; jour: number; mois: number }[] = await res.json();
    return new Map(liste.map((a) => [a.email.toLowerCase(), { jour: a.jour, mois: a.mois }]));
  } catch {
    return new Map();
  }
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken as string | undefined;
  if (!accessToken) {
    return NextResponse.json({ erreur: "NON_CONNECTE" }, { status: 401 });
  }

  // Anniversaires (base Agilly) chargés en parallèle de Microsoft Graph
  const identite = identiteDepuisSession(token);
  const anniversairesP = identite ? chargerAnniversaires(identite) : Promise.resolve(new Map());

  const utilisateurs: GraphUser[] = [];
  let url: string | null = `https://graph.microsoft.com/v1.0/users?$select=${SELECT}&$top=999`;

  while (url && utilisateurs.length < MAX_UTILISATEURS) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      // 401 = jeton Microsoft expiré (≈ 1 h) → reconnexion nécessaire
      return NextResponse.json(
        { erreur: res.status === 401 ? "JETON_EXPIRE" : `GRAPH_${res.status}` },
        { status: res.status === 401 ? 401 : 502 },
      );
    }
    const data: { value: GraphUser[]; "@odata.nextLink"?: string } = await res.json();
    utilisateurs.push(...data.value);
    url = data["@odata.nextLink"] ?? null;
  }

  const anniversaires = await anniversairesP;
  const collaborateurs = utilisateurs
    .filter(estUnePersonne)
    .map(versCollaborateur)
    .map((c) => {
      const a = anniversaires.get(c.email.toLowerCase());
      return a ? { ...c, anniversaire: a } : c;
    })
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return NextResponse.json(
    { collaborateurs },
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
