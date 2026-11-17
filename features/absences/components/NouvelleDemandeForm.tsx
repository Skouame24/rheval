// ============================================================
// Formulaire de demande Congés/Permissions ou Missions
// Formulaire dynamique, intuitif et corporate de demande RH
// Structure en 3 familles d'absence sans aucun doublon :
//  1. Congés (décomptés en jours, solde annuel ou maintien)
//  2. Permissions (courte durée, événements légaux, sortie en heures)
//  3. Missions (activité pro, transport, frais)
// ============================================================

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { TypeDemandeRH, FamilleDemandeRH } from "@/types/absences.types";
import type { InterventionTeamMember, MissionFeeCategory } from "@/types/absences.types";
import {
  VILLES_CI_CATALOGUE,
  MOYENS_TRANSPORT_CATALOGUE,
  BAREME_FRAIS_INTERVENTION_LOCALE,
  BAREME_FRAIS_MISSION,
  MISSION_FEE_CATEGORY_LABELS,
  calculerFraisMissionClient,
  inferMissionFeeCategory,
} from "@/lib/api/missions.api";
import { employeesApi } from "@/lib/api";
import type { User } from "@/types";

export interface BaremeMission {
  id: string;
  nom: string;
  distance: string;
  tarifJour: number;
  description: string;
}

export const BAREMES_MISSION: BaremeMission[] = [
  {
    id: "GRAND_ABIDJAN",
    nom: "Zone 1 : Grand Abidjan & Périphérie",
    distance: "< 50 km (Abidjan, Bassam, Bingerville, Songon)",
    tarifJour: 15000,
    description: "Repas de midi et transport local",
  },
  {
    id: "INTERIEUR",
    nom: "Zone 2 : Intérieur du pays / Province",
    distance: "50 à 500 km (Bouaké, San Pedro, Yamoussoukro, Korhogo)",
    tarifJour: 40000,
    description: "Hébergement standard, repas & per diem journalier",
  },
  {
    id: "SOUS_REGION",
    nom: "Zone 3 : Sous-région CEDEAO / UEMOA",
    distance: "Dakar, Bamako, Ouaga, Cotonou, Lomé, etc.",
    tarifJour: 75000,
    description: "Per diem international Afrique de l'Ouest & hébergement",
  },
  {
    id: "INTERNATIONAL",
    nom: "Zone 4 : International Hors Afrique",
    distance: "Europe, Amérique, Asie",
    tarifJour: 120000,
    description: "Per diem international complet",
  },
  {
    id: "PERSONNALISE",
    nom: "Autre / Forfait personnalisé client",
    distance: "Selon devis ou conditions particulières",
    tarifJour: 0,
    description: "Montant libre saisi selon accord",
  },
];

export interface MotifConfig {
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

export const MOTIFS_CATALOGUE: MotifConfig[] = [
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

  // ── 3. MISSIONS PROFESSIONNELLES ──
  {
    id: "MISSION_DEPLACEMENT",
    famille: "MISSIONS",
    titre: "Ordre de mission & intervention",
    sousTitre: "Intervention sur site client, mission province/international ou astreinte",
    badgeLegal: "Professionnel",
    decompteLabel: "Période de mission professionnelle (prise en charge Agilly)",
    impactSolde: false,
    justificatifRequis: false,
  },
  {
    id: "INTERVENTION_TERRAIN",
    famille: "MISSIONS",
    titre: "Intervention technique sur site client",
    sousTitre: "Intervention technique, datacenter, installation ou astreinte",
    badgeLegal: "Technique",
    decompteLabel: "Période d'intervention planifiée",
    impactSolde: false,
    justificatifRequis: false,
  },
];

export function NouvelleDemandeForm() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { soldeConges, addDemande, currentPersona } = useAbsences();
  const univers: "CONGES" | "MISSIONS" =
    pathname.startsWith("/absences/missions") || searchParams.get("univers") === "MISSIONS"
      ? "MISSIONS"
      : "CONGES";
  const initialType = searchParams.get("type");
  const initialMotif = MOTIFS_CATALOGUE.find(
    (motif) =>
      motif.id === initialType &&
      (univers !== "CONGES" || motif.famille !== "MISSIONS") &&
      (univers !== "MISSIONS" || motif.famille === "MISSIONS"),
  );

  // Famille active
  const [familleActive, setFamilleActive] = useState<FamilleDemandeRH>(
    initialMotif?.famille ?? (univers === "MISSIONS" ? "MISSIONS" : "CONGES"),
  );
  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>(
    initialMotif?.id ?? (univers === "MISSIONS" ? "MISSION_DEPLACEMENT" : "CONGES_ANNUELS"),
  );
  const [collaborateurs, setCollaborateurs] = useState<User[]>([]);
  const [isLoadingCollaborateurs, setIsLoadingCollaborateurs] = useState(univers === "MISSIONS");
  const [collaborateursError, setCollaborateursError] = useState<string | null>(null);
  const [collaborateurSelectionId, setCollaborateurSelectionId] = useState("");
  const [intervenantSelectionId, setIntervenantSelectionId] = useState("");
  const [equipeInterventionIds, setEquipeInterventionIds] = useState<string[]>([]);
  const [equipeInterventionCategories, setEquipeInterventionCategories] = useState<
    Record<string, MissionFeeCategory>
  >({});
  const [categorieFraisManuelle, setCategorieFraisManuelle] = useState<MissionFeeCategory | "">("");

  const collaborateurConnecteDansAnnuaire = collaborateurs.find(
    (collaborateur) =>
      collaborateur.id === currentPersona.id ||
      collaborateur.email.toLowerCase() === currentPersona.email.toLowerCase(),
  );
  const collaborateurMissionId = collaborateurSelectionId || collaborateurConnecteDansAnnuaire?.id || "";
  const collaborateurMission = collaborateurs.find((item) => item.id === collaborateurMissionId);
  const categorieFraisDetectee = inferMissionFeeCategory(collaborateurMission?.poste);
  const categorieFraisMission = categorieFraisDetectee || categorieFraisManuelle || undefined;
  const equipeIntervention = useMemo<InterventionTeamMember[]>(
    () =>
      equipeInterventionIds.flatMap((id) => {
        const collaborateur = collaborateurs.find((item) => item.id === id);
        return collaborateur
          ? [{
              id: collaborateur.id,
              nom: `${collaborateur.prenom} ${collaborateur.nom}`.trim(),
              email: collaborateur.email,
              poste: collaborateur.poste,
              categorieFrais:
                inferMissionFeeCategory(collaborateur.poste) ?? equipeInterventionCategories[id],
            }]
          : [];
      }),
    [collaborateurs, equipeInterventionCategories, equipeInterventionIds],
  );

  useEffect(() => {
    if (univers !== "MISSIONS") return;

    let active = true;
    employeesApi
      .getAllUsers()
      .then((users) => {
        if (active) setCollaborateurs(users);
      })
      .catch((error: unknown) => {
        console.error("[NouvelleDemandeForm] Impossible de charger l'annuaire:", error);
        if (active) setCollaborateursError("Impossible de charger l'annuaire des collaborateurs.");
      })
      .finally(() => {
        if (active) setIsLoadingCollaborateurs(false);
      });

    return () => {
      active = false;
    };
  }, [univers]);

  // Motifs filtrés selon la famille
  const motifsFamille = useMemo(() => {
    return MOTIFS_CATALOGUE.filter((m) => m.famille === familleActive);
  }, [familleActive]);

