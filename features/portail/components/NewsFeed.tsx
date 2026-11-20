// ============================================================
// features/portail/components/NewsFeed.tsx
// Fil d'actualités : publications internes + posts LinkedIn
// ============================================================

import { cn } from "@/lib/utils/cn";
import type { Actualite } from "../data/portail.mock";
import { ArrowRightIcon, LinkedInIcon, MegaphoneIcon, PinIcon } from "./PortailIcons";

function depuis(dateIso: string): string {
  const jours = Math.floor((Date.now() - new Date(dateIso).getTime()) / 86_400_000);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return "hier";
  if (jours < 7) return `il y a ${jours} jours`;
  return new Date(dateIso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function SourceBadge({ source }: { source: Actualite["source"] }) {
  return source === "LINKEDIN" ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A66C2]">
      <LinkedInIcon size={12} /> LinkedIn
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-agilly-primary">
      <MegaphoneIcon size={12} /> Interne
    </span>
  );
}

export function NewsFeed({ actualites }: { actualites: Actualite[] }) {
  const tries = [...actualites].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const une = tries.find((a) => a.epingle) ?? tries[0];
  const autres = tries.filter((a) => a.id !== une?.id).slice(0, 4);

  return (
    <section aria-labelledby="titre-actus" className="bg-white border border-slate-200">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 id="titre-actus" className="text-base font-extrabold text-agilly-black">Actualités</h2>
        <button className="text-xs font-bold text-agilly-gray hover:text-agilly-primary inline-flex items-center gap-1 cursor-pointer">
          Tout voir <ArrowRightIcon size={13} />
        </button>
      </header>

      {une && (
        <a href={une.url ?? "#"} target={une.url ? "_blank" : undefined} rel="noreferrer" className="group block p-6 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            {/* Visuel : remplacé par l'image du post LinkedIn quand elle est disponible */}
            <div className="aspect-[16/10] md:aspect-auto md:h-full min-h-[130px] bg-orange-50 border border-orange-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#F0822A_1px,transparent_1px)] [background-size:14px_14px] opacity-20" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="h-10 object-contain relative" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <SourceBadge source={une.source} />
                {une.epingle && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                    <PinIcon size={12} /> À la une
                  </span>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-agilly-black leading-snug group-hover:text-agilly-primary transition-colors">
                {une.titre}
              </h3>
              <p className="text-sm text-agilly-gray mt-2 leading-relaxed line-clamp-3">{une.extrait}</p>
              <p className="text-xs text-slate-400 font-medium mt-3">
                {une.auteur} · {depuis(une.date)}
              </p>
            </div>
          </div>
        </a>
      )}

      <ul className="divide-y divide-slate-100">
        {autres.map((a) => (
          <li key={a.id}>
            <a
              href={a.url ?? "#"}
              target={a.url ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
            >
              <span
                className={cn(
                  "mt-1.5 w-1.5 h-1.5 shrink-0",
                  a.source === "LINKEDIN" ? "bg-[#0A66C2]" : "bg-agilly-primary",
                )}
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-agilly-black group-hover:text-agilly-primary transition-colors">{a.titre}</h4>
                <div className="flex flex-wrap items-center gap-x-2 mt-1">
                  <SourceBadge source={a.source} />
                  <span className="text-xs text-slate-400">· {a.auteur} · {depuis(a.date)}</span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
