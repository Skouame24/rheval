// ============================================================
// app/absences/nouvelle/page.tsx
// Formulaire DÉDIÉ UNIQUEMENT aux Congés & Permissions d'absence
// (Les Ordres de Mission et Interventions Techniques ont leurs propres pages dédiées)
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

  // Onglet Congés vs Permissions
  const [familleActive, setFamilleActive] = useState<"CONGES" | "PERMISSIONS">("CONGES");
  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGES_ANNUELS");

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      if (typeParam === "MISSION_DEPLACEMENT") {
        router.replace("/absences/missions/nouvelle");
        return;
      }
      if (typeParam === "INTERVENTION_TERRAIN") {
        router.replace("/absences/interventions/nouvelle");
        return;
      }
      const found = MOTIFS_CATALOGUE.find((m) => m.id === typeParam);
      if (found) {
        setFamilleActive(found.famille === "PERMISSIONS" ? "PERMISSIONS" : "CONGES");
        setTypeDemande(found.id);
      }
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

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── EN-TÊTE DÉDIÉ CONGÉS & PERMISSIONS ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-blue-600 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Demande de Congé ou Permission d&apos;Absence
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulaire officiel Agilly pour la pose de vos congés annuels, arrêts maladie ou permissions conventionnelles.
          </p>
        </div>

        <Link
          href="/absences/demandes"
          className="text-xs font-bold text-slate-600 hover:text-blue-700 border border-slate-300 hover:border-blue-600 px-3.5 py-1.5 bg-white transition-all self-start sm:self-auto shadow-2xs whitespace-nowrap"
        >
          &larr; Mes demandes de congés
        </Link>
      </div>

      {/* ── BANDEAU D'ORIENTATION CLAIRE VERS MISSIONS ET INTERVENTIONS ── */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-600 font-medium">
          Vous devez déclarer un déplacement ou une intervention technique ?
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/absences/missions/nouvelle"
            className="font-bold text-[#F0822A] hover:underline bg-white border border-orange-200 px-2.5 py-1"
          >
            &rarr; Ouvrir l&apos;Ordre de Mission
          </Link>
          <Link
            href="/absences/interventions/nouvelle"
            className="font-bold text-slate-900 hover:underline bg-white border border-slate-300 px-2.5 py-1"
          >
            &rarr; Ouvrir la Fiche d&apos;Intervention
          </Link>
        </div>
      </div>

      {/* ── CHOIX : 1. CONGÉS ou 2. PERMISSIONS (SEULEMENT CES DEUX-LÀ !) ── */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col gap-3 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
          Sélectionnez la nature de votre repos :
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFamilleActive("CONGES")}
            className={`p-3.5 text-left cursor-pointer transition-all border rounded-none ${
              familleActive === "CONGES"
                ? "bg-blue-50/70 border-2 border-blue-600 shadow-xs"
                : "bg-white border border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black uppercase ${familleActive === "CONGES" ? "text-blue-900" : "text-slate-800"}`}>
                1. Congés (Décomptés du solde ou statut légal)
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 font-bold ${familleActive === "CONGES" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                6 motifs {familleActive === "CONGES" && "✓"}
              </span>
            </div>
            <p className="text-[11px] leading-snug text-slate-500 m-0">
              Congé annuel payé, arrêt maladie, maternité, paternité, sans solde, formation.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFamilleActive("PERMISSIONS")}
            className={`p-3.5 text-left cursor-pointer transition-all border rounded-none ${
              familleActive === "PERMISSIONS"
                ? "bg-blue-50/70 border-2 border-blue-600 shadow-xs"
                : "bg-white border border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black uppercase ${familleActive === "PERMISSIONS" ? "text-blue-900" : "text-slate-800"}`}>
                2. Permissions (Solde annuel CP préservé)
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 font-bold ${familleActive === "PERMISSIONS" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                9 motifs {familleActive === "PERMISSIONS" && "✓"}
              </span>
            </div>
            <p className="text-[11px] leading-snug text-slate-500 m-0">
              Mariage, naissance, obsèques, urgence familiale, médical, sortie en heures.
            </p>
          </button>
        </div>
      </div>

      {/* ── FORMULAIRE PROPRE CONGÉS / PERMISSIONS ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-5 text-xs shadow-2xs">
          {/* Identité */}
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

          {/* Motif précis */}
          <div>
            <label htmlFor="select-motif" className="block text-slate-900 font-bold mb-1.5">
              Motif exact de l&apos;absence <span className="text-blue-600">*</span>
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
                    {m.titre} — {m.sousTitre}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold">
                ▼
              </div>
            </div>

            <div className="mt-2 p-2.5 bg-blue-50/50 border-l-2 border-blue-600 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{motifActif.titre}</span>
                <span className="font-mono font-semibold text-[10px] px-1.5 py-0.2 bg-white border border-slate-300 text-slate-700">
                  {motifActif.badgeLegal}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 m-0">{motifActif.decompteLabel}</p>
            </div>
          </div>

          {/* Plage horaire ou Dates */}
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
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Heure de départ *</label>
                  <input
                    type="time"
                    value={heureDebut}
                    onChange={(e) => setHeureDebut(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Heure de retour prévue *</label>
                  <input
                    type="time"
                    value={heureFin}
                    onChange={(e) => setHeureFin(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none rounded-none"
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
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none rounded-none"
                  />
                  <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-slate-600 text-[11px]">
                    <input
                      type="checkbox"
                      checked={estDemiJourneeDebut}
                      onChange={(e) => setEstDemiJourneeDebut(e.target.checked)}
                      className="accent-blue-600"
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
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none rounded-none"
                  />
                  <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-slate-600 text-[11px]">
                    <input
                      type="checkbox"
                      checked={estDemiJourneeFin}
                      onChange={(e) => setEstDemiJourneeFin(e.target.checked)}
                      className="accent-blue-600"
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

          {/* Motif */}
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Motif ou justification de l&apos;absence <span className="text-blue-600">*</span>
            </label>
            <textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Précisez la situation ou justification de votre demande..."
              className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 rounded-none"
              required
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
              className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 rounded-none"
            />
          </div>

          {/* Pièce justificative */}
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
                      <span className="text-xs font-bold text-slate-800 truncate">{f.nom}</span>
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
                className="w-full border-2 border-dashed border-slate-300 hover:border-blue-600 bg-white hover:bg-blue-50/30 p-4 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center rounded-none"
              >
                <span className="text-xs font-bold text-slate-800">
                  Cliquez pour joindre un justificatif
                </span>
              </button>
            </div>
          )}

          {/* Engagement */}
          <div className="p-3 border border-slate-300 bg-white">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={engagementHonneur}
                onChange={(e) => setEngagementHonneur(e.target.checked)}
                className="mt-0.5 accent-blue-600 w-4 h-4 cursor-pointer"
              />
              <div className="text-[11px] text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block">
                  Engagement sur l&apos;honneur
                </span>
                Je certifie l&apos;exactitude des mentions indiquées et sollicite l&apos;approbation de ma hiérarchie.
              </div>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !engagementHonneur}
              className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-black text-white shadow-md cursor-pointer transition-all rounded-none ${
                isSubmitting || !engagementHonneur
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
              }`}
            >
              <span>{isSubmitting ? "Transmission en cours..." : "Transmettre ma demande →"}</span>
            </button>
          </div>
        </div>

        {/* Colonne droite : Récapitulatif */}
        <div className="lg:col-span-4 bg-white border border-slate-200 border-t-4 border-t-blue-600 p-5 flex flex-col gap-4 sticky top-20 text-xs shadow-2xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                Récapitulatif de ma demande
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm mt-0.5 m-0">
                {motifActif.titre}
              </h3>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          </div>

          <div className="p-3.5 bg-blue-50/40 border border-blue-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-bold">Durée totale :</span>
              <span className="text-base font-black text-blue-700 font-mono">
                {motifActif.isSortieHeures ? dureeHeuresMinutes?.text : `${joursOuvres} jour(s) ouvré(s)`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-blue-200/60">
              <span className="text-slate-500 font-medium">Dates :</span>
              <span className="font-mono font-bold text-slate-800">
                {formatFrShort(dateDebut)} {dateFin && dateFin !== dateDebut ? `au ${formatFrShort(dateFin)}` : ""}
              </span>
            </div>
          </div>

          {motifActif.impactSolde ? (
            <div className="p-3.5 bg-orange-50/50 border border-orange-200 flex flex-col gap-2">
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
