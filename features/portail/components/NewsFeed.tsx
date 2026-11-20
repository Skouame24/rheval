// ============================================================
// features/portail/components/NewsFeed.tsx
// Fil d'actualités : publications internes + posts LinkedIn
// ============================================================

import { cn } from "@/lib/utils/cn";
import type { Actualite } from "../data/portail.mock";
import { ArrowRightIcon, LinkedInIcon, MegaphoneIcon, PinIcon } from "./PortailIcons";

function depuis(dateIso: string): string {
  const jours = Math.floor((Date.now() - new Date(dateIso).getTime()) / 86_400_000);
  if (jours <= 0) return "Aujourd'hui";
  if (jours === 1) return "Hier";
  if (jours < 7) return `Il y a ${jours} jours`;
  return new Date(dateIso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Visuel de couverture (remplacé par l'image du post quand elle existe). */
function Couverture({ source, grande = false }: { source: Actualite["source"]; grande?: boolean }) {
  const linkedin = source === "LINKEDIN";
  return (
    <div
      className={cn(
        "relative overflow-hidden flex items-center justify-center",
        linkedin ? "bg-gradient-to-br from-[#0A66C2] to-[#08427E]" : "bg-gradient-to-br from-agilly-primary to-amber-400",
        grande ? "h-56 md:h-full min-h-[220px]" : "h-28",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 border-2 border-white/25 rotate-12" />
      <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/10 -rotate-12" />
      {grande ? (
        <div className="relative bg-white px-6 py-4 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Agilly" className="h-10 object-contain" />
        </div>
      ) : linkedin ? (
        <LinkedInIcon size={34} className="relative text-white/95" />
      ) : (
        <MegaphoneIcon size={34} className="relative text-white/95" />
      )}
    </div>
  );
}

function SourceBadge({ source, surFond = false }: { source: Actualite["source"]; surFond?: boolean }) {
  const linkedin = source === "LINKEDIN";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1",
        surFond
          ? "bg-white/95 shadow-sm " + (linkedin ? "text-[#0A66C2]" : "text-agilly-primary")
          : linkedin
            ? "bg-blue-50 text-[#0A66C2]"
            : "bg-orange-50 text-agilly-primary",
      )}
    >
      {linkedin ? <LinkedInIcon size={11} /> : <MegaphoneIcon size={11} />}
      {linkedin ? "LinkedIn" : "Interne"}
    </span>
  );
}

export function NewsFeed({ actualites }: { actualites: Actualite[] }) {
  const tries = [...actualites].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const une = tries.find((a) => a.epingle) ?? tries[0];
  const autres = tries.filter((a) => a.id !== une?.id).slice(0, 4);

  return (
    <section aria-labelledby="titre-actus">
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-agilly-primary">La vie d&apos;Agilly</span>
          <h2 id="titre-actus" className="text-2xl font-extrabold text-agilly-black tracking-tight mt-1">Actualités</h2>
        </div>
        <button className="group text-xs font-bold text-agilly-gray hover:text-agilly-primary inline-flex items-center gap-1 cursor-pointer">
          Toutes les actualités <ArrowRightIcon size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* À la une */}
      {une && (
        <a
          href={une.url ?? "#"}
          target={une.url ? "_blank" : undefined}
          rel="noreferrer"
          className="group grid md:grid-cols-[1fr_1.1fr] bg-white border border-slate-200 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="relative">
            <Couverture source={une.source} grande />
            <div className="absolute top-4 left-4 flex gap-2">
              <SourceBadge source={une.source} surFond />
              {une.epingle && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-agilly-black/85 text-white px-2 py-1">
                  <PinIcon size={11} /> À la une
                </span>
              )}
            </div>
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <p className="text-xs font-semibold text-slate-400">{depuis(une.date)} · {une.auteur}</p>
            <h3 className="mt-2 text-xl md:text-2xl font-extrabold text-agilly-black leading-snug group-hover:text-agilly-primary transition-colors">
              {une.titre}
            </h3>
            <p className="mt-3 text-sm text-agilly-gray leading-relaxed line-clamp-4">{une.extrait}</p>
            <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-xs font-extrabold text-agilly-primary">
              Lire la suite <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </a>
      )}

      {/* Autres actualités */}
      <div className="grid sm:grid-cols-2 gap-5 mt-5">
        {autres.map((a) => (
          <a
            key={a.id}
            href={a.url ?? "#"}
            target={a.url ? "_blank" : undefined}
            rel="noreferrer"
            className="group flex flex-col bg-white border border-slate-200 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Couverture source={a.source} />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <SourceBadge source={a.source} />
                <span className="text-[11px] font-semibold text-slate-400">{depuis(a.date)}</span>
              </div>
              <h4 className="mt-3 text-[15px] font-extrabold text-agilly-black leading-snug group-hover:text-agilly-primary transition-colors">
                {a.titre}
              </h4>
              <p className="mt-1.5 text-[13px] text-agilly-gray leading-relaxed line-clamp-2">{a.extrait}</p>
              <p className="mt-auto pt-4 text-[11px] font-semibold text-slate-400">{a.auteur}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
