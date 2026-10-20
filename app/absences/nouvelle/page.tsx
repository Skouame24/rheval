// ============================================================
// app/absences/nouvelle/page.tsx
// Formulaire modulaire adapté selon la nature de permission choisie :
// 1. Congés Annuels -> Solde congés, dates, adresse de contact
// 2. Permission Exceptionnelle -> Événement (mariage, naissance...), justificatif obligatoire
// 3. Mission / Déplacement -> Destination, ordre de mission, transport, frais
// 4. Intervention Terrain -> Client, localisation, rapport d'intervention
// 5. Congé Maladie -> Certificat médical obligatoire sous 48h, médecin
// 6. Récupération -> Date astreinte/travail de nuit compensé
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { TypeDemandeRH } from "@/types/absences.types";

const TYPES_CONFIG: {
  id: TypeDemandeRH;
  titre: string;
  sousTitre: string;
  colorHex: string;
  fieldsTitle: string;
}[] = [
  {
    id: "CONGES_ANNUELS",
    titre: "Congés Annuels",
    sousTitre: "Congé payé légal décompté sur le solde annuel",
    colorHex: "#2563EB",
    fieldsTitle: "Paramètres du congé annuel",
  },
  {
    id: "PERMISSION_EXCEPTIONNELLE",
    titre: "Permission Exceptionnelle",
    sousTitre: "Événements familiaux (mariage, naissance, décès...)",
    colorHex: "#F0822A",
    fieldsTitle: "Motif familial & Justificatif obligatoire",
  },
  {
    id: "MISSION_DEPLACEMENT",
    titre: "Mission / Déplacement",
    sousTitre: "Voyage ou mission professionnelle externe",
    colorHex: "#7C3AED",
    fieldsTitle: "Ordre de mission & Détails du déplacement",
  },
  {
    id: "INTERVENTION_TERRAIN",
    titre: "Intervention Terrain",
    sousTitre: "Intervention technique ponctuelle sur site client",
    colorHex: "#D97706",
    fieldsTitle: "Détails de l'intervention technique & Client",
  },
  {
    id: "CONGES_MALADIE",
    titre: "Congé Maladie",
    sousTitre: "Arrêt de travail prescrit par un médecin",
    colorHex: "#059669",
    fieldsTitle: "Arrêt médical & Certificat du médecin",
  },
  {
    id: "RECUPERATION",
    titre: "Récupération",
    sousTitre: "Repos compensateur suite à des astreintes ou heures sup",
    colorHex: "#334155",
    fieldsTitle: "Astreinte ou heures supplémentaires concernées",
  },
  {
    id: "CONGES_MATERNITE",
    titre: "Congés Maternité",
    sousTitre: "Congé légal de maternité ou adoption",
    colorHex: "#DB2777",
    fieldsTitle: "Certificat de grossesse ou adoption",
  },
  {
    id: "ABSENCE_NON_PAYEE",
    titre: "Absence autorisée non payée",
    sousTitre: "Absence exceptionnelle sans maintien de rémunération",
    colorHex: "#64748B",
    fieldsTitle: "Motif exceptionnel d'absence sans solde",
  },
];