  const motifActif = useMemo(() => {
    return MOTIFS_CATALOGUE.find((m) => m.id === typeDemande) || MOTIFS_CATALOGUE[0];
  }, [typeDemande]);
  const isIntervention = motifActif.id === "INTERVENTION_TERRAIN";

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

  // Champs de période universels
  const [dateDebut, setDateDebut] = useState<string>(defaultDates.debut);
  const [dateFin, setDateFin] = useState<string>(defaultDates.fin);
  const [estDemiJourneeDebut, setEstDemiJourneeDebut] = useState(false);
  const [estDemiJourneeFin, setEstDemiJourneeFin] = useState(false);

  // Champs spécifiques sortie en heures
  const [heureDebut, setHeureDebut] = useState("10:00");
  const [heureFin, setHeureFin] = useState("12:30");

  // Champs spécifiques mission enrichis (Référentiel CI & Transports)
  const [villeId, setVilleId] = useState<string>("BOUAKE");
  const [transportCode, setTransportCode] = useState<string>("VEHICULE_SERVICE");
  const [ajustementManuelFrais, setAjustementManuelFrais] = useState(false);
  const [fraisPrevisionnelsManuels, setFraisPrevisionnelsManuels] = useState("");
  const [clientProjet, setClientProjet] = useState("");
  const [intituleIntervention, setIntituleIntervention] = useState("");
  const [tarifInterventionJour, setTarifInterventionJour] = useState("75000");
  const [fraisDeplacementIntervention, setFraisDeplacementIntervention] = useState("0");
  const [forfaitSpecialInterventionActif, setForfaitSpecialInterventionActif] = useState(false);
  const [forfaitSpecialIntervention, setForfaitSpecialIntervention] = useState("10000");
  const [avanceDemandee, setAvanceDemandee] = useState(false);
  const [montantAvance, setMontantAvance] = useState("");

  // Motif & contact
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

  // Calcul dynamique durée en heures (pour permission de sortie)
  const dureeHeuresMinutes = useMemo(() => {
    if (!motifActif.isSortieHeures) return null;
    const [h1, m1] = heureDebut.split(":").map(Number);
    const [h2, m2] = heureFin.split(":").map(Number);
    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
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

  // Calcul dynamique jours calendaires et jours ouvrés
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

  // Vérification dynamique du solde pour le congé annuel
  const soldeRestantApres = useMemo(() => {
    if (!motifActif.impactSolde) return soldeConges.joursRestants;
    return Math.round((soldeConges.joursRestants - joursOuvres) * 10) / 10;
  }, [motifActif.impactSolde, soldeConges.joursRestants, joursOuvres]);

  const soldeSuffisant = soldeRestantApres >= 0;

  // Circuit applicable
  const circuitCourt = motifActif.famille === "PERMISSIONS" && joursOuvres <= 2;

  // ── MOTEUR OFFICIEL DE CALCUL AUTOMATIQUE DES FRAIS DE MISSION (CI & INTERNATIONAL) ──
  const calculMission = useMemo(() => {
    return calculerFraisMissionClient(villeId, transportCode, joursOuvres);
  }, [villeId, transportCode, joursOuvres]);

  const missionFrais = useMemo(() => {
    const bareme = categorieFraisMission ? BAREME_FRAIS_MISSION[categorieFraisMission] : null;
    const hebergement = bareme ? bareme.hebergement * joursOuvres : 0;
    const restauration = bareme ? bareme.restauration * joursOuvres : 0;
    const deplacement = calculMission.fraisTransportEstimes;
    return {
      hebergement,
      restauration,
      deplacement,
      total: hebergement + restauration + deplacement,
    };
  }, [calculMission.fraisTransportEstimes, categorieFraisMission, joursOuvres]);

  // Montant effectif des frais prévisionnels (automatique ou ajusté par dérogation)
  const fraisPrevisionnelsEffectifs = useMemo(() => {
    if (ajustementManuelFrais && fraisPrevisionnelsManuels !== "") {
      return Math.max(0, Number(fraisPrevisionnelsManuels) || 0);
    }
    return missionFrais.total;
  }, [ajustementManuelFrais, fraisPrevisionnelsManuels, missionFrais.total]);
  const avanceSuggeree80 = Math.round((missionFrais.total * 0.8) / 1000) * 1000;
  const fraisInterventionTotal = useMemo(() => {
    const tarif = Number(tarifInterventionJour);
    return Number.isFinite(tarif) && tarif > 0
      ? Math.round(tarif * joursOuvres)
      : 0;
  }, [joursOuvres, tarifInterventionJour]);
  const interventionLocale = calculMission.ville.zone === "GRAND_ABIDJAN";
  const hasAgentMaitrise = equipeIntervention.some(
    (member) => member.categorieFrais === "AGENT_MAITRISE",
  );
  const hasTransportReelIntervention = equipeIntervention.some(
    (member) =>
      member.categorieFrais &&
      BAREME_FRAIS_INTERVENTION_LOCALE[member.categorieFrais].deplacementReel,
  );
  const equipeInterventionCategoriesCompletes =
    equipeIntervention.length > 0 && equipeIntervention.every((member) => member.categorieFrais);
  const fraisIntervention = useMemo(() => {
    const hebergement = interventionLocale
      ? 0
      : equipeIntervention.reduce(
          (total, member) =>
            total +
            (member.categorieFrais
              ? BAREME_FRAIS_MISSION[member.categorieFrais].hebergement * joursOuvres
              : 0),
          0,
        );
    const restauration = equipeIntervention.reduce((total, member) => {
      if (!member.categorieFrais) return total;
      const tarifJour = interventionLocale
        ? BAREME_FRAIS_INTERVENTION_LOCALE[member.categorieFrais].restauration
        : BAREME_FRAIS_MISSION[member.categorieFrais].restauration;
      return total + tarifJour * joursOuvres;
    }, 0);
    const deplacement = interventionLocale
      ? hasTransportReelIntervention
        ? Math.max(0, Number(fraisDeplacementIntervention) || 0)
        : 0
      : calculMission.fraisTransportEstimes;
    const forfait = forfaitSpecialInterventionActif && hasAgentMaitrise
      ? Math.max(0, Number(forfaitSpecialIntervention) || 0)
      : 0;
    return {
      hebergement,
      restauration,
      deplacement,
      forfait,
      total: hebergement + restauration + deplacement + forfait,
    };
  }, [
    calculMission.fraisTransportEstimes,
    equipeIntervention,
    fraisDeplacementIntervention,
    forfaitSpecialIntervention,
    forfaitSpecialInterventionActif,
    hasAgentMaitrise,
    hasTransportReelIntervention,
    interventionLocale,
    joursOuvres,
  ]);
  const fraisInterventionTotalGlobal = fraisInterventionTotal + fraisIntervention.total;

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motif.trim()) {
      alert(isIntervention ? "Veuillez décrire l'intervention." : "Veuillez indiquer le motif explicite de votre demande.");
      return;
    }

    if (isIntervention && equipeIntervention.length === 0) {
      alert("Veuillez ajouter au moins un intervenant à l'équipe.");
      return;
    }

    if (isIntervention && !intituleIntervention.trim()) {
      alert("Veuillez renseigner l'intitulé général de l'intervention.");
      return;
    }

    if (isIntervention && !equipeInterventionCategoriesCompletes) {
      alert("Veuillez indiquer la catégorie de frais de chaque intervenant dont le poste n'est pas reconnu.");
      return;
    }

    if (isIntervention && !clientProjet.trim()) {
      alert("Veuillez renseigner le client ou l'établissement.");
      return;
    }

    if (isIntervention && (!dateDebut || !dateFin || dateFin < dateDebut)) {
      alert("Veuillez renseigner une période d'intervention valide.");
      return;
    }

    if (isIntervention && (!Number.isFinite(Number(tarifInterventionJour)) || Number(tarifInterventionJour) <= 0)) {
      alert("Veuillez renseigner un tarif journalier valide.");
      return;
    }

    if (motifActif.famille === "MISSIONS" && !isIntervention && !collaborateurMissionId) {
      alert("Veuillez sélectionner le collaborateur destinataire de l'ordre de mission.");
      return;
    }

    if (motifActif.famille === "MISSIONS" && !isIntervention && !categorieFraisMission) {
      alert("Veuillez sélectionner la catégorie de frais du destinataire.");
      return;
    }

    if (
      isIntervention &&
      interventionLocale &&
      hasTransportReelIntervention &&
      (!Number.isFinite(Number(fraisDeplacementIntervention)) || Number(fraisDeplacementIntervention) < 0)
    ) {
      alert("Veuillez saisir un montant valide pour les frais réels de déplacement.");
      return;
    }

    if (
      isIntervention &&
      forfaitSpecialInterventionActif &&
      hasAgentMaitrise &&
      (Number(forfaitSpecialIntervention) < 10000 ||
        Number(forfaitSpecialIntervention) > 15000)
    ) {
      alert("Le forfait spécial est réservé aux Agents de maîtrise et doit être compris entre 10 000 et 15 000 FCFA.");
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
      } else if (motifActif.famille === "MISSIONS" && !isIntervention) {
        const clientPart = clientProjet ? ` [Client: ${clientProjet}]` : "";
        const villePart = ` [Lieu: ${calculMission.ville.nom} (${calculMission.ville.districtOuRegion}, ${calculMission.distanceKmAR} km A/R)]`;
        const transportPart = ` [Transport: ${calculMission.transport.libelle}]`;
        const fraisPart = ` [Frais ${MISSION_FEE_CATEGORY_LABELS[categorieFraisMission!]}: hébergement ${missionFrais.hebergement.toLocaleString("fr-FR")} FCFA, repas ${missionFrais.restauration.toLocaleString("fr-FR")} FCFA, transport employeur ${missionFrais.deplacement.toLocaleString("fr-FR")} FCFA; total ${fraisPrevisionnelsEffectifs.toLocaleString("fr-FR")} FCFA]`;
        const avancePart = avanceDemandee && montantAvance ? ` [Avance caisse: ${Number(montantAvance).toLocaleString("fr-FR")} FCFA]` : "";
        motifFinal = `${motif.trim()} [ORDRE DE MISSION / INTERVENTION à ${calculMission.ville.nom}${clientPart}${transportPart}${villePart}${fraisPart}${avancePart}]`;
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
        destination: calculMission.ville.nom,
        moyenTransport: isIntervention ? undefined : calculMission.transport.libelle,
        clientProjet: isIntervention ? clientProjet.trim() : undefined,
        intituleIntervention: isIntervention ? intituleIntervention.trim() : undefined,
        tarifInterventionJour: isIntervention ? Number(tarifInterventionJour) : undefined,
        equipeIntervention: isIntervention ? equipeIntervention : undefined,
        fraisPrevisionnels: isIntervention ? fraisInterventionTotalGlobal : fraisPrevisionnelsEffectifs,
        categorieFrais: isIntervention ? undefined : categorieFraisMission,
        fraisHebergement: isIntervention ? fraisIntervention.hebergement : missionFrais.hebergement,
        fraisRestauration: isIntervention ? fraisIntervention.restauration : missionFrais.restauration,
        fraisDeplacement: isIntervention ? fraisIntervention.deplacement : missionFrais.deplacement,
        forfaitIntervention: isIntervention ? fraisIntervention.forfait || undefined : undefined,
        ordreDonneAId: motifActif.famille === "MISSIONS" && !isIntervention ? collaborateurMissionId : undefined,
      });

