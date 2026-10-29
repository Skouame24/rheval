// ============================================================
// lib/api/missions.api.ts
// Référentiel officiel des missions, villes de Côte d'Ivoire,
// moyens de transport et moteur de calcul prévisionnel des frais
// ============================================================

import { client } from "./client";

export type ZoneBaremeMission =
  | "GRAND_ABIDJAN"
  | "INTERIEUR_1"
  | "INTERIEUR_2"
  | "INTERIEUR_3"
  | "SOUS_REGION"
  | "INTERNATIONAL";

export interface VilleMissionItem {
  id: string;
  nom: string;
  pays: string;
  districtOuRegion: string;
  zone: ZoneBaremeMission;
  distanceKmDepuisAbidjan: number;
  desserteAerienne?: boolean;
  desserteFerroviaire?: boolean;
  tarifCarEstimeAR?: number;
  peageEstimeAR?: number;
}

export interface MoyenTransportItem {
  code: string;
  libelle: string;
  description: string;
  typeCalcul: "KILOMETRIQUE" | "CARBURANT_PEAGE" | "FORFAIT_VILLE" | "FORFAIT_JOUR" | "BILLET_AVION";
  tarifUnitaireOuTaux?: number;
  applicablePartout?: boolean;
  zonesIncompatibles?: ZoneBaremeMission[];
}

export interface BaremeZoneItem {
  zone: ZoneBaremeMission;
  libelle: string;
  perDiemJournalier: number;
  description: string;
}

export interface CalculFraisMissionResult {
  ville: VilleMissionItem;
  transport: MoyenTransportItem;
  nombreJours: number;
  perDiemJournalier: number;
  totalPerDiem: number;
  distanceKmAR: number;
  fraisTransportEstimes: number;
  totalFraisPrevisionnels: number;
  avanceSuggeree80: number;
  avanceSuggeree100: number;
  detailsCalcul: string;
}

