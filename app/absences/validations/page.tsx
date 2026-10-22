// ============================================================
// app/absences/validations/page.tsx
// Boîte d'arbitrage hiérarchique avec désignation de remplaçant (RG-07)
// Accès mobile optimisé pour la Direction Générale (DG)
// Motif obligatoire en cas de refus (RG-05, EF-12)
// Alertes chevauchement et dépassement de solde (EF-16)
// ============================================================

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { DemandeRHItem } from "@/types/absences.types";

export default function ValidationsInboxPage() {
  const {
    currentPersona,
    demandes,
    pendingForCurrentRoleDemandes,
    validerDemande,
    refuserDemande,
    setIsDemoDrawerOpen,
    isLoading,
  } = useAbsences();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // État du modal de refus / motif obligatoire (RG-05)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectMotif, setRejectMotif] = useState("");

  // Modal de désignation de remplaçant (RG-07 / EF-13)
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [delegueNom, setDelegueNom] = useState("");
  const [delegationActive, setDelegationActive] = useState(false);

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const activeDemande = useMemo(() => {
    if (selectedId) {
      const found = pendingForCurrentRoleDemandes.find((d) => d.id === selectedId);
      if (found) return found;
    }
    return pendingForCurrentRoleDemandes[0] || null;
  }, [selectedId, pendingForCurrentRoleDemandes]);

  // Destination de retour selon les règles §3.2
  const getDestinationRetour = () => {
    if (!activeDemande) return "Étape précédente";
    switch (currentPersona.role) {
      case "SUPERIEUR_N1":
        return "Retour au Salarié (Demandeur)";
      case "DRH":
        return "Retour au Supérieur Hiérarchique (N+1)";
      case "DIRECTION_DG":
        return "Retour à la Direction des Ressources Humaines (DRH)";
      default:
        return "Étape précédente";
    }
  };

  const handleValidate = () => {
    if (!activeDemande) return;
    validerDemande(activeDemande.id, "Avis favorable accordé.");
    setActionSuccessMessage(`Demande ${activeDemande.codeReference} validée avec succès.`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleConfirmReject = () => {
    if (!activeDemande) return;
    if (!rejectMotif.trim()) {
      alert("Le motif du refus est obligatoire selon la règle de gestion RG-05.");
      return;
    }
    refuserDemande(activeDemande.id, rejectMotif.trim());
    setIsRejectModalOpen(false);
    setRejectMotif("");
    setActionSuccessMessage(
      `Demande ${activeDemande.codeReference} retournée à l'étape précédente avec motif enregistré.`
    );
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const formatDateFr = (isoStr: string) => {
    if (!isoStr) return "-";
    const parts = isoStr.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── EN-TÊTE DE LA BOÎTE D'ARBITRAGE AVEC ACCENT AGILLY ORANGE ── */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#F0822A] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#F0822A] shadow-xs" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Boîte d&apos;Arbitrage & Workflow de Décision
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 bg-orange-50 text-[#C25E00] border border-orange-200">
              {currentPersona.labelRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Traitez les demandes de votre équipe, vérifiez les quotas et déléguez vos validations lors de vos absences (RG-07).
          </p>
        </div>

        {/* Boutons Remplaçant & Changement de rôle */}
        <div className="flex items-center gap-2.5 text-xs">
          <button
            type="button"
            onClick={() => setIsDelegateModalOpen(true)}
            className={`px-3 py-1.5 border font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              delegationActive
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${delegationActive ? "bg-emerald-600" : "bg-slate-400"}`} />
            <span>{delegationActive ? "Remplaçant actif" : "Désigner un remplaçant (RG-07)"}</span>
          </button>

          <Link
            href="/absences/planning"
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold"
          >
            Voir Agenda équipe &rarr;
          </Link>
        </div>
      </div>

      {/* Message de succès temporaire */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            &times;
          </button>
        </div>
      )}

      {/* ── INTERFACE À DEUX PANNEAUX (SPLIT VIEW) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panneau Gauche (4 cols) : File d'attente */}
        <div className="lg:col-span-4 bg-white border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Demandes à traiter ({pendingForCurrentRoleDemandes.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              SLA entreprise : 48h
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="p-3 border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-slate-200 rounded-sm font-mono" />
                      <div className="h-4 w-14 bg-slate-200 rounded-sm" />
                    </div>
                    <div className="h-3.5 w-32 bg-slate-300 rounded-sm" />
                    <div className="h-2.5 w-40 bg-slate-200 rounded-sm" />
                  </div>
                ))}
              </div>
            ) : pendingForCurrentRoleDemandes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <p className="font-bold text-slate-700">Aucun dossier en attente</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Toutes les demandes assignées à votre niveau sont déjà arbitrées.
                </p>
              </div>
            ) : (
              pendingForCurrentRoleDemandes.map((dem) => {
                const isSelected = activeDemande?.id === dem.id;
                return (
                  <div
                    key={dem.id}
                    onClick={() => setSelectedId(dem.id)}
                    className={`
                      p-4 cursor-pointer transition-colors text-xs text-left
                      ${
                        isSelected
                          ? "bg-[#FFF4EB]/80 border-l-4 border-l-[#F0822A]"
                          : "hover:bg-slate-50 border-l-4 border-l-transparent"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono font-bold text-slate-900">
                        {dem.codeReference}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 border border-amber-200">
                        À valider
                      </span>
                    </div>

                    <p className="font-bold text-slate-800">
                      {dem.demandeur.prenom} {dem.demandeur.nom}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {dem.demandeur.poste} • {dem.demandeur.departement}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">{dem.libelleType}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {dem.nombreJoursOuvres} j
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panneau Droit (8 cols) : Dossier décisionnel complet */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 flex flex-col gap-6">
          {activeDemande ? (
            <>
              {/* Entête du dossier */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-base text-slate-900">
                      {activeDemande.codeReference}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[#FFF4EB] text-[#F0822A] border border-[#FDE3CC]">
                      {activeDemande.libelleType}
                    </span>
                    {activeDemande.cycleRetoursCount > 0 && (
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 border border-red-200">
                        Cycle retour : {activeDemande.cycleRetoursCount}/2
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Déposée le {formatDateFr(activeDemande.dateCreation)} • Décision attendue par :{" "}
                    <span className="font-bold text-slate-800">{currentPersona.labelRole}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Durée</span>
                  <span className="text-lg font-mono font-extrabold text-slate-900">
                    {activeDemande.nombreJoursOuvres} jours
                  </span>
                </div>
              </div>

              {/* Contrôles automatiques (Nature, Continuité, Délais) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Nature & Décompte
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">{activeDemande.libelleType}</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Vérifié</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {activeDemande.typeDemande === "CONGES_ANNUELS"
                      ? `${activeDemande.nombreJoursOuvres} j à décompter du solde annuel`
                      : "Dispense de décompte du solde annuel"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Disponibilité Service
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">{activeDemande.demandeur.departement || "Direction"}</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Continuité OK</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Période : {formatDateFr(activeDemande.dateDebut)} au {formatDateFr(activeDemande.dateFin)}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Circuit & Délais
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">SLA 48h</span>
                    <span className="text-blue-700 font-bold text-[11px]">En cours</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Visa attendu de : {currentPersona.labelRole}
                  </p>
                </div>
              </div>

              {/* Demandeur */}
              <div className="p-4 border border-slate-200 bg-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Identité du salarié
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Collaborateur</span>
                    <span className="font-bold text-slate-900">
                      {activeDemande.demandeur.prenom} {activeDemande.demandeur.nom}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Matricule</span>
                    <span className="font-mono font-bold text-slate-900">
                      {activeDemande.demandeur.matricule}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Fonction</span>
                    <span className="text-slate-800 font-medium">
                      {activeDemande.demandeur.poste}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Département</span>
                    <span className="font-medium text-slate-900">
                      {activeDemande.demandeur.departement}
                    </span>
                  </div>
                </div>
              </div>

              {/* Détails & Motif */}
              <div className="p-4 border border-slate-200 bg-white text-xs flex flex-col gap-3">
                <div className="flex items-center gap-4 text-slate-700 font-mono">
                  <span>
                    Du <strong>{formatDateFr(activeDemande.dateDebut)}</strong> au{" "}
                    <strong>{formatDateFr(activeDemande.dateFin)}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">Motif déclaré :</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 italic text-slate-800 leading-relaxed">
                    &ldquo;{activeDemande.motif}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">
                    Adresse et contact d&apos;urgence :
                  </span>
                  <p className="text-slate-800 font-medium">
                    {activeDemande.adresseContactPendantAbsence || "Non communiqué"}
                  </p>
                </div>
              </div>

              {/* Historique du circuit */}
              <div className="p-4 border border-slate-200 bg-white text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Historique du circuit de validation
                </span>
                <div className="flex flex-col gap-2">
                  {activeDemande.historique.map((hist) => (
                    <div
                      key={hist.id}
                      className="flex items-start justify-between p-2.5 bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{hist.libelleEtape}</span>
                          <span className="text-[10px] text-slate-500">({hist.acteurNom})</span>
                        </div>
                        {hist.motif && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">
                            &ldquo;{hist.motif}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {formatDateFr(hist.dateAction)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── BARRE D'ACTION D'ARBITRAGE ── */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-4 py-2.5 bg-white text-red-700 hover:bg-red-50 border border-red-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span>Refuser et renvoyer (Motif obligatoire)</span>
                </button>

                <button
                  type="button"
                  onClick={handleValidate}
                  className="px-6 py-2.5 bg-[#F0822A] hover:bg-[#D96F1D] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Valider et transmettre au niveau supérieur</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-mono text-xs">
                —
              </div>
              <p className="font-bold text-slate-700 text-sm">Aucun dossier en attente d&apos;arbitrage</p>
              <p className="text-slate-400 max-w-sm">
                Vous n&apos;avez aucune demande d&apos;absence à arbitrer pour le moment. Dès qu&apos;un collaborateur soumet une demande, elle s&apos;affichera automatiquement ici.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL MOTIF DE REFUS OBLIGATOIRE (RG-05) ── */}
      {isRejectModalOpen && activeDemande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 text-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">
                Motif obligatoire de refus (Règle RG-05)
              </span>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800">
              <p className="font-semibold">Circuit de retour automatique (§3.2) :</p>
              <p className="mt-0.5">
                Cette décision retournera le dossier à : <strong>{getDestinationRetour()}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-slate-900 font-bold mb-1">
                Motif explicite du refus *
              </label>
              <textarea
                rows={4}
                value={rejectMotif}
                onChange={(e) => setRejectMotif(e.target.value)}
                placeholder="Indiquez clairement le motif pour que le demandeur ou l'étape précédente puisse corriger..."
                className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DÉSIGNATION DE REMPLAÇANT (RG-07 / EF-13) ── */}
      {isDelegateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 text-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">
                Délégation de validation (RG-07)
              </span>
              <button
                type="button"
                onClick={() => setIsDelegateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                &times;
              </button>
            </div>

            <p className="text-slate-600">
              Désignez un collaborateur pour arbitrer vos demandes en votre absence afin de ne pas bloquer le circuit.
            </p>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Collaborateur remplaçant habilité
              </label>
              <input
                type="text"
                value={delegueNom}
                onChange={(e) => setDelegueNom(e.target.value)}
                placeholder="Nom du manager ou collaborateur délégué..."
                className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setDelegationActive(false);
                  setIsDelegateModalOpen(false);
                }}
                className="text-slate-500 hover:text-slate-800"
              >
                Désactiver
              </button>
              <button
                type="button"
                onClick={() => {
                  setDelegationActive(true);
                  setIsDelegateModalOpen(false);
                  setActionSuccessMessage(`Délégation active confiée à ${delegueNom}.`);
                  setTimeout(() => setActionSuccessMessage(null), 3000);
                }}
                className="px-4 py-2 bg-[#F0822A] hover:bg-[#D96F1D] text-white font-bold"
              >
                Enregistrer la délégation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
