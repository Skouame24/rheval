// ============================================================
// app/dashboard/pilotage-rh/page.tsx
// Dashboard RH — 100% Données Réelles Neon PostgreSQL & Agilly Design System
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalCreerCycle } from "@/features/evaluation/components/ModalCreerCycle";
import { ModalArbitrageRH } from "@/features/evaluation/components/ModalArbitrageRH";
import {
  ScaleIcon,
  RocketIcon,
  CheckCircleIcon,
  EyeIcon,
  AlertTriangleIcon,
  ArrowPathIcon,
  FileSpreadsheetIcon,
} from "@/components/ui/Icons";
import { evaluationsApi } from "@/lib/api/evaluations.api";
import { rhApi, type RhDashboardStats } from "@/lib/api/rh.api";
import { cyclesApi } from "@/lib/api/cycles.api";
import { exportEvaluationToExcel } from "@/lib/utils/exportExcelEvaluation";
import type { EvaluationCycle, Cycle } from "@/types";

export default function RhDashboardPage() {
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [selectedFicheModal, setSelectedFicheModal] = useState<EvaluationCycle | null>(null);
  const [arbitrageModalItem, setArbitrageModalItem] = useState<any | null>(null);

  const [dossiers, setDossiers] = useState<EvaluationCycle[]>([]);
  const [stats, setStats] = useState<RhDashboardStats | null>(null);
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatut, setFilterStatut] = useState<string>("TOUT");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [evalsRes, statsRes, cycleRes] = await Promise.all([
        evaluationsApi.getAllForRh().catch(() => []),
        rhApi.getDashboardStats().catch(() => null),
        cyclesApi.getActif().catch(() => null),
      ]);
      setDossiers(evalsRes);
      setStats(statsRes);
      setActiveCycle(cycleRes);
    } catch (err: any) {
      console.error("[RhDashboardPage] Error fetching data:", err);
      setError("Erreur de chargement des fiches d'évaluation.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Arbitrages ouverts réels
  const arbitragesEnAttente = dossiers.filter((d) => d.statut === "ARBITRAGE");

  // Filtrage
  const filteredDossiers = dossiers.filter((d) => {
    const matchFilter =
      filterStatut === "TOUT" ||
      (filterStatut === "EN_ATTENTE" && (d.statut === "EN_ATTENTE_RH" || d.statut === "EN_ATTENTE_N1" || d.statut === "EN_ATTENTE_N2")) ||
      d.statut === filterStatut;

    const salarieName = `${d.salarie?.prenom || ""} ${d.salarie?.nom || ""} ${d.salarie?.poste || ""}`.toLowerCase();
    const matchSearch = salarieName.includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Calculs dynamiques
  const totalSalaries = stats?.totalSalaries || dossiers.length || 0;
  const fichesCompletes = dossiers.filter((d) => ["VALIDE", "CLOTURE"].includes(d.statut)).length;
  const tauxCompletion = totalSalaries > 0 ? Math.round((fichesCompletes / totalSalaries) * 100) : 0;
  const fichesN1Done = dossiers.filter((d) => !["FIXATION_OBJECTIFS", "EN_ATTENTE_N1"].includes(d.statut)).length;
  const fichesN2Done = dossiers.filter((d) => ["VALIDATION_DRH", "EN_ATTENTE_RH", "VALIDE", "CLOTURE"].includes(d.statut)).length;

  const handleArbitrageSuccess = async () => {
    setArbitrageModalItem(null);
    await loadData();
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "FIXATION_OBJECTIFS": return "Fixation Objectifs";
      case "EN_ATTENTE_N1": return "En attente N+1";
      case "EVALUATION_N1": return "Évaluation N+1";
      case "EN_ATTENTE_N2": return "En attente N+2";
      case "VALIDATION_N2": return "Validé N+2";
      case "EN_ATTENTE_RH": return "En attente RH";
      case "ARBITRAGE": return "Arbitrage Requis";
      case "VALIDE": return "Validé & Clôturé";
      case "CLOTURE": return "Clôturé";
      default: return statut;
    }
  };

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={arbitragesEnAttente.length}>
      <div className="flex flex-col gap-8 pb-10 max-w-[1400px] mx-auto font-sans">

        {/* Modals */}
        <ModalCreerCycle
          isOpen={isNewCycleOpen}
          onClose={() => setIsNewCycleOpen(false)}
          onSuccess={async () => {
            await loadData();
          }}
        />

        <FicheEvaluationModal 
          isOpen={selectedFicheModal !== null} 
          onClose={() => setSelectedFicheModal(null)} 
          dossier={selectedFicheModal ? {
            nom: selectedFicheModal.salarie?.nom || "",
            prenom: selectedFicheModal.salarie?.prenom || "",
            poste: selectedFicheModal.salarie?.poste || "",
            direction: (selectedFicheModal.salarie as any)?.departement || "Direction",
          } : null}
          objectifs={selectedFicheModal?.objectifs || []}
          readOnly={true}
        />

        <ModalArbitrageRH
          isOpen={arbitrageModalItem !== null}
          onClose={() => setArbitrageModalItem(null)}
          dossier={arbitrageModalItem}
          onSuccess={handleArbitrageSuccess}
        />

        {/* ── HEADER HERO ── */}
        <div className="flex flex-wrap justify-between items-end gap-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0 tracking-tight">
              Centre de Pilotage RH
            </h1>
            <p className="text-sm font-semibold text-slate-500 m-0 mt-1">
              {activeCycle ? activeCycle.libelle : "Campagne d'Évaluation de Performance AGILLY"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              title="Rafraîchir les données"
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowPathIcon size={14} />
              Actualiser
            </button>

            {activeCycle && activeCycle.statut === "ACTIF" ? (
              <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-2.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F0822A] animate-pulse" />
                <div>
                  <span className="text-[10px] font-black text-[#F0822A] uppercase tracking-wider block">
                    CYCLE {activeCycle.annee} EN COURS
                  </span>
                  <p className="text-xs font-bold text-slate-800 m-0 mt-0.5">
                    Du {activeCycle.dateDebut} au {activeCycle.dateFin}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsNewCycleOpen(true)}
                className="px-4 py-2.5 bg-[#F0822A] hover:bg-[#d97220] text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RocketIcon size={16} />
                Lancer un Nouveau Cycle
              </button>
            )}
          </div>
        </div>

        {/* ── LAYOUT 2 PILIERS ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* PILIER 1 (8 COLS) : RADAR DE COMPLÉTION DYNAMIQUE */}
          <div className="col-span-12 xl:col-span-8">
            <div className="bg-white border border-slate-200 p-6 h-full shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0 tracking-tight">
                    Radar de Performance {activeCycle?.annee || new Date().getFullYear()}
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-[#F0822A] bg-orange-50 px-3 py-1.5 border border-orange-200">
                  {fichesCompletes} / {dossiers.length} Fiches Clôturées
                </span>
              </div>

              {/* ANNEAU GRADUÉ */}
              <div className="flex items-center gap-8 mb-8 bg-slate-50 p-6 border border-slate-200">
                <div className="relative w-[120px] h-[120px] shrink-0">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#F0822A"
                      strokeWidth="12"
                      strokeDasharray="314"
                      strokeDashoffset={314 - (314 * tauxCompletion) / 100}
                      strokeLinecap="butt"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">{tauxCompletion}%</span>
                    <span className="text-[9px] font-black text-[#F0822A] uppercase mt-1">GLOBAL</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 m-0 mb-1">
                    Progression globale de l'exercice
                  </h4>
                  <p className="text-sm text-slate-600 m-0 mb-4 font-medium">
                    {dossiers.length > 0 
                      ? `${tauxCompletion}% des fiches d'évaluation de performance sont entièrement validées.`
                      : "Aucune fiche d'évaluation en cours dans le cycle actuel."}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-bold">
                    <span className="text-[#F0822A] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#F0822A] rounded-full inline-block" /> {fichesN1Done} Saisies N+1
                    </span>
                    <span className="text-blue-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block" /> {fichesN2Done} Validations N+2
                    </span>
                    <span className="text-red-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" /> {arbitragesEnAttente.length} Arbitrage(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Taux par étape */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "1. Saisie N+1", count: `${fichesN1Done} / ${dossiers.length}`, color: "text-[#F0822A]" },
                  { label: "2. Validation N+2", count: `${fichesN2Done} / ${dossiers.length}`, color: "text-blue-600" },
                  { label: "3. Arbitrage RH", count: `${arbitragesEnAttente.length} Litige(s)`, color: "text-red-600" },
                  { label: "4. Clôture", count: `${fichesCompletes} / ${dossiers.length}`, color: "text-emerald-600" },
                ].map((st, i) => (
                  <div key={i} className="bg-white p-4 border border-slate-200">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{st.label}</span>
                    <p className="text-xl font-black text-slate-900 m-0 mt-1 mb-1">{st.count}</p>
                    <span className={`text-xs font-extrabold ${st.color}`}>En temps réel</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PILIER 2 (4 COLS) : STATION D'ARBITRAGE */}
          <div className="col-span-12 xl:col-span-4">
            <div className="bg-slate-900 text-white p-6 border border-slate-800 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-[#F0822A] uppercase tracking-widest">
                    ARBITRAGE RH
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 border ${arbitragesEnAttente.length > 0 ? "text-red-400 bg-red-950/60 border-red-800" : "text-emerald-400 bg-emerald-950/60 border-emerald-800"}`}>
                    {arbitragesEnAttente.length} ALERTE(S)
                  </span>
                </div>

                <h3 className="text-lg font-black text-white m-0 mb-4 tracking-tight">
                  Priorités d'Arbitrage
                </h3>

                {arbitragesEnAttente.length > 0 ? (
                  <div className="bg-slate-800/80 border border-slate-700 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangleIcon size={16} color="#ef4444" />
                      <span className="text-sm font-bold text-white">
                        Fiche {arbitragesEnAttente[0].salarie?.prenom} {arbitragesEnAttente[0].salarie?.nom}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 m-0 leading-relaxed font-medium">
                      Écart de notation constaté entre l'évaluation du Manager N+1 et la Direction N+2.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => setArbitrageModalItem({
                          id: arbitragesEnAttente[0].id,
                          nom: arbitragesEnAttente[0].salarie?.nom,
                          prenom: arbitragesEnAttente[0].salarie?.prenom,
                          poste: arbitragesEnAttente[0].salarie?.poste,
                          direction: (arbitragesEnAttente[0].salarie as any)?.departement || "Direction",
                          noteN1: (arbitragesEnAttente[0] as any).evaluationN1?.moyenneNotes ?? 0,
                          noteN2: (arbitragesEnAttente[0] as any).evaluationN2?.moyenneNotes ?? 0,
                        })}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ScaleIcon size={14} color="#FFFFFF" />
                        Ouvrir la Séance d'Arbitrage
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/40 border border-slate-800 p-5 text-center my-6">
                    <CheckCircleIcon size={32} color="#10B981" />
                    <p className="text-xs text-slate-300 font-bold mt-2 mb-0">Aucun litige ou désaccord en attente.</p>
                    <p className="text-[11px] text-slate-500 mt-1 mb-0">Tous les dossiers sont alignés.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (dossiers.length > 0) {
                      exportEvaluationToExcel(dossiers[0]);
                    } else {
                      alert("Aucune fiche d'évaluation disponible pour l'export.");
                    }
                  }}
                  className="w-full py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheetIcon size={14} color="#10B981" /> Télécharger Fiche Officielle (.xlsx)
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── DOSSIERS D'ÉVALUATIONS SALARIÉS ── */}
        <div className="mt-4">
          {/* Barre d'Action & Filtres */}
          <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0 tracking-tight">
                Dossiers d'Évaluations Salariés
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1 mb-0">
                {dossiers.length} fiche(s) chargée(s) depuis la base de données
              </p>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              {/* Recherche */}
              <input
                type="text"
                placeholder="Rechercher un salarié..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold border border-slate-300 bg-white w-64 outline-none focus:border-[#F0822A]"
              />

              {/* Filtres par Statut */}
              <div className="flex bg-white border border-slate-200">
                {[
                  { id: "TOUT", label: `Toutes (${dossiers.length})` },
                  { id: "EN_ATTENTE", label: "En cours" },
                  { id: "ARBITRAGE", label: `Arbitrages (${arbitragesEnAttente.length})` },
                  { id: "VALIDE", label: `Validées (${fichesCompletes})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatut(f.id)}
                    className={`
                      px-4 py-2 text-xs font-bold transition-colors
                      ${filterStatut === f.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50 border-r border-slate-200 last:border-0'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grille des Cartes */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 mb-4" />
                  <div className="h-5 bg-slate-200 w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 w-1/2 mb-4" />
                  <div className="h-20 bg-slate-100 mb-4" />
                  <div className="h-10 bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filteredDossiers.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 text-center">
              <CheckCircleIcon size={40} color="#94A3B8" />
              <h4 className="text-base font-black text-slate-900 mt-4 mb-1">
                Aucun dossier d'évaluation
              </h4>
              <p className="text-xs text-slate-500 font-semibold m-0">
                {searchQuery ? "Aucune fiche ne correspond à votre recherche." : "Aucune évaluation n'a été créée pour ce cycle."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDossiers.map((item) => {
                const isArbitrage = item.statut === "ARBITRAGE";
                const isValide = ["VALIDE", "CLOTURE"].includes(item.statut);
                const borderColorClass = isArbitrage ? "border-l-red-600" : isValide ? "border-l-emerald-600" : "border-l-[#F0822A]";
                const noteAffichee = item.noteGlobale != null ? `${Number(item.noteGlobale).toFixed(1)} / 20` : "En attente";

                return (
                  <div
                    key={item.id}
                    className={`bg-white border border-slate-200 border-l-4 ${borderColorClass} p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all`}
                  >
                    <div>
                      {/* Header Profil */}
                      <div 
                        onClick={() => setSelectedFicheModal(item)}
                        className="flex items-center gap-4 mb-4 cursor-pointer group"
                        title="Cliquer pour voir la Fiche Officielle du Salarié"
                      >
                        <div className="w-12 h-12 bg-[#FFF7ED] text-[#F0822A] font-black text-lg flex items-center justify-center border border-[#FFEDD5] group-hover:bg-[#F0822A] group-hover:text-white transition-all">
                          {(item.salarie?.prenom || item.salarie?.nom || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 m-0 group-hover:text-[#F0822A] transition-colors">
                            {item.salarie?.prenom} {item.salarie?.nom}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5">
                            {item.salarie?.poste || "Collaborateur"} · {(item.salarie as any)?.departement || "Agilly"}
                          </p>
                        </div>
                      </div>

                      {/* Bloc comparatif / Statut notation */}
                      <div className="bg-slate-50 p-4 border border-slate-200 mb-4 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500">Note Finale :</span>
                          <span className="text-sm font-black text-[#F0822A]">{noteAffichee}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500">Objectifs fixés :</span>
                          <span className="text-xs font-bold text-slate-800">{item.objectifs?.length || 0} objectif(s)</span>
                        </div>
                      </div>

                      {/* Statut pastille */}
                      <div className="mb-5">
                        <span className={`
                          text-[10px] font-black px-3 py-1.5 border uppercase tracking-wider block text-center
                          ${isArbitrage ? "bg-red-50 text-red-600 border-red-200" :
                            isValide ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        `}>
                          {getStatutLabel(item.statut)}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedFicheModal(item)}
                        className="flex-1 py-2.5 px-3 bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Voir le dossier complet, les objectifs et les signatures"
                      >
                        <EyeIcon size={14} /> Fiche Détaillée
                      </button>

                      <button
                        onClick={() => exportEvaluationToExcel(item)}
                        className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Exporter au format Excel officiel Agilly"
                      >
                        <FileSpreadsheetIcon size={14} color="#059669" /> Excel
                      </button>

                      {isArbitrage && (
                        <button
                          onClick={() => setArbitrageModalItem({
                            id: item.id,
                            nom: item.salarie?.nom,
                            prenom: item.salarie?.prenom,
                            poste: item.salarie?.poste,
                            direction: (item.salarie as any)?.departement || "Direction",
                          })}
                          className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ScaleIcon size={14} /> Arbitrer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </AppShell>
  );
}
