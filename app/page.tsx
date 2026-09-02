"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Zap, TrendingDown, TrendingUp, Minus, BarChart3, PenLine, Wallet, ArrowLeftRight, AlertTriangle, Leaf, DollarSign } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES } from "@/lib/data";

const ConsumoHCHPChart = dynamic(() => import("@/components/ConsumoHCHPChart"), { ssr: false });
const CostoEvolucionChart = dynamic(() => import("@/components/CostoEvolucionChart"), { ssr: false });
const DonutHCHP = dynamic(() => import("@/components/DonutHCHP"), { ssr: false });

/* ── useCountUp ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 500): number {
  const [val, setVal] = useState(target);
  const raf = useRef<number>();
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(from + (target - from) * ease);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else { setVal(target); prev.current = target; }
    };
    raf.current = requestAnimationFrame(tick);
    prev.current = target;
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

/* ── MiniDonut ───────────────────────────────────────────────────── */
function MiniDonut({ pct, color }: { pct: number; color: string }) {
  const r = 20, cx = 24, cy = 24;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={48} height={48} aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill={color}>
        {pct.toFixed(1)}%
      </text>
    </svg>
  );
}

/* ── Sparkline ────────────────────────────────────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 56, H = 18;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - 2 - ((v - min) / range) * (H - 4),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)},${H} L 0,${H} Z`;
  const gid = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2} fill={color} />
    </svg>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────── */
type KpiAccent = "brand" | "hc" | "hp" | "violet" | "indigo" | "emerald";