// ── RÉFÉRENTIEL LOCAL IMMÉDIAT (OFFLINE-FIRST & REACTIF) ──
export const VILLES_CI_CATALOGUE: VilleMissionItem[] = [
  // Grand Abidjan & Périphérie (< 50 km)
  {
    id: "ABIDJAN",
    nom: "Abidjan (Communes & Zones Industrielles)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "District Autonome d'Abidjan",
    zone: "GRAND_ABIDJAN",
    distanceKmDepuisAbidjan: 15,
    tarifCarEstimeAR: 2000,
    peageEstimeAR: 0,
  },
  {
    id: "GRAND_BASSAM",
    nom: "Grand-Bassam",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Sud-Comoé",
    zone: "GRAND_ABIDJAN",
    distanceKmDepuisAbidjan: 35,
    tarifCarEstimeAR: 2000,
    peageEstimeAR: 2000,
  },
  {
    id: "BINGERVILLE",
    nom: "Bingerville",
    pays: "Côte d'Ivoire",
    districtOuRegion: "District Autonome d'Abidjan",
    zone: "GRAND_ABIDJAN",
    distanceKmDepuisAbidjan: 20,
    tarifCarEstimeAR: 1500,
    peageEstimeAR: 0,
  },
  {
    id: "SONGON",
    nom: "Songon",
    pays: "Côte d'Ivoire",
    districtOuRegion: "District Autonome d'Abidjan",
    zone: "GRAND_ABIDJAN",
    distanceKmDepuisAbidjan: 25,
    tarifCarEstimeAR: 2000,
    peageEstimeAR: 0,
  },
  {
    id: "ANYAMA",
    nom: "Anyama",
    pays: "Côte d'Ivoire",
    districtOuRegion: "District Autonome d'Abidjan",
    zone: "GRAND_ABIDJAN",
    distanceKmDepuisAbidjan: 25,
    tarifCarEstimeAR: 2000,
    peageEstimeAR: 0,
  },
  {
    id: "DABOU",
    nom: "Dabou",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Grands-Ponts",
    zone: "GRAND_ABIDJAN",
    distanceKmDepuisAbidjan: 48,
    tarifCarEstimeAR: 3000,
    peageEstimeAR: 0,
  },
  {
    id: "BONOUA",
    nom: "Bonoua",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Sud-Comoé",
    zone: "GRAND_ABIDJAN",
    distanceKmDepuisAbidjan: 55,
    tarifCarEstimeAR: 3000,
    peageEstimeAR: 2000,
  },

  // Intérieur Zone 1 : Centre & Sud-Est (50 à 250 km)
  {
    id: "YAMOUSSOUKRO",
    nom: "Yamoussoukro (Capitale Politique)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "District Autonome de Yamoussoukro",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 240,
    tarifCarEstimeAR: 8000,
    peageEstimeAR: 5000,
  },
  {
    id: "AGBOVILLE",
    nom: "Agboville",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Agnéby-Tiassa",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 80,
    desserteFerroviaire: true,
    tarifCarEstimeAR: 4000,
    peageEstimeAR: 0,
  },
  {
    id: "TIASSALE",
    nom: "Tiassalé / N'Douci",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Agnéby-Tiassa",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 120,
    tarifCarEstimeAR: 5000,
    peageEstimeAR: 2500,
  },
  {
    id: "ADZOPE",
    nom: "Adzopé",
    pays: "Côte d'Ivoire",
    districtOuRegion: "La Mé",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 105,
    tarifCarEstimeAR: 5000,
    peageEstimeAR: 0,
  },
  {
    id: "AKOUPE",
    nom: "Akoupé",
    pays: "Côte d'Ivoire",
    districtOuRegion: "La Mé",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 140,
    tarifCarEstimeAR: 6000,
    peageEstimeAR: 0,
  },
  {
    id: "DIVO",
    nom: "Divo",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Lôh-Djiboua",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 185,
    tarifCarEstimeAR: 7000,
    peageEstimeAR: 2500,
  },
  {
    id: "TOUMODI",
    nom: "Toumodi",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Bélier",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 195,
    tarifCarEstimeAR: 7000,
    peageEstimeAR: 5000,
  },
  {
    id: "ABENGOUROU",
    nom: "Abengourou",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Indénié-Djuablin",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 210,
    tarifCarEstimeAR: 8000,
    peageEstimeAR: 0,
  },
  {
    id: "ASSINIE",
    nom: "Assinie / Mafia",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Sud-Comoé",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 95,
    tarifCarEstimeAR: 6000,
    peageEstimeAR: 2000,
  },
  {
    id: "ABOISSO",
    nom: "Aboisso",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Sud-Comoé",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 115,
    tarifCarEstimeAR: 5000,
    peageEstimeAR: 2000,
  },
  {
    id: "JACQUEVILLE",
    nom: "Jacqueville",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Grands-Ponts",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 65,
    tarifCarEstimeAR: 4000,
    peageEstimeAR: 0,
  },
  {
    id: "SIKENSI",
    nom: "Sikensi",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Agnéby-Tiassa",
    zone: "INTERIEUR_1",
    distanceKmDepuisAbidjan: 75,
    tarifCarEstimeAR: 4000,
    peageEstimeAR: 2500,
  },

  // Intérieur Zone 2 : Centre-Nord & Ouest (250 à 400 km)
  {
    id: "BOUAKE",
    nom: "Bouaké (2e Pôle Économique)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Gbêkê",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 350,
    desserteAerienne: true,
    desserteFerroviaire: true,
    tarifCarEstimeAR: 12000,
    peageEstimeAR: 7500,
  },
  {
    id: "SAN_PEDRO",
    nom: "San-Pédro (Grand Port Côtier)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "San-Pédro",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 340,
    desserteAerienne: true,
    tarifCarEstimeAR: 16000,
    peageEstimeAR: 5000,
  },
  {
    id: "DALOA",
    nom: "Daloa (Cité des Antilopes)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Haut-Sassandra",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 380,
    tarifCarEstimeAR: 14000,
    peageEstimeAR: 5000,
  },
  {
    id: "GAGNOA",
    nom: "Gagnoa",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Gôh",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 275,
    tarifCarEstimeAR: 10000,
    peageEstimeAR: 2500,
  },
  {
    id: "SOUBRE",
    nom: "Soubré (Barrage Hydroélectrique)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Nawa",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 360,
    tarifCarEstimeAR: 14000,
    peageEstimeAR: 2500,
  },
  {
    id: "MEAGUI",
    nom: "Méagui",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Nawa",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 390,
    tarifCarEstimeAR: 15000,
    peageEstimeAR: 2500,
  },
  {
    id: "SASSANDRA",
    nom: "Sassandra",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Gbôklé",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 280,
    tarifCarEstimeAR: 12000,
    peageEstimeAR: 2500,
  },
  {
    id: "DAOUKRO",
    nom: "Daoukro",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Iffou",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 235,
    tarifCarEstimeAR: 9000,
    peageEstimeAR: 0,
  },
  {
    id: "DIMBOKRO",
    nom: "Dimbokro",
    pays: "Côte d'Ivoire",
    districtOuRegion: "N'Zi",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 240,
    desserteFerroviaire: true,
    tarifCarEstimeAR: 9000,
    peageEstimeAR: 0,
  },
  {
    id: "BOUAFLE",
    nom: "Bouaflé",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Marahoué",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 310,
    tarifCarEstimeAR: 11000,
    peageEstimeAR: 5000,
  },
  {
    id: "SINFRA",
    nom: "Sinfra",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Marahoué",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 315,
    tarifCarEstimeAR: 11000,
    peageEstimeAR: 5000,
  },
  {
    id: "KATIOLA",
    nom: "Katiola",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Hambol",
    zone: "INTERIEUR_2",
    distanceKmDepuisAbidjan: 405,
    desserteFerroviaire: true,
    tarifCarEstimeAR: 14000,
    peageEstimeAR: 7500,
  },

  // Intérieur Zone 3 : Grand Nord & Ouest (> 400 km)
  {
    id: "KORHOGO",
    nom: "Korhogo (Pôle du Nord)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Poro",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 630,
    desserteAerienne: true,
    tarifCarEstimeAR: 18000,
    peageEstimeAR: 7500,
  },
  {
    id: "MAN",
    nom: "Man (Cité des 18 Montagnes)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Tonkpi",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 580,
    desserteAerienne: true,
    tarifCarEstimeAR: 18000,
    peageEstimeAR: 5000,
  },
  {
    id: "FERKESSEDOUGOU",
    nom: "Ferkessédougou",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Tchologo",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 600,
    desserteFerroviaire: true,
    tarifCarEstimeAR: 18000,
    peageEstimeAR: 7500,
  },
  {
    id: "BOUNDIALI",
    nom: "Boundiali",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Bagoué",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 670,
    tarifCarEstimeAR: 20000,
    peageEstimeAR: 7500,
  },
  {
    id: "ODIENNE",
    nom: "Odienné (Nord-Ouest)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Kabadougou",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 850,
    desserteAerienne: true,
    tarifCarEstimeAR: 24000,
    peageEstimeAR: 7500,
  },
  {
    id: "BONDOUKOU",
    nom: "Bondoukou (Région du Zanzan)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Gontougo",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 420,
    tarifCarEstimeAR: 15000,
    peageEstimeAR: 0,
  },
  {
    id: "BOUNA",
    nom: "Bouna (Parc de la Comoé)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Bounkani",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 560,
    tarifCarEstimeAR: 20000,
    peageEstimeAR: 0,
  },
  {
    id: "SEGUELA",
    nom: "Séguéla",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Worodougou",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 505,
    tarifCarEstimeAR: 18000,
    peageEstimeAR: 5000,
  },
  {
    id: "GUIGLO",
    nom: "Guiglo",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Cavally",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 510,
    tarifCarEstimeAR: 18000,
    peageEstimeAR: 5000,
  },
  {
    id: "DUEKOUE",
    nom: "Duékoué",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Guémon",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 470,
    tarifCarEstimeAR: 16000,
    peageEstimeAR: 5000,
  },
  {
    id: "DANANE",
    nom: "Danané",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Tonkpi",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 635,
    tarifCarEstimeAR: 20000,
    peageEstimeAR: 5000,
  },
  {
    id: "TOUBA",
    nom: "Touba",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Bafing",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 650,
    tarifCarEstimeAR: 20000,
    peageEstimeAR: 5000,
  },
  {
    id: "TABOU",
    nom: "Tabou",
    pays: "Côte d'Ivoire",
    districtOuRegion: "San-Pédro",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 440,
    tarifCarEstimeAR: 20000,
    peageEstimeAR: 5000,
  },
  {
    id: "TENGRELA",
    nom: "Tengréla (Frontière Mali)",
    pays: "Côte d'Ivoire",
    districtOuRegion: "Bagoué",
    zone: "INTERIEUR_3",
    distanceKmDepuisAbidjan: 780,
    tarifCarEstimeAR: 24000,
    peageEstimeAR: 7500,
  },

  // Sous-Région CEDEAO / UEMOA
  {
    id: "DAKAR",
    nom: "Dakar",
    pays: "Sénégal",
    districtOuRegion: "Afrique de l'Ouest",
    zone: "SOUS_REGION",
    distanceKmDepuisAbidjan: 1800,
    desserteAerienne: true,
    tarifCarEstimeAR: 0,
    peageEstimeAR: 0,
  },
  {
    id: "BAMAKO",
    nom: "Bamako",
    pays: "Mali",
    districtOuRegion: "Afrique de l'Ouest",
    zone: "SOUS_REGION",
    distanceKmDepuisAbidjan: 1100,
    desserteAerienne: true,
    tarifCarEstimeAR: 45000,
    peageEstimeAR: 0,
  },
  {
    id: "OUAGADOUGOU",
    nom: "Ouagadougou",
    pays: "Burkina Faso",
    districtOuRegion: "Afrique de l'Ouest",
    zone: "SOUS_REGION",
    distanceKmDepuisAbidjan: 1150,
    desserteAerienne: true,
    desserteFerroviaire: true,
    tarifCarEstimeAR: 45000,
    peageEstimeAR: 0,
  },
  {
    id: "LOME",
    nom: "Lomé",
    pays: "Togo",
    districtOuRegion: "Afrique de l'Ouest",
    zone: "SOUS_REGION",
    distanceKmDepuisAbidjan: 600,
    desserteAerienne: true,
    tarifCarEstimeAR: 30000,
    peageEstimeAR: 0,
  },
  {
    id: "COTONOU",
    nom: "Cotonou",
    pays: "Bénin",
    districtOuRegion: "Afrique de l'Ouest",
    zone: "SOUS_REGION",
    distanceKmDepuisAbidjan: 720,
    desserteAerienne: true,
    tarifCarEstimeAR: 35000,
    peageEstimeAR: 0,
  },
  {
    id: "ACCRA",
    nom: "Accra",
    pays: "Ghana",
    districtOuRegion: "Afrique de l'Ouest",
    zone: "SOUS_REGION",
    distanceKmDepuisAbidjan: 480,
    desserteAerienne: true,
    tarifCarEstimeAR: 25000,
    peageEstimeAR: 0,
  },

  // International Hors Afrique
  {
    id: "PARIS",
    nom: "Paris",
    pays: "France",
    districtOuRegion: "Europe",
    zone: "INTERNATIONAL",
    distanceKmDepuisAbidjan: 4900,
    desserteAerienne: true,
    tarifCarEstimeAR: 0,
    peageEstimeAR: 0,
  },
  {
    id: "AUTRE_INTERNATIONAL",
    nom: "Autre Destination Internationale",
    pays: "International",
    districtOuRegion: "Monde",
    zone: "INTERNATIONAL",
    distanceKmDepuisAbidjan: 5000,
    desserteAerienne: true,
    tarifCarEstimeAR: 0,
    peageEstimeAR: 0,
  },
];

