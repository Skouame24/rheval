// ============================================================
// features/assistant/components/AssistantWidget.tsx
// « Agil », l'assistant du portail Agilly.
// Répond à partir de la FAQ interne, 100 % local et gratuit.
// ============================================================

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES, FAQ, SUGGESTIONS_ACCUEIL, type CategorieFaq, type EntreeFaq } from "../data/faq";
import { entreeParId, repondre, type ReponseAssistant } from "../lib/moteur";
import { TexteRiche } from "./TexteRiche";

// ─── Types ──────────────────────────────────────────────────

type ContenuBot =
  | { type: "accueil" }
  | { type: "categorie"; categorie: CategorieFaq }
  | ReponseAssistant;

type Message =
  | { id: number; auteur: "moi"; texte: string }
  | { id: number; auteur: "bot"; contenu: ContenuBot };

type SansId<T> = T extends unknown ? Omit<T, "id"> : never;

type Avis = "utile" | "pas-utile";

const CLE_TEASER = "agilly_assistant_teaser_vu";

/**
 * Avis envoyé à l'API pour améliorer la FAQ (sans bloquer ni signaler d'erreur).
 * entreeId null = question non comprise par l'assistant.
 */
function envoyerAvis(entreeId: string | null, question: string, utile: boolean) {
  fetch("/api/proxy/portail/assistant/avis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entreeId, question: question.slice(0, 500), utile }),
  }).catch(() => {});
}

// ─── Icônes ─────────────────────────────────────────────────

const Ico = ({ d, size = 18, className }: { d: React.ReactNode; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {d}
  </svg>
);
const IcoChat = (p: { size?: number }) => <Ico {...p} d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />;
const IcoClose = (p: { size?: number }) => <Ico {...p} d={<path d="M18 6 6 18M6 6l12 12" />} />;
const IcoSend = (p: { size?: number }) => <Ico {...p} d={<path d="M12 19V5M5 12l7-7 7 7" />} />;
const IcoReset = (p: { size?: number }) => <Ico {...p} d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>} />;
const IcoArrow = (p: { size?: number }) => <Ico {...p} d={<path d="M5 12h14M12 5l7 7-7 7" />} />;

/** Mascotte d'Agil : carré orange, regard bienveillant */
function Mascotte({ taille = 40 }: { taille?: number }) {
  return (
    <span
      className="relative shrink-0 flex items-center justify-center bg-gradient-to-br from-agilly-primary to-amber-400 shadow-[0_6px_16px_-6px_rgba(240,130,42,0.7)]"
      style={{ width: taille, height: taille }}
      aria-hidden="true"
    >
      <svg width={taille * 0.62} height={taille * 0.62} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" fill="white" />
        <rect x="7.5" y="9.5" width="2.6" height="2.6" fill="#0F172A" />
        <rect x="13.9" y="9.5" width="2.6" height="2.6" fill="#0F172A" />
        <path d="M9 15c1.6 1.2 4.4 1.2 6 0" stroke="#F0822A" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 ring-2 ring-white" />
    </span>
  );
}

// ─── Widget ─────────────────────────────────────────────────

interface Props {
  prenom?: string;
  ouvertParDefaut?: boolean;
  /** Question posée automatiquement à l'ouverture (ex. bouton « Aide » d'une page) */
  questionInitiale?: string;
}

