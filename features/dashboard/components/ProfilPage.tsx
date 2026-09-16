// ============================================================
// features/dashboard/components/ProfilPage.tsx
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { employeesApi } from "@/lib/api/employees.api";
import type { User } from "@/types";

function formatMatricule(id: string): string {
  if (/^AGY-/i.test(id)) return id.toUpperCase();
  const clean = id.replace(/-/g, "");
  return `AGY-${clean.slice(-6).toUpperCase()}`;
}

export function ProfilPage({ role }: { role: string }) {
  const { user: ssoUser } = useAuth();

  const [backendProfile, setBackendProfile] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");

  // Charge le profil complet depuis le backend (source de verite RH)
  useEffect(() => {
    setIsLoadingProfile(true);
    employeesApi.getMe()
      .then((data) => {
        console.log("📋 [ProfilPage] Informations reçues du backend (employeesApi.getMe) :", data);
        setBackendProfile(data);
      })
      .catch((err) => {
        console.warn("⚠️ [ProfilPage] Erreur ou profil backend non trouvé :", err);
        setBackendProfile(null);
      })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  // Synchronise les champs quand les donnees arrivent - fusion intelligente
  useEffect(() => {
    if (backendProfile || ssoUser) {
      // Priorité au prénom le plus complet
      const prenomFinal =
        (ssoUser?.prenom && ssoUser.prenom.length > (backendProfile?.prenom?.length || 0))
          ? ssoUser.prenom
          : (backendProfile?.prenom || ssoUser?.prenom || "");

      const nomFinal = ssoUser?.nom || backendProfile?.nom || "";

      console.log("🔍 [ProfilPage] Détail des informations utilisateur :", {
        source: backendProfile ? "Backend (DB)" : "SSO Microsoft",
        backendProfile,
        ssoUser,
        prenomFinal,
        nomFinal,
        managerN1: backendProfile?.n1 || ssoUser?.n1,
        telephone: backendProfile?.telephone || (ssoUser as any)?.telephone || "",
      });

      setPrenom(prenomFinal);
      setNom(nomFinal);
      setTelephone(backendProfile?.telephone || (ssoUser as any)?.telephone || "");
    }
  }, [backendProfile, ssoUser]);

  const user: User | null = ssoUser || backendProfile ? ({
    ...(ssoUser || {}),
    ...(backendProfile || {}),
    prenom: prenom || backendProfile?.prenom || ssoUser?.prenom || "",
    nom: nom || backendProfile?.nom || ssoUser?.nom || "",
    n1: backendProfile?.n1 || ssoUser?.n1,
    telephone: telephone || backendProfile?.telephone || (ssoUser as any)?.telephone || "",
    poste: (backendProfile?.poste && backendProfile.poste !== "Collaborateur Agilly") ? backendProfile.poste : (ssoUser?.poste || backendProfile?.poste || "Collaborateur Agilly"),
  } as User) : null;

  if (!ssoUser || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-agilly-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initiales = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() || "?";
  const nomComplet = `${user.prenom} ${user.nom}`.trim();
  const matricule = formatMatricule(user.id);
  const posteDisplay = (user.poste && user.poste.trim() !== "") ? user.poste : "Non renseigne";

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[900px] mx-auto">
      <PageHeader
        title="Mon Profil"
        subtitle="Gerez vos informations personnelles et professionnelles."
        breadcrumbs={[{ label: "Mon espace", href: `/dashboard/${role}` }, { label: "Profil" }]}
      />


      <div className="bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row p-8 gap-10">

        <div className="flex flex-col items-center gap-4 shrink-0 md:w-64 border-r border-gray-100 pr-8">
          <div className="w-32 h-32 bg-agilly-black text-white rounded-full flex items-center justify-center text-4xl font-black relative overflow-hidden">
            {initiales}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-xs uppercase font-bold text-white tracking-widest">Modifier</span>
            </div>
          </div>

          <div className="text-center mt-2">
            <h2 className="text-xl font-bold text-agilly-black m-0 mb-1">{nomComplet}</h2>
            <p className="text-sm font-medium text-gray-500 m-0 uppercase tracking-widest">{posteDisplay}</p>
          </div>

          <div className="w-full mt-4 flex flex-col gap-2">
            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Matricule</span>
              <span className="text-sm font-bold text-agilly-black font-mono">{matricule}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 border border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Departement</span>
              <span className="text-sm font-bold text-agilly-black text-right">{user.departement || "Non renseigne"}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-agilly-black m-0 border-b border-gray-200 pb-2">Informations de contact</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            <Input label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            <div className="md:col-span-2">
              <Input label="Adresse e-mail professionnelle" value={user.email} type="email" disabled />
              <span className="text-xs text-gray-400 mt-1 block">
                L'adresse e-mail professionnelle ne peut etre modifiee que par les RH.
              </span>
            </div>
            <Input
              label="Telephone mobile"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              type="tel"
              placeholder="+33 6 XX XX XX XX"
            />
            <Input label="Poste" value={posteDisplay} disabled />
          </div>

          {user.n1 && (
            <>
              <h3 className="text-lg font-bold text-agilly-black m-0 border-b border-gray-200 pb-2 mt-4">Management</h3>
              <div className="bg-[#F4F7FB] border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-600 m-0 mb-1">Votre Manager N+1 :</p>
                <p className="text-base font-bold text-agilly-black m-0">{user.n1.prenom} {user.n1.nom}</p>
                <p className="text-xs text-gray-500 m-0 mt-0.5">{user.n1.poste}</p>
              </div>
            </>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="primary">Enregistrer les modifications</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
