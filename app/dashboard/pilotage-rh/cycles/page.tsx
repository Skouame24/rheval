// ============================================================
// app/dashboard/rh/cycles/page.tsx
// Page "Cycles d'Évaluation" RH — Refonte Premium Agilly
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModalCreerCycle } from "@/features/evaluation/components/ModalCreerCycle";
import { RocketIcon, CalendarIcon, CheckCircleIcon, UsersIcon } from "@/components/ui/Icons";

const INITIAL_CYCLES = [
  { annee: "2026", libelle: "Campagne d'Évaluation de Performance AGILLY 2026", debut: "01/06/2026", fin: "31/12/2026", statut: "En cours", participants: 24, cloturees: 18 },
  { annee: "2025", libelle: "Campagne d'Évaluation de Performance AGILLY 2025", debut: "01/06/2025", fin: "31/12/2025", statut: "Clôturé", participants: 22, cloturees: 22 },
];

export default function CyclesRhPage() {
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [cycles, setCycles] = useState(INITIAL_CYCLES);

  const cycleEnCours = cycles.find(c => c.statut === "En cours");
  const cyclesClotures = cycles.filter(c => c.statut === "Clôturé");

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full">
        
        <ModalCreerCycle
          isOpen={isNewCycleOpen}
          onClose={() => setIsNewCycleOpen(false)}
          onSuccess={() => {
            setCycles([
              { annee: "2027", libelle: "Campagne d'Évaluation de Performance AGILLY 2027", debut: "01/01/2027", fin: "31/12/2027", statut: "En cours", participants: 0, cloturees: 0 },
              ...cycles.map(c => c.statut === "En cours" ? { ...c, statut: "Clôturé" } : c)
            ]);
            setIsNewCycleOpen(false);
          }}
        />

        {/* ── HEADER ── */}
        <div className="flex flex-wrap justify-between items-end gap-5 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-semibold text-agilly-black m-0 tracking-tight">
              Cycles d'Évaluation
            </h1>
            <p className="text-sm font-medium text-agilly-gray m-0 mt-1">
              Paramétrage et pilotage des campagnes d'évaluation de performance
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsNewCycleOpen(true)}
              className="btn-primary"
            >
              <RocketIcon size={16} />
              Nouveau Cycle
            </button>
          </div>
        </div>

        {/* ── CYCLE EN COURS ── */}
        <div>
          <h2 className="text-sm font-bold text-agilly-gray uppercase tracking-wider mb-4">Cycle Actif</h2>
          {cycleEnCours ? (
            <div className="bg-white border border-gray-200 border-l-4 border-l-agilly-primary shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <RocketIcon size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-white bg-agilly-primary px-2 py-1 uppercase tracking-wider mb-2 inline-block">
                      CYCLE {cycleEnCours.annee} EN COURS
                    </span>
                    <h3 className="text-xl font-bold text-agilly-black m-0">{cycleEnCours.libelle}</h3>
                  </div>
                  <button className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 transition-colors">
                    Clôturer la campagne
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 text-agilly-primary flex items-center justify-center">
                      <CalendarIcon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-agilly-gray font-semibold m-0">Période</p>
                      <p className="text-sm font-bold text-agilly-black m-0">Du {cycleEnCours.debut} au {cycleEnCours.fin}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center">
                      <UsersIcon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-agilly-gray font-semibold m-0">Participants</p>
                      <p className="text-sm font-bold text-agilly-black m-0">{cycleEnCours.participants} Salariés engagés</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center">
                      <CheckCircleIcon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-agilly-gray font-semibold m-0">Fiches Clôturées</p>
                      <p className="text-sm font-bold text-agilly-black m-0">{cycleEnCours.cloturees} / {cycleEnCours.participants}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-agilly-gray">Progression Globale</span>
                    <span className="text-xs font-bold text-agilly-primary">
                      {Math.round((cycleEnCours.cloturees / cycleEnCours.participants) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div 
                      className="bg-agilly-primary h-2" 
                      style={{ width: `${(cycleEnCours.cloturees / cycleEnCours.participants) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 p-8 text-center">
              <p className="text-agilly-gray font-medium">Aucun cycle n'est actuellement en cours.</p>
            </div>
          )}
        </div>

        {/* ── HISTORIQUE DES CYCLES ── */}
        <div className="mt-4">
          <h2 className="text-sm font-bold text-agilly-gray uppercase tracking-wider mb-4">Historique des Campagnes</h2>
          
          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-agilly-gray uppercase tracking-wider">
                  <th className="p-4 w-24">Année</th>
                  <th className="p-4">Libellé</th>
                  <th className="p-4">Période</th>
                  <th className="p-4">Taux de complétion</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {cyclesClotures.map(c => (
                  <tr key={c.annee} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-bold text-agilly-black">{c.annee}</td>
                    <td className="p-4 text-sm font-semibold text-agilly-black">{c.libelle}</td>
                    <td className="p-4 text-sm text-agilly-gray">{c.debut} - {c.fin}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 h-1.5">
                          <div className="bg-green-500 h-1.5" style={{ width: `${(c.cloturees / c.participants) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                          {Math.round((c.cloturees / c.participants) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 uppercase">
                        {c.statut}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-xs font-semibold text-agilly-primary hover:underline">
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
                {cyclesClotures.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-agilly-gray">
                      Aucun historique disponible.
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