export function AssistantWidget({ prenom, ouvertParDefaut = false, questionInitiale }: Props) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, auteur: "bot", contenu: { type: "accueil" } }]);
  const [saisie, setSaisie] = useState("");
  const [ecrit, setEcrit] = useState(false);
  const [avis, setAvis] = useState<Record<number, Avis>>({});
  const [teaser, setTeaser] = useState(false);

  const idRef = useRef(1);
  const zoneRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLInputElement>(null);

  // Petite bulle d'invitation, une seule fois
  useEffect(() => {
    let vu = false;
    try {
      vu = localStorage.getItem(CLE_TEASER) === "1";
    } catch {
      /* stockage indisponible */
    }
    if (vu || ouvertParDefaut) return;
    const t = setTimeout(() => setTeaser(true), 2500);
    return () => clearTimeout(t);
  }, [ouvertParDefaut]);

  const fermerTeaser = useCallback(() => {
    setTeaser(false);
    try {
      localStorage.setItem(CLE_TEASER, "1");
    } catch {
      /* stockage indisponible */
    }
  }, []);

  // Défilement : on montre le DÉBUT de la dernière réponse (pas sa fin)
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const dernier = messages[messages.length - 1];
    if (messages.length === 1) {
      zone.scrollTo({ top: 0 });
    } else if (ecrit || dernier.auteur === "moi") {
      zone.scrollTo({ top: zone.scrollHeight, behavior: "smooth" });
    } else {
      const el = zone.querySelector<HTMLElement>(`[data-msg="${dernier.id}"]`);
      if (el) zone.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
    }
  }, [messages, ecrit]);

  // Échap pour fermer, focus du champ à l'ouverture
  useEffect(() => {
    if (!ouvert) return;
    champRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ouvert]);

  const ajouter = (m: SansId<Message>) => setMessages((prev) => [...prev, { ...m, id: idRef.current++ } as Message]);

  /** Envoie un message utilisateur puis la réponse du bot après un court délai « d'écriture ». */
  const envoyer = (texte: string, contenuForce?: ContenuBot) => {
    const q = texte.trim();
    if (!q || ecrit) return;
    ajouter({ auteur: "moi", texte: q });
    setSaisie("");
    setEcrit(true);
    const contenu = contenuForce ?? repondre(q, prenom);
    // Question non comprise : remontée à la RH pour enrichir la FAQ
    if (contenu.type === "inconnu") envoyerAvis(null, q, false);
    setTimeout(() => {
      ajouter({ auteur: "bot", contenu });
      setEcrit(false);
    }, 550 + Math.min(q.length * 12, 600));
  };

  const poserQuestion = (e: EntreeFaq) => {
    const proches = (e.liees ?? []).map(entreeParId).filter((x): x is EntreeFaq => !!x).slice(0, 3);
    envoyer(e.question, { type: "reponse", entree: e, proches });
  };

  const ouvrirCategorie = (c: CategorieFaq) => envoyer(`${CATEGORIES[c].emoji} ${CATEGORIES[c].label}`, { type: "categorie", categorie: c });

  // Question initiale (une seule fois)
  const initialeFaite = useRef(false);
  useEffect(() => {
    if (!ouvert || !questionInitiale || initialeFaite.current) return;
    initialeFaite.current = true;
    const t = setTimeout(() => envoyer(questionInitiale), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert, questionInitiale]);

  const recommencer = () => {
    setMessages([{ id: idRef.current++, auteur: "bot", contenu: { type: "accueil" } }]);
    setAvis({});
  };

  const basculer = () => {
    setOuvert((o) => !o);
    if (teaser) fermerTeaser();
  };

  return (
    <>
      {/* ─── Panneau ─── */}
      {ouvert && (
        <div
          role="dialog"
          aria-label="Assistant Agilly"
          className="fixed z-[60] inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[390px] sm:h-[620px] sm:max-h-[calc(100vh-8rem)] flex flex-col bg-white sm:border sm:border-slate-200 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] animate-pop-in overflow-hidden"
        >
          {/* En-tête */}
          <header className="relative flex items-center gap-3 px-5 py-4 border-b border-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-amber-50/60 to-white" />
            <div className="absolute -right-6 -top-8 w-24 h-24 border-2 border-agilly-primary/15 rotate-12" />
            <div className="relative">
              <Mascotte />
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-[15px] font-extrabold text-agilly-black leading-tight">Agil</p>
              <p className="text-xs text-agilly-gray">Assistant Agilly · en ligne</p>
            </div>
            <button onClick={recommencer} title="Nouvelle conversation" aria-label="Nouvelle conversation" className="relative w-9 h-9 flex items-center justify-center text-slate-400 hover:text-agilly-black hover:bg-white/80 transition-colors cursor-pointer">
              <IcoReset size={16} />
            </button>
            <button onClick={() => setOuvert(false)} title="Fermer" aria-label="Fermer l'assistant" className="relative w-9 h-9 flex items-center justify-center text-slate-400 hover:text-agilly-black hover:bg-white/80 transition-colors cursor-pointer">
              <IcoClose size={18} />
            </button>
          </header>

          {/* Conversation */}
          <div ref={zoneRef} className="relative flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px]">
            {messages.map((m) =>
              m.auteur === "moi" ? (
                <div key={m.id} data-msg={m.id} className="flex justify-end animate-fade-in">
                  <p className="max-w-[80%] px-4 py-2.5 bg-agilly-primary text-white text-sm leading-relaxed shadow-sm">{m.texte}</p>
                </div>
              ) : (
                <div key={m.id} data-msg={m.id}>
                  <BulleBot
                    contenu={m.contenu}
                    prenom={prenom}
                    avis={avis[m.id]}
                    onAvis={(a) => {
                      setAvis((prev) => ({ ...prev, [m.id]: a }));
                      if (m.contenu.type !== "reponse") return;
                      const i = messages.findIndex((x) => x.id === m.id);
                      const precedent = messages.slice(0, i).reverse().find((x) => x.auteur === "moi");
                      envoyerAvis(
                        m.contenu.entree.id,
                        precedent?.auteur === "moi" ? precedent.texte : m.contenu.entree.question,
                        a === "utile",
                      );
                    }}
                    onQuestion={poserQuestion}
                    onCategorie={ouvrirCategorie}
                    onNaviguer={() => setOuvert(false)}
                  />
                </div>
              ),
            )}

            {ecrit && (
              <div className="flex items-end gap-2 animate-fade-in">
                <Mascotte taille={28} />
                <div className="flex gap-1 px-4 py-3.5 bg-white border border-slate-200 shadow-sm" aria-label="Agil écrit…">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-agilly-primary animate-typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saisie */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              envoyer(saisie);
            }}
            className="border-t border-slate-100 p-3 bg-white"
          >
            <div className="flex items-center gap-2 bg-agilly-bg border border-slate-200 focus-within:border-agilly-primary/60 focus-within:ring-2 focus-within:ring-agilly-primary/15 transition pl-4 pr-1.5 py-1.5">
              <input
                ref={champRef}
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="Posez votre question…"
                aria-label="Votre question"
                maxLength={300}
                className="flex-1 min-w-0 bg-transparent text-sm text-agilly-black placeholder:text-slate-400 outline-none"
              />
              <button
                type="submit"
                disabled={!saisie.trim() || ecrit}
                aria-label="Envoyer"
                className="w-9 h-9 flex items-center justify-center bg-agilly-primary text-white hover:bg-agilly-primary-hover disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <IcoSend size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">Réponses issues de la FAQ interne Agilly</p>
          </form>
        </div>
      )}

      {/* ─── Bulle d'invitation ─── */}
      {teaser && !ouvert && (
        <div className="fixed z-[60] bottom-[92px] right-6 max-w-[260px] bg-white border border-slate-200 shadow-[0_16px_40px_-14px_rgba(15,23,42,0.3)] p-4 pr-9 animate-pop-in">
          <button onClick={fermerTeaser} aria-label="Masquer" className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-agilly-black cursor-pointer">
            <IcoClose size={13} />
          </button>
          <button onClick={basculer} className="text-left cursor-pointer">
            <p className="text-sm font-extrabold text-agilly-black">Une question ? 👋</p>
            <p className="text-xs text-agilly-gray mt-0.5">Congés, missions, évaluations… Agil vous répond tout de suite.</p>
          </button>
          <span className="absolute -bottom-[7px] right-6 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
        </div>
      )}

      {/* ─── Lanceur ─── */}
      <button
        onClick={basculer}
        aria-label={ouvert ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        aria-expanded={ouvert}
        className={cn(
          "fixed z-[60] bottom-6 right-6 w-14 h-14 flex items-center justify-center text-white transition-all duration-300 cursor-pointer hover:-translate-y-0.5",
          ouvert
            ? "bg-agilly-black shadow-[0_12px_30px_-10px_rgba(15,23,42,0.6)] max-sm:hidden"
            : "bg-gradient-to-br from-agilly-primary to-amber-400 shadow-[0_12px_30px_-8px_rgba(240,130,42,0.7)]",
        )}
      >
        {!ouvert && <span className="absolute inset-0 bg-agilly-primary/40 animate-ping [animation-duration:2.4s]" />}
        <span className="relative">{ouvert ? <IcoClose size={22} /> : <IcoChat size={22} />}</span>
      </button>
    </>
  );
}

// ─── Bulle du bot ───────────────────────────────────────────

function BulleBot({
  contenu,
  prenom,
  avis,
  onAvis,
  onQuestion,
  onCategorie,
  onNaviguer,
}: {
  contenu: ContenuBot;
  prenom?: string;
  avis?: Avis;
  onAvis: (a: Avis) => void;
  onQuestion: (e: EntreeFaq) => void;
  onCategorie: (c: CategorieFaq) => void;
  onNaviguer: () => void;
}) {
  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <div className="mt-0.5">
        <Mascotte taille={28} />
      </div>
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="px-4 py-3 bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed shadow-sm">
          <CorpsBot contenu={contenu} prenom={prenom} />
        </div>

        {/* Actions vers les applications */}
        {contenu.type === "reponse" && contenu.entree.actions && (
          <div className="flex flex-wrap gap-2">
            {contenu.entree.actions.map((a) => (
              <Link
                key={a.href + a.label}
                href={a.href}
                onClick={onNaviguer}
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 bg-agilly-black text-white text-xs font-bold hover:bg-agilly-primary transition-colors"
              >
                {a.label}
                <IcoArrow size={13} />
              </Link>
            ))}
          </div>
        )}

        {/* Questions proposées */}
        {contenu.type === "accueil" && (
          <>
            <Puces entrees={SUGGESTIONS_ACCUEIL.map(entreeParId).filter((e): e is EntreeFaq => !!e)} onQuestion={onQuestion} />
            <p className="pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ou explorez par thème</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORIES) as CategorieFaq[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onCategorie(c)}
                  className="px-2.5 py-1.5 bg-white/90 border border-slate-200 text-xs font-semibold text-slate-600 hover:border-agilly-primary/50 hover:text-agilly-primary transition-colors cursor-pointer"
                >
                  {CATEGORIES[c].emoji} {CATEGORIES[c].label}
                </button>
              ))}
            </div>
          </>
        )}
        {contenu.type === "categorie" && <Puces entrees={FAQ.filter((e) => e.categorie === contenu.categorie)} onQuestion={onQuestion} />}
        {contenu.type === "suggestions" && <Puces entrees={contenu.proches} onQuestion={onQuestion} />}
        {contenu.type === "inconnu" && (
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CATEGORIES) as CategorieFaq[]).map((c) => (
              <button
                key={c}
                onClick={() => onCategorie(c)}
                className="px-2.5 py-1.5 bg-white/90 border border-slate-200 text-xs font-semibold text-slate-600 hover:border-agilly-primary/50 hover:text-agilly-primary transition-colors cursor-pointer"
              >
                {CATEGORIES[c].emoji} {CATEGORIES[c].label}
              </button>
            ))}
          </div>
        )}
        {contenu.type === "reponse" && contenu.proches.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ces questions peuvent aussi vous aider</p>
            <Puces entrees={contenu.proches} onQuestion={onQuestion} />
          </div>
        )}

        {/* Avis */}
        {contenu.type === "reponse" && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {avis === undefined ? (
              <>
                <span>Cette réponse vous a aidé ?</span>
                <button onClick={() => onAvis("utile")} className="px-2 py-1 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors cursor-pointer">
                  👍 Oui
                </button>
                <button onClick={() => onAvis("pas-utile")} className="px-2 py-1 bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer">
                  👎 Non
                </button>
              </>
            ) : avis === "utile" ? (
              <span className="text-emerald-600 font-semibold">Merci pour votre retour ! 🙌</span>
            ) : (
              <span>
                Désolé ! Vous pouvez{" "}
                <Link href="/portail/annuaire" onClick={onNaviguer} className="font-bold text-agilly-primary hover:underline">
                  contacter la RH
                </Link>{" "}
                directement.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CorpsBot({ contenu, prenom }: { contenu: ContenuBot; prenom?: string }) {
  switch (contenu.type) {
    case "accueil":
      return (
        <div className="space-y-1">
          <p className="font-extrabold text-agilly-black">Bonjour{prenom ? ` ${prenom}` : ""} ! 👋</p>
          <p>Je suis Agil, l&apos;assistant du portail. Je réponds à vos questions sur les congés, les missions, les évaluations et l&apos;utilisation des applications.</p>
        </div>
      );
    case "categorie":
      return <p>Voici les questions fréquentes sur <strong className="font-bold text-agilly-black">{CATEGORIES[contenu.categorie].label}</strong> :</p>;
    case "reponse":
      return <TexteRiche texte={contenu.entree.reponse} />;
    case "suggestions":
      return <p>Je ne suis pas sûr d&apos;avoir bien compris 🤔 Vouliez-vous dire :</p>;
    case "politesse":
      return <p>{contenu.texte}</p>;
    case "inconnu":
      return (
        <p>
          Je n&apos;ai pas encore la réponse à cette question 🙈 Essayez de la reformuler, ou explorez les thèmes ci-dessous.
        </p>
      );
  }
}

function Puces({ entrees, onQuestion }: { entrees: EntreeFaq[]; onQuestion: (e: EntreeFaq) => void }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {entrees.map((e) => (
        <button
          key={e.id}
          onClick={() => onQuestion(e)}
          className="text-left px-3.5 py-2 bg-white border border-orange-200 text-[13px] font-semibold text-agilly-black hover:bg-orange-50 hover:border-agilly-primary/60 transition-colors cursor-pointer shadow-[0_1px_0_rgba(240,130,42,0.15)]"
        >
          {e.question}
        </button>
      ))}
    </div>
  );
}
