// ============================================================
// app/absences/missions/nouvelle/page.tsx
// Formulaire de l'Ordre de Mission Officiel
// Rendu conforme au modèle fourni :
//  - "Paramètres de l'Ordre de Mission" (carte de saisie exacte)
//  - Prévisualisation A4 en direct & Export/Impression PDF A4
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

  // Champs exacts du modèle utilisateur
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

  const handlePrint = () => {
    window.print();
  };

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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── EN-TÊTE DE NAVIGATION (MASQUÉ À L'IMPRESSION) ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F0822A]" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Nouvel Ordre de Mission
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Renseignez les paramètres ci-dessous. Le document officiel A4 est mis à jour en direct et prêt pour le circuit de validation.
          </p>
        </div>

        <Link
          href="/absences"
          className="text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 px-3.5 py-1.5 bg-white transition-all shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          &larr; Retour à l&apos;Espace Absences
        </Link>
      </div>

      {/* ── DISPOSITION EN 2 COLONNES : FORMULAIRE À GAUCHE + PRÉVISUALISATION A4 À DROITE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════
            COLONNE GAUCHE (5 cols) : CARTE EXACTE DU MODÈLE UTILISATEUR
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5 print:hidden">
          <h2 className="text-base font-bold text-slate-900 m-0">
            Paramètres de l&apos;Ordre de Mission
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
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
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
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
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
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
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
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
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
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
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3.5 py-2.5 pr-8 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none appearance-none transition-colors cursor-pointer"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-depart" className="block text-slate-700 font-semibold mb-1.5">
                  Date départ
                </label>
                <input
                  id="date-depart"
                  type="date"
                  value={dateDepart}
                  onChange={(e) => setDateDepart(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
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
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#F0822A] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* 7. Bouton principal exact du modèle : Imprimer / Exporter PDF A4 */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer mt-2 active:scale-[0.99]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Imprimer / Exporter PDF A4</span>
            </button>

            {/* Bouton de transmission au workflow d'entreprise */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Transmission en cours..." : "Transmettre pour validation N+1 \u2192"}</span>
            </button>
          </form>
        </div>

        {/* ══════════════════════════════════════════════════════════
            COLONNE DROITE (7 cols) : DOCUMENT OFFICIEL A4 EN DIRECT
            ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="printable-a4-mission"
            className="bg-white border border-slate-300 shadow-md w-full max-w-[620px] min-h-[750px] p-8 sm:p-12 text-slate-900 flex flex-col justify-between font-sans rounded-none print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
          >
            <div className="flex flex-col gap-7">
              {/* En-tête Agilly */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt="Agilly"
                      width={34}
                      height={34}
                      className="object-contain"
                    />
                    <span className="text-2xl font-black tracking-tight text-slate-900">
                      agil<span className="text-[#F0822A]">ly</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">
                    Services Manag&eacute;s &bull; Cloud &amp; Cyber S&eacute;curit&eacute;
                  </span>
                </div>

                <div className="text-right text-[11px] text-slate-600 leading-snug">
                  <p className="m-0 font-medium">22 rue des Carrossiers</p>
                  <p className="m-0 font-medium">Treichville - Zone 3</p>
                  <p className="m-0 font-medium">Abidjan, C&ocirc;te d&apos;Ivoire</p>
                </div>
              </div>

              {/* Titre & Sous-titre officiel */}
              <div className="text-center pt-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 m-0">
                  ORDRE DE MISSION N&deg; {numOrdreMission || "JPC/2026-01"}
                </h1>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#F0822A] mt-2 mb-0">
                  LE DIRECTEUR G&Eacute;N&Eacute;RAL
                </h2>
              </div>

              {/* Mentions obligatoires en direct */}
              <div className="flex flex-col gap-4 text-xs pt-4 px-2 sm:px-6">
                <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                  <span className="col-span-5 font-bold text-slate-800">
                    Donne ordre &agrave; :
                  </span>
                  <span className="col-span-7 font-extrabold uppercase text-slate-900">
                    {donneOrdreA || "M. Alain COULIBALY"}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                  <span className="col-span-5 font-bold text-slate-800">
                    Pour se rendre en mission &agrave; :
                  </span>
                  <span className="col-span-7 font-bold uppercase text-slate-900">
                    {destination || "AU MALAWI – TRANSIT PAR L’ÉTHIOPIE"}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                  <span className="col-span-5 font-bold text-slate-800">
                    Objet de la mission :
                  </span>
                  <span className="col-span-7 font-bold uppercase text-slate-900">
                    {objetMission || "ASSISTANCE TECHNIQUE"}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                  <span className="col-span-5 font-bold text-slate-800">
                    Moyen de transport :
                  </span>
                  <span className="col-span-7 font-bold uppercase text-slate-900">
                    {moyenTransport || "AVION"}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                  <span className="col-span-5 font-bold text-slate-800">
                    Date de d&eacute;part :
                  </span>
                  <span className="col-span-7 font-mono font-bold text-slate-900">
                    {formatDateFr(dateDepart)}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-baseline">
                  <span className="col-span-5 font-bold text-slate-800">
                    Date de retour :
                  </span>
                  <span className="col-span-7 font-mono font-bold text-slate-900">
                    {formatDateFr(dateRetour)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature DG en bas à droite */}
            <div className="pt-16 flex flex-col items-end text-right px-2 sm:px-6">
              <span className="text-xs text-slate-700 italic">
                Fait &agrave; Abidjan, le {formatDateFr(new Date().toISOString())}
              </span>
              <div className="mt-5 flex flex-col items-center">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  M. G&Eacute;RARD KONAN
                </span>
                <span className="text-[11px] text-slate-600 font-medium">
                  Directeur G&eacute;n&eacute;ral
                </span>
                <span className="text-[9px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  &check; Sign&eacute; &amp; Scell&eacute; &eacute;lectroniquement
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
