"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { KPIMensual, MESES } from "@/lib/data";

type Props = {
  data: KPIMensual[];
  title?: string;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const hc    = payload.find((p: any) => p.dataKey === "HC")?.value ?? 0;
  const hp    = payload.find((p: any) => p.dataKey === "HP")?.value ?? 0;
  const total = hc + hp;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card-lg p-4 min-w-[160px]">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">{label}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-hc-500" />
            <span className="text-xs text-slate-500">HC</span>
          </div>
          <span className="text-sm font-bold text-hc-700 tabular-nums">{hc} kWh</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-hp-500" />
            <span className="text-xs text-slate-500">HP</span>
          </div>
          <span className="text-sm font-bold text-hp-700 tabular-nums">{hp} kWh</span>
        </div>
        <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-500">Total</span>
          <span className="text-sm font-bold text-slate-700 tabular-nums">{total} kWh</span>
        </div>
      </div>
    </div>
  );
}

export default function ConsumoHCHPChart({ data, title = "Consumo HC / HP (kWh)" }: Props) {
  const chartData = data.map(d => ({
    mes: MESES[d.mes - 1],
    HC: d.hc,
    HP: d.hp,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 p-6">
      <div className="mb-5">
        <h2 className="section-title">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Distribución acumulada HC (azul) y HP (naranja)</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} barSize={30} barGap={2}>
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
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,.04)" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: 16 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="HC" stackId="a" fill="#06b6d4" name="HC (Heures Creuses)" />
          <Bar dataKey="HP" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} name="HP (Heures Pleines)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
