// ============================================================
// app/absences/validations/page.tsx
// Boîte d'arbitrage hiérarchique à 2 panneaux (Split View)
// Dédiée aux approbateurs : Supérieur N+1, DRH, Direction Générale
// Respect strict du Design System IBM Carbon x Agilly Corporate
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
  } = useAbsences();

  // Demande active sélectionnée dans le panneau de droite
  const [selectedId, setSelectedId] = useState<string | null>(
    pendingForCurrentRoleDemandes[0]?.id || demandes[0]?.id || null
  );

  // État du modal de refus / motif obligatoire (RG-05)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectMotif, setRejectMotif] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const activeDemande = useMemo(() => {
    return (
      demandes.find((d) => d.id === selectedId) ||
      pendingForCurrentRoleDemandes[0] ||
      demandes[0] ||
      null
    );
  }, [demandes, selectedId, pendingForCurrentRoleDemandes]);

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
      {/* ── EN-TÊTE DE LA BOÎTE D'ARBITRAGE ── */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-[#F0822A]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Boîte d&apos;Arbitrage & Validations Hiérarchiques
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
              Rôle : {currentPersona.labelRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Examen des demandes de congés, permissions et ordres de mission soumis à votre niveau d&apos;approbation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDemoDrawerOpen(true)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors"
          >
            Changer de valideur (N+1 / DRH / DG)
          </button>
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

      {/* ── INTERFACE À DEUX PANNEAUX (SPLIT VIEW 240/320px GAUCHE, FLUIDE DROITE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panneau Gauche (4 cols) : File d'attente des demandes */}
        <div className="lg:col-span-4 bg-white border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              File d&apos;attente ({pendingForCurrentRoleDemandes.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Filtre : {currentPersona.labelRole.split(" ")[0]}
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {pendingForCurrentRoleDemandes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <p className="font-bold text-slate-700">Aucun dossier en attente</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Toutes les demandes assignées à votre niveau sont déjà arbitrées.
                </p>
                <button
                  type="button"
                  onClick={() => setIsDemoDrawerOpen(true)}
                  className="mt-3 px-2.5 py-1 text-[11px] font-semibold text-[#F0822A] bg-[#FFF4EB] border border-[#FDE3CC]"
                >
                  Tester un autre valideur &rarr;
                </button>
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
                      <span className="text-[10px] font-semibold font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 border border-amber-200">
                        En attente
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

        {/* Panneau Droit (8 cols) : Détail complet & Dossier décisionnel */}
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
                    Déposée le {formatDateFr(activeDemande.dateCreation)} • Examen requis par :{" "}
                    <span className="font-bold text-slate-800">{currentPersona.labelRole}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Durée demandée</span>
                  <span className="text-lg font-mono font-extrabold text-slate-900">
                    {activeDemande.nombreJoursOuvres} jours ouvrés
                  </span>
                </div>
              </div>

              {/* Contexte décisionnel & Règles de gestion (RG-02, RG-03, RG-04) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Solde collaborateur */}
                <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Solde Congés Payés (RG-02)
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">14.5 j restants</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Suffisant</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Solde après validation :{" "}
                    <span className="font-mono font-bold text-slate-800">
                      {14.5 - activeDemande.nombreJoursOuvres} j
                    </span>
                  </p>
                </div>

                {/* Quorum de service */}
                <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Effectif Service DSI (RG-04)
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">85.7% de présence</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Quorum OK</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Seuil minimum légal (50%) respecté.
                  </p>
                </div>

                {/* Chevauchements équipe */}
                <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Chevauchements (RG-03)
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">0 conflit direct</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Clair</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Aucun doublon sur le même poste clé.
                  </p>
                </div>
              </div>

              {/* Fiche d'identité du demandeur */}
              <div className="p-4 border border-slate-200 bg-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Identité du salarié (Bulletin officiel)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Collaborateur</span>
                    <span className="font-bold text-slate-900">
                      {activeDemande.demandeur.prenom} {activeDemande.demandeur.nom}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Matricule RH</span>
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
                    <span className="text-slate-400 text-[10px] block">N° CNSS</span>
                    <span className="font-mono text-slate-800">
                      {activeDemande.demandeur.numeroCnss || "CI-0019284729-A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Détails de la permission & Période */}
              <div className="p-4 border border-slate-200 bg-white text-xs flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Détail de la demande
                </span>
                <div className="flex items-center gap-4 text-slate-700 font-mono">
                  <span>
                    Du <strong>{formatDateFr(activeDemande.dateDebut)}</strong> au{" "}
                    <strong>{formatDateFr(activeDemande.dateFin)}</strong> (inclus)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">
                    Motif déclaré par le collaborateur :
                  </span>
                  <p className="p-3 bg-slate-50 border border-slate-200 italic text-slate-800 leading-relaxed">
                    &ldquo;{activeDemande.motif}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">
                    Adresse et contact pendant l&apos;absence :
                  </span>
                  <p className="text-slate-800 font-medium">
                    {activeDemande.adresseContactPendantAbsence || "Non communiqué"}
                  </p>
                </div>
              </div>

              {/* Frise d'audit historique */}
              <div className="p-4 border border-slate-200 bg-white text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Historique du circuit de validation
                </span>
                <div className="flex flex-col gap-2.5">
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
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {new Date(hist.dateAction).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── BARRE D'ACTION FIXE D'ARBITRAGE (VALIDER / REFUSER ET RENVOYER) ── */}
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
                  <span>Refuser et renvoyer</span>
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
            <div className="p-12 text-center text-slate-400 text-xs">
              Sélectionnez une demande dans la liste de gauche pour afficher le dossier.
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL DE REFUS AVEC MOTIF OBLIGATOIRE (RG-05) ── */}
      {isRejectModalOpen && activeDemande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsRejectModalOpen(false)}
          />
          <div className="relative bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Refus et renvoi de la demande ({activeDemande.codeReference})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <div className="my-4 flex flex-col gap-3">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800">
                <p className="font-bold">Règle de gestion RG-05 & Circuit de retour :</p>
                <p className="mt-1">
                  Cette décision renverra le dossier à l&apos;acteur précédent :{" "}
                  <strong>{getDestinationRetour()}</strong>. Le motif renseigné ci-dessous sera
                  notifié et tracé dans le journal d&apos;audit.
                </p>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">
                  Motif obligatoire du refus / révision *
                </label>
                <textarea
                  rows={4}
                  value={rejectMotif}
                  onChange={(e) => setRejectMotif(e.target.value)}
                  placeholder="Expliquez avec précision la raison du refus (ex: charge d'équipe incompatible, justificatif manquant, modification de dates demandée)..."
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
              >
                Confirmer le refus et renvoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
