"use client";

import dynamic from "next/dynamic";
import { Zap, TrendingDown, TrendingUp, Minus, BarChart3, PenLine, Wallet } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES } from "@/lib/data";

const ConsumoHCHPChart = dynamic(() => import("@/components/ConsumoHCHPChart"), { ssr: false });
const CostoEvolucionChart = dynamic(() => import("@/components/CostoEvolucionChart"), { ssr: false });

/* ── KPI Card ─────────────────────────────────────────────────────── */
type KpiAccent = "brand" | "hc" | "hp" | "violet" | "indigo" | "emerald";

const accentConfig: Record<KpiAccent, {
  border: string; bg: string; valueColor: string; labelColor: string; iconBg: string; iconColor: string;
}> = {
  brand: {
    border: "border border-brand-200/40",
    bg: "bg-white",
    valueColor: "text-brand-700",
    labelColor: "text-slate-600",
    iconBg: "bg-brand-100/60",
    iconColor: "text-brand-600",
  },
  hc: {
    border: "border border-hc-200/50",
    bg: "bg-hc-50",
    valueColor: "text-hc-700",
    labelColor: "text-hc-600",
    iconBg: "bg-hc-100/70",
    iconColor: "text-hc-600",
  },
  hp: {
    border: "border border-hp-200/50",
    bg: "bg-hp-50",
    valueColor: "text-hp-700",
    labelColor: "text-hp-600",
    iconBg: "bg-hp-100/70",
    iconColor: "text-hp-600",
  },
  violet: {
    border: "border border-violet-200/40",
    bg: "bg-violet-50",
    valueColor: "text-violet-700",
    labelColor: "text-violet-600",
    iconBg: "bg-violet-100/60",
    iconColor: "text-violet-600",
  },
  indigo: {
    border: "border border-indigo-200/50",
    bg: "bg-indigo-50",
    valueColor: "text-indigo-700",
    labelColor: "text-indigo-600",
    iconBg: "bg-indigo-100/70",
    iconColor: "text-indigo-600",
  },
  emerald: {
    border: "border border-emerald-200/50",
    bg: "bg-emerald-50",
    valueColor: "text-emerald-700",
    labelColor: "text-emerald-600",
    iconBg: "bg-emerald-100/70",
    iconColor: "text-emerald-600",
  },
};

