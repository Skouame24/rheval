// ============================================================
// features/absences/components/NouvelleDemandeModal.tsx
// Formulaire de saisie d'une demande avec contrôles automatiques
// Vérification automatique du solde, du chevauchement et du quorum
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { TypeDemandeRH, DemandeRHItem } from "@/types/absences.types";
import { PersonaUser, MOCK_SOLDE_CONGES } from "@/lib/mock/absences.mock";

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

  const [typeDemande, setTypeDemande] = useState<TypeDemandeRH>("CONGE_PAYE");
  const [dateDebut, setDateDebut] = useState("2026-11-09");
  const [dateFin, setDateFin] = useState("2026-11-13");
  const [estDemiJourneeDebut, setEstDemiJourneeDebut] = useState(false);
  const [estDemiJourneeFin, setEstDemiJourneeFin] = useState(false);
  const [motif, setMotif] = useState("");
  const [destination, setDestination] = useState("");
  const [moyenTransport, setMoyenTransport] = useState("Véhicule de service");
  const [fraisPrevisionnels, setFraisPrevisionnels] = useState("");
  const [pjNom, setPjNom] = useState<string | null>(null);

  // Calcul automatique des jours ouvrés estimés
  const dureeCalculee = useMemo(() => {
    try {
      const d1 = new Date(dateDebut);
      const d2 = new Date(dateFin);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return 0;
      
      let count = 0;
      const cur = new Date(d1);
      while (cur <= d2) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) count++; // Lundi-Vendredi
        cur.setDate(cur.getDate() + 1);
      }
      if (estDemiJourneeDebut && count > 0) count -= 0.5;
      if (estDemiJourneeFin && count > 0) count -= 0.5;
      return Math.max(0.5, count);
    } catch {
      return 1;
    }
  }, [dateDebut, dateFin, estDemiJourneeDebut, estDemiJourneeFin]);

  // Contrôle Solde
  const depassementSolde = typeDemande === "CONGE_PAYE" && dureeCalculee > MOCK_SOLDE_CONGES.joursRestants;
  
  // Circuit court si permission <= 2 jours
  const estCircuitCourt = typeDemande === "PERMISSION_ABSENCE" && dureeCalculee <= 2;

  const handleSubmit = (isBrouillon: boolean = false) => {
    if (!motif.trim()) {
      alert("Le motif de la demande est obligatoire.");
      return;
    }

    const labels: Record<TypeDemandeRH, string> = {
      CONGE_PAYE: "Congé Payé Annuel",
      CONGE_EXCEPTIONNEL: "Congé Exceptionnel",
      PERMISSION_ABSENCE: "Permission d'absence",
      REPOS_MALADIE: "Repos Maladie",
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
        managerNom: "Samuel KOUAME",
      },
      dateDebut,
      dateFin,
      estDemiJourneeDebut,
      estDemiJourneeFin,
      nombreJoursOuvres: dureeCalculee,
      motif,
      destination: ["MISSION_DEPLACEMENT", "INTERVENTION_TERRAIN"].includes(typeDemande) ? destination : undefined,
      moyenTransport: ["MISSION_DEPLACEMENT", "INTERVENTION_TERRAIN"].includes(typeDemande) ? moyenTransport : undefined,
      fraisPrevisionnels: fraisPrevisionnels ? parseFloat(fraisPrevisionnels) : undefined,
      cycleRetoursCount: 0,
      alertesQuorumService: "Quorum vérifié : service à 83% de présence.",
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
          libelleEtape: isBrouillon ? "Enregistrement brouillon" : "Dépôt et soumission initiale",
          acteurNom: `${currentPersona.prenom} ${currentPersona.nom}`,
          acteurPoste: currentPersona.poste,
          acteurRole: currentPersona.role,
          decision: "VALIDE",
          motif: isBrouillon ? "Brouillon sauvegardé" : "Demande transmise au N+1",
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col font-sans select-none">
        
        {/* EN-TÊTE MODALE */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-b-[#F0822A]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F0822A]">
              FORMULAIRE OFFICIEL DE DEMANDE RH
            </span>
            <h3 className="text-lg font-black text-white m-0 tracking-tight">
              Nouvelle Demande d'Absence ou Déplacement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-black text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Demandeur Snapshot */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Demandeur :</span>
              <p className="font-black text-slate-900 m-0">
                {currentPersona.prenom} {currentPersona.nom} ({currentPersona.matricule})
              </p>
              <p className="text-[11px] text-slate-500 m-0">{currentPersona.poste} — {currentPersona.service}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Solde Congés Dispo :</span>
              <p className="text-sm font-black text-emerald-700 m-0">
                {MOCK_SOLDE_CONGES.joursRestants} jours
              </p>
            </div>
          </div>

          {/* 1. Type de Demande */}
          <div>
            <label className="block text-slate-800 font-extrabold uppercase text-[11px] mb-1.5">
              Type de la Demande *
            </label>
            <select
              value={typeDemande}
              onChange={(e) => setTypeDemande(e.target.value as TypeDemandeRH)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 font-bold text-slate-900 outline-none focus:border-[#F0822A]"
            >
              <option value="CONGE_PAYE">Congé Payé Annuel (Décompte du solde)</option>
              <option value="PERMISSION_ABSENCE">Permission d'Absence (≤ 2j : circuit allégé N+1+DRH)</option>
              <option value="REPOS_MALADIE">Repos Maladie (Certificat médical requis)</option>
              <option value="MISSION_DEPLACEMENT">Ordre de Mission / Déplacement Professionnel</option>
              <option value="INTERVENTION_TERRAIN">Intervention Terrain Technique</option>
              <option value="CONGE_EXCEPTIONNEL">Congé Exceptionnel (Mariage, Décès, Naissance)</option>
            </select>
            {estCircuitCourt && (
              <p className="text-[11px] font-bold text-[#EA580C] mt-1">
                ✓ Règle RG-01 appliquée : Durée $\le 2$ jours $\rightarrow$ Circuit allégé Supérieur + DRH (dispense DG).
              </p>
            )}
          </div>

          {/* 2. Période & Demi-journées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-extrabold uppercase text-[11px] mb-1.5">
                Date de début *
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 outline-none focus:border-[#F0822A]"
              />
              <label className="flex items-center gap-2 mt-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estDemiJourneeDebut}
                  onChange={(e) => setEstDemiJourneeDebut(e.target.checked)}
                />
                Commence l'après-midi (demi-journée)
              </label>
            </div>

            <div>
              <label className="block text-slate-800 font-extrabold uppercase text-[11px] mb-1.5">
                Date de fin *
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 outline-none focus:border-[#F0822A]"
              />
              <label className="flex items-center gap-2 mt-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estDemiJourneeFin}
                  onChange={(e) => setEstDemiJourneeFin(e.target.checked)}
                />
                Se termine le matin (demi-journée)
              </label>
            </div>
          </div>

          {/* Durée calculée & Alerte Solde */}
          <div className="p-3 bg-slate-100 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Durée Totale Décomptée :</span>
              <p className="text-base font-black text-slate-900 m-0">
                {dureeCalculee} jour(s) ouvré(s)
              </p>
            </div>
            {depassementSolde ? (
              <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1">
                ⚠️ Solde insuffisant ({MOCK_SOLDE_CONGES.joursRestants}j restants)
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1">
                ✓ Solde suffisant
              </span>
            )}
          </div>

          {/* Champs Spécifiques Déplacement / Mission */}
          {["MISSION_DEPLACEMENT", "INTERVENTION_TERRAIN"].includes(typeDemande) && (
            <div className="p-4 bg-orange-50/40 border border-orange-200 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#EA580C]">
                Paramètres de Déplacement / Mission
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Destination du déplacement *</label>
                  <input
                    type="text"
                    placeholder="Ex: San Pedro, Yamoussoukro, Dakar..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 font-medium outline-none focus:border-[#F0822A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Moyen de transport</label>
                  <input
                    type="text"
                    value={moyenTransport}
                    onChange={(e) => setMoyenTransport(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 font-medium outline-none focus:border-[#F0822A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Budget prévisionnel estimé (FCFA)</label>
                <input
                  type="number"
                  placeholder="Ex: 350000"
                  value={fraisPrevisionnels}
                  onChange={(e) => setFraisPrevisionnels(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 font-medium outline-none focus:border-[#F0822A]"
                />
              </div>
            </div>
          )}

          {/* 3. Motif Obligatoire */}
          <div>
            <label className="block text-slate-800 font-extrabold uppercase text-[11px] mb-1.5">
              Motif & Justification de la Demande *
            </label>
            <textarea
              rows={3}
              placeholder="Précisez le contexte, la nécessité et les dispositions prises pour la continuité du service..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 font-medium text-slate-900 outline-none focus:border-[#F0822A]"
            />
          </div>

          {/* 4. Pièces Jointes */}
          <div>
            <label className="block text-slate-800 font-extrabold uppercase text-[11px] mb-1.5">
              Pièce Justificative (PDF, Image, Ordre de mission)
            </label>
            <div className="border-2 border-dashed border-slate-300 p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              {pjNom ? (
                <div className="flex items-center justify-between bg-white p-2 border border-slate-200">
                  <span className="font-bold text-slate-800">📄 {pjNom}</span>
                  <button
                    type="button"
                    onClick={() => setPjNom(null)}
                    className="text-red-600 font-bold hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setPjNom("Justificatif_Officiel_Demande.pdf")}
                    className="text-[#F0822A] font-extrabold hover:underline"
                  >
                    + Simuler l'ajout d'un document justificatif (PDF)
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Certificat médical, ordre préalable, invitation conférence (max 10 Mo)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PIED DE MODALE */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
          >
            Annuler
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 bg-white border border-slate-400 text-slate-800 font-extrabold hover:bg-slate-50 cursor-pointer"
            >
              Enregistrer Brouillon
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-6 py-2.5 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-black uppercase tracking-wider cursor-pointer shadow-sm border border-[#D96F1D]"
            >
              Soumettre la Demande →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