export default function NouvelleDemandePage() {
  const router = useRouter();
  const { currentPersona, soldeConges, addDemande } = useAbsences();

  // Type sélectionné
  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGES_ANNUELS");

  // Champs universels (Bulletin Individuel)
  const [dateDebut, setDateDebut] = useState<string>("2026-11-09");
  const [dateFin, setDateFin] = useState<string>("2026-11-13");
  const [motif, setMotif] = useState<string>("");
  const [adresseContact, setAdresseContact] = useState<string>(
    "Abidjan Cocody, Contact: +225 07 48 92 11 00"
  );
  const [engagementHonneur, setEngagementHonneur] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Champs SPÉCIFIQUES : Mission
  const [destination, setDestination] = useState<string>("San Pedro, Zone Industrielle");
  const [moyenTransport, setMoyenTransport] = useState<string>("Véhicule de société (4x4)");
  const [budgetEstime, setBudgetEstime] = useState<string>("150 000 FCFA");

  // Champs SPÉCIFIQUES : Intervention
  const [clientSite, setClientSite] = useState<string>("Client Datacenter Orange / Wave");
  const [natureTechnique, setNatureTechnique] = useState<string>("Maintenance réseau et baie de brassage");

  // Champs SPÉCIFIQUES : Permission Exceptionnelle
  const [natureEvenement, setNatureEvenement] = useState<string>("Mariage du salarié (3 jours légaux)");

  // Champs SPÉCIFIQUES : Maladie
  const [nomMedecin, setNomMedecin] = useState<string>("Dr. KOUAME - Clinique Médicale Cocody");

  // Champs SPÉCIFIQUES : Récupération
  const [dateAstreinte, setDateAstreinte] = useState<string>("Astreinte du Samedi 17 et Dimanche 18 Octobre");

  // Pièces jointes
  const [fichiers, setFichiers] = useState<string[]>([
    "Justificatif_Officiel_Signe.pdf",
  ]);

  // Calcul automatique jours calendaires (mention Excel) et ouvrés (décompte)
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

  const soldeSuffisant = useMemo(() => {
    if (typeDemande !== "CONGES_ANNUELS") return true;
    return soldeConges.joursRestants >= joursOuvres;
  }, [typeDemande, soldeConges.joursRestants, joursOuvres]);

  const configActive = TYPES_CONFIG.find((t) => t.id === typeDemande) || TYPES_CONFIG[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif.trim()) {
      alert("Le motif de la demande est obligatoire.");
      return;
    }
    if (!engagementHonneur) {
      alert("Veuillez certifier sur l'honneur l'exactitude des informations.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      let motifComplet = motif;
      if (typeDemande === "MISSION_DEPLACEMENT") {
        motifComplet = `[MISSION à ${destination} via ${moyenTransport}] ${motif}`;
      } else if (typeDemande === "INTERVENTION_TERRAIN") {
        motifComplet = `[INTERVENTION chez ${clientSite} - ${natureTechnique}] ${motif}`;
      } else if (typeDemande === "PERMISSION_EXCEPTIONNELLE") {
        motifComplet = `[ÉVÉNEMENT : ${natureEvenement}] ${motif}`;
      } else if (typeDemande === "CONGES_MALADIE") {
        motifComplet = `[CERTIFICAT : ${nomMedecin}] ${motif}`;
      } else if (typeDemande === "RECUPERATION") {
        motifComplet = `[RÉCUPÉRATION suite à : ${dateAstreinte}] ${motif}`;
      }

      addDemande({
        typeDemande,
        libelleType: configActive.titre,
        dateDebut,
        dateFin,
        nombreJoursOuvres: joursOuvres,
        nombreJoursCalendaires: joursCalendaires,
        motif: motifComplet,
        adresseContactPendantAbsence: adresseContact,
        destination: typeDemande === "MISSION_DEPLACEMENT" ? destination : undefined,
        moyenTransport: typeDemande === "MISSION_DEPLACEMENT" ? moyenTransport : undefined,
      });

      setIsSubmitting(false);
      router.push("/absences/demandes");
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE FORMULAIRE ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5" style={{ backgroundColor: configActive.colorHex }} />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Demande de {configActive.titre}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {configActive.sousTitre} • Formulaire adapté aux règles de cette demande.
          </p>
        </div>

        <Link
          href="/absences/demandes"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 bg-white"
        >
          &larr; Annuler et retour
        </Link>
      </div>

      {/* ── SÉLECTION DU TYPE DE DEMANDE (CHAMP SELECT CLAIR ET ÉPURÉ) ── */}
      <div className="bg-white border border-slate-200 p-5">
        <label htmlFor="select-type-demande" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
          Type de demande / permission <span className="text-[#F0822A]">*</span>
        </label>
        <div className="relative max-w-xl">
          <select
            id="select-type-demande"
            value={typeDemande}
            onChange={(e) => setTypeDemande(e.target.value as TypeDemandeRH)}
            className="w-full h-11 px-3.5 pr-10 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 focus:border-[#F0822A] focus:outline-none transition-colors cursor-pointer appearance-none"
          >
            {TYPES_CONFIG.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titre} — {t.sousTitre}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 font-bold">
            ▼
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Le formulaire ci-dessous s&apos;ajuste automatiquement selon la nature sélectionnée (dates, motifs, pièces ou informations de mission).
        </p>
      </div>

      {/* ── CORPS DU FORMULAIRE EN 2 COLONNES (8 COLS FORMULAIRE / 4 COLS CONTRÔLES) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Principale de Saisie */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-5 text-xs">
          {/* Identité Salarié verrouillée */}
          <div className="p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 text-[10px] block">Matricule :</span>
              <span className="font-mono font-bold text-slate-900">{currentPersona.matricule}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Demandeur :</span>
              <span className="font-bold text-slate-900">{currentPersona.prenom} {currentPersona.nom}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Fonction :</span>
              <span className="text-slate-700 font-medium">{currentPersona.poste}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Département :</span>
              <span className="text-slate-700 font-medium">{currentPersona.departement}</span>
            </div>
          </div>

          {/* SECTION DYNAMIQUE SPÉCIFIQUE AU TYPE SÉLECTIONNÉ */}
          <div className="p-4 border border-slate-300 bg-white flex flex-col gap-3">
            <span className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: configActive.colorHex }} />
              <span>{configActive.fieldsTitle}</span>
            </span>

            {/* CAS 1 : MISSION / DÉPLACEMENT */}
            {typeDemande === "MISSION_DEPLACEMENT" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ville / Destination *</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: San Pedro"
                    className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Moyen de transport</label>
                  <input
                    type="text"
                    value={moyenTransport}
                    onChange={(e) => setMoyenTransport(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Budget / Perdiem estimé</label>
                  <input
                    type="text"
                    value={budgetEstime}
                    onChange={(e) => setBudgetEstime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* CAS 2 : INTERVENTION TERRAIN */}
            {typeDemande === "INTERVENTION_TERRAIN" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client & Site d&apos;intervention *</label>
                  <input
                    type="text"
                    value={clientSite}
                    onChange={(e) => setClientSite(e.target.value)}
                    placeholder="Ex: Datacenter Orange Plateau"
                    className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nature des travaux techniques *</label>
                  <input
                    type="text"
                    value={natureTechnique}
                    onChange={(e) => setNatureTechnique(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* CAS 3 : PERMISSION EXCEPTIONNELLE */}
            {typeDemande === "PERMISSION_EXCEPTIONNELLE" && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Type d&apos;événement conventionnel (Code du travail) *
                </label>
                <select
                  value={natureEvenement}
                  onChange={(e) => setNatureEvenement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 font-medium"
                >
                  <option value="Mariage du salarié (3 jours)">Mariage du salarié (3 jours ouvrables)</option>
                  <option value="Naissance / Baptême d'un enfant (2 jours)">Naissance / Baptême d&apos;un enfant (2 jours)</option>
                  <option value="Décès du conjoint ou enfant (5 jours)">Décès du conjoint ou enfant au 1er degré (5 jours)</option>
                  <option value="Mariage d'un enfant (1 jour)">Mariage d&apos;un enfant (1 jour)</option>
                  <option value="Déménagement du salarié (1 jour)">Déménagement du salarié (1 jour)</option>
                </select>
              </div>
            )}

            {/* CAS 4 : MALADIE */}
            {typeDemande === "CONGES_MALADIE" && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Médecin traitant / Clinique ayant délivré le certificat *
                </label>
                <input
                  type="text"
                  value={nomMedecin}
                  onChange={(e) => setNomMedecin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* CAS 5 : RÉCUPÉRATION */}
            {typeDemande === "RECUPERATION" && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Date ou référence de l&apos;astreinte / nuit de travail compensée *
                </label>
                <input
                  type="text"
                  value={dateAstreinte}
                  onChange={(e) => setDateAstreinte(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* CAS 6 : CONGÉS ANNUELS */}
            {typeDemande === "CONGES_ANNUELS" && (
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Ce congé payé légal sera décompté de votre solde disponible de{" "}
                <strong className="text-slate-900">{soldeConges.joursRestants} jours</strong>.
              </p>
            )}
          </div>

          {/* DATES & CALCUL DU NOMBRE DE JOURS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Du (inclus) *</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-[#F0822A]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Au (inclus) *</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-[#F0822A]"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between text-slate-700 pt-2 border-t border-slate-200">
              <span>Durée :</span>
              <span className="font-mono font-bold text-slate-900">
                {joursCalendaires} jours calendaires ({joursOuvres} jours ouvrés)
              </span>
            </div>
          </div>

          {/* MOTIF DE LA DEMANDE */}
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Motif explicite de la permission *
            </label>
            <textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la raison ou le cadre de votre demande..."
              className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#F0822A]"
            />
          </div>

          {/* CONTACT PENDANT L'ABSENCE */}
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Adresse et contact téléphonique pendant l&apos;absence *
            </label>
            <input
              type="text"
              value={adresseContact}
              onChange={(e) => setAdresseContact(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#F0822A]"
            />
          </div>

          {/* PIÈCES JOINTES OBLIGATOIRES SI JUSTIFICATIF REQUIS */}
          <div className="p-3 bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Pièces justificatives requises (EF-02)
            </span>
            <div className="flex flex-col gap-2">
              {fichiers.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200">
                  <span className="font-mono text-slate-800">{f}</span>
                  <span className="text-emerald-700 font-bold text-[10px]">Attaché ✓</span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const n = prompt("Nom du fichier justificatif :");
                  if (n) setFichiers((prev) => [...prev, n]);
                }}
                className="self-start text-[11px] font-bold text-[#F0822A] hover:underline"
              >
                + Ajouter une pièce justificative
              </button>
            </div>
          </div>

          {/* SIGNATURE & ENGAGEMENT SUR L'HONNEUR */}
          <div className="p-3 border border-slate-300 bg-white">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={engagementHonneur}
                onChange={(e) => setEngagementHonneur(e.target.checked)}
                className="mt-0.5 accent-[#F0822A] w-4 h-4 cursor-pointer"
              />
              <div className="text-[11px] text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block">
                  Signature du salarié & Engagement sur l&apos;honneur
                </span>
                Je certifie sur l&apos;honneur l&apos;exactitude des informations saisies et sollicite
                l&apos;autorisation hiérarchique de mon supérieur et du Gérant.
              </div>
            </label>
          </div>

          {/* BOUTONS D'ENVOI */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting || !engagementHonneur}
              onClick={handleSubmit}
              className={`px-6 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer transition-all ${
                isSubmitting || !engagementHonneur
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-[#F0822A] hover:bg-[#D96F1D]"
              }`}
            >
              Signer et soumettre la demande de {configActive.titre}
            </button>
          </div>
        </div>

        {/* Colonne Droite : Synthèse & Contrôles Temps Réel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 flex flex-col gap-4 sticky top-20 text-xs">
          <div className="pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Synthèse en direct (EF-06)
            </span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">
              {configActive.titre}
            </h3>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Durée demandée :</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {joursCalendaires} j (calendaires)
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Jours ouvrés retenus :</span>
              <span className="font-mono font-bold text-[#F0822A] text-sm">
                {joursOuvres} j
              </span>
            </div>
            {typeDemande === "CONGES_ANNUELS" && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Solde restant après :</span>
                <span className={`font-mono font-bold ${soldeSuffisant ? "text-emerald-700" : "text-red-700"}`}>
                  {(soldeConges.joursRestants - joursOuvres).toFixed(1)} j
                </span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
            <span className="font-bold text-slate-900 text-[11px]">
              Circuit hiérarchique applicable :
            </span>
            <p className="text-[11px] text-slate-600">
              {typeDemande === "PERMISSION_EXCEPTIONNELLE" && joursOuvres <= 2
                ? "Circuit court : Supérieur N+1 &rarr; DRH"
                : "Circuit standard : Supérieur N+1 &rarr; DRH &rarr; Gérant (Christian BAMBA)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
