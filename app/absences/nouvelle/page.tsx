// ============================================================
// app/absences/nouvelle/page.tsx
// Formulaire officiel Agilly avec séparation stricte en 4 parcours :
//  1. Congés (Congé annuel, maladie, maternité, paternité, sans solde, formation)
//  2. Permissions (Mariage, naissance, décès, familiale, médical, sortie en heures)
//  3. Ordre de Mission (Déplacement individuel, trajet CI, slider distance 0-1000 km, barème 6 paliers)
//  4. Fiche d'Intervention Technique (Équipe multi-employés "+ Employé", DOMINO / WINDOWS / INFRA, Tarif contractuel)
// ============================================================

"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { TypeDemandeRH, FamilleDemandeRH } from "@/types/absences.types";

type ModeCreationRH = "CONGES" | "PERMISSIONS" | "ORDRE_MISSION" | "INTERVENTION_TECHNIQUE";

// ── BARÈME OFFICIEL SELON LA DISTANCE (ORDRE DE MISSION - IMAGE 3) ──
const PALIER_TIERS_CI = [
  { label: "0 - 50 km", min: 0, max: 50, price: 2000, labelPrice: "2 000 FCFA" },
  { label: "51 - 100 km", min: 51, max: 100, price: 9000, labelPrice: "9 000 FCFA" },
  { label: "101 - 250 km", min: 101, max: 250, price: 18000, labelPrice: "18 000 FCFA" },
  { label: "251 - 400 km", min: 251, max: 400, price: 35000, labelPrice: "35 000 FCFA" },
  { label: "401 - 600 km", min: 401, max: 600, price: 50000, labelPrice: "50 000 FCFA" },
  {
    label: "Plus de 600 km",
    min: 601,
    max: 10000,
    price: (km: number) => 50000 + Math.max(0, km - 600) * 50,
    labelPrice: "50 000 + 50 / km au-delà",
  },
];

const DESTINATIONS_CI_CATALOGUE = [
  { nom: "Bouaké", distance: 387 },
  { nom: "Yamoussoukro", distance: 240 },
  { nom: "San-Pédro", distance: 350 },
  { nom: "Korhogo", distance: 570 },
  { nom: "Man", distance: 580 },
  { nom: "Daloa", distance: 385 },
  { nom: "Gagnoa", distance: 290 },
  { nom: "Grand-Bassam", distance: 35 },
  { nom: "Dabou", distance: 48 },
  { nom: "Aboisso", distance: 115 },
  { nom: "Abengourou", distance: 210 },
  { nom: "Bondoukou", distance: 420 },
  { nom: "Soubré", distance: 370 },
  { nom: "Odienné", distance: 670 },
  { nom: "Ferkessédougou", distance: 595 },
  { nom: "Bouna", distance: 600 },
  { nom: "Séguéla", distance: 500 },
  { nom: "Divo", distance: 185 },
  { nom: "Daoukro", distance: 235 },
  { nom: "Oumé", distance: 250 },
  { nom: "Agboville", distance: 80 },
  { nom: "Adzopé", distance: 105 },
  { nom: "Sassandra", distance: 280 },
];

// Catalogue d'employés Agilly pour l'ajout rapide dans une Fiche d'Intervention Technique
const COLLABORATEURS_AGILLY_CATALOGUE = [
  "M. KOFFI Marc — Ingénieur Systèmes & Cloud",
  "Mme TRAORÉ Awa — Ingénieure Réseaux & Sécurité",
  "M. DIALLO Ibrahim — Administrateur Domino / Notes",
  "M. N'GUESSAN Serge — Technicien Infrastructure Windows",
  "Mme KOUAMÉ Clarisse — Consultante Cybersécurité",
  "M. YAO Franck — Technicien Support & Déploiement",
  "M. KONÉ Seydou — Architecte Réseaux & Télécoms",
];

interface MotifConfig {
  id: TypeDemandeRH;
  famille: FamilleDemandeRH;
  titre: string;
  sousTitre: string;
  badgeLegal: string;
  decompteLabel: string;
  impactSolde: boolean;
  justificatifRequis: boolean;
  justificatifLabel?: string;
  isSortieHeures?: boolean;
}

const MOTIFS_CATALOGUE: MotifConfig[] = [
  // ── 1. CONGÉS FORMELS ──
  {
    id: "CONGES_ANNUELS",
    famille: "CONGES",
    titre: "Congé annuel payé",
    sousTitre: "Période de repos annuel décomptée du solde légal de congés acquis",
    badgeLegal: "Solde annuel",
    decompteLabel: "Décompté en jours ouvrés sur vos droits acquis",
    impactSolde: true,
    justificatifRequis: false,
  },
  {
    id: "CONGES_MALADIE",
    famille: "CONGES",
    titre: "Congé maladie (Arrêt de travail)",
    sousTitre: "Absence pour raison de santé prescrite par un médecin agréé",
    badgeLegal: "Arrêt médical",
    decompteLabel: "Jours calendaires (maintien de salaire selon convention)",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Certificat médical d'arrêt de travail obligatoire (sous 48h)",
  },
  {
    id: "CONGES_MATERNITE",
    famille: "CONGES",
    titre: "Congé de maternité",
    sousTitre: "Période légale de repos pré et post-natal (14 semaines)",
    badgeLegal: "Statut légal",
    decompteLabel: "Semaines légales conventionnelles",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Certificat de grossesse ou déclaration de naissance",
  },
  {
    id: "CONGES_PATERNITE",
    famille: "CONGES",
    titre: "Congé de paternité",
    sousTitre: "Congé accordé au père à l'occasion de la naissance de son enfant",
    badgeLegal: "Légal",
    decompteLabel: "Jours ouvrables accordés au père",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Certificat médical d'accouchement ou acte de naissance",
  },
  {
    id: "CONGES_SANS_SOLDE",
    famille: "CONGES",
    titre: "Congé sans solde",
    sousTitre: "Absence autorisée sans maintien de rémunération accordée par la Direction",
    badgeLegal: "Accord Direction",
    decompteLabel: "Suspension temporaire de rémunération",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Lettre de demande motivée adressée à la Direction",
  },
  {
    id: "CONGES_FORMATION",
    famille: "CONGES",
    titre: "Congé de formation professionnelle",
    sousTitre: "Période dédiée au suivi d'un cursus certifiant ou d'un stage validé",
    badgeLegal: "Formation",
    decompteLabel: "Jours de formation conventionnés",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Attestation d'inscription ou convention de stage",
  },

  // ── 2. PERMISSIONS D'ABSENCE (AUCUN IMPACT SUR LE SOLDE ANNUEL) ──
  {
    id: "PERMISSION_MARIAGE",
    famille: "PERMISSIONS",
    titre: "Permission pour mariage",
    sousTitre: "Mariage du salarié (3 jours légaux) ou mariage d'un enfant (1 jour)",
    badgeLegal: "Droit légal 1 à 3j",
    decompteLabel: "Jours ouvrables légaux avec maintien de salaire",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Certificat de mariage ou bans officiels",
  },
  {
    id: "PERMISSION_NAISSANCE",
    famille: "PERMISSIONS",
    titre: "Permission pour naissance / baptême",
    sousTitre: "Accueil et démarches administratives du nouveau-né (2 jours légaux)",
    badgeLegal: "Droit légal 2j",
    decompteLabel: "Jours ouvrables légaux avec maintien de salaire",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Certificat d'accouchement ou extrait d'acte",
  },
  {
    id: "PERMISSION_DECES",
    famille: "PERMISSIONS",
    titre: "Permission pour décès / obsèques",
    sousTitre: "Décès du conjoint ou enfant (5j) / père, mère, frère, sœur (2j)",
    badgeLegal: "Droit légal 2 à 5j",
    decompteLabel: "Jours ouvrables légaux avec maintien de salaire",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Acte ou certificat de décès",
  },
  {
    id: "PERMISSION_FAMILIALE",
    famille: "PERMISSIONS",
    titre: "Permission pour raisons ou urgence familiale",
    sousTitre: "Situation familiale imprévue nécessitant une présence immédiate",
    badgeLegal: "Circuit court",
    decompteLabel: "Autorisation ponctuelle validée par le responsable N+1",
    impactSolde: false,
    justificatifRequis: false,
  },
  {
    id: "PERMISSION_MEDICALE",
    famille: "PERMISSIONS",
    titre: "Permission pour rendez-vous médical",
    sousTitre: "Consultation ponctuelle ou examens médicaux spécialisés",
    badgeLegal: "Santé",
    decompteLabel: "Heures ou demi-journée d'absence autorisée",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Billet de consultation ou convocation médicale",
  },
  {
    id: "PERMISSION_ADMINISTRATIVE",
    famille: "PERMISSIONS",
    titre: "Permission pour obligations administratives",
    sousTitre: "Démarches officielles auprès d'un service public, banque ou tribunal",
    badgeLegal: "Officiel",
    decompteLabel: "Heures ou demi-journée d'absence autorisée",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Convocation officielle ou reçu de rendez-vous",
  },
  {
    id: "PERMISSION_SCOLAIRE",
    famille: "PERMISSIONS",
    titre: "Permission pour obligations scolaires",
    sousTitre: "Réunion scolaire, rentrée ou convocation d'un établissement d'enseignement",
    badgeLegal: "Famille",
    decompteLabel: "Demi-journée d'absence autorisée",
    impactSolde: false,
    justificatifRequis: false,
  },
  {
    id: "PERMISSION_EXAMEN",
    famille: "PERMISSIONS",
    titre: "Permission pour examen ou concours",
    sousTitre: "Participation à une épreuve officielle, concours ou soutenance",
    badgeLegal: "Concours",
    decompteLabel: "Jours de passage d'épreuve",
    impactSolde: false,
    justificatifRequis: true,
    justificatifLabel: "Convocation nominative officielle à l'épreuve",
  },
  {
    id: "PERMISSION_SORTIE",
    famille: "PERMISSIONS",
    titre: "Permission de sortie pendant les heures de travail",
    sousTitre: "Quitter temporairement le lieu de travail au cours de la journée",
    badgeLegal: "En heures",
    decompteLabel: "Plage horaire précise (départ et retour prévus)",
    impactSolde: false,
    justificatifRequis: false,
    isSortieHeures: true,
  },
];

function NouvelleDemandeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPersona, soldeConges, addDemande } = useAbsences();

  // Mode actif parmi les 4 parcours strictement séparés
  const [modeActif, setModeActif] = useState<ModeCreationRH>("CONGES");

  // Motif précis sélectionné (pour Congés ou Permissions)
  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGES_ANNUELS");

  // Synchronisation avec query param (?type=... ou ?famille=...)
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const familleParam = searchParams.get("famille");

    if (typeParam === "MISSION_DEPLACEMENT") {
      setModeActif("ORDRE_MISSION");
      return;
    }
    if (typeParam === "INTERVENTION_TERRAIN") {
      setModeActif("INTERVENTION_TECHNIQUE");
      return;
    }
    if (typeParam) {
      const found = MOTIFS_CATALOGUE.find((m) => m.id === typeParam);
      if (found) {
        setModeActif(found.famille === "PERMISSIONS" ? "PERMISSIONS" : "CONGES");
        setTypeDemande(found.id);
        return;
      }
    }
    if (familleParam === "PERMISSIONS") {
      setModeActif("PERMISSIONS");
    } else if (familleParam === "CONGES") {
      setModeActif("CONGES");
    }
  }, [searchParams]);

  // Motifs filtrés selon le mode (Congés ou Permissions)
  const motifsFamille = useMemo(() => {
    const fam = modeActif === "PERMISSIONS" ? "PERMISSIONS" : "CONGES";
    return MOTIFS_CATALOGUE.filter((m) => m.famille === fam);
  }, [modeActif]);

  useEffect(() => {
    if (modeActif === "CONGES" || modeActif === "PERMISSIONS") {
      if (!motifsFamille.some((m) => m.id === typeDemande)) {
        if (motifsFamille[0]) {
          setTypeDemande(motifsFamille[0].id);
        }
      }
    }
  }, [modeActif, motifsFamille, typeDemande]);

  const motifActif = useMemo(() => {
    return MOTIFS_CATALOGUE.find((m) => m.id === typeDemande) || MOTIFS_CATALOGUE[0];
  }, [typeDemande]);

  // Dates par défaut : demain ouvré à +3 jours
  const defaultDates = useMemo(() => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 1);
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 3);
    return {
      debut: d1.toISOString().split("T")[0],
      fin: d2.toISOString().split("T")[0],
    };
  }, []);

  // ── ÉTATS POUR 1. CONGÉS & 2. PERMISSIONS ──
  const [dateDebut, setDateDebut] = useState<string>(defaultDates.debut);
  const [dateFin, setDateFin] = useState<string>(defaultDates.fin);
  const [estDemiJourneeDebut, setEstDemiJourneeDebut] = useState(false);
  const [estDemiJourneeFin, setEstDemiJourneeFin] = useState(false);
  const [heureDebut, setHeureDebut] = useState("10:00");
  const [heureFin, setHeureFin] = useState("12:30");
  const [motif, setMotif] = useState("");
  const [adresseContact, setAdresseContact] = useState("");
  const [engagementHonneur, setEngagementHonneur] = useState(false);
  const [fichiersList, setFichiersList] = useState<Array<{ nom: string; taille: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        nom: f.name,
        taille: `${Math.round(f.size / 1024)} Ko`,
      }));
      setFichiersList((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFichiersList((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── ÉTATS SPÉCIFIQUES POUR 3. ORDRE DE MISSION (DÉPLACEMENT INDIVIDUEL - IMAGE 3) ──
  const [missionDemandeurNom, setMissionDemandeurNom] = useState(
    currentPersona ? `M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}` : "M. KOUASSI Emmanuel"
  );
  const [missionDemandeurMatricule, setMissionDemandeurMatricule] = useState(
    currentPersona?.matricule || "M-0452"
  );
  const [missionDemandeurService, setMissionDemandeurService] = useState(
    currentPersona?.departement || "Exploitation"
  );
  const [missionDemandeurFonction, setMissionDemandeurFonction] = useState(
    currentPersona?.poste || "Technicien Réseau"
  );
  const [missionClientSite, setMissionClientSite] = useState("Agence Régionale / Site Client");
  const [missionObjet, setMissionObjet] = useState("Audit et déploiement infrastructure réseau");
  const [missionMoyenTransport, setMissionMoyenTransport] = useState("VÉHICULE DE SERVICE");
  const [missionDateDepart, setMissionDateDepart] = useState(defaultDates.debut);
  const [missionDateRetour, setMissionDateRetour] = useState(defaultDates.fin);
  const [missionVilleDepart, setMissionVilleDepart] = useState("Abidjan");
  const [missionDestination, setMissionDestination] = useState("Bouaké");
  const [missionDistanceKm, setMissionDistanceKm] = useState(387);
  const [missionTrajetType, setMissionTrajetType] = useState<"ALLER_RETOUR" | "ALLER_SIMPLE">("ALLER_RETOUR");
  const [missionAjustementValideur, setMissionAjustementValideur] = useState(0);

  // ── ÉTATS SPÉCIFIQUES POUR 4. FICHE D'INTERVENTION TECHNIQUE (MULTI-EMPLOYÉS - IMAGE 2) ──
  const [intervenantPrincipal, setIntervenantPrincipal] = useState(
    currentPersona
      ? `${currentPersona.prenom} ${currentPersona.nom.toUpperCase()} (${currentPersona.poste || "Ingénieur Principal"})`
      : "KOUASSI Emmanuel (Ingénieur Principal)"
  );
  const [interventionCollaborateurs, setInterventionCollaborateurs] = useState<string[]>([
    "M. KOFFI Marc — Ingénieur Systèmes & Cloud",
    "Mme TRAORÉ Awa — Ingénieure Réseaux & Sécurité",
  ]);
  const [selectedCollabToAdd, setSelectedCollabToAdd] = useState<string>(COLLABORATEURS_AGILLY_CATALOGUE[2]);
  const [customCollabInput, setCustomCollabInput] = useState<string>("");

  const [interventionClientSite, setInterventionClientSite] = useState("Direction Générale Client — Zone 3 Treichville, Abidjan");
  const [interventionObjet, setInterventionObjet] = useState("Migration serveurs Domino v11, Windows Server et sécurisation pare-feu");
  const [interventionDateDebut, setInterventionDateDebut] = useState(defaultDates.debut);
  const [interventionDateFin, setInterventionDateFin] = useState(defaultDates.fin);

  const [prestaDomino, setPrestaDomino] = useState(
    "Migration des serveurs vers la version 11 et installation de VERSE."
  );
  const [prestaWindows, setPrestaWindows] = useState(
    "Migration OS vers 2016 SERVER et passage à Edge."
  );
  const [prestaInfra, setPrestaInfra] = useState(
    "Sécurisation des routeurs et pare-feu principaux."
  );
  const [tarifContractuelJour, setTarifContractuelJour] = useState<number>(720000);

  // Synchronisation avec le persona actif
  useEffect(() => {
    if (currentPersona) {
      setMissionDemandeurNom(`M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}`);
      setMissionDemandeurMatricule(currentPersona.matricule);
      setMissionDemandeurService(currentPersona.departement || "Exploitation");
      setMissionDemandeurFonction(currentPersona.poste || "Technicien Réseau");
      setIntervenantPrincipal(
        `${currentPersona.prenom} ${currentPersona.nom.toUpperCase()} (${currentPersona.poste || "Chef d'équipe"})`
      );
    }
  }, [currentPersona]);

  // Ajout / suppression d'employés dans l'Équipe d'Intervention Technique
  const handleAddCollaborateur = () => {
    const toAdd = customCollabInput.trim() || selectedCollabToAdd;
    if (!toAdd) return;
    if (!interventionCollaborateurs.includes(toAdd)) {
      setInterventionCollaborateurs((prev) => [...prev, toAdd]);
    }
    setCustomCollabInput("");
  };

  const handleRemoveCollaborateur = (idx: number) => {
    setInterventionCollaborateurs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calcul dynamique du palier actif de distance (Ordre de Mission)
  const activePalier = useMemo(() => {
    for (let i = 0; i < PALIER_TIERS_CI.length; i++) {
      const t = PALIER_TIERS_CI[i];
      if (missionDistanceKm >= t.min && missionDistanceKm <= t.max) {
        const unit = typeof t.price === "function" ? t.price(missionDistanceKm) : t.price;
        return { ...t, index: i, unitPrice: unit };
      }
    }
    const last = PALIER_TIERS_CI[PALIER_TIERS_CI.length - 1];
    const unit = typeof last.price === "function" ? last.price(missionDistanceKm) : 50000;
    return { ...last, index: PALIER_TIERS_CI.length - 1, unitPrice: unit };
  }, [missionDistanceKm]);

  const isAllerRetourMission = missionTrajetType === "ALLER_RETOUR";
  const totalDistanceMissionKm = isAllerRetourMission ? missionDistanceKm * 2 : missionDistanceKm;
  const fraisDeplacementEstimes =
    activePalier.unitPrice * (isAllerRetourMission ? 2 : 1) + (Number(missionAjustementValideur) || 0);

  // Calcul jours d'Ordre de Mission
  const { joursOuvresMission, joursCalMission } = useMemo(() => {
    if (!missionDateDepart || !missionDateRetour) return { joursOuvresMission: 3, joursCalMission: 3 };
    const d1 = new Date(missionDateDepart);
    const d2 = new Date(missionDateRetour);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return { joursOuvresMission: 1, joursCalMission: 1 };
    let ouv = 0;
    let cal = 0;
    const c = new Date(d1);
    while (c <= d2) {
      cal++;
      if (c.getDay() !== 0 && c.getDay() !== 6) ouv++;
      c.setDate(c.getDate() + 1);
    }
    return { joursOuvresMission: Math.max(1, ouv), joursCalMission: Math.max(1, cal) };
  }, [missionDateDepart, missionDateRetour]);

  // Calcul jours de Fiche d'Intervention Technique
  const { joursOuvresIntervention, joursCalIntervention } = useMemo(() => {
    if (!interventionDateDebut || !interventionDateFin) return { joursOuvresIntervention: 3, joursCalIntervention: 3 };
    const d1 = new Date(interventionDateDebut);
    const d2 = new Date(interventionDateFin);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return { joursOuvresIntervention: 1, joursCalIntervention: 1 };
    let ouv = 0;
    let cal = 0;
    const c = new Date(d1);
    while (c <= d2) {
      cal++;
      if (c.getDay() !== 0 && c.getDay() !== 6) ouv++;
      c.setDate(c.getDate() + 1);
    }
    return { joursOuvresIntervention: Math.max(1, ouv), joursCalIntervention: Math.max(1, cal) };
  }, [interventionDateDebut, interventionDateFin]);

  const formatFrShort = (d: string) => {
    if (!d) return "-";
    const parts = d.split("T")[0].split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  const periodeMissionLabel = `${formatFrShort(missionDateDepart)} au ${formatFrShort(missionDateRetour)} (${joursCalMission} j)`;
  const periodeInterventionLabel = `${formatFrShort(interventionDateDebut)} au ${formatFrShort(interventionDateFin)} (${joursOuvresIntervention} j ouvrés)`;

  // ── HANDLER 3 : SOUMETTRE UN ORDRE DE MISSION ──
  const handleSoumettreOrdreMission = async () => {
    if (!missionObjet.trim()) {
      alert("Veuillez renseigner l'objet de la mission.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDemande({
        typeDemande: "MISSION_DEPLACEMENT",
        libelleType: "Ordre de Mission Officiel",
        dateDebut: missionDateDepart,
        dateFin: missionDateRetour,
        nombreJoursOuvres: joursOuvresMission,
        nombreJoursCalendaires: joursCalMission,
        motif: missionObjet,
        adresseContactPendantAbsence: missionClientSite || missionDestination,
        destination: `À ${missionDestination.toUpperCase()} (${missionVilleDepart} → ${missionDestination}, ${totalDistanceMissionKm} km ${isAllerRetourMission ? "A/R" : "Aller simple"})`,
        moyenTransport: missionMoyenTransport,
        fraisPrevisionnels: fraisDeplacementEstimes,
      });

      router.push("/absences/demandes?univers=MISSIONS");
    } catch (err: any) {
      console.error("[handleSoumettreOrdreMission] Erreur:", err);
      alert(err?.message || "Erreur lors de la transmission de l'ordre de mission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── HANDLER 4 : SOUMETTRE UNE FICHE D'INTERVENTION TECHNIQUE ──
  const handleSoumettreIntervention = async () => {
    if (!interventionObjet.trim()) {
      alert("Veuillez renseigner l'intitulé général de l'intervention technique.");
      return;
    }
    setIsSubmitting(true);
    try {
      const equipeComplete = [
        `${intervenantPrincipal} (Intervenant Principal)`,
        ...interventionCollaborateurs,
      ];
      const metaPayload = {
        clientSite: interventionClientSite,
        equipe: equipeComplete,
        domino: prestaDomino,
        windows: prestaWindows,
        infra: prestaInfra,
        tarifJour: Number(tarifContractuelJour) || 720000,
      };
      const motifEnrichi = `${interventionObjet} ||INTERVENTION_META:${JSON.stringify(metaPayload)}`;

      await addDemande({
        typeDemande: "INTERVENTION_TERRAIN",
        libelleType: "Fiche d'Intervention Technique",
        dateDebut: interventionDateDebut,
        dateFin: interventionDateFin,
        nombreJoursOuvres: joursOuvresIntervention,
        nombreJoursCalendaires: joursCalIntervention,
        motif: motifEnrichi,
        adresseContactPendantAbsence: interventionClientSite,
        destination: interventionClientSite,
        moyenTransport: `Équipe de ${equipeComplete.length} intervenant(s)`,
        fraisPrevisionnels: (Number(tarifContractuelJour) || 720000) * joursOuvresIntervention,
      });

      router.push("/absences/demandes?univers=INTERVENTIONS");
    } catch (err: any) {
      console.error("[handleSoumettreIntervention] Erreur:", err);
      alert(err?.message || "Erreur lors de la transmission de la fiche d'intervention.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcul dynamique durée en heures (pour permission de sortie)
  const dureeHeuresMinutes = useMemo(() => {
    if (!motifActif.isSortieHeures) return null;
    const [h1, m1] = heureDebut.split(":").map(Number);
    const [h2, m2] = heureFin.split(":").map(Number);
    const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
    if (isNaN(totalMinutes) || totalMinutes <= 0) return { heures: 0, minutes: 0, text: "0h 00" };
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return {
      heures: h,
      minutes: m,
      decimal: Math.round((totalMinutes / 60) * 10) / 10,
      text: m > 0 ? `${h}h ${m}min` : `${h}h`,
    };
  }, [heureDebut, heureFin, motifActif.isSortieHeures]);

  // Calcul dynamique jours calendaires et jours ouvrés (Congés / Permissions)
  const { joursOuvres, joursCalendaires } = useMemo(() => {
    if (motifActif.isSortieHeures) {
      return { joursOuvres: 0.5, joursCalendaires: 1 };
    }
    if (!dateDebut || !dateFin) return { joursOuvres: 0, joursCalendaires: 0 };
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return { joursOuvres: 0, joursCalendaires: 0 };
    }

    let countOuvres = 0;
    let countCal = 0;
    const cur = new Date(start);
    while (cur <= end) {
      countCal++;
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        countOuvres++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (estDemiJourneeDebut) countOuvres = Math.max(0.5, countOuvres - 0.5);
    if (estDemiJourneeFin) countOuvres = Math.max(0.5, countOuvres - 0.5);

    return { joursOuvres: countOuvres, joursCalendaires: countCal };
  }, [dateDebut, dateFin, estDemiJourneeDebut, estDemiJourneeFin, motifActif.isSortieHeures]);

  const soldeRestantApres = useMemo(() => {
    if (!motifActif.impactSolde) return soldeConges.joursRestants;
    return Math.round((soldeConges.joursRestants - joursOuvres) * 10) / 10;
  }, [motifActif.impactSolde, soldeConges.joursRestants, joursOuvres]);

  const soldeSuffisant = soldeRestantApres >= 0;
  const circuitCourt = motifActif.famille === "PERMISSIONS" && joursOuvres <= 2;

  // Soumission Congés / Permissions
  const handleSubmitCongePermission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motif.trim()) {
      alert("Veuillez indiquer le motif explicite de votre demande.");
      return;
    }

    if (motifActif.impactSolde && !soldeSuffisant) {
      alert("Votre solde de congés payés acquis est insuffisant pour couvrir cette durée.");
      return;
    }

    if (!engagementHonneur) {
      alert("Veuillez certifier sur l'honneur l'exactitude des informations saisies.");
      return;
    }

    setIsSubmitting(true);
    try {
      let motifFinal = motif;
      if (motifActif.isSortieHeures) {
        motifFinal = `[SORTIE de ${heureDebut} à ${heureFin} (${dureeHeuresMinutes?.text})] ${motif}`;
      }

      await addDemande({
        typeDemande,
        libelleType: motifActif.titre,
        dateDebut: dateDebut,
        dateFin: motifActif.isSortieHeures ? dateDebut : dateFin,
        nombreJoursOuvres: joursOuvres,
        nombreJoursCalendaires: joursCalendaires,
        motif: motifFinal,
        adresseContactPendantAbsence: adresseContact,
      });

      router.push("/absences/demandes?univers=CONGES");
    } catch (err: any) {
      console.error("[NouvelleDemandePage] Erreur:", err);
      alert(err?.message || "Erreur lors de la transmission de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── EN-TÊTE DYNAMIQUE SELON LE PARCOURS SÉLECTIONNÉ ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A] shadow-xs" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {modeActif === "CONGES" && "Nouvelle demande de Congé"}
              {modeActif === "PERMISSIONS" && "Nouvelle demande de Permission d'absence"}
              {modeActif === "ORDRE_MISSION" && "Nouvel Ordre de Mission (Déplacement & Frais)"}
              {modeActif === "INTERVENTION_TECHNIQUE" && "Nouvelle Fiche d'Intervention Technique (Équipe)"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {modeActif === "CONGES" && "Formulaire dédié aux congés annuels payés, arrêts maladie, maternité, paternité et formations."}
            {modeActif === "PERMISSIONS" && "Formulaire dédié aux autorisations d'absence légales et sorties ponctuelles (aucun impact sur le solde de congés payés)."}
            {modeActif === "ORDRE_MISSION" && "Déplacement individuel avec calcul automatique des indemnités selon la distance (0 à 1000 km). L'Ordre de Mission A4 est généré après validation."}
            {modeActif === "INTERVENTION_TECHNIQUE" && "Intervention sur site client en équipe multi-employés (+ Employé), détail des prestations DOMINO / WINDOWS / INFRA et tarif contractuel."}
          </p>
        </div>

        <Link
          href={
            modeActif === "ORDRE_MISSION" || modeActif === "INTERVENTION_TECHNIQUE"
              ? "/absences/demandes?univers=MISSIONS"
              : "/absences/demandes?univers=CONGES"
          }
          className="text-xs font-bold text-slate-600 hover:text-[#C25E00] border border-slate-300 hover:border-[#F0822A] px-3.5 py-1.5 bg-white transition-all self-start sm:self-auto shadow-2xs whitespace-nowrap"
        >
          &larr; Voir le tableau de suivi
        </Link>
      </div>

      {/* ── SÉLECTEUR EN 4 PARCOURS TOTALEMENT SÉPARÉS (ZÉRO CONFUSION) ── */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col gap-3 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
          Sélectionnez le formulaire souhaité (4 parcours distincts) :
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. CONGÉS */}
          <button
            type="button"
            onClick={() => setModeActif("CONGES")}
            className={`p-3.5 text-left cursor-pointer transition-all border rounded-none ${
              modeActif === "CONGES"
                ? "bg-[#FFF7ED] border-2 border-[#F0822A] shadow-xs"
                : "bg-white border border-slate-200 hover:border-orange-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black uppercase ${modeActif === "CONGES" ? "text-[#C25E00]" : "text-slate-800"}`}>
                1. Congés
              </span>
              {modeActif === "CONGES" && (
                <span className="text-[10px] font-bold bg-[#F0822A] text-white px-1.5 py-0.2">Actif</span>
              )}
            </div>
            <p className="text-[11px] leading-snug text-slate-500 m-0">
              Congé annuel payé, maladie, maternité, formation.
            </p>
          </button>

          {/* 2. PERMISSIONS */}
          <button
            type="button"
            onClick={() => setModeActif("PERMISSIONS")}
            className={`p-3.5 text-left cursor-pointer transition-all border rounded-none ${
              modeActif === "PERMISSIONS"
                ? "bg-[#FFF7ED] border-2 border-[#F0822A] shadow-xs"
                : "bg-white border border-slate-200 hover:border-orange-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black uppercase ${modeActif === "PERMISSIONS" ? "text-[#C25E00]" : "text-slate-800"}`}>
                2. Permissions
              </span>
              {modeActif === "PERMISSIONS" && (
                <span className="text-[10px] font-bold bg-[#F0822A] text-white px-1.5 py-0.2">Actif</span>
              )}
            </div>
            <p className="text-[11px] leading-snug text-slate-500 m-0">
              Événements familiaux, médical, démarches, sortie en heures.
            </p>
          </button>

          {/* 3. ORDRE DE MISSION (DÉPLACEMENT & FRAIS KILOMÉTRIQUES) */}
          <button
            type="button"
            onClick={() => setModeActif("ORDRE_MISSION")}
            className={`p-3.5 text-left cursor-pointer transition-all border rounded-none ${
              modeActif === "ORDRE_MISSION"
                ? "bg-[#FFF7ED] border-2 border-[#F0822A] shadow-xs"
                : "bg-white border border-slate-200 hover:border-orange-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black uppercase ${modeActif === "ORDRE_MISSION" ? "text-[#C25E00]" : "text-slate-800"}`}>
                3. Ordre de Mission
              </span>
              {modeActif === "ORDRE_MISSION" && (
                <span className="text-[10px] font-bold bg-[#F0822A] text-white px-1.5 py-0.2">Actif</span>
              )}
            </div>
            <p className="text-[11px] leading-snug text-slate-500 m-0">
              Déplacement individuel, trajet CI, distance &amp; barème 6 paliers.
            </p>
          </button>

          {/* 4. FICHE D'INTERVENTION TECHNIQUE (MULTI-EMPLOYÉS) */}
          <button
            type="button"
            onClick={() => setModeActif("INTERVENTION_TECHNIQUE")}
            className={`p-3.5 text-left cursor-pointer transition-all border rounded-none ${
              modeActif === "INTERVENTION_TECHNIQUE"
                ? "bg-slate-900 text-white border-2 border-slate-900 shadow-xs"
                : "bg-white border border-slate-200 hover:border-slate-500"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black uppercase ${modeActif === "INTERVENTION_TECHNIQUE" ? "text-[#F0822A]" : "text-slate-800"}`}>
                4. Intervention Technique
              </span>
              {modeActif === "INTERVENTION_TECHNIQUE" && (
                <span className="text-[10px] font-bold bg-[#F0822A] text-white px-1.5 py-0.2">Actif</span>
              )}
            </div>
            <p className={`text-[11px] leading-snug m-0 ${modeActif === "INTERVENTION_TECHNIQUE" ? "text-slate-300" : "text-slate-500"}`}>
              Équipe multi-employés (+ Employé), DOMINO / WINDOWS / INFRA.
            </p>
          </button>
        </div>
      </div>

      {/* =====================================================================
          PARCOURS 3 : ORDRE DE MISSION OFFICIEL (DÉPLACEMENT & DISTANCE CI)
      ===================================================================== */}
      {modeActif === "ORDRE_MISSION" && (
        <div className="flex flex-col gap-4">
          <div className="bg-orange-50/70 border border-orange-200 px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="font-bold text-[#C25E00]">
              Parcours : Ordre de Mission individuel (Calcul automatique des frais selon la distance)
            </span>
            <span className="text-[11px] text-slate-600 hidden sm:inline">
              Document généré après validation : <strong>ORDRE DE MISSION N° JPC/...</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLONNE GAUCHE (7 cols) : 3 CARTES DE SAISIE */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* 1. Informations du missionnaire */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  1. Informations du missionnaire
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Nom et prénom(s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={missionDemandeurNom}
                      onChange={(e) => setMissionDemandeurNom(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Matricule
                    </label>
                    <input
                      type="text"
                      value={missionDemandeurMatricule}
                      onChange={(e) => setMissionDemandeurMatricule(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Service / Département
                    </label>
                    <select
                      value={missionDemandeurService}
                      onChange={(e) => setMissionDemandeurService(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none cursor-pointer"
                    >
                      <option value="Exploitation">Exploitation</option>
                      <option value="Direction Technique">Direction Technique</option>
                      <option value="Direction Commerciale">Direction Commerciale</option>
                      <option value="Support & Réseaux">Support &amp; Réseaux</option>
                      <option value="Administration & Finance">Administration &amp; Finance</option>
                      <option value="Ressources Humaines">Ressources Humaines</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Fonction
                    </label>
                    <input
                      type="text"
                      value={missionDemandeurFonction}
                      onChange={(e) => setMissionDemandeurFonction(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Détails de la mission */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  2. Détails de la mission
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Structure d&apos;accueil / Client
                    </label>
                    <input
                      type="text"
                      value={missionClientSite}
                      onChange={(e) => setMissionClientSite(e.target.value)}
                      placeholder="Ex: Agence Bouaké, Site Client..."
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Moyen de transport <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={missionMoyenTransport}
                      onChange={(e) => setMissionMoyenTransport(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none cursor-pointer"
                    >
                      <option value="VÉHICULE DE SERVICE">VÉHICULE DE SERVICE</option>
                      <option value="TRANSPORT EN COMMUN / CAR">TRANSPORT EN COMMUN / CAR</option>
                      <option value="VÉHICULE PERSONNEL">VÉHICULE PERSONNEL</option>
                      <option value="AVION / VOL INTERNE">AVION / VOL INTERNE</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Objet de la mission <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={missionObjet}
                      onChange={(e) => setMissionObjet(e.target.value)}
                      placeholder="Ex: Installation infrastructure réseau"
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Date de départ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={missionDateDepart}
                      onChange={(e) => setMissionDateDepart(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Date de retour <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={missionDateRetour}
                      onChange={(e) => setMissionDateRetour(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Trajet de la mission */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  3. Trajet de la mission
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Ville de départ
                    </label>
                    <input
                      type="text"
                      value={missionVilleDepart}
                      onChange={(e) => setMissionVilleDepart(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Ville de destination (Côte d&apos;Ivoire)
                    </label>
                    <select
                      value={missionDestination}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMissionDestination(val);
                        const found = DESTINATIONS_CI_CATALOGUE.find((v) => v.nom === val);
                        if (found) setMissionDistanceKm(found.distance);
                      }}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none cursor-pointer"
                    >
                      {DESTINATIONS_CI_CATALOGUE.map((v) => (
                        <option key={v.nom} value={v.nom}>
                          {v.nom} ({v.distance} km)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Jauge / Slider interactif de distance */}
                <div className="mt-5 pt-4 border-t border-slate-200">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Distance (aller simple)
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        {missionDistanceKm}
                      </span>
                      <span className="text-xs font-bold text-slate-500">km</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={1}
                    value={missionDistanceKm}
                    onChange={(e) => setMissionDistanceKm(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-none appearance-none cursor-pointer accent-[#F0822A]"
                  />

                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>0</span>
                    <span>250</span>
                    <span>500</span>
                    <span>750</span>
                    <span>1000 km</span>
                  </div>

                  {/* Toggles Aller simple / Aller-retour */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setMissionTrajetType("ALLER_SIMPLE")}
                      className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none border ${
                        missionTrajetType === "ALLER_SIMPLE"
                          ? "bg-[#F0822A] text-white border-[#F0822A] shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Aller simple
                    </button>
                    <button
                      type="button"
                      onClick={() => setMissionTrajetType("ALLER_RETOUR")}
                      className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none border ${
                        missionTrajetType === "ALLER_RETOUR"
                          ? "bg-[#F0822A] text-white border-[#F0822A] shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Aller-retour
                    </button>
                  </div>

                  {/* Ajustement par le valideur */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Ajustement par le valideur (FCFA, optionnel)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={missionAjustementValideur}
                      onChange={(e) => setMissionAjustementValideur(Number(e.target.value))}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-2 m-0">
                      La restauration et l&apos;hébergement ne sont pas inclus dans ce barème kilométrique.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE (5 cols) : FRAIS ESTIMÉS & APERÇU ORDRE DE MISSION */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Frais de déplacement estimés */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  Frais de déplacement estimés
                </h3>

                <div className="bg-[#FFF8F2] border border-orange-200 p-4 text-center mb-4">
                  <span className="text-[11px] text-slate-600 block mb-1">
                    Montant estimé (dans l&apos;ordre de mission)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#F0822A] tracking-tight block">
                    {fraisDeplacementEstimes.toLocaleString("fr-FR")} FCFA
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    {activePalier.unitPrice.toLocaleString("fr-FR")} FCFA{" "}
                    {isAllerRetourMission ? "x 2 (aller-retour)" : "x 1 (aller simple)"}
                  </span>
                </div>

                {/* Grille des 6 paliers officiels */}
                <div className="border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-2 grid grid-cols-12 font-bold text-slate-700 border-b border-slate-200">
                    <span className="col-span-7">Distance (aller simple)</span>
                    <span className="col-span-5 text-right">Frais</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {PALIER_TIERS_CI.map((tier, idx) => {
                      const isCurrent = activePalier.index === idx;
                      return (
                        <div
                          key={tier.label}
                          className={`px-3 py-2 grid grid-cols-12 items-center transition-colors ${
                            isCurrent
                              ? "bg-[#FFF2E6] text-[#C25E00] font-bold border-l-2 border-[#F0822A]"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="col-span-7">{tier.label}</span>
                          <span className={`col-span-5 text-right font-mono ${isCurrent ? "font-bold text-[#F0822A]" : ""}`}>
                            {tier.labelPrice}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Aperçu récapitulatif de l'ordre de mission */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  Aperçu de l&apos;Ordre de Mission
                </h3>

                <div className="flex flex-col gap-2.5 text-xs mb-5">
                  <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                    <span className="col-span-4 text-slate-500 font-medium">Missionnaire</span>
                    <span className="col-span-8 font-bold text-slate-900 text-right">{missionDemandeurNom}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                    <span className="col-span-4 text-slate-500 font-medium">Objet</span>
                    <span className="col-span-8 font-semibold text-slate-800 text-right">{missionObjet || "-"}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                    <span className="col-span-4 text-slate-500 font-medium">Transport</span>
                    <span className="col-span-8 font-bold text-slate-800 text-right">{missionMoyenTransport}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                    <span className="col-span-4 text-slate-500 font-medium">Période</span>
                    <span className="col-span-8 font-mono text-slate-800 text-right">{periodeMissionLabel}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                    <span className="col-span-4 text-slate-500 font-medium">Trajet</span>
                    <span className="col-span-8 font-bold text-slate-900 text-right">
                      {missionVilleDepart} &rarr; {missionDestination}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                    <span className="col-span-4 text-slate-500 font-medium">Distance totale</span>
                    <span className="col-span-8 font-mono font-bold text-slate-900 text-right">{totalDistanceMissionKm} km</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 py-1">
                    <span className="col-span-4 text-slate-500 font-medium">Frais estimés</span>
                    <span className="col-span-8 font-mono font-black text-[#F0822A] text-right">
                      {fraisDeplacementEstimes.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 mb-4 leading-relaxed">
                  Après soumission, suivez votre demande dans le tableau. Dès validation du workflow, cliquez sur <strong>Consulter / PDF</strong> pour télécharger l&apos;<strong>Ordre de Mission A4 signé par le Directeur Général</strong>.
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSoumettreOrdreMission}
                  className="w-full bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs py-3.5 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Transmission en cours..." : "Soumettre l'Ordre de Mission →"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PARCOURS 4 : FICHE D'INTERVENTION TECHNIQUE (ÉQUIPE MULTI-EMPLOYÉS)
      ===================================================================== */}
      {modeActif === "INTERVENTION_TECHNIQUE" && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="font-bold text-[#F0822A]">
              Parcours : Fiche d&apos;Intervention Technique sur site client (Multi-employés)
            </span>
            <span className="text-[11px] text-slate-300 hidden sm:inline">
              Document généré après validation : <strong>FICHE D&apos;INTERVENTION TECHNIQUE A4</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLONNE GAUCHE (7 cols) : ÉQUIPE, CLIENT, PRESTATIONS & TARIF */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* 1. Équipe d'Intervention / Employés (+ Employé) */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide m-0">
                    1. Équipe d&apos;Intervention / Employés
                  </h3>
                  <span className="text-[10px] font-bold bg-orange-50 text-[#C25E00] border border-orange-200 px-2 py-0.5">
                    {1 + interventionCollaborateurs.length} intervenant(s)
                  </span>
                </div>

                {/* Intervenant Principal */}
                <div className="mb-4">
                  <label className="block text-slate-700 text-xs font-semibold mb-1">
                    Intervenant Principal / Responsable d&apos;équipe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={intervenantPrincipal}
                    onChange={(e) => setIntervenantPrincipal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  />
                </div>

                {/* Ajout de collaborateurs (+ Employé) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-800">
                    Ajouter des collaborateurs à l&apos;équipe d&apos;intervention :
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-8">
                      <select
                        value={selectedCollabToAdd}
                        onChange={(e) => setSelectedCollabToAdd(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:border-[#F0822A] focus:outline-none rounded-none cursor-pointer"
                      >
                        {COLLABORATEURS_AGILLY_CATALOGUE.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <button
                        type="button"
                        onClick={handleAddCollaborateur}
                        className="w-full h-full bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs px-3 py-2 rounded-none transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>+ Employé</span>
                      </button>
                    </div>
                  </div>

                  {/* Ou saisie manuelle d'un collaborateur */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCollabInput}
                      onChange={(e) => setCustomCollabInput(e.target.value)}
                      placeholder="Ou saisir manuellement : Nom Prénom — Fonction..."
                      className="flex-1 bg-white border border-slate-300 p-1.5 text-xs text-slate-900 focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                    {customCollabInput.trim() && (
                      <button
                        type="button"
                        onClick={handleAddCollaborateur}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-none cursor-pointer"
                      >
                        Ajouter
                      </button>
                    )}
                  </div>

                  {/* Liste des employés de l'équipe */}
                  <div className="mt-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between bg-orange-50/80 border border-orange-200 px-3 py-1.5 text-xs">
                      <span className="font-bold text-slate-900">
                        • {intervenantPrincipal}
                      </span>
                      <span className="text-[10px] font-bold text-[#C25E00] uppercase">
                        Chef d&apos;équipe
                      </span>
                    </div>

                    {interventionCollaborateurs.map((collab, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 text-xs"
                      >
                        <span className="font-medium text-slate-800">• {collab}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborateur(idx)}
                          className="text-red-600 hover:text-red-800 font-bold text-xs px-1.5 py-0.5 hover:bg-red-50 cursor-pointer"
                          title="Retirer cet employé"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Client, Site & Période d'intervention */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  2. Client, Site &amp; Période d&apos;intervention
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Client / Adresse du site d&apos;intervention <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={interventionClientSite}
                      onChange={(e) => setInterventionClientSite(e.target.value)}
                      placeholder="Ex: 22 rue des carrossiers Zone 3 - Treichville Abidjan"
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Intitulé général de l&apos;intervention <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={interventionObjet}
                      onChange={(e) => setInterventionObjet(e.target.value)}
                      placeholder="Ex: Déploiement infrastructure et migration serveurs"
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={interventionDateDebut}
                      onChange={(e) => setInterventionDateDebut(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Date de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={interventionDateFin}
                      onChange={(e) => setInterventionDateFin(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Description des Prestations Techniques (DOMINO, WINDOWS, INFRASTRUCTURES / RÉSEAUX) */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  3. Description des Prestations Techniques
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-slate-900 text-xs font-black mb-1">
                      ▲ DOMINO :
                    </label>
                    <textarea
                      rows={2}
                      value={prestaDomino}
                      onChange={(e) => setPrestaDomino(e.target.value)}
                      placeholder="Ex: Migration des serveurs vers la version 11 et installation de VERSE."
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 text-xs font-black mb-1">
                      ▲ WINDOWS :
                    </label>
                    <textarea
                      rows={2}
                      value={prestaWindows}
                      onChange={(e) => setPrestaWindows(e.target.value)}
                      placeholder="Ex: Migration OS vers 2016 SERVER et passage à Edge."
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 text-xs font-black mb-1">
                      ▲ INFRASTRUCTURES / RÉSEAUX :
                    </label>
                    <textarea
                      rows={2}
                      value={prestaInfra}
                      onChange={(e) => setPrestaInfra(e.target.value)}
                      placeholder="Ex: Sécurisation des routeurs et pare-feu principaux."
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Conditions Financières (Tarif contractuel) */}
              <div className="bg-white border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  4. Conditions Financières
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      Tarif contractuel journalier (FCFA / jour)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={tarifContractuelJour}
                      onChange={(e) => setTarifContractuelJour(Number(e.target.value))}
                      className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                    />
                  </div>
                  <div className="bg-[#FFF8F2] border border-orange-200 p-3 text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Mention sur la Fiche A4 :
                    </span>
                    <span className="text-sm font-black text-[#C25E00] font-mono">
                      {(Number(tarifContractuelJour) || 0).toLocaleString("fr-FR")} FCFA / jour
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE (5 cols) : APERÇU DE LA FICHE D'INTERVENTION TECHNIQUE */}
            <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
              <div className="bg-white border border-slate-200 border-t-4 border-t-slate-900 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                  Aperçu de la Fiche d&apos;Intervention Technique
                </h3>

                {/* Équipe */}
                <div className="border border-slate-300 p-3 bg-slate-50 mb-4 text-xs">
                  <span className="font-extrabold uppercase text-[10px] text-slate-700 block mb-1.5">
                    ÉQUIPE D&apos;INTERVENTION / EMPLOYÉS ({1 + interventionCollaborateurs.length}) :
                  </span>
                  <div className="flex flex-col gap-1 font-medium text-slate-900 text-[11px]">
                    <span className="font-bold">• {intervenantPrincipal} (Principal)</span>
                    {interventionCollaborateurs.map((c, i) => (
                      <span key={i}>• {c}</span>
                    ))}
                  </div>
                </div>

                {/* Résumé Prestations */}
                <div className="flex flex-col gap-2.5 text-xs mb-4">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Client / Site</span>
                    <span className="font-bold text-slate-900">{interventionClientSite || "-"}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Période</span>
                    <span className="font-mono font-bold text-slate-900">{periodeInterventionLabel}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-800 block">1 - Prestations Techniques</span>
                    <div className="mt-1 space-y-1 text-[11px] text-slate-700">
                      <p className="m-0"><strong>▲ DOMINO :</strong> {prestaDomino || "-"}</p>
                      <p className="m-0"><strong>▲ WINDOWS :</strong> {prestaWindows || "-"}</p>
                      <p className="m-0"><strong>▲ INFRA / RÉSEAUX :</strong> {prestaInfra || "-"}</p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-800 block">2 - Conditions Financières</span>
                    <span className="text-sm font-black text-[#F0822A] font-mono block mt-0.5">
                      Tarif contractuel : {(Number(tarifContractuelJour) || 0).toLocaleString("fr-FR")} FCFA / jour
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 mb-4 leading-relaxed">
                  Après soumission, retrouvez votre fiche dans le tableau de suivi. Dès validation du workflow, cliquez sur <strong>Consulter / PDF</strong> pour télécharger la <strong>Fiche d&apos;Intervention Technique A4 officielle</strong>.
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSoumettreIntervention}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Transmission en cours..." : "Soumettre la Fiche d'Intervention →"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PARCOURS 1 & 2 : CONGÉS & PERMISSIONS D'ABSENCE
      ===================================================================== */}
      {(modeActif === "CONGES" || modeActif === "PERMISSIONS") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne gauche (8 cols) : Saisie du dossier */}
          <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-5 text-xs shadow-2xs">
            {/* Identité du demandeur */}
            <div className="p-3.5 bg-gradient-to-r from-orange-50/70 via-white to-slate-50 border border-orange-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[#C25E00] text-[10px] block uppercase font-bold">Demandeur</span>
                <span className="font-bold text-slate-900">{currentPersona.prenom} {currentPersona.nom}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Matricule</span>
                <span className="font-mono font-bold text-slate-900">{currentPersona.matricule}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Fonction</span>
                <span className="font-medium text-slate-800">{currentPersona.poste}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-medium">Département</span>
                <span className="font-medium text-slate-800">{currentPersona.departement}</span>
              </div>
            </div>

            {/* Menu déroulant du motif précis */}
            <div>
              <label htmlFor="select-motif" className="block text-slate-900 font-bold mb-1.5">
                {modeActif === "CONGES" ? "Type de congé demandé" : "Nature de la permission"} <span className="text-[#D96F1D]">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-motif"
                  value={typeDemande}
                  onChange={(e) => setTypeDemande(e.target.value as TypeDemandeRH)}
                  className="w-full h-10 px-3 pr-8 text-xs font-bold text-slate-900 bg-white border border-slate-300 focus:border-[#D96F1D] focus:outline-none cursor-pointer appearance-none"
                >
                  {motifsFamille.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titre} — {m.sousTitre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold">
                  ▼
                </div>
              </div>

              <div className="mt-2 p-2.5 bg-slate-50 border-l-2 border-[#D96F1D] text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{motifActif.titre}</span>
                  <span className="font-mono font-semibold text-[10px] px-1.5 py-0.2 bg-white border border-slate-300 text-slate-700">
                    {motifActif.badgeLegal}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{motifActif.decompteLabel}</p>
              </div>
            </div>

            {/* Période : Heures ou Jours */}
            {motifActif.isSortieHeures ? (
              <div className="p-4 bg-orange-50/50 border border-orange-200 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-1 border-b border-orange-200">
                  <span className="font-bold text-orange-950 text-xs">
                    Plage horaire de la sortie temporaire
                  </span>
                  <span className="font-mono font-bold text-xs text-[#B95914]">
                    {dureeHeuresMinutes?.text}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date de sortie *</label>
                    <input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => {
                        setDateDebut(e.target.value);
                        setDateFin(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Heure de départ *</label>
                    <input
                      type="time"
                      value={heureDebut}
                      onChange={(e) => setHeureDebut(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Heure de retour prévue *</label>
                    <input
                      type="time"
                      value={heureFin}
                      onChange={(e) => setHeureFin(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <span className="font-bold text-slate-900 text-xs pb-1 border-b border-slate-200">
                  Période de l&apos;absence
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Du (inclus) *</label>
                    <input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                    <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-slate-600 text-[11px]">
                      <input
                        type="checkbox"
                        checked={estDemiJourneeDebut}
                        onChange={(e) => setEstDemiJourneeDebut(e.target.checked)}
                        className="accent-[#D96F1D]"
                      />
                      <span>Départ l&apos;après-midi (demi-journée)</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Au (inclus) *</label>
                    <input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                    <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-slate-600 text-[11px]">
                      <input
                        type="checkbox"
                        checked={estDemiJourneeFin}
                        onChange={(e) => setEstDemiJourneeFin(e.target.checked)}
                        className="accent-[#D96F1D]"
                      />
                      <span>Retour le matin (demi-journée)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-700 pt-2 border-t border-slate-200 text-xs">
                  <span>Décompte retenu :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {joursCalendaires} j calendaires ({joursOuvres} j ouvrés)
                  </span>
                </div>
              </div>
            )}

            {/* Justification */}
            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Motif ou justification de l&apos;absence <span className="text-[#D96F1D]">*</span>
              </label>
              <textarea
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Expliquez la situation ou la justification de votre demande..."
                className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#D96F1D]"
              />
            </div>

            {/* Contact pendant l'absence */}
            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Contact ou adresse pendant l&apos;absence
              </label>
              <input
                type="text"
                value={adresseContact}
                onChange={(e) => setAdresseContact(e.target.value)}
                placeholder="Ex: Abidjan Cocody, +225 07 00 00 00 00"
                className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#D96F1D]"
              />
            </div>

            {/* Pièce justificative (si applicable) */}
            {motifActif.id !== "CONGES_ANNUELS" && (motifActif.justificatifRequis || Boolean(motifActif.justificatifLabel)) && (
              <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Pièce justificative {motifActif.justificatifRequis ? "(Obligatoire)" : "(Facultatif)"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {motifActif.justificatifLabel || "Certificat médical, convocation, etc."}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">PDF, JPEG, PNG (max 5 Mo)</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  multiple
                  className="hidden"
                />

                {fichiersList.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {fichiersList.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-200">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xs font-bold text-slate-800 truncate">{f.nom}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">({f.taille})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-0.5 hover:bg-red-50 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-[#D96F1D] bg-white hover:bg-orange-50/50 p-4 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                >
                  <span className="text-xs font-bold text-slate-800">
                    Cliquez pour joindre un justificatif
                  </span>
                </button>
              </div>
            )}

            {/* Engagement sur l'honneur */}
            <div className="p-3 border border-slate-300 bg-white">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={engagementHonneur}
                  onChange={(e) => setEngagementHonneur(e.target.checked)}
                  className="mt-0.5 accent-[#D96F1D] w-4 h-4 cursor-pointer"
                />
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block">
                    Engagement et certification du collaborateur
                  </span>
                  Je certifie sur l&apos;honneur l&apos;exactitude des mentions indiquées et sollicite l&apos;approbation de ma hiérarchie.
                </div>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isSubmitting || !engagementHonneur}
                onClick={handleSubmitCongePermission}
                className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-black text-white shadow-md cursor-pointer transition-all ${
                  isSubmitting || !engagementHonneur
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-[#F0822A] hover:bg-[#D96F1D] active:scale-[0.99]"
                }`}
              >
                <span>{isSubmitting ? "Transmission en cours..." : "Transmettre ma demande →"}</span>
              </button>
            </div>
          </div>

          {/* Colonne droite : Récapitulatif Congés / Permissions */}
          <div className="lg:col-span-4 bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-5 flex flex-col gap-4 sticky top-20 text-xs shadow-2xs">
            <div className="pb-3 border-b border-orange-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C25E00] block">
                  Récapitulatif de ma demande
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {motifActif.titre}
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#F0822A]" />
            </div>

            <div className="p-3.5 bg-orange-50/40 border border-orange-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-bold">Durée totale :</span>
                <span className="text-base font-black text-[#F0822A] font-mono">
                  {motifActif.isSortieHeures ? dureeHeuresMinutes?.text : `${joursOuvres} jour(s) ouvré(s)`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-orange-200/60">
                <span className="text-slate-500 font-medium">Dates :</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatFrShort(dateDebut)} {dateFin && dateFin !== dateDebut ? `au ${formatFrShort(dateFin)}` : ""}
                </span>
              </div>
            </div>

            {motifActif.impactSolde ? (
              <div className="p-3.5 bg-[#FFF9F5] border-2 border-orange-200 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-[#C25E00] tracking-wide">
                  Solde de Congés Payés
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Solde actuel :</span>
                  <span className="font-mono font-extrabold text-slate-900">{soldeConges.joursRestants} jours</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-orange-200/80 font-bold">
                  <span className="text-slate-800">Solde après demande :</span>
                  <span className={`font-mono text-base ${soldeSuffisant ? "text-[#C25E00] font-black" : "text-red-700 font-black"}`}>
                    {soldeRestantApres} jours
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-900">
                  Solde de Congés Payés Préservé
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  0 jour déduit de votre solde annuel
                </span>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-slate-600">
                Circuit de validation prévu
              </span>
              <div className="flex flex-col gap-1.5 mt-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#F0822A] text-white font-black flex items-center justify-center text-[10px]">1</span>
                  <span className="font-bold text-slate-900">Avis Responsable N+1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span className="text-slate-700 font-medium">Contrôle Direction RH</span>
                </div>
                {!circuitCourt && (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <span className="text-slate-700 font-medium">Accord final Direction Générale</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NouvelleDemandePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Chargement du formulaire...</div>}>
      <NouvelleDemandeForm />
    </Suspense>
  );
}
