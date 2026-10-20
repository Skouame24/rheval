// ============================================================
// features/absences/components/AbsencesSidebar.tsx
// Barre latérale gauche — Logo Agilly officiel, suppression doublons
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AbsencesSidebar() {
  const pathname = usePathname();
  const { currentPersona, pendingValidationsCount, setIsDemoDrawerOpen } = useAbsences();

  const isRouteActive = (href: string) => {
    if (href === "/absences") {
      return pathname === "/absences";
    }
    return pathname.startsWith(href);
  };

  const role = currentPersona.role;
  const isManagerOrAbove = ["SUPERIEUR_N1", "DRH", "DIRECTION_DG", "ADMIN"].includes(role);
  const isRhOrAdmin = ["DRH", "AGENT_DRH", "ADMIN"].includes(role);

  const navSections: NavSection[] = [
    {
      title: "Mon espace personnel",
      items: [
        {
          label: "Tableau de bord",
          href: "/absences",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
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
            </svg>
          ),
        },
        {
          label: "Soldes & droits",
          href: "/absences/soldes",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          ),
        },
        {
          label: "Agenda des présences",
          href: "/absences/planning",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ),
        },
      ],
    },
    ...(isManagerOrAbove
      ? [
          {
            title: "Validation & arbitrage",
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
            ],
          },
        ]
      : []),
    ...(isRhOrAdmin || role === "DIRECTION_DG"
      ? [
          {
            title: "Pilotage RH & GED",
            items: [
              ...(isRhOrAdmin
                ? [
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
                  ]
                : []),
              {
                label: "Tableau de bord & SLA",
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
        ]
      : []),
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between shrink-0 select-none z-30">
      {/* ── EN-TÊTE AVEC LE VRAI LOGO AGILLY ── */}
      <div className="flex flex-col">
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
          <Link href="/absences" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo Agilly"
                width={30}
                height={30}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-extrabold text-sm tracking-tight leading-none">
                AGILLY
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                Absences & Permissions
              </span>
            </div>
          </Link>
        </div>

        {/* ── NAVIGATION ADAPTÉE AU RÔLE ── */}
        <nav className="p-3 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-160px)] mt-2">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-1">
              <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
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
                          ? "bg-orange-50/80 text-[#B95914] font-bold border-l-2 border-[#D96F1D]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={active ? "text-[#D96F1D]" : "text-slate-500"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#D96F1D] text-white leading-tight">
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

      {/* ── BAS : RETOUR PORTAIL SANS DOUBLON D'IDENTITÉ ── */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-3 flex flex-col gap-2">
        <Link
          href="/portail"
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Retour au Portail</span>
        </Link>

        {/* Bouton de simulation démo uniquement en développement */}
        {process.env.NODE_ENV !== "production" && (
          <button
            type="button"
            onClick={() => setIsDemoDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[10px] text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
          >
            <span>Simuler un rôle (Démo)</span>
          </button>
        )}
      </div>
    </aside>
  );
}
