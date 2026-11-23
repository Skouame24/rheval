// ============================================================
// app/dashboard/pilotage-rh/anniversaires/page.tsx
// RH : renseigner les anniversaires (un par un ou import collé
// depuis Excel). La visibilité reste le choix de chaque salarié.
// ============================================================

"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowPathIcon } from "@/components/ui/Icons";
import { portailApi, type AnniversaireRh, type ResultatImport } from "@/lib/api/portail.api";
import { JOURS_MAX, MOIS } from "@/features/portail/data/dates";

type Filtre = "TOUS" | "MANQUANTS" | "RENSEIGNES";

const normaliser = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function AnniversairesRhPage() {
  const [lignes, setLignes] = useState<AnniversaireRh[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [q, setQ] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("TOUS");
  const [importOuvert, setImportOuvert] = useState(false);

  const charger = async () => {
    setChargement(true);
    setErreur("");
    try {
      setLignes(await portailApi.anniversairesRh());
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    portailApi
      .anniversairesRh()
      .then(setLignes)
      .catch((e) => setErreur(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => setChargement(false));
  }, []);

  const renseignes = lignes.filter((l) => l.jour && l.mois).length;
  const visibles = useMemo(() => {
    const t = normaliser(q.trim());
    return lignes.filter((l) => {
      const ok = l.jour && l.mois;
      if (filtre === "MANQUANTS" && ok) return false;
      if (filtre === "RENSEIGNES" && !ok) return false;
      return !t || normaliser(`${l.nom} ${l.email} ${l.departement ?? ""}`).includes(t);
    });
  }, [lignes, q, filtre]);

  const majLigne = (id: string, jour: number | null, mois: number | null) =>
    setLignes((ls) => ls.map((l) => (l.id === id ? { ...l, jour, mois } : l)));

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="" notifCount={0}>
      <div className="flex flex-col gap-6 pb-10 max-w-[1200px] mx-auto w-full font-sans">
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 m-0 tracking-tight">Anniversaires</h1>
            <p className="text-xs text-slate-500 m-0 mt-1 font-medium">
              Jour et mois uniquement. Chaque salarié peut choisir de ne pas l&apos;afficher sur le portail.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={charger}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
            >
              <ArrowPathIcon size={14} className={chargement ? "animate-spin" : ""} />
              Actualiser
            </button>
            <button
              onClick={() => setImportOuvert((v) => !v)}
              className="px-4 py-2 text-xs font-bold text-white bg-agilly-primary hover:bg-agilly-primary-hover transition-colors"
            >
              Importer depuis Excel
            </button>
          </div>
        </div>

        {importOuvert && (
          <BlocImport
            onTermine={() => {
              charger();
            }}
          />
        )}

        <div className="grid grid-cols-3 gap-3">
          <Stat libelle="Collaborateurs" valeur={lignes.length} />
          <Stat libelle="Renseignés" valeur={renseignes} />
          <Stat libelle="À compléter" valeur={lignes.length - renseignes} accent />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un nom, un e-mail, une direction…"
            className="flex-1 min-w-[220px] h-10 px-3 bg-white border border-slate-200 text-sm outline-none focus:border-agilly-primary/60"
          />
          <div className="flex border border-slate-200 bg-white">
            {(
              [
                ["TOUS", "Tous"],
                ["MANQUANTS", "À compléter"],
                ["RENSEIGNES", "Renseignés"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFiltre(v)}
                className={`px-3 h-10 text-xs font-bold ${filtre === v ? "bg-agilly-black text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {erreur && <p className="text-sm text-rose-600">{erreur}</p>}

        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 font-bold">Collaborateur</th>
                <th className="px-4 py-3 font-bold hidden md:table-cell">Direction</th>
                <th className="px-4 py-3 font-bold">Anniversaire</th>
                <th className="px-4 py-3 font-bold hidden sm:table-cell">Portail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chargement && lignes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-500">Chargement…</td>
                </tr>
              ) : visibles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-500">Aucun collaborateur.</td>
                </tr>
              ) : (
                visibles.map((l) => <Ligne key={l.id} ligne={l} onEnregistre={majLigne} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ libelle, valeur, accent }: { libelle: string; valeur: number; accent?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{libelle}</p>
      <p className={`text-2xl font-extrabold ${accent && valeur > 0 ? "text-agilly-primary" : "text-slate-900"}`}>{valeur}</p>
    </div>
  );
}

function Ligne({
  ligne,
  onEnregistre,
}: {
  ligne: AnniversaireRh;
  onEnregistre: (id: string, jour: number | null, mois: number | null) => void;
}) {
  const [jour, setJour] = useState<number | "">(ligne.jour ?? "");
  const [mois, setMois] = useState<number | "">(ligne.mois ?? "");
  const [etat, setEtat] = useState<"" | "envoi" | "ok" | "erreur">("");

  const modifie = (jour || null) !== ligne.jour || (mois || null) !== ligne.mois;
  const incomplet = (jour === "") !== (mois === "");

  const enregistrer = async () => {
    setEtat("envoi");
    try {
      const r = await portailApi.enregistrerAnniversaireRh(ligne.id, {
        jour: jour === "" ? null : jour,
        mois: mois === "" ? null : mois,
      });
      onEnregistre(ligne.id, r.jour, r.mois);
      setEtat("ok");
    } catch {
      setEtat("erreur");
    }
  };

  const selectCls = "h-9 px-2 bg-agilly-bg border border-slate-200 text-sm outline-none focus:border-agilly-primary/60";

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-4 py-3">
        <p className="font-semibold text-slate-900">{ligne.nom}</p>
        <p className="text-xs text-slate-500">{ligne.email}</p>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">{ligne.departement ?? "—"}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label={`Jour — ${ligne.nom}`} value={jour} onChange={(e) => { setJour(e.target.value === "" ? "" : Number(e.target.value)); setEtat(""); }} className={selectCls}>
            <option value="">—</option>
            {Array.from({ length: mois === "" ? 31 : JOURS_MAX[mois - 1] }, (_, i) => i + 1).map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
          <select
            aria-label={`Mois — ${ligne.nom}`}
            value={mois}
            onChange={(e) => {
              const m = e.target.value === "" ? "" : Number(e.target.value);
              setMois(m);
              if (m !== "" && jour !== "" && jour > JOURS_MAX[m - 1]) setJour(JOURS_MAX[m - 1]);
              setEtat("");
            }}
            className={selectCls}
          >
            <option value="">—</option>
            {MOIS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          {modifie && (
            <button
              onClick={enregistrer}
              disabled={incomplet || etat === "envoi"}
              className="h-9 px-3 text-xs font-bold text-white bg-agilly-primary hover:bg-agilly-primary-hover disabled:opacity-50"
            >
              {etat === "envoi" ? "…" : "Enregistrer"}
            </button>
          )}
          {etat === "ok" && !modifie && <span className="text-xs font-semibold text-emerald-700">✓</span>}
          {etat === "erreur" && <span className="text-xs font-semibold text-rose-600">Échec</span>}
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        {ligne.visible ? (
          <span className="text-xs font-semibold text-emerald-700">Affiché</span>
        ) : (
          <span className="text-xs font-semibold text-slate-400" title="Le salarié a choisi de ne pas l'afficher">Masqué</span>
        )}
      </td>
    </tr>
  );
}

function BlocImport({ onTermine }: { onTermine: () => void }) {
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<ResultatImport | null>(null);
  const [erreur, setErreur] = useState("");

  const importer = async () => {
    setEnvoi(true);
    setErreur("");
    setResultat(null);
    try {
      const r = await portailApi.importerAnniversaires(texte);
      setResultat(r);
      if (r.misAJour > 0) onTermine();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Import impossible.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-5 space-y-3">
      <div>
        <p className="text-sm font-bold text-slate-900">Coller deux colonnes depuis Excel : e-mail puis date (JJ/MM)</p>
        <p className="text-xs text-slate-500">L&apos;année éventuelle est ignorée. Les lignes sans e-mail reconnu sont signalées.</p>
      </div>
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={6}
        placeholder={"aicha.kone@agilly.net\t14/03\nmoussa.traore@agilly.net\t02/09"}
        className="w-full p-3 font-mono text-xs bg-agilly-bg border border-slate-200 outline-none focus:border-agilly-primary/60"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={importer}
          disabled={envoi || !texte.trim()}
          className="px-4 py-2 text-xs font-bold text-white bg-agilly-black hover:bg-slate-800 disabled:opacity-50"
        >
          {envoi ? "Import…" : "Importer"}
        </button>
        {erreur && <span className="text-xs text-rose-600">{erreur}</span>}
      </div>
      {resultat && (
        <div className="text-xs space-y-1">
          <p className="font-semibold text-emerald-700">{resultat.misAJour} anniversaire(s) mis à jour.</p>
          {resultat.introuvables.length > 0 && (
            <p className="text-amber-700">E-mails inconnus ({resultat.introuvables.length}) : {resultat.introuvables.join(", ")}</p>
          )}
          {resultat.invalides.length > 0 && (
            <p className="text-rose-600">Lignes illisibles ({resultat.invalides.length}) : {resultat.invalides.slice(0, 10).join(" · ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
