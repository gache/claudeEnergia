"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { KPIMensual, MESES } from "@/lib/data";

interface Props {
  data: KPIMensual[];
  prevData?: KPIMensual[];
  year: number;
}

function CustomTooltip({ active, payload, label, year }: any) {
  if (!active || !payload?.length) return null;
  const hc     = payload.find((p: any) => p.dataKey === "pctHC")?.value ?? null;
  const hp     = payload.find((p: any) => p.dataKey === "pctHP")?.value ?? null;
  const hcPrev = payload.find((p: any) => p.dataKey === "pctHCPrev")?.value ?? null;
  const hpPrev = payload.find((p: any) => p.dataKey === "pctHPPrev")?.value ?? null;

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 min-w-[140px] text-xs">
      <p className="font-bold text-slate-600 uppercase tracking-wider mb-2">{label}</p>
      {hc !== null && (
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />HC</span>
          <span className="font-bold text-blue-600 tabular-nums">{hc.toFixed(1)}%</span>
        </div>
      )}
      {hp !== null && (
        <div className="flex justify-between gap-4 mt-1">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />HP</span>
          <span className="font-bold text-red-600 tabular-nums">{hp.toFixed(1)}%</span>
        </div>
      )}
      {(hcPrev !== null || hpPrev !== null) && (
        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{year - 1}</p>
          {hcPrev !== null && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">HC</span>
              <span className="font-mono text-slate-400 tabular-nums">{hcPrev.toFixed(1)}%</span>
            </div>
          )}
          {hpPrev !== null && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">HP</span>
              <span className="font-mono text-slate-400 tabular-nums">{hpPrev.toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EficienciaHCChart({ data, prevData, year }: Props) {
  const byMes     = new Map(data.map(k => [k.mes, k]));
  const prevByMes = prevData ? new Map(prevData.map(k => [k.mes, k])) : null;

  const chartData = MESES.map((mes, i) => {
    const num  = i + 1;
    const curr = byMes.get(num);
    const prev = prevByMes?.get(num);
    return {
      mes:       mes.slice(0, 3),
      pctHC:     curr ? parseFloat(curr.pctHC.toFixed(1)) : null,
      pctHP:     curr ? parseFloat(curr.pctHP.toFixed(1)) : null,
      pctHCPrev: prev ? parseFloat(prev.pctHC.toFixed(1)) : null,
      pctHPPrev: prev ? parseFloat(prev.pctHP.toFixed(1)) : null,
    };
  }).filter(d => d.pctHC !== null || d.pctHCPrev !== null);

  const hasPrev = !!prevData && prevData.length > 0;
  const avgHC   = data.length > 0 ? data.reduce((s, k) => s + k.pctHC, 0) / data.length : null;
  const avgHP   = data.length > 0 ? data.reduce((s, k) => s + k.pctHP, 0) / data.length : null;

  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 p-5">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <h2 className="text-base font-black text-slate-900" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
            Eficiencia HC / HP
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">% consumo mensual por tarifa · HC alto = ahorro</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {avgHC !== null && (
            <span className={`text-xs font-bold px-2 py-1 rounded-lg border tabular-nums ${
              avgHC >= 50 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              HC {avgHC.toFixed(1)}%
            </span>
          )}
          {avgHP !== null && (
            <span className={`text-xs font-bold px-2 py-1 rounded-lg border tabular-nums ${
              avgHP >= 50 ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              HP {avgHP.toFixed(1)}%
            </span>
          )}
          {hasPrev && (
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 ml-1">
              <span className="flex items-center gap-1">
                <span className="w-5 h-0.5 bg-slate-400 inline-block rounded" />{year - 1}
              </span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip year={year} />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
          <ReferenceLine
            y={50}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: "50%", position: "insideTopRight", fontSize: 10, fill: "#94a3b8" }}
          />
          {hasPrev && (
            <Line dataKey="pctHCPrev" stroke="#bfdbfe" strokeWidth={1.5} strokeDasharray="5 5"
              dot={false} connectNulls legendType="none" />
          )}
          {hasPrev && (
            <Line dataKey="pctHPPrev" stroke="#fecaca" strokeWidth={1.5} strokeDasharray="5 5"
              dot={false} connectNulls legendType="none" />
          )}
          <Line dataKey="pctHC" stroke="#3b82f6" strokeWidth={2.5}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
          <Line dataKey="pctHP" stroke="#dc2626" strokeWidth={2.5}
            dot={{ r: 4, fill: "#dc2626", strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 justify-center">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-5 h-0.5 bg-blue-500 inline-block rounded" />HC (fuera punta)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-5 h-0.5 bg-red-500 inline-block rounded" />HP (punta)
        </span>
      </div>
    </div>
  );
}
