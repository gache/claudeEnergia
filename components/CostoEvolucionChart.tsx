"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { KPIMensual, MESES, fmtNum } from "@/lib/data";

type Props = {
  data: KPIMensual[];
  title?: string;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const items = [
    { key: "Coste HC", color: "#06b6d4", unit: "€" },
    { key: "Coste HP", color: "#f59e0b", unit: "€" },
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

export default function CostoEvolucionChart({ data, title = "Evolución del coste (€)" }: Props) {
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
        <p className="text-xs text-slate-400 mt-0.5">Líneas de coste HC (cian), HP (naranja) y total (violeta)</p>
      </div>
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
          <Legend
            wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: 16 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Coste HC"
            stroke="#06b6d4"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#06b6d4", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#06b6d4" }}
          />
          <Line
            type="monotone"
            dataKey="Coste HP"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#f59e0b" }}
          />
          <Line
            type="monotone"
            dataKey="Total"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#8b5cf6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
