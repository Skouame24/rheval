// ============================================================
// features/absences/components/charts/AbsencesTrendAreaChart.tsx
// Courbe d'aire sur 12 mois (Exercice N vs N-1) — Recharts
// Design sobre IBM Carbon : accent orange, axes discrets, tabular-nums
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHLY_DATA = [
  { mois: "Jan", annee2026: 1.5, annee2025: 2.0 },
  { mois: "Fév", annee2026: 0.5, annee2025: 1.0 },
  { mois: "Mar", annee2026: 2.0, annee2025: 2.5 },
  { mois: "Avr", annee2026: 4.0, annee2025: 3.0 },
  { mois: "Mai", annee2026: 3.5, annee2025: 4.0 },
  { mois: "Juin", annee2026: 1.0, annee2025: 1.5 },
  { mois: "Juil", annee2026: 5.5, annee2025: 6.0 },
  { mois: "Août", annee2026: 9.0, annee2025: 8.5 },
  { mois: "Sep", annee2026: 2.0, annee2025: 2.0 },
  { mois: "Oct", annee2026: 3.0, annee2025: 3.5 },
  { mois: "Nov", annee2026: 1.5, annee2025: 2.0 },
  { mois: "Déc", annee2026: 4.5, annee2025: 5.0 },
];

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 shadow-md text-xs">
        <p className="font-bold text-slate-900 mb-1.5">{label} 2026</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 bg-[#F0822A]" />
              Exercice 2026 :
            </span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {payload[0]?.value} j
            </span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-slate-400" />
                Exercice 2025 :
              </span>
              <span className="font-mono text-slate-500 tabular-nums">
                {payload[1]?.value} j
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function AbsencesTrendAreaChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Chargement de la courbe de tendance...
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={MONTHLY_DATA}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAgillyOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F0822A" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F0822A" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="mois"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val} j`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="annee2026"
            name="2026"
            stroke="#F0822A"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAgillyOrange)"
          />
          <Line
            type="monotone"
            dataKey="annee2025"
            name="2025"
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
