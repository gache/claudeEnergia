"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Zap, TrendingDown, TrendingUp, Minus, BarChart3, PenLine, Wallet, ArrowLeftRight, AlertTriangle, Leaf, DollarSign } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES } from "@/lib/data";

const ConsumoHCHPChart = dynamic(() => import("@/components/ConsumoHCHPChart"), { ssr: false });
const CostoEvolucionChart = dynamic(() => import("@/components/CostoEvolucionChart"), { ssr: false });

/* ── Sparkline ────────────────────────────────────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const bw = 5, gap = 2, h = 20;
  const w = values.length * (bw + gap) - gap;
  return (
    <svg width={w} height={h} aria-hidden="true">
      {values.map((v, i) => {
        const bh = Math.max(2, ((v - min) / range) * (h - 2));
        return (
          <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh}
            fill={color} rx={1}
            opacity={i === values.length - 1 ? 0.9 : 0.25 + (i / (values.length - 1)) * 0.45}
          />
        );
      })}
    </svg>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────── */
type KpiAccent = "brand" | "hc" | "hp" | "violet" | "indigo" | "emerald";

const accentConfig: Record<KpiAccent, {
  border: string; bg: string; valueColor: string; labelColor: string; iconBg: string; iconColor: string;
}> = {
  brand:   { border: "border border-brand-200/40",   bg: "bg-white",      valueColor: "text-brand-700",   labelColor: "text-slate-600",   iconBg: "bg-brand-100/60",   iconColor: "text-brand-600"   },
  hc:      { border: "border border-hc-200/50",      bg: "bg-hc-50",      valueColor: "text-hc-700",      labelColor: "text-hc-600",      iconBg: "bg-hc-100/70",      iconColor: "text-hc-600"      },
  hp:      { border: "border border-hp-200/50",      bg: "bg-hp-50",      valueColor: "text-hp-700",      labelColor: "text-hp-600",      iconBg: "bg-hp-100/70",      iconColor: "text-hp-600"      },
  violet:  { border: "border border-violet-200/40",  bg: "bg-violet-50",  valueColor: "text-violet-700",  labelColor: "text-violet-600",  iconBg: "bg-violet-100/60",  iconColor: "text-violet-600"  },
  indigo:  { border: "border border-indigo-200/50",  bg: "bg-indigo-50",  valueColor: "text-indigo-700",  labelColor: "text-indigo-600",  iconBg: "bg-indigo-100/70",  iconColor: "text-indigo-600"  },
  emerald: { border: "border border-emerald-200/50", bg: "bg-emerald-50", valueColor: "text-emerald-700", labelColor: "text-emerald-600", iconBg: "bg-emerald-100/70", iconColor: "text-emerald-600" },
};

