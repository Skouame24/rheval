// ============================================================
// app/absences/nouvelle/page.tsx
// Formulaire dynamique, intuitif et corporate de demande RH
// Structure en 3 familles d'absence sans aucun doublon :
//  1. Congés (décomptés en jours, solde annuel ou maintien)
//  2. Permissions (courte durée, événements légaux, sortie en heures)
//  3. Missions (activité pro, transport, frais)
// ============================================================

"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
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
  const [clientProjet, setClientProjet] = useState("");
  const [avanceDemandee, setAvanceDemandee] = useState(false);
  const [montantAvance, setMontantAvance] = useState("");

  // Motif & contact
  const [motif, setMotif] = useState("");
  const [adresseContact, setAdresseContact] = useState("");
  const [engagementHonneur, setEngagementHonneur] = useState(false);
  const [fichiers, setFichiers] = useState<string[]>([]);
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
      setFichiers((prev) => [...prev, ...newFiles.map((f) => f.nom)]);
    }
  };

  const removeFile = (idx: number) => {
    setFichiersList((prev) => prev.filter((_, i) => i !== idx));
    setFichiers((prev) => prev.filter((_, i) => i !== idx));
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
      } else if (motifActif.famille === "MISSIONS") {
        const clientPart = clientProjet ? ` [Client/Projet: ${clientProjet}]` : "";
        const avancePart = avanceDemandee && montantAvance ? ` [Avance demandée: ${Number(montantAvance).toLocaleString("fr-FR")} FCFA]` : "";
        motifFinal = `[MISSION à ${destination || "Site externe"}${moyenTransport ? ` via ${moyenTransport}` : ""}${clientPart}${avancePart}] ${motif}`;
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
      {/* ── EN-TÊTE HARMONISÉ AVEC ACCENT ORANGE AGILLY ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A] shadow-xs" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Nouvelle demande d&apos;absence ou mission
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulaire officiel Agilly • Sélecteur par famille, décompte en temps réel et respect des règles légales.
          </p>
        </div>

        <Link
          href="/absences/demandes"
          className="text-xs font-bold text-slate-600 hover:text-[#C25E00] border border-slate-300 hover:border-[#F0822A] px-3.5 py-1.5 bg-white transition-all self-start sm:self-auto shadow-2xs"
        >
          &larr; Retour à mes demandes
        </Link>
      </div>

      {/* ── ÉTAPE 1 : SÉLECTEUR DE GRANDE FAMILLE (3 ONGLETS AVEC IDENTITÉ AGILLY ORANGE) ── */}
      <div className="bg-white border border-slate-200 p-5 flex flex-col gap-3 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#C25E00] block">
          Étape 1 : Choisissez la nature de votre demande
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFamilleActive("CONGES")}
            className={`p-4 text-left cursor-pointer transition-all border ${
              familleActive === "CONGES"
                ? "bg-gradient-to-b from-[#FFF7ED] to-white border-2 border-[#F0822A] shadow-sm"
                : "bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-black uppercase tracking-wide ${familleActive === "CONGES" ? "text-[#C25E00]" : "text-slate-800"}`}>
                1. Congés
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 font-bold ${familleActive === "CONGES" ? "bg-[#F0822A] text-white shadow-2xs" : "bg-slate-100 text-slate-600"}`}>
                6 motifs {familleActive === "CONGES" && "✓"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Congé annuel payé, maladie, maternité, paternité, sans solde, formation.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFamilleActive("PERMISSIONS")}
            className={`p-4 text-left cursor-pointer transition-all border ${
              familleActive === "PERMISSIONS"
                ? "bg-gradient-to-b from-[#FFF7ED] to-white border-2 border-[#F0822A] shadow-sm"
                : "bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-black uppercase tracking-wide ${familleActive === "PERMISSIONS" ? "text-[#C25E00]" : "text-slate-800"}`}>
                2. Permissions
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 font-bold ${familleActive === "PERMISSIONS" ? "bg-[#F0822A] text-white shadow-2xs" : "bg-slate-100 text-slate-600"}`}>
                9 motifs {familleActive === "PERMISSIONS" && "✓"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Mariage, décès, naissance, médical, démarches, urgence, sortie en heures.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFamilleActive("MISSIONS")}
            className={`p-4 text-left cursor-pointer transition-all border ${
              familleActive === "MISSIONS"
                ? "bg-gradient-to-b from-[#FFF7ED] to-white border-2 border-[#F0822A] shadow-sm"
                : "bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-black uppercase tracking-wide ${familleActive === "MISSIONS" ? "text-[#C25E00]" : "text-slate-800"}`}>
                3. Missions
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 font-bold ${familleActive === "MISSIONS" ? "bg-[#F0822A] text-white shadow-2xs" : "bg-slate-100 text-slate-600"}`}>
                2 motifs {familleActive === "MISSIONS" && "✓"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Ordre de mission pro, déplacements externes et interventions techniques.
            </p>
          </button>
        </div>
      </div>

      {/* ── ÉTAPE 2 : SÉLECTION DU MOTIF PRÉCIS ET FORMULAIRE DYNAMIQUE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne gauche (8 cols) : Saisie du dossier */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-5 text-xs shadow-2xs">
          {/* Identité du demandeur avec bandeau Agilly */}
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

          {/* ── CHAMPS COMPLÉMENTAIRES SELON LA MISSION (IMPACT FINANCIER & PROJETS) ── */}
          {motifActif.famille === "MISSIONS" && (
            <div className="p-4 bg-purple-50/60 border border-purple-200 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <span>💼</span> Paramètres de mission & Engagement financier
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200">
                  Temps de travail (0j déduit de vos congés)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client ou Projet concerné</label>
                  <input
                    type="text"
                    value={clientProjet}
                    onChange={(e) => setClientProjet(e.target.value)}
                    placeholder="Ex: Projet Digital, Banque Atlantique, Interne Agilly..."
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ville / Pays de destination <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: San Pedro, Bouaké, Dakar..."
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Moyen de transport</label>
                  <input
                    type="text"
                    value={moyenTransport}
                    onChange={(e) => setMoyenTransport(e.target.value)}
                    placeholder="Ex: Véhicule de service, Avion, Car..."
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Frais prévisionnels totaux (FCFA)</label>
                  <input
                    type="number"
                    value={fraisPrevisionnels}
                    onChange={(e) => setFraisPrevisionnels(e.target.value)}
                    placeholder="Ex: 150000"
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Demande d'avance de caisse */}
              <div className="pt-2 border-t border-purple-200">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={avanceDemandee}
                    onChange={(e) => setAvanceDemandee(e.target.checked)}
                    className="accent-purple-600 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Solliciter une avance de trésorerie / décharge de caisse avant le départ
                  </span>
                </label>

                {avanceDemandee && (
                  <div className="pl-6 pt-1 max-w-xs">
                    <label className="block text-[11px] text-slate-600 mb-1 font-semibold">
                      Montant de l&apos;avance demandée (FCFA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={montantAvance}
                      onChange={(e) => setMontantAvance(e.target.value)}
                      placeholder="Ex: 75000"
                      className="w-full bg-white border border-purple-300 p-2 text-slate-900 font-mono text-xs focus:outline-none"
                    />
                  </div>
                )}
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

          {/* PIÈCE JUSTIFICATIVE (FACULTATIF) */}
          <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Pièce justificative {motifActif.justificatifRequis ? "(Obligatoire)" : "(Facultatif)"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {motifActif.justificatifLabel || "Certificat médical, convocation, billet, etc."}
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
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isSubmitting || !engagementHonneur}
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
        </div>

        {/* Colonne droite : Récapitulatif avec identité visuelle Agilly */}
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0822A] shadow-xs" />
          </div>

          {/* Durée & Dates */}
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

          {/* 3. Missions & Déplacements (Impact Financier & ODM) */}
          {motifActif.famille === "MISSIONS" && (
            <div className="p-3.5 bg-purple-50/80 border-2 border-purple-200 flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-950 tracking-wide">
                  💼 Impact Financier & Déplacement
                </span>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5">
                  Prise en charge Agilly
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Frais prévisionnels :</span>
                <span className="font-mono font-extrabold text-purple-950 text-sm">
                  {fraisPrevisionnels ? `${Number(fraisPrevisionnels).toLocaleString("fr-FR")} FCFA` : "Non spécifiés"}
                </span>
              </div>
              {avanceDemandee && montantAvance && (
                <div className="flex items-center justify-between text-xs text-purple-800 font-bold">
                  <span>Avance de caisse demandée :</span>
                  <span className="font-mono">{Number(montantAvance).toLocaleString("fr-FR")} FCFA</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-purple-200 text-xs font-bold text-emerald-700">
                <span>Impact sur votre solde CP :</span>
                <span>0 jour déduit (Temps de travail)</span>
              </div>
              <div className="text-[10px] text-purple-900 bg-purple-100/70 p-2 border border-purple-200 leading-tight mt-1">
                📄 Un <strong>Ordre de Mission (ODM)</strong> officiel signé par la Direction Générale sera délivré pour vos déplacements.
              </div>
            </div>
          )}

          {/* Circuit d'approbation contextuel */}
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
