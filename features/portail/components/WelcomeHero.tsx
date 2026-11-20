// ============================================================
// features/portail/components/WelcomeHero.tsx
// Bandeau d'accueil compact (laisse la place aux actualités)
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
    <section className="relative overflow-hidden bg-white/85 backdrop-blur-md border border-white shadow-[0_20px_50px_-28px_rgba(15,23,42,0.3)] animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-agilly-primary via-amber-400 to-agilly-primary" />
      <div className="absolute -right-10 -top-10 w-40 h-40 border-2 border-agilly-primary/10 rotate-12" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 px-6 sm:px-8 py-6">
        {/* Salutation */}
        <div className="flex items-center gap-5 lg:flex-1 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Employee content.svg" alt="" className="hidden sm:block w-20 h-20 object-contain shrink-0 -my-2" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 first-letter:uppercase">{dateDuJour}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agilly-black tracking-tight mt-0.5">
              {salutation}, <span className="text-agilly-primary">{prenom}</span> 👋
            </h1>
            <p className="text-sm text-agilly-gray mt-0.5">Voici ce qui se passe chez Agilly aujourd&apos;hui.</p>
          </div>
        </div>

        {/* Chiffres clés */}
        <dl className="flex gap-6 lg:px-6 lg:border-x border-slate-100">
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="text-2xl font-extrabold text-agilly-black leading-none">{s.valeur}</dd>
              <dt className="text-[11px] font-semibold text-slate-400 mt-1.5 leading-tight max-w-[90px]">{s.label}</dt>
            </div>
          ))}
        </dl>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/absences/nouvelle" className="btn-soft-primary shadow-[0_8px_20px_-6px_rgba(240,130,42,0.55)]">
            + Nouvelle demande
          </Link>
          <Link href="/portail/annuaire" className="btn-soft-secondary">L&apos;équipe</Link>
        </div>
      </div>
    </section>
  );
}
