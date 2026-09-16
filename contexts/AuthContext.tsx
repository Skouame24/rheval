// ============================================================
// contexts/AuthContext.tsx
// Contexte global d'authentification — utilisateur connecté + rôle
// ============================================================

"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { Role, User } from "@/types";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";

// ─── Types ──────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchRole: (newRole: Role) => void;
  logout: () => void;
}

// ─── Contexte ───────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Users Démo par Rôle ────────────────────────────────────

const DEMO_USERS_BY_ROLE: Record<Role, User> = {
  SALARIE: {
    id: "sal-001",
    nom: "KOUAME",
    prenom: "Ebenezer Samuel",
    email: "e.kouame@agilly.com",
    role: "SALARIE",
    poste: "Développeur Fullstack",
    departement: "Direction Technique",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  N1: {
    id: "n1-001",
    nom: "AKOUMIA",
    prenom: "Sevan",
    email: "s.akoumia@agilly.com",
    role: "N1",
    poste: "Lead Developer / Manager N+1",
    departement: "Direction Technique",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  N2: {
    id: "n2-001",
    nom: "BAMBA",
    prenom: "Koffi Alexis",
    email: "k.bamba@agilly.com",
    role: "N2",
    poste: "Directeur des Opérations N+2",
    departement: "Direction Générale",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  RH: {
    id: "rh-001",
    nom: "DIALLO",
    prenom: "Mariam",
    email: "m.diallo@agilly.com",
    role: "RH",
    poste: "Chargée des Ressources Humaines",
    departement: "Direction RH",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  DRH: {
    id: "drh-001",
    nom: "KOUASSI",
    prenom: "Marie-Claire",
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
    poste: "Administrateur Système",
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

  // Synchronisation dynamique avec la session Microsoft Entra ID
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
      fetch(`${apiUrl}/auth/sync-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_microsoft: realUser.id,
          nom: realUser.nom,
          prenom: realUser.prenom,
          email: realUser.email,
          poste: realUser.poste,
          departement: realUser.departement,
          telephone: realUser.telephone,
          role: realUser.role,
          managerId: u.manager?.id || undefined,
        }),
      })
        .then(async (res) => {
          const syncRes = await res.json().catch(() => null);
          console.log("🔄 [AuthContext] Réponse sync-session backend :", syncRes);
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
    const newUser = DEMO_USERS_BY_ROLE[newRole] || DEMO_USERS_BY_ROLE["SALARIE"];
    localStorage.setItem("agilly_user", JSON.stringify(newUser));
    localStorage.setItem("agilly_token", "demo_token_" + newRole);
    setUser(newUser);
    window.location.href = ROLE_DASHBOARD[newRole] || "/dashboard/mon-espace";
  };

  const logout = async () => {
    localStorage.removeItem("agilly_user");
    localStorage.removeItem("agilly_token");
    setUser(null);
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
        login,
        switchRole,
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

