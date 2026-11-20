// ============================================================
// features/assistant/lib/moteur.ts
// Moteur de recherche FAQ 100 % local (aucun service externe, aucun coût).
// - normalisation (accents, ponctuation, pluriels simples)
// - expressions-clés (fort), mots pondérés par rareté (IDF)
// - tolérance aux fautes de frappe (distance d'édition 1)
// ============================================================

import { FAQ, type EntreeFaq } from "../data/faq";

const MOTS_VIDES = new Set(
  "a au aux avec ce ces comment dans de des du elle en est et etre il je j la le les leur lui ma mais me mes moi mon ne nous on ou par pas pour qu que quel quelle quels quelles qui sa se ses son sur ta te tes toi ton tu un une vos votre vous y c d l m n s t est-ce ca cela faire fait peux puis peut veux voudrais faut dois bonjour svp merci stp".split(
    " ",
  ),
);

const SYNONYMES: Record<string, string> = {
  conges: "conge",
  vacance: "conge",
  vacances: "conge",
  absences: "absence",
  manager: "responsable",
  chef: "responsable",
  superieur: "responsable",
  n1: "responsable",
  boss: "responsable",
  remboursement: "rembourser",
  mdp: "mot",
  appli: "application",
  applis: "application",
  app: "application",
  apps: "application",
  tel: "telephone",
  mail: "email",
  courriel: "email",
};

export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, " ")
    .replace(/n\+1/g, "n1")
    .replace(/[^a-z0-9+% ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function racine(mot: string): string {
  const syn = SYNONYMES[mot] ?? mot;
  if (syn.length > 4 && (syn.endsWith("s") || syn.endsWith("x"))) return syn.slice(0, -1);
  return syn;
}

export function mots(texte: string): string[] {
  return normaliser(texte)
    .split(" ")
    .filter((m) => m.length > 1 && !MOTS_VIDES.has(m))
    .map(racine);
}

function distance1(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let ecarts = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++ecarts > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return ecarts + (a.length - i) + (b.length - j) <= 1;
}

// ─── Index (calculé une fois) ───────────────────────────────

interface EntreeIndexee {
  entree: EntreeFaq;
  /** Expressions telles quelles (petits mots compris : « où en est ») */
  expressionsBrutes: string[];
  expressions: string[];
  vocabulaire: Set<string>;
}

const INDEX: EntreeIndexee[] = FAQ.map((entree) => ({
  entree,
  expressionsBrutes: entree.motsCles.map(normaliser).filter((e) => e.includes(" ")),
  expressions: entree.motsCles.map((m) => mots(m).join(" ")).filter((e) => e.includes(" ")),
  vocabulaire: new Set([...mots(entree.question), ...entree.motsCles.flatMap(mots)]),
}));

const IDF = (() => {
  const df = new Map<string, number>();
  for (const e of INDEX) for (const m of e.vocabulaire) df.set(m, (df.get(m) ?? 0) + 1);
  const n = INDEX.length;
  const idf = new Map<string, number>();
  for (const [m, f] of df) idf.set(m, Math.log(n / f) + 0.5);
  return idf;
})();

// ─── Recherche ──────────────────────────────────────────────

export interface Resultat {
  entree: EntreeFaq;
  score: number;
}

export function rechercher(question: string): Resultat[] {
  const motsQ = mots(question);
  if (motsQ.length === 0) return [];
  const phraseQ = ` ${motsQ.join(" ")} `;
  const brutQ = ` ${normaliser(question)} `;

  return INDEX.map(({ entree, expressionsBrutes, expressions, vocabulaire }) => {
    let score = 0;
    for (const expr of expressionsBrutes) {
      if (brutQ.includes(` ${expr} `)) score += 1.5 * expr.split(" ").length;
    }
    for (const expr of expressions) {
      if (phraseQ.includes(` ${expr} `)) score += 1.5 * expr.split(" ").length;
    }
    for (const m of new Set(motsQ)) {
      if (vocabulaire.has(m)) {
        score += IDF.get(m) ?? 1;
      } else if (m.length >= 5) {
        for (const v of vocabulaire) {
          if (v.length >= 5 && distance1(m, v)) {
            score += 0.6 * (IDF.get(v) ?? 1);
            break;
          }
        }
      }
    }
    return { entree, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ─── Réponse de l'assistant ─────────────────────────────────

export type ReponseAssistant =
  | { type: "reponse"; entree: EntreeFaq; proches: EntreeFaq[] }
  | { type: "suggestions"; proches: EntreeFaq[] }
  | { type: "politesse"; texte: string }
  | { type: "inconnu" };

const SEUIL_REPONSE = 2.2;
const SEUIL_PROCHE = 1.2;

export function repondre(question: string, prenom?: string): ReponseAssistant {
  const n = normaliser(question);

  if (/^(bonjour|bonsoir|salut|hello|coucou|hey)\b/.test(n) && n.split(" ").length <= 3) {
    return { type: "politesse", texte: `Bonjour${prenom ? ` ${prenom}` : ""} ! 😊 Posez-moi votre question, je suis là pour vous aider.` };
  }
  if (/^(merci|super|parfait|top|ok merci|genial)\b/.test(n) && n.split(" ").length <= 4) {
    return { type: "politesse", texte: "Avec plaisir ! N'hésitez pas si vous avez une autre question. 🙌" };
  }

  const res = rechercher(question);
  const [premier, ...reste] = res;

  if (premier && premier.score >= SEUIL_REPONSE) {
    const seuilProche = Math.max(SEUIL_PROCHE, premier.score * 0.45);
    const lieesIds = new Set(premier.entree.liees ?? []);
    const proches = [
      ...reste.filter((r) => r.score >= seuilProche).map((r) => r.entree),
      ...FAQ.filter((e) => lieesIds.has(e.id)),
    ].filter((e, i, arr) => e.id !== premier.entree.id && arr.findIndex((x) => x.id === e.id) === i);
    return { type: "reponse", entree: premier.entree, proches: proches.slice(0, 3) };
  }

  const proches = res.filter((r) => r.score >= SEUIL_PROCHE * 0.6).slice(0, 3).map((r) => r.entree);
  if (proches.length > 0) return { type: "suggestions", proches };
  return { type: "inconnu" };
}

export function entreeParId(id: string): EntreeFaq | undefined {
  return FAQ.find((e) => e.id === id);
}
