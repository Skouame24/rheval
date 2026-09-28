// ============================================================
// contexts/AuthContext.tsx
// Contexte global d'authentification — utilisateur connecté + rôle
// ============================================================

"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { Role, User } from "@/types";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";
import { client } from "@/lib/api/client";

// ─── Types ──────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSimulated: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchRole: (newRole: Role) => void;
  resetToSsoUser: () => void;
  logout: () => void;
}

// ─── Contexte ───────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Users Démo & Test par Rôle (Synchronisés avec la Base PostgreSQL) ───

export const DEMO_USERS_BY_ROLE: Record<Role, User> = {
  SALARIE: {
    id: "0a5c4c64-abdd-4f4f-a3af-00057ebdddfb",
    nom: "KOUAME",
    prenom: "Ebenezer Samuel",
    email: "ebenezer.kouame@agilly.net",
    role: "SALARIE",
    poste: "Ingénieur Cloud & Mobilité",
    departement: "Direction Technique",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  N1: {
    id: "manager-id-5678",
    nom: "AUBERT",
    prenom: "Marc",
    email: "manager@agilly.com",
    role: "N1",
    poste: "Responsable Technique N+1",
    departement: "Direction Technique",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  N2: {
    id: "drh-id-1234",
    nom: "DELMAS",
    prenom: "Claire",
    email: "drh@agilly.com",
    role: "N2",
    poste: "Directrice des Ressources Humaines",
    departement: "Direction des Ressources Humaines",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  RH: {
    id: "drh-id-1234",
    nom: "DELMAS",
    prenom: "Claire",
    email: "drh@agilly.com",
    role: "RH",
    poste: "Directrice des Ressources Humaines",
    departement: "Direction des Ressources Humaines",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  DRH: {
    id: "drh-id-1234",
    nom: "DELMAS",
    prenom: "Claire",
    email: "drh@agilly.com",
    role: "DRH",
    poste: "Directrice des Ressources Humaines",
    departement: "Direction Générale RH",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ADMIN: {
    id: "adm-001",
    nom: "AGILLY",
    prenom: "Admin",
    email: "admin@agilly.com",
    role: "ADMIN",
    poste: "Administrateur Système RHEVAL",
    departement: "IT & Sécurité",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);

  // Synchronisation dynamique avec la session Microsoft Entra ID ou rôle simulé
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    // 1. Priorité au rôle simulé pour les tests (sessionStorage)
    const simulatedRole = typeof window !== "undefined" ? (sessionStorage.getItem("agilly_simulated_role") as Role) : null;
    if (simulatedRole && DEMO_USERS_BY_ROLE[simulatedRole]) {
      const simUser = DEMO_USERS_BY_ROLE[simulatedRole];
      setUser(simUser);
      setIsSimulated(true);
      localStorage.setItem("agilly_user", JSON.stringify(simUser));
      localStorage.setItem("agilly_token", "simulated_token_" + simulatedRole);
      setIsLoading(false);
      return;
    }

    setIsSimulated(false);

    if (status === "authenticated" && session?.user) {
      const u = session.user as any;
      const fullName = (u.name || "").trim();
      const nameParts = fullName.split(/\s+/);
      let prenom = "Collaborateur";
      let nom = fullName;
      if (nameParts.length > 1) {
        const uppercaseIndices = nameParts.map((p: string) => p.length > 1 && p === p.toUpperCase());
        const lastUpperIdx = uppercaseIndices.lastIndexOf(true);
        if (lastUpperIdx > 0) {
          prenom = nameParts.slice(0, lastUpperIdx).join(" ");
          nom = nameParts.slice(lastUpperIdx).join(" ");
        } else {
          prenom = nameParts.slice(0, -1).join(" ");
          nom = nameParts.slice(-1).join(" ");
        }
      }

      let n1 = undefined;
      if (u.manager) {
        const mgrNameParts = (u.manager.displayName || "").trim().split(" ");
        n1 = {
          id: u.manager.id,
          nom: mgrNameParts.length > 1 ? mgrNameParts.slice(1).join(" ") : (u.manager.displayName || "Manager"),
          prenom: mgrNameParts[0] || "",
          email: u.manager.mail || "",
          role: "N1" as Role,
          poste: u.manager.jobTitle || "Manager N+1",
        };
      }

      const realUser: User = {
        id: u.id || "ms-user",
        nom: nom || "Connecté",
        prenom: prenom,
        email: u.email || "collaborateur@agilly.com",
        role: (u.role as Role) || "SALARIE",
        poste: u.jobTitle || "",
        departement: u.department || "Direction Générale",
        telephone: u.mobilePhone || "",
        n1: n1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log("🔐 [AuthContext] Informations SSO reçues de NextAuth :", u);
      if (u.manager) {
        console.log("👔 [AuthContext] Manager N+1 détecté depuis Microsoft Graph :", u.manager);
      }
      console.log("👤 [AuthContext] Utilisateur initialisé (realUser) :", realUser);
      setUser(realUser);
      localStorage.setItem("agilly_user", JSON.stringify(realUser));
      if (u.accessToken) {
        localStorage.setItem("agilly_token", u.accessToken);
      }

      // Synchronisation immédiate avec la base de données PostgreSQL
      client
        .post("/auth/sync-session", {
          id_microsoft: realUser.id,
          nom: realUser.nom,
          prenom: realUser.prenom,
          email: realUser.email,
          poste: realUser.poste,
          departement: realUser.departement,
          telephone: realUser.telephone,
          role: realUser.role,
          managerId: u.manager?.id || undefined,
        })
        .then((syncRes: any) => {
          console.log("🔄 [AuthContext] Réponse sync-session backend :", syncRes);
          if (syncRes?.user) {
            const enrichedUser: User = {
              ...realUser,
              ...syncRes.user,
              id: syncRes.user.id || realUser.id,
              n1: syncRes.user.n1 || realUser.n1,
              n2: syncRes.user.n2 || realUser.n2,
              role: (syncRes.user.role as Role) || realUser.role,
            };
            setUser(enrichedUser);
            localStorage.setItem("agilly_user", JSON.stringify(enrichedUser));
            console.log("✨ [AuthContext] Session enrichie avec N1/N2 et rôle BD :", enrichedUser);
          }
        })
        .catch((err) => console.warn("[AuthContext] Erreur synchronisation session en base:", err));

      setIsLoading(false);
      return;
    }

    // Si non authentifié via NextAuth, on ne met rien
    setUser(null);
    setIsLoading(false);
  }, [session, status]);

  const login = async (email: string, password: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600));

    const role: Role = email.includes("rh")
      ? "RH"
      : email.includes("n2")
      ? "N2"
      : email.includes("n1")
      ? "N1"
      : email.includes("admin")
      ? "ADMIN"
      : "SALARIE";

    const selectedUser = {
      ...DEMO_USERS_BY_ROLE[role],
      email,
    };

    localStorage.setItem("agilly_user", JSON.stringify(selectedUser));
    localStorage.setItem("agilly_token", "demo_token_" + role);
    setUser(selectedUser);

    window.location.href = "/portail";
  };


  const switchRole = (newRole: Role) => {
    if (newRole === "SALARIE") {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("agilly_simulated_role");
      }
      setIsSimulated(false);
      const salarieUser = DEMO_USERS_BY_ROLE["SALARIE"];
      setUser(salarieUser);
      localStorage.setItem("agilly_user", JSON.stringify(salarieUser));
      localStorage.setItem("agilly_token", "sso_token_salarie");
      window.location.href = ROLE_DASHBOARD["SALARIE"] || "/dashboard/mon-espace";
      return;
    }

    const newUser = DEMO_USERS_BY_ROLE[newRole] || DEMO_USERS_BY_ROLE["SALARIE"];
    if (typeof window !== "undefined") {
      sessionStorage.setItem("agilly_simulated_role", newRole);
    }
    setIsSimulated(true);
    localStorage.setItem("agilly_user", JSON.stringify(newUser));
    localStorage.setItem("agilly_token", "simulated_token_" + newRole);
    setUser(newUser);
    window.location.href = ROLE_DASHBOARD[newRole] || "/dashboard/mon-espace";
  };

  const resetToSsoUser = () => {
    switchRole("SALARIE");
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("agilly_simulated_role");
    }
    localStorage.removeItem("agilly_user");
    localStorage.removeItem("agilly_token");
    setUser(null);
    setIsSimulated(false);
    try {
      await nextAuthSignOut({ redirect: false });
    } catch {}
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isLoading,
        isAuthenticated: !!user,
        isSimulated,
        login,
        switchRole,
        resetToSsoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

