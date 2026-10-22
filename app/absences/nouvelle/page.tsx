// ============================================================
// app/absences/nouvelle/page.tsx
// Formulaire dynamique, intuitif et corporate de demande RH
// Structure en 3 familles d'absence sans aucun doublon :
//  1. Congés (décomptés en jours, solde annuel ou maintien)
//  2. Permissions (courte durée, événements légaux, sortie en heures)
//  3. Missions (activité pro, transport, frais)
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { TypeDemandeRH, FamilleDemandeRH } from "@/types/absences.types";

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
    titre: "Ordre de mission & déplacement",
    sousTitre: "Mission professionnelle externe, voyage client ou formation externe",
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

function NouvelleDemandeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPersona, soldeConges, addDemande } = useAbsences();

  // Famille active
  const [familleActive, setFamilleActive] = useState<FamilleDemandeRH>("CONGES");

  // Synchronisation avec query param optionnel
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      const found = MOTIFS_CATALOGUE.find((m) => m.id === typeParam);
      if (found) {
        setFamilleActive(found.famille);
        setTypeDemande(found.id);
      }
    }
  }, [searchParams]);

  // Motifs filtrés selon la famille
  const motifsFamille = useMemo(() => {
    return MOTIFS_CATALOGUE.filter((m) => m.famille === familleActive);
  }, [familleActive]);

  // Motif précis sélectionné
  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGES_ANNUELS");

  // Assurer que le motif correspond à la famille active
  useEffect(() => {
    if (!motifsFamille.some((m) => m.id === typeDemande)) {
      if (motifsFamille[0]) {
        setTypeDemande(motifsFamille[0].id);
      }
    }
  }, [familleActive, motifsFamille, typeDemande]);

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

  // Champs de période universels
  const [dateDebut, setDateDebut] = useState<string>(defaultDates.debut);
  const [dateFin, setDateFin] = useState<string>(defaultDates.fin);
  const [estDemiJourneeDebut, setEstDemiJourneeDebut] = useState(false);
  const [estDemiJourneeFin, setEstDemiJourneeFin] = useState(false);

  // Champs spécifiques sortie en heures
  const [heureDebut, setHeureDebut] = useState("10:00");
  const [heureFin, setHeureFin] = useState("12:30");

  // Champs spécifiques mission
  const [destination, setDestination] = useState("");
  const [moyenTransport, setMoyenTransport] = useState("");
  const [fraisPrevisionnels, setFraisPrevisionnels] = useState("");

  // Motif & contact
  const [motif, setMotif] = useState("");
  const [adresseContact, setAdresseContact] = useState("");
  const [engagementHonneur, setEngagementHonneur] = useState(false);
  const [fichiers, setFichiers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
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
      } else if (motifActif.famille === "MISSIONS" && destination) {
        motifFinal = `[MISSION à ${destination}${moyenTransport ? ` via ${moyenTransport}` : ""}] ${motif}`;
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
        destination: destination || undefined,
        moyenTransport: moyenTransport || undefined,
        fraisPrevisionnels: fraisPrevisionnels ? Number(fraisPrevisionnels) : undefined,
      });

      router.push("/absences/demandes");
    } catch (err: any) {
      console.error("[NouvelleDemandePage] Erreur:", err);
      alert(err?.message || "Erreur lors de la transmission de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── EN-TÊTE HARMONISÉ ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D96F1D]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Nouvelle demande d&apos;absence ou mission
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulaire guidé Agilly • Sélecteur par famille, décompte en temps réel et respect des règles légales.
          </p>
        </div>

        <Link
          href="/absences/demandes"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 bg-white transition-colors self-start sm:self-auto"
        >
          &larr; Retour à mes demandes
        </Link>
      </div>

      {/* ── ÉTAPE 1 : SÉLECTEUR DE GRANDE FAMILLE (3 ONGLETS NETS) ── */}
      <div className="bg-white border border-slate-200 p-5 flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
          Étape 1 : Choisissez la nature de votre demande
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFamilleActive("CONGES")}
            className={`p-4 border text-left cursor-pointer transition-all ${
              familleActive === "CONGES"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wide">1. Congés</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 ${familleActive === "CONGES" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"}`}>
                6 motifs
              </span>
            </div>
            <p className={`text-[11px] leading-tight ${familleActive === "CONGES" ? "text-slate-300" : "text-slate-500"}`}>
              Congé annuel payé, maladie, maternité, paternité, sans solde, formation.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFamilleActive("PERMISSIONS")}
            className={`p-4 border text-left cursor-pointer transition-all ${
              familleActive === "PERMISSIONS"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wide">2. Permissions</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 ${familleActive === "PERMISSIONS" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"}`}>
                9 motifs
              </span>
            </div>
            <p className={`text-[11px] leading-tight ${familleActive === "PERMISSIONS" ? "text-slate-300" : "text-slate-500"}`}>
              Mariage, décès, naissance, médical, démarches, urgence, sortie en heures.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFamilleActive("MISSIONS")}
            className={`p-4 border text-left cursor-pointer transition-all ${
              familleActive === "MISSIONS"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wide">3. Missions</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 ${familleActive === "MISSIONS" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"}`}>
                2 motifs
              </span>
            </div>
            <p className={`text-[11px] leading-tight ${familleActive === "MISSIONS" ? "text-slate-300" : "text-slate-500"}`}>
              Ordre de mission pro, déplacements externes et interventions techniques.
            </p>
          </button>
        </div>
      </div>

      {/* ── ÉTAPE 2 : SÉLECTION DU MOTIF PRÉCIS ET FORMULAIRE DYNAMIQUE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne gauche (8 cols) : Saisie du dossier */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-5 text-xs">
          {/* Identité du demandeur */}
          <div className="p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Demandeur</span>
              <span className="font-bold text-slate-900">{currentPersona.prenom} {currentPersona.nom}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Matricule</span>
              <span className="font-mono font-bold text-slate-900">{currentPersona.matricule}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Fonction</span>
              <span className="text-slate-800 font-medium">{currentPersona.poste}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Département</span>
              <span className="text-slate-800 font-medium">{currentPersona.departement}</span>
            </div>
          </div>

          {/* Menu déroulant du motif précis */}
          <div>
            <label htmlFor="select-motif" className="block text-slate-900 font-bold mb-1.5">
              Motif exact de l&apos;absence <span className="text-[#D96F1D]">*</span>
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

            {/* Note explicative du motif actif */}
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

          {/* ── CAS PARTICULIER : PERMISSION DE SORTIE (EN HEURES) ── */}
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
            /* ── CAS GÉNÉRAL : DATE DÉBUT ET DATE FIN (EN JOURS) ── */
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

          {/* ── CHAMPS COMPLÉMENTAIRES SELON LA MISSION ── */}
          {motifActif.famille === "MISSIONS" && (
            <div className="p-4 bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ville / Destination *</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: San Pedro, Bouaké..."
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Moyen de transport</label>
                <input
                  type="text"
                  value={moyenTransport}
                  onChange={(e) => setMoyenTransport(e.target.value)}
                  placeholder="Ex: Véhicule de service, Avion..."
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Frais estimés (FCFA)</label>
                <input
                  type="text"
                  value={fraisPrevisionnels}
                  onChange={(e) => setFraisPrevisionnels(e.target.value)}
                  placeholder="Ex: 100000"
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* MOTIF DE LA DEMANDE */}
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Motif ou cadre de l&apos;absence <span className="text-[#D96F1D]">*</span>
            </label>
            <textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la situation ou la justification de votre demande..."
              className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#D96F1D]"
            />
          </div>

          {/* ADRESSE / CONTACT PENDANT L'ABSENCE */}
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

          {/* JUSTIFICATIF (SI REQUIS OU CONSEILLÉ) */}
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Pièce justificative {motifActif.justificatifRequis ? "(Obligatoire)" : "(Facultatif)"}
              </span>
              {motifActif.justificatifLabel && (
                <span className="text-[10px] text-amber-800 font-medium">
                  {motifActif.justificatifLabel}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {fichiers.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200">
                  <span className="font-mono text-slate-800">{f}</span>
                  <button
                    type="button"
                    onClick={() => setFichiers((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-600 hover:text-red-900 font-bold"
                  >
                    Retirer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const n = prompt("Nom du fichier justificatif à attacher (ex: Certificat.pdf) :");
                  if (n) setFichiers((prev) => [...prev, n]);
                }}
                className="self-start text-[11px] font-bold text-[#D96F1D] hover:underline"
              >
                + Joindre un document justificatif (PDF, JPEG)
              </button>
            </div>
          </div>

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

          {/* BOUTON D'ENVOI */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isSubmitting || !engagementHonneur}
              onClick={handleSubmit}
              className={`px-6 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer transition-colors ${
                isSubmitting || !engagementHonneur
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-[#D96F1D] hover:bg-[#B95914]"
              }`}
            >
              {isSubmitting ? "Transmission en cours..." : "Soumettre la demande &rarr;"}
            </button>
          </div>
        </div>

        {/* Colonne droite (4 cols) : Synthèse dynamique en direct */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 flex flex-col gap-4 sticky top-20 text-xs">
          <div className="pb-2 border-b border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Contrôle dynamique en temps réel
            </span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">
              {motifActif.titre}
            </h3>
          </div>

          {/* Jauge Solde si congé annuel */}
          {motifActif.impactSolde && (
            <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Solde Congés Payés
              </span>
              <div className="flex items-center justify-between">
                <span>Solde actuel :</span>
                <span className="font-mono font-bold text-slate-900">{soldeConges.joursRestants} j</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Déduction demandée :</span>
                <span className="font-mono font-bold text-[#D96F1D]">- {joursOuvres} j</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                <span>Nouveau solde prévu :</span>
                <span className={`font-mono ${soldeSuffisant ? "text-emerald-700" : "text-red-700 font-extrabold"}`}>
                  {soldeRestantApres} j
                </span>
              </div>
              {!soldeSuffisant && (
                <div className="text-[10px] text-red-700 bg-red-50 p-1.5 border border-red-200 font-semibold mt-1">
                  Solde insuffisant pour couvrir cette durée.
                </div>
              )}
            </div>
          )}

          {/* Résumé de durée */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-500">
              Durée calculée
            </span>
            {motifActif.isSortieHeures ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Absence autorisée :</span>
                <span className="font-mono font-bold text-slate-900">{dureeHeuresMinutes?.text}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Durée ouvrée :</span>
                <span className="font-mono font-bold text-slate-900">{joursOuvres} jour(s)</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              <span>Impact solde annuel :</span>
              <span className="font-semibold">{motifActif.impactSolde ? "Décompté" : "Non décompté (0j)"}</span>
            </div>
          </div>

          {/* Circuit de décision */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">
              Circuit de décision
            </span>
            <p className="font-semibold text-slate-800 text-[11px]">
              {circuitCourt
                ? "Circuit court : Validation directe Supérieur N+1 & Notification DRH"
                : "Circuit standard : Supérieur N+1 &rarr; Contrôle DRH &rarr; Direction"}
            </p>
          </div>
        </div>
      </div>
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
