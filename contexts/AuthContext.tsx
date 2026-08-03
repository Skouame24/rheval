// ============================================================
// contexts/AuthContext.tsx
// Contexte global d'authentification — utilisateur connecté + rôle
// ============================================================

"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restauration de session au montage
  useEffect(() => {
    const stored = localStorage.getItem("agilly_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("agilly_user");
      }
    } else {
      // Par défaut pour la démo
      setUser(DEMO_USERS_BY_ROLE["SALARIE"]);
      localStorage.setItem("agilly_user", JSON.stringify(DEMO_USERS_BY_ROLE["SALARIE"]));
    }
    setIsLoading(false);
  }, []);

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

    window.location.href = ROLE_DASHBOARD[role] || "/dashboard/mon-espace";
  };

  const switchRole = (newRole: Role) => {
    const newUser = DEMO_USERS_BY_ROLE[newRole] || DEMO_USERS_BY_ROLE["SALARIE"];
    localStorage.setItem("agilly_user", JSON.stringify(newUser));
    localStorage.setItem("agilly_token", "demo_token_" + newRole);
    setUser(newUser);
    window.location.href = ROLE_DASHBOARD[newRole] || "/dashboard/mon-espace";
  };

  const logout = () => {
    localStorage.removeItem("agilly_user");
    localStorage.removeItem("agilly_token");
    setUser(null);
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

