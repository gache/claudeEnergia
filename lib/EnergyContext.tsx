"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  RegistroMensual, KPIMensual, TarifaMensual,
  calcularKPI, datosIniciales, TARIFAS_INICIALES, TARIFA_HC, TARIFA_HP,
} from "./data";

const KEY_REGISTROS = "energia-registros-v1";
const KEY_TARIFAS   = "energia-tarifas-v2";

type EnergyContextType = {
  registros: RegistroMensual[];
  tarifas:   TarifaMensual[];
  addOrUpdate: (r: RegistroMensual) => void;
  setTarifa:   (año: number, mes: number, hc: number, hp: number) => void;
  getTarifa:   (año: number, mes: number) => { hc: number; hp: number };
  getByYear:   (año: number) => KPIMensual[];
  kpiFor:      (mes: number, año: number) => KPIMensual | null;
};

const EnergyContext = createContext<EnergyContextType | null>(null);

export function EnergyProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<RegistroMensual[]>(datosIniciales);
  const [tarifas,   setTarifas]   = useState<TarifaMensual[]>(TARIFAS_INICIALES);
  const [hydrated,  setHydrated]  = useState(false);

  useEffect(() => {
    try {
      const storedR = localStorage.getItem(KEY_REGISTROS);
      if (storedR) setRegistros(JSON.parse(storedR));
      const storedT = localStorage.getItem(KEY_TARIFAS);
      if (storedT) setTarifas(JSON.parse(storedT));
    } catch {
      localStorage.removeItem(KEY_REGISTROS);
      localStorage.removeItem(KEY_TARIFAS);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY_REGISTROS, JSON.stringify(registros));
    localStorage.setItem(KEY_TARIFAS, JSON.stringify(tarifas));
  }, [registros, tarifas, hydrated]);

  function addOrUpdate(r: RegistroMensual) {
    setRegistros(prev => {
      const idx = prev.findIndex(x => x.mes === r.mes && x.año === r.año);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = r;
        return next;
      }
      return [...prev, r].sort((a, b) => a.año !== b.año ? a.año - b.año : a.mes - b.mes);
    });
  }

  function setTarifa(año: number, mes: number, hc: number, hp: number) {
    setTarifas(prev => {
      const idx = prev.findIndex(t => t.año === año && t.mes === mes);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { año, mes, hc, hp };
        return next;
      }
      return [...prev, { año, mes, hc, hp }]
        .sort((a, b) => a.año !== b.año ? a.año - b.año : a.mes - b.mes);
    });
  }

  function getTarifa(año: number, mes: number): { hc: number; hp: number } {
    const candidates = tarifas
      .filter(t => t.año < año || (t.año === año && t.mes <= mes))
      .sort((a, b) => a.año !== b.año ? b.año - a.año : b.mes - a.mes);
    if (candidates.length > 0) return { hc: candidates[0].hc, hp: candidates[0].hp };
    return { hc: TARIFA_HC, hp: TARIFA_HP };
  }

  function getByYear(año: number): KPIMensual[] {
    return registros
      .filter(r => r.año === año)
      .sort((a, b) => a.mes - b.mes)
      .map(r => calcularKPI(r, getTarifa(r.año, r.mes)));
  }

  function kpiFor(mes: number, año: number): KPIMensual | null {
    const r = registros.find(x => x.mes === mes && x.año === año);
    if (!r) return null;
    return calcularKPI(r, getTarifa(año, mes));
  }

  return (
    <EnergyContext.Provider value={{ registros, tarifas, addOrUpdate, setTarifa, getTarifa, getByYear, kpiFor }}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) throw new Error("useEnergy must be inside EnergyProvider");
  return ctx;
}
