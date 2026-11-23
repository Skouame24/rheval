// ============================================================
// features/portail/components/PreferencesView.tsx
// « Mes préférences » : anniversaire (jour/mois, visibilité) et
// e-mails de notification par application.
// ============================================================

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { portailApi, type ModeEmail, type PreferencesEmail } from "@/lib/api/portail.api";
import type { PortailApp } from "../data/catalogue";
import { JOURS_MAX, MOIS } from "../data/dates";
import { NOTIF_APPS } from "../data/notifApps";
import type { Collaborateur } from "../data/portail.mock";
import { useAnnuaire } from "../hooks/useAnnuaire";
import { usePortailNotifications } from "../hooks/usePortailNotifications";
import { PersonModal } from "./PersonModal";
import { PortailBackground } from "./PortailBackground";
import { PortailFooter } from "./PortailFooter";
import { PortailHeader } from "./PortailHeader";

interface Props {
  prenom: string;
  nom: string;
  libelleRole: string;
  onLogout: () => void;
  onOpenApp: (app: PortailApp) => void;
}

const MODES: { valeur: ModeEmail; libelle: string; aide: string }[] = [
  { valeur: "IMMEDIAT", libelle: "Tout de suite", aide: "Un e-mail à chaque notification" },
  { valeur: "ACTIONS", libelle: "Actions seulement", aide: "Seulement quand vous devez agir" },
  { valeur: "QUOTIDIEN", libelle: "1 récap / jour", aide: "Un résumé chaque matin à 7 h" },
  { valeur: "AUCUN", libelle: "Aucun e-mail", aide: "Uniquement dans le portail" },
];

const APPS_REGLABLES = ["rheval", "absences", "missions", "caisse"] as const;

export function PreferencesView({ prenom, nom, libelleRole, onLogout, onOpenApp }: Props) {
  const { collaborateurs } = useAnnuaire();
  const notif = usePortailNotifications();
  const [personne, setPersonne] = useState<Collaborateur | null>(null);
  const fermer = useCallback(() => setPersonne(null), []);

  return (
    <div className="relative isolate min-h-screen flex flex-col">
      <PortailBackground />
      <PortailHeader
        prenom={prenom}
        nom={nom}
        libelleRole={libelleRole}
        personnes={collaborateurs}
        notif={notif}
        onLogout={onLogout}
        onOpenApp={onOpenApp}
        onSelectPerson={setPersonne}
      />

      <main className="flex-1 w-full max-w-[860px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-6">
        <div>
          <Link href="/portail" className="text-xs font-semibold text-agilly-gray hover:text-agilly-primary">
            ← Retour au portail
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-agilly-black">
            Mes préférences<span className="text-agilly-primary">.</span>
          </h1>
          <p className="mt-1 text-sm text-agilly-gray">Ce que vos collègues voient de vous, et comment Agilly vous prévient.</p>
        </div>

        <CarteAnniversaire />
        <CarteEmails />
      </main>

      <PortailFooter />
      <PersonModal personne={personne} onClose={fermer} />
    </div>
  );
}

// ─── Anniversaire ────────────────────────────────────────────

