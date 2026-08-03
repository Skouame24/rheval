// ============================================================
// app/dashboard/rh/page.tsx
// Dashboard RH — Refonte IBM Carbon / Agilly Minimalist
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FicheEvaluationModal } from "@/features/evaluation/components/FicheEvaluationModal";
import { ModalCreerCycle } from "@/features/evaluation/components/ModalCreerCycle";
import { ModalArbitrageRH } from "@/features/evaluation/components/ModalArbitrageRH";
import {
  ChartBarIcon,
  UsersIcon,
  ScaleIcon,
  StarIcon,
  RocketIcon,
  DownloadIcon,
  CheckCircleIcon,
  EyeIcon,
  AlertTriangleIcon,
} from "@/components/ui/Icons";

const INITIAL_DOSSIERS_RH = [
  { id: "1", nom: "KOUAME", prenom: "Ebenezer Samuel", poste: "Dev Full-Stack (IA)", direction: "Executive", n1: "Sevan AKOUMIA", noteN1: 18.5, noteN2: 18.0, statut: "EN_ATTENTE_RH", statutLabel: "En attente Validation RH" },
  { id: "2", nom: "Koné", prenom: "Mariam", poste: "Designer UI/UX", direction: "Executive", n1: "Sevan AKOUMIA", noteN1: 17.5, noteN2: 14.0, statut: "ARBITRAGE", statutLabel: "ARBITRAGE (Écart 3.5 pts)" },
  { id: "3", nom: "Bah", prenom: "Oumar", poste: "Dev Mobile", direction: "Technique", n1: "Sevan AKOUMIA", noteN1: 15.0, noteN2: 15.0, statut: "VALIDE", statutLabel: "Validé & Clôturé" },
  { id: "4", nom: "Camara", prenom: "Aissatou", poste: "QA Engineer", direction: "Technique", n1: "Sevan AKOUMIA", noteN1: 14.5, noteN2: 14.5, statut: "VALIDE", statutLabel: "Validé & Clôturé" },
  { id: "5", nom: "Sylla", prenom: "Mamadou", poste: "DevOps", direction: "Infrastructure", n1: "Sevan AKOUMIA", noteN1: 17.0, noteN2: 17.0, statut: "VALIDE", statutLabel: "Validé & Clôturé" },
];

