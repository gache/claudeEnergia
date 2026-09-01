"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { KPIMensual, MESES, fmtNum } from "@/lib/data";

type Props = {
  data: KPIMensual[];
  title?: string;
  highlightMonth?: number;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const items = [
    { key: "Coste HC", color: "#3b82f6", unit: "€" },
    { key: "Coste HP", color: "#dc2626", unit: "€" },
    { key: "Total",    color: "#8b5cf6", unit: "€" },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card-lg p-4 min-w-[160px]">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">{label}</p>
      <div className="space-y-2">
        {items.map(item => {
          const entry = payload.find((p: any) => p.dataKey === item.key);
          if (!entry) return null;
          return (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-500">{item.key}</span>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>
                {entry.value.toFixed(3)} {item.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CostoEvolucionChart({ data, title = "Evolución del coste (€)", highlightMonth }: Props) {
  const chartData = data.map(d => ({
    mes:        MESES[d.mes - 1],
    "Coste HC": fmtNum(d.costoHC, 3),
    "Coste HP": fmtNum(d.costoHP, 3),
    "Total":    fmtNum(d.costoTotal, 3),
  }));

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-card-md border border-slate-100/40 p-6 hover:shadow-card-lg transition-shadow duration-300">
      <div className="mb-5">
        <h2 className="section-title">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Líneas de coste HC (cian), HP (rojo) y total (violeta)</p>
      </div>
      <div className="overflow-x-auto -mx-1">
      <div className="min-w-[300px]">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            unit=" €"
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
          {highlightMonth !== undefined && (
            <ReferenceLine
              x={MESES[highlightMonth - 1]}
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
          )}
          <Legend
            wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: 16 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Coste HC"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#3b82f6" }}
            animationDuration={1100}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="Coste HP"
            stroke="#dc2626"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#dc2626", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#dc2626" }}
            animationDuration={1100}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="Total"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#8b5cf6" }}
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
      </div>

      {/* Accessible data table */}
      <details className="mt-3">
        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none w-fit">
          Ver datos en tabla
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs" aria-label={title}>
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5 pr-3 text-slate-500 font-semibold">Mes</th>
                <th className="text-right py-1.5 px-2 text-cyan-600 font-semibold">Coste HC (€)</th>
                <th className="text-right py-1.5 px-2 text-red-600 font-semibold">Coste HP (€)</th>
                <th className="text-right py-1.5 pl-2 text-violet-600 font-semibold">Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(row => (
                <tr key={row.mes} className="border-b border-slate-50">
                  <td className="py-1 pr-3 text-slate-600">{row.mes}</td>
                  <td className="py-1 px-2 text-right font-mono text-cyan-700">{row["Coste HC"].toFixed(3)}</td>
                  <td className="py-1 px-2 text-right font-mono text-red-700">{row["Coste HP"].toFixed(3)}</td>
                  <td className="py-1 pl-2 text-right font-mono text-violet-700">{row["Total"].toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