export const MOYENS_TRANSPORT_CATALOGUE: MoyenTransportItem[] = [
  {
    code: "VEHICULE_SERVICE",
    libelle: "Véhicule de service / Flotte Agilly",
    description: "Carburant pris en charge (100 FCFA/km) + Frais de péage autoroute réels",
    typeCalcul: "CARBURANT_PEAGE",
    applicablePartout: false,
    zonesIncompatibles: ["INTERNATIONAL"],
  },
  {
    code: "VEHICULE_PERSO",
    libelle: "Véhicule personnel (Indemnités kilométriques)",
    description: "Barème officiel d'indemnité kilométrique Agilly de 175 FCFA par km aller-retour",
    typeCalcul: "KILOMETRIQUE",
    tarifUnitaireOuTaux: 175,
    applicablePartout: false,
    zonesIncompatibles: ["INTERNATIONAL"],
  },
  {
    code: "CAR_INTERURBAIN",
    libelle: "Car de ligne interurbain (UTB, STIF, CTE...)",
    description: "Billet aller-retour standard selon la tarification des compagnies agréées",
    typeCalcul: "FORFAIT_VILLE",
    applicablePartout: false,
    zonesIncompatibles: ["GRAND_ABIDJAN", "INTERNATIONAL"],
  },
  {
    code: "AVION_REGULIER",
    libelle: "Vol régulier (Air Côte d'Ivoire / Ligne régulière)",
    description: "Billet classe économique pour les liaisons aériennes régulières",
    typeCalcul: "BILLET_AVION",
    applicablePartout: true,
  },
  {
    code: "TAXI_URBAIN",
    libelle: "Transport urbain / Taxi / VTC (Grand Abidjan)",
    description: "Déplacements journaliers dans le Grand Abidjan (forfait 15 000 FCFA/jour)",
    typeCalcul: "FORFAIT_JOUR",
    tarifUnitaireOuTaux: 15000,
    applicablePartout: false,
    zonesIncompatibles: ["INTERIEUR_1", "INTERIEUR_2", "INTERIEUR_3", "SOUS_REGION", "INTERNATIONAL"],
  },
  {
    code: "TRAIN_EXPRESS",
    libelle: "Train express SITARAIL",
    description: "Billet train 1ère classe pour les villes situées sur l'axe ferroviaire",
    typeCalcul: "FORFAIT_VILLE",
    applicablePartout: false,
    zonesIncompatibles: ["GRAND_ABIDJAN", "INTERNATIONAL"],
  },
];

