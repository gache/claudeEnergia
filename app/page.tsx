"use client";

import { Zap, TrendingDown, TrendingUp, Minus, BarChart3, Wallet, PenLine } from "lucide-react";
import ConsumoHCHPChart from "@/components/ConsumoHCHPChart";
import CostoEvolucionChart from "@/components/CostoEvolucionChart";
import { useEnergy } from "@/lib/EnergyContext";
import { KPIMensual } from "@/lib/data";

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

/* ── HC / HP Detail Card ─────────────────────────────────────────── */
function TarifaCard({
  type, kwh, costo, tarifa, pct,
}: { type: "HC" | "HP"; kwh: number; costo: number; tarifa: number; pct: number }) {
  const isHC = type === "HC";
  return (
    <div className={`rounded-2xl p-5 border shadow-card ${
      isHC
        ? "bg-gradient-to-br from-hc-50 to-cyan-50 border-hc-200"
        : "bg-gradient-to-br from-hp-50 to-amber-50 border-hp-200"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isHC ? "bg-hc-500" : "bg-hp-500"}`} />
          <p className={`text-xs font-bold uppercase tracking-widest ${isHC ? "text-hc-600" : "text-hp-600"}`}>
            {type} — Heures {isHC ? "Creuses" : "Pleines"}
          </p>
        </div>
        <span className={`badge ${isHC ? "badge-hc" : "badge-hp"}`}>
          {pct.toFixed(1)}%
        </span>
      </div>

      <p className={`text-3xl font-bold tabular-nums ${isHC ? "text-hc-700" : "text-hp-700"}`}>
        {kwh}
        <span className="text-base font-normal ml-1 opacity-60">kWh</span>
      </p>

      <div className={`mt-4 pt-3 border-t space-y-2 ${isHC ? "border-hc-200" : "border-hp-200"}`}>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-medium ${isHC ? "text-hc-500" : "text-hp-500"}`}>Coste</span>
          <span className={`text-sm font-bold tabular-nums ${isHC ? "text-hc-700" : "text-hp-700"}`}>
            {costo.toFixed(3)} €
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-medium ${isHC ? "text-hc-400" : "text-hp-400"}`}>Tarifa</span>
          <span className={`text-xs font-mono font-semibold ${isHC ? "text-hc-600" : "text-hp-600"}`}>
            {tarifa} €/kWh
          </span>
        </div>
      </div>

      {/* Participation bar */}
      <div className="mt-3">
        <div className={`h-1.5 rounded-full ${isHC ? "bg-hc-100" : "bg-hp-100"} overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${isHC ? "bg-hc-500" : "bg-hp-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Ventaja Card (center) ───────────────────────────────────────── */
function VentajaCard({ d }: { d: KPIMensual }) {
  const { ventajaHC, difHCHP, pctHC, pctHP, costoHC, costoHP } = d;
  const costoAbsDif = Math.abs(costoHP - costoHC).toFixed(3);
  const isGood = ventajaHC;

  return (
    <div className={`rounded-2xl p-5 border-2 shadow-card-md ${
      isGood
        ? "bg-gradient-to-br from-savings-50 to-cyan-50 border-savings-200"
        : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Balance HC vs HP
        </p>
        <span className={`badge ${
          isGood
            ? "bg-savings-100 text-savings-700 border border-savings-200"
            : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {isGood ? "Ventaja HC" : "Domina HP"}
        </span>
      </div>

      <p className={`text-4xl font-bold tabular-nums leading-none ${
        isGood ? "text-hc-700" : "text-red-600"
      }`}>
        {Math.abs(difHCHP)}
        <span className="text-base font-normal ml-1 opacity-60">kWh</span>
      </p>

      <p className={`text-xs mt-2 font-medium ${isGood ? "text-hc-600" : "text-red-500"}`}>
        {isGood
          ? `HC domina · ahorro de ${costoAbsDif} € frente a tarifa HP`
          : `HP domina · sobrecosto de ${costoAbsDif} € frente a tarifa HC`}
      </p>

      {/* Split bar */}
      <div className="mt-5">
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 gap-0.5">
          <div
            className="bg-hc-500 transition-all duration-700 rounded-l-full"
            style={{ width: `${pctHC}%` }}
          />
          <div
            className="bg-hp-500 transition-all duration-700 rounded-r-full"
            style={{ width: `${pctHP}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-bold mt-2">
          <span className="text-hc-600 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-hc-500" />
            HC {pctHC.toFixed(1)}%
          </span>
          <span className="text-hp-600 flex items-center gap-1">
            HP {pctHP.toFixed(1)}%
            <div className="w-2 h-2 rounded-full bg-hp-500" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const { kpiFor, getByYear } = useEnergy();

  const actual   = kpiFor(4, 2026);
  const anterior = kpiFor(4, 2025);
  const kpis2026 = getByYear(2026);

  if (!actual) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Zap className="w-10 h-10 text-slate-300" />
        </div>
        <div>
          <p className="text-slate-700 font-semibold text-lg">Sin datos para Abril 2026</p>
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

  const varTotal = anterior
    ? Math.round(((actual.total - anterior.total) / anterior.total) * 100)
    : undefined;
  const varCosto = anterior
    ? Math.round(((actual.costoTotal - anterior.costoTotal) / anterior.costoTotal) * 100)
    : undefined;
  const isBetter = (varTotal ?? 0) < 0;

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-brand-50 text-brand-700 border border-brand-100">
              Abril 2026
            </span>
            {anterior && (
              <span className={`badge ${(varTotal ?? 0) < 0 ? "badge-negative" : "badge-positive"}`}>
                {(varTotal ?? 0) > 0 ? "+" : ""}{varTotal}% consumo vs 2025
              </span>
            )}
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

      {/* ── KPI primarios ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Consumo total"
          value={String(actual.total)}
          unit="kWh"
          subLabel="Este mes"
          trend={varTotal}
          accent="brand"
          icon={BarChart3}
        />
        <KpiCard
          label="Coste total"
          value={actual.costoTotal.toFixed(3)}
          unit="€"
          subLabel="HC + HP combinado"
          trend={varCosto}
          accent="violet"
          icon={Wallet}
        />
        <KpiCard
          label="HC — Heures Creuses"
          value={String(actual.hc)}
          unit="kWh"
          subLabel={`${actual.costoHC.toFixed(3)} € · ${actual.pctHC.toFixed(1)}% del total`}
          accent="hc"
          icon={Zap}
        />
        <KpiCard
          label="HP — Heures Pleines"
          value={String(actual.hp)}
          unit="kWh"
          subLabel={`${actual.costoHP.toFixed(3)} € · ${actual.pctHP.toFixed(1)}% del total`}
          accent="hp"
          icon={Zap}
        />
      </div>

      {/* ── HC / HP breakdown + Ventaja ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TarifaCard
          type="HC"
          kwh={actual.hc}
          costo={actual.costoHC}
          tarifa={actual.tarifaHC}
          pct={actual.pctHC}
        />
        <VentajaCard d={actual} />
        <TarifaCard
          type="HP"
          kwh={actual.hp}
          costo={actual.costoHP}
          tarifa={actual.tarifaHP}
          pct={actual.pctHP}
        />
      </div>

      {/* ── Comparativa interanual banner ── */}
      {anterior && (
        <div className={`rounded-2xl border overflow-hidden shadow-card ${
          isBetter
            ? "bg-gradient-to-r from-savings-50 to-cyan-50 border-savings-200"
            : "bg-gradient-to-r from-red-50 to-orange-50 border-red-200"
        }`}>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isBetter ? "bg-savings-100" : "bg-red-100"
              }`}>
                {isBetter
                  ? <TrendingDown className="w-5 h-5 text-savings-600" />
                  : <TrendingUp className="w-5 h-5 text-red-500" />
                }
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${
                  isBetter ? "text-savings-500" : "text-red-500"
                }`}>
                  Comparativa Abr 2025 → Abr 2026
                </p>
                <p className={`text-xl font-bold tabular-nums ${
                  isBetter ? "text-savings-700" : "text-red-600"
                }`}>
                  {(varTotal ?? 0) > 0 ? "+" : ""}{varTotal}% consumo
                  <span className="text-slate-400 font-normal mx-2">·</span>
                  {(varCosto ?? 0) > 0 ? "+" : ""}{varCosto}% coste
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide">2025</p>
                <p className="text-sm text-slate-500 tabular-nums">{anterior.total} kWh</p>
                <p className="text-sm text-slate-400 tabular-nums">{anterior.costoTotal.toFixed(3)} €</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase text-slate-600 tracking-wide">2026</p>
                <p className="text-sm font-bold text-slate-700 tabular-nums">{actual.total} kWh</p>
                <p className="text-sm font-bold text-slate-600 tabular-nums">{actual.costoTotal.toFixed(3)} €</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ConsumoHCHPChart data={kpis2026} title="Consumo HC/HP mensual 2026" />
        <CostoEvolucionChart data={kpis2026} title="Evolución de costes 2026 (€)" />
      </div>

    </div>
  );
}