function KpiCard({
  label, value, unit, subLabel, trend, trendColor, accent = "brand", icon: Icon, delay = 0,
  prevMargin, marginUnit, sparkline, sparklineColor, projected,
}: {
  label: string; value: string; unit?: string; subLabel?: string;
  trend?: number; trendColor?: "green" | "red";
  accent?: KpiAccent;
  icon?: React.ElementType;
  delay?: number;
  prevMargin?: number;
  marginUnit?: string;
  sparkline?: number[];
  sparklineColor?: string;
  projected?: string;
}) {
  const cfg = accentConfig[accent];
  const up   = (trend ?? 0) > 0;
  const down = (trend ?? 0) < 0;
  const exceeded = prevMargin !== undefined && prevMargin < 0;

  const resolvedColor = trendColor === "green"
    ? "text-savings-600"
    : trendColor === "red"
      ? "text-red-500"
      : down ? "text-savings-600" : up ? "text-red-500" : "text-slate-400";

  const valueCl = cfg.valueColor;

  const marginCl = exceeded
    ? `${cfg.valueColor} font-bold`
    : prevMargin !== undefined && prevMargin > 0
      ? "text-savings-600 font-bold"
      : "text-slate-400 font-semibold";

  const delayStyle = { animationDelay: `${delay}ms` } as React.CSSProperties;

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

      <p className={`text-[28px] font-bold tracking-tight leading-none tabular-nums transition-colors duration-300 ${valueCl}`}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1.5">{unit}</span>}
      </p>

      {subLabel && (
        <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-700 transition-colors">{subLabel}</p>
      )}

      {projected && (
        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">≈ {projected} fin de mes</p>
      )}

      {sparkline && sparkline.length >= 2 && (
        <div className="mt-2.5">
          <Sparkline values={sparkline} color={sparklineColor ?? "#6366f1"} />
        </div>
      )}

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50 flex-wrap">
          {prevMargin !== undefined ? (
            <span className={`flex items-center gap-1 text-xs font-mono font-semibold ${marginCl}`}>
              {down
                ? <TrendingDown className="w-3.5 h-3.5" />
                : up
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <Minus className="w-3.5 h-3.5" />}
              {exceeded
                ? `+${Math.abs(prevMargin).toFixed(3)} ${marginUnit ?? ""}`
                : `${prevMargin.toFixed(3)} ${marginUnit ?? ""}`}
            </span>
          ) : (
            <span className={`flex items-center gap-1 text-xs font-semibold ${resolvedColor}`}>
              {down
                ? <TrendingDown className="w-3.5 h-3.5" />
                : up
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <Minus className="w-3.5 h-3.5" />}
            </span>
          )}
          <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
            down
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : up
                ? `${cfg.iconBg} ${cfg.iconColor} ${cfg.border}`
                : "bg-slate-50 text-slate-500 border border-slate-200"
          }`}>
            {down ? "" : up ? "+" : ""}{Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Accum helper ─────────────────────────────────────────────────── */
type AccumFields = {
  hc: number; hp: number; total: number;
  costoHC: number; costoHP: number; costoTotal: number;
  pctHC: number; pctHP: number;
  difHCHP: number; ventajaHC: boolean;
};

function sumKpis(kpis: AccumFields[]): AccumFields {
  const hc  = kpis.reduce((s, k) => s + k.hc, 0);
  const hp  = kpis.reduce((s, k) => s + k.hp, 0);
  const total = hc + hp;
  const costoHC  = kpis.reduce((s, k) => s + k.costoHC, 0);
  const costoHP  = kpis.reduce((s, k) => s + k.costoHP, 0);
  const costoTotal = costoHC + costoHP;
  return {
    hc, hp, total, costoHC, costoHP, costoTotal,
    pctHC: total ? (hc / total) * 100 : 0,
    pctHP: total ? (hp / total) * 100 : 0,
    difHCHP: hp - hc,
    ventajaHC: hc < hp,
  };
}

/* ── Dashboard Page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const { registros, kpiFor, getByYear } = useEnergy();

  const currentMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();

  // Years with data
  const availableYears = [...new Set(registros.map(r => r.año))].sort((a, b) => a - b);
  const defaultYear = availableYears.includes(thisYear) ? thisYear
    : (availableYears[availableYears.length - 1] ?? thisYear);

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [mode, setMode] = useState<"mes" | "acum">("mes");

  const kpisYear    = getByYear(selectedYear);
  const kpisPrevYear = getByYear(selectedYear - 1);

  const availableMonths = new Set(kpisYear.map(k => k.mes));
  const defaultMonth = availableMonths.has(currentMonth) ? currentMonth
    : kpisYear.length > 0 ? kpisYear[kpisYear.length - 1].mes : currentMonth;

  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);

  const actual   = kpiFor(selectedMonth, selectedYear);
  const anterior = kpiFor(selectedMonth, selectedYear - 1);
  const mesLabel = MESES[selectedMonth - 1];

  // ── Selector header (shared between empty & normal states) ──
  const headerLabel = mode === "mes"
    ? `${mesLabel} ${selectedYear}`
    : `Ene–${mesLabel} ${selectedYear}`;

  const selectorRow = (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1 flex-wrap">
        {MESES.map((mes, i) => {
          const num = i + 1;
          const hasData = availableMonths.has(num);
          const isSelected = selectedMonth === num;
          const isCurrent = num === currentMonth && selectedYear === thisYear;
          return (
            <button
              key={num}
              onClick={() => setSelectedMonth(num)}
              disabled={!hasData}
              className={`relative px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm"
                  : hasData
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-slate-50 text-slate-300 cursor-not-allowed"
              }`}
            >
              {mes.slice(0, 3)}
              {isCurrent && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-hc-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mes / Acumulado toggle */}
      <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-bold flex-shrink-0">
        <button
          onClick={() => setMode("mes")}
          className={`px-3 py-1 transition-colors ${mode === "mes" ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
        >
          Mes
        </button>
        <button
          onClick={() => setMode("acum")}
          className={`px-3 py-1 transition-colors ${mode === "acum" ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
        >
          Acumulado
        </button>
      </div>
    </div>
  );

  if (!actual) {
    return (
      <div className="space-y-7 animate-fade-in">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest" style={{ fontFamily: "var(--font-space-mono, monospace)" }}>
                {headerLabel}
              </p>
              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
                Dashboard Energético
              </h1>
            </div>
            {availableYears.length > 1 && (
              <div className="flex gap-1 flex-shrink-0">
                {availableYears.map(y => (
                  <button key={y} onClick={() => setSelectedYear(y)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
                      selectedYear === y ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectorRow}
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Zap className="w-10 h-10 text-slate-300" />
          </div>
          <div>
            <p className="text-slate-700 font-semibold text-lg">Sin datos para {mesLabel} {selectedYear}</p>
            <p className="text-slate-400 text-sm mt-1">Ve a Registrar para añadir consumo.</p>
          </div>
          <a href="/registro" className="btn-primary mt-2">
            <PenLine className="w-4 h-4" />
            Registrar consumo
          </a>
        </div>
      </div>
    );
  }

  // ── Acumulado computation ──────────────────────────────────────
  const kpisForAccum     = kpisYear.filter(k => k.mes <= selectedMonth);
  const kpisPrevForAccum = kpisPrevYear.filter(k => k.mes <= selectedMonth);

  const display     = mode === "mes" ? actual : { ...actual, ...sumKpis(kpisForAccum) };
  const displayPrev = mode === "mes"
    ? anterior
    : kpisPrevForAccum.length > 0
      ? { ...actual, ...sumKpis(kpisPrevForAccum) }
      : anterior;

  // ── Variances ──────────────────────────────────────────────────
  const varTotalHC = displayPrev && displayPrev.hc !== 0
    ? Math.round(((display.hc - displayPrev.hc) / displayPrev.hc) * 100) : undefined;
  const varTotalHP = displayPrev && displayPrev.hp !== 0
    ? Math.round(((display.hp - displayPrev.hp) / displayPrev.hp) * 100) : undefined;
  const varTotal = displayPrev && displayPrev.total !== 0
    ? Math.round(((display.total - displayPrev.total) / displayPrev.total) * 100) : undefined;
  const varCosto = displayPrev && displayPrev.costoTotal !== 0
    ? Math.round(((display.costoTotal - displayPrev.costoTotal) / displayPrev.costoTotal) * 100) : undefined;
  const difActual   = Math.abs(display.difHCHP);
  const difAnterior = displayPrev ? Math.abs(displayPrev.difHCHP) : 0;
  const varDif = displayPrev && difAnterior !== 0
    ? Math.round(((difActual - difAnterior) / difAnterior) * 100) : undefined;

  const pctCostoHC = display.costoTotal > 0 ? (display.costoHC / display.costoTotal) * 100 : 0;
  const pctCostoHP = display.costoTotal > 0 ? (display.costoHP / display.costoTotal) * 100 : 0;

  // ── Projection (only in "mes" mode for current month) ─────────
  const isCurrentPeriod = mode === "mes" && selectedMonth === currentMonth && selectedYear === thisYear;
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const projFactor = isCurrentPeriod && currentDay > 0 && currentDay < daysInMonth ? daysInMonth / currentDay : null;
  const projHC    = projFactor ? actual.hc * projFactor : null;
  const projHP    = projFactor ? actual.hp * projFactor : null;
  const projTotal = projFactor ? actual.total * projFactor : null;
  const projCosto = projFactor ? actual.costoTotal * projFactor : null;

  // ── Sparklines: last 6 months up to selected ──────────────────
  const spark6 = kpisYear.filter(k => k.mes <= selectedMonth).slice(-6);
  const sparkHC    = spark6.map(k => k.hc);
  const sparkHP    = spark6.map(k => k.hp);
  const sparkTotal = spark6.map(k => k.total);
  const sparkCosto = spark6.map(k => k.costoTotal);

  // ── Ahorro acumulado (always vs prev year, Jan–selectedMonth) ──
  const accumCurr = kpisYear.filter(k => k.mes <= selectedMonth);
  const accumPrev = kpisPrevYear.filter(k => k.mes <= selectedMonth);
  const hasAhorro = accumPrev.length > 0;
  const ahorroKwh = accumPrev.reduce((s, k) => s + k.total, 0) - accumCurr.reduce((s, k) => s + k.total, 0);
  const ahorroEur = accumPrev.reduce((s, k) => s + k.costoTotal, 0) - accumCurr.reduce((s, k) => s + k.costoTotal, 0);

  // ── Trend alert threshold ──────────────────────────────────────
  const alertThreshold = 15;
  const showAlert = (varTotal !== undefined && varTotal > alertThreshold) && displayPrev !== null;

  // Table: up to 3 months ending at selectedMonth
  const tableMonths   = kpisYear.filter(k => k.mes <= selectedMonth).slice(-3);
  const kpisPrevByMes = new Map(kpisPrevYear.map(p => [p.mes, p]));

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest" style={{ fontFamily: "var(--font-space-mono, monospace)" }}>
              {headerLabel}
            </p>
            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
              Dashboard Energético
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-hc-700 bg-hc-50 border border-hc-200 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-hc-500 inline-block" />
              HC {actual.tarifaHC.toFixed(3)} €/kWh
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-hp-700 bg-hp-50 border border-hp-200 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-hp-500 inline-block" />
              HP {actual.tarifaHP.toFixed(3)} €/kWh
            </span>
            {/* Year selector */}
            {availableYears.length > 1 && (
              <div className="flex gap-1 flex-shrink-0">
                {availableYears.map(y => (
                  <button key={y} onClick={() => setSelectedYear(y)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
                      selectedYear === y ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectorRow}

        {/* Trend alert */}
        {showAlert && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-800">
              <span className="font-bold">{mesLabel} {selectedYear}:</span> consumo +{varTotal}% vs {selectedYear - 1}
              {varTotalHC !== undefined && varTotalHC > alertThreshold && <span className="ml-2 text-amber-700">· HC +{varTotalHC}%</span>}
              {varTotalHP !== undefined && varTotalHP > alertThreshold && <span className="ml-2 text-amber-700">· HP +{varTotalHP}%</span>}
            </p>
          </div>
        )}
      </div>

      {/* ── 1. KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Consumo HC"
          value={display.hc.toFixed(3)}
          unit="kWh"
          subLabel={`${display.costoHC.toFixed(3)} €`}
          trend={varTotalHC}
          prevMargin={displayPrev ? displayPrev.hc - display.hc : undefined}
          marginUnit="kWh"
          sparkline={sparkHC}
          sparklineColor="#3b82f6"
          projected={projHC ? `${projHC.toFixed(0)} kWh` : undefined}
          accent="hc"
          icon={Zap}
          delay={0}
        />
        <KpiCard
          label="Consumo HP"
          value={display.hp.toFixed(3)}
          unit="kWh"
          subLabel={`${display.costoHP.toFixed(3)} €`}
          trend={varTotalHP}
          prevMargin={displayPrev ? displayPrev.hp - display.hp : undefined}
          marginUnit="kWh"
          sparkline={sparkHP}
          sparklineColor="#dc2626"
          projected={projHP ? `${projHP.toFixed(0)} kWh` : undefined}
          accent="hp"
          icon={Zap}
          delay={75}
        />
        <KpiCard
          label="Consumo Total"
          value={display.total.toFixed(3)}
          unit="kWh"
          subLabel={`${display.costoTotal.toFixed(3)} €`}
          trend={varTotal}
          prevMargin={displayPrev ? displayPrev.total - display.total : undefined}
          marginUnit="kWh"
          sparkline={sparkTotal}
          sparklineColor="#6366f1"
          projected={projTotal ? `${projTotal.toFixed(0)} kWh` : undefined}
          accent="indigo"
          icon={BarChart3}
          delay={150}
        />
        <KpiCard
          label="Diferencia"
          value={difActual.toFixed(3)}
          unit="kWh"
          subLabel={display.ventajaHC ? "Ventaja HC" : "Domina HP"}
          trend={varDif}
          prevMargin={displayPrev ? difAnterior - difActual : undefined}
          marginUnit="kWh"
          trendColor={display.ventajaHC ? "green" : "red"}
          accent="violet"
          icon={ArrowLeftRight}
          delay={225}
        />
        <KpiCard
          label="Costo Total"
          value={display.costoTotal.toFixed(3)}
          unit="€"
          subLabel={`${display.total.toFixed(3)} kWh`}
          trend={varCosto}
          prevMargin={displayPrev ? displayPrev.costoTotal - display.costoTotal : undefined}
          marginUnit="€"
          sparkline={sparkCosto}
          sparklineColor="#10b981"
          projected={projCosto ? `${projCosto.toFixed(3)} €` : undefined}
          accent="emerald"
          icon={Wallet}
          delay={300}
        />
      </div>

      {/* ── 1b. AHORRO ACUMULADO ── */}
      {hasAhorro && (
        <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "325ms" }}>
          <div className={`rounded-2xl border p-4 flex items-center gap-4 ${
            ahorroKwh >= 0
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              ahorroKwh >= 0 ? "bg-emerald-100" : "bg-red-100"
            }`}>
              <Leaf className={`w-5 h-5 ${ahorroKwh >= 0 ? "text-emerald-600" : "text-red-500"}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Consumo Ene–{mesLabel}</p>
              <p className={`text-xl font-black tabular-nums ${ahorroKwh >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {ahorroKwh >= 0 ? "-" : "+"}{Math.abs(ahorroKwh).toFixed(0)} kWh
              </p>
              <p className="text-[11px] text-slate-500 font-medium">vs {selectedYear - 1}</p>
            </div>
          </div>
          <div className={`rounded-2xl border p-4 flex items-center gap-4 ${
            ahorroEur >= 0
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              ahorroEur >= 0 ? "bg-emerald-100" : "bg-red-100"
            }`}>
              <DollarSign className={`w-5 h-5 ${ahorroEur >= 0 ? "text-emerald-600" : "text-red-500"}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ahorro Ene–{mesLabel}</p>
              <p className={`text-xl font-black tabular-nums ${ahorroEur >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {ahorroEur >= 0 ? "-" : "+"}{Math.abs(ahorroEur).toFixed(3)} €
              </p>
              <p className="text-[11px] text-slate-500 font-medium">vs {selectedYear - 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 2 & 3. PARTICIPACIÓN + DESGLOSE DE COSTO ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Participación del consumo */}
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 p-6 animate-slide-up hover:shadow-card-lg transition-shadow duration-300" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>Participación del consumo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-hc-50 border border-hc-200/60 p-5 animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: "150ms" }}>
              <p className="text-xs font-bold text-hc-600 uppercase tracking-wider mb-4">HC — Heures Creuses</p>
              <p className="text-5xl font-black text-hc-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-space-mono, monospace), sans-serif" }}>{display.pctHC.toFixed(1)}%</p>
              <p className="text-sm font-semibold text-hc-600 mb-3">{display.hc.toFixed(3)} kWh</p>
              <div className="h-2 rounded-full bg-hc-100 overflow-hidden">
                <div className="h-full bg-hc-500 transition-all duration-1000 origin-left" style={{ width: `${display.pctHC}%` }} />
              </div>
            </div>
            <div className="rounded-xl bg-hp-50 border border-hp-200/60 p-5 animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: "225ms" }}>
              <p className="text-xs font-bold text-hp-600 uppercase tracking-wider mb-4">HP — Heures Pleines</p>
              <p className="text-5xl font-black text-hp-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-space-mono, monospace), sans-serif" }}>{display.pctHP.toFixed(1)}%</p>
              <p className="text-sm font-semibold text-hp-600 mb-3">{display.hp.toFixed(3)} kWh</p>
              <div className="h-2 rounded-full bg-hp-100 overflow-hidden">
                <div className="h-full bg-hp-500 transition-all duration-1000 origin-left" style={{ width: `${display.pctHP}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 gap-0.5">
              <div className="bg-hc-500 transition-all duration-1000 rounded-l-full origin-left" style={{ width: `${display.pctHC}%` }} />
              <div className="bg-hp-500 transition-all duration-1000 rounded-r-full origin-right" style={{ width: `${display.pctHP}%` }} />
            </div>
            <div className="flex justify-between text-xs font-bold mt-2">
              <span className="text-hc-600">HC {display.pctHC.toFixed(1)}%</span>
              <span className="text-hp-600">HP {display.pctHP.toFixed(1)}%</span>
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
                {display.costoHC.toFixed(3)}<span className="text-2xl font-bold ml-1">€</span>
              </p>
              <p className="text-sm font-semibold text-hc-600 mb-3">{pctCostoHC.toFixed(1)}% del costo total</p>
              <div className="h-2 rounded-full bg-hc-100 overflow-hidden">
                <div className="h-full bg-hc-500 transition-all duration-1000 origin-left" style={{ width: `${pctCostoHC}%` }} />
              </div>
            </div>
            <div className="rounded-xl bg-hp-50 border border-hp-200/60 p-5 animate-slide-up hover:shadow-md transition-shadow duration-300" style={{ animationDelay: "325ms" }}>
              <p className="text-xs font-bold text-hp-600 uppercase tracking-wider mb-4">HP — Coste</p>
              <p className="text-5xl font-black text-hp-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-space-mono, monospace), sans-serif" }}>
                {display.costoHP.toFixed(3)}<span className="text-2xl font-bold ml-1">€</span>
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
              <span className="text-slate-500 tabular-nums">Total: {display.costoTotal.toFixed(3)} €</span>
              <span className="text-hp-600">HP {pctCostoHP.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. GRÁFICOS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: "350ms" }}>
        <ConsumoHCHPChart
          data={kpisYear}
          highlightMonth={selectedMonth}
          title={`Consumo HC/HP mensual ${selectedYear}`}
        />
        <CostoEvolucionChart
          data={kpisYear}
          highlightMonth={selectedMonth}
          title={`Evolución de costes — ${selectedYear} (€)`}
        />
      </div>

      {/* ── 5. ÚLTIMOS MESES ── */}
      {tableMonths.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 overflow-hidden animate-slide-up hover:shadow-card-lg transition-shadow duration-300" style={{ animationDelay: "400ms" }}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
              {tableMonths.length === 1 ? "Mes seleccionado" : `Últimos ${tableMonths.length} meses`} — {selectedYear} vs {selectedYear - 1}
            </h2>
          </div>
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]" aria-label={`Comparativa meses ${selectedYear} vs ${selectedYear - 1}`}>
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100/50">
                    <th scope="col" className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mes</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-600">HC {selectedYear}</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-600">HC Var%</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-600">HP {selectedYear}</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-600">HP Var%</th>
                    <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Total {selectedYear}</th>
                    <th scope="col" className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Total Var%</th>
                  </tr>
                </thead>
                <tbody>
                  {tableMonths.map((d, idx) => {
                    const prev = kpisPrevByMes.get(d.mes);
                    const varHC  = prev ? Math.round(((d.hc    - prev.hc)    / prev.hc)    * 100) : null;
                    const varHP  = prev ? Math.round(((d.hp    - prev.hp)    / prev.hp)    * 100) : null;
                    const varPct = prev ? Math.round(((d.total - prev.total) / prev.total) * 100) : null;
                    const isSelected = d.mes === selectedMonth;
                    return (
                      <tr
                        key={d.mes}
                        className={`border-b border-slate-50 transition-colors animate-slide-up ${
                          isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50/70"
                        }`}
                        style={{ animationDelay: `${425 + idx * 25}ms` }}
                      >
                        <td className="px-6 py-3 font-semibold text-slate-700">
                          {MESES[d.mes - 1]}
                          {isSelected && <span className="ml-2 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">sel</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-hc-600 font-semibold">{d.hc.toFixed(3)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${varHC !== null ? (varHC < 0 ? "text-savings-600" : "text-red-500") : "text-slate-400"}`}>
                          {varHC !== null ? `${varHC > 0 ? "+" : ""}${varHC}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-hp-600 font-semibold">{d.hp.toFixed(3)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${varHP !== null ? (varHP < 0 ? "text-savings-600" : "text-red-500") : "text-slate-400"}`}>
                          {varHP !== null ? `${varHP > 0 ? "+" : ""}${varHP}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-800 font-semibold">{d.total.toFixed(3)}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${varPct !== null ? (varPct < 0 ? "text-savings-600" : "text-red-500") : "text-slate-400"}`}>
                          {varPct !== null ? `${varPct > 0 ? "+" : ""}${varPct}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="xl:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent rounded-r-2xl" aria-hidden="true" />
          </div>
        </div>
      )}

    </div>
  );
}