export const BAREMES_ZONE_CATALOGUE: BaremeZoneItem[] = [
  {
    zone: "GRAND_ABIDJAN",
    libelle: "Zone 1 : Grand Abidjan & Périphérie (< 50 km)",
    perDiemJournalier: 15000,
    description: "Repas du midi et sujétion journalière locale (sans hébergement)",
  },
  {
    zone: "INTERIEUR_1",
    libelle: "Zone 2 : Intérieur Proche & Centre (50 à 250 km)",
    perDiemJournalier: 35000,
    description: "Hébergement hôtelier standard, 2 repas et indemnité de mission",
  },
  {
    zone: "INTERIEUR_2",
    libelle: "Zone 3 : Intérieur Pôles Économiques & Ouest (250 à 450 km)",
    perDiemJournalier: 40000,
    description: "Hébergement hôtelier, repas et sujétion province",
  },
  {
    zone: "INTERIEUR_3",
    libelle: "Zone 4 : Grand Nord & Extrême Ouest (> 450 km)",
    perDiemJournalier: 45000,
    description: "Hébergement hôtelier, repas et indemnité de longue distance",
  },
  {
    zone: "SOUS_REGION",
    libelle: "Zone 5 : Sous-Région CEDEAO / UEMOA",
    perDiemJournalier: 75000,
    description: "Per diem journalier Afrique de l'Ouest & hébergement international",
  },
  {
    zone: "INTERNATIONAL",
    libelle: "Zone 6 : International Hors Afrique",
    perDiemJournalier: 120000,
    description: "Per diem international complet (hôtel, repas, transports locaux)",
  },
];

