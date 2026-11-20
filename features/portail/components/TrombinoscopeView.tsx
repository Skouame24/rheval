// ============================================================
// features/portail/components/TrombinoscopeView.tsx
// Trombinoscope complet — « Les visages d'Agilly »
// ============================================================

"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { PortailApp } from "../data/catalogue";
import { couleurDirection, libelleCourt } from "../data/directions";
import { getDirections, getNouveauxArrivants, type Collaborateur } from "../data/portail.mock";
import { useAnnuaire } from "../hooks/useAnnuaire";
import { PersonAvatar } from "./PersonAvatar";
import { PersonModal } from "./PersonModal";
import { PortailBackground } from "./PortailBackground";
import { PortailFooter } from "./PortailFooter";
import { PortailHeader } from "./PortailHeader";
import { ChatIcon, GridViewIcon, ListViewIcon, MailIcon, PhoneIcon, SearchIcon, SparkleIcon } from "./PortailIcons";

const normaliser = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

interface Props {
  prenom: string;
  nom: string;
  libelleRole: string;
  onLogout: () => void;
  onOpenApp: (app: PortailApp) => void;
}

type Vue = "grille" | "liste";

export function TrombinoscopeView({ prenom, nom, libelleRole, onLogout, onOpenApp }: Props) {
  const { collaborateurs, source, chargement } = useAnnuaire();
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState<string>("TOUTES");
  const [vue, setVue] = useState<Vue>("grille");
  const [personne, setPersonne] = useState<Collaborateur | null>(null);
  const fermer = useCallback(() => setPersonne(null), []);
  const filtrerDirection = useCallback((d: string) => {
    setDirection(d);
    document.getElementById("resultats-trombi")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const directions = useMemo(() => getDirections(collaborateurs), [collaborateurs]);
  const nouveaux = useMemo(() => getNouveauxArrivants(collaborateurs), [collaborateurs]);
  const nouveauxIds = useMemo(() => new Set(nouveaux.map((c) => c.id)), [nouveaux]);

  const resultats = useMemo(() => {
    const t = normaliser(q.trim());
    return collaborateurs.filter(
      (c) =>
        (direction === "TOUTES" || c.direction === direction) &&
        (!t || normaliser(`${c.prenom} ${c.nom} ${c.poste} ${c.direction}`).includes(t)),
    );
  }, [collaborateurs, q, direction]);

  const modeExploration = !q.trim() && direction === "TOUTES";

  return (
    <div className="relative isolate min-h-screen flex flex-col">
      <PortailBackground />
      <PortailHeader
        prenom={prenom}
        nom={nom}
        libelleRole={libelleRole}
        personnes={collaborateurs}
        onLogout={onLogout}
        onOpenApp={onOpenApp}
        onSelectPerson={setPersonne}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <Hero
          collaborateurs={collaborateurs}
          directions={directions}
          nbNouveaux={nouveaux.length}
          q={q}
          setQ={setQ}
          source={source}
          chargement={chargement}
          onFiltrer={filtrerDirection}
        />

        {/* Ils nous ont rejoints */}
        {modeExploration && nouveaux.length > 0 && (
          <section className="mt-12" aria-labelledby="titre-nouveaux">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 flex items-center justify-center bg-agilly-primary text-white shadow-[0_8px_20px_-6px_rgba(240,130,42,0.6)]">
                <SparkleIcon size={18} />
              </span>
              <div>
                <h2 id="titre-nouveaux" className="text-xl font-extrabold text-agilly-black tracking-tight">Ils nous ont rejoints</h2>
                <p className="text-xs text-agilly-gray">Souhaitez-leur la bienvenue !</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
              {nouveaux.slice(0, 8).map((c) => (
                <NouveauCard key={c.id} c={c} onSelect={setPersonne} />
              ))}
            </div>
          </section>
        )}

        {/* Barre d'outils collante */}
        <div id="resultats-trombi" className="scroll-mt-16 sticky top-16 z-30 mt-12 -mx-4 px-4 md:mx-0 md:px-0 py-3 bg-agilly-bg/85 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 flex gap-1 p-1 bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <FiltreChip actif={direction === "TOUTES"} onClick={() => setDirection("TOUTES")} label="Toutes" count={collaborateurs.length} />
              {directions.map((d) => (
                <FiltreChip
                  key={d.nom}
                  actif={direction === d.nom}
                  onClick={() => setDirection(d.nom)}
                  label={libelleCourt(d.nom)}
                  count={d.effectif}
                  dot={couleurDirection(d.nom).dot}
                />
              ))}
            </div>
            <div className="flex shrink-0 p-1 bg-white border border-slate-200 shadow-sm">
              {(["grille", "liste"] as Vue[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setVue(v)}
                  aria-label={v === "grille" ? "Vue grille" : "Vue liste"}
                  aria-pressed={vue === v}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center transition-colors cursor-pointer",
                    vue === v ? "bg-agilly-black text-white" : "text-slate-500 hover:bg-slate-100",
                  )}
                >
                  {v === "grille" ? <GridViewIcon size={16} /> : <ListViewIcon size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mt-6">
          {chargement ? (
            <GrilleSquelette />
          ) : resultats.length === 0 ? (
            <div className="bg-white/90 border border-dashed border-slate-300 py-20 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 text-base font-bold text-agilly-black">Personne ne correspond à « {q} »</p>
              <p className="text-sm text-slate-400 mt-1">Essayez un prénom, un nom ou un poste.</p>
            </div>
          ) : modeExploration && vue === "grille" ? (
            <div className="space-y-12">
              {directions.map((d) => (
                <SectionDirection
                  key={d.nom}
                  direction={d.nom}
                  personnes={resultats.filter((c) => c.direction === d.nom)}
                  nouveauxIds={nouveauxIds}
                  onSelect={setPersonne}
                />
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-agilly-gray mb-4">
                {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
              </p>
              {vue === "grille" ? (
                <GrillePortraits personnes={resultats} nouveauxIds={nouveauxIds} onSelect={setPersonne} />
              ) : (
                <ListePersonnes personnes={resultats} onSelect={setPersonne} />
              )}
            </>
          )}
        </div>
      </main>

      <PortailFooter />
      <PersonModal personne={personne} onClose={fermer} />
    </div>
  );
}

// ─── Bandeau ────────────────────────────────────────────────

function Hero({
  collaborateurs,
  directions,
  nbNouveaux,
  q,
  setQ,
  source,
  chargement,
  onFiltrer,
}: {
  collaborateurs: Collaborateur[];
  directions: { nom: string; effectif: number }[];
  nbNouveaux: number;
  q: string;
  setQ: (v: string) => void;
  source: "microsoft" | "demo";
  chargement: boolean;
  onFiltrer: (direction: string) => void;
}) {
  const maxEffectif = Math.max(1, ...directions.map((d) => d.effectif));

  return (
    <section className="relative overflow-hidden bg-agilly-black text-white shadow-[0_30px_70px_-30px_rgba(15,23,42,0.6)] animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-agilly-primary/30 blur-[110px]" />
      <div className="absolute -bottom-40 right-10 w-[380px] h-[380px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-agilly-primary via-amber-400 to-agilly-primary" />

      <div className="relative grid lg:grid-cols-[1.15fr_1fr] gap-10 p-7 sm:p-10 lg:p-12">
        <div>
          <nav className="text-xs font-semibold text-white/50 mb-6">
            <Link href="/portail" className="hover:text-agilly-primary">Portail</Link>
            <span className="mx-1.5 text-white/25">/</span>
            <span className="text-white/80">Trombinoscope</span>
          </nav>

          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-agilly-primary">Trombinoscope</span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Les visages <br className="hidden sm:block" />
            d&apos;<span className="text-agilly-primary">Agilly</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/60 max-w-md leading-relaxed">
            Trouvez un collègue, découvrez qui fait quoi et contactez-le en un clic.
          </p>

          <div className="relative mt-8 max-w-lg">
            <SearchIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un nom, un poste, une direction…"
              aria-label="Rechercher un collaborateur"
              className="w-full h-14 pl-14 pr-4 bg-white text-agilly-black text-[15px] placeholder:text-slate-400 outline-none shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] focus:ring-4 focus:ring-agilly-primary/40 transition"
            />
          </div>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <Stat valeur={chargement ? "—" : collaborateurs.length} label="Collaborateurs" />
            <Stat valeur={chargement ? "—" : directions.length} label="Directions" />
            <Stat valeur={chargement ? "—" : nbNouveaux} label="Nouveaux arrivants" accent />
          </dl>

          <p className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold text-white/40">
            <span className={cn("w-1.5 h-1.5", source === "microsoft" ? "bg-emerald-400" : "bg-amber-400")} />
            {chargement
              ? "Synchronisation avec Microsoft 365…"
              : source === "microsoft"
                ? "Synchronisé avec Microsoft 365"
                : "Données de démonstration"}
          </p>
        </div>

        {/* Répartition par direction (clic = filtre) */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-white/[0.06] border border-white/10 backdrop-blur-sm p-6">
            <div className="flex items-baseline justify-between mb-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/50">Répartition par direction</p>
              <p className="text-[11px] font-semibold text-white/35">Cliquez pour filtrer</p>
            </div>

            {chargement ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-11 bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {directions.slice(0, 6).map((d, i) => {
                  const col = couleurDirection(d.nom);
                  const membres = collaborateurs.filter((c) => c.direction === d.nom);
                  const part = Math.max(6, Math.round((d.effectif / maxEffectif) * 100));
                  return (
                    <li key={d.nom} className="animate-fade-in opacity-0" style={{ animationDelay: `${150 + i * 60}ms` }}>
                      <button
                        onClick={() => onFiltrer(d.nom)}
                        className="group w-full text-left px-3 py-2.5 -mx-3 hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn("w-2 h-2 shrink-0", col.dot)} />
                          <span className="flex-1 min-w-0 truncate text-sm font-bold text-white/90 group-hover:text-white">
                            {libelleCourt(d.nom)}
                          </span>
                          <span className="flex -space-x-1.5">
                            {membres.slice(0, 3).map((m) => (
                              <PersonAvatar
                                key={m.id}
                                prenom={m.prenom}
                                nom={m.nom}
                                photoUrl={m.photoUrl}
                                size="sm"
                                teinte={cn(col.soft, col.text)}
                                className="w-7 h-7 text-[10px] ring-2 ring-agilly-black"
                              />
                            ))}
                          </span>
                          <span className="w-8 text-right text-sm font-extrabold text-white">{d.effectif}</span>
                        </div>
                        <div className="mt-2 ml-5 h-1 bg-white/10">
                          <div className={cn("h-full transition-all duration-700", col.dot)} style={{ width: `${part}%` }} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {directions.length > 6 && (
              <p className="mt-4 text-[11px] font-semibold text-white/40">+ {directions.length - 6} autres directions dans les filtres</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ valeur, label, accent = false }: { valeur: number | string; label: string; accent?: boolean }) {
  return (
    <div>
      <dd className={cn("text-3xl font-extrabold", accent ? "text-agilly-primary" : "text-white")}>{valeur}</dd>
      <dt className="text-[11px] font-semibold text-white/50 mt-0.5">{label}</dt>
    </div>
  );
}

// ─── Nouveaux arrivants ─────────────────────────────────────

function depuisJours(iso?: string): string {
  if (!iso) return "";
  const j = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (j <= 0) return "Arrivé(e) aujourd'hui";
  if (j === 1) return "Arrivé(e) hier";
  return `Arrivé(e) il y a ${j} jours`;
}

function NouveauCard({ c, onSelect }: { c: Collaborateur; onSelect: (c: Collaborateur) => void }) {
  const col = couleurDirection(c.direction);
  return (
    <button
      onClick={() => onSelect(c)}
      className="group snap-start shrink-0 w-[260px] flex items-center gap-4 p-4 bg-white border border-slate-200 border-l-4 border-l-agilly-primary text-left shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
    >
      <PersonAvatar prenom={c.prenom} nom={c.nom} photoUrl={c.photoUrl} size="lg" teinte={cn(col.soft, col.text)} className="w-16 h-16" />
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-agilly-black truncate group-hover:text-agilly-primary transition-colors">
          {c.prenom} {c.nom}
        </p>
        <p className="text-xs text-agilly-gray truncate">{c.poste || libelleCourt(c.direction)}</p>
        <p className="text-[11px] font-bold text-agilly-primary mt-1.5">{depuisJours(c.dateArrivee)}</p>
      </div>
    </button>
  );
}

// ─── Filtres ────────────────────────────────────────────────

function FiltreChip({ actif, onClick, label, count, dot }: { actif: boolean; onClick: () => void; label: string; count: number; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
        actif ? "bg-agilly-black text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-agilly-black",
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5", actif ? "bg-white" : dot)} />}
      {label}
      <span className={cn("font-semibold", actif ? "text-white/60" : "text-slate-400")}>{count}</span>
    </button>
  );
}

// ─── Sections & grilles ─────────────────────────────────────

function SectionDirection({
  direction,
  personnes,
  nouveauxIds,
  onSelect,
}: {
  direction: string;
  personnes: Collaborateur[];
  nouveauxIds: Set<string>;
  onSelect: (c: Collaborateur) => void;
}) {
  if (personnes.length === 0) return null;
  const col = couleurDirection(direction);
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span className={cn("w-3 h-3", col.dot)} />
        <h2 className="text-lg font-extrabold text-agilly-black tracking-tight">{direction}</h2>
        <span className={cn("text-[11px] font-extrabold px-2 py-0.5 border", col.soft, col.softBorder, col.text)}>{personnes.length}</span>
        <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
      </div>
      <GrillePortraits personnes={personnes} nouveauxIds={nouveauxIds} onSelect={onSelect} />
    </section>
  );
}

function GrillePortraits({
  personnes,
  nouveauxIds,
  onSelect,
}: {
  personnes: Collaborateur[];
  nouveauxIds: Set<string>;
  onSelect: (c: Collaborateur) => void;
}) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {personnes.map((c, i) => (
        <li key={c.id} className="animate-fade-in opacity-0" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
          <Portrait c={c} nouveau={nouveauxIds.has(c.id)} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

function Portrait({ c, nouveau, onSelect }: { c: Collaborateur; nouveau: boolean; onSelect: (c: Collaborateur) => void }) {
  const col = couleurDirection(c.direction);
  return (
    <article className="group relative h-full flex flex-col bg-white border border-slate-200 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_22px_45px_-15px_rgba(15,23,42,0.28)] hover:-translate-y-1 transition-all duration-300">
      {/* Portrait */}
      <button onClick={() => onSelect(c)} className={cn("relative aspect-[4/4.4] overflow-hidden bg-gradient-to-br cursor-pointer", col.gradient)}>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.10)_1px,transparent_1px)] [background-size:12px_12px]" />
        <PersonAvatar
          prenom={c.prenom}
          nom={c.nom}
          photoUrl={c.photoUrl}
          size="full"
          teinte={cn("bg-transparent", col.text)}
          className="relative group-hover:scale-105 transition-transform duration-500 text-5xl"
        />
        {nouveau && (
          <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase tracking-wider text-white bg-agilly-primary px-1.5 py-0.5 shadow">
            Nouveau
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-agilly-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      {/* Actions rapides (au survol) */}
      <div className="absolute left-0 right-0 top-0 pointer-events-none">
        <div className="aspect-[4/4.4] flex items-end justify-center gap-1.5 pb-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ActionRonde href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(c.email)}`} label="Teams" externe>
            <ChatIcon size={15} />
          </ActionRonde>
          <ActionRonde href={`mailto:${c.email}`} label="E-mail">
            <MailIcon size={15} />
          </ActionRonde>
          {c.telephone && (
            <ActionRonde href={`tel:${c.telephone.replace(/\s/g, "")}`} label="Appeler">
              <PhoneIcon size={15} />
            </ActionRonde>
          )}
        </div>
      </div>

      {/* Identité */}
      <button onClick={() => onSelect(c)} className="flex-1 flex flex-col text-left p-3.5 cursor-pointer">
        <p className="text-sm font-extrabold text-agilly-black leading-tight group-hover:text-agilly-primary transition-colors">
          {c.prenom} {c.nom}
        </p>
        {c.poste && <p className="text-xs text-agilly-gray mt-1 leading-snug line-clamp-2">{c.poste}</p>}
        <span className={cn("mt-auto pt-2.5 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider", col.text)}>
          <span className={cn("w-1.5 h-1.5 shrink-0", col.dot)} />
          <span className="truncate">{libelleCourt(c.direction)}</span>
        </span>
      </button>
    </article>
  );
}

function ActionRonde({ href, label, externe = false, children }: { href: string; label: string; externe?: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={externe ? "_blank" : undefined}
      rel={externe ? "noreferrer" : undefined}
      title={label}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="pointer-events-auto w-9 h-9 flex items-center justify-center bg-white text-agilly-black shadow-lg hover:bg-agilly-primary hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}

function ListePersonnes({ personnes, onSelect }: { personnes: Collaborateur[]; onSelect: (c: Collaborateur) => void }) {
  return (
    <div className="bg-white border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.04)] divide-y divide-slate-100">
      {personnes.map((c) => {
        const col = couleurDirection(c.direction);
        return (
          <div key={c.id} className="group flex items-center gap-4 px-4 sm:px-5 py-3 hover:bg-slate-50/80 transition-colors">
            <button onClick={() => onSelect(c)} className="flex items-center gap-4 min-w-0 flex-1 text-left cursor-pointer">
              <PersonAvatar prenom={c.prenom} nom={c.nom} photoUrl={c.photoUrl} size="md" teinte={cn(col.soft, col.text)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-agilly-black truncate group-hover:text-agilly-primary transition-colors">
                  {c.prenom} {c.nom}
                </p>
                <p className="text-xs text-agilly-gray truncate">{c.poste || "—"}</p>
              </div>
            </button>
            <span className={cn("hidden md:inline-flex items-center gap-1.5 w-56 text-[11px] font-bold", col.text)}>
              <span className={cn("w-1.5 h-1.5 shrink-0", col.dot)} />
              <span className="truncate">{libelleCourt(c.direction)}</span>
            </span>
            <span className="hidden lg:block w-64 text-xs text-agilly-gray truncate">{c.email}</span>
            <div className="flex gap-1 shrink-0">
              <a
                href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(c.email)}`}
                target="_blank"
                rel="noreferrer"
                title="Teams"
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-agilly-primary hover:bg-orange-50 transition-colors"
              >
                <ChatIcon size={15} />
              </a>
              <a href={`mailto:${c.email}`} title="E-mail" className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-agilly-primary hover:bg-orange-50 transition-colors">
                <MailIcon size={15} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GrilleSquelette() {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <li key={i} className="bg-white border border-slate-200">
          <div className="aspect-[4/4.4] animate-shimmer" />
          <div className="p-3.5 space-y-2">
            <div className="h-3.5 w-3/4 animate-shimmer" />
            <div className="h-3 w-1/2 animate-shimmer" />
          </div>
        </li>
      ))}
    </ul>
  );
}
