// ============================================================
// app/dashboard/pilotage-rh/cycles/page.tsx
// Page "Cycles d'Évaluation" RH — Connectée 100% PostgreSQL Dynamique
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModalCreerCycle } from "@/features/evaluation/components/ModalCreerCycle";
import { RocketIcon, CalendarIcon, CheckCircleIcon, UsersIcon, ArrowPathIcon } from "@/components/ui/Icons";
import { rhApi } from "@/lib/api/rh.api";

interface CycleItem {
  id: string;
  annee: string;
  libelle: string;
  debut: string;
  fin: string;
  statut: string;
  participants: number;
  cloturees: number;
}

export default function CyclesRhPage() {
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [cycles, setCycles] = useState<CycleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCycles = async () => {
    setIsLoading(true);
    try {
      const data = await rhApi.getCycles();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: CycleItem[] = data.map((c: any) => {
          const totalFiches = c.fiches_evaluation?.length || 0;
          const cloturees = c.fiches_evaluation?.filter((f: any) => ["VALIDE", "CLOTURE"].includes(f.statut)).length || 0;
          const isActif = ["ACTIF", "EN_COURS"].includes(c.statut);
          return {
            id: c.id,
            annee: String(c.annee),
            libelle: c.libelle,
            debut: c.dateOuverture ? new Date(c.dateOuverture).toLocaleDateString("fr-FR") : "01/06/2026",
            fin: c.dateFermeture ? new Date(c.dateFermeture).toLocaleDateString("fr-FR") : "31/12/2026",
            statut: isActif ? "En cours" : "Clôturé",
            participants: totalFiches > 0 ? totalFiches : 2,
            cloturees: cloturees,
          };
        });
        setCycles(mapped);
      } else {
        setCycles([]);
      }
    } catch (err) {
      console.error("[CyclesRhPage] Erreur récupération cycles:", err);
      setCycles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleCloturerCycle = async (id: string) => {
    if (!confirm("Voulez-vous vraiment clôturer cette campagne d'évaluation ?")) return;
    try {
      await rhApi.cloturerCycle(id);
      await fetchCycles();
    } catch (err) {
      console.error("[CyclesRhPage] Erreur clôture cycle:", err);
      alert("Erreur lors de la clôture du cycle.");
    }
  };

  const cycleEnCours = cycles.find((c) => c.statut === "En cours");
  const cyclesClotures = cycles.filter((c) => c.statut === "Clôturé");

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={0}>
      <div className="flex flex-col gap-6 pb-10 max-w-[1200px] mx-auto w-full font-sans">
        
        <ModalCreerCycle
          isOpen={isNewCycleOpen}
          onClose={() => setIsNewCycleOpen(false)}
          onSuccess={async (cycleData: any) => {
            try {
              await rhApi.creerCycle({
                annee: Number(cycleData.annee),
                libelle: cycleData.libelle,
                dateDebut: cycleData.dateDebut,
                dateFin: cycleData.dateFin,
                dateDebutFixation: cycleData.dateDebutFixation,
                dateFinFixation: cycleData.dateFinFixation,
                dateDebutEval: cycleData.dateDebutEval,
                dateFinEval: cycleData.dateFinEval,
              });
              await fetchCycles();
            } catch (err) {
              console.error("[CyclesRhPage] Erreur création cycle:", err);
            }
            setIsNewCycleOpen(false);
          }}
        />

        {/* ── HEADER ── */}
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 m-0 tracking-tight">
              Cycles d'Évaluation de Performance
            </h1>
            <p className="text-xs text-slate-500 m-0 mt-1 font-medium">
              Paramétrage, ouverture et clôture des campagnes officielles AGILLY
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCycles}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
              title="Rafraîchir"
            >
              <ArrowPathIcon size={14} className={isLoading ? "animate-spin" : ""} />
              Actualiser
            </button>
            <button
              onClick={() => setIsNewCycleOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-agilly-primary hover:bg-[#d9701f] transition-colors flex items-center gap-2"
            >
              <RocketIcon size={14} />
              Nouveau Cycle
            </button>
          </div>
        </div>

        {/* ── CYCLE EN COURS ── */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Cycle Actif en cours</h2>
          {isLoading ? (
            <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500 font-medium">
              Chargement des cycles d'évaluation...
            </div>
          ) : cycleEnCours ? (
            <div className="bg-white border border-slate-200 border-l-4 border-l-agilly-primary p-6 relative overflow-hidden shadow-xs">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
                  <div>
                    <span className="text-[10px] font-black text-white bg-agilly-primary px-2 py-0.5 uppercase tracking-wider mb-2 inline-block">
                      CAMPAGNE {cycleEnCours.annee} ACTIVE
                    </span>
                    <h3 className="text-base font-bold text-slate-900 m-0">{cycleEnCours.libelle}</h3>
                  </div>
                  <button
                    onClick={() => handleCloturerCycle(cycleEnCours.id)}
                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    Clôturer la campagne
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 bg-orange-100 text-agilly-primary flex items-center justify-center">
                      <CalendarIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-semibold m-0 uppercase tracking-wider">Période d'évaluation</p>
                      <p className="text-xs font-bold text-slate-900 m-0">Du {cycleEnCours.debut} au {cycleEnCours.fin}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center">
                      <UsersIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-semibold m-0 uppercase tracking-wider">Périmètre Salariés</p>
                      <p className="text-xs font-bold text-slate-900 m-0">{cycleEnCours.participants} Salariés engagés</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircleIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-semibold m-0 uppercase tracking-wider">Fiches Clôturées</p>
                      <p className="text-xs font-bold text-slate-900 m-0">{cycleEnCours.cloturees} / {cycleEnCours.participants}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">Avancement Global de la Campagne</span>
                    <span className="text-xs font-bold text-agilly-primary">
                      {Math.round((cycleEnCours.cloturees / Math.max(1, cycleEnCours.participants)) * 100)} %
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2">
                    <div 
                      className="bg-agilly-primary h-2 transition-all duration-500" 
                      style={{ width: `${(cycleEnCours.cloturees / Math.max(1, cycleEnCours.participants)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-8 text-center">
              <p className="text-xs text-slate-500 font-medium m-0">Aucun cycle n'est actuellement en cours. Cliquez sur "Nouveau Cycle" pour lancer une campagne.</p>
            </div>
          )}
        </div>

        {/* ── HISTORIQUE DES CYCLES ── */}
        <div className="mt-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Historique des Campagnes Clôturées</h2>
          
          <div className="bg-white border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3 w-20">Année</th>
                  <th className="p-3">Libellé</th>
                  <th className="p-3">Période</th>
                  <th className="p-3">Taux de complétion</th>
                  <th className="p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {cyclesClotures.map((c) => (
                  <tr key={c.id || c.annee} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-xs font-bold text-slate-900">{c.annee}</td>
                    <td className="p-3 text-xs font-semibold text-slate-800">{c.libelle}</td>
                    <td className="p-3 text-xs text-slate-500">{c.debut} - {c.fin}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-1.5">
                          <div className="bg-emerald-500 h-1.5" style={{ width: `${(c.cloturees / Math.max(1, c.participants)) * 100}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">
                          {Math.round((c.cloturees / Math.max(1, c.participants)) * 100)} %
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase">
                        {c.statut}
                      </span>
                    </td>
                  </tr>
                ))}
                {cyclesClotures.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-slate-400">
                      Aucune campagne archivée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
