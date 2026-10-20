// ============================================================
// features/absences/components/AbsencesTopBar.tsx
// Barre supérieure 56px allégée, icône de notifications (EF-41)
// Identité unique de l'utilisateur avec son profil
// ============================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

export function AbsencesTopBar() {
  const pathname = usePathname();
  const { currentPersona, pendingValidationsCount, setIsDemoDrawerOpen } = useAbsences();
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/absences") return "Tableau de bord";
    if (pathname === "/absences/demandes") return "Mes demandes";
    if (pathname.startsWith("/absences/nouvelle")) return "Nouvelle demande";
    if (pathname.startsWith("/absences/validations")) return "Boîte d'arbitrage";
    if (pathname.startsWith("/absences/planning")) return "Agenda des présences";
    if (pathname.startsWith("/absences/soldes")) return "Soldes & droits";
    if (pathname.startsWith("/absences/registre")) return "Registre & GED";
    if (pathname.startsWith("/absences/rapports")) return "Rapports & pilotage";
    return "Absences & permissions";
  };

  const notifications = [
    {
      id: "notif-1",
      texte: "Votre demande DEM-2026-00141 a été retournée par votre supérieur pour révision.",
      date: "Il y a 2h",
      lu: false,
    },
    {
      id: "notif-2",
      texte: "Permission DEM-2026-00130 approuvée par la DRH (Circuit court).",
      date: "Hier",
      lu: true,
    },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* ── GAUCHE : FIL D'ARIANE SOBRE EN MINUSCULES ── */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/portail" className="text-slate-500 hover:text-slate-800 transition-colors">
          Portail
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900">{getPageTitle()}</span>
      </div>

      {/* ── DROITE : NOTIFICATIONS (EF-41) & IDENTITÉ UNIQUE DE L'UTILISATEUR ── */}
      <div className="flex items-center gap-4">
        {/* Badge validation si valideur */}
        {pendingValidationsCount > 0 && (
          <Link
            href="/absences/validations"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#B95914] bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
          >
            <span>{pendingValidationsCount} à valider</span>
          </Link>
        )}

        {/* ── ICÔNE DE NOTIFICATIONS (EXIGENCE EF-41) ── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Notifications des demandes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#D96F1D] rounded-full ring-2 ring-white" />
          </button>

          {/* Tiroir déroulant des notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-slate-500">2 reçues</span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 flex flex-col gap-0.5">
                    <p className={`text-xs ${n.lu ? "text-slate-600" : "font-semibold text-slate-900"}`}>
                      {n.texte}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── IDENTITÉ OFFICIELLE UNIQUE DE L'UTILISATEUR ── */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            {currentPersona.prenom.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {currentPersona.prenom} {currentPersona.nom}
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight">
              Matr. {currentPersona.matricule} • {currentPersona.poste}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
