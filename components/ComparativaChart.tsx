"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { MESES, fmtNum } from "@/lib/data";

export type ComparativaDataPoint = {
  mes: number;
  total2025: number;
  total2026: number;
  costo2025: number;
  costo2026: number;
};

type Props = {
  data: ComparativaDataPoint[];
  mode: "consumo" | "costo";
  title?: string;
  year1?: number;
  year2?: number;
};

function CustomTooltip({ active, payload, label, mode, year1, year2 }: any) {
  if (!active || !payload?.length) return null;
  const unit = mode === "consumo" ? " kWh" : " €";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card-lg p-4 min-w-[160px]">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">{label}</p>
      <div className="space-y-2">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
              <span className="text-xs text-slate-500">{p.dataKey}</span>
            </div>
            <span className="text-sm font-bold tabular-nums" style={{ color: p.fill }}>
              {mode === "costo" ? p.value.toFixed(3) : p.value}{unit}
            </span>
          </div>
        ))}
        {payload.length === 2 && payload[0].value > 0 && (
          <div className="pt-2 mt-1 border-t border-slate-100 flex justify-between gap-4">
            <span className="text-xs text-slate-400">Variación</span>
            <span className={`text-xs font-bold tabular-nums ${
              payload[1].value < payload[0].value ? "text-savings-600" : "text-red-500"
            }`}>
              {payload[1].value < payload[0].value ? "" : "+"}
              {(((payload[1].value - payload[0].value) / payload[0].value) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparativaChart({ data, mode, title, year1 = 2025, year2 = 2026 }: Props) {
  const unit = mode === "consumo" ? " kWh" : " €";
  const defaultTitle = mode === "consumo"
    ? "Comparativa consumo total (kWh)"
    : "Comparativa coste total (€)";

  const chartData = data.map(d => ({
    mes: MESES[d.mes - 1],
    [String(year1)]: mode === "consumo" ? d.total2025 : fmtNum(d.costo2025, 3),
    [String(year2)]: mode === "consumo" ? d.total2026 : fmtNum(d.costo2026, 3),
  }));

  const colors = {
    [String(year1)]: "#94a3b8",
    [String(year2)]: "#3b82f6",
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 p-6">
      <div className="mb-5">
        <h2 className="section-title">{title ?? defaultTitle}</h2>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-400" />
            <span className="text-xs text-slate-400 font-medium">{year1} (base)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-brand-500" />
            <span className="text-xs text-slate-400 font-medium">{year2} (actual)</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-1">
      <div className="min-w-[500px]">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} maxBarSize={18} barGap={3}>
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
            unit={unit}
            width={52}
          />
          <Tooltip
            content={(props) => <CustomTooltip {...props} mode={mode} year1={year1} year2={year2} />}
            cursor={{ fill: "rgba(0,0,0,.03)" }}
          />
          <Bar dataKey={String(year1)} fill={colors[String(year1)]} radius={[4, 4, 0, 0]} animationDuration={500} animationEasing="ease-out" />
          <Bar dataKey={String(year2)} fill={colors[String(year2)]} radius={[4, 4, 0, 0]} animationDuration={500} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
      </div>
      </div>

      {/* Accessible data table */}
      <details className="mt-3">
        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none w-fit">
          Ver datos en tabla
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs" aria-label={title ?? defaultTitle}>
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5 pr-3 text-slate-500 font-semibold">Mes</th>
                <th className="text-right py-1.5 px-2 text-slate-500 font-semibold">{year1}{unit}</th>
                <th className="text-right py-1.5 px-2 text-brand-600 font-semibold">{year2}{unit}</th>
                <th className="text-right py-1.5 pl-2 text-slate-500 font-semibold">Variación</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(row => {
                const v1 = row[String(year1)] as number;
                const v2 = row[String(year2)] as number;
                const varPct = v1 > 0 ? ((v2 - v1) / v1) * 100 : null;
                return (
                  <tr key={row.mes} className="border-b border-slate-50">
                    <td className="py-1 pr-3 text-slate-600">{row.mes}</td>
                    <td className="py-1 px-2 text-right font-mono text-slate-500">{typeof v1 === "number" ? v1.toFixed(mode === "costo" ? 3 : 1) : "—"}</td>
                    <td className="py-1 px-2 text-right font-mono text-brand-700">{typeof v2 === "number" ? v2.toFixed(mode === "costo" ? 3 : 1) : "—"}</td>
                    <td className={`py-1 pl-2 text-right font-mono font-semibold ${varPct === null ? "text-slate-400" : varPct < 0 ? "text-savings-600" : "text-red-500"}`}>
                      {varPct === null ? "—" : `${varPct > 0 ? "+" : ""}${varPct.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
