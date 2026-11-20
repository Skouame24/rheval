// ============================================================
// features/portail/components/WelcomeHero.tsx
// Salutation sobre : texte posé sur le fond, une phrase utile, deux actions
// ============================================================

import Link from "next/link";

interface Props {
  prenom: string;
  dateDuJour: string;
  salutation: string;
  /** Phrase de contexte (anniversaires, arrivées…) */
  resume: string;
}

export function WelcomeHero({ prenom, dateDuJour, salutation, resume }: Props) {
  // « Ebenezer Samuel » → « Ebenezer » : plus naturel et sans retour à la ligne
  const prenomCourt = prenom.trim().split(/\s+/)[0] || prenom;

  return (
    <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between pt-1 sm:pt-4 animate-fade-in">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-400 first-letter:uppercase">{dateDuJour}</p>
        <h1 className="mt-1 text-[28px] leading-tight sm:text-[40px] font-bold tracking-tight text-agilly-black truncate">
          {salutation} {prenomCourt}
          <span className="text-agilly-primary">.</span>
        </h1>
        <p className="mt-2 text-sm sm:text-[15px] text-agilly-gray leading-relaxed max-w-xl">{resume}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
        <Link
          href="/absences/nouvelle"
          className="inline-flex items-center justify-center h-11 px-5 bg-agilly-primary text-white text-sm font-semibold hover:bg-agilly-primary-hover transition-colors"
        >
          Nouvelle demande
        </Link>
        <Link
          href="/portail/annuaire"
          className="inline-flex items-center justify-center h-11 px-5 bg-white/80 border border-slate-200 text-agilly-black text-sm font-semibold hover:bg-white hover:border-slate-300 transition-colors"
        >
          L&apos;équipe
        </Link>
      </div>
    </section>
  );
}
