"use client";

import { useState, useEffect } from "react";
import { Calculator, ArrowRight, Zap, TrendingDown, ChevronDown, RefreshCw } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { MESES, ANOS_DISPONIBLES, TARIFA_HC, TARIFA_HP } from "@/lib/data";

function ResultRow({ label, value, unit, highlight }: { label: string; value: string; unit: string; highlight?: "green" | "red" | "blue" }) {
  const colorMap = {
    green: "text-savings-700",
    red:   "text-hp-700",
    blue:  "text-brand-700",
  };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-bold tabular-nums font-mono ${highlight ? colorMap[highlight] : "text-slate-700"}`}>
        {value} <span className="text-xs font-normal opacity-60">{unit}</span>
      </span>
    </div>
  );
}

export default function CalculadoraPage() {
  const { kpiFor, getTarifa } = useEnergy();

  const currentMonth = new Date().getMonth() + 1;
  const [año, setAño]   = useState(new Date().getFullYear());
  const [mes, setMes]   = useState(currentMonth);
  const [hcStr, setHcStr] = useState("");
  const [hpStr, setHpStr] = useState("");

  // Load existing data when month/year changes
  const existing = kpiFor(mes, año);
  function loadExisting() {
    if (!existing) return;
    setHcStr(String(existing.hc));
    setHpStr(String(existing.hp));
  }

  // Tariff simulator
  const currentTarifa = getTarifa(año, mes);
  const [simHCRate, setSimHCRate] = useState(TARIFA_HC.toFixed(5));
  const [simHPRate, setSimHPRate] = useState(TARIFA_HP.toFixed(5));

  // Load shifting
  const [shift, setShift] = useState(0);

  const hc = Math.max(0, parseFloat(hcStr) || 0);
  const hp = Math.max(0, parseFloat(hpStr) || 0);
  const total = hc + hp;

  const simHC = Math.max(0, parseFloat(simHCRate) || currentTarifa.hc);
  const simHP = Math.max(0, parseFloat(simHPRate) || currentTarifa.hp);

  // Reset shift when hp changes
  useEffect(() => { setShift(0); }, [hpStr]);

  const hasValues = hc > 0 || hp > 0;

  // Current cost
  const costoActual = hc * currentTarifa.hc + hp * currentTarifa.hp;

  // Tariff simulation
  const costoSimTarifa   = hc * simHC + hp * simHP;
  const difTarifa        = costoSimTarifa - costoActual;

  // Load shifting
  const hcShifted   = hc + shift;
  const hpShifted   = Math.max(0, hp - shift);
  const costoShifted = hcShifted * currentTarifa.hc + hpShifted * currentTarifa.hp;
  const ahorro       = costoActual - costoShifted;

  return (
    <div className="space-y-7 max-w-3xl mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="animate-slide-up text-center" style={{ animationDelay: "0ms" }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="badge bg-brand-50 text-brand-700 border border-brand-100">Simulador</span>
          <span className="badge bg-slate-100 text-slate-600 border border-slate-200">Análisis what-if</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Calculadora de consumo</h1>
        <p className="text-slate-500 text-sm mt-1">
          Simula tarifas alternativas y descubre el ahorro al desplazar carga HP → HC
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-card-md border border-slate-100/40 overflow-hidden animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="h-1 bg-gradient-to-r from-hc-500 via-brand-500 to-hp-500 opacity-80" />
        <div className="p-6 space-y-5">

          {/* Year / Month */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Año</label>
              <div className="relative">
                <select value={año} onChange={e => setAño(+e.target.value)} className="input-base appearance-none pr-9">
                  {ANOS_DISPONIBLES.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mes</label>
              <div className="relative">
                <select value={mes} onChange={e => setMes(+e.target.value)} className="input-base appearance-none pr-9">
                  {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Load existing button */}
          {existing && (
            <button onClick={loadExisting} className="btn-secondary w-full gap-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Cargar datos de {MESES[mes - 1]} {año} ({existing.hc} HC · {existing.hp} HP kWh)
            </button>
          )}

          {/* HC / HP inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-hc-600 mb-2">HC — kWh</label>
              <input
                type="number" min="0" step="0.1" placeholder="Ej. 120"
                value={hcStr}
                onChange={e => setHcStr(e.target.value)}
                className="input-hc font-mono text-base"
              />
              <p className="text-xs text-hc-400 mt-1.5 font-mono">
                {currentTarifa.hc.toFixed(5)} €/kWh
                {hc > 0 && <span className="ml-2 text-hc-600 font-semibold">→ {(hc * currentTarifa.hc).toFixed(3)} €</span>}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-hp-600 mb-2">HP — kWh</label>
              <input
                type="number" min="0" step="0.1" placeholder="Ej. 133"
                value={hpStr}
                onChange={e => setHpStr(e.target.value)}
                className="input-hp font-mono text-base"
              />
              <p className="text-xs text-hp-400 mt-1.5 font-mono">
                {currentTarifa.hp.toFixed(5)} €/kWh
                {hp > 0 && <span className="ml-2 text-hp-600 font-semibold">→ {(hp * currentTarifa.hp).toFixed(3)} €</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {hasValues && (
        <>
          {/* ── Coste actual ── */}
          <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: "80ms" }}>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-500" />
              <h2 className="section-title text-base">Coste actual</h2>
              <span className="ml-auto text-xs text-slate-400 font-mono">
                Tarifas {MESES[mes - 1]} {año}
              </span>
            </div>
            <div className="px-5 py-1">
              <ResultRow label="Consumo HC" value={hc.toFixed(3)} unit="kWh" />
              <ResultRow label="Consumo HP" value={hp.toFixed(3)} unit="kWh" />
              <ResultRow label="Total" value={total.toFixed(3)} unit="kWh" highlight="blue" />
              <ResultRow label="Coste HC" value={(hc * currentTarifa.hc).toFixed(3)} unit="€" />
              <ResultRow label="Coste HP" value={(hp * currentTarifa.hp).toFixed(3)} unit="€" highlight="red" />
              <ResultRow label="Coste total" value={costoActual.toFixed(3)} unit="€" highlight="blue" />
            </div>
          </div>

          {/* ── Simulador de desplazamiento de carga ── */}
          {hp > 0 && (
            <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-savings-600" />
                <h2 className="section-title text-base">Desplazamiento de carga HP → HC</h2>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Desplazar de HP a HC
                    </label>
                    <span className="text-sm font-bold text-slate-700 tabular-nums font-mono">{shift.toFixed(1)} kWh</span>
                  </div>
                  <input
                    type="range" min={0} max={hp} step={0.5}
                    value={shift}
                    onChange={e => setShift(parseFloat(e.target.value))}
                    className="w-full accent-savings-600 cursor-pointer"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">0 kWh</span>
                    <span className="text-[10px] text-slate-400">{hp.toFixed(1)} kWh (todo HP)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-hc-50 border border-hc-100 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-hc-400 mb-1.5">HC resultante</p>
                    <p className="text-xl font-bold text-hc-700 tabular-nums">
                      {hcShifted.toFixed(3)} <span className="text-xs font-normal text-hc-400">kWh</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-hp-50 border border-hp-100 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-hp-400 mb-1.5">HP resultante</p>
                    <p className="text-xl font-bold text-hp-700 tabular-nums">
                      {hpShifted.toFixed(3)} <span className="text-xs font-normal text-hp-400">kWh</span>
                    </p>
                  </div>
                </div>

                <div className={`rounded-xl p-4 border flex items-center justify-between ${
                  ahorro > 0 ? "bg-savings-50 border-savings-200" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${ahorro > 0 ? "text-savings-500" : "text-slate-400"}`}>
                      {ahorro > 0 ? "Ahorro estimado" : "Sin ahorro"}
                    </p>
                    <p className={`text-2xl font-bold tabular-nums ${ahorro > 0 ? "text-savings-700" : "text-slate-400"}`}>
                      {ahorro > 0 ? "-" : ""}{Math.abs(ahorro).toFixed(3)} €
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coste con desplazamiento: {costoShifted.toFixed(3)} € vs {costoActual.toFixed(3)} € actual
                    </p>
                  </div>
                  {ahorro > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-savings-600 font-semibold">Anual estimado</p>
                      <p className="text-lg font-bold text-savings-700">{(ahorro * 12).toFixed(2)} €</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Simulador de tarifas alternativas ── */}
          <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden animate-slide-up" style={{ animationDelay: "120ms" }}>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-violet-500" />
              <h2 className="section-title text-base">Simulador de tarifas alternativas</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-400">
                Modifica las tarifas para comparar lo que pagarías con otra comercializadora o contrato.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-hc-600 mb-2">
                    Tarifa HC simulada (€/kWh)
                  </label>
                  <input
                    type="number" min="0" step="0.00001" placeholder={currentTarifa.hc.toFixed(5)}
                    value={simHCRate}
                    onChange={e => setSimHCRate(e.target.value)}
                    className="input-hc font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Actual: {currentTarifa.hc.toFixed(5)} €/kWh</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-hp-600 mb-2">
                    Tarifa HP simulada (€/kWh)
                  </label>
                  <input
                    type="number" min="0" step="0.00001" placeholder={currentTarifa.hp.toFixed(5)}
                    value={simHPRate}
                    onChange={e => setSimHPRate(e.target.value)}
                    className="input-hp font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Actual: {currentTarifa.hp.toFixed(5)} €/kWh</p>
                </div>
              </div>

              <div className={`rounded-xl p-4 border flex items-center justify-between ${
                difTarifa < 0 ? "bg-savings-50 border-savings-200" : difTarifa > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
              }`}>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                    difTarifa < 0 ? "text-savings-500" : difTarifa > 0 ? "text-red-500" : "text-slate-400"
                  }`}>
                    {difTarifa < 0 ? "Ahorro con tarifa simulada" : difTarifa > 0 ? "Coste adicional" : "Sin diferencia"}
                  </p>
                  <p className={`text-2xl font-bold tabular-nums ${
                    difTarifa < 0 ? "text-savings-700" : difTarifa > 0 ? "text-red-600" : "text-slate-400"
                  }`}>
                    {difTarifa > 0 ? "+" : ""}{difTarifa.toFixed(3)} €
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coste simulado: {costoSimTarifa.toFixed(3)} € vs {costoActual.toFixed(3)} € actual
                  </p>
                </div>
                {difTarifa !== 0 && (
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${difTarifa < 0 ? "text-savings-600" : "text-red-500"}`}>Anual estimado</p>
                    <p className={`text-lg font-bold ${difTarifa < 0 ? "text-savings-700" : "text-red-600"}`}>
                      {difTarifa > 0 ? "+" : ""}{(difTarifa * 12).toFixed(2)} €
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!hasValues && (
        <div className="bg-white/70 rounded-2xl border border-slate-100/40 shadow-card p-12 text-center animate-slide-up" style={{ animationDelay: "80ms" }}>
          <Calculator className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Introduce valores de consumo para ver el análisis</p>
          {existing && (
            <button onClick={loadExisting} className="btn-secondary mt-4 text-xs">
              Cargar {MESES[mes - 1]} {año}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