// ── FONCTION CLIENT DE CALCUL AUTOMATIQUE DES FRAIS ──
export function calculerFraisMissionClient(
  villeId: string,
  transportCode: string,
  nombreJours: number
): CalculFraisMissionResult {
  const ville =
    VILLES_CI_CATALOGUE.find((v) => v.id.toUpperCase() === (villeId || "").toUpperCase()) ||
    VILLES_CI_CATALOGUE[0];

  const transport =
    MOYENS_TRANSPORT_CATALOGUE.find((t) => t.code.toUpperCase() === (transportCode || "").toUpperCase()) ||
    MOYENS_TRANSPORT_CATALOGUE[0];

  const baremeZone =
    BAREMES_ZONE_CATALOGUE.find((b) => b.zone === ville.zone) || BAREMES_ZONE_CATALOGUE[0];

  const jours = Math.max(1, nombreJours || 1);
  const perDiemJour = baremeZone.perDiemJournalier;
  const totalPerDiem = perDiemJour * jours;

  const distanceKmAR = (ville.distanceKmDepuisAbidjan || 20) * 2;

  let fraisTransport = 0;
  let detailsTransport = "";

  switch (transport.typeCalcul) {
    case "KILOMETRIQUE": {
      const taux = transport.tarifUnitaireOuTaux || 175;
      fraisTransport = distanceKmAR * taux;
      detailsTransport = `${distanceKmAR} km A/R × ${taux} FCFA/km (Indemnité kilométrique)`;
      break;
    }
    case "CARBURANT_PEAGE": {
      const coutCarburant = distanceKmAR * 100;
      const peages = ville.peageEstimeAR || 0;
      fraisTransport = coutCarburant + peages;
      detailsTransport = `${distanceKmAR} km A/R carburant (${coutCarburant.toLocaleString("fr-FR")} FCFA) + Péage (${peages.toLocaleString("fr-FR")} FCFA)`;
      break;
    }
    case "FORFAIT_VILLE": {
      if (transport.code === "TRAIN_EXPRESS") {
        fraisTransport = 16000;
        detailsTransport = `Billet SITARAIL A/R vers ${ville.nom}`;
      } else {
        fraisTransport = ville.tarifCarEstimeAR || 12000;
        detailsTransport = `Billet car de ligne interurbain A/R vers ${ville.nom}`;
      }
      break;
    }
    case "BILLET_AVION": {
      if (ville.zone === "SOUS_REGION") {
        fraisTransport = 350000;
        detailsTransport = `Billet avion A/R sous-régional vers ${ville.nom}`;
      } else if (ville.zone === "INTERNATIONAL") {
        fraisTransport = 650000;
        detailsTransport = `Billet avion A/R international vers ${ville.nom}`;
      } else {
        fraisTransport = 95000;
        detailsTransport = `Billet d'avion vol régulier Air Côte d'Ivoire A/R vers ${ville.nom}`;
      }
      break;
    }
    case "FORFAIT_JOUR": {
      const tauxJour = transport.tarifUnitaireOuTaux || 15000;
      fraisTransport = tauxJour * jours;
      detailsTransport = `${jours} jour(s) × ${tauxJour.toLocaleString("fr-FR")} FCFA (Taxi / Déplacements urbains)`;
      break;
    }
    default:
      fraisTransport = 20000;
      detailsTransport = "Frais de transport forfaitaires";
  }

  const totalFraisPrevisionnels = totalPerDiem + fraisTransport;
  const avanceSuggeree80 = Math.round((totalFraisPrevisionnels * 0.8) / 1000) * 1000;
  const avanceSuggeree100 = totalFraisPrevisionnels;

  const detailsCalcul = `${jours} jour(s) × ${perDiemJour.toLocaleString("fr-FR")} FCFA/j = ${totalPerDiem.toLocaleString("fr-FR")} FCFA + Transport [${transport.libelle}] = ${fraisTransport.toLocaleString("fr-FR")} FCFA (${detailsTransport})`;

  return {
    ville,
    transport,
    nombreJours: jours,
    perDiemJournalier: perDiemJour,
    totalPerDiem,
    distanceKmAR,
    fraisTransportEstimes: fraisTransport,
    totalFraisPrevisionnels,
    avanceSuggeree80,
    avanceSuggeree100,
    detailsCalcul,
  };
}

