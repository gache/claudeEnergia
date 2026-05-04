"use client";

import { useState, Suspense } from "react";
import { Save, Calculator, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES, calcularKPI, ANOS_DISPONIBLES } from "@/lib/data";
import KPISkeleton from "@/components/KPISkeleton";

export default function RegistroPage() {
  const { addOrUpdate, kpiFor, getTarifa } = useEnergy();

  const currentMonth = new Date().getMonth() + 1;
  const [año, setAño]     = useState(2026);
  const [mes, setMes]     = useState(currentMonth);
  const [hcStr, setHcStr] = useState("");
  const [hpStr, setHpStr] = useState("");
  const [saved, setSaved] = useState(false);

  const hc = parseFloat(hcStr) || 0;
  const hp = parseFloat(hpStr) || 0;

  const tarifaMes    = getTarifa(año, mes);
  const preview      = hc > 0 || hp > 0 ? calcularKPI({ mes, año, hc, hp }, tarifaMes) : null;
  const existing     = kpiFor(mes, año);
  const hasValues    = hc > 0 || hp > 0;

  const hcError = hcStr && (hc < 0 || !Number.isFinite(hc));
  const hpError = hpStr && (hp < 0 || !Number.isFinite(hp));
  const hasErrors = hcError || hpError;

  const saveBtnClass = saved
    ? "bg-savings-600 text-white shadow-sm"
    : hasErrors
      ? "bg-red-100 text-red-500 cursor-not-allowed"
      : hasValues
        ? "bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md"
        : "bg-slate-100 text-slate-400 cursor-not-allowed";

  function handleSave() {
    if (!hasValues || hasErrors) return;
    addOrUpdate({ mes, año, hc, hp });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleLoad() {
    if (!existing) return;
    setHcStr(String(existing.hc));
    setHpStr(String(existing.hp));
  }

  function handleYearMesChange(newAño: number, newMes: number) {
    setAño(newAño);
    setMes(newMes);
    setHcStr("");
    setHpStr("");
    setSaved(false);
  }

  return (
    <div className="space-y-7 max-w-2xl animate-fade-in">

      {/* ── Header ── */}
      <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge bg-brand-50 text-brand-700 border border-brand-100">
            {MESES[mes - 1]} {año}
          </span>
          {existing && (
            <span className="badge bg-red-50 text-red-700 border border-red-200">
              Registro existente
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Registrar consumo</h1>
        <p className="text-slate-500 text-sm mt-1">
          Introduce el consumo mensual separado por tarifa HC y HP
        </p>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-card-md border border-slate-100/40 overflow-hidden animate-slide-up hover:shadow-card-lg transition-shadow duration-300" style={{ animationDelay: "50ms" }}>

        {/* Form top accent */}
        <div className="h-1 bg-gradient-to-r from-hc-500 via-brand-500 to-hp-500 opacity-80" />

        <div className="p-6 space-y-5">
          {/* Year / Month selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Año</label>
              <div className="relative">
                <select
                  value={año}
                  onChange={e => handleYearMesChange(+e.target.value, mes)}
                  className="input-base appearance-none pr-9"
                >
                  {ANOS_DISPONIBLES.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mes</label>
              <div className="relative">
                <select
                  value={mes}
                  onChange={e => handleYearMesChange(año, +e.target.value)}
                  className="input-base appearance-none pr-9"
                >
                  {MESES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Existing entry notice */}
          {existing && (
            <div className="flex items-start justify-between bg-red-50/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-red-200/60 gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Registro existente</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {MESES[mes - 1]} {año}: HC = <strong>{existing.hc}</strong> kWh · HP = <strong>{existing.hp}</strong> kWh
                  </p>
                </div>
              </div>
              <button
                onClick={handleLoad}
                className="text-xs font-semibold text-red-700 hover:text-red-900 border border-red-300 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap min-h-[32px]"
              >
                Cargar valores
              </button>
            </div>
          )}

          {/* HC / HP inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-hc-600 mb-2">
                HC — Heures Creuses
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej. 120"
                value={hcStr}
                onChange={e => { setHcStr(e.target.value); setSaved(false); }}
                className={`input-hc font-mono text-base ${hcError ? "border-red-500 bg-red-50" : ""}`}
              />
              {hcError && (
                <p className="text-xs text-red-600 mt-1.5 font-semibold">
                  ⚠ Debe ser un número válido y no negativo
                </p>
              )}
              {!hcError && (
                <p className="text-xs text-hc-400 mt-1.5 font-mono">
                  Tarifa: {tarifaMes.hc.toFixed(5)} €/kWh
                  {hc > 0 && (
                    <span className="ml-2 text-hc-600 font-semibold">
                      → {(hc * tarifaMes.hc).toFixed(3)} €
                    </span>
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-hp-600 mb-2">
                HP — Heures Pleines
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej. 133"
                value={hpStr}
                onChange={e => { setHpStr(e.target.value); setSaved(false); }}
                className={`input-hp font-mono text-base ${hpError ? "border-red-500 bg-red-50" : ""}`}
              />
              {hpError && (
                <p className="text-xs text-red-600 mt-1.5 font-semibold">
                  ⚠ Debe ser un número válido y no negativo
                </p>
              )}
              {!hpError && (
                <p className="text-xs text-hp-400 mt-1.5 font-mono">
                  Tarifa: {tarifaMes.hp.toFixed(5)} €/kWh
                  {hp > 0 && (
                    <span className="ml-2 text-hp-600 font-semibold">
                      → {(hp * tarifaMes.hp).toFixed(3)} €
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Save button */}
          <div>
            <button
              onClick={handleSave}
              disabled={Boolean(!hasValues || hasErrors)}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[48px] ${saveBtnClass}`}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  ¡Guardado correctamente!
                </>
              ) : hasErrors ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Corrige los errores antes de guardar
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {existing ? "Actualizar registro" : "Guardar registro"}
                </>
              )}
            </button>
            {hasErrors && (
              <p className="text-xs text-red-600 mt-2 text-center font-semibold">
                Los valores deben ser números no negativos válidos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Live KPI preview ── */}
      <Suspense fallback={<KPISkeleton count={9} />}>
        {preview && (
          <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Vista previa — {MESES[mes - 1]} {año}
            </span>
            <span className="ml-auto badge bg-slate-50 text-slate-500 border border-slate-200">
              Cálculo en tiempo real
            </span>
          </div>

          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-hc-50 rounded-xl p-4 border border-hc-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-hc-400 mb-1.5">Consumo HC</p>
              <p className="text-xl font-bold text-hc-700 tabular-nums">
                {preview.hc.toFixed(3)}
                <span className="text-xs font-normal ml-1 text-hc-400">kWh</span>
              </p>
            </div>

            <div className="bg-hp-50 rounded-xl p-4 border border-hp-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-hp-400 mb-1.5">Consumo HP</p>
              <p className="text-xl font-bold text-hp-700 tabular-nums">
                {preview.hp.toFixed(3)}
                <span className="text-xs font-normal ml-1 text-hp-400">kWh</span>
              </p>
            </div>

            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-1.5">Consumo total</p>
              <p className="text-xl font-bold text-brand-700 tabular-nums">
                {preview.total.toFixed(3)}
                <span className="text-xs font-normal ml-1 text-brand-400">kWh</span>
              </p>
            </div>

            <div className="bg-hc-50 rounded-xl p-4 border border-hc-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-hc-400 mb-1.5">Coste HC</p>
              <p className="text-xl font-bold text-hc-700 tabular-nums">
                {preview.costoHC.toFixed(3)}
                <span className="text-xs font-normal ml-1 text-hc-400">€</span>
              </p>
            </div>

            <div className="bg-hp-50 rounded-xl p-4 border border-hp-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-hp-400 mb-1.5">Coste HP</p>
              <p className="text-xl font-bold text-hp-700 tabular-nums">
                {preview.costoHP.toFixed(3)}
                <span className="text-xs font-normal ml-1 text-hp-400">€</span>
              </p>
            </div>

            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1.5">Coste total</p>
              <p className="text-xl font-bold text-violet-700 tabular-nums">
                {preview.costoTotal.toFixed(3)}
                <span className="text-xs font-normal ml-1 text-violet-400">€</span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">% HC / % HP</p>
              <p className="text-xl font-bold tabular-nums">
                <span className="text-hc-600">{preview.pctHC.toFixed(1)}%</span>
                <span className="text-slate-300 mx-1">/</span>
                <span className="text-hp-600">{preview.pctHP.toFixed(1)}%</span>
              </p>
            </div>

            <div className={`rounded-xl p-4 border ${
              preview.difHCHP > 0
                ? "bg-red-50 border-red-100"
                : "bg-hc-50 border-hc-100"
            }`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                preview.difHCHP > 0 ? "text-red-400" : "text-hc-400"
              }`}>
                Dif. HP − HC
              </p>
              <p className={`text-xl font-bold tabular-nums ${
                preview.difHCHP > 0 ? "text-red-600" : "text-hc-700"
              }`}>
                {Math.abs(preview.difHCHP).toFixed(3)}
                <span className="text-xs font-normal ml-1 opacity-60">kWh</span>
              </p>
            </div>
          </div>

          {/* HC/HP split bar */}
          <div className="px-5 pb-5">
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 gap-0.5">
              <div
                className="bg-hc-500 rounded-l-full transition-all duration-500"
                style={{ width: `${preview.pctHC}%` }}
              />
              <div
                className="bg-hp-500 rounded-r-full transition-all duration-500"
                style={{ width: `${preview.pctHP}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-hc-600 font-semibold">HC {preview.pctHC.toFixed(1)}%</span>
              <span className="text-xs text-hp-600 font-semibold">HP {preview.pctHP.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        )}
      </Suspense>
    </div>
  );
}
