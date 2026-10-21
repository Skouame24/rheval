// ============================================================
// components/shared/UserRoleSwitcher.tsx
// Sélecteur rapide de rôles et d'acteurs de test pour le parcours
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Role, User } from "@/types";

export const TEST_ACTORS: Array<{
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  poste: string;
  departement: string;
  badge: string;
  badgeColor: string;
  description: string;
}> = [
  {
    id: "1f77edad-716c-4552-b96f-58ec7d1ee1d7",
    nom: "TIANGBO",
    prenom: "Ange-Dieudonne",
    email: "ange.tiangbo@agilly.net",
    role: "N1",
    poste: "Directeur Juridique & Conformité / DPO",
    departement: "Direction Juridique/COVERPOINT",
    badge: "Manager N+1",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Fixe les objectifs et note Sylvain",
  },
  {
    id: "1e088664-6faf-484a-98ce-92de8fbdfb39",
    nom: "OUEDRAOGO",
    prenom: "Sylvain Windigoudou",
    email: "sylvain.ouedraogo@agilly.net",
    role: "SALARIE",
    poste: "Chargé de mission GRC",
    departement: "COVERPOINT",
    badge: "Collaborateur",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Collaborateur sous Ebenezer Samuel KOUAME",
  },
  {
    id: "aaf364d4-b002-4ae1-943d-d7ab5ec90a9a",
    nom: "AKPA",
    prenom: "David Martial",
    email: "david.akpa@agilly.net",
    role: "N2",
    poste: "Directeur Exécutif",
    departement: "Direction Générale",
    badge: "Direction N+2",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Supervise et arbitre les litiges N+2",
  },
  {
    id: "c970e84d-5fd5-4cb9-8c4e-7cccc14ad269",
    nom: "YAO",
    prenom: "Germaine",
    email: "germaine.yao@agilly.net",
    role: "DRH",
    poste: "Directrice des Ressources Humaines",
    departement: "Direction des Ressources Humaines",
    badge: "DRH / Pilotage RH",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Pilotage central, conciliation et clôture",
  },
  {
    id: "4d8b00e4-b383-4beb-b819-c184b5eddce4",
    nom: "GNAGNE",
    prenom: "Marie Ruth",
    email: "ruth.gnagne@agilly.net",
    role: "SALARIE",
    poste: "Juriste Affaires et PDCP",
    departement: "Direction Juridique",
    badge: "Collaboratrice",
    badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
    description: "Collaboratrice sous Ebenezer Samuel KOUAME",
  },
  {
    id: "0a5c4c64-abdd-4f4f-a3af-00057ebdddfb",
    nom: "KOUAME",
    prenom: "Ebenezer Samuel",
    email: "ebenezer.kouame@agilly.net",
    role: "N1",
    poste: "Responsable Technique & Digital",
    departement: "Technique & Digital",
    badge: "Mon Compte (N+1)",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-300",
    description: "Manager N+1 direct de Sylvain OUEDRAOGO et Ruth GNAGNE",
  },
];

const ROLES_LIST: Array<{ role: Role; label: string; icon: string }> = [
  { role: "SALARIE", label: "Collaborateur (Salarié)", icon: "👤" },
  { role: "N1", label: "Manager N+1", icon: "👔" },
  { role: "N2", label: "Direction N+2", icon: "👑" },
  { role: "DRH", label: "Pilotage DRH / RH", icon: "💼" },
];

export function UserRoleSwitcher() {
  const { user, isSimulated, switchRole, switchProfile, resetToSsoUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRole = user?.role || "SALARIE";

  const handleSelectActor = (actor: typeof TEST_ACTORS[0]) => {
    const newUser: User = {
      id: actor.id,
      nom: actor.nom,
      prenom: actor.prenom,
      email: actor.email,
      role: actor.role,
      poste: actor.poste,
      departement: actor.departement,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (switchProfile) {
      switchProfile(newUser);
    }
    setIsOpen(false);
  };

  const handleSelectRole = (newRole: Role) => {
    switchRole(newRole);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bouton déclencheur dans le Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer shadow-2xs rounded-none bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border-amber-300"
        title="Changer d'acteur ou de rôle pour tester le parcours"
      >
        <span className="text-sm">⚡</span>
        <div className="text-left hidden md:block">
          <span className="block text-[9px] uppercase font-extrabold tracking-wider text-amber-700 leading-none">
            {isSimulated ? "🎭 Acteur simulé" : "Bascule rapide"}
          </span>
          <span className="block font-black text-xs text-slate-900 leading-tight mt-0.5">
            {currentRole} • {user?.prenom || user?.nom || "Profil"}
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`transition-transform duration-200 text-amber-800 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Menu Modal / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-300 shadow-xl rounded-none z-50 overflow-hidden animate-fade-in text-xs">
          {/* Header du switcher */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <p className="font-extrabold text-sm m-0 flex items-center gap-1.5">
                <span>⚡</span> Simulateur de Rôles & Acteurs
              </p>
              <p className="text-[11px] text-slate-300 m-0 mt-0.5">
                Passez d'un rôle ou acteur à l'autre pour tester le parcours
              </p>
            </div>
            {isSimulated && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                Mode Simulé
              </span>
            )}
          </div>

          <div className="max-h-[75vh] overflow-y-auto divide-y divide-slate-100">
            {/* 1. Changer de rôle pour le profil en cours */}
            <div className="p-3 bg-slate-50/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                1. Changer de rôle (profil actuel)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {ROLES_LIST.map((r) => {
                  const isActive = currentRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleSelectRole(r.role)}
                      className={`flex items-center gap-2 p-2 text-left font-bold transition-all border cursor-pointer ${
                        isActive
                          ? "bg-[#F0822A] text-white border-[#F0822A] shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-sm">{r.icon}</span>
                      <span className="truncate">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Basculer directement sur un acteur clé de la hiérarchie */}
            <div className="p-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                2. Incarner un acteur de la hiérarchie
              </span>
              <div className="space-y-1.5">
                {TEST_ACTORS.map((act) => {
                  const isCurrent = user?.id === act.id;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleSelectActor(act)}
                      className={`w-full text-left p-2.5 transition-all border flex items-start justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? "bg-amber-50/90 border-amber-400 ring-1 ring-amber-400"
                          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 m-0 text-xs">
                            {act.prenom} {act.nom}
                          </p>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 border uppercase ${act.badgeColor}`}
                          >
                            {act.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate m-0 mt-0.5">
                          {act.poste}
                        </p>
                        <p className="text-[10px] text-slate-400 italic m-0 mt-0.5">
                          {act.description}
                        </p>
                      </div>

                      {isCurrent && (
                        <span className="text-emerald-600 font-extrabold text-sm shrink-0">
                          ✓ Actif
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Action de réinitialisation si simulation active */}
            {isSimulated && (
              <div className="p-3 bg-red-50/60 border-t border-red-100 flex items-center justify-between">
                <span className="text-[11px] text-red-800 font-bold">
                  Vous êtes en simulation
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (resetToSsoUser) resetToSsoUser();
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs cursor-pointer shadow-2xs"
                >
                  ❌ Revenir à mon compte réel SSO
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
