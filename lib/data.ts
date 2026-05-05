export const TARIFA_HC = 0.19008; // €/kWh — default 2026
export const TARIFA_HP = 0.27436; // €/kWh — default 2026

export const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
export const ANOS_DISPONIBLES = [2022, 2023, 2024, 2025, 2026] as const;
export type AnoDisponible = (typeof ANOS_DISPONIBLES)[number];

export type TarifaMensual = {
  año: number;
  mes: number;
  hc: number;
  hp: number;
};

export const TARIFAS_INICIALES: TarifaMensual[] = [
  { año: 2022, mes: 1, hc: 0.1441,  hp: 0.2175  },
  { año: 2023, mes: 1, hc: 0.1628,  hp: 0.2381  },
  { año: 2024, mes: 1, hc: 0.1756,  hp: 0.2543  },
  { año: 2025, mes: 1, hc: 0.1854,  hp: 0.2689  },
  { año: 2025, mes: 2, hc: 0.16991, hp: 0.25162 },
  { año: 2025, mes: 3, hc: 0.19008, hp: 0.27436 },
  { año: 2026, mes: 1, hc: 0.19008, hp: 0.27436 },
];

export type RegistroMensual = {
  mes: number;
  año: number;
  hc: number;
  hp: number;
};

export type KPIMensual = RegistroMensual & {
  total: number;
  costoHC: number;
  costoHP: number;
  costoTotal: number;
  pctHC: number;
  pctHP: number;
  difHCHP: number;
  ventajaHC: boolean;
  tarifaHC: number;
  tarifaHP: number;
};

export function calcularKPI(
  r: RegistroMensual,
  tarifa: { hc: number; hp: number } = { hc: TARIFA_HC, hp: TARIFA_HP }
): KPIMensual {
  const total     = r.hc + r.hp;
  const costoHC   = r.hc * tarifa.hc;
  const costoHP   = r.hp * tarifa.hp;
  const costoTotal = costoHC + costoHP;
  const pctHC     = total > 0 ? (r.hc / total) * 100 : 0;
  const pctHP     = total > 0 ? (r.hp / total) * 100 : 0;
  const difHCHP   = r.hp - r.hc;      // positivo = HP domina; negativo = HC domina
  const ventajaHC = r.hc >= r.hp;     // true → HC consume más = tarifa barata domina
  return {
    ...r, total, costoHC, costoHP, costoTotal, pctHC, pctHP, difHCHP, ventajaHC,
    tarifaHC: tarifa.hc, tarifaHP: tarifa.hp,
  };
}

export function fmt(n: number, dec = 3): string {
  return n.toFixed(dec);
}

export function fmtNum(n: number, dec = 3): number {
  return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
}

export function calcularTotales(data: KPIMensual[]) {
  return data.reduce(
    (acc, d) => ({
      totalHC:      acc.totalHC      + d.hc,
      totalHP:      acc.totalHP      + d.hp,
      totalKwh:     acc.totalKwh     + d.total,
      totalCostoHC: acc.totalCostoHC + d.costoHC,
      totalCostoHP: acc.totalCostoHP + d.costoHP,
      totalCosto:   acc.totalCosto   + d.costoTotal,
      sumPctHC:     acc.sumPctHC     + d.pctHC,
      sumPctHP:     acc.sumPctHP     + d.pctHP,
      ventajaMeses: acc.ventajaMeses + (d.ventajaHC ? 1 : 0),
    }),
    { totalHC: 0, totalHP: 0, totalKwh: 0, totalCostoHC: 0, totalCostoHP: 0,
      totalCosto: 0, sumPctHC: 0, sumPctHP: 0, ventajaMeses: 0 }
  );
}

export const datosIniciales: RegistroMensual[] = [];
