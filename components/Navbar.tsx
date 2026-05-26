"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, LayoutDashboard, History, BarChart2, PenLine, Calculator,
  TrendingUp, Pencil, Check, X, ChevronDown,
} from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { ANOS_DISPONIBLES, MESES } from "@/lib/data";

const nav = [
  { href: "/",             label: "Dashboard",   icon: LayoutDashboard },
  { href: "/historial",    label: "Historial",   icon: History },
  { href: "/comparativa",  label: "Comparativa", icon: BarChart2 },
  { href: "/calculadora",  label: "Simulador",   icon: Calculator },
  { href: "/registro",     label: "Registrar",   icon: PenLine },
];

function TarifasPanel() {
  const { getTarifa, setTarifa } = useEnergy();

  const lastAño = ANOS_DISPONIBLES[ANOS_DISPONIBLES.length - 1];
  const currentMonth = new Date().getMonth() + 1;
  const [selectedAño, setSelectedAño] = useState<number>(lastAño);
  const [selectedMes, setSelectedMes] = useState<number>(currentMonth);
  const [draft, setDraft] = useState<{ hc: string; hp: string } | null>(null);

  const tarifa = getTarifa(selectedAño, selectedMes);

  function saveEdit() {
    if (!draft) return;
    const hc = parseFloat(draft.hc);
    const hp = parseFloat(draft.hp);
    if (!isNaN(hc) && !isNaN(hp) && hc > 0 && hp > 0) {
      setTarifa(selectedAño, selectedMes, hc, hp);
    }
    setDraft(null);
  }

  return (
    <div className="p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tarifas</p>
        </div>
        {!draft && (
          <button
            onClick={() => setDraft({ hc: String(tarifa.hc), hp: String(tarifa.hp) })}
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
            onClick={() => { setSelectedAño(año); setDraft(null); }}
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

      {/* Month selector */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {MESES.map((m, i) => {
          const mes = i + 1;
          return (
            <button
              key={mes}
              onClick={() => { setSelectedMes(mes); setDraft(null); }}
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

      {/* Values or edit */}
      {draft ? (
        <div className="space-y-2">
          <p className="text-[9px] text-slate-500 font-mono">{MESES[selectedMes - 1]} {selectedAño}</p>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 block mb-1">HC €/kWh</label>
            <input
              type="number" step="0.00001" min="0" value={draft.hc}
              onChange={e => setDraft(d => d ? { ...d, hc: e.target.value } : d)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-red-400 block mb-1">HP €/kWh</label>
            <input
              type="number" step="0.00001" min="0" value={draft.hp}
              onChange={e => setDraft(d => d ? { ...d, hp: e.target.value } : d)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-red-200 focus:outline-none focus:border-red-400/50"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-semibold transition-colors min-h-[32px]">
              <Check className="w-3 h-3" /> Guardar
            </button>
            <button onClick={() => setDraft(null)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-semibold transition-colors min-h-[32px]">
              <X className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[9px] text-slate-500 font-mono">{MESES[selectedMes - 1]} {selectedAño}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              <span className="text-xs text-slate-400 font-medium">HC</span>
            </div>
            <span className="text-xs font-semibold text-cyan-300 font-mono">{tarifa.hc.toFixed(5)} €/kWh</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-xs text-slate-400 font-medium">HP</span>
            </div>
            <span className="text-xs font-semibold text-red-300 font-mono">{tarifa.hp.toFixed(5)} €/kWh</span>
          </div>
          <div className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Ratio HP/HC</span>
            <span className="text-[10px] font-semibold text-slate-400 font-mono">{(tarifa.hp / tarifa.hc).toFixed(3)}×</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [tarifasOpen, setTarifasOpen] = useState(false);
  const tarifasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tarifasRef.current && !tarifasRef.current.contains(e.target as Node)) {
        setTarifasOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ background: "linear-gradient(180deg, #0f1f45 0%, #0a1628 100%)" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/40">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-white leading-none tracking-tight hidden sm:inline">
              Energía
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[36px] ${
                    active
                      ? "bg-brand-600 text-white shadow-md"
                      : "text-slate-400 hover:bg-white/10 hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Tarifas dropdown */}
          <div className="ml-auto relative" ref={tarifasRef}>
            <button
              onClick={() => setTarifasOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[36px] ${
                tarifasOpen
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:bg-white/10 hover:text-slate-100"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Tarifas</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${tarifasOpen ? "rotate-180" : ""}`} />
            </button>

            {tarifasOpen && (
              <div
                className="absolute right-0 top-full mt-2 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                style={{ background: "linear-gradient(180deg, #0f1f45 0%, #0a1628 100%)" }}
              >
                <TarifasPanel />
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