// ── APPELS API VERS LE BACKEND NESTJS ──
export const missionsApi = {
  async getReferentiel(): Promise<{
    villes: VilleMissionItem[];
    moyensTransport: MoyenTransportItem[];
    baremesZone: BaremeZoneItem[];
  }> {
    try {
      const res = await client.get<{
        villes: VilleMissionItem[];
        moyensTransport: MoyenTransportItem[];
        baremesZone: BaremeZoneItem[];
      }>("/demandes-rh/missions/referentiel");
      if (res && Array.isArray(res.villes)) return res;
    } catch (e) {
      console.warn("[missionsApi] Erreur chargement référentiel backend, repli local:", e);
    }
    return {
      villes: VILLES_CI_CATALOGUE,
      moyensTransport: MOYENS_TRANSPORT_CATALOGUE,
      baremesZone: BAREMES_ZONE_CATALOGUE,
    };
  },

  async calculerFrais(
    villeId: string,
    transportCode: string,
    nombreJours: number
  ): Promise<CalculFraisMissionResult> {
    try {
      const res = await client.post<CalculFraisMissionResult>("/demandes-rh/missions/calcul-frais", {
        villeId,
        transportCode,
        nombreJours,
      });
      if (res && res.totalFraisPrevisionnels !== undefined) return res;
    } catch (e) {
      // Repli immédiat sans latence
    }
    return calculerFraisMissionClient(villeId, transportCode, nombreJours);
  },
};
