// ============================================================
// contexts/AuthContext.tsx
// Contexte global d'authentification — 100% Microsoft SSO & sessions réelles
// ============================================================

"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { Role, User } from "@/types";
import { detectRoleFromPoste } from "@/lib/utils/roleDetector";

// ─── Types ──────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

// ─── Contexte ───────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

/** Anciennes clés (simulateur de profils, jeton local) à effacer des navigateurs */
const CLES_OBSOLETES = ["agilly_simulated_user", "agilly_user_role_override", "agilly_token", "agilly_test_persona_id"];

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronisation dynamique avec la session Microsoft Entra ID
  useEffect(() => {
    // Nettoyage des anciennes clés de simulation éventuellement restées dans le navigateur
    if (typeof window !== "undefined") {
      for (const cle of CLES_OBSOLETES) localStorage.removeItem(cle);
    }

    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    let cancelled = false;

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

      let assignedRole: Role = (u.role as Role) || "SALARIE";
      // Détection automatique intelligente basée sur le poste (Directeur, Responsable, RH, etc.)
      const detected = detectRoleFromPoste(u.jobTitle, u.email);
      if (assignedRole === "SALARIE" || assignedRole === "N1") {
        assignedRole = detected.role;
      }

      const realUser: User = {
        id: u.id,
        nom: nom || "Connecté",
        prenom: prenom,
        email: u.email || "",
        role: assignedRole,
        poste: u.jobTitle || "Collaborateur",
        departement: u.department || "Direction",
        telephone: u.mobilePhone || "",
        managerId: u.manager?.id,
        n1: n1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(realUser);
      localStorage.setItem("agilly_user", JSON.stringify(realUser));

      // Synchronisation optimisée avec PostgreSQL (anti-tempête : max 1 fois par tranche de 5 min par utilisateur)
      const lastSyncKey = `agilly_last_sync_${realUser.id}`;
      const lastSyncTime = typeof window !== "undefined" ? sessionStorage.getItem(lastSyncKey) : null;
      const shouldSync = !lastSyncTime || (Date.now() - Number(lastSyncTime) > 5 * 60 * 1000);
      if (shouldSync) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(lastSyncKey, Date.now().toString());
        }

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
            managerId: realUser.managerId,
            role: realUser.role,
          }),
        })
          .then(async (res) => {
            if (cancelled) return;
            if (!res.ok) return;
            const resData = await res.json().catch(() => null);
            if (resData?.user) {
              const dbUser = resData.user;
              setUser((current) => {
                if (!current) return current;
                const updated: User = {
                  ...current,
                  role: (dbUser.role as Role) || current.role,
                  n1: dbUser.n1 || current.n1,
                  n2: dbUser.n2 || current.n2,
                  drh: dbUser.drh || current.drh,
                };
                if (typeof window !== "undefined") {
                  localStorage.setItem("agilly_user", JSON.stringify(updated));
                }
                return updated;
              });
            }
          })
          .catch((e) => console.warn("[AuthContext] sync-session non bloquant:", e));
      }

      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    // Pas de session Microsoft : personne n'est connecté
    if (typeof window !== "undefined") localStorage.removeItem("agilly_user");
    setUser(null);
    setIsLoading(false);
  }, [status, session]);

  const logout = async () => {
    localStorage.removeItem("agilly_user");
    for (const cle of CLES_OBSOLETES) localStorage.removeItem(cle);
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