      router.push(
        univers === "MISSIONS"
          ? "/absences/missions/demandes"
          : univers === "CONGES"
            ? "/absences/demandes?univers=CONGES"
            : "/absences/demandes",
      );
    } catch (err: unknown) {
      console.error("[NouvelleDemandePage] Erreur:", err);
      alert(err instanceof Error ? err.message : "Erreur lors de la transmission de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── EN-TÊTE HARMONISÉ AVEC ACCENT ORANGE AGILLY ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A] shadow-xs" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isIntervention
                ? "Nouvelle Fiche d'Intervention Technique"
                : univers === "MISSIONS"
                ? "Nouvel Ordre de Mission"
                : univers === "CONGES"
                  ? `Nouvelle demande de ${familleActive === "PERMISSIONS" ? "permission" : "congé"}`
                  : "Nouvelle demande d'absence ou mission"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isIntervention
              ? "Déclarez l'équipe, le client, le site et les conditions de l'intervention."
              : univers === "MISSIONS"
              ? "Déplacement professionnel d'un collaborateur, calcul automatique du barème kilométrique et des frais."
              : "Formulaire officiel Agilly • Sélecteur par famille, décompte en temps réel et respect des règles légales."}
          </p>
        </div>

        <Link
          href={
            univers === "MISSIONS"
              ? "/absences/missions/demandes"
              : univers === "CONGES"
                ? "/absences/demandes?univers=CONGES"
                : "/absences/demandes"
          }
          className="text-xs font-bold text-slate-600 hover:text-[#C25E00] border border-slate-300 hover:border-[#F0822A] px-3.5 py-1.5 bg-white transition-all self-start sm:self-auto shadow-2xs"
        >
          {isIntervention ? "Suivi des interventions" : "← Retour à mes demandes"}
        </Link>
      </div>

      {/* ── ÉTAPE 1 : FAMILLE ACTIVE ── */}
      {univers !== "MISSIONS" ? (
      <div className="bg-white border border-slate-200 p-5 flex flex-col gap-3 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#C25E00] block">
          Famille de demande sélectionnée
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-orange-200 bg-orange-50/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wide text-[#C25E00]">
                {familleActive === "PERMISSIONS" ? "Permissions" : "Congés"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 font-bold bg-[#F0822A] text-white">
                {motifsFamille.length} motifs
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {familleActive === "PERMISSIONS"
                ? "Mariage, décès, naissance, rendez-vous et sorties autorisées."
                : "Congé annuel, arrêt maladie, maternité, paternité, sans solde ou formation."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const nouvelleFamille = familleActive === "PERMISSIONS" ? "CONGES" : "PERMISSIONS";
              const premierMotif = MOTIFS_CATALOGUE.find((motif) => motif.famille === nouvelleFamille);
              setFamilleActive(nouvelleFamille);
              if (premierMotif) setTypeDemande(premierMotif.id);
            }}
            className="shrink-0 border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:border-[#F0822A] hover:text-[#C25E00]"
          >
            Passer aux {familleActive === "PERMISSIONS" ? "congés" : "permissions"} →
          </button>
        </div>
      </div>
      ) : null}

      {/* ── ÉTAPE 2 : SÉLECTION DU MOTIF PRÉCIS ET FORMULAIRE DYNAMIQUE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne gauche (8 cols) : Saisie du dossier */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-5 text-xs shadow-2xs">
          {/* Menu déroulant du motif précis */}
          {univers !== "MISSIONS" ? (
          <div>
            <label htmlFor="select-motif" className="block text-slate-900 font-bold mb-1.5">
              Motif exact de l&apos;absence{" "}
              <span className="text-[#D96F1D]">*</span>
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
          </div>
          ) : null}

          {/* ── CAS PARTICULIER : PERMISSION DE SORTIE (EN HEURES) ── */}
          {motifActif.famille !== "MISSIONS" && (motifActif.isSortieHeures ? (
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
            /* ── CAS GÉNÉRAL : DATE DÉBUT ET DATE FIN (EN JOURS) ── */
            <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <span className="font-bold text-slate-900 text-xs pb-1 border-b border-slate-200">
                Période de l&apos;absence
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Du (inclus) *
                  </label>
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    Au (inclus) *
                  </label>
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
          ))}

          {/* ── CHAMPS COMPLÉMENTAIRES SELON LA MISSION (RÉFÉRENTIEL CI, TRANSPORTS & BUDGET) ── */}
          {isIntervention && (
            <div className="p-4 bg-white border border-slate-200 flex flex-col gap-5">
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                  <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-800">
                    1. Équipe d&apos;intervention / employés
                  </h2>
                  <span className="shrink-0 px-2 py-1 border border-orange-200 bg-orange-50 text-[10px] font-bold text-[#C25E00]">
                    {equipeIntervention.length} intervenant(s)
                  </span>
                </div>
                <div>
                  <label htmlFor="intervention-demandeur" className="block text-slate-700 font-semibold mb-1">
                    Collaborateur demandeur (connecté) *
                  </label>
                  <input
                    id="intervention-demandeur"
                    type="text"
                    value={`${currentPersona.prenom} ${currentPersona.nom}${currentPersona.poste ? ` (${currentPersona.poste})` : ""}`.trim()}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="intervenant-a-ajouter" className="block text-slate-700 font-semibold mb-1">
                    Ajouter des collaborateurs à l&apos;équipe d&apos;intervention *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      id="intervenant-a-ajouter"
                      value={intervenantSelectionId}
                      onChange={(event) => setIntervenantSelectionId(event.target.value)}
                      disabled={isLoadingCollaborateurs || Boolean(collaborateursError) || collaborateurs.length === 0}
                      className="min-w-0 flex-1 h-10 px-3 text-xs text-slate-900 bg-white border border-slate-300 disabled:bg-slate-100"
                    >
                      <option value="">Sélectionner un collaborateur</option>
                      {[...collaborateurs]
                        .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, "fr"))
                        .filter((collaborateur) => !equipeInterventionIds.includes(collaborateur.id))
                        .map((collaborateur) => (
                          <option key={collaborateur.id} value={collaborateur.id}>
                            {`${collaborateur.prenom} ${collaborateur.nom}`.trim()} — {collaborateur.poste || collaborateur.email}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!intervenantSelectionId || isLoadingCollaborateurs}
                      onClick={() => {
                        if (!intervenantSelectionId || equipeInterventionIds.includes(intervenantSelectionId)) return;
                        setEquipeInterventionIds((current) => [...current, intervenantSelectionId]);
                        setIntervenantSelectionId("");
                      }}
                      className="h-10 px-5 bg-[#F0822A] text-white text-xs font-bold disabled:bg-slate-300"
                    >
                      + Ajouter
                    </button>
                  </div>
                  {isLoadingCollaborateurs && (
                    <p className="mt-1 text-[11px] text-slate-500">Chargement de l&apos;annuaire…</p>
                  )}
                  {collaborateursError && (
                    <p role="alert" className="mt-1 text-[11px] text-red-700">{collaborateursError}</p>
                  )}
                  {!isLoadingCollaborateurs && !collaborateursError && collaborateurs.length === 0 && (
                    <p role="alert" className="mt-1 text-[11px] text-red-700">
                      Aucun collaborateur disponible dans l&apos;annuaire.
                    </p>
                  )}
                </div>
                {equipeIntervention.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {equipeIntervention.map((intervenant) => (
                      <li key={intervenant.id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 border border-slate-200">
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-800">{intervenant.nom}</span>
                          <span className="block truncate text-[10px] text-slate-500">{intervenant.poste || intervenant.email}</span>
                          {intervenant.categorieFrais ? (
                            <span className="block text-[10px] font-semibold text-purple-800">
                              Catégorie de frais : {MISSION_FEE_CATEGORY_LABELS[intervenant.categorieFrais]}
                            </span>
                          ) : (
                            <select
                              aria-label={`Catégorie de frais pour ${intervenant.nom}`}
                              value={equipeInterventionCategories[intervenant.id] || ""}
                              onChange={(event) =>
                                setEquipeInterventionCategories((current) => ({
                                  ...current,
                                  [intervenant.id]: event.target.value as MissionFeeCategory,
                                }))
                              }
                              className="mt-1 h-8 max-w-full border border-orange-300 bg-white px-2 text-[10px] text-slate-900"
                            >
                              <option value="">Choisir la catégorie de frais *</option>
                              {Object.entries(MISSION_FEE_CATEGORY_LABELS).map(([category, label]) => (
                                <option key={category} value={category}>{label}</option>
                              ))}
                            </select>
                          )}
                        </span>
                        <button
                          type="button"
                          aria-label={`Retirer ${intervenant.nom}`}
                          onClick={() => {
                            setEquipeInterventionIds((current) => current.filter((id) => id !== intervenant.id));
                            if (
                              !equipeIntervention.some(
                                (member) =>
                                  member.id !== intervenant.id &&
                                  member.categorieFrais === "AGENT_MAITRISE",
                              )
                            ) {
                              setForfaitSpecialInterventionActif(false);
                            }
                          }}
                          className="shrink-0 px-2 text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-slate-500">Ajoutez au moins un intervenant.</p>
                )}
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-800 border-b border-slate-200 pb-2">
                  2. Intitulé général de l&apos;intervention
                </h2>
                <div>
                  <label htmlFor="intervention-intitule" className="block text-slate-700 font-semibold mb-1">
                    Intitulé général de l&apos;intervention *
                  </label>
                  <input
                    id="intervention-intitule"
                    type="text"
                    value={intituleIntervention}
                    onChange={(event) => setIntituleIntervention(event.target.value)}
                    required
                    placeholder="Ex. Migration de serveurs et sécurisation du pare-feu"
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs"
                  />
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-800 border-b border-slate-200 pb-2">
                  3. Client, site &amp; période d&apos;intervention
                </h2>
                <div>
                  <label htmlFor="intervention-client" className="block text-slate-700 font-semibold mb-1">
                    Client / Établissement *
                  </label>
                  <input
                    id="intervention-client"
                    type="text"
                    value={clientProjet}
                    onChange={(event) => setClientProjet(event.target.value)}
                    required
                    placeholder="Ex. Banque Atlantique"
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="intervention-ville" className="block text-slate-700 font-semibold mb-1">
                    Lieu / Ville de l&apos;intervention *
                  </label>
                  <select
                    id="intervention-ville"
                    value={villeId}
                    onChange={(event) => setVilleId(event.target.value)}
                    required
                    className="w-full h-10 px-3 text-xs text-slate-900 bg-white border border-slate-300"
                  >
                    {VILLES_CI_CATALOGUE.map((ville) => (
                      <option key={ville.id} value={ville.id}>
                        {ville.nom} — {ville.districtOuRegion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="intervention-date-debut" className="block text-slate-700 font-semibold mb-1">
                      Date début *
                    </label>
                    <input
                      id="intervention-date-debut"
                      type="date"
                      value={dateDebut}
                      onChange={(event) => setDateDebut(event.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="intervention-date-fin" className="block text-slate-700 font-semibold mb-1">
                      Date fin *
                    </label>
                    <input
                      id="intervention-date-fin"
                      type="date"
                      min={dateDebut}
                      value={dateFin}
                      onChange={(event) => setDateFin(event.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-800 border-b border-slate-200 pb-2">
                  4. Description de l&apos;intervention
                </h2>
                <label htmlFor="intervention-description" className="block text-slate-700 font-semibold">
                  Description détaillée *
                </label>
                <textarea
                  id="intervention-description"
                  rows={4}
                  value={motif}
                  onChange={(event) => setMotif(event.target.value)}
                  required
                  placeholder="Décrivez les travaux ou opérations à réaliser sur le site."
                  className="w-full bg-white border border-slate-300 p-2.5 text-slate-900 text-xs"
                />
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-800 border-b border-slate-200 pb-2">
                  5. Conditions financières
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label htmlFor="intervention-tarif" className="block text-slate-700 font-semibold mb-1">
                      Tarif intervention (FCFA / jour) *
                    </label>
                    <input
                      id="intervention-tarif"
                      type="number"
                      min="1"
                      step="1000"
                      value={tarifInterventionJour}
                      onChange={(event) => setTarifInterventionJour(event.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div className="p-2 bg-orange-50 border border-orange-200">
                    <span className="block text-[10px] font-bold text-slate-600">Tarif intervention estimé</span>
                    <span className="block text-sm font-black text-[#C25E00]">
                      {fraisInterventionTotal.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-800 border-b border-slate-200 pb-2">
                  6. Notes de frais
                </h2>
                <p className="text-[11px] text-slate-600">
                  {interventionLocale
                    ? "Barème des interventions dans le Grand Abidjan et les villes environnantes."
                    : "Hors Grand Abidjan, le barème mission (hébergement et repas) s'applique; le transport est pris en charge par l'employeur."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {!interventionLocale && (
                    <div className="p-2 bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-600">Hébergement</span>
                      <span className="font-mono font-bold">{fraisIntervention.hebergement.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  )}
                  <div className="p-2 bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-600">Restauration</span>
                    <span className="font-mono font-bold">{fraisIntervention.restauration.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-600">
                      {interventionLocale ? "Déplacement (frais réels)" : "Transport pris en charge"}
                    </span>
                    {interventionLocale && hasTransportReelIntervention ? (
                      <input
                        aria-label="Frais réels de déplacement"
                        type="number"
                        min="0"
                        step="1000"
                        value={fraisDeplacementIntervention}
                        onChange={(event) => setFraisDeplacementIntervention(event.target.value)}
                        className="mt-1 w-full border border-slate-300 bg-white p-2 font-mono text-xs text-slate-900"
                      />
                    ) : (
                      <span className="font-mono font-bold">{fraisIntervention.deplacement.toLocaleString("fr-FR")} FCFA</span>
                    )}
                    {interventionLocale && !hasTransportReelIntervention && (
                      <span className="block text-[10px] text-slate-500">Non indiqué au barème pour cette équipe.</span>
                    )}
                  </div>
                </div>
                {hasAgentMaitrise && (
                  <div className="p-2 bg-amber-50 border border-amber-200">
                    <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={forfaitSpecialInterventionActif}
                        onChange={(event) => setForfaitSpecialInterventionActif(event.target.checked)}
                        className="accent-[#F0822A]"
                      />
                      Forfait Agent de maîtrise (intervention de nuit, week-end ou jour férié)
                    </label>
                    {forfaitSpecialInterventionActif && (
                      <div className="mt-2 flex items-center gap-2">
                        <label htmlFor="forfait-special-intervention" className="text-[10px] text-slate-600">
                          Montant manuel (10 000 à 15 000 FCFA)
                        </label>
                        <input
                          id="forfait-special-intervention"
                          type="number"
                          min="10000"
                          max="15000"
                          step="1000"
                          value={forfaitSpecialIntervention}
                          onChange={(event) => setForfaitSpecialIntervention(event.target.value)}
                          className="w-32 border border-amber-300 bg-white p-1.5 font-mono text-xs text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                  <span className="font-bold text-slate-700">Total notes de frais</span>
                  <span className="font-mono font-black text-slate-900">{fraisIntervention.total.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex items-center justify-between bg-orange-50 border border-orange-200 p-2 text-xs">
                  <span className="font-black text-slate-800">Total estimé (tarif + notes de frais)</span>
                  <span className="font-mono font-black text-[#C25E00]">{fraisInterventionTotalGlobal.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </section>
            </div>
          )}

          {/* ── PARAMÈTRES DE L'ORDRE DE MISSION ── */}
          {motifActif.famille === "MISSIONS" && !isIntervention && (
            <div className="p-4 bg-purple-50/50 border border-purple-200 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <span>💼</span> Paramètres de l&apos;Ordre de Mission
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200">
                  Temps de travail (0j déduit de vos congés)
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Numéro d&apos;Ordre de Mission
                  </label>
                  <input
                    type="text"
                    value="JPC/AAAA-XX — généré à la soumission"
                    readOnly
                    className="w-full bg-slate-100 border border-slate-300 p-2 text-slate-500 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="mission-collaborateur" className="block text-slate-700 font-semibold mb-1">
                    Ordre donné à
                  </label>
                  <select
                    id="mission-collaborateur"
                    value={collaborateurMissionId}
                    onChange={(event) => {
                      setCollaborateurSelectionId(event.target.value);
                      setCategorieFraisManuelle("");
                    }}
                    disabled={isLoadingCollaborateurs || Boolean(collaborateursError) || collaborateurs.length === 0}
                    required
                    className="w-full h-10 px-3 text-xs font-semibold text-slate-900 bg-white border border-slate-300 focus:border-purple-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">Sélectionner un collaborateur</option>
                    {[...collaborateurs]
                      .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, "fr"))
                      .map((collaborateur) => (
                        <option key={collaborateur.id} value={collaborateur.id}>
                          {`${collaborateur.prenom} ${collaborateur.nom}`.trim()} — {collaborateur.email}
                        </option>
                      ))}
                  </select>
                  {isLoadingCollaborateurs && (
                    <p className="mt-1 text-[11px] text-slate-500">Chargement de l&apos;annuaire…</p>
                  )}
                  {collaborateursError && (
                    <p role="alert" className="mt-1 text-[11px] text-red-700">{collaborateursError}</p>
                  )}
                  {!isLoadingCollaborateurs && !collaborateursError && collaborateurs.length === 0 && (
                    <p role="alert" className="mt-1 text-[11px] text-red-700">
                      Aucun collaborateur disponible dans l&apos;annuaire.
                    </p>
                  )}
                </div>
                <div className="rounded border border-purple-200 bg-white p-2.5">
                  {categorieFraisDetectee ? (
                    <p className="text-[11px] text-slate-700">
                      Catégorie déduite du poste <strong>{collaborateurMission?.poste || "—"}</strong> :{" "}
                      <strong>{MISSION_FEE_CATEGORY_LABELS[categorieFraisDetectee]}</strong>
                    </p>
                  ) : (
                    <>
                      <label htmlFor="mission-categorie-frais" className="block text-slate-700 font-semibold mb-1">
                        Catégorie de frais (poste non reconnu) *
                      </label>
                      <select
                        id="mission-categorie-frais"
                        value={categorieFraisManuelle}
                        onChange={(event) => setCategorieFraisManuelle(event.target.value as MissionFeeCategory | "")}
                        required
                        className="w-full h-9 px-2 text-xs text-slate-900 bg-white border border-slate-300"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {Object.entries(MISSION_FEE_CATEGORY_LABELS).map(([category, label]) => (
                          <option key={category} value={category}>{label}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
                <div>
                  <label htmlFor="objet-mission" className="block text-slate-700 font-semibold mb-1">
                    Objet de la mission <span className="text-[#D96F1D">*</span>
                  </label>
                  <input
                    id="objet-mission"
                    type="text"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Ex. Assistance technique"
                    required
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Projet ou client concerné */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Projet ou Client concerné
                </label>
                <input
                  type="text"
                  value={clientProjet}
                  onChange={(e) => setClientProjet(e.target.value)}
                  placeholder="Ex: Banque Atlantique, Projet ERP Agilly, Ministère de l'Économie, Maintenance..."
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none focus:border-purple-600 rounded-none"
                />
              </div>

              {/* Ligne 2 : Sélecteur de Ville (Toutes les villes de CI & International) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="select-ville-ci" className="text-slate-800 font-bold">
                    Lieu / Ville de destination <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Référentiel des villes de Côte d&apos;Ivoire & International
                  </span>
                </div>
                <div className="relative">
                  <select
                    id="select-ville-ci"
                    value={villeId}
                    onChange={(e) => setVilleId(e.target.value)}
                    className="w-full h-10 px-3 pr-8 text-xs font-bold text-slate-900 bg-white border border-slate-300 focus:border-purple-600 focus:outline-none cursor-pointer appearance-none rounded-none"
                  >
                    <optgroup label="📍 Grand Abidjan & Périphérie (< 50 km)">
                      {VILLES_CI_CATALOGUE.filter((v) => v.zone === "GRAND_ABIDJAN").map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nom} — {v.districtOuRegion} ({v.distanceKmDepuisAbidjan} km)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏛️ Intérieur Zone 1 : Centre & Sud-Est (50 à 250 km)">
                      {VILLES_CI_CATALOGUE.filter((v) => v.zone === "INTERIEUR_1").map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nom} — {v.districtOuRegion} ({v.distanceKmDepuisAbidjan} km)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌾 Intérieur Zone 2 : Pôles Économiques & Ouest (250 à 450 km)">
                      {VILLES_CI_CATALOGUE.filter((v) => v.zone === "INTERIEUR_2").map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nom} — {v.districtOuRegion} ({v.distanceKmDepuisAbidjan} km)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="⛰️ Intérieur Zone 3 : Grand Nord & Extrême Ouest (> 450 km)">
                      {VILLES_CI_CATALOGUE.filter((v) => v.zone === "INTERIEUR_3").map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nom} — {v.districtOuRegion} ({v.distanceKmDepuisAbidjan} km)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌍 Sous-Région CEDEAO / UEMOA">
                      {VILLES_CI_CATALOGUE.filter((v) => v.zone === "SOUS_REGION").map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nom} ({v.pays}) — {v.distanceKmDepuisAbidjan} km
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✈️ International Hors Afrique">
                      {VILLES_CI_CATALOGUE.filter((v) => v.zone === "INTERNATIONAL").map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nom} ({v.pays})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold">
                    ▼
                  </div>
                </div>

                {/* Badge d'informations géographiques & barème officiel */}
                <div className="mt-2 p-2.5 bg-white border border-purple-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-purple-950">
                      📍 {calculMission.ville.nom}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      • Distance : <strong>{calculMission.ville.distanceKmDepuisAbidjan} km</strong> ({calculMission.distanceKmAR} km A/R)
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      • Région : <strong>{calculMission.ville.districtOuRegion}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 border border-purple-200">
                      {categorieFraisMission
                        ? `Barème : ${MISSION_FEE_CATEGORY_LABELS[categorieFraisMission]}`
                        : "Catégorie de frais à sélectionner"}
                    </span>
                    {calculMission.ville.desserteAerienne && (
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-200">
                        ✈️ Desserte Air CI
                      </span>
                    )}
                    {calculMission.ville.desserteFerroviaire && (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 border border-emerald-200">
                        🚆 Axe SITARAIL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ligne 3 : Moyen de Transport Officiel */}
              <div>
                <label htmlFor="select-transport" className="block text-slate-800 font-bold mb-1">
                  Moyen de transport officiel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="select-transport"
                    value={transportCode}
                    onChange={(e) => setTransportCode(e.target.value)}
                    className="w-full h-10 px-3 pr-8 text-xs font-bold text-slate-900 bg-white border border-slate-300 focus:border-purple-600 focus:outline-none cursor-pointer appearance-none rounded-none"
                  >
                    {MOYENS_TRANSPORT_CATALOGUE.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.libelle} — {t.description}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {calculMission.transport.description}
                </p>
              </div>

              <div className="p-3 bg-white border border-purple-200 flex flex-col gap-3">
                <span className="font-bold text-slate-900 text-xs pb-1 border-b border-slate-200">
                  Période de la mission
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="mission-date-depart" className="block text-slate-700 font-semibold mb-1">
                      Date de départ *
                    </label>
                    <input
                      id="mission-date-depart"
                      type="date"
                      value={dateDebut}
                      onChange={(event) => setDateDebut(event.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="mission-date-retour" className="block text-slate-700 font-semibold mb-1">
                      Date de retour *
                    </label>
                    <input
                      id="mission-date-retour"
                      type="date"
                      value={dateFin}
                      onChange={(event) => setDateFin(event.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-700 pt-2 border-t border-slate-200 text-xs">
                  <span>Durée prévisionnelle :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {joursCalendaires} j calendaires ({joursOuvres} j ouvrés)
                  </span>
                </div>
              </div>

              {/* Ligne 4 : CALCULATEUR DYNAMIQUE EN TEMPS RÉEL DU COÛT DE LA MISSION */}
              <div className="bg-white border-2 border-purple-200 p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <span>⚡</span> Calcul automatique des frais prévisionnels
                  </span>
                  <span className="text-[11px] font-mono text-purple-700 font-bold">
                    {joursOuvres} jour(s) de mission
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  {/* Barème hébergement */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      1. Hébergement
                    </span>
                    <span className="font-mono text-sm font-black text-slate-900">
                      {missionFrais.hebergement.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {categorieFraisMission ? `${joursOuvres} j × ${BAREME_FRAIS_MISSION[categorieFraisMission].hebergement.toLocaleString("fr-FR")} FCFA/j` : "Catégorie requise"}
                    </span>
                  </div>

                  {/* Barème restauration */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      2. Repas
                    </span>
                    <span className="font-mono text-sm font-black text-slate-900">
                      {missionFrais.restauration.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {categorieFraisMission ? `${joursOuvres} j × ${BAREME_FRAIS_MISSION[categorieFraisMission].restauration.toLocaleString("fr-FR")} FCFA/j` : "Catégorie requise"}
                    </span>
                  </div>

                  {/* Carte transport */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      3. Transport employeur
                    </span>
                    <span className="font-mono text-sm font-black text-slate-900">
                      {missionFrais.deplacement.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 truncate" title={calculMission.transport.libelle}>
                      {calculMission.transport.libelle.split("(")[0]} ({calculMission.distanceKmAR} km A/R)
                    </span>
                  </div>

                  {/* Total prévisionnel */}
                  <div className="p-2.5 bg-gradient-to-br from-purple-100/70 to-orange-50 border-2 border-[#F0822A] flex flex-col justify-between">
                    <span className="text-[10px] font-black text-[#C25E00] uppercase block mb-1">
                      4. Total prévisionnel
                    </span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {fraisPrevisionnelsEffectifs.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 mt-1">
                      Transport à la charge de l&apos;employeur
                    </span>
                  </div>
                </div>

                {/* Option d'ajustement exceptionnel / manuel si dérogation */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 text-[11px]">
                    <input
                      type="checkbox"
                      checked={ajustementManuelFrais}
                      onChange={(e) => {
                        setAjustementManuelFrais(e.target.checked);
                        if (e.target.checked && !fraisPrevisionnelsManuels) {
                          setFraisPrevisionnelsManuels(String(missionFrais.total));
                        }
                      }}
                      className="accent-[#F0822A] rounded-none cursor-pointer"
                    />
                    <span>Ajustement exceptionnel du montant (sur accord préalable du responsable)</span>
                  </label>

                  {ajustementManuelFrais && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700">Montant dérogatoire :</span>
                      <input
                        type="number"
                        value={fraisPrevisionnelsManuels}
                        onChange={(e) => setFraisPrevisionnelsManuels(e.target.value)}
                        placeholder="Montant FCFA"
                        className="w-32 bg-white border border-[#F0822A] p-1.5 text-xs font-mono font-bold text-slate-900 outline-none rounded-none text-right"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600">FCFA</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ligne 5 : Demande d'avance de caisse / trésorerie */}
              <div className="pt-2 border-t border-purple-200">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={avanceDemandee}
                    onChange={(e) => {
                      const demanded = e.target.checked;
                      setAvanceDemandee(demanded);
                      if (demanded && !montantAvance) {
                        setMontantAvance(String(avanceSuggeree80));
                      }
                    }}
                    className="accent-purple-600 w-4 h-4 cursor-pointer rounded-none"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Solliciter une avance de trésorerie / décharge de caisse avant le départ
                  </span>
                </label>

                {avanceDemandee && (
                  <div className="pl-6 pt-2 bg-white p-3 border border-purple-200 flex flex-col gap-2 max-w-md">
                    <span className="text-[11px] text-slate-600 font-semibold block">
                      Montant de l&apos;avance demandée (FCFA) <span className="text-red-500">*</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={montantAvance}
                        onChange={(e) => setMontantAvance(e.target.value)}
                        placeholder="Ex: 75000"
                        className="w-full bg-white border border-purple-300 p-2 text-slate-900 font-mono text-xs focus:outline-none rounded-none"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600">FCFA</span>
                    </div>

                    {/* Raccourcis de suggestion 80% et 100% */}
                    <div className="flex items-center gap-2 pt-1 text-[10px]">
                      <span className="text-slate-400 font-medium">Suggestions :</span>
                      <button
                        type="button"
                        onClick={() => setMontantAvance(String(avanceSuggeree80))}
                        className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-mono font-bold border border-purple-200 transition-colors cursor-pointer"
                      >
                        80% ({avanceSuggeree80.toLocaleString("fr-FR")} FCFA)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMontantAvance(String(missionFrais.total))}
                        className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#C25E00] font-mono font-bold border border-orange-200 transition-colors cursor-pointer"
                      >
                        100% ({missionFrais.total.toLocaleString("fr-FR")} FCFA)
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Motif de la demande d'absence */}
          {motifActif.famille !== "MISSIONS" && (
            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Motif ou cadre de l&apos;absence <span className="text-[#D96F1D">*</span>
              </label>
              <textarea
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Expliquez la situation ou la justification de votre demande..."
                className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#D96F1D]"
              />
            </div>
          )}

          {/* ADRESSE / CONTACT PENDANT L'ABSENCE */}
          {motifActif.famille !== "MISSIONS" && (
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
          )}

          {/* PIÈCE JUSTIFICATIVE (UNIQUEMENT LORSQUE PERTINENT OU EXIGÉ PAR LA RÉGLEMENTATION - MASQUÉ POUR MISSIONS ET CONGÉS ANNUELS) */}
          {motifActif.famille !== "MISSIONS" && motifActif.id !== "CONGES_ANNUELS" && (motifActif.justificatifRequis || Boolean(motifActif.justificatifLabel)) && (
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

              {/* Liste des fichiers joints */}
              {fichiersList.length > 0 && (
                <div className="flex flex-col gap-2">
                  {fichiersList.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-200">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 shrink-0">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span className="text-xs font-bold text-slate-800 truncate">{f.nom}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">({f.taille})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-0.5 hover:bg-red-50 cursor-pointer"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Zone de clic douce pour importer */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-[#D96F1D] bg-white hover:bg-orange-50/50 p-4 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#D96F1D]">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className="text-xs font-bold text-slate-800">
                  Cliquez pour choisir un justificatif depuis votre ordinateur
                </span>
                <span className="text-[11px] text-slate-400">
                  Format PDF, scan ou photo acceptés
                </span>
              </button>
            </div>
          )}

          {/* ENGAGEMENT SUR L'HONNEUR */}
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

          {/* BOUTON D'ENVOI AVEC GRADIENT AGILLY ORANGE */}
          {!isIntervention && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={
                isSubmitting ||
                !engagementHonneur ||
                (motifActif.famille === "MISSIONS" &&
                  (isLoadingCollaborateurs ||
                    (!isIntervention && (!collaborateurMissionId || !categorieFraisMission))))
              }
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-black text-white shadow-md cursor-pointer transition-all ${
                isSubmitting || !engagementHonneur
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#F0822A] to-[#D96F1D] hover:from-[#D96F1D] hover:to-[#B95914] active:scale-[0.99] hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Transmission sécurisée en cours...</span>
                </>
              ) : (
                <span>Transmettre ma demande →</span>
              )}
            </button>
          </div>
          )}
        </div>

        {/* Colonne droite : Récapitulatif avec identité visuelle Agilly */}
        <div className="lg:col-span-4 bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-5 flex flex-col gap-4 sticky top-20 text-xs shadow-2xs">
          <div className="pb-3 border-b border-orange-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C25E00] block">
                {isIntervention ? "Aperçu de la demande d'intervention" : "Récapitulatif de ma demande"}
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                {isIntervention ? "Fiche d'intervention technique" : motifActif.titre}
              </h3>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0822A] shadow-xs" />
          </div>

          {/* Durée & Dates */}
          {!isIntervention && (
          <div className="p-3.5 bg-gradient-to-br from-orange-50/40 via-white to-slate-50 border border-orange-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Durée totale :</span>
              <span className="text-base font-black text-[#F0822A] font-mono">
                {motifActif.isSortieHeures ? dureeHeuresMinutes?.text : `${joursOuvres} jour(s) ouvré(s)`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-orange-200/60">
              <span className="text-slate-500 font-medium">Dates :</span>
              <span className="font-mono font-bold text-slate-800">
                {dateDebut} {dateFin && dateFin !== dateDebut ? `au ${dateFin}` : ""}
              </span>
            </div>
          </div>
          )}

          {/* 1. Solde Congés (Uniquement si congé déductible du solde) */}
          {motifActif.impactSolde && (
            <div className="p-3.5 bg-[#FFF9F5] border-2 border-orange-200 flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#C25E00] tracking-wide">
                  ⚖️ Solde de Congés Payés
                </span>
                <span className="text-[10px] font-bold text-[#F0822A] bg-orange-100 px-1.5 py-0.2 rounded-xs">
                  Temps réel
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Solde actuel disponible :</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">{soldeConges.joursRestants} jours</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-orange-200/80 font-bold">
                <span className="text-slate-800">Nouveau solde après cette demande :</span>
                <span className={`font-mono text-base ${soldeSuffisant ? "text-[#C25E00] font-black" : "text-red-700 font-black"}`}>
                  {soldeRestantApres} jours
                </span>
              </div>
              {!soldeSuffisant && (
                <div className="text-[10px] text-red-700 bg-red-50 p-2 border border-red-200 font-semibold mt-1">
                  Attention : votre solde est insuffisant pour couvrir cette durée.
                </div>
              )}
            </div>
          )}

          {/* 2. Permissions (Quota légal 10 jours - Solde annuel préservé) */}
          {motifActif.famille === "PERMISSIONS" && (
            <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-200 flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wide">
                  ⚖️ Quota Légal Conventionnel
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5">
                  Solde CP intact
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Impact sur vos congés payés :</span>
                <span className="font-bold text-emerald-700">0 jour déduit</span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-tight mt-0.5 m-0">
                Cette autorisation exceptionnelle relève du quota légal de 10 jours ouvrés avec maintien de salaire intégral.
              </p>
            </div>
          )}

          {isIntervention && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <div className="flex flex-col gap-2 text-[11px]">
                <div>
                  <span className="block text-slate-500">Équipe d&apos;intervention</span>
                  <span className="font-semibold text-slate-900">
                    {equipeIntervention.length > 0
                      ? equipeIntervention.map((member) => member.nom).join(", ")
                      : "Aucun intervenant ajouté"}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Client / Établissement</span>
                  <span className="font-semibold text-slate-900">{clientProjet || "À renseigner"}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Intitulé général</span>
                  <span className="font-semibold text-slate-900">{intituleIntervention || "À renseigner"}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Site</span>
                  <span className="font-semibold text-slate-900">{calculMission.ville.nom}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Période</span>
                  <span className="font-semibold text-slate-900">{dateDebut} au {dateFin}</span>
                  <span className="block text-[10px] text-slate-500">{joursOuvres} jour(s) ouvré(s)</span>
                </div>
                <div>
                  <span className="block text-slate-500">Description</span>
                  <span className="font-semibold text-slate-900 whitespace-pre-wrap">{motif || "À renseigner"}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-600">Tarif / jour</span>
                  <span className="font-mono font-bold text-slate-900">
                    {Number(tarifInterventionJour || 0).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Total estimé</span>
                  <span className="font-mono font-black text-[#C25E00]">
                    {fraisInterventionTotalGlobal.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={
                  isSubmitting ||
                  !engagementHonneur ||
                  isLoadingCollaborateurs ||
                  equipeIntervention.length === 0 ||
                  !equipeInterventionCategoriesCompletes ||
                  !intituleIntervention.trim() ||
                  !clientProjet.trim() ||
                  !motif.trim() ||
                  !dateDebut ||
                  !dateFin ||
                  dateFin < dateDebut ||
                  !Number.isFinite(Number(tarifInterventionJour)) ||
                  Number(tarifInterventionJour) < 1
                }
                onClick={handleSubmit}
                className="w-full px-3 py-2.5 bg-slate-900 text-white text-[11px] font-bold disabled:bg-slate-300"
              >
                {isSubmitting ? "Transmission en cours…" : "Transmettre la fiche d'intervention"}
              </button>
            </div>
          )}

          {/* 3. Missions & Déplacements (Impact Financier & ODM) */}
          {motifActif.famille === "MISSIONS" && !isIntervention && (
            <div className="p-3.5 bg-purple-50/80 border-2 border-purple-200 flex flex-col gap-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-950 tracking-wide">
                  💼 Budget & Ordre de Mission
                </span>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5">
                  Prise en charge Agilly
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Destination :</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px]" title={calculMission.ville.nom}>
                  {calculMission.ville.nom}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Moyen transport :</span>
                <span className="font-bold text-slate-800 text-[11px] truncate max-w-[170px]" title={calculMission.transport.libelle}>
                  {calculMission.transport.libelle.split("(")[0]}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-purple-200/60">
                <span className="text-slate-700 font-bold">Frais prévisionnels :</span>
                <span className="font-mono font-extrabold text-purple-950 text-sm">
                  {fraisPrevisionnelsEffectifs.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="text-[10px] text-purple-900 bg-white p-2 border border-purple-200 leading-tight flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>• Catégorie :</span>
                  <span className="font-bold">
                    {categorieFraisMission ? MISSION_FEE_CATEGORY_LABELS[categorieFraisMission] : "À sélectionner"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>• Hébergement :</span>
                  <span className="font-mono font-bold">{missionFrais.hebergement.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>• Repas :</span>
                  <span className="font-mono font-bold">{missionFrais.restauration.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>• Transport employeur ({calculMission.distanceKmAR} km A/R) :</span>
                  <span className="font-mono font-bold">{missionFrais.deplacement.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
              {avanceDemandee && montantAvance && (
                <div className="flex items-center justify-between text-xs text-purple-800 font-bold bg-purple-100/60 p-2 border border-purple-200">
                  <span>Avance sollicitée :</span>
                  <span className="font-mono">{Number(montantAvance).toLocaleString("fr-FR")} FCFA</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-purple-200 text-xs font-bold text-emerald-700">
                <span>Impact sur solde CP :</span>
                <span>0 jour déduit (Mission)</span>
              </div>
              <div className="text-[10px] text-purple-900 bg-purple-100/70 p-2 border border-purple-200 leading-tight">
                📄 Un <strong>Ordre de Mission (ODM)</strong> officiel signé par la Direction Générale sera délivré pour vos déplacements.
              </div>
            </div>
          )}

          {/* Circuit d'approbation contextuel */}
          {!isIntervention && (
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 flex flex-col gap-2 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-wide">
              Circuit de validation prévu
            </span>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-[#F0822A] text-white font-black flex items-center justify-center text-[10px] shadow-xs">1</span>
                <span className="font-bold text-slate-900">Avis Responsable N+1</span>
              </div>
              <div className="ml-2.5 h-2.5 border-l-2 border-orange-300" />
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">2</span>
                <span className="text-slate-700 font-medium">
                  {motifActif.famille === "MISSIONS" ? "Visa Budgétaire & Caisse (Finance / DAF)" : "Vérification Direction RH"}
                </span>
              </div>
              {!circuitCourt && (
                <>
                  <div className="ml-2.5 h-2.5 border-l-2 border-slate-200" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <span className="text-slate-700 font-medium">
                      {motifActif.famille === "MISSIONS" ? "Signature Ordre de Mission (DG)" : "Accord final de la Direction"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

