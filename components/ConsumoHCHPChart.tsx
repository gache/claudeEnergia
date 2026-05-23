"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { KPIMensual, MESES } from "@/lib/data";

type Props = {
  data: KPIMensual[];
  title?: string;
};

function CustomDot(props: any) {
  const { cx, cy, stroke } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#fff"
      stroke={stroke}
      strokeWidth={2.5}
      style={{ filter: `drop-shadow(0 1px 4px ${stroke}55)` }}
    />
  );
}

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
          <span className="text-sm font-bold text-hc-700 tabular-nums">{hc.toFixed(3)} kWh</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-slate-500">HP</span>
          </div>
          <span className="text-sm font-bold text-hp-700 tabular-nums">{hp.toFixed(3)} kWh</span>
        </div>
        <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-xs font-semibold text-slate-500">Total</span>
          </div>
          <span className="text-sm font-bold text-violet-700 tabular-nums">{total.toFixed(3)} kWh</span>
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
    Total: d.hc + d.hp,
  }));

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-card-md border border-slate-100/40 p-6 hover:shadow-card-lg transition-shadow duration-300">
      <div className="mb-5">
        <h2 className="section-title">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Evolución mensual HC (fuera punta) y HP (punta)</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradHC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#0096c7" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#0096c7" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradHP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
            </linearGradient>
          </defs>
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: 16 }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="HC"
            name="HC (Heures Creuses)"
            stroke="#0096c7"
            strokeWidth={2.5}
            fill="url(#gradHC)"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#0096c7", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="HP"
            name="HP (Heures Pleines)"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#gradHP)"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1400}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="Total"
            name="Total"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 3"
            fill="url(#gradTotal)"
            dot={<CustomDot />}
            activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
