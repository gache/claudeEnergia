"use client";

import dynamic from "next/dynamic";
import { useState, Suspense } from "react";
import { FileX, Download, AlertTriangle } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { ANOS_DISPONIBLES, MESES, calcularTotales, KPIMensual } from "@/lib/data";
import ChartSkeleton from "@/components/ChartSkeleton";
import TableSkeleton from "@/components/TableSkeleton";
import HeatmapCosto from "@/components/HeatmapCosto";

const TablaConsumo = dynamic(() => import("@/components/TablaConsumo"), { ssr: false });
const ConsumoHCHPChart = dynamic(() => import("@/components/ConsumoHCHPChart"), { ssr: false, loading: () => <ChartSkeleton /> });
const CostoEvolucionChart = dynamic(() => import("@/components/CostoEvolucionChart"), { ssr: false, loading: () => <ChartSkeleton /> });
const EficienciaHCChart = dynamic(() => import("@/components/EficienciaHCChart"), { ssr: false, loading: () => <ChartSkeleton /> });

function exportCSV(datos: KPIMensual[], año: number) {
  const headers = ["Mes", "HC (kWh)", "HP (kWh)", "Total (kWh)", "Coste HC (€)", "Coste HP (€)", "Coste Total (€)", "% HC", "% HP"];
  const rows = datos.map(d => [
    MESES[d.mes - 1],
    d.hc.toFixed(3),
    d.hp.toFixed(3),
    d.total.toFixed(3),
    d.costoHC.toFixed(3),
    d.costoHP.toFixed(3),
    d.costoTotal.toFixed(3),
    d.pctHC.toFixed(1),
    d.pctHP.toFixed(1),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `consumo-energia-${año}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistorialPage() {
  const { getByYear, getTarifa } = useEnergy();
  const [año, setAño] = useState(new Date().getFullYear());

  const datos        = getByYear(año);
  const datosPrev    = getByYear(año - 1);
  const tarifa       = getTarifa(año, 1);
  const { totalKwh, totalCosto, totalHC, totalHP, ventajaMeses } = calcularTotales(datos);
  const hpMeses      = datos.length - ventajaMeses;

  // Best / worst month
  const mejorMes = datos.length > 0 ? datos.reduce((b, d) => d.costoTotal < b.costoTotal ? d : b) : null;
  const peorMes  = datos.length > 0 ? datos.reduce((b, d) => d.costoTotal > b.costoTotal ? d : b) : null;

  // HP dominance alert
  const hpDominaCount = datos.filter(d => !d.ventajaHC).length;
  const showHPAlert = datos.length > 0 && hpDominaCount > datos.length / 2;

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap animate-slide-up" style={{ animationDelay: "0ms" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
              {datos.length} mes{datos.length !== 1 ? "es" : ""}
            </span>
            {ventajaMeses > 0 && (
              <span className="badge badge-hc">{ventajaMeses}m HC</span>
            )}
            {hpMeses > 0 && (
              <span className="badge badge-hp">{hpMeses}m HP</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Historial de consumo</h1>
          {datos.length > 0 ? (
            <p className="text-slate-500 text-sm mt-1">
              {año} · {totalKwh.toFixed(3)} kWh consumidos · {totalCosto.toFixed(3)} € facturado
            </p>
          ) : (
            <p className="text-slate-500 text-sm mt-1">{año} — sin registros disponibles</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {datos.length > 0 && (
            <button
              onClick={() => exportCSV(datos, año)}
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          )}
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Año:</span>
          {ANOS_DISPONIBLES.map(y => (
            <button
              key={y}
              onClick={() => setAño(y)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                año === y
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tariff info strip ── */}
      <div className="flex flex-wrap gap-4 p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100/40 shadow-card hover:shadow-card-md transition-shadow duration-300 items-center animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="text-xs text-slate-500 font-medium">Tarifas {año}:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-hc-500" />
          <span className="text-xs font-semibold text-hc-700 font-mono">HC {tarifa.hc.toFixed(3)} €/kWh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-hp-500" />
          <span className="text-xs font-semibold text-hp-700 font-mono">HP {tarifa.hp.toFixed(3)} €/kWh</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-xs text-slate-500 font-mono">
          Ratio HP/HC: {tarifa.hc > 0 ? (tarifa.hp / tarifa.hc).toFixed(3) : "—"}×
        </span>
        {datos.length > 0 && (
          <>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs text-slate-500 font-mono">
              HC total: <span className="font-semibold text-hc-700">{totalHC.toFixed(3)} kWh</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              HP total: <span className="font-semibold text-hp-700">{totalHP.toFixed(3)} kWh</span>
            </span>
          </>
        )}
      </div>

      {/* ── HP dominance alert ── */}
      {showHPAlert && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 animate-slide-up" style={{ animationDelay: "60ms" }}>
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Predomina tarifa HP — {hpDominaCount} de {datos.length} meses
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Estás consumiendo más en horas punta (tarifa más cara). Considera desplazar cargas al horario HC para reducir costes. Usa el <a href="/calculadora" className="font-bold underline">Simulador</a> para estimar el ahorro.
            </p>
          </div>
        </div>
      )}

      {/* ── Best / worst month cards ── */}
      {datos.length > 1 && mejorMes && peorMes && (
        <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "75ms" }}>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Mejor mes</p>
            <p className="text-lg font-bold text-emerald-600 tabular-nums">{MESES[mejorMes.mes - 1]}</p>
            <p className="text-sm font-semibold text-slate-700 tabular-nums mt-0.5">{mejorMes.costoTotal.toFixed(2)} €</p>
            <p className="text-xs text-slate-400 mt-1">{mejorMes.total.toFixed(1)} kWh</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Peor mes</p>
            <p className="text-lg font-bold text-hp-600 tabular-nums">{MESES[peorMes.mes - 1]}</p>
            <p className="text-sm font-semibold text-slate-700 tabular-nums mt-0.5">{peorMes.costoTotal.toFixed(2)} €</p>
            <p className="text-xs text-slate-400 mt-1">{peorMes.total.toFixed(1)} kWh</p>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {datos.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100/40 shadow-card hover:shadow-card-md transition-shadow duration-300 p-16 text-center animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FileX className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold text-base">Sin datos para {año}</p>
          <p className="text-slate-500 text-sm mt-1">
            Ve a <a href="/registro" className="text-brand-600 font-semibold hover:underline">Registrar</a> para añadir consumo.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Suspense fallback={<ChartSkeleton />}>
              <ConsumoHCHPChart data={datos} title={`Consumo HC/HP — ${año}`} prevData={datosPrev} prevYear={año - 1} />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <CostoEvolucionChart data={datos} title={`Evolución de costes — ${año} (€)`} prevData={datosPrev} prevYear={año - 1} />
            </Suspense>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <HeatmapCosto />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Suspense fallback={<ChartSkeleton />}>
              <EficienciaHCChart data={datos} prevData={datosPrev} year={año} />
            </Suspense>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "250ms" }}>
            <Suspense fallback={<TableSkeleton rows={5} />}>
              <TablaConsumo data={datos} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
