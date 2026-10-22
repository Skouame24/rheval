// ============================================================
// features/absences/components/charts/AbsencesTypeDonutChart.tsx
// Donut de répartition par nature d'absence — Recharts
// Palette corporate : orange Agilly, ardoise, bleu marine
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAbsences } from "../../context/AbsencesContext";

const COLORS = [
  "#2563EB", // Congés annuels
  "#F0822A", // Permission exceptionnelle (accent Agilly)
  "#7C3AED", // Mission / Déplacement
  "#059669", // Congés maladie
  "#D97706", // Récupération
  "#64748B", // Absence non payée
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    pourcentage: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white border border-slate-200 p-2.5 shadow-md text-xs">
        <p className="font-bold text-slate-900">{data.name}</p>
        <p className="text-slate-600 mt-1 font-mono">
          <span className="font-bold text-slate-900">{data.value} demandes</span> ({data.payload.pourcentage}%)
        </p>
      </div>
    );
  }
  return null;
}

export function AbsencesTypeDonutChart() {
  const { repartitionTypes } = useAbsences();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalDemandes = repartitionTypes.reduce((acc, curr) => acc + curr.count, 0);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Chargement de la répartition...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Anneau central avec indicateur au centre */}
      <div className="relative w-full h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={repartitionTypes}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              stroke="#FFFFFF"
              strokeWidth={2}
              paddingAngle={2}
            >
              {repartitionTypes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Chiffre au centre de l'anneau */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums leading-none">
            {totalDemandes}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-wider">
            Demandes
          </span>
        </div>
      </div>

      {/* Légende structurée compacte */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100 text-xs">
        {repartitionTypes.map((item, idx) => (
          <div key={item.type} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-600 truncate">{item.type}</span>
            </div>
            <span className="font-mono font-medium text-slate-900 tabular-nums ml-1">
              {item.pourcentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

