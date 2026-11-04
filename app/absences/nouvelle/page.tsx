// ============================================================
// app/absences/nouvelle/page.tsx
// Parcours direct et étanche pour les demandes RH
// - Écran de sélection initial clair (4 choix bien séparés)
// - Dès qu'un choix est cliqué : affichage DIRECT du formulaire concerné
//   (AUCUNE autre carte ni onglet persistant ne reste visible au-dessus)
// ============================================================

"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { TypeDemandeRH, FamilleDemandeRH } from "@/types/absences.types";

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

  // ── 2. PERMISSIONS D'ABSENCE ──
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

  // "CONGES" ou "PERMISSIONS" uniquement — direct, sans écran intermédiaire
  const [familleActive, setFamilleActive] = useState<"CONGES" | "PERMISSIONS">("CONGES");
  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGES_ANNUELS");

  useEffect(() => {
    const typeParam = searchParams.get("type");
    const familleParam = searchParams.get("famille");

    if (typeParam === "MISSION_DEPLACEMENT") {
      router.replace("/absences/missions/nouvelle");
      return;
    }
    if (typeParam === "INTERVENTION_TERRAIN") {
      router.replace("/absences/interventions/nouvelle");
      return;
    }

    if (typeParam) {
      const found = MOTIFS_CATALOGUE.find((m) => m.id === typeParam);
      if (found) {
        setFamilleActive(found.famille === "PERMISSIONS" ? "PERMISSIONS" : "CONGES");
        setTypeDemande(found.id);
        return;
      }
    }

    if (familleParam === "PERMISSIONS") {
      setFamilleActive("PERMISSIONS");
      setTypeDemande("PERMISSION_MARIAGE");
    } else {
      setFamilleActive("CONGES");
      setTypeDemande("CONGES_ANNUELS");
    }
  }, [searchParams, router]);

  const motifsFamille = useMemo(() => {
    return MOTIFS_CATALOGUE.filter((m) => m.famille === familleActive);
  }, [familleActive]);

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

      router.push("/absences/demandes");
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la transmission de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFrShort = (d: string) => {
    if (!d) return "-";
    const parts = d.split("T")[0].split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  // ══════════════════════════════════════════════════════════════
  // FORMULAIRE DIRECT CONGÉS & PERMISSIONS (ZÉRO ÉCRAN INTERMÉDIAIRE)
  // ══════════════════════════════════════════════════════════════
  const isConge = familleActive === "CONGES";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── EN-TÊTE DIRECT CONGÉ OU PERMISSION ── */}
      <div className={`bg-white border border-slate-200 border-t-4 ${isConge ? "border-t-blue-600" : "border-t-indigo-600"} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 ${isConge ? "bg-blue-600" : "bg-indigo-600"}`} />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isConge ? "Demande de Congé Payé ou Statut Légal" : "Demande de Permission d'Absence Exceptionnelle"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isConge
              ? "Formulaire officiel de pose de vos congés annuels, arrêts de travail ou congés légaux conventionnés."
              : "Formulaire officiel pour autorisations d'absence exceptionnelles (mariage, naissance, obsèques, rendez-vous médical, sortie en heures)."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bascule rapide entre Congé et Permission */}
          <div className="flex items-center border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => {
                setFamilleActive("CONGES");
                setTypeDemande("CONGES_ANNUELS");
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isConge
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1. Congés (6)
            </button>
            <button
              type="button"
              onClick={() => {
                setFamilleActive("PERMISSIONS");
                setTypeDemande("PERMISSION_MARIAGE");
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                !isConge
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2. Permissions (9)
            </button>
          </div>

          <Link
            href="/absences/demandes"
            className="text-xs font-bold text-slate-600 hover:text-blue-700 border border-slate-300 hover:border-blue-600 px-3.5 py-1.5 bg-white transition-all shadow-2xs whitespace-nowrap"
          >
            &larr; Mes demandes
          </Link>
        </div>
      </div>

      {/* ── FORMULAIRE DIRECT PROPRE (PLEINE PAGE, SANS ENCOMBREMENT) ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-5 text-xs shadow-2xs">
          {/* Identité du demandeur */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Demandeur</span>
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

          {/* Motif précis sélectionné */}
          <div>
            <label htmlFor="select-motif" className="block text-slate-900 font-bold mb-1.5">
              Motif exact de votre {isConge ? "congé" : "permission"} <span className={isConge ? "text-blue-600" : "text-indigo-600"}>*</span>
            </label>
            <div className="relative">
              <select
                id="select-motif"
                value={typeDemande}
                onChange={(e) => setTypeDemande(e.target.value as TypeDemandeRH)}
                className="w-full h-10 px-3 pr-8 text-xs font-bold text-slate-900 bg-white border border-slate-300 focus:border-blue-600 focus:outline-none cursor-pointer appearance-none rounded-none"
              >
                {motifsFamille.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titre} &mdash; {m.sousTitre}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold">
                &#9660;
              </div>
            </div>

            {/* Fiche d'information sur le motif actif */}
            <div className="mt-2.5 p-3 bg-slate-50 border-l-3 border-l-blue-600 border border-slate-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{motifActif.titre}</span>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 border border-slate-200 text-slate-700">
                  {motifActif.badgeLegal}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 m-0">{motifActif.decompteLabel}</p>
            </div>
          </div>

          {/* Période / Dates */}
          {!motifActif.isSortieHeures ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-debut" className="block text-slate-900 font-bold mb-1">
                  Date de début <span className="text-blue-600">*</span>
                </label>
                <input
                  id="date-debut"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 focus:border-blue-600 focus:outline-none rounded-none font-medium"
                  required
                />
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={estDemiJourneeDebut}
                    onChange={(e) => setEstDemiJourneeDebut(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Commence à la mi-journée (après-midi)</span>
                </label>
              </div>

              <div>
                <label htmlFor="date-fin" className="block text-slate-900 font-bold mb-1">
                  Date de fin incluse <span className="text-blue-600">*</span>
                </label>
                <input
                  id="date-fin"
                  type="date"
                  value={dateFin}
                  min={dateDebut}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 focus:border-blue-600 focus:outline-none rounded-none font-medium"
                  required
                />
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={estDemiJourneeFin}
                    onChange={(e) => setEstDemiJourneeFin(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Se termine à la mi-journée (matin)</span>
                </label>
              </div>
            </div>
          ) : (
            /* Cas spécial : Sortie ponctuelle en heures */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date-sortie" className="block text-slate-900 font-bold mb-1">
                  Date de la sortie <span className="text-blue-600">*</span>
                </label>
                <input
                  id="date-sortie"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => {
                    setDateDebut(e.target.value);
                    setDateFin(e.target.value);
                  }}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 focus:border-blue-600 focus:outline-none rounded-none font-medium"
                  required
                />
              </div>
              <div>
                <label htmlFor="heure-depart" className="block text-slate-900 font-bold mb-1">
                  Heure de départ prévue <span className="text-blue-600">*</span>
                </label>
                <input
                  id="heure-depart"
                  type="time"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 focus:border-blue-600 focus:outline-none rounded-none font-medium"
                  required
                />
              </div>
              <div>
                <label htmlFor="heure-retour" className="block text-slate-900 font-bold mb-1">
                  Heure de retour prévue <span className="text-blue-600">*</span>
                </label>
                <input
                  id="heure-retour"
                  type="time"
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 focus:border-blue-600 focus:outline-none rounded-none font-medium"
                  required
                />
              </div>
            </div>
          )}

          {/* Motif explicite */}
          <div>
            <label htmlFor="motif-detail" className="block text-slate-900 font-bold mb-1">
              Motif explicite et précisions <span className="text-blue-600">*</span>
            </label>
            <textarea
              id="motif-detail"
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Explicitez les raisons précises de votre demande à destination de votre responsable hiérarchique..."
              className="w-full p-3 text-xs bg-white border border-slate-300 focus:border-blue-600 focus:outline-none rounded-none font-medium leading-relaxed"
              required
            />
          </div>

          {/* Adresse & contact */}
          <div>
            <label htmlFor="contact-urgence" className="block text-slate-900 font-bold mb-1">
              Contact ou adresse d&apos;urgence pendant l&apos;absence
            </label>
            <input
              id="contact-urgence"
              type="text"
              value={adresseContact}
              onChange={(e) => setAdresseContact(e.target.value)}
              placeholder="Numéro de téléphone d'urgence ou ville de séjour..."
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 focus:border-blue-600 focus:outline-none rounded-none font-medium"
            />
          </div>

          {/* Pièces justificatives */}
          <div className="border border-slate-200 p-4 bg-slate-50 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                Pièce justificative {motifActif.justificatifRequis && <span className="text-red-600 font-bold">* Obligatoire</span>}
              </span>
              <span className="text-[10px] text-slate-500">PDF, JPG, PNG &bull; max 5 Mo</span>
            </div>

            {motifActif.justificatifLabel && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 font-medium m-0">
                {motifActif.justificatifLabel}
              </p>
            )}

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 text-xs transition-colors cursor-pointer"
              >
                + Joindre un document justificatif
              </button>
            </div>

            {fichiersList.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {fichiersList.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200 text-[11px]">
                    <span className="font-mono text-slate-800 truncate">{f.nom} ({f.taille})</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-red-600 hover:text-red-800 font-bold cursor-pointer ml-2"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engagement sur l'honneur */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={engagementHonneur}
                onChange={(e) => setEngagementHonneur(e.target.checked)}
                className="accent-blue-600 mt-0.5"
                required
              />
              <span className="text-[11px] text-slate-700 leading-snug">
                Je certifie sur l&apos;honneur l&apos;exactitude des informations fournies et m&apos;engage à transmettre les justificatifs originaux requis auprès des Ressources Humaines dès mon retour.
              </span>
            </label>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/absences")}
              className="text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
            >
              Annuler et retour
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (motifActif.impactSolde && !soldeSuffisant)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 px-6 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Transmission en cours..." : "Transmettre pour validation N+1 \u2192"}
            </button>
          </div>
        </div>

        {/* ── COLONNE DE RÉCAPITULATIF & SOLDE ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 p-5 shadow-2xs flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Récapitulatif de la demande
            </span>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Nature :</span>
                <span className="font-bold text-slate-900">{motifActif.titre}</span>
              </div>

              {!motifActif.isSortieHeures ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Période :</span>
                    <span className="font-mono text-slate-800 text-[11px]">
                      {formatFrShort(dateDebut)} &rarr; {formatFrShort(dateFin)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Durée ouvrée :</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {joursOuvres} jour{joursOuvres > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Durée calendaire :</span>
                    <span className="font-mono text-slate-600 text-xs">
                      {joursCalendaires} jour{joursCalendaires > 1 ? "s" : ""}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Date sortie :</span>
                    <span className="font-mono text-slate-800 text-xs">{formatFrShort(dateDebut)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Plage horaire :</span>
                    <span className="font-mono text-slate-800 text-xs">{heureDebut} &agrave; {heureFin}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Durée estimée :</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {dureeHeuresMinutes?.text}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bloc d'impact sur le Solde CP */}
          {motifActif.impactSolde ? (
            <div className="p-4 bg-orange-50/70 border border-orange-200 flex flex-col gap-2">
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
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-900">
                Solde de Congés Payés Préservé
              </span>
              <span className="text-xs font-bold text-emerald-700">
                0 jour déduit de votre solde annuel
              </span>
            </div>
          )}

          {/* Workflow prévu */}
          <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-slate-600">
              Circuit de validation prévu
            </span>
            <div className="flex flex-col gap-1.5 mt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white font-black flex items-center justify-center text-[10px]">1</span>
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
      </form>
    </div>
  );
}

export default function NouvelleDemandePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Chargement...</div>}>
      <NouvelleDemandeForm />
    </Suspense>
  );
}
