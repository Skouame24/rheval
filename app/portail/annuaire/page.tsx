"use client";

// ============================================================
// app/portail/annuaire/page.tsx — Trombinoscope complet
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import PortailLoading from "../loading";
import { cn } from "@/lib/utils/cn";
import { usePortailSession } from "@/features/portail/hooks/usePortailSession";
import { PortailHeader } from "@/features/portail/components/PortailHeader";
import { PersonAvatar } from "@/features/portail/components/PersonAvatar";
import { PersonModal } from "@/features/portail/components/PersonModal";
import { SearchIcon } from "@/features/portail/components/PortailIcons";
import {
  COLLABORATEURS,
  DIRECTIONS,
  IS_DEMO_DATA,
  getNouveauxArrivants,
  type Collaborateur,
} from "@/features/portail/data/portail.mock";

const normaliser = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const NOUVEAUX_IDS = new Set(getNouveauxArrivants().map((c) => c.id));

export default function AnnuairePage() {
  const { user, role, isLoading, logout, libelleRole, openApp } = usePortailSession();
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

  if (isLoading) return <PortailLoading />;
  if (!user || !role) return null;

  const filtres = ["TOUTES", ...DIRECTIONS];
  const estNouveau = (c: Collaborateur) => NOUVEAUX_IDS.has(c.id);

  return (
    <div className="min-h-screen bg-agilly-bg flex flex-col">
      <PortailHeader
        prenom={user.prenom}
        nom={user.nom}
        libelleRole={libelleRole}
        onLogout={logout}
        onOpenApp={openApp}
        onSelectPerson={setPersonne}
      />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-10">
        <nav className="text-xs font-semibold text-agilly-gray mb-3">
          <Link href="/portail" className="hover:text-agilly-primary">Portail</Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-agilly-black">Trombinoscope</span>
        </nav>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-agilly-black tracking-tight">L&apos;équipe Agilly</h1>
            <p className="text-sm text-agilly-gray mt-1">
              {COLLABORATEURS.length} collaborateurs{IS_DEMO_DATA && " · données de démonstration"}
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom, prénom ou poste…"
              aria-label="Rechercher un collaborateur"
              className="input-soft pl-10 bg-white"
            />
          </div>
        </div>

        {/* Filtres par direction */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
          {filtres.map((d) => {
            const actif = direction === d;
            const count = d === "TOUTES" ? COLLABORATEURS.length : COLLABORATEURS.filter((c) => c.direction === d).length;
            return (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={cn(
                  "whitespace-nowrap px-3.5 py-2 text-xs font-bold border transition-colors cursor-pointer",
                  actif
                    ? "bg-agilly-black text-white border-agilly-black"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-agilly-black",
                )}
              >
                {d === "TOUTES" ? "Toutes les directions" : d.replace(/^Direction (des |de la |du |)/, "")}
                <span className={cn("ml-1.5 font-semibold", actif ? "text-white/60" : "text-slate-400")}>{count}</span>
              </button>
            );
          })}
        </div>

        {liste.length === 0 ? (
          <div className="bg-white border border-slate-200 py-16 text-center text-sm text-slate-400">
            Aucun collaborateur ne correspond à votre recherche.
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {liste.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setPersonne(c)}
                  className="group relative w-full h-full flex flex-col items-center text-center bg-white border border-slate-200 px-4 pt-6 pb-5 hover:border-agilly-primary/50 hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all cursor-pointer"
                >
                  {estNouveau(c) && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider text-agilly-primary bg-orange-50 border border-orange-100 px-1.5 py-0.5">
                      Nouveau
                    </span>
                  )}
                  <PersonAvatar prenom={c.prenom} nom={c.nom} size="lg" />
                  <p className="mt-3 text-sm font-extrabold text-agilly-black group-hover:text-agilly-primary transition-colors">
                    {c.prenom} {c.nom}
                  </p>
                  <p className="text-xs text-agilly-gray mt-0.5 leading-snug">{c.poste}</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-snug">{c.direction}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <PersonModal personne={personne} onClose={() => setPersonne(null)} />
    </div>
  );
}
