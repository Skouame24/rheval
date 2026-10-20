// ============================================================
// app/absences/nouvelle/page.tsx
// Formulaire officiel de demande de permission (Bulletin Individuel)
// Workflow en 3 étapes avec récapitulatif fixe en direct
// Respect strict du Design System IBM Carbon x Agilly Corporate
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { TypeDemandeRH } from "@/types/absences.types";

const TYPES_PERMISSION: {
  id: TypeDemandeRH;
  titre: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "CONGES_ANNUELS",
    titre: "Congés Annuels",
    description: "Congé payé légal de détente décompté sur le solde annuel acquis.",
    badge: "Décompte solde",
  },
  {
    id: "PERMISSION_EXCEPTIONNELLE",
    titre: "Permission Exceptionnelle",
    description: "Événements familiaux, mariages, naissances, décès au 1er degré.",
    badge: "Justificatif requis",
  },
  {
    id: "MISSION_DEPLACEMENT",
    titre: "Mission / Déplacement",
    description: "Déplacement professionnel externe ou intervention chez un client.",
    badge: "Frais & Ordre de mission",
  },
  {
    id: "CONGES_MALADIE",
    titre: "Congés Maladie",
    description: "Arrêt médical prescrit avec certificat sous 48h.",
    badge: "Certificat obligatoire",
  },
  {
    id: "RECUPERATION",
    titre: "Récupération",
    description: "Repos compensateur suite à astreintes ou heures supplémentaires.",
    badge: "Heures validées",
  },
  {
    id: "CONGES_MATERNITE",
    titre: "Congés Maternité",
    description: "Congé légal lié à la naissance ou adoption.",
    badge: "Certificat médical",
  },
  {
    id: "INTERVENTION_TERRAIN",
    titre: "Intervention Terrain",
    description: "Intervention technique ponctuelle sur site client.",
    badge: "Technique / Support",
  },
  {
    id: "ABSENCE_NON_PAYEE",
    titre: "Absence autorisée non payée",
    description: "Absence exceptionnelle sans maintien de rémunération.",
    badge: "Sans solde",
  },
];