function KpiCard({
  label, value, unit, subLabel, trend, trendLabel, trendColor, accent = "brand", icon: Icon, delay = 0,
}: {
  label: string; value: string; unit?: string; subLabel?: string;
  trend?: number; trendLabel?: string; trendColor?: "green" | "red";
  accent?: KpiAccent;
  icon?: React.ElementType;
  delay?: number;
}) {
  const cfg = accentConfig[accent];
  const up   = (trend ?? 0) > 0;
  const down = (trend ?? 0) < 0;
  const resolvedColor = trendColor === "green"
    ? "text-savings-600"
    : trendColor === "red"
      ? "text-red-500"
      : down ? "text-savings-600" : up ? "text-red-500" : "text-slate-400";

  const delayStyle = {
    animationDelay: `${delay}ms`,
  } as React.CSSProperties;

  return (
    <div className={`${cfg.bg} ${cfg.border} rounded-2xl shadow-card-md p-5 hover:shadow-card-xl transition-shadow duration-300 group animate-slide-up cursor-pointer`} style={delayStyle}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-sm font-bold uppercase tracking-widest ${cfg.labelColor}`} style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
            <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
          </div>
        )}
      </div>

      <p className={`text-[28px] font-bold tracking-tight leading-none tabular-nums ${cfg.valueColor} group-hover:text-slate-900 transition-colors duration-300`}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1.5">{unit}</span>}
      </p>

      {subLabel && (
        <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-700 transition-colors">{subLabel}</p>
      )}

      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-slate-50 text-xs font-semibold transition-all duration-300 group-hover:gap-2 ${
          resolvedColor
        }`}>
          {down
            ? <TrendingDown className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            : up
              ? <TrendingUp className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              : <Minus className="w-3.5 h-3.5" />
          }
          <span>
            {down ? "" : up ? "+" : ""}{Math.abs(trend)}% {trendLabel ?? "vs año anterior"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Dashboard Page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const { kpiFor, getByYear } = useEnergy();

  const currentMonth = new Date().getMonth() + 1;
  const kpis2026 = getByYear(2026);
  const kpis2025 = getByYear(2025);

  let displayMonth = currentMonth;
  let actual = kpiFor(displayMonth, 2026);

  // Si no hay datos para el mes actual, mostrar el último mes disponible
  if (!actual && kpis2026.length > 0) {
    displayMonth = kpis2026[kpis2026.length - 1].mes;
    actual = kpiFor(displayMonth, 2026);
  }

  const anterior = kpiFor(displayMonth, 2025);

  if (!actual) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Zap className="w-10 h-10 text-slate-300" />
        </div>
        <div>
          <p className="text-slate-700 font-semibold text-lg">Sin datos para {MESES[displayMonth - 1]} 2026</p>
          <p className="text-slate-400 text-sm mt-1">Ve a Registrar para añadir consumo.</p>
        </div>
        <a
          href="/registro"
          className="btn-primary mt-2"
        >
          <PenLine className="w-4 h-4" />
          Registrar consumo
        </a>
      </div>
    );
  }

  const varTotalHC = anterior
    ? Math.round(((actual.hc - anterior.hc) / anterior.hc) * 100)
    : undefined;
  const varTotalHP = anterior
    ? Math.round(((actual.hp - anterior.hp) / anterior.hp) * 100)
    : undefined;
  const varTotal = anterior
    ? Math.round(((actual.total - anterior.total) / anterior.total) * 100)
    : undefined;
  const varDif = anterior && anterior.difHCHP !== 0
    ? Math.round(((Math.abs(actual.difHCHP) - Math.abs(anterior.difHCHP)) / Math.abs(anterior.difHCHP)) * 100)
    : undefined;

  const mesActual = MESES[displayMonth - 1];
  const last3Months = kpis2026.slice(-3);

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest" style={{ fontFamily: "var(--font-space-mono, monospace)" }}>
          {mesActual} 2026
        </p>
        <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
          Dashboard Energético
        </h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-hc-700 bg-hc-50 border border-hc-200 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-hc-500 inline-block" />
            HC {actual.tarifaHC.toFixed(3)} €/kWh
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-hp-700 bg-hp-50 border border-hp-200 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-hp-500 inline-block" />
            HP {actual.tarifaHP.toFixed(3)} €/kWh
          </span>
        </div>
      </div>

      {/* ── 1. CONSUMO HC, HP, TOTAL, DIFERENCIA, COSTO TOTAL ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Consumo HC"
          value={actual.hc.toFixed(3)}
          unit="kWh"
          subLabel={`${actual.costoHC.toFixed(3)} €`}
          trend={varTotalHC}
          accent="hc"
          icon={Zap}
          delay={0}
        />
        <KpiCard
          label="Consumo HP"
          value={actual.hp.toFixed(3)}
          unit="kWh"
          subLabel={`${actual.costoHP.toFixed(3)} €`}
          trend={varTotalHP}
          accent="hp"
          icon={Zap}
          delay={75}
        />
        <KpiCard
          label="Consumo Total"
          value={actual.total.toFixed(3)}
          unit="kWh"
          subLabel={`${actual.costoTotal.toFixed(3)} €`}
          trend={varTotal}
          accent="indigo"
          icon={BarChart3}
          delay={150}
        />
        <KpiCard
          label="Diferencia"
          value={Math.abs(actual.difHCHP).toFixed(3)}
          unit="kWh"
          subLabel={actual.ventajaHC ? "Ventaja HC" : "Domina HP"}
          trend={varDif}
          trendLabel="vs año anterior"
          trendColor={actual.ventajaHC ? "green" : "red"}
          accent="violet"
          icon={Minus}
          delay={225}
        />
        <KpiCard
          label="Costo Total"
          value={actual.costoTotal.toFixed(3)}
          unit="€"
          subLabel={`${actual.total.toFixed(3)} kWh`}
          trend={varTotal}
          accent="emerald"
          icon={Wallet}
          delay={300}
        />
      </div>

      {/* ── 2 & 3. PARTICIPACIÓN + DESGLOSE DE COSTO ── */}
      {(() => {
        const pctCostoHC = actual.costoTotal > 0 ? (actual.costoHC / actual.costoTotal) * 100 : 0;
        const pctCostoHP = actual.costoTotal > 0 ? (actual.costoHP / actual.costoTotal) * 100 : 0;
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Participación del consumo */}
            <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 p-6 animate-slide-up hover:shadow-card-lg transition-shadow duration-300" style={{ animationDelay: "100ms" }}>
              <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>Participación del consumo</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-hc-50 border border-hc-200/60 p-5 animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: "150ms" }}>
                  <p className="text-xs font-bold text-hc-600 uppercase tracking-wider mb-4">HC — Heures Creuses</p>
                  <p className="text-5xl font-black text-hc-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-space-mono, monospace), sans-serif" }}>
                    {actual.pctHC.toFixed(1)}%
                  </p>
                  <p className="text-sm font-semibold text-hc-600 mb-3">{actual.hc} kWh</p>
                  <div className="h-2 rounded-full bg-hc-100 overflow-hidden">
                    <div className="h-full bg-hc-500 transition-all duration-1000 origin-left" style={{ width: `${actual.pctHC}%` }} />
                  </div>
                </div>

                <div className="rounded-xl bg-hp-50 border border-hp-200/60 p-5 animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: "225ms" }}>
                  <p className="text-xs font-bold text-hp-600 uppercase tracking-wider mb-4">HP — Heures Pleines</p>
                  <p className="text-5xl font-black text-hp-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-space-mono, monospace), sans-serif" }}>
                    {actual.pctHP.toFixed(1)}%
                  </p>
                  <p className="text-sm font-semibold text-hp-600 mb-3">{actual.hp} kWh</p>
                  <div className="h-2 rounded-full bg-hp-100 overflow-hidden">
                    <div className="h-full bg-hp-500 transition-all duration-1000 origin-left" style={{ width: `${actual.pctHP}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 gap-0.5">
                  <div className="bg-hc-500 transition-all duration-1000 rounded-l-full origin-left" style={{ width: `${actual.pctHC}%` }} />
                  <div className="bg-hp-500 transition-all duration-1000 rounded-r-full origin-right" style={{ width: `${actual.pctHP}%` }} />
                </div>
                <div className="flex justify-between text-xs font-bold mt-2">
                  <span className="text-hc-600">HC {actual.pctHC.toFixed(1)}%</span>
                  <span className="text-hp-600">HP {actual.pctHP.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Desglose del costo */}
            <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 p-6 animate-slide-up hover:shadow-card-lg transition-shadow duration-300" style={{ animationDelay: "200ms" }}>
              <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>Desglose del costo</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-hc-50 border border-hc-200/60 p-5 animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: "250ms" }}>
                  <p className="text-xs font-bold text-hc-600 uppercase tracking-wider mb-4">HC — Coste</p>
                  <p className="text-5xl font-black text-hc-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-space-mono, monospace), sans-serif" }}>
                    {actual.costoHC.toFixed(3)}<span className="text-2xl font-bold ml-1">€</span>
                  </p>
                  <p className="text-sm font-semibold text-hc-600 mb-3">{pctCostoHC.toFixed(1)}% del costo total</p>
                  <div className="h-2 rounded-full bg-hc-100 overflow-hidden">
                    <div className="h-full bg-hc-500 transition-all duration-1000 origin-left" style={{ width: `${pctCostoHC}%` }} />
                  </div>
                </div>

                <div className="rounded-xl bg-hp-50 border border-hp-200/60 p-5 animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: "325ms" }}>
                  <p className="text-xs font-bold text-hp-600 uppercase tracking-wider mb-4">HP — Coste</p>
                  <p className="text-5xl font-black text-hp-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-space-mono, monospace), sans-serif" }}>
                    {actual.costoHP.toFixed(3)}<span className="text-2xl font-bold ml-1">€</span>
                  </p>
                  <p className="text-sm font-semibold text-hp-600 mb-3">{pctCostoHP.toFixed(1)}% del costo total</p>
                  <div className="h-2 rounded-full bg-hp-100 overflow-hidden">
                    <div className="h-full bg-hp-500 transition-all duration-1000 origin-left" style={{ width: `${pctCostoHP}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 gap-0.5">
                  <div className="bg-hc-500 transition-all duration-1000 rounded-l-full origin-left" style={{ width: `${pctCostoHC}%` }} />
                  <div className="bg-hp-500 transition-all duration-1000 rounded-r-full origin-right" style={{ width: `${pctCostoHP}%` }} />
                </div>
                <div className="flex justify-between text-xs font-bold mt-2">
                  <span className="text-hc-600">HC {pctCostoHC.toFixed(1)}%</span>
                  <span className="text-slate-500 tabular-nums">Total: {actual.costoTotal.toFixed(3)} €</span>
                  <span className="text-hp-600">HP {pctCostoHP.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 4. GRÁFICO DE CONSUMO HC/HP 2026 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: "350ms" }}>
        <ConsumoHCHPChart data={kpis2026} title="Consumo HC/HP mensual 2026" />
        <CostoEvolucionChart data={kpis2026} title="Evolución de costes — 2026 (€)" />
      </div>

      {/* ── 4. COMPARACIÓN ÚLTIMOS 3 MESES ── */}
      {last3Months.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 overflow-hidden animate-slide-up hover:shadow-card-lg transition-shadow duration-300" style={{ animationDelay: "400ms" }}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>Últimos 3 meses — 2026 vs 2025</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mes</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-600">HC 2026</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-400">HC Var%</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-600">HP 2026</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-400">HP Var%</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Total 2026</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Total Var%</th>
                </tr>
              </thead>
              <tbody>
                {last3Months.map((d, idx) => {
                  const prev = kpis2025.find(p => p.mes === d.mes);
                  const varHC = prev ? Math.round(((d.hc - prev.hc) / prev.hc) * 100) : null;
                  const varHP = prev ? Math.round(((d.hp - prev.hp) / prev.hp) * 100) : null;
                  const varPct = prev ? Math.round(((d.total - prev.total) / prev.total) * 100) : null;
                  return (
                    <tr key={d.mes} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors animate-slide-up" style={{ animationDelay: `${425 + idx * 25}ms` }}>
                      <td className="px-6 py-3 font-semibold text-slate-700">{MESES[d.mes - 1]}</td>
                      <td className="px-4 py-3 text-right font-mono text-hc-600 font-semibold">{d.hc.toFixed(3)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        varHC ? (varHC < 0 ? "text-savings-600" : "text-red-500") : "text-slate-400"
                      }`}>
                        {varHC ? `${varHC > 0 ? "+" : ""}${varHC}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-hp-600 font-semibold">{d.hp.toFixed(3)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        varHP ? (varHP < 0 ? "text-savings-600" : "text-red-500") : "text-slate-400"
                      }`}>
                        {varHP ? `${varHP > 0 ? "+" : ""}${varHP}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800 font-semibold">{d.total.toFixed(3)}</td>
                      <td className={`px-5 py-3 text-right font-semibold ${
                        varPct ? (varPct < 0 ? "text-savings-600" : "text-red-500") : "text-slate-400"
                      }`}>
                        {varPct ? `${varPct > 0 ? "+" : ""}${varPct}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
