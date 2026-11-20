// ============================================================
// features/portail/components/BirthdayCelebration.tsx
// Célébration douce des anniversaires du jour :
// confettis carrés (une fois par jour), visages qui flottent,
// bouton « Souhaiter » qui ouvre Teams avec un message prérempli.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { couleurDirection } from "../data/directions";
import type { Collaborateur } from "../data/portail.mock";
import { PersonAvatar } from "./PersonAvatar";
import { CakeIcon, ChatIcon } from "./PortailIcons";

const COULEURS_CONFETTIS = ["#F0822A", "#FBBF24", "#FB7185", "#60A5FA", "#34D399", "#A78BFA"];

/** Confettis déterministes (pas d'aléatoire pendant le rendu). */
const CONFETTIS = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
  return {
    left: `${Math.round(r(1) * 100)}%`,
    taille: 5 + Math.round(r(2) * 6),
    couleur: COULEURS_CONFETTIS[i % COULEURS_CONFETTIS.length],
    drift: `${Math.round((r(3) - 0.5) * 120)}px`,
    spin: `${Math.round(r(4) * 540 + 180)}deg`,
    duree: `${(2.6 + r(5) * 2).toFixed(2)}s`,
    delai: `${(r(6) * 1.4).toFixed(2)}s`,
  };
});

function cleDuJour(prefixe: string) {
  const d = new Date();
  return `${prefixe}_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function lire(cle: string): boolean {
  try {
    return localStorage.getItem(cle) === "1";
  } catch {
    return false;
  }
}

function ecrire(cle: string) {
  try {
    localStorage.setItem(cle, "1");
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

function joindrePrenoms(personnes: Collaborateur[]): string {
  const p = personnes.map((c) => c.prenom);
  if (p.length <= 1) return p[0] ?? "";
  return `${p.slice(0, -1).join(", ")} et ${p[p.length - 1]}`;
}

export function BirthdayCelebration({
  personnes,
  onSelect,
}: {
  personnes: Collaborateur[];
  onSelect: (c: Collaborateur) => void;
}) {
  const [masque, setMasque] = useState(() => lire(cleDuJour("agilly_anniv_masque")));
  // Les confettis ne tombent qu'à la première visite de la journée
  const [confettis] = useState(() => !lire(cleDuJour("agilly_anniv_confettis")));
  const visible = personnes.length > 0 && !masque;
  useEffect(() => {
    if (visible) ecrire(cleDuJour("agilly_anniv_confettis"));
  }, [visible]);

  if (!visible) return null;

  const plusieurs = personnes.length > 1;

  return (
    <section
      aria-label="Anniversaires du jour"
      className="relative overflow-hidden border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 shadow-[0_20px_50px_-24px_rgba(240,130,42,0.45)] animate-fade-in"
    >
      {/* Décor */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(240,130,42,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-agilly-primary/15 blur-3xl animate-breathe" />
      <div className="absolute right-[30%] -bottom-24 w-60 h-60 rounded-full bg-rose-300/20 blur-3xl animate-breathe [animation-delay:1.5s]" />
      <div className="absolute top-5 right-[42%] w-8 h-8 border-2 border-agilly-primary/30 rotate-12 animate-float-soft" />
      <div className="absolute bottom-6 right-[8%] w-5 h-5 bg-amber-300/50 -rotate-12 animate-float-soft [animation-delay:1s]" />

      {/* Confettis */}
      {confettis && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {CONFETTIS.map((c, i) => (
            <span
              key={i}
              className="absolute top-0 animate-confetti"
              style={
                {
                  left: c.left,
                  width: c.taille,
                  height: c.taille * 0.6,
                  background: c.couleur,
                  "--drift": c.drift,
                  "--spin": c.spin,
                  "--duree": c.duree,
                  "--delai": c.delai,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <button
        onClick={() => {
          ecrire(cleDuJour("agilly_anniv_masque"));
          setMasque(true);
        }}
        aria-label="Masquer pour aujourd'hui"
        title="Masquer pour aujourd'hui"
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-agilly-black hover:bg-white/70 transition-colors cursor-pointer text-lg"
      >
        ×
      </button>

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 p-6 sm:p-8">
        {/* Message */}
        <div className="flex items-start gap-4 lg:w-[42%]">
          <span className="shrink-0 w-12 h-12 flex items-center justify-center bg-agilly-primary text-white shadow-[0_10px_24px_-8px_rgba(240,130,42,0.7)] animate-float-soft">
            <CakeIcon size={22} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-agilly-primary">
              Aujourd&apos;hui · {plusieurs ? `${personnes.length} anniversaires` : "Anniversaire"}
            </p>
            <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-agilly-black tracking-tight leading-snug">
              Joyeux anniversaire {plusieurs ? "à " : ""}
              <span className="text-agilly-primary">{joindrePrenoms(personnes)}</span> ! 🎉
            </h2>
            <p className="mt-1.5 text-sm text-agilly-gray">
              Toute l&apos;équipe Agilly {plusieurs ? "vous" : "te"} souhaite une excellente journée.
            </p>
          </div>
        </div>

        {/* Personnes fêtées */}
        <ul className="flex-1 flex gap-4 overflow-x-auto pb-1 lg:justify-end">
          {personnes.map((c, i) => {
            const col = couleurDirection(c.direction);
            const message = encodeURIComponent(`Joyeux anniversaire ${c.prenom} ! 🎉🎂`);
            return (
              <li
                key={c.id}
                className="shrink-0 w-[200px] bg-white/85 backdrop-blur border border-white shadow-[0_10px_30px_-14px_rgba(15,23,42,0.25)] p-4 flex flex-col items-center text-center"
              >
                <button onClick={() => onSelect(c)} className="cursor-pointer" title={`Voir la fiche de ${c.prenom}`}>
                  <div className="relative animate-float-soft" style={{ animationDelay: `${i * 0.4}s` }}>
                    <PersonAvatar
                      prenom={c.prenom}
                      nom={c.nom}
                      photoUrl={c.photoUrl}
                      size="lg"
                      teinte={cn(col.soft, col.text)}
                      className="w-[72px] h-[72px] ring-4 ring-white shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-2 text-xl" aria-hidden="true">🎂</span>
                  </div>
                </button>
                <p className="mt-3 text-sm font-extrabold text-agilly-black truncate w-full">
                  {c.prenom} {c.nom}
                </p>
                <p className="text-[11px] text-agilly-gray truncate w-full">{c.poste || c.direction}</p>
                <a
                  href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(c.email)}&message=${message}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-agilly-primary hover:bg-agilly-primary-hover transition-colors"
                >
                  <ChatIcon size={13} /> Lui souhaiter
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
