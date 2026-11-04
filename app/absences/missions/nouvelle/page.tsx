// ============================================================
// app/absences/missions/nouvelle/page.tsx
// Formulaire de l'Ordre de Mission avec Récapitulatif à droite
// (comme pour la Fiche d'Intervention Technique)
// - Formulaire "Paramètres de l'Ordre de Mission" à gauche
// - Récapitulatif en direct avec bouton "Soumettre" à droite
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";

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

  // Champs exacts du formulaire
  const [numOrdreMission, setNumOrdreMission] = useState("JPC/2026-01");
  const [donneOrdreA, setDonneOrdreA] = useState(
    currentPersona
      ? `M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}`
      : "M. Alain COULIBALY"
  );
  const [destination, setDestination] = useState("AU MALAWI – TRANSIT PAR L’ÉTHIOPIE");
  const [objetMission, setObjetMission] = useState("ASSISTANCE TECHNIQUE");
  const [moyenTransport, setMoyenTransport] = useState("AVION");
  const [dateDepart, setDateDepart] = useState(defaultDates.debut);
  const [dateRetour, setDateRetour] = useState(defaultDates.fin);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentPersona) {
      setDonneOrdreA(`M. ${currentPersona.prenom} ${currentPersona.nom.toUpperCase()}`);
    }
  }, [currentPersona]);

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
        motif: `${objetMission} (N° ${numOrdreMission || "JPC/2026-01"})`,
        adresseContactPendantAbsence: destination,
        destination: destination,
        moyenTransport: moyenTransport,
        fraisPrevisionnels: 150000,
      });

      router.push("/absences/demandes?univers=MISSIONS");
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
            Déplacement professionnel d&apos;un collaborateur. Circuit officiel soumis à validation hiérarchique puis Direction Générale.
          </p>
        </div>

        <Link
          href="/absences"
          className="text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 px-3.5 py-1.5 bg-white transition-all shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          &larr; Retour
        </Link>
      </div>

      {/* ── FORMULAIRE OFFICIEL EN 2 COLONNES (STYLE INTERVENTIONS) ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════
            COLONNE GAUCHE (7 cols) : PARAMÈTRES DE L'ORDRE DE MISSION
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 flex flex-col gap-5">
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
              {/* 1. Numéro d'Ordre de Mission */}
              <div>
                <label htmlFor="num-ordre" className="block text-slate-700 font-semibold mb-1.5">
                  Numéro d&apos;Ordre de Mission
                </label>
                <input
                  id="num-ordre"
                  type="text"
                  value={numOrdreMission}
                  onChange={(e) => setNumOrdreMission(e.target.value)}
                  placeholder="Ex: JPC/2020-01"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* 2. Donne ordre à (Nom & Prénom) */}
              <div>
                <label htmlFor="donne-ordre" className="block text-slate-700 font-semibold mb-1.5">
                  Donne ordre à (Nom &amp; Prénom)
                </label>
                <input
                  id="donne-ordre"
                  type="text"
                  value={donneOrdreA}
                  onChange={(e) => setDonneOrdreA(e.target.value)}
                  placeholder="Ex: M. Alain COULIBALY"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* 3. Pour se rendre en mission à */}
              <div>
                <label htmlFor="mission-destination" className="block text-slate-700 font-semibold mb-1.5">
                  Pour se rendre en mission à
                </label>
                <input
                  id="mission-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: AU MALAWI – TRANSIT PAR L’ÉTHIOPIE"
                  className="w-full bg-slate-50/70 border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* 4. Objet de la mission */}
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

              {/* 5. Moyen de transport */}
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
                    <option value="AVION">AVION</option>
                    <option value="VÉHICULE DE SERVICE">VÉHICULE DE SERVICE</option>
                    <option value="VÉHICULE PERSONNEL">VÉHICULE PERSONNEL</option>
                    <option value="TRANSPORT EN COMMUN / CAR">TRANSPORT EN COMMUN / CAR</option>
                    <option value="BATEAU">BATEAU</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 font-bold">
                    &#9660;
                  </div>
                </div>
              </div>

              {/* 6. Date départ & Date retour */}
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

              {/* Bouton Soumettre également accessible au bas du formulaire */}
              <div className="pt-2">
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
        </div>

        {/* ══════════════════════════════════════════════════════════
            COLONNE DROITE (5 cols) : RÉCAPITULATIF (COMME INTERVENTION)
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
          <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide m-0">
                Récapitulatif de l&apos;Ordre de Mission
              </h3>
              <span className="text-[10px] font-mono font-bold bg-orange-50 text-[#C25E00] border border-orange-200 px-2 py-0.5">
                {numOrdreMission || "JPC/2026-01"}
              </span>
            </div>

            {/* Collaborateur mandaté */}
            <div className="border border-slate-300 p-3 bg-slate-50 mb-4 text-xs">
              <span className="font-extrabold uppercase text-[10px] text-slate-500 block mb-1">
                COLLABORATEUR MANDATÉ :
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F0822A]" />
                <span className="font-bold text-slate-900 text-xs uppercase">
                  {donneOrdreA || "M. Alain COULIBALY"}
                </span>
              </div>
            </div>

            {/* Synthèse des informations de la mission */}
            <div className="flex flex-col gap-2.5 text-xs mb-4">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Lieu / Destination</span>
                <span className="font-bold text-slate-900 uppercase text-[11px] block mt-0.5">
                  {destination || "-"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Objet de la mission</span>
                <span className="font-semibold text-slate-800 text-[11px] block mt-0.5">
                  {objetMission || "-"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Moyen de transport</span>
                <span className="font-bold text-slate-900 uppercase text-[11px] block mt-0.5">
                  {moyenTransport || "AVION"}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Période &amp; Durée</span>
                <span className="font-mono font-bold text-slate-900 text-[11px] block mt-0.5">
                  Du {formatDateFr(dateDepart)} au {formatDateFr(dateRetour)}
                </span>
                <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
                  {joursOuvres} jour(s) ouvré(s) &bull; {joursCal} jour(s) calendaire(s)
                </span>
              </div>

              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Circuit de validation</span>
                <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-slate-800 bg-amber-50/80 border border-amber-200 px-2.5 py-2">
                  <span>1. Manager N+1</span>
                  <span className="text-amber-700">&rarr;</span>
                  <span>2. Direction Générale</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1.5 leading-tight">
                  L&apos;Ordre de Mission officiel signé et scellé sera téléchargeable dans <strong>Mes demandes</strong> dès approbation finale.
                </span>
              </div>
            </div>

            {/* Bouton Soumettre principal du récapitulatif */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F0822A] hover:bg-[#D96F1D] disabled:bg-slate-300 text-white font-bold text-xs py-3.5 px-4 rounded-none transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-[0.99]"
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
