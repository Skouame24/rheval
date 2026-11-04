// ============================================================
// app/absences/missions/nouvelle/page.tsx
// Page DÉDIÉE : Nouvel Ordre de Mission (Déplacement & Frais)
// Rendu conforme à l'Image 3 : Missionnaire, Détails, Trajet CI,
// Slider 0-1000km, Barème des 6 paliers.
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

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

function NouvelleMissionContent() {
  const router = useRouter();
  const { currentPersona, addDemande } = useAbsences();

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

  const [nomMissionnaire, setNomMissionnaire] = useState(
    currentPersona ? `M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}` : "M. KOUASSI Emmanuel"
  );
  const [matricule, setMatricule] = useState(currentPersona?.matricule || "M-0452");
  const [service, setService] = useState(currentPersona?.departement || "Exploitation");
  const [fonction, setFonction] = useState(currentPersona?.poste || "Technicien Réseau");

  const [clientSite, setClientSite] = useState("Site B");
  const [objetMission, setObjetMission] = useState("Installation infrastructure réseau");
  const [moyenTransport, setMoyenTransport] = useState("VÉHICULE DE SERVICE");
  const [dateDepart, setDateDepart] = useState(defaultDates.debut);
  const [dateRetour, setDateRetour] = useState(defaultDates.fin);

  const [villeDepart, setVilleDepart] = useState("Abidjan");
  const [destination, setDestination] = useState("Bouaké");
  const [distanceKm, setDistanceKm] = useState(387);
  const [trajetType, setTrajetType] = useState<"ALLER_RETOUR" | "ALLER_SIMPLE">("ALLER_RETOUR");
  const [ajustementValideur, setAjustementValideur] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentPersona) {
      setNomMissionnaire(`M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}`);
      setMatricule(currentPersona.matricule);
      setService(currentPersona.departement || "Exploitation");
      setFonction(currentPersona.poste || "Technicien Réseau");
    }
  }, [currentPersona]);

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
    if (!dateDepart || !dateRetour) return { joursOuvres: 3, joursCal: 3 };
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

  const formatFrShort = (d: string) => {
    if (!d) return "-";
    const parts = d.split("T")[0].split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  const periodeLabel = `${formatFrShort(dateDepart)} au ${formatFrShort(dateRetour)} (${joursCal} jours)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objetMission.trim()) {
      alert("Veuillez indiquer l'objet de la mission.");
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
        motif: objetMission,
        adresseContactPendantAbsence: clientSite || destination,
        destination: `À ${destination.toUpperCase()} (${villeDepart} → ${destination}, ${totalDistanceKm} km ${isAllerRetour ? "A/R" : "Aller simple"})`,
        moyenTransport: moyenTransport,
        fraisPrevisionnels: fraisDeplacementEstimes,
      });

      router.push("/absences/missions");
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la création de l'ordre de mission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── EN-TÊTE DÉDIÉ ORDRE DE MISSION ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A]" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Nouvel Ordre de Mission
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Déplacement professionnel avec barème kilométrique officiel. Après validation du workflow, l&apos;<strong>Ordre de Mission A4 signé par le Directeur Général</strong> sera scellé et téléchargeable.
          </p>
        </div>

        <Link
          href="/absences/missions"
          className="text-xs font-bold text-slate-700 hover:text-[#C25E00] border border-slate-300 hover:border-[#F0822A] px-3.5 py-1.5 bg-white transition-all shadow-2xs"
        >
          &larr; Suivi des Ordres de Mission
        </Link>
      </div>

      {/* ── FORMULAIRE OFFICIEL EN 2 COLONNES ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE (7 cols) : LES 3 BLOCS DE SAISIE */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. Informations du demandeur */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
              1. Informations du demandeur
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Nom et prénom(s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomMissionnaire}
                  onChange={(e) => setNomMissionnaire(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Matricule
                </label>
                <input
                  type="text"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Service / Département
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
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
                  value={fonction}
                  onChange={(e) => setFonction(e.target.value)}
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
                  Client / Site d&apos;accueil
                </label>
                <input
                  type="text"
                  value={clientSite}
                  onChange={(e) => setClientSite(e.target.value)}
                  placeholder="Ex: Site B"
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Moyen de transport <span className="text-red-500">*</span>
                </label>
                <select
                  value={moyenTransport}
                  onChange={(e) => setMoyenTransport(e.target.value)}
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
                  value={objetMission}
                  onChange={(e) => setObjetMission(e.target.value)}
                  placeholder="Ex: Installation infrastructure réseau"
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Date de départ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateDepart}
                  onChange={(e) => setDateDepart(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Date de retour <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateRetour}
                  onChange={(e) => setDateRetour(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
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
                  value={villeDepart}
                  onChange={(e) => setVilleDepart(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Destination (Côte d&apos;Ivoire)
                </label>
                <select
                  value={destination}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDestination(val);
                    const found = DESTINATIONS_CI_CATALOGUE.find((v) => v.nom === val);
                    if (found) setDistanceKm(found.distance);
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

            {/* Slider interactif */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Distance (aller simple)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{distanceKm}</span>
                  <span className="text-xs font-bold text-slate-500">km</span>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={1000}
                step={1}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-none appearance-none cursor-pointer accent-[#F0822A]"
              />

              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>0</span>
                <span>250</span>
                <span>500</span>
                <span>750</span>
                <span>1000 km</span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setTrajetType("ALLER_SIMPLE")}
                  className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none border ${
                    trajetType === "ALLER_SIMPLE"
                      ? "bg-[#F0822A] text-white border-[#F0822A] shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Aller simple
                </button>
                <button
                  type="button"
                  onClick={() => setTrajetType("ALLER_RETOUR")}
                  className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none border ${
                    trajetType === "ALLER_RETOUR"
                      ? "bg-[#F0822A] text-white border-[#F0822A] shadow-xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Aller-retour
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Ajustement par le valideur (FCFA, optionnel)
                </label>
                <input
                  type="number"
                  min={0}
                  value={ajustementValideur}
                  onChange={(e) => setAjustementValideur(Number(e.target.value))}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 m-0">
                  La restauration et l&apos;hébergement ne sont pas inclus dans ce barème.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (5 cols) : FRAIS ESTIMÉS & APERÇU */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
              Frais de déplacement estimés
            </h3>

            <div className="bg-[#FFF8F2] border border-orange-200 p-4 text-center mb-4">
              <span className="text-[11px] text-slate-600 block mb-1">
                Montant estimé (dans l&apos;ordre de mission)
              </span>
              <span className="text-3xl font-black text-[#F0822A] tracking-tight block">
                {fraisDeplacementEstimes.toLocaleString("fr-FR")} FCFA
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                {activePalier.unitPrice.toLocaleString("fr-FR")} FCFA {isAllerRetour ? "x 2 (aller-retour)" : "x 1 (aller simple)"}
              </span>
            </div>

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

          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
              Aperçu de l&apos;Ordre de Mission
            </h3>

            <div className="flex flex-col gap-2 text-xs mb-4">
              <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                <span className="col-span-4 text-slate-500 font-medium">Missionnaire</span>
                <span className="col-span-8 font-bold text-slate-900 text-right">{nomMissionnaire}</span>
              </div>
              <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                <span className="col-span-4 text-slate-500 font-medium">Objet</span>
                <span className="col-span-8 font-semibold text-slate-800 text-right">{objetMission || "-"}</span>
              </div>
              <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                <span className="col-span-4 text-slate-500 font-medium">Période</span>
                <span className="col-span-8 font-mono text-slate-800 text-right">{periodeLabel}</span>
              </div>
              <div className="grid grid-cols-12 gap-1 py-1 border-b border-slate-100">
                <span className="col-span-4 text-slate-500 font-medium">Trajet</span>
                <span className="col-span-8 font-bold text-slate-900 text-right">
                  {villeDepart} &rarr; {destination}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-1 py-1">
                <span className="col-span-4 text-slate-500 font-medium">Total estimé</span>
                <span className="col-span-8 font-mono font-black text-[#F0822A] text-right">
                  {fraisDeplacementEstimes.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs py-3.5 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isSubmitting ? "Transmission en cours..." : "Soumettre l'Ordre de Mission →"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NouvelleMissionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement du formulaire...</div>}>
      <NouvelleMissionContent />
    </Suspense>
  );
}

