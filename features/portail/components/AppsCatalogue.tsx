// ============================================================
// features/portail/components/AppsCatalogue.tsx
// Applications de l'écosystème, regroupées par département
// ============================================================

"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { APPLICATIONS, DEPARTEMENTS, getDepartement, type DepartementCode, type PortailApp } from "../data/catalogue";
import { AppIcon, ArrowRightIcon } from "./PortailIcons";

interface Props {
  onOpen: (app: PortailApp) => void;
}

type Filtre = "TOUTES" | DepartementCode;

export function AppsCatalogue({ onOpen }: Props) {
  const [filtre, setFiltre] = useState<Filtre>("TOUTES");

  const apps = useMemo(
    () => (filtre === "TOUTES" ? APPLICATIONS : APPLICATIONS.filter((a) => a.departement === filtre)),
    [filtre],
  );

  const onglets: { code: Filtre; label: string; count: number }[] = [
    { code: "TOUTES", label: "Toutes", count: APPLICATIONS.length },
    ...DEPARTEMENTS.map((d) => ({
      code: d.code as Filtre,
      label: d.label,
      count: APPLICATIONS.filter((a) => a.departement === d.code).length,
    })),
  ];

  return (
    <section aria-labelledby="titre-apps">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
        <div>
          <h2 id="titre-apps" className="text-lg font-extrabold text-agilly-black">Mes applications</h2>
          <p className="text-sm text-agilly-gray">Accédez aux outils de chaque département.</p>
        </div>

        <div role="tablist" className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
          {onglets.map((o) => {
            const actif = filtre === o.code;
            return (
              <button
                key={o.code}
                role="tab"
                aria-selected={actif}
                onClick={() => setFiltre(o.code)}
                className={cn(
                  "whitespace-nowrap px-3.5 py-2 text-xs font-bold border transition-colors cursor-pointer",
                  actif
                    ? "bg-agilly-black text-white border-agilly-black"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-agilly-black",
                )}
              >
                {o.label}
                <span className={cn("ml-1.5 font-semibold", actif ? "text-white/60" : "text-slate-400")}>{o.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {apps.map((app) => (
          <AppTile key={app.id} app={app} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function AppTile({ app, onOpen }: { app: PortailApp; onOpen: (app: PortailApp) => void }) {
  const dep = getDepartement(app.departement);
  const dispo = app.statut === "DISPONIBLE";

  const contenu = (
    <>
      <div className={cn("w-11 h-11 flex items-center justify-center border shrink-0", dep.accent.bg, dep.accent.border, dep.accent.text)}>
        <AppIcon icon={app.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-agilly-black truncate">{app.nom}</h3>
          {!dispo && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5">
              Bientôt
            </span>
          )}
        </div>
        <p className="text-xs text-agilly-gray mt-0.5 leading-relaxed">{app.description}</p>
        <p className="text-[11px] font-semibold text-slate-400 mt-2">{dep.label}</p>
      </div>
      {dispo && (
        <ArrowRightIcon
          size={16}
          className="text-slate-300 group-hover:text-agilly-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
        />
      )}
    </>
  );

  const base = "group flex items-start gap-4 p-5 bg-white border text-left w-full transition-all duration-200";

  if (!dispo) {
    return <div className={cn(base, "border-slate-200/80 opacity-70")}>{contenu}</div>;
  }

  return (
    <button
      onClick={() => onOpen(app)}
      className={cn(base, "border-slate-200 hover:border-agilly-primary/50 hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)] cursor-pointer")}
    >
      {contenu}
    </button>
  );
}
