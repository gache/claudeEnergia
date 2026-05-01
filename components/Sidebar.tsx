"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, History, BarChart2, PenLine, TrendingUp, Pencil, Check, X } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { ANOS_DISPONIBLES, MESES } from "@/lib/data";

const nav = [
  { href: "/",            label: "Dashboard",         icon: LayoutDashboard, desc: "Vista principal" },
  { href: "/historial",   label: "Historial",          icon: History,          desc: "Datos por año" },
  { href: "/comparativa", label: "Comparativa 25/26",  icon: BarChart2,        desc: "Análisis interanual" },
  { href: "/registro",    label: "Registrar",           icon: PenLine,          desc: "Nuevo consumo" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { getTarifa, setTarifa } = useEnergy();

  const lastAño = ANOS_DISPONIBLES[ANOS_DISPONIBLES.length - 1];
  const currentMonth = new Date().getMonth() + 1;
  const [selectedAño, setSelectedAño] = useState<number>(lastAño);
  const [selectedMes, setSelectedMes] = useState<number>(currentMonth);
  const [draft, setDraft]             = useState<{ hc: string; hp: string } | null>(null);

  const tarifa = getTarifa(selectedAño, selectedMes);

  function openEdit() {
    setDraft({ hc: String(tarifa.hc), hp: String(tarifa.hp) });
  }

  function saveEdit() {
    if (!draft) return;
    const hc = parseFloat(draft.hc);
    const hp = parseFloat(draft.hp);
    if (!isNaN(hc) && !isNaN(hp) && hc > 0 && hp > 0) {
      setTarifa(selectedAño, selectedMes, hc, hp);
    }
    setDraft(null);
  }

  function handleYearSelect(año: number) {
    setSelectedAño(año);
    setDraft(null);
  }

  function handleMesSelect(mes: number) {
    setSelectedMes(mes);
    setDraft(null);
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col shrink-0 hidden md:flex" style={{ background: "linear-gradient(180deg, #0f1f45 0%, #0a1628 60%, #080f2a 100%)" }}>

      {/* ── Brand header ── */}
      <div className="px-5 py-6 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/40 flex-shrink-0 hover:scale-110 transition-transform duration-300">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-white leading-none block" style={{ fontFamily: "var(--font-sora, Sora), sans-serif" }}>
              claudeEnergía
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Análisis HC / HP</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Navegación
        </p>
        {nav.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] ${
                active
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-white/10 hover:text-slate-100"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                active
                  ? "bg-white/30 shadow-lg shadow-brand-500/30"
                  : "bg-white/5 group-hover:bg-white/15 group-hover:shadow-md"
              }`}>
                <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
              </div>
              <div className="min-w-0">
                <p className="leading-none">{label}</p>
                <p className={`text-[10px] mt-0.5 font-normal leading-none ${
                  active ? "text-blue-200" : "text-slate-600 group-hover:text-slate-400"
                }`}>
                  {desc}
                </p>
              </div>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Tariff widget ── */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-white/8 to-white/3 border border-white/15 backdrop-blur-sm shadow-lg shadow-black/20 hover:border-white/25 transition-all duration-300">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Tarifas
            </p>
          </div>
          {!draft && (
            <button
              onClick={openEdit}
              className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title={`Editar tarifa ${MESES[selectedMes - 1]} ${selectedAño}`}
            >
              <Pencil className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        {/* Year selector */}
        <div className="flex gap-1 flex-wrap mb-2">
          {ANOS_DISPONIBLES.map(año => (
            <button
              key={año}
              onClick={() => handleYearSelect(año)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                selectedAño === año
                  ? "bg-brand-600 text-white"
                  : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-slate-200"
              }`}
            >
              {año}
            </button>
          ))}
        </div>

        {/* Month selector — 4-column grid */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {MESES.map((m, i) => {
            const mes = i + 1;
            return (
              <button
                key={mes}
                onClick={() => handleMesSelect(mes)}
                className={`py-0.5 rounded text-[9px] font-semibold transition-colors ${
                  selectedMes === mes
                    ? "bg-brand-500 text-white"
                    : "bg-white/10 text-slate-500 hover:bg-white/20 hover:text-slate-300"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Tariff values or edit form */}
        {draft ? (
          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 font-mono mb-1">
              {MESES[selectedMes - 1]} {selectedAño}
            </p>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 block mb-1">HC €/kWh</label>
              <input
                type="number"
                step="0.00001"
                min="0"
                value={draft.hc}
                onChange={e => setDraft(d => d ? { ...d, hc: e.target.value } : d)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400/50 focus:bg-white/20"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-amber-400 block mb-1">HP €/kWh</label>
              <input
                type="number"
                step="0.00001"
                min="0"
                value={draft.hp}
                onChange={e => setDraft(d => d ? { ...d, hp: e.target.value } : d)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400/50 focus:bg-white/20"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={saveEdit}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-semibold transition-colors min-h-[32px]"
              >
                <Check className="w-3 h-3" />
                Guardar
              </button>
              <button
                onClick={() => setDraft(null)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-semibold transition-colors min-h-[32px]"
              >
                <X className="w-3 h-3" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 font-mono">
              {MESES[selectedMes - 1]} {selectedAño}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 font-medium">HC</span>
              </div>
              <span className="text-xs font-semibold text-cyan-300 font-mono">{tarifa.hc.toFixed(5)} €/kWh</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 font-medium">HP</span>
              </div>
              <span className="text-xs font-semibold text-amber-300 font-mono">{tarifa.hp.toFixed(5)} €/kWh</span>
            </div>
            <div className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Ratio HP/HC</span>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">{(tarifa.hp / tarifa.hc).toFixed(3)}×</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[10px] text-slate-600 text-center">claudeEnergía v2.0</p>
      </div>
    </aside>
  );
}
