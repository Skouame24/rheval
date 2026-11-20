// ============================================================
// features/portail/components/NewsSpotlight.tsx
// « À la une » : carrousel d'actualités visible dès l'arrivée.
// Défilement automatique, pause au survol, barre de progression.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Actualite } from "../data/portail.mock";
import { Couverture, SourceBadge, depuis } from "./NewsFeed";
import { ArrowRightIcon } from "./PortailIcons";

const DUREE_MS = 7000;

export function NewsSpotlight({ actualites }: { actualites: Actualite[] }) {
  const items = [...actualites]
    .sort((a, b) => Number(!!b.epingle) - Number(!!a.epingle) || new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause || items.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), DUREE_MS);
    return () => clearTimeout(t);
  }, [index, pause, items.length]);

  if (items.length === 0) return null;
  const a = items[index];
  const aller = (i: number) => setIndex((i + items.length) % items.length);

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Actualités à la une"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
      onFocus={() => setPause(true)}
      onBlur={() => setPause(false)}
      className="relative bg-white border border-slate-200 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] overflow-hidden flex flex-col"
    >
      {/* En-tête */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 bg-agilly-primary animate-ping opacity-60" />
            <span className="relative w-2 h-2 bg-agilly-primary" />
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-agilly-black">À la une</h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-slate-400 mr-2 tabular-nums">
            {index + 1} / {items.length}
          </span>
          <button onClick={() => aller(index - 1)} aria-label="Actualité précédente" className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-agilly-black transition-colors cursor-pointer">
            <ArrowRightIcon size={15} className="rotate-180" />
          </button>
          <button onClick={() => aller(index + 1)} aria-label="Actualité suivante" className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-agilly-black transition-colors cursor-pointer">
            <ArrowRightIcon size={15} />
          </button>
        </div>
      </header>

      {/* Diapositive */}
      <a
        key={a.id}
        href={a.url ?? "#"}
        target={a.url ? "_blank" : undefined}
        rel="noreferrer"
        className="group grid md:grid-cols-[1fr_1.15fr] flex-1 animate-slide-in"
      >
        <div className="relative min-h-[200px]">
          <Couverture source={a.source} grande />
          <div className="absolute top-4 left-4">
            <SourceBadge source={a.source} surFond />
          </div>
        </div>
        <div className="p-6 md:p-8 flex flex-col">
          <p className="text-xs font-semibold text-slate-400">
            {depuis(a.date)} · {a.auteur}
          </p>
          <h3 className="mt-2 text-xl md:text-[26px] font-extrabold text-agilly-black leading-tight tracking-tight group-hover:text-agilly-primary transition-colors">
            {a.titre}
          </h3>
          <p className="mt-3 text-sm text-agilly-gray leading-relaxed line-clamp-3">{a.extrait}</p>
          <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-agilly-primary">
            Lire la suite <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </a>

      {/* Sommaire + progression */}
      <div className="grid border-t border-slate-100" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it, i) => {
          const actif = i === index;
          return (
            <button
              key={it.id}
              onClick={() => aller(i)}
              aria-label={`Afficher : ${it.titre}`}
              aria-current={actif}
              className={cn(
                "relative text-left px-4 pt-3 pb-3.5 transition-colors cursor-pointer",
                i > 0 && "border-l border-slate-100",
                actif ? "bg-orange-50/50" : "hover:bg-slate-50",
              )}
            >
              <span className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100">
                {actif && (
                  <span
                    key={`${it.id}-${index}`}
                    className="absolute inset-0 bg-agilly-primary animate-progress"
                    style={{ "--duree": `${DUREE_MS}ms`, animationPlayState: pause ? "paused" : "running" } as React.CSSProperties}
                  />
                )}
                {i < index && <span className="absolute inset-0 bg-agilly-primary/35" />}
              </span>
              <span className={cn("hidden sm:block text-[11px] font-bold leading-snug line-clamp-2", actif ? "text-agilly-black" : "text-slate-400")}>
                {it.titre}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
