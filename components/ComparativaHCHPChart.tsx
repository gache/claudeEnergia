"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { MESES } from "@/lib/data";

type DataPoint = {
  mes: number;
  hc1: number;
  hc2: number;
  hp1: number;
  hp2: number;
};

type Props = {
  data: DataPoint[];
  year1: number;
  year2: number;
};

function CustomTooltip({ active, payload, label, year1, year2 }: any) {
  if (!active || !payload?.length) return null;
  const hc1 = payload.find((p: any) => p.dataKey === "hc1")?.value ?? null;
  const hp1 = payload.find((p: any) => p.dataKey === "hp1")?.value ?? null;
  const hc2 = payload.find((p: any) => p.dataKey === "hc2")?.value ?? null;
  const hp2 = payload.find((p: any) => p.dataKey === "hp2")?.value ?? null;

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 min-w-[160px] text-xs">
      <p className="font-bold text-slate-600 uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1 mb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{year1}</p>
        {hc1 !== null && (
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-200 inline-block" />HC</span>
            <span className="font-mono text-slate-500 tabular-nums">{hc1.toFixed(3)} kWh</span>
          </div>
        )}
        {hp1 !== null && (
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-200 inline-block" />HP</span>
            <span className="font-mono text-slate-500 tabular-nums">{hp1.toFixed(3)} kWh</span>
          </div>
        )}
      </div>
      <div className="space-y-1 pt-2 border-t border-slate-100">
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{year2}</p>
        {hc2 !== null && (
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />HC</span>
            <span className="font-bold text-blue-600 tabular-nums">{hc2.toFixed(3)} kWh</span>
          </div>
        )}
        {hp2 !== null && (
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />HP</span>
            <span className="font-bold text-red-600 tabular-nums">{hp2.toFixed(3)} kWh</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparativaHCHPChart({ data, year1, year2 }: Props) {
  const chartData = data.map(d => ({
    mes: MESES[d.mes - 1],
    hc1: d.hc1,
    hp1: d.hp1,
    hc2: d.hc2,
    hp2: d.hp2,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 p-6">
      <div className="mb-5">
        <h2 className="section-title">Desglose HC / HP — {year1} vs {year2}</h2>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-200" />
            <span className="text-xs text-slate-400 font-medium">HC {year1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-xs text-slate-400 font-medium">HC {year2}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-200" />
            <span className="text-xs text-slate-400 font-medium">HP {year1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-xs text-slate-400 font-medium">HP {year2}</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-1">
      <div className="min-w-[500px]">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} maxBarSize={12} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit=" k" width={44} />
          <Tooltip content={<CustomTooltip year1={year1} year2={year2} />} cursor={{ fill: "rgba(0,0,0,.03)" }} />
          <Bar dataKey="hc1" fill="#bfdbfe" radius={[3, 3, 0, 0]} animationDuration={1100} animationEasing="ease-out" />
          <Bar dataKey="hc2" fill="#3b82f6" radius={[3, 3, 0, 0]} animationDuration={1100} animationEasing="ease-out" />
          <Bar dataKey="hp1" fill="#fecaca" radius={[3, 3, 0, 0]} animationDuration={1100} animationEasing="ease-out" />
          <Bar dataKey="hp2" fill="#dc2626" radius={[3, 3, 0, 0]} animationDuration={1100} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}
