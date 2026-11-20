// ============================================================
// features/portail/components/WelcomeHero.tsx
// Bannière d'accueil du portail
// ============================================================

import Link from "next/link";

interface Stat {
  valeur: number | string;
  label: string;
}

interface Props {
  prenom: string;
  dateDuJour: string;
  salutation: string;
  stats: Stat[];
}

export function WelcomeHero({ prenom, dateDuJour, salutation, stats }: Props) {
  return (
    <section className="relative overflow-hidden bg-white/85 backdrop-blur-md border border-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.22)] animate-fade-in">
      {/* Liseré de marque */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-agilly-primary via-amber-400 to-agilly-primary" />

      <div className="grid lg:grid-cols-[1.3fr_1fr]">
        {/* Texte */}
        <div className="relative p-7 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-agilly-primary bg-orange-50 border border-orange-100 px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-agilly-primary animate-pulse" />
            Espace collaborateur
          </span>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-agilly-black tracking-tight leading-[1.1]">
            {salutation}, <span className="text-agilly-primary">{prenom}</span>
          </h1>
          <p className="mt-3 text-base text-agilly-gray max-w-md leading-relaxed">
            Retrouvez vos applications, l&apos;actualité de l&apos;entreprise et toute l&apos;équipe Agilly au même endroit.
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-400 first-letter:uppercase">{dateDuJour}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/absences/nouvelle" className="btn-soft-primary gap-2 shadow-[0_8px_20px_-6px_rgba(240,130,42,0.55)]">
              + Nouvelle demande
            </Link>
            <Link href="/portail/annuaire" className="btn-soft-secondary">Voir l&apos;équipe</Link>
          </div>

          <dl className="mt-9 grid grid-cols-3 max-w-md border-t border-slate-100 pt-6">
            {stats.map((s, i) => (
              <div key={s.label} className={i > 0 ? "pl-5 border-l border-slate-100" : ""}>
                <dt className="text-[11px] font-semibold text-slate-400 leading-tight">{s.label}</dt>
                <dd className="text-2xl font-extrabold text-agilly-black mt-1">{s.valeur}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Illustration */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50/50 to-white border-l border-orange-100/60 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#F0822A_1px,transparent_1px)] [background-size:18px_18px] opacity-[0.12]" />
          <div className="absolute top-8 right-10 w-24 h-24 border-2 border-agilly-primary/25 rotate-12" />
          <div className="absolute bottom-10 left-8 w-16 h-16 bg-agilly-primary/10 -rotate-12" />
          <div className="absolute top-1/2 left-6 w-3 h-3 bg-blue-500/40 rotate-45" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Employee content.svg" alt="" className="relative w-[88%] max-w-[380px] h-auto drop-shadow-sm" />
        </div>
      </div>
    </section>
  );
}
