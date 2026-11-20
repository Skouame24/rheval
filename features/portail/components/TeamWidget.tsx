// ============================================================
// features/portail/components/TeamWidget.tsx
// Bloc trombinoscope de l'accueil : équipe, nouveaux arrivants, anniversaires
// ============================================================

"use client";

import Link from "next/link";
import type { Collaborateur } from "../data/portail.mock";
import { PersonAvatar } from "./PersonAvatar";
import { ArrowRightIcon, CakeIcon, SparkleIcon } from "./PortailIcons";

interface Props {
  equipe: Collaborateur[];
  nouveaux: Collaborateur[];
  anniversaires: Collaborateur[];
  onSelect: (c: Collaborateur) => void;
}

const MOIS_COURT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function TeamWidget({ equipe, nouveaux, anniversaires, onSelect }: Props) {
  const jourCourant = new Date().getDate();
  const apercu = equipe.slice(0, 6);
  const reste = equipe.length - apercu.length;

  return (
    <section aria-labelledby="titre-equipe">
      <div className="mb-5">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-agilly-primary">Trombinoscope</span>
        <h2 id="titre-equipe" className="text-2xl font-extrabold text-agilly-black tracking-tight mt-1">L&apos;équipe</h2>
      </div>

      <div className="bg-white border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">
        {/* En-tête : aperçu de l'équipe */}
        <div className="relative p-6 bg-gradient-to-br from-agilly-black to-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="absolute -top-8 -right-8 w-28 h-28 border-2 border-agilly-primary/50 rotate-12" />
          <p className="relative text-3xl font-extrabold text-white">{equipe.length}</p>
          <p className="relative text-xs font-semibold text-white/60">collaborateurs dans l&apos;entreprise</p>
          <div className="relative flex flex-wrap mt-4 gap-1.5">
            {apercu.map((c) => (
              <button key={c.id} onClick={() => onSelect(c)} className="cursor-pointer hover:-translate-y-1 transition-transform" title={`${c.prenom} ${c.nom}`}>
                <PersonAvatar prenom={c.prenom} nom={c.nom} size="sm" className="ring-1 ring-white/20" />
              </button>
            ))}
            {reste > 0 && (
              <span className="w-9 h-9 flex items-center justify-center bg-agilly-primary text-white text-xs font-bold">
                +{reste}
              </span>
            )}
          </div>
        </div>

        {/* Nouveaux arrivants */}
        <div className="px-6 pt-5 pb-4">
          <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-agilly-black mb-3">
            <span className="w-6 h-6 flex items-center justify-center bg-orange-50 text-agilly-primary"><SparkleIcon size={13} /></span>
            Bienvenue à
          </h3>
          {nouveaux.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune arrivée récente.</p>
          ) : (
            <ul className="space-y-1">
              {nouveaux.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c)}
                    className="group w-full flex items-center gap-3 p-2 -mx-2 text-left hover:bg-orange-50/60 transition-colors cursor-pointer"
                  >
                    <PersonAvatar prenom={c.prenom} nom={c.nom} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-agilly-black truncate group-hover:text-agilly-primary transition-colors">{c.prenom} {c.nom}</p>
                      <p className="text-xs text-agilly-gray truncate">{c.poste}</p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-agilly-primary bg-orange-50 border border-orange-100 px-1.5 py-0.5">
                      Nouveau
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Anniversaires */}
        <div className="px-6 py-5 border-t border-slate-100">
          <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-agilly-black mb-4">
            <span className="w-6 h-6 flex items-center justify-center bg-amber-50 text-amber-600"><CakeIcon size={13} /></span>
            Anniversaires du mois
          </h3>
          {anniversaires.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun anniversaire ce mois-ci.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {anniversaires.slice(0, 8).map((c) => {
                const aujourdhui = c.anniversaire.jour === jourCourant;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c)}
                    title={`${c.prenom} ${c.nom}`}
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    <PersonAvatar
                      prenom={c.prenom}
                      nom={c.nom}
                      size="md"
                      className={aujourdhui ? "ring-2 ring-agilly-primary ring-offset-2" : "group-hover:-translate-y-0.5 transition-transform"}
                    />
                    <span className="text-[11px] font-bold text-agilly-black mt-1.5 truncate w-full text-center">{c.prenom}</span>
                    <span className={aujourdhui ? "text-[10px] font-extrabold text-agilly-primary" : "text-[10px] font-semibold text-slate-400"}>
                      {aujourdhui ? "Aujourd'hui 🎉" : `${c.anniversaire.jour} ${MOIS_COURT[c.anniversaire.mois - 1]}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <Link href="/portail/annuaire" className="btn-soft-secondary w-full gap-2 group">
            Voir tout le trombinoscope
            <ArrowRightIcon size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
