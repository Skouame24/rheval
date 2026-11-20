// ============================================================
// features/portail/data/portail.mock.ts
// DONNÉES DE DÉMONSTRATION — personnes et actualités fictives.
// À remplacer par : Microsoft Graph (annuaire) et module Actualités (API).
// ============================================================

export const IS_DEMO_DATA = true;

export interface Collaborateur {
  id: string;
  prenom: string;
  nom: string;
  poste: string;
  direction: string;
  email: string;
  telephone?: string;
  /** Photo Microsoft 365 (servie par /api/portail/photo/[id]) */
  photoUrl?: string;
  /** ISO — date d'embauche (ou de création du compte) si connue */
  dateArrivee?: string;
  /** mois 1-12 — non fourni par Microsoft Graph en liste */
  anniversaire?: { jour: number; mois: number };
  manager?: string;
  bureau?: string;
}

export type SourceActualite = "INTERNE" | "LINKEDIN";

export interface Actualite {
  id: string;
  titre: string;
  extrait: string;
  source: SourceActualite;
  auteur: string;
  date: string; // ISO
  epingle?: boolean;
  url?: string;
}

export const DIRECTIONS = [
  "Direction Générale",
  "Direction des Ressources Humaines",
  "Direction Financière et Comptable",
  "Direction Juridique & Digital",
  "Direction des Opérations",
];

const now = new Date();
const moisCourant = now.getMonth() + 1;
const jourCourant = now.getDate();

function ilYa(jours: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - jours);
  return d.toISOString();
}

export const COLLABORATEURS: Collaborateur[] = [
  { id: "c1", prenom: "Aïcha", nom: "Koné", poste: "Comptable", direction: "Direction Financière et Comptable", email: "aicha.kone@exemple.ci", telephone: "+225 07 00 00 00 01", dateArrivee: ilYa(6), anniversaire: { jour: 3, mois: 4 }, manager: "Serge Kouassi" },
  { id: "c2", prenom: "Moussa", nom: "Traoré", poste: "Chargé de recrutement", direction: "Direction des Ressources Humaines", email: "moussa.traore@exemple.ci", dateArrivee: ilYa(18), anniversaire: { jour: 12, mois: 9 }, manager: "Mariam Ouattara" },
  { id: "c3", prenom: "Fatou", nom: "Diabaté", poste: "Juriste", direction: "Direction Juridique & Digital", email: "fatou.diabate@exemple.ci", dateArrivee: ilYa(40), anniversaire: { jour: jourCourant, mois: moisCourant }, manager: "Patrick Gnamien" },
  { id: "c4", prenom: "Jean-Marc", nom: "Yao", poste: "Directeur Général", direction: "Direction Générale", email: "jeanmarc.yao@exemple.ci", dateArrivee: ilYa(2900), anniversaire: { jour: 8, mois: 1 } },
  { id: "c5", prenom: "Mariam", nom: "Ouattara", poste: "Directrice des Ressources Humaines", direction: "Direction des Ressources Humaines", email: "mariam.ouattara@exemple.ci", dateArrivee: ilYa(1800), anniversaire: { jour: jourCourant, mois: moisCourant }, manager: "Jean-Marc Yao" },
  { id: "c6", prenom: "Kevin", nom: "N'Guessan", poste: "Développeur Fullstack", direction: "Direction Juridique & Digital", email: "kevin.nguessan@exemple.ci", dateArrivee: ilYa(400), anniversaire: { jour: 2, mois: 6 }, manager: "Patrick Gnamien" },
  { id: "c7", prenom: "Awa", nom: "Bamba", poste: "Trésorière", direction: "Direction Financière et Comptable", email: "awa.bamba@exemple.ci", dateArrivee: ilYa(950), anniversaire: { jour: 28, mois: moisCourant }, manager: "Serge Kouassi" },
  { id: "c8", prenom: "Serge", nom: "Kouassi", poste: "Directeur Financier et Comptable", direction: "Direction Financière et Comptable", email: "serge.kouassi@exemple.ci", dateArrivee: ilYa(2200), anniversaire: { jour: 19, mois: 11 }, manager: "Jean-Marc Yao" },
  { id: "c9", prenom: "Christelle", nom: "Aka", poste: "Responsable des Opérations", direction: "Direction des Opérations", email: "christelle.aka@exemple.ci", dateArrivee: ilYa(1300), anniversaire: { jour: 5, mois: moisCourant }, manager: "Jean-Marc Yao" },
  { id: "c10", prenom: "Ibrahim", nom: "Coulibaly", poste: "Technicien d'intervention", direction: "Direction des Opérations", email: "ibrahim.coulibaly@exemple.ci", dateArrivee: ilYa(25), anniversaire: { jour: 30, mois: 3 }, manager: "Christelle Aka" },
  { id: "c11", prenom: "Nadia", nom: "Soro", poste: "Caissière", direction: "Direction Financière et Comptable", email: "nadia.soro@exemple.ci", dateArrivee: ilYa(700), anniversaire: { jour: 11, mois: moisCourant }, manager: "Serge Kouassi" },
  { id: "c12", prenom: "Patrick", nom: "Gnamien", poste: "Directeur Juridique & Digital", direction: "Direction Juridique & Digital", email: "patrick.gnamien@exemple.ci", dateArrivee: ilYa(2500), anniversaire: { jour: 22, mois: 7 }, manager: "Jean-Marc Yao" },
];

