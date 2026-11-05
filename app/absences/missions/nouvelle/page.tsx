// ============================================================
// app/absences/missions/nouvelle/page.tsx
// Ordre de Mission Officiel :
//  - Paramètres officiels (N°, Bénéficiaire, Objet, Transport, Dates)
//  - Trajet de la mission & Barème kilométrique (0-1000 km, 6 paliers CI)
//  - Récapitulatif à droite avec Frais estimés et bouton "Soumettre"
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

// ── BARÈME OFFICIEL DES FRAIS KILOMÉTRIQUES CI (6 PALIERS) ──
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

// ── CATALOGUE DES DESTINATIONS INTERIEUR CI AVEC DISTANCES ──
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

function NouvelleMissionContent() {
  const router = useRouter();
  const { currentPersona, addDemande } = useAbsences();

  const defaultDates = useMemo(() => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 1);
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 5);
    return {
      debut: d1.toISOString().split("T")[0],
      fin: d2.toISOString().split("T")[0],
    };
  }, []);

  // 1. Paramètres de l'Ordre de Mission
  const [numOrdreMission, setNumOrdreMission] = useState("JPC/2026-01");
  const [donneOrdreA, setDonneOrdreA] = useState(
    currentPersona
      ? `M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}`
      : "M. Alain COULIBALY"
  );
  const [objetMission, setObjetMission] = useState("ASSISTANCE TECHNIQUE");
  const [moyenTransport, setMoyenTransport] = useState("VÉHICULE DE SERVICE");
  const [dateDepart, setDateDepart] = useState(defaultDates.debut);
  const [dateRetour, setDateRetour] = useState(defaultDates.fin);

  // 2. Trajet de la mission & Barème kilométrique (conforme capture)
  const [villeDepart, setVilleDepart] = useState("Abidjan");
  const [destination, setDestination] = useState("Bouaké");
  const [distanceKm, setDistanceKm] = useState(387);
  const [trajetType, setTrajetType] = useState<"ALLER_RETOUR" | "ALLER_SIMPLE">("ALLER_RETOUR");
  const [ajustementValideur, setAjustementValideur] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentPersona) {
      setDonneOrdreA(`M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}`);
    }
  }, [currentPersona]);

  // Synchronisation sélection ville prédéfinie
  const handleSelectVille = (nom: string) => {
    setDestination(nom);
    const found = DESTINATIONS_CI_CATALOGUE.find((d) => d.nom.toLowerCase() === nom.toLowerCase());
    if (found) {
      setDistanceKm(found.distance);
    }
  };

  // Calcul du palier actif selon la distance aller simple
  const activePalier = useMemo(() => {
    for (let i = 0; i < PALIER_TIERS_CI.length; i++) {
      const t = PALIER_TIERS_CI[i];
      if (distanceKm >= t.min && distanceKm <= t.max) {
        const unit = typeof t.price === "function" ? t.price(distanceKm) : t.price;
        return { ...t, index: i, unitPrice: unit };
      }
    }
    const last = PALIER_TIERS_CI[PALIER_TIERS_CI.length - 1];
    const unit = typeof last.price === "function" ? last.price(distanceKm) : 50000;
    return { ...last, index: PALIER_TIERS_CI.length - 1, unitPrice: unit };
  }, [distanceKm]);

  const isAllerRetour = trajetType === "ALLER_RETOUR";
  const totalDistanceKm = isAllerRetour ? distanceKm * 2 : distanceKm;
  const fraisDeplacementEstimes =
    activePalier.unitPrice * (isAllerRetour ? 2 : 1) + (Number(ajustementValideur) || 0);

  const { joursOuvres, joursCal } = useMemo(() => {
    if (!dateDepart || !dateRetour) return { joursOuvres: 5, joursCal: 5 };
    const d1 = new Date(dateDepart);
    const d2 = new Date(dateRetour);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return { joursOuvres: 1, joursCal: 1 };
    let ouv = 0;
    let cal = 0;
    const c = new Date(d1);
    while (c <= d2) {
      cal++;
      if (c.getDay() !== 0 && c.getDay() !== 6) ouv++;
      c.setDate(c.getDate() + 1);
    }
    return { joursOuvres: Math.max(1, ouv), joursCal: Math.max(1, cal) };
  }, [dateDepart, dateRetour]);

  const formatDateFr = (isoStr: string) => {
    if (!isoStr) return "-";
    const parts = isoStr.split("T")[0].split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoStr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objetMission.trim()) {
      alert("Veuillez indiquer l'objet de la mission.");
      return;
    }
    if (!destination.trim()) {
      alert("Veuillez indiquer le lieu de la mission.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDemande({
        typeDemande: "MISSION_DEPLACEMENT",
        libelleType: "Ordre de Mission Officiel",
        dateDebut: dateDepart,
        dateFin: dateRetour,
        nombreJoursOuvres: joursOuvres,
        nombreJoursCalendaires: joursCal,
        motif: `${objetMission} — Trajet: ${villeDepart} → ${destination} (${totalDistanceKm} km ${isAllerRetour ? "A/R" : "A/S"})`,
        adresseContactPendantAbsence: destination,
        destination: destination,
        moyenTransport: moyenTransport,
        fraisPrevisionnels: fraisDeplacementEstimes,
      });

      router.push("/absences/demandes");
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la transmission de l'ordre de mission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* ── EN-TÊTE CORPORATE HARMONISÉ ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Nouvel Ordre de Mission
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Déplacement professionnel d&apos;un collaborateur, calcul automatique du barème kilométrique et circuit d&apos;approbation DG.
          </p>
        </div>

        <Link
          href="/absences"
          className="text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 px-3.5 py-1.5 bg-white transition-all shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          &larr; Retour
        </Link>
      </div>

      {/* ── FORMULAIRE OFFICIEL EN 2 COLONNES ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════
            COLONNE GAUCHE (7 cols) : PARAMÈTRES + TRAJET DU BARÈME
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* CARTE 1 : PARAMÈTRES DE L'ORDRE DE MISSION */}
          <div className="bg-white border border-slate-200 p-6 shadow-2xs flex flex-col gap-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 m-0">
                Paramètres de l&apos;Ordre de Mission
              </h2>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Informations requises pour l&apos;établissement du document officiel par la Direction Générale
              </span>
            </div>

            <div className="flex flex-col gap-4 text-xs pt-1">
              {/* Numéro d'Ordre de Mission */}
              <div>
                <label htmlFor="num-ordre" className="block text-slate-700 font-semibold mb-1.5">
                  Numéro d&apos;Ordre de Mission
                </label>
                <input
                  id="num-ordre"
                  type="text"
                  value={numOrdreMission}
                  onChange={(e) => setNumOrdreMission(e.target.value)}
                  placeholder="Ex: JPC/2026-01"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Donne ordre à (Nom & Prénom) */}
              <div>
                <label htmlFor="donne-ordre" className="block text-slate-700 font-semibold mb-1.5">
                  Donne ordre à (collaborateur connecté)
                </label>
                <input
                  id="donne-ordre"
                  type="text"
                  value={donneOrdreA}
                  disabled
                  readOnly
                  className="w-full bg-slate-100 border border-slate-300 px-3.5 py-2.5 text-xs text-slate-500 font-bold rounded-none cursor-not-allowed select-none"
                />
              </div>

              {/* Objet de la mission */}
              <div>
                <label htmlFor="mission-objet" className="block text-slate-700 font-semibold mb-1.5">
                  Objet de la mission
                </label>
                <input
                  id="mission-objet"
                  type="text"
                  value={objetMission}
                  onChange={(e) => setObjetMission(e.target.value)}
                  placeholder="Ex: ASSISTANCE TECHNIQUE"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Moyen de transport */}
              <div>
                <label htmlFor="moyen-transport" className="block text-slate-700 font-semibold mb-1.5">
                  Moyen de transport
                </label>
                <div className="relative">
                  <select
                    id="moyen-transport"
                    value={moyenTransport}
                    onChange={(e) => setMoyenTransport(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2.5 pr-8 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none appearance-none transition-colors cursor-pointer"
                  >
                    <option value="VÉHICULE DE SERVICE">VÉHICULE DE SERVICE</option>
                    <option value="VÉHICULE PERSONNEL">VÉHICULE PERSONNEL</option>
                    <option value="AVION">AVION</option>
                    <option value="TRANSPORT EN COMMUN / CAR">TRANSPORT EN COMMUN / CAR</option>
                    <option value="BATEAU">BATEAU</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 font-bold">
                    &#9660;
                  </div>
                </div>
              </div>

              {/* Date départ & Date retour */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="date-depart" className="block text-slate-700 font-semibold mb-1.5">
                    Date départ
                  </label>
                  <input
                    id="date-depart"
                    type="date"
                    value={dateDepart}
                    onChange={(e) => setDateDepart(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="date-retour" className="block text-slate-700 font-semibold mb-1.5">
                    Date retour
                  </label>
                  <input
                    id="date-retour"
                    type="date"
                    value={dateRetour}
                    min={dateDepart}
                    onChange={(e) => setDateRetour(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARTE 2 : 3. TRAJET DE LA MISSION & BARÈME KILOMÉTRIQUE (EXACTEMENT COMME LA CAPTURE FOURNIE) */}
          <div className="bg-white border border-slate-200 p-6 shadow-2xs flex flex-col gap-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 m-0">
                3. Trajet de la mission
              </h3>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Calcul automatique des indemnités de déplacement selon le barème kilométrique officiel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Ville de départ
                </label>
                <input
                  type="text"
                  value={villeDepart}
                  onChange={(e) => setVilleDepart(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Destination
                </label>
                <div className="relative">
                  <select
                    value={destination}
                    onChange={(e) => handleSelectVille(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2 pr-8 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none appearance-none transition-colors cursor-pointer"
                  >
                    {DESTINATIONS_CI_CATALOGUE.map((d) => (
                      <option key={d.nom} value={d.nom}>
                        {d.nom} ({d.distance} km)
                      </option>
                    ))}
                    <option value="Autre destination">Autre destination...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 font-bold">
                    &#9660;
                  </div>
                </div>
              </div>
            </div>

            {/* Distance aller simple avec grand chiffre et jauge interactive */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs text-slate-600 font-semibold">
                Distance (aller simple)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {distanceKm}
                </span>
                <span className="text-sm font-bold text-slate-500">km</span>
              </div>

              {/* Slider 0 à 1000 km */}
              <input
                type="range"
                min="0"
                max="1000"
                step="1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 accent-[#F0822A] cursor-pointer rounded-lg my-1"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0</span>
                <span>250</span>
                <span>500</span>
                <span>750</span>
                <span>1000 km</span>
              </div>
            </div>

            {/* Boutons Aller simple / Aller-retour */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTrajetType("ALLER_SIMPLE")}
                className={`text-xs font-bold px-4 py-2 border transition-colors cursor-pointer ${
                  trajetType === "ALLER_SIMPLE"
                    ? "bg-[#F0822A] border-[#F0822A] text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Aller simple
              </button>
              <button
                type="button"
                onClick={() => setTrajetType("ALLER_RETOUR")}
                className={`text-xs font-bold px-4 py-2 border transition-colors cursor-pointer ${
                  trajetType === "ALLER_RETOUR"
                    ? "bg-[#F0822A] border-[#F0822A] text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Aller-retour
              </button>
            </div>

            {/* Ajustement par le valideur */}
            <div className="pt-2">
              <label className="block text-slate-600 text-xs font-medium mb-1">
                Ajustement par le valideur (FCFA, optionnel)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={ajustementValideur}
                onChange={(e) => setAjustementValideur(Number(e.target.value))}
                className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
              />
              <span className="text-[11px] text-slate-400 italic block mt-1">
                La restauration et l&apos;hébergement ne sont pas inclus dans ce barème.
              </span>
            </div>

            {/* Bouton Soumettre au bas du formulaire de gauche */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F0822A] hover:bg-[#D96F1D] disabled:bg-slate-300 text-white font-bold text-xs py-3 px-4 shadow-2xs transition-colors cursor-pointer disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Soumission en cours..." : "Soumettre"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            COLONNE DROITE (5 cols) : RÉCAPITULATIF & BARÈME ESTIMÉ
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
          {/* CARTE DES FRAIS DE DÉPLACEMENT ESTIMÉS SELON BARÈME */}
          <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
              Frais de déplacement estimés
            </h3>

            <div className="bg-[#FFF8F2] border border-orange-200 p-4 text-center mb-4">
              <span className="text-[11px] text-slate-600 block mb-1">
                Montant estimé (barème kilométrique)
              </span>
              <span className="text-3xl font-black text-[#F0822A] tracking-tight block">
                {fraisDeplacementEstimes.toLocaleString("fr-FR")} FCFA
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                {activePalier.unitPrice.toLocaleString("fr-FR")} FCFA {isAllerRetour ? "x 2 (aller-retour)" : "x 1 (aller simple)"}
              </span>
            </div>

            {/* TABLEAU DES 6 PALIERS DU BARÈME OFFICIEL */}
            <div className="border border-slate-200 overflow-hidden text-xs mb-4">
              <div className="bg-slate-100 px-3 py-1.5 grid grid-cols-12 font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                <span className="col-span-7">Distance (aller simple)</span>
                <span className="col-span-5 text-right">Frais</span>
              </div>
              <div className="divide-y divide-slate-100 text-[11px]">
                {PALIER_TIERS_CI.map((tier, idx) => {
                  const isCurrent = activePalier.index === idx;
                  return (
                    <div
                      key={tier.label}
                      className={`px-3 py-1.5 grid grid-cols-12 items-center transition-colors ${
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

            {/* RÉCAPITULATIF SYNTHÉTIQUE DE LA MISSION */}
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Missionnaire :</span>
                <span className="font-bold text-slate-900">{donneOrdreA}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Trajet :</span>
                <span className="font-bold text-slate-900">
                  {villeDepart} &rarr; {destination}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Distance totale :</span>
                <span className="font-mono font-bold text-slate-900">
                  {totalDistanceKm} km ({isAllerRetour ? "A/R" : "Simple"})
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Période :</span>
                <span className="font-mono font-bold text-slate-900">
                  Du {formatDateFr(dateDepart)} au {formatDateFr(dateRetour)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Transport :</span>
                <span className="font-semibold text-slate-800">{moyenTransport}</span>
              </div>
            </div>

            {/* BOUTON SOUMETTRE PRINCIPAL */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F0822A] hover:bg-[#D96F1D] disabled:bg-slate-300 text-white font-bold text-xs py-3.5 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] mt-4"
            >
              <span>{isSubmitting ? "Soumission en cours..." : "Soumettre"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NouvelleMissionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Chargement...</div>}>
      <NouvelleMissionContent />
    </Suspense>
  );
}