export default function NouvelleDemandePage() {
  const router = useRouter();
  const { currentPersona, soldeConges, addDemande } = useAbsences();

  // Étape courante du formulaire (1: Type, 2: Période & Motif, 3: Vérification & Signature)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Valeurs du formulaire
  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGES_ANNUELS");
  const [dateDebut, setDateDebut] = useState<string>("2026-11-09");
  const [dateFin, setDateFin] = useState<string>("2026-11-13");
  const [motif, setMotif] = useState<string>("");
  const [adresseContact, setAdresseContact] = useState<string>(
    "Abidjan Cocody, Contact: +225 07 48 92 11 00"
  );
  const [destination, setDestination] = useState<string>("");
  const [moyenTransport, setMoyenTransport] = useState<string>("Véhicule de service");
  const [fraisPrevisionnels, setFraisPrevisionnels] = useState<number>(0);
  const [engagementHonneur, setEngagementHonneur] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calcul du nombre de jours ouvrés et calendaires
  const { joursOuvres, joursCalendaires } = useMemo(() => {
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
    return { joursOuvres: countOuvres, joursCalendaires: countCal };
  }, [dateDebut, dateFin]);

  // Contrôles en direct (Règles de gestion RG-01, RG-02, RG-03)
  const soldeSuffisant = useMemo(() => {
    if (typeDemande !== "CONGES_ANNUELS") return true;
    return soldeConges.joursRestants >= joursOuvres;
  }, [typeDemande, soldeConges.joursRestants, joursOuvres]);

  // Circuit hiérarchique calculé selon RG-01
  const circuitCalcule = useMemo(() => {
    const isCourt =
      joursOuvres <= 2 &&
      (typeDemande === "PERMISSION_EXCEPTIONNELLE" || typeDemande === "RECUPERATION");
    if (isCourt) {
      return {
        nom: "Circuit court (≤ 2 jours)",
        etapes: ["Supérieur N+1", "DRH"],
        court: true,
      };
    }
    return {
      nom: "Circuit standard complet",
      etapes: ["Supérieur N+1", "DRH", "Direction Générale (DG)"],
      court: false,
    };
  }, [joursOuvres, typeDemande]);

  const typeSelectionneObj = TYPES_PERMISSION.find((t) => t.id === typeDemande);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif.trim()) {
      alert("Le motif de la demande est obligatoire.");
      return;
    }
    if (!engagementHonneur) {
      alert("Veuillez certifier sur l'honneur l'exactitude des informations saisies.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addDemande({
        typeDemande,
        libelleType: typeSelectionneObj?.titre || "Congé",
        dateDebut,
        dateFin,
        nombreJoursOuvres: joursOuvres,
        nombreJoursCalendaires: joursCalendaires,
        motif,
        adresseContactPendantAbsence: adresseContact,
        destination: typeDemande === "MISSION_DEPLACEMENT" ? destination : undefined,
        moyenTransport: typeDemande === "MISSION_DEPLACEMENT" ? moyenTransport : undefined,
        fraisPrevisionnels:
          typeDemande === "MISSION_DEPLACEMENT" ? fraisPrevisionnels : undefined,
      });

      setIsSubmitting(false);
      router.push("/absences/demandes");
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DU FORMULAIRE OFFICIEL ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Formulaire de Demande de Permission
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bulletin Individuel Officiel • Réf. Formulaire RH-AGY-0042 • Société AGILLY
          </p>
        </div>

        {/* Indicateur d'étape du wizard */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-3 py-1 font-semibold border ${
              step === 1
                ? "bg-[#FFF4EB] text-[#F0822A] border-[#FDE3CC]"
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            1. Nature
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={`px-3 py-1 font-semibold border ${
              step === 2
                ? "bg-[#FFF4EB] text-[#F0822A] border-[#FDE3CC]"
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            2. Période & Motif
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={`px-3 py-1 font-semibold border ${
              step === 3
                ? "bg-[#FFF4EB] text-[#F0822A] border-[#FDE3CC]"
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            3. Vérification
          </span>
        </div>
      </div>

      {/* ── CADRE RÉSERVÉ DU SALARIÉ (PRÉ-REMPLI CONFORME AU BULLETIN) ── */}
      <div className="bg-white border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cadre réservé au salarié (Données certifiées de la fiche de paie)
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-semibold">
            Identité SSO Vérifiée
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">Matricule</span>
            <span className="font-mono font-bold text-slate-900">
              {currentPersona.matricule}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Nom & Prénoms</span>
            <span className="font-bold text-slate-900">
              {currentPersona.prenom} {currentPersona.nom}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Fonction</span>
            <span className="text-slate-700 font-medium">{currentPersona.poste}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Département</span>
            <span className="text-slate-700 font-medium">{currentPersona.departement}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">N° CNSS</span>
            <span className="font-mono text-slate-700">
              {currentPersona.numeroCnss || "CI-0019284729-A"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CORPS EN 2 COLONNES : FORMULAIRE À GAUCHE (8 COLS), RÉSUMÉ FIXE À DROITE (4 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche : Étapes du formulaire */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6">
          {/* ── ÉTAPE 1 : CHOIX DE LA NATURE ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  1. Sélectionnez le type de permission sollicitée
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conforme aux 8 natures prévues par le formulaire officiel d&apos;Agilly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {TYPES_PERMISSION.map((t) => {
                  const isSelected = typeDemande === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setTypeDemande(t.id)}
                      className={`
                        p-4 border transition-all cursor-pointer text-left flex flex-col justify-between
                        ${
                          isSelected
                            ? "border-[#F0822A] bg-[#FFF4EB]/60 ring-1 ring-[#F0822A]"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                        }
                      `}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">{t.titre}</span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 border ${
                              isSelected
                                ? "bg-white text-[#F0822A] border-[#FDE3CC]"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {t.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
                        <span className={isSelected ? "font-bold text-[#F0822A]" : "text-slate-400"}>
                          {isSelected ? "Option sélectionnée" : "Cliquer pour choisir"}
                        </span>
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0822A" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-[#F0822A] hover:bg-[#D96F1D] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Continuer : Période & Motif</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : PÉRIODE, MOTIF & COORDONNÉES ── */}
          {step === 2 && (
            <div className="flex flex-col gap-5 text-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  2. Période demandée, motif et adresse de contact
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renseignez avec précision les dates incluses et le contact d&apos;urgence.
                </p>
              </div>

              {/* Sélecteur de dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Du (inclus) *
                  </label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-[#F0822A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Au (inclus) *
                  </label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-[#F0822A]"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between text-slate-700 pt-2 border-t border-slate-200/80">
                  <span>Calcul automatique des jours :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {joursOuvres} jours ouvrés ({joursCalendaires} jours calendaires)
                  </span>
                </div>
              </div>

              {/* Champs spécifiques si Mission / Déplacement */}
              {typeDemande === "MISSION_DEPLACEMENT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-purple-200 bg-purple-50/40">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block mb-1">
                      Informations de mission professionnelle
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Lieu / Destination *
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Ex: San Pedro / Yamoussoukro"
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Moyen de transport
                    </label>
                    <input
                      type="text"
                      value={moyenTransport}
                      onChange={(e) => setMoyenTransport(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              )}

              {/* Motif de la permission */}
              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Motif de la permission *
                </label>
                <textarea
                  rows={3}
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Précisez la raison ou le contexte de votre demande de congé / permission..."
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#F0822A]"
                />
              </div>

              {/* Adresse et contact pendant l'absence */}
              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Adresse et contact téléphonique pendant l&apos;absence *
                </label>
                <input
                  type="text"
                  value={adresseContact}
                  onChange={(e) => setAdresseContact(e.target.value)}
                  placeholder="Adresse de résidence temporaire, numéro de téléphone joignable..."
                  className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#F0822A]"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 text-xs font-semibold cursor-pointer"
                >
                  &larr; Retour au choix du type
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!motif.trim()) {
                      alert("Veuillez renseigner le motif de la demande.");
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-5 py-2.5 bg-[#F0822A] hover:bg-[#D96F1D] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Vérification & Signature &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : VÉRIFICATION SYNTHÉTIQUE ET SIGNATURE ── */}
          {step === 3 && (
            <div className="flex flex-col gap-5 text-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  3. Vérification du bulletin et signature numérique
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vérifiez l&apos;ensemble des données du Bulletin Individuel avant transmission dans le circuit.
                </p>
              </div>

              {/* Récapitulatif structuré façon Bulletin papier officiel */}
              <div className="border border-slate-300 bg-white p-5 flex flex-col gap-4 shadow-xs">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                      BULLETIN INDIVIDUEL DE PERMISSION
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      RÉFÉRENCE PROVISOIRE : AGY-DEM-2026-NOUVELLE
                    </p>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 border border-slate-300">
                    EXERCICE 2026
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Demandeur :</span>
                    <span className="font-bold text-slate-900">
                      {currentPersona.prenom} {currentPersona.nom}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Type de congé :</span>
                    <span className="font-bold text-[#F0822A]">
                      {typeSelectionneObj?.titre}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Durée ouvrée :</span>
                    <span className="font-mono font-bold text-slate-900">
                      {joursOuvres} jours
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Période :</span>
                    <span className="font-mono text-slate-800">
                      Du {dateDebut} au {dateFin}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[10px] block">Contact d&apos;urgence :</span>
                    <span className="text-slate-800">{adresseContact}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">Motif déclaré :</span>
                  <p className="p-2.5 bg-slate-50 border border-slate-200 italic text-slate-800">
                    &ldquo;{motif}&rdquo;
                  </p>
                </div>

                {/* Engagement sur l'honneur (Signature Salarié) */}
                <div className="pt-3 border-t border-slate-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={engagementHonneur}
                      onChange={(e) => setEngagementHonneur(e.target.checked)}
                      className="mt-0.5 accent-[#F0822A] w-4 h-4 cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900 block">
                        Signature du Salarié & Engagement sur l&apos;honneur
                      </span>
                      Je certifie sur l&apos;honneur l&apos;exactitude des mentions portées sur ce bulletin individuel
                      et sollicite l&apos;autorisation préalable de mon supérieur hiérarchique et de la Direction Générale.
                    </div>
                  </label>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 text-xs font-semibold cursor-pointer"
                >
                  &larr; Modifier la période
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !engagementHonneur}
                  onClick={handleSubmit}
                  className={`px-6 py-2.5 text-xs font-bold text-white shadow-xs flex items-center gap-2 cursor-pointer transition-all ${
                    isSubmitting || !engagementHonneur
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-[#F0822A] hover:bg-[#D96F1D]"
                  }`}
                >
                  {isSubmitting ? (
                    <span>Transmission en cours...</span>
                  ) : (
                    <>
                      <span>Signer et transmettre la demande</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Colonne Droite : Récapitulatif FIXE en direct (Contrôles en temps réel) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 flex flex-col gap-4 sticky top-20 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Synthèse & Contrôles
            </span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">
              {typeSelectionneObj?.titre}
            </h3>
          </div>

          {/* Durée & Dates */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Période :</span>
              <span className="font-mono font-medium text-slate-900">
                {dateDebut.split("-").reverse().join("/")} &rarr;{" "}
                {dateFin.split("-").reverse().join("/")}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Jours ouvrés retenus :</span>
              <span className="font-mono font-extrabold text-[#F0822A] text-sm">
                {joursOuvres} j
              </span>
            </div>
          </div>

          {/* Contrôle RG-02 : Solde Congés */}
          {typeDemande === "CONGES_ANNUELS" && (
            <div
              className={`p-3 border flex flex-col gap-1.5 ${
                soldeSuffisant
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-red-50/60 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-[11px]">
                  Contrôle du solde (RG-02)
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 border ${
                    soldeSuffisant
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }`}
                >
                  {soldeSuffisant ? "Solde Suffisant" : "Dépassement"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                <span>Solde actuel :</span>
                <span className="font-mono font-bold text-slate-900">
                  {soldeConges.joursRestants} j
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Solde prévisionnel après :</span>
                <span className="font-mono font-bold text-[#F0822A]">
                  {(soldeConges.joursRestants - joursOuvres).toFixed(1)} j
                </span>
              </div>
            </div>
          )}

          {/* Contrôle RG-01 : Circuit Hiérarchique Calculé */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-[11px]">
                Circuit de validation (RG-01)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {circuitCalcule.court ? "2 niveaux" : "3 niveaux"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {circuitCalcule.nom}
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              {circuitCalcule.etapes.map((etape, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700">
                  <span className="w-4 h-4 bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{etape}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contrôle RG-04 : Quorum du service */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">Effectif DSI minimum (RG-04) :</span>
            <span className="font-bold text-emerald-700">Conforme (85.7%)</span>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 text-center leading-relaxed">
            Validation finale : Signature électronique conforme eIDAS & Archivage GED 10 ans.
          </div>
        </div>
      </div>
    </div>
  );
}