const accentConfig: Record<KpiAccent, {
  border: string; bg: string; valueColor: string; labelColor: string; iconBg: string; iconColor: string;
}> = {
  brand:   { border: "border border-slate-100", bg: "bg-white", valueColor: "text-brand-700",   labelColor: "text-slate-500",   iconBg: "bg-brand-50",    iconColor: "text-brand-600"   },
  hc:      { border: "border border-slate-100", bg: "bg-white", valueColor: "text-hc-700",      labelColor: "text-hc-600",      iconBg: "bg-hc-100",      iconColor: "text-hc-600"      },
  hp:      { border: "border border-slate-100", bg: "bg-white", valueColor: "text-hp-700",      labelColor: "text-hp-600",      iconBg: "bg-hp-100",      iconColor: "text-hp-600"      },
  violet:  { border: "border border-slate-100", bg: "bg-white", valueColor: "text-violet-700",  labelColor: "text-violet-600",  iconBg: "bg-violet-100",  iconColor: "text-violet-600"  },
  indigo:  { border: "border border-slate-100", bg: "bg-white", valueColor: "text-indigo-700",  labelColor: "text-indigo-600",  iconBg: "bg-indigo-100",  iconColor: "text-indigo-600"  },
  emerald: { border: "border border-slate-100", bg: "bg-white", valueColor: "text-emerald-700", labelColor: "text-emerald-600", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
};

function KpiCard({
  label, value, unit, subLabel, trend, trendColor, accent = "brand", icon: Icon, delay = 0,
  prevMargin, marginUnit, sparkline, sparklineColor, projected, rawValue, decimals: dec = 3,
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
  rawValue?: number;
  decimals?: number;
}) {
  const animated = useCountUp(rawValue ?? 0);
  const displayValue = rawValue !== undefined ? animated.toFixed(dec) : value;
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
    <div className={`${cfg.bg} ${cfg.border} rounded-2xl shadow-card-md p-5 transition-all duration-300 group animate-slide-up`} style={delayStyle}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-sm font-bold uppercase tracking-widest ${cfg.labelColor}`} style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
            <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
          </div>
        )}
      </div>

      <p className={`text-[28px] font-bold tracking-tight leading-none tabular-nums transition-colors duration-300 ${valueCl}`}>
        {displayValue}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1.5">{unit}</span>}
      </p>

      {subLabel && (
        <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-700 transition-colors">{subLabel}</p>
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

/* ── MetricRow ───────────────────────────────────────────────────── */
function MetricRow({ label, curr, prev, color, varPct }: {
  label: string; curr: number; prev?: number; color: string; varPct: number | null;
}) {
  const maxVal = Math.max(curr, prev ?? 0) || 1;
  const currPct = (curr / maxVal) * 100;
  const prevPct = prev !== undefined ? (prev / maxVal) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">{label}</span>
        <div className="flex items-baseline gap-1.5 min-w-0 overflow-hidden">
          <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">{curr.toFixed(1)}</span>
          {prev !== undefined && (
            <span className="text-[10px] font-mono text-slate-400 tabular-nums truncate">/ {prev.toFixed(1)}</span>
          )}
        </div>
        {varPct !== null && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
            varPct < 0 ? "bg-emerald-50 text-emerald-700" : varPct > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
          }`}>
            {varPct > 0 ? "+" : ""}{varPct}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${currPct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
        </div>
        {prev !== undefined && (
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-slate-300 transition-all duration-700"
              style={{ width: `${prevPct}%` }} />
          </div>
        )}
      </div>
    </div>
  );
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

  // ── Proyección fin de año ─────────────────────────────────────
  const remainingMonthNums = Array.from({ length: 12 - selectedMonth }, (_, i) => selectedMonth + 1 + i);
  const showYearProj   = kpisYear.length > 0 && remainingMonthNums.length > 0;
  const accumCurrKwh   = kpisForAccum.reduce((s, k) => s + k.total, 0);
  const accumCurrCosto = kpisForAccum.reduce((s, k) => s + k.costoTotal, 0);
  let projRemKwh = 0, projRemCosto = 0, projUsesPrevYear = false;
  if (showYearProj) {
    const prevMap  = new Map(kpisPrevYear.map(k => [k.mes, k]));
    const avgKwh   = kpisForAccum.length > 0 ? accumCurrKwh   / kpisForAccum.length : 0;
    const avgCosto = kpisForAccum.length > 0 ? accumCurrCosto / kpisForAccum.length : 0;
    if (remainingMonthNums.some(m => prevMap.has(m))) projUsesPrevYear = true;
    remainingMonthNums.forEach(m => {
      const p = prevMap.get(m);
      projRemKwh   += p ? p.total      : avgKwh;
      projRemCosto += p ? p.costoTotal : avgCosto;
    });
  }
  const projYearKwh   = accumCurrKwh   + projRemKwh;
  const projYearCosto = accumCurrCosto + projRemCosto;

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
      </div>

      {/* ── 1. KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Consumo HC"
          value={display.hc.toFixed(3)} rawValue={display.hc}
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
          value={display.hp.toFixed(3)} rawValue={display.hp}
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
          value={display.total.toFixed(3)} rawValue={display.total}
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
          value={difActual.toFixed(3)} rawValue={difActual}
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
          value={display.costoTotal.toFixed(3)} rawValue={display.costoTotal}
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

      {/* ── 1b. TREND ALERT ── */}
      {showAlert && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl animate-slide-up">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            <span className="font-bold">{mesLabel} {selectedYear}:</span> consumo +{varTotal}% vs {selectedYear - 1}
            {varTotalHC !== undefined && varTotalHC > alertThreshold && <span className="ml-2 text-amber-700">· HC +{varTotalHC}%</span>}
            {varTotalHP !== undefined && varTotalHP > alertThreshold && <span className="ml-2 text-amber-700">· HP +{varTotalHP}%</span>}
          </p>
        </div>
      )}

      {/* ── 2. PARTICIPACIÓN + DESGLOSE DE COSTO ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Participación del consumo */}
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 p-6 animate-slide-up hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-300" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>Participación del consumo</h2>
          <DonutHCHP
            hcPct={display.pctHC} hpPct={display.pctHP}
            hcKwh={display.hc} hpKwh={display.hp}
            total={display.total} layout="featured"
          />
        </div>

        {/* Desglose del costo */}
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-100/40 p-6 animate-slide-up hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-300" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>Desglose del costo</h2>
          <DonutHCHP
            hcPct={pctCostoHC} hpPct={pctCostoHP}
            hcKwh={display.costoHC} hpKwh={display.costoHP}
            total={display.costoTotal} unit="€" decimals={3} totalDecimals={0} showUnitInline layout="featured"
          />
        </div>
      </div>

      {/* ── 3. GRÁFICOS ── */}
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

      {/* ── 4. AHORRO ACUMULADO ── */}
      {hasAhorro && (
        <div className="animate-slide-up" style={{ animationDelay: "325ms" }}>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
            Ahorro acumulado — Ene–{mesLabel}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ahorroKwh >= 0 ? "bg-emerald-100" : "bg-red-100"}`}>
                <Leaf className={`w-5 h-5 ${ahorroKwh >= 0 ? "text-emerald-600" : "text-red-500"}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consumo vs {selectedYear - 1}</p>
                <p className={`text-xl font-black tabular-nums ${ahorroKwh >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {ahorroKwh < 0 ? "+" : ""}{Math.abs(ahorroKwh).toFixed(0)} kWh
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{ahorroKwh >= 0 ? "menos consumo" : "más consumo"}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ahorroEur >= 0 ? "bg-emerald-100" : "bg-red-100"}`}>
                <DollarSign className={`w-5 h-5 ${ahorroEur >= 0 ? "text-emerald-600" : "text-red-500"}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ahorro en € vs {selectedYear - 1}</p>
                <p className={`text-xl font-black tabular-nums ${ahorroEur >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {ahorroEur < 0 ? "+" : ""}{Math.abs(ahorroEur).toFixed(2)} €
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{ahorroEur >= 0 ? "gastado menos" : "gastado más"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. PROYECCIÓN FIN DE AÑO ── */}
      {showYearProj && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-slide-up" style={{ animationDelay: "450ms" }}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h2 className="text-base font-black text-slate-900" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
                Estimado {selectedYear}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
              {projUsesPrevYear ? `datos ${selectedYear - 1}` : "promedio"} · {remainingMonthNums.length}m restantes
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">kWh estimado año</p>
              <p className="text-2xl font-black text-indigo-700 tabular-nums leading-none">
                {projYearKwh.toFixed(0)}<span className="text-sm font-normal text-slate-400 ml-1">kWh</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                actual {accumCurrKwh.toFixed(0)} + ~{projRemKwh.toFixed(0)} est.
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">€ estimado año</p>
              <p className="text-2xl font-black text-emerald-700 tabular-nums leading-none">
                {projYearCosto.toFixed(2)}<span className="text-sm font-normal text-slate-400 ml-1">€</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                actual {accumCurrCosto.toFixed(2)} + ~{projRemCosto.toFixed(2)} est.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. COMPARATIVA DE MESES ── */}
      {tableMonths.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
            {tableMonths.length === 1 ? "Mes seleccionado" : `Últimos ${tableMonths.length} meses`} — {selectedYear} vs {selectedYear - 1}
          </h2>
          <div className={`grid gap-4 ${tableMonths.length >= 3 ? "grid-cols-1 sm:grid-cols-3" : tableMonths.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 max-w-xs"}`}>
            {tableMonths.map((d, idx) => {
              const prev = kpisPrevByMes.get(d.mes);
              const isSelected = d.mes === selectedMonth;
              const varTot  = prev ? Math.round(((d.total      - prev.total)      / prev.total)      * 100) : null;
              const varCost = prev ? Math.round(((d.costoTotal - prev.costoTotal) / prev.costoTotal) * 100) : null;
              const varHC   = prev ? Math.round(((d.hc         - prev.hc)         / prev.hc)         * 100) : null;
              const varHP   = prev ? Math.round(((d.hp         - prev.hp)         / prev.hp)         * 100) : null;
              return (
                <div
                  key={d.mes}
                  className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all duration-300 animate-slide-up ${
                    isSelected ? "border-indigo-300 shadow-md shadow-indigo-50" : "border-slate-100"
                  }`}
                  style={{ animationDelay: `${425 + idx * 25}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>{MESES[d.mes - 1]}</h3>
                      {isSelected && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">sel</span>}
                    </div>
                    {varTot !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                        varTot < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : varTot > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {varTot > 0 ? "+" : ""}{varTot}%
                      </span>
                    )}
                  </div>

                  {/* Year legend */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[9px] text-slate-400 font-bold">{selectedYear - 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[9px] text-slate-500 font-bold">{selectedYear}</span>
                    </div>
                  </div>

                  {/* Metric rows */}
                  <div className="space-y-3">
                    <MetricRow label="HC (kWh)"    curr={d.hc}    prev={prev?.hc}    color="#3b82f6" varPct={varHC}  />
                    <MetricRow label="HP (kWh)"    curr={d.hp}    prev={prev?.hp}    color="#dc2626" varPct={varHP}  />
                    <MetricRow label="Total (kWh)" curr={d.total} prev={prev?.total} color="#6366f1" varPct={varTot} />
                  </div>

                  {/* Cost footer */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Costo</p>
                      <p className="text-base font-black text-slate-900 tabular-nums">{d.costoTotal.toFixed(3)} €</p>
                      {prev && (
                        <p className="text-[10px] text-slate-400 font-mono">{prev.costoTotal.toFixed(3)} € · {selectedYear - 1}</p>
                      )}
                    </div>
                    {varCost !== null && (
                      <span className={`text-sm font-black px-2.5 py-1 rounded-xl border ${
                        varCost < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : varCost > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {varCost > 0 ? "+" : ""}{varCost}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
