// ============================================================
// contexts/AuthContext.tsx
// Contexte global d'authentification — 100% Microsoft SSO & sessions réelles
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
  isSimulated: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchRole: (newRole: Role) => void;
  resetToSsoUser: () => void;
  logout: () => void;
}

// ─── Contexte ───────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronisation dynamique avec la session Microsoft Entra ID réelle
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
        id: u.id,
        nom: nom || "Connecté",
        prenom: prenom,
        email: u.email || "",
        role: (u.role as Role) || "SALARIE",
        poste: u.jobTitle || "Collaborateur",
        departement: u.department || "Direction",
        telephone: u.mobilePhone || "",
        n1: n1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(realUser);
      localStorage.setItem("agilly_user", JSON.stringify(realUser));
      if (u.accessToken) {
        localStorage.setItem("agilly_token", u.accessToken);
      }

      // Synchronisation avec la base de données PostgreSQL via /api/proxy (HTTPS, même domaine, pas de Mixed Content ni CORS)
      const syncUrl = typeof window !== "undefined" ? "/api/proxy/auth/sync-session" : `${process.env.NEXT_PUBLIC_API_URL ?? "http://10.5.6.8:3001/api"}/auth/sync-session`;
      fetch(syncUrl, {
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
          managerId: u.manager?.id || null,
        }),
      }).catch((e) => console.warn("[AuthContext] sync-session non bloquant:", e));

      setIsLoading(false);
      return;
    }

    // Si non connecté via Microsoft, vérifier si une session locale persiste
    const stored = typeof window !== "undefined" ? localStorage.getItem("agilly_user") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [status, session]);

  const login = async (email: string): Promise<void> => {
    // Méthode de secours
    console.info("[Auth] Connexion standard pour:", email);
  };

  const switchRole = (newRole: Role) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("agilly_user", JSON.stringify(updatedUser));
      window.location.href = ROLE_DASHBOARD[newRole] || "/dashboard/mon-espace";
    }
  };

  const resetToSsoUser = () => {
    window.location.href = "/portail";
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
        isSimulated: false,
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