function CarteAnniversaire() {
  const [jour, setJour] = useState<number | "">("");
  const [mois, setMois] = useState<number | "">("");
  const [visible, setVisible] = useState(true);
  const [etat, setEtat] = useState<"chargement" | "pret" | "envoi" | "ok" | "erreur">("chargement");
  const [message, setMessage] = useState("");

  useEffect(() => {
    portailApi
      .monAnniversaire()
      .then((a) => {
        setJour(a.jour ?? "");
        setMois(a.mois ?? "");
        setVisible(a.visible);
        setEtat("pret");
      })
      .catch(() => setEtat("pret"));
  }, []);

  const joursDispo = mois === "" ? 31 : JOURS_MAX[mois - 1];
  const incomplet = (jour === "") !== (mois === "");

  const enregistrer = async (effacer = false) => {
    setEtat("envoi");
    setMessage("");
    try {
      const r = await portailApi.enregistrerMonAnniversaire({
        jour: effacer || jour === "" ? null : jour,
        mois: effacer || mois === "" ? null : mois,
        visible,
      });
      setJour(r.jour ?? "");
      setMois(r.mois ?? "");
      setVisible(r.visible);
      setEtat("ok");
      setMessage(effacer ? "Date effacée." : "Enregistré.");
    } catch (e) {
      setEtat("erreur");
      setMessage(e instanceof Error ? e.message : "Enregistrement impossible.");
    }
  };

  return (
    <section className="bg-white border border-slate-200 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.25)]">
      <header className="px-5 md:px-6 pt-5 md:pt-6">
        <h2 className="text-base font-extrabold text-agilly-black">🎂 Mon anniversaire</h2>
        <p className="mt-1 text-sm text-agilly-gray">
          Le jour J, vos collègues verront une petite attention sur le portail. Seuls le jour et le mois sont enregistrés, jamais l&apos;année.
        </p>
      </header>

      <div className="px-5 md:px-6 py-5 grid gap-4 sm:grid-cols-[110px_1fr] sm:items-end">
        <label className="block">
          <span className="text-xs font-bold text-slate-500">Jour</span>
          <select
            value={jour}
            disabled={etat === "chargement"}
            onChange={(e) => setJour(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-1 w-full h-11 px-3 bg-agilly-bg border border-slate-200 text-sm text-agilly-black outline-none focus:border-agilly-primary/60 focus:ring-2 focus:ring-agilly-primary/15"
          >
            <option value="">—</option>
            {Array.from({ length: joursDispo }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">Mois</span>
          <select
            value={mois}
            disabled={etat === "chargement"}
            onChange={(e) => {
              const m = e.target.value === "" ? "" : Number(e.target.value);
              setMois(m);
              if (m !== "" && jour !== "" && jour > JOURS_MAX[m - 1]) setJour(JOURS_MAX[m - 1]);
            }}
            className="mt-1 w-full h-11 px-3 bg-agilly-bg border border-slate-200 text-sm text-agilly-black outline-none focus:border-agilly-primary/60 focus:ring-2 focus:ring-agilly-primary/15"
          >
            <option value="">—</option>
            {MOIS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2 flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#F0822A]"
          />
          <span className="text-sm text-agilly-black">
            Afficher mon anniversaire sur le portail
            <span className="block text-xs text-agilly-gray">Décochez pour rester discret : la date reste connue de la RH uniquement.</span>
          </span>
        </label>
      </div>

      <footer className="px-5 md:px-6 py-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
        <button
          onClick={() => enregistrer()}
          disabled={etat === "chargement" || etat === "envoi" || incomplet}
          className="h-10 px-5 bg-agilly-primary hover:bg-agilly-primary-hover text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {etat === "envoi" ? "Enregistrement…" : "Enregistrer"}
        </button>
        {(jour !== "" || mois !== "") && (
          <button
            onClick={() => enregistrer(true)}
            disabled={etat === "envoi"}
            className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            Effacer la date
          </button>
        )}
        {incomplet && <span className="text-xs text-amber-700">Choisissez le jour et le mois.</span>}
        {message && (
          <span role="status" className={`text-xs font-semibold ${etat === "erreur" ? "text-rose-600" : "text-emerald-700"}`}>
            {message}
          </span>
        )}
      </footer>
    </section>
  );
}

// ─── E-mails de notification ─────────────────────────────────

function CarteEmails() {
  const [prefs, setPrefs] = useState<PreferencesEmail | null>(null);
  const [erreur, setErreur] = useState("");
  const [enregistre, setEnregistre] = useState<string | null>(null);

  useEffect(() => {
    portailApi.preferencesEmail().then(setPrefs).catch(() => setErreur("Préférences indisponibles pour le moment."));
  }, []);

  const changer = async (app: string, mode: ModeEmail) => {
    if (!prefs) return;
    const avant = prefs;
    setPrefs({ ...prefs, [app]: mode });
    setErreur("");
    try {
      setPrefs(await portailApi.enregistrerPreferenceEmail(app, mode));
      setEnregistre(app);
      window.setTimeout(() => setEnregistre((x) => (x === app ? null : x)), 1800);
    } catch {
      setPrefs(avant);
      setErreur("Enregistrement impossible, réessayez.");
    }
  };

  return (
    <section className="bg-white border border-slate-200 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.25)]">
      <header className="px-5 md:px-6 pt-5 md:pt-6">
        <h2 className="text-base font-extrabold text-agilly-black">✉️ E-mails de notification</h2>
        <p className="mt-1 text-sm text-agilly-gray">
          Choisissez, application par application, quand recevoir un e-mail. Les notifications restent toujours dans la cloche du portail.
        </p>
      </header>

      <div className="px-5 md:px-6 py-5 space-y-5">
        {!prefs && !erreur && <div className="h-40 bg-slate-100 animate-pulse" />}
        {erreur && <p className="text-sm text-rose-600">{erreur}</p>}

        {prefs &&
          APPS_REGLABLES.map((app) => {
            const p = NOTIF_APPS[app];
            const actuel = prefs[app] ?? "IMMEDIAT";
            return (
              <div key={app}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                  <span className="text-sm font-bold text-agilly-black">{p.label}</span>
                  {enregistre === app && <span className="text-[11px] font-semibold text-emerald-700">Enregistré ✓</span>}
                </div>
                <div role="radiogroup" aria-label={`E-mails ${p.label}`} className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {MODES.map((m) => {
                    const actif = actuel === m.valeur;
                    return (
                      <button
                        key={m.valeur}
                        role="radio"
                        aria-checked={actif}
                        title={m.aide}
                        onClick={() => !actif && changer(app, m.valeur)}
                        className={`min-h-11 px-3 py-2 text-left border text-xs transition-colors cursor-pointer ${
                          actif
                            ? "border-agilly-primary bg-orange-50 text-agilly-black"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="block font-bold">{m.libelle}</span>
                        <span className="block text-[11px] text-slate-400 leading-snug">{m.aide}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
