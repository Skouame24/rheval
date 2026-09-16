// ============================================================
// components/layout/Header.tsx
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ROLE_METADATA } from "@/lib/constants/roles";
import type { Role } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  role: Role;
  userName: string;
  pageTitle?: string;
  notifCount?: number;
}

const ROLES_LIST: { role: Role; label: string; badgeBg: string }[] = [
  { role: "SALARIE", label: "Salarié", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { role: "N1", label: "Manager N+1", badgeBg: "bg-orange-50 text-[#F0822A] border-orange-200" },
  { role: "N2", label: "Direction N+2", badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
  { role: "RH", label: "DRH", badgeBg: "bg-purple-50 text-purple-700 border-purple-200" },
  { role: "ADMIN", label: "Admin", badgeBg: "bg-slate-100 text-slate-800 border-slate-300" },
];

export function Header({ role: initialRole, userName: initialUserName, pageTitle, notifCount = 2 }: HeaderProps) {
  const { user, switchRole, logout } = useAuth();
  const currentRole = user?.role || initialRole;
  const userName = user ? `${user.prenom} ${user.nom}` : initialUserName;
  const roleInfo = ROLE_METADATA[currentRole] || { labelCourt: currentRole };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 h-18 shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      {/* Gauche — Titre de Page */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          {pageTitle || "AGILLY RHEVAL"}
        </h1>
      </div>





      {/* Droite — Cloche & Profil */}
      <div className="flex items-center gap-4">
        {/* Cloche de Notifications */}
        <Link
          href="/dashboard/mon-espace/notifications"
          className="relative w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all rounded-none border border-slate-200"
          title="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white bg-[#F0822A] rounded-none shadow-sm">
              {notifCount}
            </span>
          )}
        </Link>

        {/* Ligne séparatrice */}
        <div className="w-px h-6 bg-slate-200" />

        {/* Profil Utilisateur avec Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none cursor-pointer p-1.5 -m-1.5 rounded-none hover:bg-slate-100 transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {userName}
              </p>
              <p className="text-[10px] font-bold text-[#F0822A] uppercase tracking-wider mt-0.5">
                {roleInfo.labelCourt}
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center text-[#F0822A] text-sm font-extrabold bg-[#FFF7ED] border border-[#F0822A]/30 rounded-none hover:border-[#F0822A] transition-all">
              {userName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
            </div>
          </button>

          {/* Menu Déroulant */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-300 shadow-md rounded-none z-50 flex flex-col py-2 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compte Connecté</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{userName}</p>
                <p className="text-xs text-slate-500">{user?.email || "utilisateur@agilly.com"}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold bg-[#FFF7ED] text-[#F0822A] border border-[#F0822A]/30">
                  Rôle actuel : {currentRole}
                </div>
              </div>




              <div className="py-1">
                <Link
                  href="/dashboard/mon-espace/profil"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#F0822A] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mon Profil
                </Link>
                <Link
                  href="/dashboard/mon-espace/parametres"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#F0822A] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Paramètres
                </Link>
              </div>

              <div className="py-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


