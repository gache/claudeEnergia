"use client";

import dynamic from "next/dynamic";
import { useState, Suspense } from "react";
import { History, FileX } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { ANOS_DISPONIBLES, calcularTotales } from "@/lib/data";
import ChartSkeleton from "@/components/ChartSkeleton";
import TableSkeleton from "@/components/TableSkeleton";

const TablaConsumo = dynamic(() => import("@/components/TablaConsumo"), { ssr: false });
const ConsumoHCHPChart = dynamic(() => import("@/components/ConsumoHCHPChart"), { ssr: false, loading: () => <ChartSkeleton /> });
const CostoEvolucionChart = dynamic(() => import("@/components/CostoEvolucionChart"), { ssr: false, loading: () => <ChartSkeleton /> });

export default function HistorialPage() {
  const { getByYear, getTarifa } = useEnergy();
  const [año, setAño] = useState(2026);

  const datos        = getByYear(año);
  const tarifa       = getTarifa(año, 1);
  const { totalKwh, totalCosto, totalHC, totalHP, ventajaMeses } = calcularTotales(datos);
  const hpMeses      = datos.length - ventajaMeses;

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
            <p className="text-slate-400 text-sm mt-1">{año} — sin registros disponibles</p>
          )}
        </div>

        {/* Year selector */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Año:</span>
          {ANOS_DISPONIBLES.map(y => (
            <button
              key={y}
              onClick={() => setAño(y)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
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
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-card items-center animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="text-xs text-slate-400 font-medium">Tarifas {año}:</span>
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
        <span className="text-xs text-slate-400 font-mono">
          Ratio HP/HC: {(tarifa.hp / tarifa.hc).toFixed(3)}×
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

      {/* ── Content ── */}
      {datos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-16 text-center animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FileX className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold text-base">Sin datos para {año}</p>
          <p className="text-slate-400 text-sm mt-1">
            Ve a <a href="/registro" className="text-brand-600 font-semibold hover:underline">Registrar</a> para añadir consumo.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Suspense fallback={<ChartSkeleton />}>
              <ConsumoHCHPChart data={datos} title={`Consumo HC/HP — ${año}`} />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <CostoEvolucionChart data={datos} title={`Evolución de costes — ${año} (€)`} />
            </Suspense>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <Suspense fallback={<TableSkeleton rows={5} />}>
              <TablaConsumo data={datos} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
