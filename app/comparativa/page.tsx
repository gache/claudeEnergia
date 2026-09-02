"use client";

import dynamic from "next/dynamic";
import { useState, Suspense, useMemo } from "react";
import { ArrowRight, Award } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES, ANOS_DISPONIBLES } from "@/lib/data";
import ChartSkeleton from "@/components/ChartSkeleton";
import TableSkeleton from "@/components/TableSkeleton";
import VarBadge from "@/components/VarBadge";

const ComparativaChart      = dynamic(() => import("@/components/ComparativaChart"),      { ssr: false, loading: () => <ChartSkeleton /> });
const ComparativaHCHPChart  = dynamic(() => import("@/components/ComparativaHCHPChart"),  { ssr: false, loading: () => <ChartSkeleton /> });

function SummaryKPI({
  label, value, subLabel, good,
}: { label: string; value: string | null; subLabel?: string; good?: boolean }) {
  const isGood = good === true;
  const isBad  = good === false;

  return (
    <div className="rounded-2xl p-5 border border-slate-100 bg-white shadow-card-md hover:shadow-card-lg transition-shadow duration-300">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold tabular-nums leading-none ${
        isGood ? "text-emerald-700" : isBad ? "text-red-600" : "text-slate-800"
      }`}>
        {value ?? "—"}
      </p>
      {subLabel && <p className="text-xs text-slate-400 mt-2">{subLabel}</p>}
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

  const comparData = useMemo(() => {
    const k1ByMes = new Map(k1.map(d => [d.mes, d]));
    return k2.map(d2 => {
      const d1 = k1ByMes.get(d2.mes);
      return {
        mes:    d2.mes,
        total1: d1?.total      ?? 0,
        total2: d2.total,
        costo1: d1?.costoTotal ?? 0,
        costo2: d2.costoTotal,
        hc1:    d1?.hc         ?? 0,
        hc2:    d2.hc,
        hp1:    d1?.hp         ?? 0,
        hp2:    d2.hp,
      };
    });
  }, [k1, k2]);

  const paired = useMemo(() => comparData.filter(d => d.total1 > 0), [comparData]);

  const avgVarConsumo = useMemo(
    () => paired.length > 0
      ? paired.reduce((a, d) => a + ((d.total2 - d.total1) / d.total1) * 100, 0) / paired.length
      : null,
    [paired]
  );

  const avgVarCosto = useMemo(
    () => paired.length > 0
      ? paired.reduce((a, d) => a + (d.costo1 !== 0 ? ((d.costo2 - d.costo1) / d.costo1) * 100 : 0), 0) / paired.length
      : null,
    [paired]
  );

  const bestMonth = useMemo(
    () => paired.reduce(
      (best, d) => {
        const v = ((d.total2 - d.total1) / d.total1) * 100;
        return v < best.v ? { mes: d.mes, v } : best;
      },
      { mes: 0, v: Infinity }
    ),
    [paired]
  );

  const worstMonth = useMemo(
    () => paired.reduce(
      (worst, d) => {
        const v = ((d.total2 - d.total1) / d.total1) * 100;
        return v > worst.v ? { mes: d.mes, v } : worst;
      },
      { mes: 0, v: -Infinity }
    ),
    [paired]
  );

  const avgVarHC = useMemo(
    () => paired.length > 0
      ? paired.reduce((a, d) => a + (d.hc1 !== 0 ? ((d.hc2 - d.hc1) / d.hc1) * 100 : 0), 0) / paired.length
      : null,
    [paired]
  );

  const avgVarHP = useMemo(
    () => paired.length > 0
      ? paired.reduce((a, d) => a + (d.hp1 !== 0 ? ((d.hp2 - d.hp1) / d.hp1) * 100 : 0), 0) / paired.length
      : null,
    [paired]
  );

  const ahorroAbsoluto = useMemo(
    () => paired.length > 0
      ? paired.reduce((a, d) => a + d.costo1, 0) - paired.reduce((a, d) => a + d.costo2, 0)
      : null,
    [paired]
  );

  const chartData = useMemo(
    () => comparData.map(d => ({
      mes:       d.mes,
      total2025: d.total1,
      total2026: d.total2,
      costo2025: d.costo1,
      costo2026: d.costo2,
    })),
    [comparData]
  );

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Header + year selectors ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap animate-slide-up" style={{ animationDelay: "0ms" }}>
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
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl px-4 py-3 shadow-card hover:shadow-card-md transition-shadow duration-300 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base</span>
            <select
              value={year1}
              onChange={e => setYear1(+e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400
                         min-h-[36px]"
            >
              {ANOS_DISPONIBLES.filter(y => y !== year2).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comp.</span>
            <select
              value={year2}
              onChange={e => setYear2(+e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400
                         min-h-[36px]"
            >
              {ANOS_DISPONIBLES.filter(y => y !== year1).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
        <SummaryKPI
          label="Var. media consumo"
          value={avgVarConsumo !== null ? `${avgVarConsumo > 0 ? "+" : ""}${Math.abs(avgVarConsumo).toFixed(1)}%` : null}
          subLabel={`${year2} vs ${year1} · ${paired.length}m`}
          good={avgVarConsumo !== null ? avgVarConsumo < 0 : undefined}
        />
        <SummaryKPI
          label="Var. media coste"
          value={avgVarCosto !== null ? `${avgVarCosto > 0 ? "+" : ""}${Math.abs(avgVarCosto).toFixed(1)}%` : null}
          subLabel="impacto económico"
          good={avgVarCosto !== null ? avgVarCosto < 0 : undefined}
        />
        <div className="rounded-2xl p-5 border border-slate-100 bg-white shadow-card-md hover:shadow-card-lg transition-shadow duration-300">
          <div className="flex items-center gap-1.5 mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Mejor mes</p>
          </div>
          <p className="text-3xl font-bold text-emerald-700 leading-none">
            {bestMonth.mes > 0 ? MESES[bestMonth.mes - 1] : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {bestMonth.v < Infinity ? `${bestMonth.v.toFixed(1)}% vs ${year1}` : "Sin datos"}
          </p>
        </div>
        <div className="rounded-2xl p-5 border border-slate-100 bg-white shadow-card-md hover:shadow-card-lg transition-shadow duration-300">
          <div className="flex items-center gap-1.5 mb-2">
            <Award className="w-3.5 h-3.5 text-red-400" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Peor mes</p>
          </div>
          <p className="text-3xl font-bold text-red-600 leading-none">
            {worstMonth.mes > 0 ? MESES[worstMonth.mes - 1] : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {worstMonth.v > -Infinity && worstMonth.mes > 0 ? `+${worstMonth.v.toFixed(1)}% vs ${year1}` : "Sin datos"}
          </p>
        </div>
      </div>

      {/* ── Ahorro absoluto ── */}
      {ahorroAbsoluto !== null && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card-md animate-slide-up flex items-center gap-4" style={{ animationDelay: "75ms" }}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ahorroAbsoluto >= 0 ? "bg-emerald-100" : "bg-red-100"}`}>
            <Award className={`w-5 h-5 ${ahorroAbsoluto >= 0 ? "text-emerald-600" : "text-red-500"}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ahorro total acumulado — {year2} vs {year1}</p>
            <p className={`text-2xl font-black tabular-nums ${ahorroAbsoluto >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {ahorroAbsoluto < 0 ? "+" : ""}{Math.abs(ahorroAbsoluto).toFixed(2)} €
            </p>
            <p className="text-xs text-slate-400">{paired.length} meses comparados</p>
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <Suspense fallback={<ChartSkeleton />}>
          <ComparativaChart
            data={chartData}
            mode="consumo"
            title={`Consumo total (kWh) — ${year1} vs ${year2}`}
            year1={year1}
            year2={year2}
          />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <ComparativaChart
            data={chartData}
            mode="costo"
            title={`Coste total (€) — ${year1} vs ${year2}`}
            year1={year1}
            year2={year2}
          />
        </Suspense>
      </div>

      {/* ── HC/HP breakdown chart ── */}
      <div className="animate-slide-up" style={{ animationDelay: "125ms" }}>
        <Suspense fallback={<ChartSkeleton />}>
          <ComparativaHCHPChart data={comparData} year1={year1} year2={year2} />
        </Suspense>
      </div>

      {/* ── Detail table ── */}
      <Suspense fallback={<TableSkeleton rows={5} />}>
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: "150ms" }}>

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              </div>
              <h2 className="section-title">Tabla comparativa — {year1} vs {year2}</h2>
            </div>
            <span className="badge bg-slate-50 text-slate-500 border border-slate-200 text-[10px]">
              {paired.length} mes{paired.length !== 1 ? "es" : ""} comparados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]" aria-label={`Comparativa de consumo y coste ${year1} vs ${year2}`}>
              <thead>
                <tr>
                  <th scope="col" className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/80 border-b border-slate-100">Mes</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/60 border-b border-slate-100">kWh {year1}</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50/40 border-b border-slate-100">kWh {year2}</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/80 border-b border-slate-100">Var% Total</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-hc-600 bg-hc-50/30 border-b border-slate-100">Var% HC</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-hp-600 bg-hp-50/30 border-b border-slate-100">Var% HP</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/60 border-b border-slate-100">€ {year1}</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50/40 border-b border-slate-100">€ {year2}</th>
                  <th scope="col" className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/80 border-b border-slate-100">Var% Coste</th>
                </tr>
              </thead>
              <tbody>
                {comparData.map(d => {
                  const vKwh   = d.total1 ? ((d.total2 - d.total1) / d.total1) * 100 : null;
                  const vCosto = d.costo1 ? ((d.costo2 - d.costo1) / d.costo1) * 100 : null;
                  const vHC    = d.hc1    ? ((d.hc2    - d.hc1)    / d.hc1)    * 100 : null;
                  const vHP    = d.hp1    ? ((d.hp2    - d.hp1)    / d.hp1)    * 100 : null;
                  const improved = vKwh !== null && vKwh < 0;
                  const worsened = vKwh !== null && vKwh > 0;
                  return (
                    <tr key={d.mes} className="group border-b border-slate-50 hover:bg-slate-50/60 transition-colors duration-100">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-6 rounded-full flex-shrink-0 ${
                            improved ? "bg-savings-400" : worsened ? "bg-red-400" : "bg-slate-200"
                          }`} />
                          <span className="font-bold text-slate-800">{MESES[d.mes - 1]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 tabular-nums bg-slate-50/30 group-hover:bg-slate-50/60 transition-colors">
                        {d.total1 ? d.total1.toFixed(3) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800 tabular-nums bg-brand-50/20 group-hover:bg-brand-50/40 transition-colors">
                        {d.total2.toFixed(3)}
                      </td>
                      <td className="px-4 py-3.5 text-right"><VarBadge pct={vKwh} /></td>
                      <td className="px-4 py-3.5 text-right"><VarBadge pct={vHC} /></td>
                      <td className="px-4 py-3.5 text-right"><VarBadge pct={vHP} /></td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-400 tabular-nums text-xs bg-slate-50/30 group-hover:bg-slate-50/60 transition-colors">
                        {d.costo1 ? d.costo1.toFixed(3) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-700 tabular-nums text-xs bg-brand-50/20 group-hover:bg-brand-50/40 transition-colors">
                        {d.costo2.toFixed(3)}
                      </td>
                      <td className="px-6 py-3.5 text-right"><VarBadge pct={vCosto} /></td>
                    </tr>
                  );
                })}
              </tbody>
              {paired.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Acumulado</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-400 tabular-nums">
                      {paired.reduce((a, d) => a + d.total1, 0).toFixed(3)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {paired.reduce((a, d) => a + d.total2, 0).toFixed(3)}
                    </td>
                    <td className="px-4 py-4 text-right"><VarBadge pct={avgVarConsumo} /></td>
                    <td className="px-4 py-4 text-right"><VarBadge pct={avgVarHC} /></td>
                    <td className="px-4 py-4 text-right"><VarBadge pct={avgVarHP} /></td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-400 tabular-nums text-xs">
                      {paired.reduce((a, d) => a + d.costo1, 0).toFixed(3)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-900 tabular-nums text-xs">
                      {paired.reduce((a, d) => a + d.costo2, 0).toFixed(3)}
                    </td>
                    <td className="px-6 py-4 text-right"><VarBadge pct={avgVarCosto} /></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
