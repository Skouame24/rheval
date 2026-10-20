// ============================================================
// features/absences/components/StatistiquesAbsencesCharts.tsx
// Tableaux de bord et métriques épurés — Clean Modern Style
// ============================================================

"use client";

import {
  MOCK_KPIS,
  MOCK_STATS_SERVICES,
  MOCK_REPARTITION_TYPES,
} from "@/lib/mock/absences.mock";

interface StatistiquesAbsencesChartsProps {
  totalDemandesEnCours: number;
  totalApprouvees: number;
  totalArchives: number;
}

export function StatistiquesAbsencesCharts({
  totalDemandesEnCours,
  totalApprouvees,
  totalArchives,
}: StatistiquesAbsencesChartsProps) {
  const tauxPresenceGlobal = 91.8;
  const circonference = 2 * Math.PI * 46;

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* ── LIGNE 1 : KPI STAT CARDS DOUCES & ÉPURÉES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : En attente */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              En attente de validation
            </p>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {totalDemandesEnCours}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                À traiter
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Délai moyen constaté : <span className="text-slate-600 font-semibold">28 heures</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#F0822A] flex items-center justify-center border border-orange-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>

        {/* KPI 2 : Approuvées */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Validées ce mois
            </p>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {totalApprouvees}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                +14%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Taux d'accord : <span className="text-slate-600 font-semibold">95.8%</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>

        {/* KPI 3 : Archives GED & Permissions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Permissions archivées (GED)
            </p>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {totalArchives}
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
                Scellées
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Conservation légale : <span className="text-slate-600 font-semibold">5 ans</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
        </div>

        {/* KPI 4 : Taux de Présence */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Taux de présence globale
            </p>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {tauxPresenceGlobal}%
              </span>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                Normal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Quorum minimum (&gt; 50%) : <span className="text-emerald-600 font-semibold">Respecté</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
          </div>
        </div>

      </div>

      {/* ── LIGNE 2 : SUIVI CONTINUITÉ & RÉPARTITION PAR NATURE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BLOC GAUCHE (7 COLS) : JAUGE CIRCULAIRE & QUORUM PAR SERVICE */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 m-0">
                  Continuité de service & Quorums d'effectif
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Surveillance du seuil minimum de 50% de collaborateurs en poste (Règle RG-04)
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                Tous les services conformes
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 bg-slate-50/60 rounded-xl p-4 border border-slate-100">
              {/* Jauge Circulaire Douce */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg width="112" height="112" viewBox="0 0 120 120" className="-rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#F0822A"
                    strokeWidth="10"
                    strokeDasharray={circonference}
                    strokeDashoffset={circonference - (circonference * tauxPresenceGlobal) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-slate-900 leading-none">
                    {tauxPresenceGlobal}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    Présents
                  </span>
                </div>
              </div>

              {/* Explication discrète */}
              <div className="flex-1 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-800 m-0">
                  Contrôle automatisé des autorisations
                </p>
                <p className="text-slate-500 leading-relaxed m-0 font-normal">
                  Chaque dépôt de congé est croisé en temps réel avec les absences déjà validées dans le service afin de garantir la continuité opérationnelle.
                </p>
              </div>
            </div>

            {/* Barres de Taux de Présence par Département */}
            <div className="space-y-3">
              {MOCK_STATS_SERVICES.map((srv, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{srv.service}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">
                        {srv.totalEffectif - srv.enCongeActuellement} sur {srv.totalEffectif} en poste
                      </span>
                      <span className="font-bold text-slate-900 w-10 text-right">
                        {srv.tauxPresence.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        srv.tauxPresence >= 75
                          ? "bg-emerald-500"
                          : srv.tauxPresence >= 50
                          ? "bg-[#F0822A]"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${srv.tauxPresence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BLOC DROIT (5 COLS) : RÉPARTITION PAR NATURE DE DEMANDE */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 m-0">
                  Typologie des demandes
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Répartition mensuelle des motifs d'absence
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                48 requêtes
              </span>
            </div>

            <div className="space-y-3">
              {MOCK_REPARTITION_TYPES.map((t, idx) => (
                <div key={idx} className="bg-slate-50/70 rounded-lg p-3 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: t.hex }} />
                      <span className="font-semibold text-slate-800">{t.type}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {t.count} <span className="font-normal text-slate-400">({t.pourcentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${t.pourcentage}%`, backgroundColor: t.hex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-orange-50/50 rounded-xl border border-orange-100 text-xs text-slate-700 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#F0822A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p className="m-0 leading-relaxed font-normal text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Circuit court conditionnel (RG-01) :</span> Les permissions $\le 2$ jours sont directement approuvées après accord du N+1 et de la DRH, sans passage obligatoire par la Direction Générale.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
