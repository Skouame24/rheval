// ============================================================
// components/layout/Breadcrumbs.tsx
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PATH_LABELS: Record<string, string> = {
  dashboard: "Tableau de Bord",
  "mon-espace": "Mon Espace Salarié",
  objectifs: "Mes Objectifs",
  historique: "Historique Campagnes",
  "mon-equipe": "Mon Équipe",
  evaluations: "Évaluations",
  "pilotage-rh": "Pilotage RH",
  personnel: "Base du Personnel",
  cycles: "Cycles RH",
  arbitrages: "Arbitrages RH",
  admin: "Administration",
  utilisateurs: "Utilisateurs",
  audit: "Journal d'Audit",
  profil: "Mon Profil",
  parametres: "Paramètres",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  let currentPath = "";

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 select-none">
      <Link 
        href="/dashboard/mon-espace" 
        className="flex items-center gap-1 hover:text-[#F0822A] transition-colors p-1 rounded-md hover:bg-slate-100/80"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span className="font-medium">Accueil</span>
      </Link>

      {segments.map((segment, idx) => {
        currentPath += `/${segment}`;
        const isLast = idx === segments.length - 1;
        const label = PATH_LABELS[segment] || segment.replace(/-/g, " ");

        return (
          <div key={currentPath} className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            {isLast ? (
              <span className="font-semibold text-slate-900 bg-slate-100/80 px-2.5 py-0.5 rounded-full capitalize">
                {label}
              </span>
            ) : (
              <Link
                href={currentPath}
                className="hover:text-[#F0822A] transition-colors capitalize font-medium p-1 rounded-md hover:bg-slate-100/80"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
