// ============================================================
// components/layout/Sidebar.tsx
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  badge?: number;
  iconSvg: React.ReactNode;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

type SidebarProps = {
  role: string;
  userName?: string;
  userEmail?: string;
};

const NAV_ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>
    </svg>
  ),
  objectifs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  historique: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  evaluations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  arbitrage: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"/><path d="M4 14l8-4 8 4"/><path d="M4 10l8 4 8-4"/>
    </svg>
  ),
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

export function Sidebar({ role, userName = "Utilisateur", userEmail = "user@agilly.com" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const normalizedRole = role.toUpperCase();

  const sections: NavSection[] = [];

  // NAVIGATION RH & DRH
  if (normalizedRole === "RH" || normalizedRole === "DRH") {
    sections.push({
      title: "PILOTAGE RH",
      items: [
        { label: "Vue globale RH", href: "/dashboard/pilotage-rh", iconSvg: NAV_ICONS.dashboard },
        { label: "Base du personnel", href: "/dashboard/personnel", iconSvg: NAV_ICONS.team },
        { label: "Cycles d'évaluation", href: "/dashboard/pilotage-rh/cycles", iconSvg: NAV_ICONS.historique },
        { label: "Toutes les évaluations", href: "/dashboard/pilotage-rh/evaluations", iconSvg: NAV_ICONS.evaluations, badge: 3 },
        { label: "Arbitrages RH", href: "/dashboard/pilotage-rh/arbitrages", iconSvg: NAV_ICONS.arbitrage, badge: 1 },
      ]
    });
  }

  // ESPACE PERSONNEL (POUR SALARIÉ, N1, N2 EXCLUSIVEMENT — NON VISIBLE PAR L'ADMIN)
  if (normalizedRole === "SALARIE" || normalizedRole === "N1" || normalizedRole === "N2") {
    sections.push({
      title: "MON ESPACE PERSONNEL",
      items: [
        { label: "Mon évaluation", href: "/dashboard/mon-espace", iconSvg: NAV_ICONS.dashboard },
        { label: "Mes objectifs", href: "/dashboard/mon-espace/objectifs", iconSvg: NAV_ICONS.objectifs },
        { label: "Historique", href: "/dashboard/mon-espace/historique", iconSvg: NAV_ICONS.historique },
      ]
    });
  }

  // MANAGERS N+1 ET N+2
  if (normalizedRole === "N1" || normalizedRole === "N2") {
    sections.push({
      title: "MON ÉQUIPE",
      items: [
        { label: "Mes collaborateurs", href: "/dashboard/mon-equipe", iconSvg: NAV_ICONS.team },
        { label: "Évaluations à valider", href: "/dashboard/mon-equipe/evaluations", iconSvg: NAV_ICONS.evaluations, badge: 2 },
      ]
    });
  }

  // ADMIN SYSTEME EXCLUSIF
  if (normalizedRole === "ADMIN") {
    sections.push({
      title: "ADMINISTRATION SYSTEME",
      items: [
        { label: "Console d'Administration", href: "/dashboard/admin", iconSvg: NAV_ICONS.admin },
        { label: "Gestion Utilisateurs", href: "/dashboard/admin/utilisateurs", iconSvg: NAV_ICONS.team },
        { label: "Journal d'Audit & Sécurité", href: "/dashboard/admin/audit", iconSvg: NAV_ICONS.admin },
      ]
    });
  }


  return (
    <aside
      className={`
        h-screen flex flex-col transition-all duration-300 bg-white border-r border-slate-200/80 sticky top-0 z-40 select-none shadow-[2px_0_15px_rgba(0,0,0,0.02)]
        ${collapsed ? 'w-[78px] min-w-[78px]' : 'w-[270px] min-w-[270px]'}
      `}
    >
      {/* En-tête Sidebar : Logo Officiel Agilly */}
      <div className="flex items-center justify-between p-4 shrink-0 border-b border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="AGILLY Logo" 
              className="h-9 w-auto object-contain shrink-0 max-w-[120px]" 
            />
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none block">
                AGILLY
              </span>
              <span className="text-[9px] font-extrabold text-[#F0822A] tracking-wider uppercase block mt-0.5">
                RHEVAL Enterprise
              </span>
            </div>
          </div>
        ) : (
          <img 
            src="/logo.png" 
            alt="AGILLY" 
            className="mx-auto h-8 w-auto object-contain" 
          />
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-none cursor-pointer transition-all border border-slate-200 shrink-0"
        >
          {collapsed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          )}
        </button>
      </div>


      <div className="h-px bg-slate-100 mx-5 mb-4" />

      {/* Navigation Principale */}
      <nav className="flex-1 px-4 overflow-y-auto flex flex-col gap-6 pb-6 scrollbar-none">
        {sections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            {!collapsed && (
              <h3 className="px-3 mb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {section.title}
              </h3>
            )}

            {section.items.map((item) => {
              const active = pathname === item.href;

              return (

                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-none transition-all duration-200 group relative
                    ${collapsed ? 'p-3 justify-center' : 'px-3.5 py-2.5 justify-start'}
                    ${active
                      ? 'bg-[#FFF7ED] text-[#F0822A] font-bold border border-[#F0822A]/30 shadow-sm border-l-4 border-l-[#F0822A]'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                    }
                  `}
                >
                  <span className={`flex items-center transition-colors ${active ? 'text-[#F0822A]' : 'text-slate-400 group-hover:text-slate-700'}`}>
                    {item.iconSvg}
                  </span>

                  {!collapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-none text-[10px] font-bold text-white bg-[#F0822A] shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pied de Sidebar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 rounded-none shadow-sm">
            {userName.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
              <p className="text-slate-900 text-sm font-bold m-0 whitespace-nowrap overflow-hidden text-ellipsis">{userName}</p>
              <p className="text-slate-400 text-xs font-medium m-0 whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">{userEmail}</p>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}

