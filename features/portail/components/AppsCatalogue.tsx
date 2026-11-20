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

  const onglets = [
    { code: "TOUTES" as Filtre, label: "Toutes", dot: "bg-slate-400", count: APPLICATIONS.length },
    ...DEPARTEMENTS.map((d) => ({
      code: d.code as Filtre,
      label: d.label,
      dot: d.accent.dot,
      count: APPLICATIONS.filter((a) => a.departement === d.code).length,
    })),
  ];

  return (
    <section aria-labelledby="titre-apps">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-agilly-primary">Écosystème Agilly</span>
          <h2 id="titre-apps" className="text-2xl font-extrabold text-agilly-black tracking-tight mt-1">Vos applications</h2>
          <p className="text-sm text-agilly-gray mt-1">Tous les outils de l&apos;entreprise, organisés par département.</p>
        </div>

        <div role="tablist" className="flex gap-1 p-1 bg-white/80 backdrop-blur border border-slate-200 shadow-sm overflow-x-auto max-w-full">
          {onglets.map((o) => {
            const actif = filtre === o.code;
            return (
              <button
                key={o.code}
                role="tab"
                aria-selected={actif}
                onClick={() => setFiltre(o.code)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                  actif ? "bg-agilly-black text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-agilly-black",
                )}
              >
                <span className={cn("w-1.5 h-1.5", actif ? "bg-white" : o.dot)} />
                {o.label}
                <span className={cn("font-semibold", actif ? "text-white/60" : "text-slate-400")}>{o.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
        {apps.map((app, i) => (
          <AppTile key={app.id} app={app} onOpen={onOpen} index={i} />
        ))}
      </div>
    </section>
  );
}

function AppTile({ app, onOpen, index }: { app: PortailApp; onOpen: (app: PortailApp) => void; index: number }) {
  const dep = getDepartement(app.departement);
  const dispo = app.statut === "DISPONIBLE";

  const corps = (
    <>
      <div className="p-6 pb-5 flex-1">
        <div className="flex items-start justify-between mb-5">
          <div
            className={cn(
              "w-12 h-12 flex items-center justify-center border transition-transform duration-300",
              dep.accent.bg,
              dep.accent.border,
              dep.accent.text,
              dispo && "group-hover:scale-110 group-hover:-rotate-3",
            )}
          >
            <AppIcon icon={app.icon} size={24} />
          </div>
        </div>
        <p className={cn("text-[10px] font-extrabold uppercase tracking-wider mb-1", dep.accent.text)}>{dep.label}</p>
        <h3 className="text-lg font-extrabold text-agilly-black leading-snug mb-2">
          {app.nom}
        </h3>
        <p className="text-[13px] text-agilly-gray leading-relaxed">{app.description}</p>
      </div>

      <div
        className={cn(
          "px-6 py-3.5 border-t border-slate-100 flex items-center justify-between transition-colors",
          dispo ? cn("bg-slate-50/80", dep.accent.hoverBg) : "bg-slate-50/60",
        )}
      >
        {dispo ? (
          <>
            <span className={cn("text-xs font-extrabold", dep.accent.text)}>Ouvrir l&apos;application</span>
            <ArrowRightIcon size={16} className={cn(dep.accent.text, "group-hover:translate-x-1 transition-transform")} />
          </>
        ) : (
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-200/70 border border-slate-300/70 px-2 py-1">
            Bientôt disponible
          </span>
        )}
      </div>
    </>
  );

  const base = cn(
    "group relative flex flex-col text-left w-full h-full bg-white border border-slate-200 border-t-4 overflow-hidden animate-fade-in opacity-0",
    dep.accent.top,
  );
  const style = { animationDelay: `${index * 70}ms` };

  if (!dispo) {
    return (
      <div className={cn(base, "bg-white/70 border-dashed border-t-slate-300")} style={style}>
        {corps}
      </div>
    );
  }

  return (
    <button
      onClick={() => onOpen(app)}
      style={style}
      className={cn(
        base,
        dep.accent.hoverBorder,
        "shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-1 transition-all duration-300 cursor-pointer",
      )}
    >
      {corps}
    </button>
  );
}
