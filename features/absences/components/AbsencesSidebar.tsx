// ============================================================
// features/absences/components/AbsencesSidebar.tsx
// Barre latérale gauche 240px — Design IBM Carbon x Agilly
// Respect strict de la géométrie carrée (rounded-none) & accent orange
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

export function AbsencesSidebar() {
  const pathname = usePathname();
  const { currentPersona, pendingValidationsCount, setIsDemoDrawerOpen } = useAbsences();

  const isRouteActive = (href: string) => {
    if (href === "/absences") {
      return pathname === "/absences";
    }
    return pathname.startsWith(href);
  };

  const navSections = [
    {
      title: "MON ESPACE",
      items: [
        {
          label: "Vue d'ensemble",
          href: "/absences",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
          ),
        },
        {
          label: "Mes demandes",
          href: "/absences/demandes",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          ),
        },
        {
          label: "Soldes & Droits",
          href: "/absences/soldes",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="0" ry="0" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "VALIDATION HIÉRARCHIQUE",
      items: [
        {
          label: "Boîte d'arbitrage",
          href: "/absences/validations",
          badge: pendingValidationsCount > 0 ? pendingValidationsCount : undefined,
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
        },
        {
          label: "Planning d'équipe",
          href: "/absences/planning",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="0" ry="0" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "GESTION RH & DIRECTION",
      items: [
        {
          label: "Registre & GED",
          href: "/absences/registre",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          ),
        },
        {
          label: "Rapports & Pilotage",
          href: "/absences/rapports",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between shrink-0 select-none z-30">
      {/* ── HAUT : BRANDING & ACTION PRINCIPALE ── */}
      <div className="flex flex-col">
        {/* Entête Marque Agilly */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/absences" className="flex items-center gap-2.5 group">
            {/* Logo Agilly géométrique */}
            <div className="w-8 h-8 bg-[#F0822A] flex items-center justify-center font-bold text-white text-base tracking-tighter shadow-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-extrabold text-sm tracking-tight leading-none group-hover:text-[#F0822A] transition-colors">
                AGILLY
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Absences & Congés
              </span>
            </div>
          </Link>
          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 border border-slate-200 uppercase">
            v2.4
          </span>
        </div>

        {/* Bouton Action Principale Unique */}
        <div className="p-3.5 border-b border-slate-100">
          <Link
            href="/absences/nouvelle"
            className="w-full flex items-center justify-center gap-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold text-xs py-2.5 px-3 shadow-xs transition-all duration-150 cursor-pointer text-center"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nouvelle demande</span>
          </Link>
        </div>

        {/* ── NAVIGATION STRUCTURÉE EN SECTIONS ── */}
        <nav className="p-3 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-1">
              <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {section.title}
              </span>
              {section.items.map((item) => {
                const active = isRouteActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center justify-between px-2.5 py-2 text-xs font-medium transition-colors
                      ${
                        active
                          ? "bg-[#FFF4EB] text-[#F0822A] font-semibold border-l-2 border-[#F0822A]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={active ? "text-[#F0822A]" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#F0822A] text-white leading-tight">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── BAS : RETOUR PORTAIL + PROFIL DU PERSONA + BOUTON DÉMO ── */}
      <div className="border-t border-slate-200 bg-slate-50/60 p-3 flex flex-col gap-2.5">
        {/* Lien retour portail principal */}
        <Link
          href="/portail"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-[11px] font-medium">Retour au Portail Agilly</span>
        </Link>

        {/* Carte collaborateur connecté */}
        <div className="bg-white border border-slate-200 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              {currentPersona.prenom.charAt(0)}
              {currentPersona.nom.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                {currentPersona.prenom.split(" ")[0]} {currentPersona.nom}
              </span>
              <span className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                {currentPersona.labelRole}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton Mode Démo escamotable */}
        <button
          type="button"
          onClick={() => setIsDemoDrawerOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Mode démo : Changer de profil</span>
        </button>
      </div>
    </aside>
  );
}