export default function RhDashboardPage() {
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [selectedFicheModal, setSelectedFicheModal] = useState<string | null>(null);
  const [arbitrageModalItem, setArbitrageModalItem] = useState<any | null>(null);
  const [dossiers, setDossiers] = useState(INITIAL_DOSSIERS_RH);
  const [filterStatut, setFilterStatut] = useState<string>("TOUT");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeCycle, setActiveCycle] = useState<{
    annee: string;
    libelle: string;
    debut: string;
    fin: string;
    statut: "EN_COURS" | "CLOTURE";
  } | null>({
    annee: "2026",
    libelle: "Campagne d'Évaluation de Performance AGILLY 2026",
    debut: "01/06/2026",
    fin: "31/12/2026",
    statut: "EN_COURS",
  });

  const arbitragesEnAttente = dossiers.filter(d => d.statut === "ARBITRAGE");

  const filteredDossiers = dossiers.filter(d => {
    const matchFilter = filterStatut === "TOUT" || d.statut === filterStatut;
    const matchSearch = (d.prenom + " " + d.nom + " " + d.poste + " " + d.direction).toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleArbitrageSuccess = (id: string, noteFinale: number, commentaire: string) => {
    setDossiers(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statut: "VALIDE",
          statutLabel: `Validé après Arbitrage RH (${noteFinale}/20 - ${((noteFinale / 20) * 100).toFixed(1)}%)`,
          noteN1: noteFinale,
          noteN2: noteFinale,
        };
      }
      return d;
    }));
  };

  return (
    <AppShell role="RH" userName="Pôle Ressources Humaines" userEmail="drh@agilly.com" notifCount={5}>
      <div className="flex flex-col gap-8 pb-10 max-w-[1400px] mx-auto">

        {/* Modals */}
        <ModalCreerCycle
          isOpen={isNewCycleOpen}
          onClose={() => setIsNewCycleOpen(false)}
          onSuccess={() => {
            setActiveCycle({
              annee: "2027",
              libelle: "Campagne d'Évaluation de Performance AGILLY 2027",
              debut: "01/01/2027",
              fin: "31/12/2027",
              statut: "EN_COURS",
            });
          }}
        />
        <FicheEvaluationModal 
          isOpen={selectedFicheModal !== null} 
          onClose={() => setSelectedFicheModal(null)} 
          dossier={dossiers.find(d => d.id === selectedFicheModal)}
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
            <h1 className="text-2xl font-semibold text-agilly-black m-0 tracking-tight">
              Centre de Pilotage RH
            </h1>
            <p className="text-sm font-medium text-agilly-gray m-0 mt-1">
              {activeCycle ? `${activeCycle.libelle}` : "Aucun exercice d'évaluation en cours"}
            </p>
          </div>

          {activeCycle && activeCycle.statut === "EN_COURS" ? (
            <div className="flex items-center gap-4 bg-white border border-gray-200 px-5 py-3 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-agilly-primary animate-pulse" />
              <div>
                <span className="text-[10px] font-bold text-agilly-primary uppercase tracking-wider block">
                  CYCLE {activeCycle.annee} EN COURS
                </span>
                <p className="text-xs font-semibold text-agilly-black m-0 mt-0.5">
                  Du {activeCycle.debut} au {activeCycle.fin}
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm("Voulez-vous clôturer l'exercice en cours ?")) {
                    setActiveCycle(null);
                  }
                }}
                className="ml-4 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
              >
                Clôturer
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsNewCycleOpen(true)}
              className="btn-primary"
            >
              <RocketIcon size={16} />
              Lancer un Nouveau Cycle
            </button>
          )}
        </div>

        {/* ── LAYOUT 2 PILIERS ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* PILIER 1 (8 COLS) : RADAR DE COMPLÉTION */}
          <div className="col-span-12 xl:col-span-8">
            <div className="bg-white border border-gray-200 p-6 h-full shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-agilly-black m-0 tracking-tight">
                    Radar de Performance 2026
                  </h3>
                </div>
                <span className="text-xs font-bold text-agilly-primary bg-orange-50 px-3 py-1.5 border border-orange-100">
                  18 / 24 Fiches Clôturées
                </span>
              </div>

              {/* ANNEAU GRADUÉ */}
              <div className="flex items-center gap-8 mb-8 bg-gray-50 p-6 border border-gray-200">
                <div className="relative w-[120px] h-[120px] shrink-0">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#F0822A"
                      strokeWidth="12"
                      strokeDasharray="314"
                      strokeDashoffset="78"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-agilly-black leading-none">75%</span>
                    <span className="text-[9px] font-bold text-agilly-primary uppercase mt-1">GLOBAL</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-agilly-black m-0 mb-1">
                    Progression globale de l'exercice
                  </h4>
                  <p className="text-sm text-agilly-gray m-0 mb-4">
                    75% des fiches d'évaluation de performance sont entièrement validées et signées par les parties.
                  </p>
                  <div className="flex gap-4 text-xs font-semibold">
                    <span className="text-agilly-primary flex items-center gap-1"><span className="w-2 h-2 bg-agilly-primary rounded-full"></span> 21 Saisies N+1</span>
                    <span className="text-blue-600 flex items-center gap-1"><span className="w-2 h-2 bg-blue-600 rounded-full"></span> 19 Validations N+2</span>
                    <span className="text-red-600 flex items-center gap-1"><span className="w-2 h-2 bg-red-600 rounded-full"></span> 2 Arbitrages</span>
                  </div>
                </div>
              </div>

              {/* Taux par étape */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "1. Saisie N+1", count: "21 / 24", pct: "87.5%", color: "text-agilly-primary" },
                  { label: "2. Validation N+2", count: "19 / 24", pct: "79.1%", color: "text-blue-600" },
                  { label: "3. Arbitrage RH", count: "2 Litiges", pct: "En cours", color: "text-red-600" },
                  { label: "4. Clôture", count: "18 / 24", pct: "75.0%", color: "text-green-600" },
                ].map((st, i) => (
                  <div key={i} className="bg-white p-4 border border-gray-200">
                    <span className="text-[10px] font-bold text-agilly-gray uppercase">{st.label}</span>
                    <p className="text-xl font-bold text-agilly-black m-0 mt-1 mb-1">{st.count}</p>
                    <span className={`text-xs font-bold ${st.color}`}>{st.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PILIER 2 (4 COLS) : STATION D'ARBITRAGE */}
          <div className="col-span-12 xl:col-span-4">
            <div className="bg-agilly-black text-white p-6 border border-gray-800 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold text-agilly-primary uppercase tracking-widest">
                    ARBITRAGE RH
                  </span>
                  <span className="text-[10px] font-bold text-red-500 bg-red-950 px-2 py-1 border border-red-900">
                    {arbitragesEnAttente.length} ALERTE(S)
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white m-0 mb-4 tracking-tight">
                  Priorités d'Arbitrage
                </h3>

                {arbitragesEnAttente.length > 0 ? (
                  <div className="bg-gray-900 border border-gray-800 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangleIcon size={16} color="#ef4444" />
                      <span className="text-sm font-semibold text-white">
                        Fiche {arbitragesEnAttente[0].prenom} {arbitragesEnAttente[0].nom}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 m-0 leading-relaxed">
                      Désaccord majeur : N+1 ({arbitragesEnAttente[0].noteN1}/20) vs N+2 ({arbitragesEnAttente[0].noteN2}/20).
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => setArbitrageModalItem(arbitragesEnAttente[0])}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <ScaleIcon size={14} color="#FFFFFF" />
                        Ouvrir la Séance
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Aucun désaccord en attente.</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-800 flex gap-3">
                <button
                  onClick={() => alert("Génération du Pack Excel Officiel Agilly.net...")}
                  className="flex-1 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <DownloadIcon size={14} color="#FFFFFF" /> Excel
                </button>
                <button
                  onClick={() => alert("Génération du Rapport PDF officiel...")}
                  className="flex-1 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <DownloadIcon size={14} color="#FFFFFF" /> PDF
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── RECHERCHE & CARTES DE PILOTAGE DE TOUS LES SALARIÉS ── */}
        <div className="mt-4">
          {/* Barre d'Action & Filtres */}
          <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-agilly-black m-0 tracking-tight">
                Dossiers d'Évaluations Salariés
              </h2>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              {/* Recherche */}
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-carbon w-64 bg-white"
              />

              {/* Filtres par Statut */}
              <div className="flex bg-white border border-gray-200">
                {[
                  { id: "TOUT", label: "Toutes" },
                  { id: "EN_ATTENTE_RH", label: "En attente" },
                  { id: "ARBITRAGE", label: "Arbitrage" },
                  { id: "VALIDE", label: "Validées" },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatut(f.id)}
                    className={`
                      px-4 py-2 text-xs font-semibold transition-colors
                      ${filterStatut === f.id
                        ? 'bg-agilly-black text-white'
                        : 'text-agilly-gray hover:bg-gray-50 border-r border-gray-200 last:border-0'
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDossiers.map((item) => {
              const borderColorClass = item.statut === "ARBITRAGE" ? "border-l-red-600" : item.statut === "VALIDE" ? "border-l-green-600" : "border-l-agilly-primary";

              return (
                <div
                  key={item.id}
                  className={`bg-white border border-gray-200 border-l-4 ${borderColorClass} p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all`}
                >
                  <div>
                    {/* Header Profil (Cliquable pour consulter les détails) */}
                    <div 
                      onClick={() => setSelectedFicheModal(item.id)}
                      className="flex items-center gap-4 mb-4 cursor-pointer group"
                      title="Cliquer pour voir la Fiche Officielle du Salarié"
                    >
                      <div className="w-12 h-12 bg-[#FFF7ED] text-[#F0822A] font-extrabold text-lg flex items-center justify-center border border-[#FFEDD5] group-hover:bg-[#F0822A] group-hover:text-white transition-all">
                        {item.prenom.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 m-0 group-hover:text-[#F0822A] transition-colors">{item.prenom} {item.nom}</h4>
                        <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5">{item.poste} · {item.direction}</p>
                      </div>
                    </div>

                    {/* Bloc comparatif */}
                    <div className="bg-slate-50 p-4 border border-slate-200 mb-4 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Manager N+1 ({item.n1}) :</span>
                        <span className="text-sm font-extrabold text-[#F0822A]">{item.noteN1} / 20</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Direction N+2 :</span>
                        <span className="text-sm font-extrabold text-blue-600">{item.noteN2} / 20</span>
                      </div>
                    </div>

                    {/* Statut pastille */}
                    <div className="mb-5">
                      <span className={`
                        text-[10px] font-extrabold px-3 py-1.5 border uppercase tracking-wider block text-center
                        ${item.statut === "ARBITRAGE" ? "bg-red-50 text-red-600 border-red-200" :
                          item.statut === "VALIDE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                        }
                      `}>
                        {item.statutLabel}
                      </span>
                    </div>
                  </div>

                  {/* BOUTONS D'ACTION DUO : CONSULTER FICHE + ACTION SPÉCIFIQUE */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedFicheModal(item.id)}
                      className="flex-1 py-2.5 px-3 bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Voir le dossier complet, les objectifs et les signatures"
                    >
                      <EyeIcon size={14} /> Fiche Détaillée
                    </button>

                    {item.statut === "ARBITRAGE" ? (
                      <button
                        onClick={() => setArbitrageModalItem(item)}
                        className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ScaleIcon size={14} /> Arbitrer
                      </button>
                    ) : item.statut === "EN_ATTENTE_RH" ? (
                      <button
                        onClick={() => {
                          setDossiers(prev => prev.map(d => d.id === item.id ? { ...d, statut: "VALIDE", statutLabel: "Validé & Clôturé par RH" } : d));
                          alert(`Le dossier de ${item.prenom} ${item.nom} a été validé et clôturé avec succès !`);
                        }}
                        className="flex-1 py-2.5 px-3 bg-[#F0822A] hover:bg-[#d97220] text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircleIcon size={14} /> Valider
                      </button>
                    ) : (
                      <span className="flex-1 py-2.5 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1">
                        ✓ Clôturé
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </AppShell>
  );
}

