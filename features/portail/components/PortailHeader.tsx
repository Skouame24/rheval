// ============================================================
// features/portail/components/PortailHeader.tsx
// En-tête du portail + recherche globale (personnes et applications)
// ============================================================

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { APPLICATIONS, getDepartement, type PortailApp } from "../data/catalogue";
import { COLLABORATEURS, type Collaborateur } from "../data/portail.mock";
import { PersonAvatar } from "./PersonAvatar";
import { AppIcon, LogoutIcon, SearchIcon } from "./PortailIcons";

interface Props {
  prenom: string;
  nom: string;
  libelleRole: string;
  onLogout: () => void;
  onOpenApp: (app: PortailApp) => void;
  onSelectPerson: (c: Collaborateur) => void;
}

const normaliser = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function PortailHeader({ prenom, nom, libelleRole, onLogout, onOpenApp, onSelectPerson }: Props) {
  const [q, setQ] = useState("");
  const [ouvert, setOuvert] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  const resultats = useMemo(() => {
    const t = normaliser(q.trim());
    if (t.length < 2) return null;
    return {
      apps: APPLICATIONS.filter((a) => normaliser(`${a.nom} ${a.description}`).includes(t)).slice(0, 4),
      personnes: COLLABORATEURS.filter((c) =>
        normaliser(`${c.prenom} ${c.nom} ${c.poste} ${c.direction}`).includes(t),
      ).slice(0, 5),
    };
  }, [q]);

  const choisir = (fn: () => void) => {
    fn();
    setQ("");
    setOuvert(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto h-16 px-4 md:px-8 flex items-center gap-4">
        <Link href="/portail" className="flex items-center gap-3 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Agilly" className="h-8 object-contain" />
          <span className="hidden sm:block border-l border-slate-200 pl-3 text-sm font-extrabold text-agilly-black tracking-tight">
            Portail
          </span>
        </Link>

        {/* Recherche globale */}
        <div ref={zoneRef} className="relative flex-1 max-w-xl mx-auto">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOuvert(true); }}
            onFocus={() => setOuvert(true)}
            onKeyDown={(e) => e.key === "Escape" && setOuvert(false)}
            placeholder="Rechercher une personne, une application…"
            aria-label="Recherche globale"
            className="w-full h-10 pl-10 pr-4 bg-agilly-bg border border-transparent text-sm text-agilly-black placeholder:text-slate-400 outline-none focus:bg-white focus:border-agilly-primary/60 focus:ring-2 focus:ring-agilly-primary/15 transition"
          />

          {ouvert && resultats && (
            <div className="absolute left-0 right-0 top-12 bg-white border border-slate-200 shadow-[0_12px_32px_rgba(15,23,42,0.10)] max-h-[70vh] overflow-y-auto animate-fade-in">
              {resultats.apps.length === 0 && resultats.personnes.length === 0 && (
                <p className="px-4 py-6 text-sm text-center text-slate-400">Aucun résultat pour « {q} »</p>
              )}

              {resultats.apps.length > 0 && (
                <div className="py-2">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Applications</p>
                  {resultats.apps.map((a) => {
                    const dep = getDepartement(a.departement);
                    return (
                      <button
                        key={a.id}
                        onClick={() => choisir(() => onOpenApp(a))}
                        disabled={a.statut !== "DISPONIBLE"}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span className={`w-8 h-8 flex items-center justify-center border ${dep.accent.bg} ${dep.accent.border} ${dep.accent.text}`}>
                          <AppIcon icon={a.icon} size={16} />
                        </span>
                        <span className="text-sm font-semibold text-agilly-black">{a.nom}</span>
                        <span className="ml-auto text-xs text-slate-400">{a.statut === "DISPONIBLE" ? dep.label : "Bientôt"}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {resultats.personnes.length > 0 && (
                <div className="py-2 border-t border-slate-100">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Personnes</p>
                  {resultats.personnes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => choisir(() => onSelectPerson(c))}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 cursor-pointer"
                    >
                      <PersonAvatar prenom={c.prenom} nom={c.nom} size="sm" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-agilly-black truncate">{c.prenom} {c.nom}</span>
                        <span className="block text-xs text-agilly-gray truncate">{c.poste} · {c.direction}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Utilisateur */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block text-right leading-tight">
            <p className="text-sm font-bold text-agilly-black">{prenom} {nom}</p>
            <p className="text-[11px] font-semibold text-agilly-primary">{libelleRole}</p>
          </div>
          <PersonAvatar prenom={prenom || "?"} nom={nom || "?"} size="sm" />
          <button
            onClick={onLogout}
            title="Déconnexion"
            aria-label="Déconnexion"
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogoutIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
