// ============================================================
// features/portail/components/TrombinoscopeView.tsx
// Trombinoscope complet (indépendant de l'authentification)
// ============================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { PortailApp } from "../data/catalogue";
import {
  COLLABORATEURS,
  DIRECTIONS,
  IS_DEMO_DATA,
  getNouveauxArrivants,
  type Collaborateur,
} from "../data/portail.mock";
import { PersonAvatar } from "./PersonAvatar";
import { PersonModal } from "./PersonModal";
import { PortailBackground } from "./PortailBackground";
import { PortailFooter } from "./PortailFooter";
import { PortailHeader } from "./PortailHeader";
import { ChatIcon, MailIcon, SearchIcon } from "./PortailIcons";

const normaliser = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const NOUVEAUX_IDS = new Set(getNouveauxArrivants().map((c) => c.id));
const libelleCourt = (d: string) => d.replace(/^Direction (des |de la |du |)/, "");

interface Props {
  prenom: string;
  nom: string;
  libelleRole: string;
  onLogout: () => void;
  onOpenApp: (app: PortailApp) => void;
}

export function TrombinoscopeView({ prenom, nom, libelleRole, onLogout, onOpenApp }: Props) {
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState<string>("TOUTES");
  const [personne, setPersonne] = useState<Collaborateur | null>(null);

  const liste = useMemo(() => {
    const t = normaliser(q.trim());
    return COLLABORATEURS.filter(
      (c) =>
        (direction === "TOUTES" || c.direction === direction) &&
        (!t || normaliser(`${c.prenom} ${c.nom} ${c.poste}`).includes(t)),
    ).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [q, direction]);

  return (
    <div className="relative isolate min-h-screen flex flex-col">
      <PortailBackground />
      <PortailHeader
        prenom={prenom}
        nom={nom}
        libelleRole={libelleRole}
        onLogout={onLogout}
        onOpenApp={onOpenApp}
        onSelectPerson={setPersonne}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Bandeau */}
        <section className="relative overflow-hidden bg-white/85 backdrop-blur-md border border-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.22)] p-7 sm:p-10 animate-fade-in">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-agilly-primary via-amber-400 to-agilly-primary" />
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border-2 border-agilly-primary/15 rotate-12" />
          <div className="absolute right-24 top-8 w-10 h-10 bg-agilly-primary/10 -rotate-12" />

          <nav className="relative text-xs font-semibold text-agilly-gray mb-4">
            <Link href="/portail" className="hover:text-agilly-primary">Portail</Link>
            <span className="mx-1.5 text-slate-300">/</span>
            <span className="text-agilly-black">Trombinoscope</span>
          </nav>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-agilly-primary">Trombinoscope</span>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-agilly-black tracking-tight">L&apos;équipe Agilly</h1>
              <p className="mt-2 text-sm text-agilly-gray">
                {COLLABORATEURS.length} collaborateurs répartis dans {DIRECTIONS.length} directions
                {IS_DEMO_DATA && <span className="text-slate-400"> · données de démonstration</span>}
              </p>
            </div>
            <div className="relative w-full lg:w-96">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un nom, un poste…"
                aria-label="Rechercher un collaborateur"
                className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 text-sm text-agilly-black placeholder:text-slate-400 outline-none shadow-sm focus:border-agilly-primary/60 focus:ring-4 focus:ring-agilly-primary/10 transition"
              />
            </div>
          </div>
        </section>

        {/* Filtres */}
        <div className="flex gap-1 p-1 mt-8 mb-8 bg-white/80 backdrop-blur border border-slate-200 shadow-sm overflow-x-auto w-fit max-w-full">
          {["TOUTES", ...DIRECTIONS].map((d) => {
            const actif = direction === d;
            const count = d === "TOUTES" ? COLLABORATEURS.length : COLLABORATEURS.filter((c) => c.direction === d).length;
            return (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={cn(
                  "whitespace-nowrap px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                  actif ? "bg-agilly-black text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-agilly-black",
                )}
              >
                {d === "TOUTES" ? "Toutes les directions" : libelleCourt(d)}
                <span className={cn("ml-1.5 font-semibold", actif ? "text-white/60" : "text-slate-400")}>{count}</span>
              </button>
            );
          })}
        </div>

        {liste.length === 0 ? (
          <div className="bg-white/90 border border-dashed border-slate-300 py-20 text-center">
            <p className="text-base font-bold text-agilly-black">Aucun résultat</p>
            <p className="text-sm text-slate-400 mt-1">Essayez un autre nom ou une autre direction.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {liste.map((c, i) => (
              <li key={c.id} className="animate-fade-in opacity-0" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
                <div className="group relative h-full flex flex-col bg-white border border-slate-200 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:border-agilly-primary/40 transition-all duration-300">
                  {/* Bandeau de couleur */}
                  <div className="h-16 bg-gradient-to-br from-orange-50 via-amber-50/60 to-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#F0822A_1px,transparent_1px)] [background-size:12px_12px] opacity-[0.15]" />
                    {NOUVEAUX_IDS.has(c.id) && (
                      <span className="absolute z-20 top-2 right-2 text-[10px] font-extrabold uppercase tracking-wider text-white bg-agilly-primary px-1.5 py-0.5 shadow-sm">
                        Nouveau
                      </span>
                    )}
                  </div>

                  <button onClick={() => setPersonne(c)} className="relative z-10 flex-1 flex flex-col items-center text-center px-4 pb-4 -mt-10 cursor-pointer">
                    <PersonAvatar prenom={c.prenom} nom={c.nom} size="lg" className="ring-4 ring-white shadow-md group-hover:scale-105 transition-transform" />
                    <p className="mt-3 text-sm font-extrabold text-agilly-black group-hover:text-agilly-primary transition-colors">
                      {c.prenom} {c.nom}
                    </p>
                    <p className="text-xs text-agilly-gray mt-0.5 leading-snug">{c.poste}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 leading-snug">{libelleCourt(c.direction)}</p>
                  </button>

                  <div className="grid grid-cols-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                    <a
                      href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(c.email)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 hover:bg-orange-50 hover:text-agilly-primary transition-colors"
                    >
                      <ChatIcon size={13} /> Teams
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 border-l border-slate-100 hover:bg-orange-50 hover:text-agilly-primary transition-colors"
                    >
                      <MailIcon size={13} /> E-mail
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <PortailFooter />
      <PersonModal personne={personne} onClose={() => setPersonne(null)} />
    </div>
  );
}
