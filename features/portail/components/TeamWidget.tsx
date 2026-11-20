// ============================================================
// features/portail/components/TeamWidget.tsx
// Widget trombinoscope de l'accueil : nouveaux arrivants + anniversaires
// ============================================================

"use client";

import Link from "next/link";
import type { Collaborateur } from "../data/portail.mock";
import { PersonAvatar } from "./PersonAvatar";
import { ArrowRightIcon, CakeIcon, SparkleIcon } from "./PortailIcons";

interface Props {
  nouveaux: Collaborateur[];
  anniversaires: Collaborateur[];
  total: number;
  onSelect: (c: Collaborateur) => void;
}

export function TeamWidget({ nouveaux, anniversaires, total, onSelect }: Props) {
  const jourCourant = new Date().getDate();

  return (
    <section aria-labelledby="titre-equipe" className="bg-white border border-slate-200">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 id="titre-equipe" className="text-base font-extrabold text-agilly-black">L&apos;équipe Agilly</h2>
        <span className="text-xs font-semibold text-slate-400">{total} collaborateurs</span>
      </header>

      {/* Nouveaux arrivants */}
      <div className="px-6 pt-5 pb-4">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-agilly-gray mb-3">
          <SparkleIcon size={13} className="text-agilly-primary" /> Nouveaux arrivants
        </h3>
        {nouveaux.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune arrivée récente.</p>
        ) : (
          <ul className="space-y-1">
            {nouveaux.slice(0, 4).map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c)}
                  className="w-full flex items-center gap-3 p-2 -mx-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <PersonAvatar prenom={c.prenom} nom={c.nom} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-agilly-black truncate">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-agilly-gray truncate">{c.poste}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Anniversaires */}
      <div className="px-6 py-4 border-t border-slate-100">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-agilly-gray mb-3">
          <CakeIcon size={13} className="text-agilly-primary" /> Anniversaires du mois
        </h3>
        {anniversaires.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun anniversaire ce mois-ci.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {anniversaires.map((c) => {
              const aujourdhui = c.anniversaire.jour === jourCourant;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  title={`${c.prenom} ${c.nom} — ${c.anniversaire.jour}`}
                  className="group flex flex-col items-center w-14 cursor-pointer"
                >
                  <PersonAvatar
                    prenom={c.prenom}
                    nom={c.nom}
                    size="md"
                    className={aujourdhui ? "ring-2 ring-agilly-primary" : "group-hover:ring-agilly-primary/50"}
                  />
                  <span className="text-[11px] font-semibold text-slate-500 mt-1 truncate w-full text-center">
                    {aujourdhui ? "Aujourd'hui" : c.anniversaire.jour}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Link
        href="/portail/annuaire"
        className="group flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 text-xs font-bold text-agilly-black hover:text-agilly-primary transition-colors"
      >
        Voir le trombinoscope
        <ArrowRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </section>
  );
}
