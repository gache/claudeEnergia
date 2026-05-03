"use client";

import dynamic from "next/dynamic";
import { Zap, TrendingDown, TrendingUp, Minus, BarChart3, PenLine } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES } from "@/lib/data";

const ConsumoHCHPChart = dynamic(() => import("@/components/ConsumoHCHPChart"), { ssr: false });

/* ── KPI Card ─────────────────────────────────────────────────────── */
type KpiAccent = "brand" | "hc" | "hp" | "violet";

const accentConfig: Record<KpiAccent, {
  border: string; bg: string; valueColor: string; labelColor: string; iconBg: string; iconColor: string;
}> = {
  brand:  {
    border: "border-t-[3px] border-brand-500",
    bg: "bg-white",
    valueColor: "text-slate-800",
    labelColor: "text-slate-400",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  hc: {
    border: "border-t-[3px] border-hc-500",
    bg: "bg-white",
    valueColor: "text-hc-700",
    labelColor: "text-hc-400",
    iconBg: "bg-hc-50",
    iconColor: "text-hc-600",
  },
  hp: {
    border: "border-t-[3px] border-hp-500",
    bg: "bg-white",
    valueColor: "text-hp-700",
    labelColor: "text-hp-400",
    iconBg: "bg-hp-50",
    iconColor: "text-hp-600",
  },
  violet: {
    border: "border-t-[3px] border-violet-500",
    bg: "bg-white",
    valueColor: "text-slate-800",
    labelColor: "text-slate-400",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
};

function KpiCard({
  label, value, unit, subLabel, trend, trendLabel, accent = "brand", icon: Icon,
}: {
  label: string; value: string; unit?: string; subLabel?: string;
  trend?: number; trendLabel?: string;
  accent?: KpiAccent;
  icon?: React.ElementType;
}) {
  const cfg = accentConfig[accent];
  const up   = (trend ?? 0) > 0;
  const down = (trend ?? 0) < 0;

  return (
    <div className={`${cfg.bg} ${cfg.border} rounded-2xl shadow-card-md p-5 animate-slide-up hover:shadow-card-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-[11px] font-semibold uppercase tracking-widest ${cfg.labelColor}`} style={{ fontFamily: "var(--font-sora, Sora), sans-serif" }}>{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
          </div>
        )}
      </div>

      <p className={`text-[28px] font-bold tracking-tight leading-none tabular-nums ${cfg.valueColor} group-hover:text-slate-900 transition-colors duration-300`} style={{ fontFamily: "var(--font-sora, Sora), sans-serif" }}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1.5">{unit}</span>}
      </p>

      {subLabel && (
        <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-500 transition-colors">{subLabel}</p>
      )}

      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-slate-50 text-xs font-semibold ${
          down ? "text-savings-600" : up ? "text-red-500" : "text-slate-400"
        }`}>
          {down
            ? <TrendingDown className="w-3.5 h-3.5" />
            : up
              ? <TrendingUp className="w-3.5 h-3.5" />
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

  const mesActual = MESES[displayMonth - 1];
  const last3Months = kpis2026.slice(-3);

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-brand-50 text-brand-700 border border-brand-100">
              {mesActual} 2026
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard Energético</h1>
          <p className="text-slate-500 text-sm mt-1">
            Análisis de consumo mensual HC/HP · Tarifas: HC {actual.tarifaHC.toFixed(3)} €/kWh — HP {actual.tarifaHP.toFixed(3)} €/kWh
          </p>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-card">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total mes</p>
            <p className="text-base font-bold text-slate-800 leading-none tabular-nums">
              {actual.total} kWh · {actual.costoTotal.toFixed(3)} €
            </p>
          </div>
        </div>
      </div>

      {/* ── 1. CONSUMO HC, HP, TOTAL, DIFERENCIA ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Consumo HC"
          value={String(actual.hc)}
          unit="kWh"
          subLabel={`${actual.costoHC.toFixed(3)} €`}
          trend={varTotalHC}
          accent="hc"
          icon={Zap}
        />
        <KpiCard
          label="Consumo HP"
          value={String(actual.hp)}
          unit="kWh"
          subLabel={`${actual.costoHP.toFixed(3)} €`}
          trend={varTotalHP}
          accent="hp"
          icon={Zap}
        />
        <KpiCard
          label="Consumo Total"
          value={String(actual.total)}
          unit="kWh"
          subLabel={`${actual.costoTotal.toFixed(3)} €`}
          trend={varTotal}
          accent="brand"
          icon={BarChart3}
        />
        <KpiCard
          label="Diferencia"
          value={String(Math.abs(actual.difHCHP))}
          unit="kWh"
          subLabel={actual.ventajaHC ? "Ventaja HC" : "Domina HP"}
          accent="violet"
          icon={Minus}
        />
      </div>

      {/* ── 2. PARTICIPACIÓN DEL MES ── */}
      <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Participación del consumo</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HC Card */}
          <div className="rounded-xl bg-gradient-to-br from-hc-50 to-cyan-50 border border-hc-200 p-5">
            <p className="text-xs font-bold text-hc-600 uppercase tracking-wider mb-4">HC — Heures Creuses</p>
            <p className="text-5xl font-black text-hc-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-sora, Sora), sans-serif" }}>
              {actual.pctHC.toFixed(1)}%
            </p>
            <p className="text-sm font-semibold text-hc-600 mb-3">{actual.hc} kWh</p>
            <div className="h-2 rounded-full bg-hc-100 overflow-hidden">
              <div
                className="h-full bg-hc-500 transition-all duration-700"
                style={{ width: `${actual.pctHC}%` }}
              />
            </div>
          </div>

          {/* HP Card */}
          <div className="rounded-xl bg-gradient-to-br from-hp-50 to-amber-50 border border-hp-200 p-5">
            <p className="text-xs font-bold text-hp-600 uppercase tracking-wider mb-4">HP — Heures Pleines</p>
            <p className="text-5xl font-black text-hp-700 tabular-nums mb-1" style={{ fontFamily: "var(--font-sora, Sora), sans-serif" }}>
              {actual.pctHP.toFixed(1)}%
            </p>
            <p className="text-sm font-semibold text-hp-600 mb-3">{actual.hp} kWh</p>
            <div className="h-2 rounded-full bg-hp-100 overflow-hidden">
              <div
                className="h-full bg-hp-500 transition-all duration-700"
                style={{ width: `${actual.pctHP}%` }}
              />
            </div>
          </div>
        </div>

        {/* Split bar */}
        <div className="mt-6">
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 gap-0.5">
            <div
              className="bg-hc-500 transition-all duration-700 rounded-l-full"
              style={{ width: `${actual.pctHC}%` }}
            />
            <div
              className="bg-hp-500 transition-all duration-700 rounded-r-full"
              style={{ width: `${actual.pctHP}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold mt-2">
            <span className="text-hc-600">HC {actual.pctHC.toFixed(1)}%</span>
            <span className="text-hp-600">HP {actual.pctHP.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* ── 3. COMPARACIÓN ÚLTIMOS 3 MESES ── */}
      {last3Months.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Últimos 3 meses — 2026 vs 2025</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mes</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-600">HC 2026</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-600">HP 2026</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Total 2026</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">vs 2025</th>
                </tr>
              </thead>
              <tbody>
                {last3Months.map(d => {
                  const prev = kpis2025.find(p => p.mes === d.mes);
                  const varPct = prev ? Math.round(((d.total - prev.total) / prev.total) * 100) : null;
                  return (
                    <tr key={d.mes} className="border-b border-slate-50 hover:bg-slate-50/70">
                      <td className="px-6 py-3 font-semibold text-slate-700">{MESES[d.mes - 1]}</td>
                      <td className="px-4 py-3 text-right font-mono text-hc-600 font-semibold">{d.hc.toFixed(3)}</td>
                      <td className="px-4 py-3 text-right font-mono text-hp-600 font-semibold">{d.hp.toFixed(3)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800 font-semibold">{d.total.toFixed(3)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${
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

      {/* ── 4. GRÁFICO DE CONSUMO HC/HP 2026 ── */}
      <ConsumoHCHPChart data={kpis2026} title="Consumo HC/HP mensual 2026" />

    </div>
  );
}
