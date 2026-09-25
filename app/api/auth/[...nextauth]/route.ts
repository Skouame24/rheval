// ============================================================
// app/api/auth/[...nextauth]/route.ts
// Route Handler NextAuth — Intégration Microsoft Entra ID (Azure AD)
// Gère la connexion SSO et la récupération des jetons Microsoft Graph
// ============================================================

import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import type { Role } from "@/types";

/** Enrichit le token avec les données Graph API (jobTitle, mobilePhone, department, manager) */
async function fetchGraphProfile(accessToken: string): Promise<{
  jobTitle?: string;
  mobilePhone?: string;
  department?: string;
  manager?: {
    id: string;
    displayName: string;
    mail?: string;
    jobTitle?: string;
  } | null;
} | null> {
  try {
    const res = await fetch("https://graph.microsoft.com/v1.0/me?$select=jobTitle,mobilePhone,department,displayName,mail", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = res.ok ? await res.json() : {};

    // Récupération automatique du Manager hiérarchique N+1 depuis Microsoft Graph
    let manager = null;
    try {
      const resManager = await fetch("https://graph.microsoft.com/v1.0/me/manager?$select=id,displayName,mail,jobTitle", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const mgrStatus = resManager.status;
      const mgrData = await resManager.json().catch(() => null);
      console.log(`[NextAuth Graph API] Appel /me/manager (status ${mgrStatus}) :`, mgrData);
      if (resManager.ok && mgrData) {
        manager = mgrData;
      }
    } catch (err) {
      console.error("[NextAuth Graph API] Erreur fetch /me/manager :", err);
    }

    return {
      ...profile,
      manager,
    };
  } catch (e) {
    console.error("[NextAuth Graph API] Erreur fetchGraphProfile :", e);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "f351e4f4-6b70-462e-9c80-eea701265f0d",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "4a824101-74e2-4eca-8f3a-dac68503d06f",
      authorization: {
        params: {
          prompt: "select_account",
          scope: "openid profile email User.Read User.ReadBasic.All",
        },
      },
      profile(profile) {
        // Microsoft Entra ID renvoie le mail dans 'email', 'preferred_username' ou 'upn'
        const email = profile.email || profile.preferred_username || profile.upn || "";
        const name =
          profile.name ||
          `${profile.given_name || ""} ${profile.family_name || ""}`.trim() ||
          email.split("@")[0] ||
          "Collaborateur";

        return {
          id: profile.oid || profile.sub || "ms-user",
          name: name,
          email: email,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      // 1. Sauvegarde des tokens de connexion OAuth
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (user) {
        token.oid = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      if (profile) {
        token.oid = profile.oid || profile.sub || token.oid;
        token.email = profile.email || profile.preferred_username || profile.upn || token.email;
        token.name = profile.name || token.name;
        // jobTitle & department depuis le profil si dispo (souvent absent du token ID)
        token.jobTitle = profile.jobTitle || token.jobTitle;
        token.department = profile.department || token.department;

        // Résolution automatique du rôle d'après les App Roles Azure ou l'email
        const emailLower = (token.email || "").toLowerCase();
        const azureRoles: string[] = profile.roles || [];
        let role: Role = "SALARIE";

        if (azureRoles.includes("RHEVAL.Admin") || azureRoles.includes("Admin") || emailLower.includes("admin")) {
          role = "ADMIN";
        } else if (azureRoles.includes("RHEVAL.DRH") || azureRoles.includes("DRH") || emailLower.includes("drh")) {
          role = "DRH";
        } else if (azureRoles.includes("RHEVAL.RH") || azureRoles.includes("RH") || emailLower.includes("rh")) {
          role = "RH";
        } else if (azureRoles.includes("RHEVAL.N2") || azureRoles.includes("N2") || emailLower.includes("n2") || emailLower.includes("bamba")) {
          role = "N2";
        } else if (azureRoles.includes("RHEVAL.N1") || azureRoles.includes("N1") || emailLower.includes("n1") || emailLower.includes("akoumia")) {
          role = "N1";
        } else {
          role = "SALARIE";
        }

        token.role = role;
      }

      // 2. Appel Graph API pour récupérer jobTitle, mobilePhone et Manager
      const tokenToUse = account?.access_token || token.accessToken;
      if (tokenToUse && !token.manager) {
        const graphData = await fetchGraphProfile(tokenToUse);
        if (graphData) {
          token.jobTitle = graphData.jobTitle || token.jobTitle;
          token.mobilePhone = graphData.mobilePhone || token.mobilePhone;
          token.department = graphData.department || token.department;
          token.manager = graphData.manager || token.manager;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session) {
        if (!session.user) {
          session.user = {} as any;
        }
        session.user.id = token.oid || token.id || token.sub || session.user.id;
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.role = token.role || session.user.role || "SALARIE";
        session.user.accessToken = token.accessToken;
        session.user.jobTitle = token.jobTitle || "";
        session.user.mobilePhone = token.mobilePhone || "";
        session.user.department = token.department || "Direction Générale";
        session.user.manager = token.manager || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "agilly_rheval_secret_key_entra_id_2026_sso",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


