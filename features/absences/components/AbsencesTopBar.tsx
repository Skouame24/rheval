// ============================================================
// features/absences/components/AbsencesTopBar.tsx
// Barre supérieure 56px — Fil d'Ariane, Recherche globale, Profil
// ============================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

export function AbsencesTopBar() {
  const pathname = usePathname();
  const { currentPersona, searchQuery, setSearchQuery, pendingValidationsCount, setIsDemoDrawerOpen } =
    useAbsences();
  const [showNotifications, setShowNotifications] = useState(false);

  // Détermination du titre du fil d'Ariane
  const getPageTitle = () => {
    if (pathname === "/absences") return "Vue d'ensemble";
    if (pathname.startsWith("/absences/demandes")) return "Mes demandes";
    if (pathname.startsWith("/absences/nouvelle")) return "Nouvelle demande";
    if (pathname.startsWith("/absences/validations")) return "Boîte d'arbitrage";
    if (pathname.startsWith("/absences/planning")) return "Planning d'équipe";
    if (pathname.startsWith("/absences/soldes")) return "Soldes & Droits";
    if (pathname.startsWith("/absences/registre")) return "Registre & GED";
    if (pathname.startsWith("/absences/rapports")) return "Rapports & Pilotage";
    return "Espace RH";
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* ── GAUCHE : FIL D'ARIANE ── */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/portail" className="text-slate-400 hover:text-slate-700 transition-colors">
          Portail
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/absences" className="text-slate-500 hover:text-slate-900 transition-colors">
          Absences & Congés
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-slate-900">{getPageTitle()}</span>
      </div>

      {/* ── MILIEU : BARRE DE RECHERCHE RAPIDE ── */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence (DEM-...), matricule, collaborateur..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#F0822A] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── DROITE : EXERCICE, NOTIFICATIONS, PROFIL ── */}
      <div className="flex items-center gap-3">
        {/* Badge Exercice */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <rect x="3" y="4" width="18" height="18" rx="0" ry="0" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
          </svg>
          <span>Exercice 2026</span>
        </div>

        {/* Cloche de Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            title="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {pendingValidationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F0822A] rounded-full" />
            )}
          </button>

          {/* Popover notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 shadow-md p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications de circuit</span>
                <span className="text-[10px] text-slate-400">{pendingValidationsCount} en attente</span>
              </div>
              {pendingValidationsCount > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="p-2 bg-[#FFF4EB] border-l-2 border-[#F0822A] text-[11px] text-slate-800">
                    <p className="font-semibold text-slate-900">Arbitrage requis</p>
                    <p className="text-slate-600 mt-0.5">
                      Vous avez {pendingValidationsCount} demande(s) en attente de votre décision hiérarchique.
                    </p>
                    <Link
                      href="/absences/validations"
                      onClick={() => setShowNotifications(false)}
                      className="inline-block mt-1 text-[11px] font-bold text-[#F0822A] hover:underline"
                    >
                      Consulter la boîte &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 py-2 text-center">
                  Aucune alerte de circuit en attente.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Séparateur discret */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Profil actif cliquable (ouvre le sélecteur démo) */}
        <button
          type="button"
          onClick={() => setIsDemoDrawerOpen(true)}
          className="flex items-center gap-2 p-1 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer text-left"
          title="Changer de rôle / profil démo"
        >
          <div className="w-7 h-7 bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            {currentPersona.prenom.charAt(0)}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {currentPersona.prenom.split(" ")[0]} {currentPersona.nom}
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight">
              Matr. {currentPersona.matricule}
            </span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
