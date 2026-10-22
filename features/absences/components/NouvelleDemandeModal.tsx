// ============================================================
// features/absences/components/NouvelleDemandeModal.tsx
// Formulaire officiel de demande de permission — Bulletin Individuel
// Conforme à la maquette institutionnelle Agilly
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { TypeDemandeRH, DemandeRHItem } from "@/types/absences.types";
import { PersonaUser } from "@/types/absences.types";
import { useAbsences } from "../context/AbsencesContext";

interface NouvelleDemandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: PersonaUser;
  onSubmit: (nouvelleDemande: DemandeRHItem) => void;
}

export function NouvelleDemandeModal({
  isOpen,
  onClose,
  currentPersona,
  onSubmit,
}: NouvelleDemandeModalProps) {
  if (!isOpen) return null;

  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGES_ANNUELS");
  const [dateDebut, setDateDebut] = useState("2026-11-09");
  const [dateFin, setDateFin] = useState("2026-11-13");
  const [motif, setMotif] = useState("");
  const [adresseContact, setAdresseContact] = useState("Abidjan, Contact: " + currentPersona.matricule);
  const [numeroCnss, setNumeroCnss] = useState(currentPersona.numeroCnss || "CI-0019284729-A");
  const [destination, setDestination] = useState("");
  const [moyenTransport, setMoyenTransport] = useState("Véhicule de service");
  const [fraisPrevisionnels, setFraisPrevisionnels] = useState("");
  const [pjNom, setPjNom] = useState<string | null>(null);

  // Calcul du nombre de jours calendaires et ouvrés
  const { joursOuvres, joursCalendaires } = useMemo(() => {
    try {
      const d1 = new Date(dateDebut);
      const d2 = new Date(dateFin);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return { joursOuvres: 0, joursCalendaires: 0 };
      
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclus
      
      let countOuvres = 0;
      const cur = new Date(d1);
      while (cur <= d2) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) countOuvres++;
        cur.setDate(cur.getDate() + 1);
      }
      return { joursOuvres: Math.max(1, countOuvres), joursCalendaires: diffDays };
    } catch {
      return { joursOuvres: 1, joursCalendaires: 1 };
    }
  }, [dateDebut, dateFin]);

  const { soldeConges } = useAbsences();
  const depassementSolde = typeDemande === "CONGES_ANNUELS" && joursOuvres > soldeConges.joursRestants;
  const estCircuitCourt = typeDemande === "PERMISSION_EXCEPTIONNELLE" && joursOuvres <= 2;

  const handleSubmit = (isBrouillon: boolean = false) => {
    if (!motif.trim()) {
      alert("Le motif de la permission est obligatoire.");
      return;
    }

    const labels: Record<TypeDemandeRH, string> = {
      CONGES_ANNUELS: "Congés Annuels",
      CONGES_MALADIE: "Congés Maladie",
      CONGES_MATERNITE: "Congés Maternité",
      RECUPERATION: "Récupération",
      ABSENCE_NON_PAYEE: "Absence autorisée non payée",
      PERMISSION_EXCEPTIONNELLE: "Permission Exceptionnelle",
      MISSION_DEPLACEMENT: "Mission / Déplacement",
      INTERVENTION_TERRAIN: "Intervention Terrain",
    };

    const newId = `dem-${Date.now()}`;
    const newRef = `DEM-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const nouvelleDemande: DemandeRHItem = {
      id: newId,
      codeReference: newRef,
      typeDemande,
      libelleType: labels[typeDemande],
      statut: isBrouillon ? "BROUILLON" : "EN_VALIDATION_N1",
      etapeCourante: "SUPERIEUR_N1",
      demandeur: {
        id: currentPersona.id,
        matricule: currentPersona.matricule,
        nom: currentPersona.nom,
        prenom: currentPersona.prenom,
        email: currentPersona.email,
        poste: currentPersona.poste,
        departement: currentPersona.departement,
        service: currentPersona.service,
        telephone: "+225 07 00 00 00 00",
        numeroCnss: numeroCnss,
        managerNom: "Christian BAMBA",
      },
      dateDebut,
      dateFin,
      nombreJoursOuvres: joursOuvres,
      nombreJoursCalendaires: joursCalendaires,
      motif,
      adresseContactPendantAbsence: adresseContact,
      destination: ["MISSION_DEPLACEMENT", "INTERVENTION_TERRAIN"].includes(typeDemande) ? destination : undefined,
      moyenTransport: ["MISSION_DEPLACEMENT", "INTERVENTION_TERRAIN"].includes(typeDemande) ? moyenTransport : undefined,
      fraisPrevisionnels: fraisPrevisionnels ? parseFloat(fraisPrevisionnels) : undefined,
      cycleRetoursCount: 0,
      alertesQuorumService: "Quorum DSI conforme (85.7% de présence en poste).",
      piecesJointes: pjNom
        ? [
            {
              id: `pj-${Date.now()}`,
              nomOriginal: pjNom,
              taille: "1.2 Mo",
              typeMime: "application/pdf",
              urlFichier: "#",
              dateUpload: new Date().toISOString(),
            },
          ]
        : [],
      historique: [
        {
          id: `hist-${Date.now()}`,
          etape: "SUPERIEUR_N1",
          libelleEtape: isBrouillon ? "Enregistrement brouillon" : "Dépôt Formulaire Bulletin Individuel",
          acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
          acteurPoste: currentPersona.poste,
          acteurRole: currentPersona.role,
          decision: "VALIDE",
          motif: isBrouillon ? "Brouillon sauvegardé" : "Demande transmise pour visa hiérarchique",
          dateAction: new Date().toISOString(),
        },
      ],
      dateCreation: new Date().toISOString(),
      dateDerniereAction: new Date().toISOString(),
    };

    onSubmit(nouvelleDemande);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col font-sans">
        
        {/* EN-TÊTE DU FORMULAIRE */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[11px] font-bold text-[#F0822A] uppercase tracking-wider block">
              Bulletin Individuel Officiel
            </span>
            <h3 className="text-base font-bold text-slate-900 m-0">
              FORMULAIRE DE DEMANDE DE PERMISSION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            ✕
          </button>
        </div>

        {/* CORPS DU FORMULAIRE CONFORME À LA FICHE */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* 1. SECTION IDENTIFICATION DU SALARIÉ (CONFORME TABLEAU EXCEL) */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <div className="bg-slate-50/70 px-4 py-2 text-slate-700 font-semibold text-[11px] border-b border-slate-100 flex justify-between items-center">
              <span>Identification du Salarié</span>
              <span className="text-slate-400 font-normal">Pré-rempli depuis le dossier RH</span>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Matricule</label>
                <input
                  type="text"
                  disabled
                  value={currentPersona.matricule}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Nom, prénoms</label>
                <input
                  type="text"
                  disabled
                  value={`${currentPersona.nom} ${currentPersona.prenom}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Fonction</label>
                <input
                  type="text"
                  disabled
                  value={currentPersona.poste}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Département</label>
                <input
                  type="text"
                  disabled
                  value={currentPersona.departement}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">N° CNSS (Caisse Nationale)</label>
                <input
                  type="text"
                  value={numeroCnss}
                  onChange={(e) => setNumeroCnss(e.target.value)}
                  placeholder="Ex: CI-0019284729-A"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-900 text-xs outline-none focus:border-[#F0822A]"
                />
              </div>
            </div>
          </div>

          {/* 2. SECTION TYPE DE PERMISSION (CASES À COCHER DU BULLETIN) */}
          <div>
            <label className="block text-slate-800 font-semibold mb-2">
              Type de permission sollicitée :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: "CONGES_ANNUELS", label: "Congés Annuels" },
                { id: "CONGES_MALADIE", label: "Congés Maladie" },
                { id: "CONGES_MATERNITE", label: "Congés Maternité" },
                { id: "RECUPERATION", label: "Récupération" },
                { id: "ABSENCE_NON_PAYEE", label: "Absence autorisée non payée" },
                { id: "PERMISSION_EXCEPTIONNELLE", label: "Permission Exceptionnelle" },
                { id: "MISSION_DEPLACEMENT", label: "Ordre de Mission / Déplacement" },
                { id: "INTERVENTION_TERRAIN", label: "Intervention Terrain" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setTypeDemande(opt.id as any)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    typeDemande === opt.id
                      ? "bg-orange-50/70 border-[#F0822A] text-slate-900 font-semibold shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                      typeDemande === opt.id
                        ? "bg-[#F0822A] border-[#F0822A] text-white font-bold"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {typeDemande === opt.id ? "✓" : ""}
                  </span>
                  <span className="text-xs">{opt.label}</span>
                </label>
              ))}
            </div>
            {estCircuitCourt && (
              <p className="text-[11px] text-emerald-700 font-medium mt-1.5">
                ✓ Permission courte ($\le 2$ jours) : circuit court allégé (N+1 et DRH uniquement).
              </p>
            )}
          </div>

          {/* 3. PÉRIODE & NOMBRE DE JOURS */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Du (Date de début) *</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-900 text-xs outline-none focus:border-[#F0822A]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Au (Date de fin inclus) *</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-900 text-xs outline-none focus:border-[#F0822A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="text-slate-600 font-medium">
                  Nombre de jours : <strong className="text-slate-900 font-bold">{joursCalendaires} jours</strong> (calendaires)
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 font-medium">
                  <strong className="text-[#EA580C] font-bold">{joursOuvres} jours</strong> ouvrés décomptés
                </span>
              </div>

              {depassementSolde ? (
                <span className="text-rose-700 font-semibold text-xs bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  ⚠️ Solde insuffisant ({soldeConges.joursRestants}j disponibles)
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ✓ Solde conforme ({soldeConges.joursRestants}j restants)
                </span>
              )}
            </div>
          </div>

          {/* 4. MOTIF DE LA PERMISSION */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Motif de la permission * :
            </label>
            <textarea
              rows={2}
              placeholder="Précisez la raison de l'absence..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-[#F0822A] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* 5. ADRESSE ET CONTACT TÉLÉPHONIQUE (EXACT DU BULLETIN EXCEL) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Adresse et contact téléphonique pendant l'absence * :
            </label>
            <input
              type="text"
              placeholder="Ex: Abidjan Cocody, Tél: +225 07 00 00 00 00"
              value={adresseContact}
              onChange={(e) => setAdresseContact(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-[#F0822A] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* CHAMPS COMPLÉMENTAIRES SI MISSION */}
          {["MISSION_DEPLACEMENT", "INTERVENTION_TERRAIN"].includes(typeDemande) && (
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2.5">
              <span className="text-xs font-semibold text-slate-800 block">
                Paramètres de mission / déplacement
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Destination</label>
                  <input
                    type="text"
                    placeholder="Ex: San Pedro, Yamoussoukro..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-[#F0822A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Moyen de transport</label>
                  <input
                    type="text"
                    value={moyenTransport}
                    onChange={(e) => setMoyenTransport(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-[#F0822A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. PIÈCE JOINTE OPTIONNELLE */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Justificatif (certificat médical, convocation)
            </label>
            <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              {pjNom ? (
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">📄 {pjNom}</span>
                  <button
                    type="button"
                    onClick={() => setPjNom(null)}
                    className="text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPjNom("Justificatif_Permission.pdf")}
                  className="text-xs font-semibold text-[#F0822A] hover:text-[#D96F1D] cursor-pointer"
                >
                  + Ajouter une pièce justificative
                </button>
              )}
            </div>
          </div>

        </div>

        {/* PIED DE MODALE ET SIGNATURE */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/40 flex-wrap gap-3">
          <div className="text-slate-400 text-[11px]">
            <span>Signature du salarié : </span>
            <strong className="text-slate-700 font-semibold">Horodatée le {new Date().toLocaleDateString("fr-FR")}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 rounded-lg bg-[#F0822A] hover:bg-[#D96F1D] text-white font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              Signer & Transmettre la Demande
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