export const ACTUALITES: Actualite[] = [
  {
    id: "a1",
    titre: "Retour sur notre séminaire annuel",
    extrait: "Deux jours d'échanges entre toutes les directions autour de nos ambitions pour l'année à venir. Merci à toutes les équipes pour leur mobilisation !",
    source: "LINKEDIN",
    auteur: "Page Agilly",
    date: ilYa(2),
    epingle: true,
    url: "#",
  },
  {
    id: "a2",
    titre: "Note de service : nouvelle procédure des pièces de caisse",
    extrait: "Les demandes d'avance et de dépense de caisse seront bientôt dématérialisées sur le portail.",
    source: "INTERNE",
    auteur: "Direction Financière",
    date: ilYa(1),
  },
  {
    id: "a3",
    titre: "Bienvenue à nos nouveaux collaborateurs",
    extrait: "Trois nouvelles recrues rejoignent la Finance, les RH et les Opérations ce mois-ci.",
    source: "INTERNE",
    auteur: "Direction des Ressources Humaines",
    date: ilYa(4),
  },
  {
    id: "a4",
    titre: "Agilly recrute : Développeur Fullstack",
    extrait: "Rejoignez la Direction Juridique & Digital. Partagez l'offre autour de vous !",
    source: "LINKEDIN",
    auteur: "Page Agilly",
    date: ilYa(6),
    url: "#",
  },
  {
    id: "a5",
    titre: "Maintenance du réseau ce week-end",
    extrait: "Une coupure de courte durée est prévue samedi matin. Pensez à enregistrer vos travaux.",
    source: "INTERNE",
    auteur: "Service Informatique",
    date: ilYa(8),
  },
];

// ─── Sélecteurs ─────────────────────────────────────────────

const JOUR_MS = 86_400_000;

export function getNouveauxArrivants(liste: Collaborateur[], jours = 45): Collaborateur[] {
  const limite = Date.now() - jours * JOUR_MS;
  return liste
    .filter((c) => c.dateArrivee && new Date(c.dateArrivee).getTime() >= limite)
    .sort((a, b) => new Date(b.dateArrivee!).getTime() - new Date(a.dateArrivee!).getTime());
}

export function getAnniversairesDuMois(liste: Collaborateur[]): Collaborateur[] {
  const mois = new Date().getMonth() + 1;
  return liste
    .filter((c) => c.anniversaire?.mois === mois)
    .sort((a, b) => a.anniversaire!.jour - b.anniversaire!.jour);
}

export function getAnniversairesDuJour(liste: Collaborateur[]): Collaborateur[] {
  const d = new Date();
  return liste.filter((c) => c.anniversaire?.mois === d.getMonth() + 1 && c.anniversaire?.jour === d.getDate());
}

/** Directions présentes dans la liste, triées par effectif décroissant. */
export function getDirections(liste: Collaborateur[]): { nom: string; effectif: number }[] {
  const compte = new Map<string, number>();
  for (const c of liste) compte.set(c.direction, (compte.get(c.direction) ?? 0) + 1);
  return [...compte.entries()]
    .map(([nom, effectif]) => ({ nom, effectif }))
    .sort((a, b) => b.effectif - a.effectif || a.nom.localeCompare(b.nom, "fr"));
}
