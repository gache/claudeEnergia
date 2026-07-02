"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, LayoutDashboard, History, BarChart2, PenLine,
  TrendingUp, Pencil, Check, X, ChevronDown,
} from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";
import { ANOS_DISPONIBLES, MESES } from "@/lib/data";

const nav = [
  { href: "/",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/historial",   label: "Historial",   icon: History },
  { href: "/comparativa", label: "Comparativa", icon: BarChart2 },
  { href: "/registro",    label: "Registrar",   icon: PenLine },
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Tarifas</p>
        </div>
        {!draft && (
          <button
            onClick={() => setDraft({ hc: String(tarifa.hc), hp: String(tarifa.hp) })}
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500"
            title={`Editar tarifa ${MESES[selectedMes - 1]} ${selectedAño}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Year selector */}
      <div className="flex gap-1 flex-wrap mb-2">
        {ANOS_DISPONIBLES.map(año => (
          <button
            key={año}
            onClick={() => { setSelectedAño(año); setDraft(null); }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              selectedAño === año
                ? "bg-blue-700 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
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
            <label className="text-[9px] font-bold uppercase tracking-widest text-cyan-700 block mb-1">HC €/kWh</label>
            <input
              type="number" step="0.00001" min="0" value={draft.hc}
              onChange={e => setDraft(d => d ? { ...d, hc: e.target.value } : d)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-700 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-red-700 block mb-1">HP €/kWh</label>
            <input
              type="number" step="0.00001" min="0" value={draft.hp}
              onChange={e => setDraft(d => d ? { ...d, hp: e.target.value } : d)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono text-red-700 focus:outline-none focus:border-red-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white text-[10px] font-semibold transition-colors min-h-[32px]">
              <Check className="w-3 h-3" /> Guardar
            </button>
            <button onClick={() => setDraft(null)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition-colors min-h-[32px]">
              <X className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[9px] text-slate-500 font-mono">{MESES[selectedMes - 1]} {selectedAño}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
              <span className="text-xs text-slate-500 font-medium">HC</span>
            </div>
            <span className="text-xs font-semibold text-cyan-700 font-mono">{tarifa.hc.toFixed(5)} €/kWh</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-xs text-slate-500 font-medium">HP</span>
            </div>
            <span className="text-xs font-semibold text-red-700 font-mono">{tarifa.hp.toFixed(5)} €/kWh</span>
          </div>
          <div className="pt-2 mt-1 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Ratio HP/HC</span>
            <span className="text-[10px] font-semibold text-slate-600 font-mono">{(tarifa.hp / tarifa.hc).toFixed(3)}×</span>
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
    <>
    {/* Skip to main content — visible on keyboard focus */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold focus:shadow-sm"
    >
      Saltar al contenido principal
    </a>
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-700">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 leading-none tracking-tight hidden sm:inline">
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
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[36px] ${
                tarifasOpen
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Tarifas</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${tarifasOpen ? "rotate-180" : ""}`} />
            </button>

            {tarifasOpen && (
              <div className="absolute right-0 top-full mt-2 rounded-xl shadow-sm border border-slate-200 overflow-hidden z-50 bg-white">
                <TarifasPanel />
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
    </>
  );
}
