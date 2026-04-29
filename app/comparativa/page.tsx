"use client";

import { useState } from "react";
import { ArrowRight, TrendingDown, TrendingUp, Award, BarChart2 } from "lucide-react";
import ComparativaChart from "@/components/ComparativaChart";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES, ANOS_DISPONIBLES } from "@/lib/data";

function VarBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-slate-300">—</span>;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      up
        ? "bg-red-50 text-red-600 border border-red-100"
        : "bg-savings-50 text-savings-700 border border-savings-100"
    }`}>
      {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function SummaryKPI({
  label, value, subLabel, good,
}: { label: string; value: string | null; subLabel?: string; good?: boolean }) {
  const isGood    = good === true;
  const isBad     = good === false;
  const isNeutral = good === undefined;

  return (
    <div className={`rounded-2xl p-5 border shadow-card-md ${
      isGood
        ? "bg-gradient-to-br from-savings-50 to-cyan-50 border-savings-200"
        : isBad
          ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
          : "bg-gradient-to-br from-brand-50 to-blue-50 border-brand-200"
    }`}>
      <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${
        isGood ? "text-savings-500" : isBad ? "text-red-500" : "text-brand-500"
      }`}>{label}</p>

      <p className={`text-3xl font-bold tabular-nums leading-none ${
        isGood ? "text-savings-700" : isBad ? "text-red-600" : "text-brand-700"
      }`}>
        {value ?? "—"}
      </p>

      {subLabel && (
        <p className="text-xs text-slate-400 mt-2">{subLabel}</p>
      )}
    </div>
  );
}

export default function ComparativaPage() {
  const { getByYear, registros } = useEnergy();

  const yearsWithData = ANOS_DISPONIBLES.filter(y => registros.some(r => r.año === y));

  const [year1, setYear1] = useState<number>(
    yearsWithData.length >= 2 ? yearsWithData[yearsWithData.length - 2] : 2025
  );
  const [year2, setYear2] = useState<number>(
    yearsWithData.length >= 1 ? yearsWithData[yearsWithData.length - 1] : 2026
  );

  const k1 = getByYear(year1);
  const k2 = getByYear(year2);

  const comparData = k2.map(d2 => {
    const d1 = k1.find(d => d.mes === d2.mes);
    return {
      mes:    d2.mes,
      total1: d1?.total      ?? 0,
      total2: d2.total,
      costo1: d1?.costoTotal ?? 0,
      costo2: d2.costoTotal,
    };
  });

  const paired = comparData.filter(d => d.total1 > 0);

  const avgVarConsumo = paired.length > 0
    ? paired.reduce((a, d) => a + ((d.total2 - d.total1) / d.total1) * 100, 0) / paired.length
    : null;

  const avgVarCosto = paired.length > 0
    ? paired.reduce((a, d) => a + ((d.costo2 - d.costo1) / d.costo1) * 100, 0) / paired.length
    : null;

  const bestMonth = paired.reduce(
    (best, d) => {
      const v = ((d.total2 - d.total1) / d.total1) * 100;
      return v < best.v ? { mes: d.mes, v } : best;
    },
    { mes: 0, v: Infinity }
  );

  const chartData = comparData.map(d => ({
    mes:       d.mes,
    total2025: d.total1,
    total2026: d.total2,
    costo2025: d.costo1,
    costo2026: d.costo2,
  }));

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Header + year selectors ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-brand-50 text-brand-700 border border-brand-100">
              Análisis interanual
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Comparativa interanual</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consumo y costes comparados · {year1} vs {year2}
          </p>
        </div>

        {/* Year pickers */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-card flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base</span>
            <select
              value={year1}
              onChange={e => setYear1(+e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400
                         min-h-[36px]"
            >
              {ANOS_DISPONIBLES.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comp.</span>
            <select
              value={year2}
              onChange={e => setYear2(+e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400
                         min-h-[36px]"
            >
              {ANOS_DISPONIBLES.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryKPI
          label="Variación media consumo"
          value={avgVarConsumo !== null ? `${avgVarConsumo > 0 ? "+" : ""}${avgVarConsumo.toFixed(1)}%` : null}
          subLabel={`${year2} vs ${year1} · ${paired.length} meses comparados`}
          good={avgVarConsumo !== null ? avgVarConsumo < 0 : undefined}
        />
        <SummaryKPI
          label="Variación media coste"
          value={avgVarCosto !== null ? `${avgVarCosto > 0 ? "+" : ""}${avgVarCosto.toFixed(1)}%` : null}
          subLabel={`${year2} vs ${year1} · impacto económico`}
          good={avgVarCosto !== null ? avgVarCosto < 0 : undefined}
        />
        <div className="rounded-2xl p-5 border border-brand-200 bg-gradient-to-br from-brand-50 to-blue-50 shadow-card-md">
          <div className="flex items-center gap-1.5 mb-2">
            <Award className="w-3.5 h-3.5 text-brand-500" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500">Mejor mes</p>
          </div>
          <p className="text-3xl font-bold text-brand-700 leading-none">
            {bestMonth.mes > 0 ? MESES[bestMonth.mes - 1] : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {bestMonth.v < Infinity
              ? `${bestMonth.v.toFixed(1)}% vs ${year1} · mayor ahorro`
              : "Sin datos suficientes"}
          </p>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ComparativaChart
          data={chartData}
          mode="consumo"
          title={`Consumo total (kWh) — ${year1} vs ${year2}`}
          year1={year1}
          year2={year2}
        />
        <ComparativaChart
          data={chartData}
          mode="costo"
          title={`Coste total (€) — ${year1} vs ${year2}`}
          year1={year1}
          year2={year2}
        />
      </div>

      {/* ── Detail table ── */}
      <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-slate-400" />
          <h2 className="section-title">Tabla comparativa — {year1} vs {year2}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mes</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">kWh {year1}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-600">kWh {year2}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Var% kWh</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">€ {year1}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-600">€ {year2}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Var% €</th>
              </tr>
            </thead>
            <tbody>
              {comparData.map(d => {
                const vKwh   = d.total1 ? ((d.total2 - d.total1) / d.total1) * 100 : null;
                const vCosto = d.costo1 ? ((d.costo2 - d.costo1) / d.costo1) * 100 : null;
                return (
                  <tr key={d.mes} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors duration-100">
                    <td className="px-5 py-3 font-semibold text-slate-700">{MESES[d.mes - 1]}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400 tabular-nums">{d.total1 || "—"}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 tabular-nums">{d.total2}</td>
                    <td className="px-4 py-3 text-right"><VarBadge pct={vKwh} /></td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400 tabular-nums">
                      {d.costo1 ? d.costo1.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 tabular-nums">
                      {d.costo2.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right"><VarBadge pct={vCosto} /></td>
                  </tr>
                );
              })}
            </tbody>
            {paired.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                  <td className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Acumulado</td>
                  <td className="px-4 py-4 text-right font-mono text-slate-400 tabular-nums">
                    {paired.reduce((a, d) => a + d.total1, 0)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-slate-800 tabular-nums">
                    {paired.reduce((a, d) => a + d.total2, 0)}
                  </td>
                  <td className="px-4 py-4 text-right"><VarBadge pct={avgVarConsumo} /></td>
                  <td className="px-4 py-4 text-right font-mono text-slate-400 tabular-nums">
                    {paired.reduce((a, d) => a + d.costo1, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-slate-700 tabular-nums">
                    {paired.reduce((a, d) => a + d.costo2, 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-right"><VarBadge pct={avgVarCosto} /></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
