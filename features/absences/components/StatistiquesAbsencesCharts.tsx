// ============================================================
// features/absences/components/StatistiquesAbsencesCharts.tsx
// Tableaux de bord et visualisations graphiques conformes à la charte Agilly
// Standardisé IBM Carbon x Agilly Design System (Bords carrés, Jauge SVG, Barres)
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
  const circonference = 2 * Math.PI * 45; // r = 45 -> ~282.74

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      {/* ── LIGNE 1 : KPI STAT CARDS (STYLE CARBON) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : En attente */}
        <div className="bg-white border border-slate-200 p-5 flex items-center justify-between border-l-4 border-l-[#F0822A] hover:border-slate-300 transition-colors shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              En attente de validation
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalDemandesEnCours}
              </span>
              <span className="text-xs font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 border border-orange-200">
                Action requise
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Délai moyen actuel : <span className="font-bold text-slate-800">28h</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-[#FFF7ED] text-[#F0822A] flex items-center justify-center border border-[#FFEDD5]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>

        {/* KPI 2 : Approuvées */}
        <div className="bg-white border border-slate-200 p-5 flex items-center justify-between border-l-4 border-l-emerald-500 hover:border-slate-300 transition-colors shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Validées ce mois
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalApprouvees}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                +14% vs M-1
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Taux d'approbation : <span className="font-bold text-slate-800">95.8%</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>

        {/* KPI 3 : Permissions Éditées & Archivées */}
        <div className="bg-white border border-slate-200 p-5 flex items-center justify-between border-l-4 border-l-blue-600 hover:border-slate-300 transition-colors shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Archives GED & Permissions
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalArchives}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
                PDF Sécurisés
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Durée conservation : <span className="font-bold text-slate-800">5 ans</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
        </div>

        {/* KPI 4 : Taux de Présence */}
        <div className="bg-white border border-slate-200 p-5 flex items-center justify-between border-l-4 border-l-purple-600 hover:border-slate-300 transition-colors shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Taux de Présence Entreprise
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {tauxPresenceGlobal}%
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 border border-purple-200">
                Quorum OK
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Tous services &gt; 50% d'effectif
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── LIGNE 2 : GRAPHIQUES ET RADARS DE SURVEILLANCE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BLOC GAUCHE (7 COLS) : JAUGE CIRCULAIRE & QUORUM PAR SERVICE */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 m-0 uppercase tracking-tight">
                Suivi de Continuité de Service & Quorums d'Effectifs (RG-04)
              </h2>
              <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                Vérification automatique du seuil minimum de 50% de collaborateurs présents
              </p>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1">
              Conforme à 100%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
            {/* Jauge Annulaire Circulaire SVG (Charte Agilly #F0822A) */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#F0822A"
                  strokeWidth="12"
                  strokeDasharray={circonference}
                  strokeDashoffset={circonference - (circonference * tauxPresenceGlobal) / 100}
                  strokeLinecap="butt"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {tauxPresenceGlobal}%
                </span>
                <span className="text-[9px] font-black text-[#F0822A] uppercase mt-1 tracking-wider">
                  PRÉSENTS
                </span>
              </div>
            </div>

            {/* Légende et Détails */}
            <div className="flex-1 space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Règle de gestion RG-04 en application
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Chaque validation de congé ou de mission évalue instantanément l'impact sur le département. En cas de passage sous le seuil critique de 50%, le validateur est averti d'une alerte bloquante.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="w-3 h-3 bg-[#F0822A] inline-block"/> Présents en poste
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="w-3 h-3 bg-slate-300 inline-block"/> Absences autorisées
                </div>
              </div>
            </div>
          </div>

          {/* Barres de Taux de Présence par Département */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {MOCK_STATS_SERVICES.map((srv, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{srv.service}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">
                      {srv.totalEffectif - srv.enCongeActuellement}/{srv.totalEffectif} présents
                    </span>
                    <span className="font-black text-slate-900 w-12 text-right">
                      {srv.tauxPresence.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      srv.tauxPresence >= 75
                        ? "bg-emerald-500"
                        : srv.tauxPresence >= 50
                        ? "bg-[#F0822A]"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${srv.tauxPresence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOC DROIT (5 COLS) : RÉPARTITION PAR TYPE DE DEMANDE */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 m-0 uppercase tracking-tight">
                  Typologie des Demandes
                </h2>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  Répartition mensuelle des 48 requêtes
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#F0822A] bg-orange-50 border border-orange-200 px-2 py-0.5">
                Mois en cours
              </span>
            </div>

            <div className="space-y-4">
              {MOCK_REPARTITION_TYPES.map((t, idx) => (
                <div key={idx} className="bg-slate-50 p-3 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 inline-block" style={{ backgroundColor: t.hex }} />
                      <span className="font-extrabold text-slate-900">{t.type}</span>
                    </div>
                    <span className="font-black text-slate-800">
                      {t.count} ({t.pourcentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${t.pourcentage}%`, backgroundColor: t.hex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-900 text-white text-xs border border-slate-800">
            <div className="flex items-center gap-2 mb-1 text-[#F0822A] font-extrabold uppercase text-[10px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Circuit Court Conditionnel (RG-01)
            </div>
            <p className="text-slate-300 font-medium leading-relaxed m-0 text-[11px]">
              Les autorisations d'absence de courte durée ($\le 2$ jours) sont soumises à une procédure allégée (validation Supérieur N+1 et DRH), sans solliciter la Direction Générale.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

