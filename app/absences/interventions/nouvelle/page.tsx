// ============================================================
// app/absences/interventions/nouvelle/page.tsx
// Page DÉDIÉE : Nouvelle Fiche d'Intervention Technique
// Rendu conforme à l'Image 2 : Équipe multi-employés (+ Employé),
// Description des prestations (DOMINO, WINDOWS, INFRA / RÉSEAUX),
// Tarif contractuel journalier.
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

const COLLABORATEURS_AGILLY_CATALOGUE = [
  "M. KOFFI Marc — Ingénieur Systèmes & Cloud",
  "Mme TRAORÉ Awa — Ingénieure Réseaux & Sécurité",
  "M. DIALLO Ibrahim — Administrateur Domino / Notes",
  "M. N'GUESSAN Serge — Technicien Infrastructure Windows",
  "Mme KOUAMÉ Clarisse — Consultante Cybersécurité",
  "M. YAO Franck — Technicien Support & Déploiement",
  "M. KONÉ Seydou — Architecte Réseaux & Télécoms",
];

function NouvelleInterventionContent() {
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

  const [intervenantPrincipal, setIntervenantPrincipal] = useState(
    currentPersona
      ? `${currentPersona.prenom} ${currentPersona.nom.toUpperCase()} (${currentPersona.poste || "Ingénieur Principal"})`
      : "KOUASSI Emmanuel (Ingénieur Principal)"
  );

  const [collaborateurs, setCollaborateurs] = useState<string[]>([
    "M. KOFFI Marc — Ingénieur Systèmes & Cloud",
    "Mme TRAORÉ Awa — Ingénieure Réseaux & Sécurité",
  ]);
  const [selectedCollab, setSelectedCollab] = useState<string>(COLLABORATEURS_AGILLY_CATALOGUE[2]);
  const [customCollab, setCustomCollab] = useState<string>("");

  const [clientSite, setClientSite] = useState("Direction Générale Client — Zone 3 Treichville, Abidjan");
  const [objetIntervention, setObjetIntervention] = useState(
    "Migration serveurs Domino v11, Windows Server et sécurisation pare-feu"
  );
  const [dateDebut, setDateDebut] = useState(defaultDates.debut);
  const [dateFin, setDateFin] = useState(defaultDates.fin);

  const [prestaDev, setPrestaDev] = useState(
    "Développement d'application web & mobile, APIs, intégration et recette technique."
  );
  const [prestaInfra, setPrestaInfra] = useState(
    "Sécurisation des routeurs et pare-feu principaux."
  );
  const [prestaWindows, setPrestaWindows] = useState(
    "Administration serveurs Windows / Linux et Cloud."
  );
  const [prestaDomino, setPrestaDomino] = useState("");
  const [tarifContractuelJour, setTarifContractuelJour] = useState<number>(720000);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentPersona) {
      setIntervenantPrincipal(
        `${currentPersona.prenom} ${currentPersona.nom.toUpperCase()} (${currentPersona.poste || "Chef d'équipe"})`
      );
    }
  }, [currentPersona]);

  const handleAddCollab = () => {
    const toAdd = customCollab.trim() || selectedCollab;
    if (!toAdd) return;
    if (!collaborateurs.includes(toAdd)) {
      setCollaborateurs((prev) => [...prev, toAdd]);
    }
    setCustomCollab("");
  };

  const handleRemoveCollab = (idx: number) => {
    setCollaborateurs((prev) => prev.filter((_, i) => i !== idx));
  };

  const { joursOuvres, joursCal } = useMemo(() => {
    if (!dateDebut || !dateFin) return { joursOuvres: 3, joursCal: 3 };
    const d1 = new Date(dateDebut);
    const d2 = new Date(dateFin);
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
  }, [dateDebut, dateFin]);

  const formatFrShort = (d: string) => {
    if (!d) return "-";
    const parts = d.split("T")[0].split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
  };

  const periodeLabel = `${formatFrShort(dateDebut)} au ${formatFrShort(dateFin)} (${joursOuvres} jours ouvrés)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objetIntervention.trim()) {
      alert("Veuillez renseigner l'intitulé de l'intervention.");
      return;
    }
    setIsSubmitting(true);
    try {
      const equipeComplete = [
        `${intervenantPrincipal} (Intervenant Principal)`,
        ...collaborateurs,
      ];
      const metaPayload = {
        clientSite,
        equipe: equipeComplete,
        developpement: prestaDev,
        domino: prestaDomino,
        windows: prestaWindows,
        infra: prestaInfra,
        tarifJour: Number(tarifContractuelJour) || 720000,
      };
      const motifEnrichi = `${objetIntervention} ||INTERVENTION_META:${JSON.stringify(metaPayload)}`;

      await addDemande({
        typeDemande: "INTERVENTION_TERRAIN",
        libelleType: "Fiche d'Intervention Technique",
        dateDebut: dateDebut,
        dateFin: dateFin,
        nombreJoursOuvres: joursOuvres,
        nombreJoursCalendaires: joursCal,
        motif: motifEnrichi,
        adresseContactPendantAbsence: clientSite,
        destination: clientSite,
        moyenTransport: `Équipe de ${equipeComplete.length} intervenant(s)`,
        fraisPrevisionnels: (Number(tarifContractuelJour) || 720000) * joursOuvres,
      });

      router.push("/absences/interventions");
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la création de la fiche d'intervention.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── EN-TÊTE DÉDIÉ FICHE D'INTERVENTION ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-slate-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-slate-900" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Nouvelle Fiche d&apos;Intervention Technique
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Déploiement technique sur site client en équipe multi-employés avec spécifications (Domino, Windows, Infra) et tarif contractuel.
          </p>
        </div>

        <Link
          href="/absences/interventions"
          className="text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-800 px-3.5 py-1.5 bg-white transition-all shadow-2xs"
        >
          &larr; Suivi des Interventions
        </Link>
      </div>

      {/* ── FORMULAIRE OFFICIEL EN 2 COLONNES ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE (7 cols) : ÉQUIPE, SITE, PRESTATIONS, TARIF */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. Équipe d'Intervention / Employés */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide m-0">
                1. Équipe d&apos;Intervention / Employés
              </h3>
              <span className="text-[10px] font-bold bg-orange-50 text-[#C25E00] border border-orange-200 px-2 py-0.5">
                {1 + collaborateurs.length} intervenant(s)
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-slate-700 text-xs font-semibold mb-1">
                Intervenant Principal / Responsable technique <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={intervenantPrincipal}
                onChange={(e) => setIntervenantPrincipal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                required
              />
            </div>

            {/* Ajout d'employés */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-800">
                Ajouter des collaborateurs à l&apos;équipe technique :
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-8">
                  <select
                    value={selectedCollab}
                    onChange={(e) => setSelectedCollab(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:border-[#F0822A] focus:outline-none rounded-none cursor-pointer"
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
                    onClick={handleAddCollab}
                    className="w-full h-full bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs px-3 py-2 rounded-none transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>+ Employé</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customCollab}
                  onChange={(e) => setCustomCollab(e.target.value)}
                  placeholder="Ou saisir manuellement un nom et poste..."
                  className="flex-1 bg-white border border-slate-300 p-1.5 text-xs text-slate-900 focus:border-[#F0822A] focus:outline-none rounded-none"
                />
                {customCollab.trim() && (
                  <button
                    type="button"
                    onClick={handleAddCollab}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-none cursor-pointer"
                  >
                    Ajouter
                  </button>
                )}
              </div>

              {/* Liste de l'équipe */}
              <div className="mt-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between bg-orange-50/80 border border-orange-200 px-3 py-1.5 text-xs">
                  <span className="font-bold text-slate-900">• {intervenantPrincipal}</span>
                  <span className="text-[10px] font-bold text-[#C25E00] uppercase">Chef d&apos;équipe</span>
                </div>
                {collaborateurs.map((collab, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 text-xs"
                  >
                    <span className="font-medium text-slate-800">• {collab}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCollab(idx)}
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

          {/* 2. Client, Site & Période */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
              2. Client, Site &amp; Période d&apos;intervention
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Client / Adresse du site <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientSite}
                  onChange={(e) => setClientSite(e.target.value)}
                  placeholder="Ex: 22 rue des carrossiers Zone 3 - Treichville Abidjan"
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Intitulé général de l&apos;intervention <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={objetIntervention}
                  onChange={(e) => setObjetIntervention(e.target.value)}
                  placeholder="Ex: Déploiement infrastructure et migration serveurs"
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Date de fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Prestations Techniques (Adapté aux Développeurs, Systèmes, Infra et Historique) */}
          <div className="bg-white border border-slate-200 p-5 shadow-2xs">
            <div className="border-b border-slate-200 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide m-0">
                3. Description des Prestations Techniques
              </h3>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Renseignez le(s) volet(s) technique(s) correspondant à l&apos;intervention (Développeur, Infra, Cloud ou Historique).
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* Volet Développeurs */}
              <div className="p-3 bg-amber-50/40 border border-amber-200/80">
                <label className="block text-slate-900 text-xs font-black mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>▲</span> DÉVELOPPEMENT &amp; APPLICATIONS (Web, Mobile, APIs, Intégrations) :
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5">Profil Développeur</span>
                </label>
                <textarea
                  rows={2}
                  value={prestaDev}
                  onChange={(e) => setPrestaDev(e.target.value)}
                  placeholder="Ex: Conception et intégration de modules, APIs backend, tests de recette, débogage et mise en production..."
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>

              {/* Volet Infrastructure & Réseaux */}
              <div>
                <label className="block text-slate-900 text-xs font-black mb-1">
                  ▲ INFRASTRUCTURES &amp; RÉSEAUX / SÉCURITÉ :
                </label>
                <textarea
                  rows={2}
                  value={prestaInfra}
                  onChange={(e) => setPrestaInfra(e.target.value)}
                  placeholder="Ex: Routeurs, switchs, pare-feu, câblage, segmentation réseau..."
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>

              {/* Volet Systèmes & Cloud */}
              <div>
                <label className="block text-slate-900 text-xs font-black mb-1">
                  ▲ SYSTÈMES &amp; CLOUD (Windows Server, Linux, Cloud) :
                </label>
                <textarea
                  rows={2}
                  value={prestaWindows}
                  onChange={(e) => setPrestaWindows(e.target.value)}
                  placeholder="Ex: Déploiement et migration OS, Active Directory, serveurs de fichiers..."
                  className="w-full bg-slate-50/70 border border-slate-300 p-2 text-xs text-slate-900 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>

              {/* Volet Historique Domino */}
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1 flex items-center justify-between">
                  <span>▲ DOMINO &amp; MESSAGERIE HISTORIQUE (Optionnel) :</span>
                  <span className="text-[10px] text-slate-400 font-normal">Clients spécifiques</span>
                </label>
                <textarea
                  rows={1}
                  value={prestaDomino}
                  onChange={(e) => setPrestaDomino(e.target.value)}
                  placeholder="Renseigner uniquement si l'intervention concerne la messagerie Lotus / HCL Domino..."
                  className="w-full bg-slate-50/70 border border-slate-200 p-2 text-xs text-slate-700 focus:bg-white focus:border-[#F0822A] focus:outline-none rounded-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Conditions Financières */}
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

        {/* COLONNE DROITE (5 cols) : APERÇU FICHE TECHNIQUE */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
          <div className="bg-white border border-slate-200 border-t-4 border-t-slate-900 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
              Aperçu de la Fiche d&apos;Intervention
            </h3>

            <div className="border border-slate-300 p-3 bg-slate-50 mb-4 text-xs">
              <span className="font-extrabold uppercase text-[10px] text-slate-700 block mb-1.5">
                ÉQUIPE D&apos;INTERVENTION ({1 + collaborateurs.length}) :
              </span>
              <div className="flex flex-col gap-1 font-medium text-slate-900 text-[11px]">
                <span className="font-bold">• {intervenantPrincipal} (Principal)</span>
                {collaborateurs.map((c, i) => (
                  <span key={i}>• {c}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs mb-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Site client</span>
                <span className="font-bold text-slate-900">{clientSite || "-"}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Période</span>
                <span className="font-mono font-bold text-slate-900">{periodeLabel}</span>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-800 block">Prestations</span>
                <div className="mt-1 space-y-1 text-[11px] text-slate-700">
                  {prestaDev && <p className="m-0"><strong>▲ DÉV &amp; APPS :</strong> {prestaDev}</p>}
                  {prestaInfra && <p className="m-0"><strong>▲ INFRA :</strong> {prestaInfra}</p>}
                  {prestaWindows && <p className="m-0"><strong>▲ SYSTÈMES :</strong> {prestaWindows}</p>}
                  {prestaDomino && <p className="m-0"><strong>▲ DOMINO :</strong> {prestaDomino}</p>}
                  {!prestaDev && !prestaInfra && !prestaWindows && !prestaDomino && (
                    <p className="m-0 text-slate-400 italic">Aucune spécification renseignée</p>
                  )}
                </div>
              </div>
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-800 block">Conditions Financières</span>
                <span className="text-sm font-black text-[#F0822A] font-mono block mt-0.5">
                  Tarif : {(Number(tarifContractuelJour) || 0).toLocaleString("fr-FR")} FCFA / jour
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isSubmitting ? "Transmission en cours..." : "Soumettre la Fiche d'Intervention →"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NouvelleInterventionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement du formulaire...</div>}>
      <NouvelleInterventionContent />
    </Suspense>
  );
}

